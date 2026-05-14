/**
 * EdgeOne Edge Function - 获取/更新用户资料
 */

// 共享内存存储
if (!globalThis.__ECLAT_MEMORY__) {
  globalThis.__ECLAT_MEMORY__ = {
    users: new Map(),
    sessions: new Map()
  };
}
const mem = globalThis.__ECLAT_MEMORY__;

async function verifySession(request, env) {
  const authHeader = request.headers.get('Authorization');
  let sessionToken = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.substring(7);
  }

  if (!sessionToken) return null;

  let sessionStr = null;
  try {
    if (env && env.SESSIONS_KV) {
      sessionStr = await env.SESSIONS_KV.get(`session:${sessionToken}`);
    }
  } catch (e) {}

  if (!sessionStr) {
    sessionStr = mem.sessions.get(`session:${sessionToken}`);
  }

  if (!sessionStr) return null;
  return JSON.parse(sessionStr);
}

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const session = await verifySession(request, env);
    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        message: '未登录'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'GET') {
      // 获取用户资料
      let userStr = null;
      try {
        if (env && env.USERS_KV) {
          userStr = await env.USERS_KV.get(`user:${session.email}`);
        }
      } catch (e) {}

      if (!userStr) {
        userStr = mem.users.get(`user:${session.email}`);
      }

      if (!userStr) {
        return new Response(JSON.stringify({
          success: false,
          message: '用户不存在'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const userData = JSON.parse(userStr);
      const { password, ...userWithoutPassword } = userData;

      return new Response(JSON.stringify({
        success: true,
        user: userWithoutPassword
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'PUT') {
      // 更新用户资料
      const updateData = await request.json();

      let userStr = null;
      try {
        if (env && env.USERS_KV) {
          userStr = await env.USERS_KV.get(`user:${session.email}`);
        }
      } catch (e) {}

      if (!userStr) {
        userStr = mem.users.get(`user:${session.email}`);
      }

      if (!userStr) {
        return new Response(JSON.stringify({
          success: false,
          message: '用户不存在'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const userData = JSON.parse(userStr);

      if (updateData.name !== undefined) userData.name = updateData.name;
      if (updateData.profile !== undefined) {
        userData.profile = { ...userData.profile, ...updateData.profile };
      }

      const updatedJson = JSON.stringify(userData);

      try {
        if (env && env.USERS_KV) {
          await env.USERS_KV.put(`user:${session.email}`, updatedJson);
        }
      } catch (e) {}

      mem.users.set(`user:${session.email}`, updatedJson);

      const { password, ...userWithoutPassword } = userData;

      return new Response(JSON.stringify({
        success: true,
        message: '更新成功',
        user: userWithoutPassword
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: '不支持的请求方法'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '服务器错误: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
