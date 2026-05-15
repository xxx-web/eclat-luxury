/**
 * ÉCLAT AI 推荐系统 - Edge Function
 * 实现混合推荐算法（基于内容 + 协同过滤）
 * 使用 EdgeOne KV Storage 存储用户行为和产品相似度
 */

// 产品数据库（与 products.js 同步）
const PRODUCTS = [
  {
    id: 1,
    category: 'jewelry',
    name: '极光钻石项链',
    price: 26800,
    desc: '18K白金镶嵌0.5克拉极光钻石，源自巴黎珠宝工坊',
    details: '18K白金，0.5克拉D色VS1净度钻石，链长42cm可调节',
    img: 'https://images.unsplash.com/photo-1515562141207-7a6fc380d658?w=600&h=600&fit=crop',
    tag: '独家',
    rating: 4.9,
    slug: 'aurora-diamond-necklace',
    materials: ['diamond', 'white-gold', '18k-gold'],
    priceRange: 'high'
  },
  {
    id: 2,
    category: 'perfume',
    name: '午夜玫瑰香水',
    price: 3200,
    desc: '由日本调香师亲手调制，前调是清晨玫瑰园的第一滴露',
    details: '50ml EDT，前调：保加利亚玫瑰、柠檬；中调：鸢尾、茉莉；后调：麝香、琥珀',
    img: 'https://images.unsplash.com/photo-1541643600914-77c13a81a789?w=600&h=600&fit=crop',
    tag: '新品',
    rating: 4.8,
    slug: 'midnight-rose-perfume',
    materials: ['rose', 'musk', 'amber'],
    priceRange: 'mid'
  },
  {
    id: 3,
    category: 'handbag',
    name: '丝路手袋',
    price: 19800,
    desc: '意大利皮具匠人手工缝制，每一针都是时间的艺术',
    details: '小牛皮，尺寸28×18×12cm，内衬丝绸，配可调节肩带',
    img: 'https://images.unsplash.com/photo-1584917865442-de05f8112a99?w=600&h=600&fit=crop',
    tag: '匠人系列',
    rating: 4.7,
    slug: 'silk-road-handbag',
    materials: ['leather', 'silk', 'gold-hardware'],
    priceRange: 'high'
  },
  {
    id: 4,
    category: 'jewelry',
    name: '月见耳环',
    price: 12800,
    desc: '灵感源自中秋满月，珍珠与钻石的对话',
    details: '18K黄金，日本Akoya珍珠，0.2克拉钻石，直径15mm',
    img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
    tag: '限定',
    rating: 5.0,
    slug: 'moonlight-earrings',
    materials: ['pearl', 'diamond', 'gold'],
    priceRange: 'mid'
  },
  {
    id: 5,
    category: 'perfume',
    name: '云端淡香水',
    price: 2800,
    desc: '像是把一朵云戴在身上，轻盈、透明、不可捉摸',
    details: '75ml EDC，前调：佛手柑、白茶；中调：铃兰、水仙；后调：白麝香、苔藓',
    img: 'https://images.unsplash.com/photo-1506259091721-347e5ac394a9?w=600&h=600&fit=crop',
    tag: '经典',
    rating: 4.6,
    slug: 'cloud-breeze-perfume',
    materials: ['bergamot', 'lily-of-the-valley', 'white-musk'],
    priceRange: 'mid'
  },
  {
    id: 6,
    category: 'handbag',
    name: '暮光手袋',
    price: 22800,
    desc: '日暮时分的颜色，一个包装载了一整天的光影',
    details: '鳄鱼纹小牛皮，尺寸32×22×14cm，搭扣镶嵌0.1克拉钻石',
    img: 'https://images.unsplash.com/photo-1606503158388-9f7ecAMB8?w=600&h=600&fit=crop',
    tag: '臻选',
    rating: 4.8,
    slug: 'twilight-handbag',
    materials: ['leather', 'diamond', 'gold-hardware'],
    priceRange: 'high'
  }
];

/**
 * 计算两个产品的相似度（基于内容的推荐）
 * 返回 0-1 之间的相似度分数
 */
