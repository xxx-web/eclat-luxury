// ============================================================================
// EdgeOne Pages 通用中间件（平台约定：项目根目录 middleware.js，导出 middleware）
//
// ⚠️ 重要：EdgeOne Pages 的通用中间件【不是】edge-functions/_middleware.js + export onRequest
// （那是 Cloudflare Pages 的写法，EdgeOne 不会加载它）。本文件才是 EdgeOne 会真正执行的中间件。
// 参考：https://fantasydm.top/blog/aea810ea/ （EdgeOne 官方确认并给出通用中间件写法）
// ============================================================================

// KV 全局变量安全解析（EdgeOne Pages 把 KV 绑定为全局变量，NOT on context.env）
const KV_SESSIONS_KV = (typeof SESSIONS_KV !== 'undefined') ? SESSIONS_KV : null;

// 需要登录才能访问的路由
const PROTECTED_ROUTES = [
  '/api/orders/create',
  '/api/orders/user'
];

// 管理员专属路由（鉴权密钥来自环境变量 ADMIN_SECRET）
const ADMIN_ROUTES = [
  '/api/admin/'
];

/**
 * 恒定时间字符串比较，避免时序侧信道泄露密钥长度/内容。
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

/** 从 Cookie 或 Authorization 头解析会话 token */
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

export async function middleware(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // ===== CORS 预检请求 =====
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

  // ===== API 鉴权（仅对 /api/* 生效） =====
  if (path.startsWith('/api/')) {
    // 用户会话保护
    if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
      const token = getSessionToken(request);
      if (!token) {
        return jsonResponse({ success: false, message: '请先登录' }, 401);
      }
      try {
        const sessionData = await KV_SESSIONS_KV?.get(`session:${token}`);
        if (!sessionData) {
          return jsonResponse({ success: false, message: '登录已过期，请重新登录' }, 401);
        }
      } catch (e) {
        console.warn('[WARN] Token validation skipped:', e.message);
      }
    }

    // 管理员路由保护（密钥来自环境变量 ADMIN_SECRET；未配置一律 500 fail-closed）
    if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
      const expected = (env && env.ADMIN_SECRET) || null;
      if (!expected) {
        console.error('[ADMIN] ADMIN_SECRET 未配置，拒绝所有管理员请求（fail-closed）');
        return jsonResponse({ success: false, message: '服务器未配置管理员密钥' }, 500);
      }
      const authHeader = request.headers.get('Authorization') || '';
      const m = authHeader.match(/^Bearer\s+(.+)$/i);
      const provided = m ? m[1].trim() : '';
      if (!safeEqual(provided, expected)) {
        return jsonResponse({ success: false, message: '无权访问管理员接口' }, 403);
      }
    }
  }

  // ===== 透传请求 =====
  const response = await next();

  // ===== 统一安全响应头 =====
  try {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  } catch (e) {
    // 部分响应（如已发送）可能不可改，忽略
  }

  return response;
}
