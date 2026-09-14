/**
 * ÉCLAT 前后端共用数据契约
 *
 * 这是产品数据的「单一真相源」类型定义。前端 TS 直接 import 使用；
 * 后端 Edge Function（纯 JS）运行时无法 import .ts，但须保持相同字段形状，
 * 图片统一使用 `/images/<file>.png`（对应 public/images/ 目录）。
 */

export type ProductCategoryCode = 'jewelry' | 'perfume' | 'bag' | 'watch' | 'accessory';

export interface Product {
  id: string;
  name: string;
  /** 后端用分类 code（jewelry/perfume/bag...），前端展示用 PRODUCT_CATEGORIES 映射 */
  category: string;
  price: number;
  /** 原价，可空（无折扣时为 null） */
  originalPrice?: number | null;
  rating: number;
  /** 统一以 /images/ 开头，指向 public/images/ */
  img: string;
  /** 兼容部分接口返回 image 字段 */
  image?: string;
  desc?: string;
  description?: string;
  tag?: string;
  reviews?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  slug?: string;
  details?: string;
  material?: string;
  views?: number;
  /** AI 推荐系统附加字段 */
  recommendationReason?: string;
  similarityScore?: number;
}

/** 分类 code -> 中文展示名（前端筛选/展示使用） */
export const PRODUCT_CATEGORIES: Record<string, string> = {
  jewelry: '珠宝臻品',
  perfume: '香水雅韵',
  bag: '奢华手袋',
  watch: '腕间时计',
  accessory: '精致配饰',
};

/** 图片基础路径：所有产品图放置于 public/images/ 下 */
export const PRODUCT_IMAGE_BASE = '/images';