function calculateContentSimilarity(product1, product2) {
  let score = 0;
  let totalWeight = 0;
  
  // 类别相似度（权重：40%）
  if (product1.category === product2.category) {
    score += 0.4;
  }
  totalWeight += 0.4;
  
  // 材质相似度（权重：30%）
  const sharedMaterials = product1.materials.filter(m => 
    product2.materials.some(m2 => m2 === m || m2.includes(m) || m.includes(m2))
  );
  const materialSimilarity = sharedMaterials.length / 
    Math.max(product1.materials.length, product2.materials.length);
  score += materialSimilarity * 0.3;
  totalWeight += 0.3;
  
  // 价格区间相似度（权重：20%）
  if (product1.priceRange === product2.priceRange) {
    score += 0.2;
  } else if (
    (product1.priceRange === 'high' && product2.priceRange === 'mid') ||
    (product1.priceRange === 'mid' && product2.priceRange === 'high') ||
    (product1.priceRange === 'mid' && product2.priceRange === 'low') ||
    (product1.priceRange === 'low' && product2.priceRange === 'mid')
  ) {
    score += 0.1; // 相邻价格区间给一半分数
  }
  totalWeight += 0.2;
  
  // 评分相似度（权重：10%）
  const ratingDiff = Math.abs(product1.rating - product2.rating);
  const ratingSimilarity = 1 - (ratingDiff / 5); // 评分差异越小越相似
  score += ratingSimilarity * 0.1;
  totalWeight += 0.1;
  
  // 归一化分数
  return totalWeight > 0 ? score / totalWeight : 0;
}

/**
 * 基于内容的推荐
 */
function getContentBasedRecommendations(currentProductId, allProducts, limit = 6) {
  const currentProduct = allProducts.find(p => p.id === currentProductId);
  
  if (!currentProduct) {
    return [];
  }
  
  // 计算与所有其他产品的相似度
  const similarities = allProducts
    .filter(p => p.id !== currentProductId)
    .map(p => ({
      product: p,
      similarity: calculateContentSimilarity(currentProduct, p)
    }))
    .filter(s => s.similarity > 0.3) // 只保留相似度 > 0.3 的产品
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  return similarities.map(s => ({
    ...s.product,
    recommendationReason: `Similar in ${getSimilarityReason(s.similarity)}`,
    similarityScore: s.similarity
  }));
}

/**
 * 获取相似度原因（用于解释推荐）
 */
function getSimilarityReason(similarity) {
  if (similarity >= 0.7) return 'style and materials';
  if (similarity >= 0.5) return 'category and quality';
  return 'related products you might like';
}

/**
 * 协同过滤推荐（简化版）
 * 基于用户行为数据找到相似用户，推荐他们喜欢的产品
 */
async function getCollaborativeRecommendations(userId, env, allProducts, limit = 6) {
  if (!userId || !env.ECAT_KV) {
    return [];
  }
  
  try {
    // 获取当前用户的行为数据
    const userBehaviorData = await env.ECAT_KV.get(`user:behavior:${userId}`);
    
    if (!userBehaviorData) {
      return []; // 新用户，没有行为数据
    }
    
    const userBehavior = JSON.parse(userBehaviorData);
    
    // 获取所有用户列表（从 KV 中）
    const usersListData = await env.ECAT_KV.list({ prefix: 'user:behavior:' });
    
    if (!usersListData || usersListData.keys.length < 2) {
      return []; // 没有其他用户数据，无法进行协同过滤
    }
    
    // 计算与其他用户的相似度（基于共同喜欢的产品）
    const userSimilarities = [];
    
    for (const key of usersListData.keys) {
      const otherUserId = key.name.replace('user:behavior:', '');
      
      if (otherUserId === userId) continue;
      
      const otherBehaviorData = await env.ECAT_KV.get(key.name);
      if (!otherBehaviorData) continue;
      
      const otherBehavior = JSON.parse(otherBehaviorData);
      
      // 计算用户相似度（基于共同喜欢的产品）
      const sharedLikes = userBehavior.likes.filter(id => 
        otherBehavior.likes.includes(id)
      );
      
      if (sharedLikes.length > 0) {
        const similarity = sharedLikes.length / 
          Math.max(userBehavior.likes.length, otherBehavior.likes.length);
        
        if (similarity > 0.2) { // 相似度阈值
          userSimilarities.push({
            userId: otherUserId,
            similarity,
            likes: otherBehavior.likes
          });
        }
      }
    }
    
    // 按相似度排序，取前 5 个相似用户
    userSimilarities.sort((a, b) => b.similarity - a.similarity);
    const topSimilarUsers = userSimilarities.slice(0, 5);
    
    // 收集相似用户喜欢但当前用户还没喜欢的产品
    const recommendations = new Map();
    
    for (const similarUser of topSimilarUsers) {
      for (const productId of similarUser.likes) {
        if (!userBehavior.likes.includes(productId)) {
          const count = recommendations.get(productId) || 0;
          recommendations.set(productId, count + similarUser.similarity);
        }
      }
    }
    
    // 按推荐分数排序
    const sortedRecommendations = Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => {
        const product = allProducts.find(p => p.id === entry[0]);
        return product ? {
          ...product,
          recommendationReason: 'Customers like you also liked',
          similarityScore: entry[1]
        } : null;
      })
      .filter(p => p !== null);
    
    return sortedRecommendations;
    
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return []; // 出错时返回空数组
  }
}

