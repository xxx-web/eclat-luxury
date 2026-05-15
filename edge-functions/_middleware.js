/**
 * ÉCLAT Edge Functions 中间件
 * 功能：CORS 处理、认证检查、请求/响应日志、安全头
 * 文件名：_middleware.js（EdgeOne Pages 会自动加载）
 */

// 需要登录才能访问的路由
const PROTECTED_ROUTES = [
  '/api/profile',
  '/api/orders/create',
  '/api/orders/user',
  '/api/logout'
];

// 管理员专属路由
const ADMIN_ROUTES = [
  '/api/admin/'
];

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const startTime = Date.now();

  // 请求日志
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  console.log(`[REQ] ${request.method} ${path} - IP: ${clientIP}`);

  // 跳过静态资源，直接放行
  if (!path.startsWith('/api/')) {
    return await next();
  }

  // ===== CORS 预检请求处理 =====
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // ===== 认证检查 =====
  if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: '请先登录'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const sessionData = await env.SESSIONS_KV?.get(`session:${token}`);
      if (!sessionData) {
        return new Response(JSON.stringify({
          success: false,
          message: '登录已过期，请重新登录'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        };
      }
    } catch (e) {
      console.warn('[WARN] Token validation skipped:', e.message);
      // 降级处理：KV 不可用时放行，由具体 API 处理认证
    }
  }

  // ===== 管理员路由检查 =====
  if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.includes('admin-secret')) {
      return new Response(JSON.stringify({
        success: false,
        message: '无权访问管理员接口'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      };
    }
  }

  // ===== 执行后续处理函数 =====
  const response = await next();

  // ===== 统一添加响应头 =====
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 响应时间日志
  const duration = Date.now() - startTime;
  console.log(`[RES] ${request.method} ${path} - ${response.status} - ${duration}ms`);

  return newResponse;
}
