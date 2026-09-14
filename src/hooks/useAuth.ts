import { useState, useEffect, useCallback } from 'react';

/**
 * 鉴权 Hook —— 改为走后端 KV 鉴权，移除 localStorage 明文密码（P0-1）。
 *
 * 流程：
 * - 登录/注册请求发往 /api/login、/api/register（密码在后端用 SHA-256 校验）。
 * - 后端通过 HttpOnly + SameSite=Strict Cookie 维持会话，前端 JS 无法读取 token。
 * - 启动时调用 /api/profile，浏览器自动携带 Cookie 还原会话。
 * - 不再在客户端存储任何密码明文。
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

async function request(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时用 Cookie 还原会话（HttpOnly Cookie 由浏览器自动携带）
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await request('/profile');
        if (res.ok) {
          const data = (await res.json()) as { user?: User };
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

  return { user, loading, register, login, logout };
}
