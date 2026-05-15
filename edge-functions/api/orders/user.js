/**
 * EdgeOne Edge Function - 获取用户订单列表
 * 获取指定用户的所有订单
 */

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: '缺少用户 ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 如果 KV 未绑定，返回空订单列表
    if (!env.USERS_KV || !env.ORDERS_KV) {
      return new Response(JSON.stringify({
        success: true,
        orders: []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证用户是否存在
    const userStr = await env.USERS_KV.get(`user:${userId}`);
    if (!userStr) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取用户订单列表
    const userOrdersStr = await env.ORDERS_KV.get(`user_orders:${userId}`);
    if (!userOrdersStr) {
      return new Response(JSON.stringify({
        success: true,
        orders: []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderIds = JSON.parse(userOrdersStr);

    // 获取所有订单详情
    const orders = [];
    for (const orderId of orderIds) {
      const orderStr = await env.ORDERS_KV.get(`order:${orderId}`);
      if (orderStr) {
        orders.push(JSON.parse(orderStr));
      }
    }

    // 按创建时间倒序排序
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return new Response(JSON.stringify({
      success: true,
      orders
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '获取订单列表失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
