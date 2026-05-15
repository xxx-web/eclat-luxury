/**
 * EdgeOne Edge Function - 单个产品详情 API
 * 获取指定产品 ID 的详细信息
 */

// Fallback 产品数据（KV 未绑定时使用）
const FALLBACK_PRODUCTS = [
  { id: 'yueguang', name: '月光之泪项链', category: 'jewelry', price: 12800, rating: 4.9, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/yueguang.png' },
  { id: 'gold_rose_earing', name: '金玫瑰耳环', category: 'jewelry', price: 8600, rating: 4.8, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/gold_rose_earing.png' },
  { id: 'emerald_ring', name: '翡翠花园戒指', category: 'jewelry', price: 22500, rating: 4.9, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/emerald_ring.png' },
  { id: 'pearl_bracelet', name: '珍珠手链', category: 'jewelry', price: 6800, rating: 4.7, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/pearl_bracelet.png' },
  { id: 'noir_absolu_perfume', name: '黑夜Absolute', category: 'perfume', price: 3200, rating: 4.9, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/noir_absolu_perfume.png' },
  { id: 'rose_celeste_perfume', name: '天穹玫瑰', category: 'perfume', price: 2800, rating: 4.8, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/rose_celeste_perfume.png' },
  { id: 'bois_sacre_perfume', name: '神圣之木', category: 'perfume', price: 3500, rating: 4.7, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/bois_sacre_perfume.png' },
  { id: 'quilted_tote_bag', name: '菱格纹托特包', category: 'bag', price: 18500, rating: 4.8, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/quilted_tote_bag.png' },
  { id: 'woven_chain_bag', name: '编织链条包', category: 'bag', price: 12800, rating: 4.7, img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/eclat/woven_chain_bag.png' }
];

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    if (!productId) {
      return new Response(JSON.stringify({
        success: false,
        message: '缺少产品 ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 KV 获取所有产品
    let products = [];
    try {
      if (env.PRODUCTS_KV) {
        const productsData = await env.PRODUCTS_KV.get('products');
        if (productsData) {
          products = JSON.parse(productsData);
        }
      }
    } catch (e) {
      console.warn('KV read error, using fallback:', e.message);
    }

    // 如果 KV 中没有数据，使用 fallback
    if (products.length === 0) {
      products = FALLBACK_PRODUCTS;
    }

    const product = products.find(p => String(p.id) === String(productId));

    if (!product) {
      return new Response(JSON.stringify({
        success: false,
        message: '产品不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取相关产品（同分类的其他产品）
    const relatedProducts = products
      .filter(p => p.category === product.category && String(p.id) !== String(productId))
      .slice(0, 4);

    return new Response(JSON.stringify({
      success: true,
      product,
      related: relatedProducts
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    console.error('Product detail API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '获取产品详情失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
