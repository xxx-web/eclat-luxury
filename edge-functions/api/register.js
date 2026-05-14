/**
 * EdgeOne Edge Function - 用户注册
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
    const { email, password, name } = data;

    if (!email || !password || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: '请填写所有必填字段'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: '邮箱格式不正确'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        message: '密码长度至少6位'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查用户是否已存在
    let existingUser = null;
    try {
      if (env && env.USERS_KV) {
        existingUser = await env.USERS_KV.get(`user:${email}`);
      }
    } catch (e) {}

    if (!existingUser) {
      const memUser = mem.users.get(`user:${email}`);
      if (memUser) existingUser = memUser;
    }

    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: '该邮箱已注册'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const userData = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString(),
      profile: { avatar: '', phone: '', address: '' }
    };

    const userJson = JSON.stringify(userData);

    // 保存到 KV
    try {
      if (env && env.USERS_KV) {
        await env.USERS_KV.put(`user:${email}`, userJson);
        await env.USERS_KV.put(`userId:${userId}`, email);
      }
    } catch (e) {}

    // 保存到内存
    mem.users.set(`user:${email}`, userJson);
    mem.users.set(`userId:${userId}`, email);

    const { password: _, ...userWithoutPassword } = userData;

    return new Response(JSON.stringify({
      success: true,
      message: '注册成功',
      user: userWithoutPassword
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
