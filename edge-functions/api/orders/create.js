/**
 * EdgeOne Edge Function - 创建订单
 * 从购物车创建新订单
 */

// 共享内存存储（KV 未绑定时的降级方案）
if (!globalThis.__ECLAT_MEMORY__) {
  globalThis.__ECLAT_MEMORY__ = {
    users: new Map(),
    sessions: new Map(),
    orders: new Map()
  };
}
const mem = globalThis.__ECLAT_MEMORY__;

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    const { userId, items, total, shippingAddress, paymentMethod } = data;

    // 验证必填字段
    if (!userId || !items || !total || !shippingAddress) {
      return new Response(JSON.stringify({
        success: false,
        message: '缺少必填字段'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证用户是否存在（优先 KV，降级内存）
    let userStr = null;
    try {
      if (env && env.USERS_KV) {
        userStr = await env.USERS_KV.get(`user:${userId}`);
      }
    } catch (e) {}

    if (!userStr) {
      userStr = mem.users.get(`user:${userId}`);
    }

    if (!userStr) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成订单 ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建订单数据
    const orderData = {
      id: orderId,
      userId,
      items,
      total,
      status: 'pending', // pending, paid, shipped, delivered, cancelled
      shippingAddress,
      paymentMethod: paymentMethod || 'credit_card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const orderJson = JSON.stringify(orderData);

    // 存储到 KV（如果已绑定）
    try {
      if (env && env.ORDERS_KV) {
        await env.ORDERS_KV.put(`order:${orderId}`, orderJson);

        // 添加到用户订单列表
        const userOrdersStr = await env.ORDERS_KV.get(`user_orders:${userId}`);
        const userOrders = userOrdersStr ? JSON.parse(userOrdersStr) : [];
        userOrders.unshift(orderId);
        await env.ORDERS_KV.put(`user_orders:${userId}`, JSON.stringify(userOrders));
      }
    } catch (e) {
      console.error('KV storage error:', e);
    }

    // 同时保存到内存（降级/备份）
    mem.orders.set(`order:${orderId}`, orderJson);
    const memUserOrders = mem.orders.get(`user_orders:${userId}`) || [];
    memUserOrders.unshift(orderId);
    mem.orders.set(`user_orders:${userId}`, memUserOrders);

    return new Response(JSON.stringify({
      success: true,
      message: '订单创建成功',
      order: orderData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  }catch (error) {
    console.error('Create order error:', error);
    const errorDetails = {
      success: false,
      message: '创建订单失败: ' + (error.message || '未知错误'),
      debug: {
        stack: error.stack,
        name: error.name
      }
    };
    return new Response(JSON.stringify(errorDetails), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
