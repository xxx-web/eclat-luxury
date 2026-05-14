/**
 * ÉCLAT AI 客服 Edge Function
 * 支持调用 OpenAI 兼容 API，无 API key 时使用智能关键词回复
 */

// 产品知识库（用于智能回复）
const KNOWLEDGE_BASE = {
  '月光之泪项链': '月光之泪项链是我们最受欢迎的珠宝单品之一，采用18K白金镶嵌天然月光石，展现柔和优雅的光泽。价格 ¥12,800，目前有新品优惠。',
  '金玫瑰耳环': '金玫瑰耳环采用18K玫瑰金镶嵌钻石，设计精致优雅，价格 ¥8,600，是我们的畅销单品。',
  '翡翠花园戒指': '翡翠花园戒指采用天然翡翠配以钻石环绕，奢华典雅，价格 ¥22,500。',
  '珍珠手链': '珍珠手链采用南海珍珠配以钻石扣，温润典雅，价格 ¥6,800，目前有新品优惠。',
  '黑夜absolute': '黑夜Absolute是一款深邃神秘的东方调香水，黑琥珀与沉香的完美融合，价格 ¥3,200。',
  '天穹玫瑰': '天穹玫瑰是一款清新花香调香水，保加利亚玫瑰与柑橘的轻盈交织，价格 ¥2,800。',
  '神圣之木': '神圣之木是一款木质调香水，檀香与雪松的宁静力量，价格 ¥3,500。',
  '菱格纹托特包': '菱格纹托特包采用经典菱格纹设计，小牛皮材质，优雅实用，价格 ¥18,500。',
  '编织链条包': '编织链条包采用精致编织皮革，金属链条装饰，时尚与经典的融合，价格 ¥12,800。',
};

// 智能关键词回复（无 AI API 时的后备方案）
function getSmartReply(message) {
  const msg = message.toLowerCase();

  // 问候
  if (msg.match(/你好|您好|hi|hello|嗨|hey/)) {
    return '您好！欢迎咨询 ÉCLAT 奢侈品专柜，我是您的专属 AI 客服。请问有什么可以帮您？';
  }

  // 产品咨询
  if (msg.match(/推荐|推荐一下|有什么好|哪个好/)) {
    return '为您推荐我们的几款明星单品：\n\n1. 月光之泪项链 — 新品，18K白金镶嵌月光石，¥12,800\n2. 黑夜Absolute 香水 — 畅销，东方调，¥3,200\n3. 菱格纹托特包 — 经典设计，¥18,500\n\n您对哪款感兴趣？我可以详细介绍。';
  }

  // 价格咨询
  if (msg.match(/价格|多少钱|贵吗|便宜|优惠|折扣/)) {
    return '我们的价格充分体现了工艺与品质：\n\n珠宝系列：¥6,800 - ¥22,500\n香水系列：¥2,800 - ¥3,500\n包包系列：¥12,800 - ¥18,500\n\n目前新品和畅销单品均有优惠，详情请咨询我具体单品。';
  }

  // 材质/工艺咨询
  if (msg.match(/材质|材料|18k|白金|玫瑰金|钻石|翡翠|珍珠/)) {
    return 'ÉCLAT 所有产品均采用顶级材质：\n\n• 珠宝：18K白金/玫瑰金，天然宝石（月光石、翡翠等），高品质钻石\n• 香水：法国格拉斯原产香料，天然成分\n• 包包：意大利进口小牛皮，手工缝制\n\n每一件产品都附有材质鉴定证书。';
  }

  // 物流/配送
  if (msg.match(/配送|物流|发货|快递|多久|什么时候到/)) {
    return 'ÉCLAT 提供尊享配送服务：\n\n• 标准配送：3-5个工作日，免运费\n• 加急配送：1-2个工作日，¥50\n• 港澳台及海外：7-14个工作日\n\n所有订单均有精美包装，支持实时物流追踪。';
  }

  // 退换货
  if (msg.match(/退换|退货|退款|换货|售后/)) {
    return 'ÉCLAT 提供完善的售后服务：\n\n• 7天无理由退换（未使用、原包装完整）\n• 30天质量问题免费换新\n• 终身免费保养清洗（珠宝类）\n\n退换货请联系客服，我们会安排上门取件。';
  }

  // 正品保证
  if (msg.match(/正品|真假|保证|证书|鉴定/)) {
    return 'ÉCLAT 承诺100%正品保证：\n\n• 每件产品均附品牌鉴定证书\n• 支持第三方权威机构复检\n• 珠宝类产品附GIA/NGTC证书\n• 香水为品牌直供，拒绝分装\n\n购买后可扫描产品二维码验证真伪。';
  }

  // 香水咨询
  if (msg.match(/香水|香调|味道|气味/)) {
    return 'ÉCLAT 香水系列：\n\n1. 黑夜Absolute — 东方调，黑琥珀+沉香，深邃神秘，¥3,200\n2. 天穹玫瑰 — 花香调，保加利亚玫瑰+柑橘，清新优雅，¥2,800\n3. 神圣之木 — 木质调，檀香+雪松，宁静力量，¥3,500\n\n您偏好哪种香调？我可以为您推荐。';
  }

  // 包包咨询
  if (msg.match(/包|包包|手提包|托特|链条/)) {
    return 'ÉCLAT 包包系列：\n\n1. 菱格纹托特包 — 经典设计，小牛皮，¥18,500\n2. 编织链条包 — 时尚经典，编织皮革+金属链条，¥12,800\n\n两款均有多种颜色可选，支持到店体验。';
  }

  // 珠宝咨询
  if (msg.match(/珠宝|项链|耳环|戒指|手链|首饰/)) {
    return 'ÉCLAT 珠宝系列：\n\n1. 月光之泪项链 — 18K白金+月光石，¥12,800（新品）\n2. 金玫瑰耳环 — 18K玫瑰金+钻石，¥8,600（畅销）\n3. 翡翠花园戒指 — 天然翡翠+钻石，¥22,500\n4. 珍珠手链 — 南海珍珠+钻石扣，¥6,800（新品）\n\n所有珠宝均支持刻字定制服务。';
  }

  // 会员/积分
  if (msg.match(/会员|积分|优惠|活动|vip/)) {
    return 'ÉCLAT 会员尊享权益：\n\n• 银卡会员：消费积分1:1，生日专属优惠\n• 金卡会员：消费积分1:1.5，专属客服，免费保养\n• 黑卡会员：消费积分1:2，私人造型顾问，新品优先体验\n\n注册即送500积分，可用于抵扣现金。';
  }

  // 定制服务
  if (msg.match(/定制|刻字|个性化|专属/)) {
    return 'ÉCLAT 提供个性化定制服务：\n\n• 珠宝刻字：免费（3-5个工作日）\n• 珠宝设计：根据您的需求定制，¥5,000起\n• 香水调香：与调香师一对一，打造专属香氛，¥8,800\n• 包包刻字：免费（真皮烫金）\n\n详情可预约到店咨询。';
  }

  // 联系方式/人工客服
  if (msg.match(/人工|客服电话|联系|电话|微信|邮箱/)) {
    return '您可以通过以下方式联系我们：\n\n• 客服热线：400-888-9999（9:00-21:00）\n• 微信客服：搜索"ÉCLAT奢侈品专柜"\n• 邮箱：service@eclat-luxury.com\n• 在线人工客服：点击页面右下角"人工客服"按钮\n\n人工客服工作时间为工作日 9:00-18:00。';
  }

  // 品牌介绍
  if (msg.match(/品牌|关于|介绍|故事/)) {
    return 'ÉCLAT 诞生于对极致美学的追求。我们相信，真正的奢华不只是价格标签，而是每一件物品背后沉淀的工艺哲学与情感共鸣。\n\n从巴黎顶级珠宝工坊，到日本调香大师的私藏香料；从意大利手工皮艺，到当代设计师的先锋创作——ÉCLAT 为您跨越地域，汇聚世界各地的精致之物。';
  }

  // 感谢
  if (msg.match(/谢谢|感谢|thanks|thank you/)) {
    return '不客气！很高兴为您服务。如果还有其他问题，随时告诉我。祝您购物愉快！✨';
  }

  // 默认回复
  return '感谢您的咨询！我是 ÉCLAT AI 客服，可以帮您解答关于产品、价格、配送、售后等问题。\n\n您也可以输入以下关键词快速获取信息：\n• "产品推荐" — 查看明星单品\n• "价格" — 了解产品价格\n• "配送" — 查看物流信息\n• "售后" — 了解退换货政策\n• "人工客服" — 转接人工服务';
}

