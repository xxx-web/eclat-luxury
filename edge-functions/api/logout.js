/**
 * EdgeOne Edge Function - 用户登出
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
    const authHeader = request.headers.get('Authorization');
    let sessionToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }

    if (sessionToken) {
      try {
        if (env && env.SESSIONS_KV) {
          await env.SESSIONS_KV.delete(`session:${sessionToken}`);
        }
      } catch (e) {}
      mem.sessions.delete(`session:${sessionToken}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: '登出成功'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '服务器错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
