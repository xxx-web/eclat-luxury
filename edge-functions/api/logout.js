/**
 * EdgeOne Edge Function - 用户登出
 * 清除 session
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 从 Cookie 或请求头获取 session token
    const cookie = request.headers.get('Cookie') || '';
    const sessionMatch = cookie.match(/session=([^;]+)/);
    const authHeader = request.headers.get('Authorization');

    let sessionToken = null;

    if (sessionMatch) {
      sessionToken = sessionMatch[1];
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }

    if (sessionToken && env.SESSIONS_KV) {
      // 从 KV 删除 session
      await env.SESSIONS_KV.delete(`session:${sessionToken}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: '登出成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0'
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
