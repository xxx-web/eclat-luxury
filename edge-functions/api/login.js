/**
 * EdgeOne Edge Function - 用户登录
 * 使用 KV 存储用户数据（密码已哈希验证）
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    const { email, password } = data;

    // 验证必填字段
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: '请填写邮箱和密码'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 KV 获取用户数据
    if (!env.USERS_KV) {
      return new Response(JSON.stringify({
        success: false,
        message: '服务暂不可用'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userStr = await env.USERS_KV.get(`user:${email}`);
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

    // ✅ 密码哈希验证（使用 Web Crypto API）
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

    // 生成 session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // 存储 session 到 KV（7天过期）
    if (env.SESSIONS_KV) {
      const sessionData = {
        userId: userData.id,
        email: userData.email,
        createdAt: new Date().toISOString()
      };

      await env.SESSIONS_KV.put(
        `session:${sessionToken}`,
        JSON.stringify(sessionData),
        { expirationTtl: 604800 }
      );
    }

    // 返回成功响应（不返回密码）
    const { password: _, ...userWithoutPassword } = userData;

    // ✅ Cookie 添加 Secure + SameSite 标志
    const isProduction = request.url.includes('https');
    const cookieFlags = isProduction
      ? 'Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800'
      : 'Path=/; HttpOnly; SameSite=Strict; Max-Age=604800';

    return new Response(JSON.stringify({
      success: true,
      message: '登录成功',
      user: userWithoutPassword,
      token: sessionToken
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionToken}; ${cookieFlags}`
      }
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
