/**
 * EdgeOne Edge Function - 用户行为追踪 API
 * POST /api/track  — 记录用户行为（浏览/喜欢/购买）
 * GET  /api/track?userId=xxx — 获取用户行为数据
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();
    const { userId, productId, action, timestamp } = data;

    if (!userId || !productId || !action) {
      return new Response(JSON.stringify({ success: false, message: '缺少必填字段' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['view', 'like', 'purchase'].includes(action)) {
      return new Response(JSON.stringify({ success: false, message: '无效的操作类型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.USERS_KV) {
      try {
        const key = `behavior:${userId}`;
        const existing = await env.USERS_KV.get(key);
        const behavior = existing ? JSON.parse(existing) : { userId, views: [], likes: [], purchases: [] };

        if (action === 'view') {
          behavior.views = behavior.views || [];
          behavior.views.push({ productId, timestamp: timestamp || Date.now() });
          // 只保留最近 100 条浏览记录
          if (behavior.views.length > 100) behavior.views = behavior.views.slice(-100);
        } else if (action === 'like') {
          behavior.likes = behavior.likes || [];
          if (!behavior.likes.includes(productId)) {
            behavior.likes.push(productId);
          }
        } else if (action === 'purchase') {
          behavior.purchases = behavior.purchases || [];
          if (!behavior.purchases.includes(productId)) {
            behavior.purchases.push(productId);
          }
        }

        await env.USERS_KV.put(key, JSON.stringify(behavior));
      } catch (kvError) {
        console.warn('KV write error (non-fatal):', kvError.message);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Track POST error:', error);
    // 不阻塞用户体验
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: '缺少 userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let behavior = { userId, views: [], likes: [], purchases: [] };

    if (env.USERS_KV) {
      try {
        const data = await env.USERS_KV.get(`behavior:${userId}`);
        if (data) behavior = JSON.parse(data);
      } catch (e) {
        console.warn('KV read error:', e.message);
      }
    }

    return new Response(JSON.stringify(behavior), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Track GET error:', error);
    return new Response(JSON.stringify({ success: false, message: '获取行为数据失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
