/**
 * EdgeOne Edge Function - 获取订单详情
 * 根据订单 ID 获取详细信息
 */

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return new Response(JSON.stringify({
        success: false,
        message: '缺少订单 ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从 KV 获取订单数据
    const orderStr = await env.ORDERS_KV.get(`order:${orderId}`);

    if (!orderStr) {
      return new Response(JSON.stringify({
        success: false,
        message: '订单不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderData = JSON.parse(orderStr);

    // 验证权限（只能查看自己的订单）
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      // 简单的权限验证：检查用户 ID 是否匹配
      const userId = authHeader.replace('Bearer ', '');
      if (orderData.userId !== userId) {
        return new Response(JSON.stringify({
          success: false,
          message: '无权访问此订单'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      order: orderData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get order error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '获取订单失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
