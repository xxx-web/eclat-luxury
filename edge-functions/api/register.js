/**
 * EdgeOne Edge Function - 用户注册
 * 使用 KV 存储用户数据（密码已哈希）
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    const { email, password, name } = data;

    // 验证必填字段
    if (!email || !password || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: '请填写所有必填字段'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证邮箱格式
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

    // 验证密码强度
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
    if (!env.USERS_KV) {
      return new Response(JSON.stringify({
        success: false,
        message: '服务暂不可用'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingUser = await env.USERS_KV.get(`user:${email}`);
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: '该邮箱已注册'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成用户ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 密码哈希（使用 Web Crypto API）
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 创建用户数据（密码已哈希）
    const userData = {
      id: userId,
      email,
      password: hashedPassword, // ✅ 已哈希存储
      name,
      createdAt: new Date().toISOString(),
      profile: {
        avatar: '',
        phone: '',
        address: ''
      }
    };

    // 存储到 KV
    if (env.USERS_KV) {
      await env.USERS_KV.put(`user:${email}`, JSON.stringify(userData));
      await env.USERS_KV.put(`userId:${userId}`, email);
    }

    // 返回成功响应（不返回密码）
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
      message: '服务器错误，请稍后重试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
