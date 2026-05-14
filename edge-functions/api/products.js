/**
 * EdgeOne Edge Function - 产品列表 API
 * 支持筛选、排序、分页
 */

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      message: '只支持 GET 请求'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handleGet(context);
}

async function handleGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    // 解析查询参数
    const category = url.searchParams.get('category');
    const sort = url.searchParams.get('sort') || 'default';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const search = url.searchParams.get('search');

    // 从 KV 获取所有产品（如果 KV 未绑定，使用默认数据）
    let products = [];
    try {
      if (env.PRODUCTS_KV) {
        const productsData = await env.PRODUCTS_KV.get('products');
        if (productsData) {
          products = JSON.parse(productsData);
        }
      }
    } catch (kvError) {
      console.error('KV read error:', kvError);
    }

    // 如果 KV 中没有数据，使用默认产品数据
    if (products.length === 0) {
      products = [
        {
          id: 'yueguang',
          name: '月光之泪项链',
          category: 'jewelry',
          price: 12800,
          originalPrice: 15800,
          rating: 4.9,
          reviews: 128,
          description: '18K 白金镶嵌月光石，展现柔和优雅的光泽',
          img: 'static/images/yueguang.png',
          isNew: true,
          isBestseller: false
        },
        {
          id: 'gold_rose_earring',
          name: '金玫瑰耳环',
          category: 'jewelry',
          price: 8600,
          originalPrice: null,
          rating: 4.8,
          reviews: 96,
          description: '18K 玫瑰金镶嵌钻石，精致优雅',
          img: 'static/images/gold_rose_earring.png',
          isNew: false,
          isBestseller: true
        },
        {
          id: 'emerald_ring',
          name: '翡翠花园戒指',
          category: 'jewelry',
          price: 22500,
          originalPrice: 26800,
          rating: 4.9,
          reviews: 75,
          description: '天然翡翠配以钻石环绕，奢华典雅',
          img: 'static/images/emerald_ring.png',
          isNew: false,
          isBestseller: false
        },
        {
          id: 'pearl_bracelet',
          name: '珍珠手链',
          category: 'jewelry',
          price: 6800,
          originalPrice: 7800,
          rating: 4.7,
          reviews: 112,
          description: '南海珍珠配以钻石扣，温润典雅',
          img: 'static/images/pearl_bracelet.png',
          isNew: true,
          isBestseller: false
        },
        {
          id: 'noir_absolu_perfume',
          name: '黑夜Absolute',
          category: 'perfume',
          price: 3200,
          originalPrice: null,
          rating: 4.9,
          reviews: 256,
          description: '深邃神秘的东方调香水，黑琥珀与沉香的完美融合',
          img: 'static/images/noir_absolu_perfume.png',
          isNew: false,
          isBestseller: true
        },
        {
          id: 'rose_celeste_perfume',
          name: '天穹玫瑰',
          category: 'perfume',
          price: 2800,
          originalPrice: 3200,
          rating: 4.8,
          reviews: 189,
          description: '清新花香调，保加利亚玫瑰与柑橘的轻盈交织',
          img: 'static/images/rose_celeste_perfume.png',
          isNew: true,
          isBestseller: false
        },
        {
          id: 'bois_sacre_perfume',
          name: '神圣之木',
          category: 'perfume',
          price: 3500,
          originalPrice: null,
          rating: 4.7,
          reviews: 145,
          description: '木质调香水，檀香与雪松的宁静力量',
          img: 'static/images/bois_sacre_perfume.png',
          isNew: false,
          isBestseller: false
        },
        {
          id: 'quilted_tote_bag',
          name: '菱格纹托特包',
          category: 'bag',
          price: 18500,
          originalPrice: 22000,
          rating: 4.8,
          reviews: 89,
          description: '经典菱格纹设计，小牛皮质地，优雅实用',
          img: 'static/images/quilted_tote_bag.png',
          isNew: false,
          isBestseller: true
        },
        {
          id: 'woven_chain_bag',
          name: '编织链条包',
          category: 'bag',
          price: 12800,
          originalPrice: 15000,
          rating: 4.7,
          reviews: 67,
          description: '精致编织皮革，金属链条装饰，时尚与经典的融合',
          img: 'static/images/woven_chain_bag.png',
          isNew: true,
          isBestseller: false
        }
      ];
    }

    // 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // 分类筛选
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // 排序
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // 默认排序：新品优先，然后按评分
        products.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.rating - a.rating;
        });
    }

    // 分页
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return new Response(JSON.stringify({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    console.error('Products API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '获取产品列表失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
