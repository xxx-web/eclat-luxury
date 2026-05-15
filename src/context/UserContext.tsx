/**
 * 用户状态管理 Context
 * 管理用户行为、浏览历史、收藏列表
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getUserId, trackUserBehavior } from '../services/api';

interface UserContextType {
  userId: string;
  viewHistory: Array<{ productId: number; timestamp: number }>;
  likedProducts: number[];
  addToViewHistory: (productId: number) => void;
  toggleLike: (productId: number) => void;
  isLiked: (productId: number) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId] = useState<string>(getUserId);
  const [viewHistory, setViewHistory] = useState<Array<{ productId: number; timestamp: number }>>([]);
  const [likedProducts, setLikedProducts] = useState<number[]>([]);

  const addToViewHistory = useCallback((productId: number) => {
    const newView = { productId, timestamp: Date.now() };
    
    setViewHistory(prev => {
      const filtered = prev.filter(v => v.productId !== productId);
      return [newView, ...filtered].slice(0, 50); // 保留最近 50 条
    });

    // 后台追踪用户行为
    trackUserBehavior({
      userId,
      productId,
      action: 'view'
    }).catch(console.error);
  }, [userId]);

  const toggleLike = useCallback((productId: number) => {
    setLikedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // 追踪喜欢行为
        trackUserBehavior({
          userId,
          productId,
          action: 'like'
        }).catch(console.error);
        
        return [...prev, productId];
      }
    });
  }, [userId]);

  const isLiked = useCallback((productId: number) => {
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
