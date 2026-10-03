// EdgeOne Pages 将 KV 绑定为全局变量（NOT on context.env）。安全解析，未绑定时为 null。
const KV_PRODUCTS_KV = (typeof PRODUCTS_KV !== 'undefined') ? PRODUCTS_KV : null;

/**
 * 产品数据初始化脚本
 *
 * 使用方法：
 * 1. 部署后，访问 /api/admin/init-products 来初始化产品数据（需带 Authorization: Bearer <ADMIN_SECRET>）
 * 2. 或者在前端代码中调用此 API
 *
 * 注意：
 * - 本接口受【内联管理员鉴权】保护（adminGuard），即使 EdgeOne 通用中间件未生效也能锁死。
 * - 同时由根目录 middleware.js 的全局 admin 路由检查兜底。
 */

// 示例产品数据（根据实际产品修改）
const initialProducts = [
  {
    id: 'yueguang',
    name: '月光之泪项链',
    category: 'jewelry',
    price: 12800,
    originalPrice: 15800,
    rating: 4.9,
    reviews: 128,
    description: '18K 白金镶嵌月光石，展现柔和优雅的光泽',
    img: '/images/yueguang.png',
    isNew: true,
    isBestseller: false
  },
  {
    id: 'gold_rose_earring',
    name: '金玫瑰耳环',
    category: 'jewelry',
    price: 8600,
    originalPrice: null,
    rating: 4.8,
    reviews: 96,
    description: '18K 玫瑰金镶嵌钻石，精致优雅',
    img: '/images/gold_rose_earring.png',
    isNew: false,
    isBestseller: true
  },
  {
    id: 'emerald_ring',
    name: '翡翠花园戒指',
    category: 'jewelry',
    price: 22500,
    originalPrice: 26800,
    rating: 4.9,
    reviews: 75,
    description: '天然翡翠配以钻石环绕，奢华典雅',
    img: '/images/emerald_ring.png',
    isNew: false,
    isBestseller: false
  }
  // 添加更多产品...
];

/**
 * 恒定时间字符串比较，避免时序侧信道泄露密钥长度/内容。
 * Edge Functions 运行时无 Node Buffer，用 UTF-8 字节异或归约实现。
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

/**
 * 内联管理员鉴权（兜底防线）。
 * 管理员密钥来自环境变量 ADMIN_SECRET；未配置一律 500 拒绝（fail-closed）。
 * 返回非 null 表示鉴权失败（已构造响应），调用方应直接 return 该响应。
 */
function adminGuard(request, env) {
  const expected = (env && env.ADMIN_SECRET) || null;
  if (!expected) {
    return new Response(JSON.stringify({
      success: false,
      message: '服务器未配置管理员密钥'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const authHeader = request.headers.get('Authorization') || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  const provided = m ? m[1].trim() : '';
  if (!safeEqual(provided, expected)) {
    return new Response(JSON.stringify({
      success: false,
      message: '无权访问管理员接口'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 内联管理员鉴权（兜底）：即使 EdgeOne 通用中间件未生效，也锁死 /api/admin/*
    const guardRes = adminGuard(request, env);
    if (guardRes) return guardRes;

    // 检查是否已有数据
    if (!KV_PRODUCTS_KV) {
      return new Response(JSON.stringify({
        success: false,
        message: 'KV 存储未绑定'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingData = await KV_PRODUCTS_KV.get('products');
    if (existingData) {
      return new Response(JSON.stringify({
        success: false,
        message: '产品数据已存在，如需重置请先删除'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 初始化产品数据
    await KV_PRODUCTS_KV.put('products', JSON.stringify(initialProducts));

    return new Response(JSON.stringify({
      success: true,
      message: `成功初始化 ${initialProducts.length} 个产品`,
      products: initialProducts
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Init products error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '初始化失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
