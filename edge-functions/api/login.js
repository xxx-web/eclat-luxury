/**
 * EdgeOne Edge Function - 用户登录
 */

// 共享内存存储
if (!globalThis.__ECLAT_MEMORY__) {
  globalThis.__ECLAT_MEMORY__ = {
    users: new Map(),
    sessions: new Map()
  };
}
const mem = globalThis.__ECLAT_MEMORY__;

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: '只支持 POST 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: '请填写邮箱和密码'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 查找用户
    let userStr = null;
    try {
      if (env && env.USERS_KV) {
        userStr = await env.USERS_KV.get(`user:${email}`);
      }
    } catch (e) {}

    if (!userStr) {
      const memUser = mem.users.get(`user:${email}`);
      if (memUser) userStr = memUser;
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

    // 密码验证
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (userData.password !== hashedPassword) {
      return new Response(JSON.stringify({
        success: false,
        message: '密码错误'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成 token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const sessionData = {
      userId: userData.id,
      email: userData.email,
      createdAt: new Date().toISOString()
    };

    // 保存 session
    try {
      if (env && env.SESSIONS_KV) {
        await env.SESSIONS_KV.put(`session:${sessionToken}`, JSON.stringify(sessionData), { expirationTtl: 604800 });
      }
    } catch (e) {}

    mem.sessions.set(`session:${sessionToken}`, JSON.stringify(sessionData));

    const { password: _, ...userWithoutPassword } = userData;

    return new Response(JSON.stringify({
      success: true,
      message: '登录成功',
      user: userWithoutPassword,
      token: sessionToken
    }), {
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
