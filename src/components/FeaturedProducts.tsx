/**
 * 精选产品组件 - 性能优化版本
 * 使用 React.memo、useMemo、useCallback 优化渲染
 * 支持图片懒加载
 */

import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';

// 产品类型定义
interface Product {
  id?: number;
  name: string;
  category?: string;
  price: number;
  desc?: string;
  details?: string;
  img?: string;
  image?: string;
  tag?: string;
  rating?: number;
  slug: string;
  material?: string;
  priceRange?: string;
}

// 懒加载图片组件
const LazyImage = lazy(() => Promise.resolve({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }
}));

// 产品数据
const products: Product[] = [
  {
    id: 1,
    name: 'Lune Pearl Drop',
    category: 'jewelry',
    price: 1280,
    desc: 'Elegant pearl earrings',
    details: 'Freshwater pearl, 18k gold',
    img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Lune%20Pearl%20Drop.png',
    tag: 'Popular',
    rating: 4.8,
    slug: 'lune-pearl-drop',
    material: 'Round Cultured Pearl / 18k Gold',
    priceRange: 'mid'
  },
  {
    id: 2,
    name: 'Noir Halo Stud',
    category: 'jewelry',
    price: 2450,
    desc: 'Diamond stud earrings',
    details: 'Diamond, white gold',
    img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Noir%20Halo%20Stud.png',
    tag: 'New',
    rating: 4.9,
    slug: 'noir-halo-stud',
    material: 'Diamond / White Gold',
    priceRange: 'high'
  },
  {
    id: 3,
    name: 'Atelier Ribbon Collar',
    category: 'jewelry',
    price: 4800,
    desc: 'Ribbon-inspired necklace',
    details: 'Pearl, sapphire, gold',
    img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Atelier%20Ribbon%20Collar.png',
    tag: 'Exclusive',
    rating: 4.7,
    slug: 'atelier-ribbon-collar',
    material: 'Pearl / Sapphire / Gold',
    priceRange: 'high'
  },
  {
    id: 4,
    name: 'Velours Earring',
    category: 'jewelry',
    price: 3900,
    desc: 'South Sea pearl earrings',
    details: 'South Sea pearl, diamond accent',
    img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Velours%20Earring.png',
    tag: 'Recommended',
    rating: 4.9,
    slug: 'velours-earring',
    material: 'South Sea Pearl / Diamond',
    priceRange: 'high'
  },
  {
    id: 5,
    name: 'Eclipse Ring',
    category: 'jewelry',
    price: 1960,
    desc: 'Eclipse-inspired ring',
    details: 'Pearl, diamond, gold',
    img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Eclipse%20Ring.png',
    tag: 'Classic',
    rating: 4.6,
    slug: 'eclipse-ring',
    material: 'Pearl / Diamond / Gold',
    priceRange: 'mid'
  },
  {
    id: 6,
    name: 'Nocturne Cuff',
    category: 'jewelry',
    price: 2780,
    desc: 'Nocturne-inspired cuff',
    details: 'Brushed gold, pearl accent',
    img: 'https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Nocturne%20Cuff.png',
    tag: 'Limited',
    rating: 4.8,
    slug: 'nocturne-cuff',
    material: 'Brushed Gold / Pearl',
    priceRange: 'mid'
  }
];

// 产品卡片组件（使用 React.memo 优化）
interface ProductCardProps {
  product: Product;
  index: number;
  isHovered: boolean;
  onMouseEnter: (slug: string) => void;
  onMouseLeave: () => void;
}

const ProductCard = React.memo<ProductCardProps>(({ 
  product, 
  index, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  const handleViewProduct = useCallback(() => {
    console.log('View product:', product.slug);
  }, [product.slug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="luxury-glass group cursor-pointer"
      onMouseEnter={() => onMouseEnter(product.slug)}
      onMouseLeave={onMouseLeave}
    >
      {/* 产品图片 */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse" />}>
          <LazyImage
            src={product.img || product.image || ''}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Suspense>
        
        {/* 悬停覆盖层 */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
          >
            <button 
              className="luxury-glass w-12 h-12 rounded-full flex items-center justify-center text-foreground hover:text-primary transition-colors"
              onClick={handleViewProduct}
            >
              <Heart size={20} />
            </button>
            <button className="luxury-glass px-6 py-3 rounded-full text-sm tracking-[0.1em] uppercase text-foreground hover:text-primary transition-colors">
              View Piece
            </button>
          </motion.div>
        )}

        {/* 浏览次数 */}
        <div className="absolute top-4 right-4 luxury-glass px-3 py-1 rounded-full">
          <span className="text-xs text-foreground/60">
            {Math.floor(Math.random() * 100) + 50} views
          </span>
        </div>
      </div>

      {/* 产品信息 */}
      <div className="p-6">
        <h3 className="font-heading italic text-xl text-foreground mb-2">
          {product.name}
        </h3>
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-4">
          {product.material}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/80">
            ¥{product.price.toLocaleString()}
          </p>
          <button className="text-primary hover:text-primary/80 transition-colors duration-300 flex items-center gap-2 group/btn">
            <span className="text-sm">View Piece</span>
            <ArrowRight 
              size={16} 
              className="group-hover/btn:translate-x-2 transition-transform duration-300" 
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

// 主组件
const FeaturedProducts = React.memo(() => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // 使用 useCallback 缓存事件处理函数
  const handleMouseEnter = useCallback((slug: string) => {
    setHoveredProduct(slug);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredProduct(null);
  }, []);

  // 使用 useMemo 缓存产品网格渲染
  const productGrid = useMemo(() => {
    return products.map((product, index) => (
      <ProductCard
        key={product.slug}
        product={product}
        index={index}
        isHovered={hoveredProduct === product.slug}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    ));
  }, [products, hoveredProduct, handleMouseEnter, handleMouseLeave]);

  return (
    <section className="py-32 px-6 md:px-16 lg:px-24 bg-[#0a0a14]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* 标题区域 */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block luxury-glass px-3 py-1 rounded-full mb-6"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-primary/80">
              Featured
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
          >
            Featured Products
          </motion.h2>
        </div>

        {/* 产品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productGrid}
        </div>
      </motion.div>
    </section>
  );
});

FeaturedProducts.displayName = 'FeaturedProducts';

export { FeaturedProducts };
