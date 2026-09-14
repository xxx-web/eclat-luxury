import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

/**
 * 鉴权模块（P0-1 之后：走后端 KV 会话，移除 localStorage 明文密码）
 *
 * 流程：
 * - 登录/注册请求发往 /api/login、/api/register（密码在后端用 SHA-256 校验）。
 * - 后端通过 HttpOnly + SameSite=Strict Cookie 维持会话，前端 JS 无法读取 token。
 * - 启动时调用 /api/profile（"我是谁"探针），浏览器自动携带 Cookie 还原会话。
 *
 * 架构说明（为什么是 Context 而不是普通 hook）：
 * 之前 useAuth() 被 8 个组件各自独立调用，每个实例都持有一份独立的 user state，
 * 并各自发起一次 /api/profile 请求，导致：
 *   1) 每次加载产生 N 次重复请求（控制台"请求风暴"）；
 *   2) 状态不同步 —— AuthModal 登录成功后 NavBar 的 user 不会更新。
 * 现在把状态上提到 AuthProvider（全局唯一），所有组件共享同一份会话状态，
 * 全站只发一次 /api/profile 请求。
 */

const API_BASE = '/api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: {
    avatar?: string;
    phone?: string;
    address?: string;
  };
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function request(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时用 Cookie 还原会话（HttpOnly Cookie 由浏览器自动携带），全站仅此一次
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await request('/profile');
        if (res.ok) {
          const data = (await res.json()) as { user?: User | null };
          if (active && data?.user) setUser(data.user);
        }
      } catch {
        // 网络/服务异常时保持未登录，不阻塞页面
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 注意：login 必须先于 register 定义。
  // register 的依赖数组 [login] 会在其初始化时被求值，若 login 声明在后会触发
  // TDZ（Cannot access 'login' before initialization）导致首屏 ErrorBoundary 崩溃。
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email.trim() || !password) {
        return { ok: false, error: '请填写邮箱和密码' };
      }
      try {
        const res = await request('/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        const data = (await res.json()) as { success?: boolean; message?: string; user?: User };
        if (!res.ok || !data?.success) {
          return { ok: false, error: data?.message || '登录失败' };
        }
        if (data?.user) setUser(data.user);
        return { ok: true };
      } catch {
        return { ok: false, error: '网络错误，请稍后重试' };
      }
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (!name.trim() || !email.trim() || !password) {
        return { ok: false, error: '请填写所有字段' };
      }
      if (password.length < 6) {
        return { ok: false, error: '密码至少 6 位' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { ok: false, error: '邮箱格式不正确' };
      }
      try {
        const res = await request('/register', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });
        const data = (await res.json()) as { success?: boolean; message?: string };
        if (!res.ok || !data?.success) {
          return { ok: false, error: data?.message || '注册失败' };
        }
        // 注册成功但后端不下发会话 Cookie，自动登录以建立会话
        return await login(email.trim().toLowerCase(), password);
      } catch {
        return { ok: false, error: '网络错误，请稍后重试' };
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await request('/logout', { method: 'POST' });
    } catch {
      // 即使请求失败也清除本地会话状态
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
