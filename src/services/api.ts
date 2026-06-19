/**
 * ÉCLAT API 服务层
 * 统一封装所有 API 调用
 */

const API_BASE = '/api';
const TIMEOUT_MS = 10000; // 10秒超时

// 通用超时处理函数
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ==================== 类型定义 ====================

export interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  desc: string;
  details: string;
  img: string;
  tag: string;
  rating: number;
  slug?: string;
  material?: string;
  image?: string;
  views?: number;
  recommendationReason?: string;
  similarityScore?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful?: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  category?: string;
  sort?: 'price-asc' | 'price-desc' | 'rating';
}

export interface PaginationResult {
  products: Product[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface UserBehavior {
  userId: string;
  views: Array<{ productId: number; timestamp: number }>;
  likes: number[];
  purchases: number[];
}

export interface RecommendationRequest {
  userId?: string;
  productId?: number;
  limit?: number;
}

// ==================== 产品 API ====================

/**
 * 获取产品列表
 */
export async function fetchProducts(params?: PaginationParams): Promise<PaginationResult> {
  const url = new URL(`${API_BASE}/products`, window.location.origin);
  
  if (params?.page) url.searchParams.set('page', params.page.toString());
  if (params?.perPage) url.searchParams.set('perPage', params.perPage.toString());
  if (params?.category) url.searchParams.set('category', params.category);
  if (params?.sort) url.searchParams.set('sort', params.sort);
  
  const response = await fetchWithTimeout(url.toString(), {
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 获取单个产品详情
 */
export async function fetchProduct(slug: string): Promise<Product> {
  const response = await fetchWithTimeout(`${API_BASE}/products/${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 获取推荐产品
 */
export async function fetchRecommendations(request: RecommendationRequest): Promise<Product[]> {
  const url = new URL(`${API_BASE}/recommendations`, window.location.origin);
  
  if (request.userId) url.searchParams.set('userId', request.userId);
  if (request.productId) url.searchParams.set('productId', request.productId.toString());
  if (request.limit) url.searchParams.set('limit', request.limit.toString());
  
  const response = await fetchWithTimeout(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }
  
  return response.json();
}

// ==================== 评论 API ====================

/**
 * 获取产品评论
 */
export async function fetchReviews(productId: string): Promise<Review[]> {
  const response = await fetchWithTimeout(`${API_BASE}/reviews?productId=${productId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 提交评论
 */
export async function submitReview(
  productId: string,
  review: { author: string; rating: number; text: string }
): Promise<Review> {
  const response = await fetchWithTimeout(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      ...review
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit review');
  }
  
  const result = await response.json();
  return result.review;
}

// ==================== 订阅 API ====================

/**
 * 邮件订阅
 */
export async function subscribe(email: string): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithTimeout(`${API_BASE}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Subscription failed');
  }
  
  return response.json();
}

// ==================== 用户行为追踪 API ====================

/**
 * 追踪用户行为
 */
export async function trackUserBehavior(data: {
  userId: string;
  productId: number;
  action: 'view' | 'like' | 'purchase';
  timestamp?: number;
}): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE}/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      timestamp: data.timestamp || Date.now()
    })
  });
  
  if (!response.ok) {
    console.error('Failed to track user behavior');
    // 不抛出错误，避免影响用户体验
  }
}

/**
 * 获取用户行为数据
 */
export async function fetchUserBehavior(userId: string): Promise<UserBehavior> {
  const response = await fetchWithTimeout(`${API_BASE}/track?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user behavior: ${response.statusText}`);
  }
  
  return response.json();
}

// ==================== 工具函数 ====================

/**
 * 处理 API 错误
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * 生成唯一用户 ID
 */
export function getUserId(): string {
  let userId = localStorage.getItem('eclat_user_id');
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('eclat_user_id', userId);
  }
  
  return userId;
}
