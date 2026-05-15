/**
 * 产品数据初始化脚本
 * 
 * 使用方法：
 * 1. 部署后，访问 /api/admin/init-products 来初始化产品数据
 * 2. 或者在前端代码中调用此 API
 * 
 * 注意：此脚本仅用于开发环境，生产环境应使用更安全的方法
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
    img: 'static/images/yueguang.png',
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
    img: 'static/images/gold_rose_earring.png',
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
    img: 'static/images/emerald_ring.png',
    isNew: false,
    isBestseller: false
  }
  // 添加更多产品...
];

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 简单的安全检查（生产环境应使用更严格的方法）
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('init-products-secret')) {
      return new Response(JSON.stringify({
        success: false,
        message: '无权访问'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查是否已有数据
    if (!env.PRODUCTS_KV) {
      return new Response(JSON.stringify({
        success: false,
        message: 'KV 存储未绑定'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingData = await env.PRODUCTS_KV.get('products');
    if (existingData) {
      return new Response(JSON.stringify({
        success: false,
        message: '产品数据已存在，如需重置请先删除'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 初始化产品数据
    await env.PRODUCTS_KV.put('products', JSON.stringify(initialProducts));

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
