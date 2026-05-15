/**
 * EdgeOne Edge Function - 健康检查 API
 * GET /api/health
 * 返回服务状态和 KV 连通性
 */

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        hasUsersKV: !!env.USERS_KV,
        hasSessionsKV: !!env.SESSIONS_KV,
        hasProductsKV: !!env.PRODUCTS_KV,
        hasOrdersKV: !!env.ORDERS_KV,
      }
    };

    // 快速测试 KV 连通性（仅检测，不阻塞）
    if (env.PRODUCTS_KV) {
      try {
        await Promise.race([
          env.PRODUCTS_KV.get('health_check'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
        ]);
        checks.kvStatus = 'connected';
      } catch (e) {
        checks.kvStatus = 'unavailable';
        checks.kvError = e.message;
      }
    } else {
      checks.kvStatus = 'not_bound';
    }

    return new Response(JSON.stringify(checks), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
