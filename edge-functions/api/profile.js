/**
 * EdgeOne Edge Function - 获取/更新用户资料
 * 需要认证
 */

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    // 验证 session
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

    // 从 KV 获取用户数据
    const userStr = await env.USERS_KV.get(`user:${session.email}`);
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

export async function onRequestPut(context) {
  try {
    const { request, env } = context;

    // 验证 session
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

    const updateData = await request.json();

    // 从 KV 获取用户数据
    const userStr = await env.USERS_KV.get(`user:${session.email}`);
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

    // 更新允许的字段
    if (updateData.name !== undefined) userData.name = updateData.name;
    if (updateData.profile !== undefined) {
      userData.profile = { ...userData.profile, ...updateData.profile };
    }

    // 保存回 KV
    await env.USERS_KV.put(`user:${session.email}`, JSON.stringify(userData));

    const { password, ...userWithoutPassword } = userData;

    return new Response(JSON.stringify({
      success: true,
      message: '更新成功',
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

// 验证 session 的辅助函数
async function verifySession(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const authHeader = request.headers.get('Authorization');

  let sessionToken = null;

  if (sessionMatch) {
    sessionToken = sessionMatch[1];
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.substring(7);
  }

  if (!sessionToken) return null;

  const sessionStr = await env.SESSIONS_KV.get(`session:${sessionToken}`);
  if (!sessionStr) return null;

  return JSON.parse(sessionStr);
}
