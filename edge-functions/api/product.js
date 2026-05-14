/**
 * EdgeOne Edge Function - 单个产品详情 API
 * 获取指定产品 ID 的详细信息
 */

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      message: '只支持 GET 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handleGet(context);
}

async function handleGet(context) {
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
    const productsData = await env.PRODUCTS_KV.get('products');
    if (!productsData) {
      return new Response(JSON.stringify({
        success: false,
        message: '产品数据不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const products = JSON.parse(productsData);
    const product = products.find(p => p.id === productId);

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
      .filter(p => p.category === product.category && p.id !== productId)
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
