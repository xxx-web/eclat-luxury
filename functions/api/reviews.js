/**
 * ÉCLAT 评论 API - Edge Function
 * 使用 EdgeOne KV Storage 持久化存储评论
 * 支持分页、投票功能
 */

/**
 * GET /api/reviews?productId=<id>&page=1&perPage=10
 * 获取产品评论，支持分页
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '10');
  
  if (!productId) {
    return new Response(JSON.stringify({ error: 'Missing productId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 从 KV 存储读取评论
  const reviewsKey = `reviews:${productId}`;
  const reviewsData = await env.ECAT_KV.get(reviewsKey);
  let reviews = reviewsData ? JSON.parse(reviewsData) : [];
  
  // 计算平均评分
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  
  // 评分分布
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };
  
  // 分页
  const total = reviews.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const paginated = reviews.slice(start, start + perPage);
  
  return new Response(JSON.stringify({
    reviews: paginated,
    pagination: { page, perPage, total, totalPages },
    stats: {
      averageRating: parseFloat(averageRating),
      totalReviews: total,
      ratingDistribution
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * POST /api/reviews
 * 提交新评论
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { productId, author, rating, text } = body;
    
    // 输入验证
    if (!productId || !author || !rating || !text) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (text.length < 10 || text.length > 500) {
      return new Response(JSON.stringify({ error: 'Review text must be between 10 and 500 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 创建新评论
    const newReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      author: author.trim(),
      rating: parseInt(rating),
      text: text.trim(),
      date: new Date().toLocaleDateString('zh-CN'),
      helpful: 0,
      notHelpful: 0,
      createdAt: Date.now()
    };
    
    // 从 KV 读取现有评论
    const reviewsKey = `reviews:${productId}`;
    const reviewsData = await env.ECAT_KV.get(reviewsKey);
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];
    
    // 添加新评论（最新在前）
    reviews.unshift(newReview);
    
    // 保存回 KV
    await env.ECAT_KV.put(reviewsKey, JSON.stringify(reviews));
    
    return new Response(JSON.stringify({ 
      success: true, 
      review: newReview,
      message: 'Review submitted successfully'
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
 * POST /api/reviews/vote
 * 评论投票（有帮助/没帮助）
 */
export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { productId, reviewId, vote } = body;
    
    if (!productId || !reviewId || !['helpful', 'notHelpful'].includes(vote)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 读取评论
    const reviewsKey = `reviews:${productId}`;
    const reviewsData = await env.ECAT_KV.get(reviewsKey);
    
    if (!reviewsData) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const reviews = JSON.parse(reviewsData);
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 更新投票数
    if (vote === 'helpful') {
      reviews[reviewIndex].helpful = (reviews[reviewIndex].helpful || 0) + 1;
    } else {
      reviews[reviewIndex].notHelpful = (reviews[reviewIndex].notHelpful || 0) + 1;
    }
    
    // 保存
    await env.ECAT_KV.put(reviewsKey, JSON.stringify(reviews));
    
    return new Response(JSON.stringify({ 
      success: true,
      review: reviews[reviewIndex]
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
