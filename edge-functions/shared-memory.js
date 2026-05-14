/**
 * 共享内存存储 - 用于 KV 未绑定时的降级方案
 * EdgeOne Pages Edge Functions 之间共享内存数据
 */

// 使用 globalThis 确保在不同模块间共享数据
if (!globalThis.__ECLAT_MEMORY__) {
  globalThis.__ECLAT_MEMORY__ = {
    users: new Map(),
    sessions: new Map()
  };
}

export const memoryStore = globalThis.__ECLAT_MEMORY__;

// 辅助函数
export function getUser(email) {
  return memoryStore.users.get(`user:${email}`) || null;
}

export function setUser(email, data) {
  memoryStore.users.set(`user:${email}`, data);
}

export function getUserById(userId) {
  return memoryStore.users.get(`userId:${userId}`) || null;
}

export function setUserIdMapping(userId, email) {
  memoryStore.users.set(`userId:${userId}`, email);
}

export function getSession(token) {
  return memoryStore.sessions.get(`session:${token}`) || null;
}

export function setSession(token, data) {
  memoryStore.sessions.set(`session:${token}`, data);
}

export function deleteSession(token) {
  memoryStore.sessions.delete(`session:${token}`);
}
