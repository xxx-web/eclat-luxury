/**
 * 推荐产品组件
 * 使用 AI 推荐系统显示个性化产品推荐
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fetchRecommendations } from '../services/api';
import type { Product } from '../services/api';
import { useUser } from '../context/UserContext';

interface RecommendationSectionProps {
  currentProductId?: number;
  limit?: number;
  title?: string;
}

export function RecommendationSection({ 
  currentProductId, 
  limit = 6,
  title 
}: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  
  const { userId } = useUser();
  
  // 获取推荐产品
  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchRecommendations({
        userId: userId,
        productId: currentProductId,
        limit
      });
      
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      // 使用默认推荐（从硬编码产品中选择）
      setRecommendations(getFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  }, [userId, currentProductId, limit]);
  
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);
  
  // 备用推荐（当 API 失败时使用）
  const getFallbackRecommendations = (): Product[] => {
    const fallbackProducts: Product[] = [
      {
        id: 1,
        name: 'Lune Pearl Drop',
        category: 'jewelry',
        price: 1280,
        desc: 'Elegant pearl drop earrings',
        details: 'Freshwater pearl, 18k gold',
        img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Lune%20Pearl%20Drop.png',
        tag: 'Popular',
        rating: 4.8,
        slug: 'lune-pearl-drop'
      },
      {
        id: 4,
        name: 'Velours Earring',
        category: 'jewelry',
        price: 3900,
        desc: 'South Sea Pearl / Diamond',
        details: 'South Sea pearl, diamond accent',
        img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Velours%20Earring.png',
        tag: 'Recommended',
        rating: 4.9,
        slug: 'velours-earring'
      }
    ];
    
    return fallbackProducts.slice(0, limit);
  };
  
  // 渲染产品卡片
  const renderProductCard = useMemo(() => {
    return recommendations.map((product, index) => (
      <motion.div
        key={product.id || product.slug}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        className="luxury-glass group cursor-pointer"
        onMouseEnter={() => setHoveredProduct(product.slug || product.id.toString())}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        {/* 产品图片 */}
        <div className="aspect-[4/5] overflow-hidden relative">
          <img
            src={product.img || product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* 悬停覆盖层 */}
          {hoveredProduct === (product.slug || product.id.toString()) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <button className="luxury-glass px-6 py-3 rounded-full text-sm tracking-[0.1em] uppercase text-foreground hover:text-primary transition-colors">
                View Piece
              </button>
            </motion.div>
          )}
          
          {/* 标签 */}
          {product.tag && (
            <div className="absolute top-4 left-4 luxury-glass px-3 py-1 rounded-full">
              <span className="text-xs tracking-[0.2em] uppercase text-primary">
                {product.tag}
              </span>
            </div>
          )}
        </div>
        
        {/* 产品信息 */}
        <div className="p-6">
          <h3 className="font-heading italic text-xl text-foreground mb-2">
            {product.name}
          </h3>
          
          {product.material && (
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-4">
              {product.material}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/80">
              ¥{product.price.toLocaleString()}
            </p>
            
            {/* 评分 */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Sparkles size={14} className="text-primary" />
                <span className="text-sm text-foreground/60">
                  {product.rating}
                </span>
              </div>
            )}
          </div>
          
          {/* 推荐理由 */}
          {product.recommendationReason && (
            <p className="text-xs text-foreground/40 mt-3 italic">
              {product.recommendationReason}
            </p>
          )}
        </div>
      </motion.div>
    ));
  }, [recommendations, hoveredProduct, limit]);
  
  // 加载状态
  if (loading) {
    return (
      <section className="py-32 px-6 md:px-16 lg:px-24 bg-[#0a0a14]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }
  
  // 错误状态（但有备用推荐）
  if (error && recommendations.length === 0) {
    return null; // 不显示推荐区域
  }
  
  // 没有推荐结果
  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <section className="py-32 px-6 md:px-16 lg:px-24 bg-[#0a0a14]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* 标题 */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block luxury-glass px-3 py-1 rounded-full mb-6"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-primary/80">
              AI Powered
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
          >
            {title || 'Recommended for You'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm text-foreground/60 max-w-2xl mx-auto"
          >
            Curated by our AI recommendation system based on your preferences and browsing history
          </motion.p>
        </div>
        
        {/* 推荐产品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderProductCard}
        </div>
        
        {/* 查看全部按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button className="luxury-glass px-8 py-4 rounded-full text-sm tracking-[0.2em] uppercase text-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 mx-auto group">
            View All Recommendations
            <ArrowRight 
              size={16} 
              className="group-hover:translate-x-2 transition-transform duration-300" 
            />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
