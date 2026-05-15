/**
 * EdgeOne Edge Function - 评论 API
 * GET  /api/reviews?productId=xxx  — 获取产品评论
 * POST /api/reviews                — 提交评论
 */

// 默认评论数据（KV 未绑定时使用）
const FALLBACK_REVIEWS = {
  'yueguang': [
    { id: 'rvw_1', author: 'Lina Chen', rating: 5, text: '月光石的光泽非常柔和，戴上后整个人都优雅起来了。做工精细，值得收藏。', date: '2026-03-15', helpful: 24 },
    { id: 'rvw_2', author: 'Mei Wang', rating: 5, text: '送给自己的生日礼物，非常满意。包装也很精美，很有仪式感。', date: '2026-02-28', helpful: 18 },
  ],
  'gold_rose_earing': [
    { id: 'rvw_3', author: 'Yuki Tanaka', rating: 5, text: '玫瑰金配钻石，精致又不张扬。日常佩戴刚好。', date: '2026-04-01', helpful: 31 },
  ],
  'emerald_ring': [
    { id: 'rvw_4', author: 'Sarah Miller', rating: 5, text: 'Emerald 的颜色太美了，钻石环绕的设计非常经典。值得投资。', date: '2026-01-20', helpful: 42 },
  ]
};

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return new Response(JSON.stringify({ success: false, message: '缺少 productId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let reviews = [];
    try {
      if (env.PRODUCTS_KV) {
        const data = await env.PRODUCTS_KV.get(`reviews:${productId}`);
        if (data) reviews = JSON.parse(data);
      }
    } catch (e) {
      console.warn('KV read error:', e.message);
    }

    if (reviews.length === 0) {
      reviews = FALLBACK_REVIEWS[productId] || [];
    }

    return new Response(JSON.stringify(reviews), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();
    const { productId, author, rating, text } = data;

    if (!productId || !author || !rating || !text) {
      return new Response(JSON.stringify({ success: false, message: '请填写所有必填字段' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ success: false, message: '评分必须在 1-5 之间' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const review = {
      id: `rvw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      author,
      rating,
      text,
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    };

    // 保存到 KV
    if (env.PRODUCTS_KV) {
      try {
        const key = `reviews:${productId}`;
        const existing = await env.PRODUCTS_KV.get(key);
        const reviews = existing ? JSON.parse(existing) : [];
        reviews.unshift(review);
        await env.PRODUCTS_KV.put(key, JSON.stringify(reviews));
      } catch (e) {
        console.warn('KV write error:', e.message);
      }
    }

    return new Response(JSON.stringify({ success: true, review }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return new Response(JSON.stringify({ success: false, message: '提交评论失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