// 调用 AI API（OpenAI 兼容格式）
async function callAIAPI(message, history = []) {
  const apiKey = globalThis.AI_API_KEY || '';
  const apiUrl = globalThis.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = globalThis.AI_MODEL || 'gpt-3.5-turbo';

  if (!apiKey) {
    return null; // 无 API key，使用智能回复
  }

  const systemPrompt = `你是 ÉCLAT 奢侈品专柜的 AI 客服助手。ÉCLAT 是一个高端奢侈品品牌，主要销售珠宝、香水和包包。

品牌产品：
- 珠宝：月光之泪项链(¥12,800)、金玫瑰耳环(¥8,600)、翡翠花园戒指(¥22,500)、珍珠手链(¥6,800)
- 香水：黑夜Absolute(¥3,200)、天穹玫瑰(¥2,800)、神圣之木(¥3,500)
- 包包：菱格纹托特包(¥18,500)、编织链条包(¥12,800)

回复要求：
1. 语气优雅、专业、有礼貌
2. 适当使用 emoji 增加亲和力（✨💎🌹等）
3. 回答简洁有力，不超过150字
4. 涉及价格时使用 ¥ 符号
5. 如果客户咨询的产品不在列表中，礼貌地介绍类似产品
6. 适时引导客户了解更多产品或联系人工客服`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6), // 保留最近6条历史
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 300,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      console.error('AI API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI API call failed:', error);
    return null;
  }
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: '只支持 POST 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handlePost(context);
}

async function handlePost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        message: '请输入有效消息'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 尝试调用 AI API
    let reply = await callAIAPI(message, history);

    // AI API 不可用，使用智能关键词回复
    if (!reply) {
      reply = getSmartReply(message);
    }

    return new Response(JSON.stringify({
      success: true,
      reply,
      timestamp: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('AI chat API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '服务暂时不可用，请稍后再试或联系人工客服。',
      reply: '抱歉，系统暂时出现问题。您可以拨打客服热线 400-888-9999，或稍后再试。给您带来不便，敬请谅解。'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理 OPTIONS 预检请求
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
