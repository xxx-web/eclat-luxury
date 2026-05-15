/**
 * EdgeOne Edge Function - 邮件订阅 API
 * POST /api/subscribe
 * 将邮箱保存到 KV，支持去重
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: '请输入邮箱地址' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, message: '邮箱格式不正确' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 检查是否已订阅
    if (env.PRODUCTS_KV) {
      try {
        const existing = await env.PRODUCTS_KV.get(`subscriber:${normalizedEmail}`);
        if (existing) {
          return new Response(JSON.stringify({ success: true, message: '您已经订阅过了，感谢支持！' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 保存到 KV
        const subscriber = {
          email: normalizedEmail,
          subscribedAt: new Date().toISOString(),
          source: 'website'
        };
        await env.PRODUCTS_KV.put(`subscriber:${normalizedEmail}`, JSON.stringify(subscriber));

        // 维护订阅者列表
        const listStr = await env.PRODUCTS_KV.get('subscribers_list');
        const list = listStr ? JSON.parse(listStr) : [];
        list.unshift(normalizedEmail);
        await env.PRODUCTS_KV.put('subscribers_list', JSON.stringify(list.slice(0, 1000)));
      } catch (kvError) {
        console.warn('KV error (non-fatal):', kvError.message);
        // 降级：不阻塞用户，但返回成功
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: '订阅成功！感谢您的关注。'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscribe API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '订阅失败，请稍后重试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
