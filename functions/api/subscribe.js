/**
 * ÉCLAT 邮件订阅 API - Edge Function
 * 使用 EdgeOne KV Storage 持久化存储订阅者
 * 支持订阅、退订、查看订阅者列表
 */

/**
 * POST /api/subscribe
 * 订阅邮件列表
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { email, name, preferences } = body;
    
    // 验证邮箱格式
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 读取现有订阅者列表
    const subscribersData = await env.ECAT_KV.get('subscribers');
    const subscribers = subscribersData ? JSON.parse(subscribersData) : [];
    
    // 检查是否已订阅
    const existingIndex = subscribers.findIndex(s => s.email === email);
    
    if (existingIndex !== -1) {
      // 已订阅，更新信息
      subscribers[existingIndex].name = name || subscribers[existingIndex].name;
      subscribers[existingIndex].preferences = preferences || subscribers[existingIndex].preferences;
      subscribers[existingIndex].updatedAt = Date.now();
    } else {
      // 添加新订阅者
      subscribers.push({
        email,
        name: name || '',
        preferences: preferences || [],
        subscribedAt: Date.now(),
        status: 'active'
      });
    }
    
    // 保存到 KV
    await env.ECAT_KV.put('subscribers', JSON.stringify(subscribers));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: existingIndex !== -1 ? 'Subscription updated' : 'Subscription successful',
      isUpdate: existingIndex !== -1
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
 * DELETE /api/subscribe?email=<email>
 * 退订
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  if (!email) {
    return new Response(JSON.stringify({ error: 'Missing email parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // 读取订阅者列表
    const subscribersData = await env.ECAT_KV.get('subscribers');
    let subscribers = subscribersData ? JSON.parse(subscribersData) : [];
    
    // 查找订阅者
    const index = subscribers.findIndex(s => s.email === email);
    
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Email not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 标记为退订（软删除）
    subscribers[index].status = 'unsubscribed';
    subscribers[index].unsubscribedAt = Date.now();
    
    // 保存
    await env.ECAT_KV.put('subscribers', JSON.stringify(subscribers));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully unsubscribed' 
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
 * GET /api/subscribe
 * 获取订阅者列表（管理员功能）
 * 查询参数: ?status=active (可选筛选)
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status'); // 'active' | 'unsubscribed' | null (all)
  
  try {
    // 读取所有订阅者
    const subscribersData = await env.ECAT_KV.get('subscribers');
    let subscribers = subscribersData ? JSON.parse(subscribersData) : [];
    
    // 筛选状态
    if (status) {
      subscribers = subscribers.filter(s => s.status === status);
    }
    
    // 统计信息
    const stats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.status === 'active').length,
      unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length
    };
    
    return new Response(JSON.stringify({ 
      success: true,
      stats,
      subscribers: subscribers.map(s => ({
        ...s,
        // 隐藏完整邮箱（隐私保护）
        email: s.email.replace(/(.{2}).+(@.+)/, '$1***$2')
      }))
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
