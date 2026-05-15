/**
 * 产品状态管理 Context
 * 管理产品列表、缓存和筛选
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product, PaginationParams, PaginationResult } from '../services/api';
import { fetchProducts } from '../services/api';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginationResult['pagination'] | null;
  fetchProductsList: (params?: PaginationParams) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationResult['pagination'] | null>(null);

  const fetchProductsList = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchProducts(params);
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductBySlug = useCallback((slug: string) => {
    return products.find(p => p.slug === slug);
  }, [products]);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    pagination,
    fetchProductsList,
    getProductBySlug
  }), [products, loading, error, pagination, fetchProductsList, getProductBySlug]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts(): ProductContextType {
  const context = useContext(ProductContext);
  
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  
  return context;
}
