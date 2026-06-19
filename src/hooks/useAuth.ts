import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

const STORAGE_KEY_USERS = 'eclat_users';
const STORAGE_KEY_CURRENT = 'eclat_current_user';

interface StoredUser extends User {
  password: string;
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.email) {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => loadCurrentUser());

  useEffect(() => {
    const handleStorage = () => {
      setUser(loadCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const register = useCallback((name: string, email: string, password: string): { ok: boolean; error?: string } => {
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
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: '该邮箱已注册' };
    }
    const newUser: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: Date.now(),
    };
    users.push(newUser);
    saveUsers(users);

    const publicUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(publicUser));
    } catch {
      // ignore
    }
    setUser(publicUser);
    return { ok: true };
  }, []);

  const login = useCallback((email: string, password: string): { ok: boolean; error?: string } => {
    if (!email.trim() || !password) {
      return { ok: false, error: '请填写邮箱和密码' };
    }
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found) {
      return { ok: false, error: '邮箱或密码错误' };
    }
    const publicUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      createdAt: found.createdAt,
    };
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(publicUser));
    } catch {
      // ignore
    }
    setUser(publicUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return { user, register, login, logout };
}
