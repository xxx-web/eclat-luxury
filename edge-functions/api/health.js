// EdgeOne Pages 将 KV 绑定为全局变量（NOT on context.env）。安全解析，未绑定时为 null。
const KV_PRODUCTS_KV = (typeof PRODUCTS_KV !== 'undefined') ? PRODUCTS_KV : null;
const KV_USERS_KV = (typeof USERS_KV !== 'undefined') ? USERS_KV : null;
const KV_ORDERS_KV = (typeof ORDERS_KV !== 'undefined') ? ORDERS_KV : null;
const KV_SESSIONS_KV = (typeof SESSIONS_KV !== 'undefined') ? SESSIONS_KV : null;
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
        hasUsersKV: !!KV_USERS_KV,
        hasSessionsKV: !!KV_SESSIONS_KV,
        hasProductsKV: !!KV_PRODUCTS_KV,
        hasOrdersKV: !!KV_ORDERS_KV,
      }
    };

    // 快速测试 KV 连通性（仅检测，不阻塞）
    if (KV_PRODUCTS_KV) {
      try {
        await Promise.race([
          KV_PRODUCTS_KV.get('health_check'),
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
    });
  }
}
