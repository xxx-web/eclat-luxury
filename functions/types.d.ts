/**
 * ÉCLAT Edge Functions 类型定义
 */

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
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful?: number;
  notHelpful?: number;
}

export interface UserBehavior {
  userId: string;
  views: Array<{ productId: number; timestamp: number }>;
  likes: number[];
  purchases: number[];
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

export interface RecommendationRequest {
  userId?: string;
  productId?: number;
  limit?: number;
}

// EdgeOne KV Storage 类型
export interface KVStorage {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
}

// EdgeOne Context 类型
export interface EdgeContext {
  request: Request;
  env: {
    ECAT_KV: KVStorage;
    [key: string]: any;
  };
  params?: Record<string, string>;
}