/**
 * 混合推荐（结合基于内容和协同过滤）
 */
async function getHybridRecommendations(userId, currentProductId, env, allProducts, limit = 6) {
  const contentBased = currentProductId 
    ? getContentBasedRecommendations(currentProductId, allProducts, Math.ceil(limit / 2))
    : [];
  
  const collaborative = userId 
    ? await getCollaborativeRecommendations(userId, env, allProducts, Math.ceil(limit / 2))
    : [];
  
  // 合并推荐结果（去重）
  const seenIds = new Set();
  const hybrid = [];
  
  // 优先添加协同过滤推荐（更个性化）
  for (const product of collaborative) {
    if (!seenIds.has(product.id)) {
      seenIds.add(product.id);
      hybrid.push(product);
    }
  }
  
  // 然后添加基于内容的推荐
  for (const product of contentBased) {
    if (!seenIds.has(product.id)) {
      seenIds.add(product.id);
      hybrid.push(product);
    }
  }
  
  return hybrid.slice(0, limit);
}

/**
 * GET /api/recommendations
 * 获取推荐产品
 * 
 * 查询参数:
 *   - userId: 用户 ID（用于协同过滤）
 *   - productId: 当前产品 ID（用于基于内容的推荐）
 *   - limit: 返回数量（默认 6）
 *   - type: 推荐类型 (content|collaborative|hybrid) 默认 hybrid
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const userId = url.searchParams.get('userId');
  const productId = url.searchParams.get('productId');
  const limit = parseInt(url.searchParams.get('limit') || '6');
  const type = url.searchParams.get('type') || 'hybrid';
  
  try {
    let recommendations = [];
    
    // 根据推荐类型选择算法
    switch (type) {
      case 'content':
        // 纯基于内容的推荐
        if (productId) {
          recommendations = getContentBasedRecommendations(
            parseInt(productId), 
            PRODUCTS, 
            limit
          );
        }
        break;
        
      case 'collaborative':
        // 纯协同过滤推荐
        if (userId) {
          recommendations = await getCollaborativeRecommendations(
            userId, 
            env, 
            PRODUCTS, 
            limit
          );
        }
        break;
        
      case 'hybrid':
      default:
        // 混合推荐（默认）
        recommendations = await getHybridRecommendations(
          userId,
          productId ? parseInt(productId) : null,
          env,
          PRODUCTS,
          limit
        );
        break;
    }
    
    // 如果没有推荐结果，返回热门产品（按评分排序）
    if (recommendations.length === 0) {
      recommendations = PRODUCTS
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit)
        .map(p => ({
          ...p,
          recommendationReason: 'Popular choice',
          similarityScore: p.rating / 5
        }));
    }
    
    return new Response(JSON.stringify({
      success: true,
      recommendations,
      meta: {
        type,
        userId: userId || null,
        productId: productId || null,
        count: recommendations.length
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300' // 缓存 5 分钟
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/recommendations/feedback
 * 记录推荐反馈（用于改进推荐算法）
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { userId, productId, recommendationType, clicked, purchased } = body;
    
    if (!userId || !productId) {
      return new Response(JSON.stringify({ error: 'Missing userId or productId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 存储推荐反馈到 KV
    const feedbackKey = `recommendation:feedback:${userId}`;
    const feedbackData = await env.ECAT_KV.get(feedbackKey);
    const feedback = feedbackData ? JSON.parse(feedbackData) : [];
    
    feedback.push({
      productId,
      recommendationType,
      clicked: clicked || false,
      purchased: purchased || false,
      timestamp: Date.now()
    });
    
    // 只保留最近 100 条反馈
    if (feedback.length > 100) {
      feedback.splice(0, feedback.length - 100);
    }
    
    await env.ECAT_KV.put(feedbackKey, JSON.stringify(feedback));
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Feedback recorded'
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
