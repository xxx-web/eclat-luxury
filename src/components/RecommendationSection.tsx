/**
 * 推荐产品组件
 * 使用 AI 推荐系统显示个性化产品推荐
 * 本地无 Edge Functions 运行时时，走基于规则的本地推荐 fallback
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Eye } from 'lucide-react';
import { fetchRecommendations, type Product } from '../services/api';
import { allProducts, type Product as LocalProduct } from '../data/products';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';

interface RecommendationSectionProps {
  currentProductId?: string;
  limit?: number;
  title?: string;
}

/**
 * 将本地产品数据（data/products）适配为 API Product 格式
 * 补充 details/tag 等字段，并附加推荐理由
 */
function toApiProduct(p: LocalProduct, reason: string): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    desc: p.desc,
    details: p.desc,
    img: p.img,
    tag: p.tag ?? '',
    rating: p.rating,
    recommendationReason: reason,
  };
}

export function RecommendationSection({
  currentProductId,
  limit = 6,
  title
}: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  // 仅首次加载展示 loading，后续行为变化采用静默更新（stale-while-revalidate）
  const isFirstLoad = useRef(true);

  const { userId, viewHistory, likedProducts } = useUser();
  const { openPreview } = useApp();

  /**
   * 基于规则的本地推荐（fallback）
   * 规则1：基于浏览历史，取最近浏览产品的分类，推荐同分类其他产品
   * 规则2：基于收藏，取收藏产品的分类，推荐同分类产品
   * 规则3：冷启动兜底，推荐 tag 为"畅销"或 rating >= 4.8 的产品
   */
  const getFallbackRecommendations = useCallback((): Product[] => {
    const viewedIds = new Set(viewHistory.map(v => v.productId));
    const likedIds = new Set(likedProducts);
    const excludeIds = new Set<string>([
      ...viewedIds,
      ...likedIds,
      ...(currentProductId ? [currentProductId] : []),
    ]);

    // 规则1：基于浏览历史
    if (viewHistory.length > 0) {
      const recentViewedId = viewHistory[0].productId;
      const recentProduct = allProducts.find(p => p.id === recentViewedId);
      if (recentProduct) {
        const recentCategory = recentProduct.category;
        const recentName = recentProduct.name;
        const sameCategory = allProducts.filter(
          p => p.category === recentCategory && !excludeIds.has(p.id)
        );
        if (sameCategory.length > 0) {
          return sameCategory.slice(0, limit).map(p =>
            toApiProduct(p, `因您浏览了${recentName}，为您甄选同类臻品`)
          );
        }
      }
    }

    // 规则2：基于收藏
    if (likedProducts.length > 0) {
      const likedProductId = likedProducts[0];
      const likedProduct = allProducts.find(p => p.id === likedProductId);
      if (likedProduct) {
        const likedCategory = likedProduct.category;
        const likedName = likedProduct.name;
        const sameCategory = allProducts.filter(
          p => p.category === likedCategory && !excludeIds.has(p.id)
        );
        if (sameCategory.length > 0) {
          return sameCategory.slice(0, limit).map(p =>
            toApiProduct(p, `因您收藏了${likedName}，为您甄选同类臻品`)
          );
        }
      }
    }

    // 规则3：冷启动兜底
    const popular = allProducts.filter(
      p => (p.tag === '畅销' || p.rating >= 4.8) && !excludeIds.has(p.id)
    );
    if (popular.length > 0) {
      return popular.slice(0, limit).map(p => toApiProduct(p, '热门臻品，备受青睐'));
    }

    // 最终兜底：排除已浏览/收藏后取前 limit 条
    return allProducts
      .filter(p => !excludeIds.has(p.id))
      .slice(0, limit)
      .map(p => toApiProduct(p, '为您甄选'));
  }, [viewHistory, likedProducts, currentProductId, limit]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isFirstLoad.current) {
        setLoading(true);
      }

      try {
        const result = await fetchRecommendations({
          userId,
          productId: currentProductId,
          limit
        });

        if (cancelled) return;

        // 适配：兼容 image 字段，确保 img 存在
        const adapted: Product[] = result.map(p => ({
          ...p,
          img: p.img || p.image || '',
        }));

        // 检查数据完整性，不足 limit 则混入 fallback
        if (adapted.length < limit) {
          const fallback = getFallbackRecommendations();
          const existingIds = new Set(adapted.map(p => p.id));
          const extra = fallback
            .filter(p => !existingIds.has(p.id))
            .slice(0, limit - adapted.length);
          setRecommendations([...adapted, ...extra]);
        } else {
          setRecommendations(adapted.slice(0, limit));
        }
      } catch {
        // API 不可用（如本地开发无 Edge Functions），走本地规则推荐
        if (cancelled) return;
        setRecommendations(getFallbackRecommendations());
      } finally {
        if (!cancelled) {
          isFirstLoad.current = false;
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId, currentProductId, limit, getFallbackRecommendations]);

  // 渲染产品卡片
  const renderProductCard = useMemo(() => {
    return recommendations.map((product, index) => {
      const productKey = product.slug || product.id;
      return (
        <motion.div
          key={productKey}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(26,26,46,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(240,236,230,0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)';
            setHoveredProduct(productKey);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            setHoveredProduct(null);
          }}
        >
          {/* 产品图片 */}
          <div className="aspect-square overflow-hidden relative group">
            <img
              src={product.img || product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* 标签 */}
            {product.tag && (
              <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-[0.62rem] tracking-[0.15em] uppercase"
                style={{
                  background: 'rgba(13,5,33,0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(240,236,230,0.08)',
                }}
              >
                {product.tag}
              </div>
            )}

            {/* 悬停快速鉴赏条 */}
            <div
              className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-2 text-xs tracking-[0.15em] uppercase text-foreground/60 transition-all duration-300 cursor-pointer"
              style={{
                background: 'rgba(13,5,33,0.9)',
                backdropFilter: 'blur(12px)',
                transform: hoveredProduct === productKey ? 'translateY(0)' : 'translateY(100%)',
              }}
              onClick={() => openPreview(product)}
            >
              <Eye size={14} /> 快速鉴赏
            </div>
          </div>

          {/* 产品信息 */}
          <div className="p-5">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-1">
              {product.category}
            </p>
            <h3 className="font-heading text-lg font-normal mb-2 leading-snug">
              {product.name}
            </h3>

            {product.material && (
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-3">
                {product.material}
              </p>
            )}

            <p className="text-xs text-foreground/50 mb-4 leading-relaxed" style={{ minHeight: '2.8em' }}>
              {product.desc}
            </p>

            <div className="flex items-center justify-between mb-3">
              <div
                className="font-heading text-lg"
                style={{
                  background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ¥{product.price.toLocaleString()}
              </div>

              {product.rating && (
                <div className="flex items-center gap-1">
                  <Sparkles size={14} className="text-gold" />
                  <span className="text-sm text-foreground/60">{product.rating}</span>
                </div>
              )}
            </div>

            {/* 推荐理由 */}
            {product.recommendationReason && (
              <p
                className="text-xs text-foreground/40 italic pt-3"
                style={{ borderTop: '1px solid rgba(240,236,230,0.08)' }}
              >
                {product.recommendationReason}
              </p>
            )}
          </div>
        </motion.div>
      );
    });
  }, [recommendations, hoveredProduct, openPreview]);

  // 加载状态（仅首次加载时展示）
  if (loading) {
    return (
      <section className="py-32 px-6 md:px-16 lg:px-24 bg-[#0d0521]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        </div>
      </section>
    );
  }

  // 没有推荐结果时不显示
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-32 px-6 md:px-16 lg:px-24 bg-[#0d0521]">
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
            className="inline-block px-3 py-1 rounded-full mb-6"
            style={{
              background: 'rgba(26,26,46,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(240,236,230,0.08)',
            }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
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
            {title || '为您甄选'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm text-foreground/60 max-w-2xl mx-auto"
          >
            基于您的浏览偏好与收藏，由 AI 推荐系统精心策划
          </motion.p>
        </div>

        {/* 推荐产品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderProductCard}
        </div>

        {/* 查看全部推荐按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button
            className="px-8 py-4 rounded-full text-sm tracking-[0.2em] uppercase text-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2 mx-auto group"
            style={{
              background: 'rgba(26,26,46,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(240,236,230,0.08)',
            }}
          >
            查看全部推荐
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
