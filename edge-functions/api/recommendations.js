/**
 * EdgeOne Edge Function - 推荐产品 API
 * GET /api/recommendations?userId=xxx&productId=xxx&limit=6
 * 基于用户行为或相似产品生成推荐列表
 */

const FALLBACK_PRODUCTS = [
  { id: 'yueguang', name: '月光之泪项链', category: 'jewelry', price: 12800, rating: 4.9, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/yueguang.png', tag: '新品', recommendationReason: '根据您的浏览历史推荐' },
  { id: 'gold_rose_earing', name: '金玫瑰耳环', category: 'jewelry', price: 8600, rating: 4.8, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/gold_rose_earing.png', tag: '畅销', recommendationReason: '热门精选' },
  { id: 'emerald_ring', name: '翡翠花园戒指', category: 'jewelry', price: 22500, rating: 4.9, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/emerald_ring.png', tag: '', recommendationReason: '高端收藏推荐' },
  { id: 'pearl_bracelet', name: '珍珠手链', category: 'jewelry', price: 6800, rating: 4.7, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/pearl_bracelet.png', tag: '新品', recommendationReason: '同类风格推荐' },
  { id: 'noir_absolu_perfume', name: '黑夜Absolute', category: 'perfume', price: 3200, rating: 4.9, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/noir_absolu_perfume.png', tag: '畅销', recommendationReason: '基于您的喜好推荐' },
  { id: 'rose_celeste_perfume', name: '天穹玫瑰', category: 'perfume', price: 2800, rating: 4.8, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/rose_celeste_perfume.png', tag: '新品', recommendationReason: '清新花香，适合日常' },
];

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const productId = url.searchParams.get('productId');
    const limit = parseInt(url.searchParams.get('limit') || '6');

    // 尝试从 KV 获取产品数据
    let products = [];
    try {
      if (env.PRODUCTS_KV) {
        const data = await env.PRODUCTS_KV.get('products');
        if (data) products = JSON.parse(data);
      }
    } catch (e) {
      console.warn('KV read error, using fallback:', e.message);
    }

    if (products.length === 0) {
      products = FALLBACK_PRODUCTS;
    }

    let recommendations = [];

    if (productId) {
      // 基于当前产品的同类推荐
      const current = products.find(p => String(p.id) === String(productId));
      if (current) {
        recommendations = products
          .filter(p => String(p.id) !== String(productId) && p.category === current.category)
          .slice(0, limit)
          .map(p => ({
            ...p,
            recommendationReason: `同品类推荐：${current.category}`
          }));
      }
    }

    if (recommendations.length === 0 && userId) {
      // 基于用户行为的推荐（从 KV 读取用户行为）
      try {
        if (env.USERS_KV) {
          const behaviorStr = await env.USERS_KV.get(`behavior:${userId}`);
          if (behaviorStr) {
            const behavior = JSON.parse(behaviorStr);
            const likedCategories = behavior.likes?.map(id => {
              const p = products.find(p => String(p.id) === String(id));
              return p?.category;
            }).filter(Boolean) || [];

            if (likedCategories.length > 0) {
              recommendations = products
                .filter(p => likedCategories.includes(p.category))
                .slice(0, limit)
                .map(p => ({ ...p, recommendationReason: '根据您的喜好推荐' }));
            }
          }
        }
      } catch (e) {
        console.warn('Behavior read error:', e.message);
      }
    }

    // 兜底：随机推荐
    if (recommendations.length === 0) {
      recommendations = products
        .sort(() => 0.5 - Math.random())
        .slice(0, limit)
        .map(p => ({ ...p, recommendationReason: '精选推荐' }));
    }

    return new Response(JSON.stringify({
      success: true,
      products: recommendations.slice(0, limit)
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return new Response(JSON.stringify({
      success: true,
      products: FALLBACK_PRODUCTS.slice(0, 6)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
