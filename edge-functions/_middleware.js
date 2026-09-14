/**
 * ÉCLAT Edge Functions 中间件
 * 功能：CORS 处理、认证检查、请求/响应日志、安全头
 * 文件名：_middleware.js（EdgeOne Pages 会自动加载）
 *
 * 鉴权说明（P0-1 之后）：
 * 会话由 login.js 下发的 HttpOnly Cookie（session=...）维持，前端 JS 无法读取 token，
 * 浏览器通过 credentials:'same-origin' 自动携带 Cookie。
 * 因此中间件必须同时接受 Cookie 与 Authorization: Bearer，二者取其一即可 —— 
 * 只认 Bearer 会让所有 Cookie 会话被误判为未登录（401）。
 */

// 需要登录才能访问的路由
// 注意：/api/profile 是"我是谁"探针，未登录时返回 { success:true, user:null }（200），
// 故不列入受保护路由，避免匿名访客在控制台刷出大量 401。
const PROTECTED_ROUTES = [
  '/api/orders/create',
  '/api/orders/user'
];

// 管理员专属路由
const ADMIN_ROUTES = [
  '/api/admin/'
];

/** 从 Cookie 或 Authorization 头解析会话 token（与 api/profile.js、api/logout.js 保持一致） */
function getSessionToken(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (match) return match[1];

  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.substring(7);

  return null;
}

/** 统一的 JSON 响应构造器 */
function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

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
    const token = getSessionToken(request);
    if (!token) {
      return jsonResponse({ success: false, message: '请先登录' }, 401);
    }

    try {
      const sessionData = await env.SESSIONS_KV?.get(`session:${token}`);
      if (!sessionData) {
        return jsonResponse({ success: false, message: '登录已过期，请重新登录' }, 401);
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
      return jsonResponse({ success: false, message: '无权访问管理员接口' }, 403);
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
