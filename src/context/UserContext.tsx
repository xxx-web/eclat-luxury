/**
 * 用户状态管理 Context
 * 管理用户行为、浏览历史、收藏列表
 * productId 统一使用 string，与前端产品数据源（data/products.ts）保持一致
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { getUserId, trackUserBehavior } from '../services/api';

interface UserContextType {
  userId: string;
  viewHistory: Array<{ productId: string; timestamp: number }>;
  likedProducts: string[];
  addToViewHistory: (productId: string) => void;
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId] = useState<string>(getUserId);
  const [viewHistory, setViewHistory] = useState<Array<{ productId: string; timestamp: number }>>([]);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);

  const addToViewHistory = useCallback((productId: string) => {
    const newView = { productId, timestamp: Date.now() };

    setViewHistory(prev => {
      const filtered = prev.filter(v => v.productId !== productId);
      return [newView, ...filtered].slice(0, 50); // 保留最近 50 条
    });

    // 后台追踪用户行为（失败静默忽略，不影响用户体验）
    trackUserBehavior({
      userId,
      productId,
      action: 'view'
    }).catch(console.error);
  }, [userId]);

  const toggleLike = useCallback((productId: string) => {
    setLikedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // 追踪喜欢行为（失败静默忽略）
        trackUserBehavior({
          userId,
          productId,
          action: 'like'
        }).catch(console.error);

        return [...prev, productId];
      }
    });
  }, [userId]);

  const isLiked = useCallback((productId: string) => {
    return likedProducts.includes(productId);
  }, [likedProducts]);

  const value = useMemo(() => ({
    userId,
    viewHistory,
    likedProducts,
    addToViewHistory,
    toggleLike,
    isLiked
  }), [userId, viewHistory, likedProducts, addToViewHistory, toggleLike, isLiked]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
