/**
 * ÉCLAT 用户行为追踪 API - Edge Function
 * 使用 EdgeOne KV Storage 存储用户行为数据
 * 支持查看历史、收藏、购买记录
 */

/**
 * POST /api/track
 * 记录用户行为
 * Body: { userId, productId, action: 'view'|'like'|'purchase', timestamp? }
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { userId, productId, action, timestamp, metadata } = body;
    
    // 验证必填字段
    if (!userId || !productId || !action) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: userId, productId, action' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证 action 类型
    if (!['view', 'like', 'unlike', 'purchase', 'add_to_cart', 'share'].includes(action)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid action. Must be: view, like, unlike, purchase, add_to_cart, share' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 读取用户行为数据
    const behaviorKey = `user:behavior:${userId}`;
    const behaviorData = await env.ECAT_KV.get(behaviorKey);
    const behavior = behaviorData ? JSON.parse(behaviorData) : {
      userId,
      views: [],
      likes: [],
      purchases: [],
      addToCart: [],
      shares: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // 记录时间戳
    const ts = timestamp || Date.now();
    
    // 根据 action 更新对应字段
    switch (action) {
      case 'view':
        // 记录浏览历史（最多保留 100 条）
        behavior.views.unshift({
          productId,
          timestamp: ts,
          metadata: metadata || {}
        });
        if (behavior.views.length > 100) {
          behavior.views = behavior.views.slice(0, 100);
        }
        break;
        
      case 'like':
        // 添加到收藏（如果还没有）
        if (!behavior.likes.includes(productId)) {
          behavior.likes.push(productId);
        }
        break;
        
      case 'unlike':
        // 从收藏移除
        behavior.likes = behavior.likes.filter(id => id !== productId);
        break;
        
      case 'purchase':
        // 记录购买历史
        behavior.purchases.unshift({
          productId,
          timestamp: ts,
          metadata: metadata || {}
        });
        break;
        
      case 'add_to_cart':
        // 记录加入购物车
        behavior.addToCart.unshift({
          productId,
          timestamp: ts,
          metadata: metadata || {}
        });
        if (behavior.addToCart.length > 50) {
          behavior.addToCart = behavior.addToCart.slice(0, 50);
        }
        break;
        
      case 'share':
        // 记录分享行为
        behavior.shares.unshift({
          productId,
          timestamp: ts,
          metadata: metadata || {}
        });
        if (behavior.shares.length > 50) {
          behavior.shares = behavior.shares.slice(0, 50);
        }
        break;
    }
    
    // 更新时间戳
    behavior.updatedAt = Date.now();
    
    // 保存回 KV
    await env.ECAT_KV.put(behaviorKey, JSON.stringify(behavior));
    
    // 同时更新产品级别的行为统计（用于协同过滤）
    const productBehaviorKey = `product:behavior:${productId}`;
    const productBehaviorData = await env.ECAT_KV.get(productBehaviorKey);
    const productBehavior = productBehaviorData ? JSON.parse(productBehaviorData) : {
      productId,
      views: 0,
      likes: 0,
      purchases: 0,
      addToCart: 0,
      shares: 0,
      userIds: []
    };
    
    // 更新统计
    if (action === 'view') productBehavior.views++;
    if (action === 'like') productBehavior.likes++;
    if (action === 'unlike') productBehavior.likes = Math.max(0, productBehavior.likes - 1);
    if (action === 'purchase') productBehavior.purchases++;
    if (action === 'add_to_cart') productBehavior.addToCart++;
    if (action === 'share') productBehavior.shares++;
    
    // 记录唯一用户
    if (!productBehavior.userIds.includes(userId)) {
      productBehavior.userIds.push(userId);
    }
    
    await env.ECAT_KV.put(productBehaviorKey, JSON.stringify(productBehavior));
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Behavior tracked successfully',
      behavior: {
        views: behavior.views.length,
        likes: behavior.likes.length,
        purchases: behavior.purchases.length
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/track?userId=<userId>
 * 获取用户行为数据
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing userId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // 读取用户行为数据
    const behaviorKey = `user:behavior:${userId}`;
    const behaviorData = await env.ECAT_KV.get(behaviorKey);
    
    if (!behaviorData) {
      return new Response(JSON.stringify({ 
        error: 'User behavior not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const behavior = JSON.parse(behaviorData);
    
    // 返回脱敏后的数据（不返回太详细的信息）
    return new Response(JSON.stringify({
      userId: behavior.userId,
      stats: {
        totalViews: behavior.views.length,
        totalLikes: behavior.likes.length,
        totalPurchases: behavior.purchases.length,
        totalAddToCart: behavior.addToCart.length,
        totalShares: behavior.shares.length
      },
      recentViews: behavior.views.slice(0, 10),
      likes: behavior.likes,
      recentPurchases: behavior.purchases.slice(0, 5),
      createdAt: behavior.createdAt,
      updatedAt: behavior.updatedAt
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=0'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * DELETE /api/track?userId=<userId>
 * 删除用户行为数据（GDPR 合规）
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing userId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // 删除用户行为数据
    const behaviorKey = `user:behavior:${userId}`;
    await env.ECAT_KV.delete(behaviorKey);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'User behavior data deleted successfully' 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
