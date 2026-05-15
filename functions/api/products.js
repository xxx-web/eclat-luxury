/**
 * ÉCLAT 产品 API - Edge Function
 * 支持产品列表查询、详情查询、筛选、分页
 */

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
    slug: 'aurora-diamond-necklace'
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
    slug: 'midnight-rose-perfume'
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
    slug: 'silk-road-handbag'
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
    slug: 'moonlight-earrings'
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
    slug: 'cloud-breeze-perfume'
  },
  {
    id: 6,
    category: 'handbag',
    name: '暮光手袋',
    price: 22800,
    desc: '日暮时分的颜色，一个包装载了一整天的光影',
    details: '鳄鱼纹小牛皮，尺寸32×22×14cm，搭扣镶嵌0.1克拉钻石',
    img: 'https://images.unsplash.com/photo-1606503158388-9f7eCAMB8?w=600&h=600&fit=crop',
    tag: '臻选',
    rating: 4.8,
    slug: 'twilight-handbag'
  }
];

/**
 * GET /api/products - 获取产品列表
 * 查询参数:
 *   - category: 筛选类别
 *   - sort: 排序方式 (price-asc, price-desc, rating)
 *   - page: 页码
 *   - perPage: 每页数量
 */
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const sort = url.searchParams.get('sort');
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '12');
  
  // 从 KV 获取浏览次数
  let productsWithViews = [...PRODUCTS];
  if (context.env.ECAT_KV) {
    for (const product of productsWithViews) {
      const viewsData = await context.env.ECAT_KV.get(`product:views:${product.id}`);
      product.views = viewsData ? parseInt(viewsData) : Math.floor(Math.random() * 100) + 50;
    }
  }
  
  // 筛选
  let filtered = category 
    ? productsWithViews.filter(p => p.category === category)
    : productsWithViews;
  
  // 排序
  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }
  
  // 分页
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);
  
  return new Response(JSON.stringify({
    products: paginated,
    pagination: { page, perPage, total, totalPages }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60', // 缓存 60 秒
      'ETag': `"products-${page}-${perPage}"`
    }
  });
}

/**
 * POST /api/products/:id/view - 增加产品浏览次数
 */
export async function onRequestPost(context) {
  const { env, params } = context;
  const productId = params?.id || context.url.pathname.split('/').pop();
  
  if (!productId) {
    return new Response(JSON.stringify({ error: 'Missing product ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 增加浏览次数
  const viewsKey = `product:views:${productId}`;
  const currentViews = await env.ECAT_KV.get(viewsKey);
  const newViews = currentViews ? parseInt(currentViews) + 1 : 1;
  
  await env.ECAT_KV.put(viewsKey, newViews.toString());
  
  return new Response(JSON.stringify({ 
    success: true, 
    views: newViews 
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * GET /api/products/:slug - 获取单个产品详情
 */
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  // 查找产品
  const product = PRODUCTS.find(p => p.slug === slug);
  
  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 获取浏览次数
  if (context.env.ECAT_KV) {
    const viewsData = await context.env.ECAT_KV.get(`product:views:${product.id}`);
    product.views = viewsData ? parseInt(viewsData) : 0;
  }
  
  // 获取相关产品（同类别，排除自己）
  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  
  return new Response(JSON.stringify({
    product,
    related
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // 缓存 5 分钟
    }
  });
}
