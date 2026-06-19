import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Star, Eye, Heart, ShoppingCart, Plus, Minus } from 'lucide-react';

const allProducts = [
  {
    id: 'yueguang',
    name: '月光之泪项链',
    category: '珠宝臻品',
    price: 12800,
    rating: 4.9,
    img: '/images/yueguang.png',
    desc: '以月光为灵感，甄选天然珍珠，匠心独运，宛如月华倾泻。',
    tag: '甄选',
  },
  {
    id: 'gold_rose_earring',
    name: '金玫瑰耳环',
    category: '珠宝臻品',
    price: 8600,
    rating: 4.8,
    img: '/images/gold_rose_earring.png',
    desc: '18K金玫瑰造型，甄选钻石点缀，绽放优雅光芒。',
    tag: '畅销',
  },
  {
    id: 'emerald_ring',
    name: '翡翠花园戒指',
    category: '珠宝臻品',
    price: 22500,
    rating: 4.9,
    img: '/images/emerald_ring.png',
    desc: '甄选哥伦比亚祖母绿，配以钻石花园造型，奢华臻品。',
    tag: '',
  },
  {
    id: 'pearl_bracelet',
    name: '珍珠手链',
    category: '珠宝臻品',
    price: 6800,
    rating: 4.7,
    img: '/images/pearl_bracelet.png',
    desc: '天然淡水珍珠，匠心串制，温润典雅，彰显品味。',
    tag: '甄选',
  },
  {
    id: 'noir_absolu_perfume',
    name: '黑夜Absolute',
    category: '香水雅韵',
    price: 3200,
    rating: 4.9,
    img: '/images/noir_absolu_perfume.png',
    desc: '深邃黑夜中的绝对魅力，乌木与玫瑰的永恒对话。',
    tag: '畅销',
  },
  {
    id: 'rose_celeste_perfume',
    name: '天穹玫瑰',
    category: '香水雅韵',
    price: 2800,
    rating: 4.8,
    img: '/images/rose_celeste_perfume.png',
    desc: '来自天穹的玫瑰芬芳，清新花香，适合日常臻选。',
    tag: '甄选',
  },
  {
    id: 'bois_sacre_perfume',
    name: '神圣之木',
    category: '香水雅韵',
    price: 3500,
    rating: 4.7,
    img: '/images/bois_sacre_perfume.png',
    desc: '沉香与檀木的神圣交融，木质调中的臻品之作。',
    tag: '',
  },
  {
    id: 'quilted_tote_bag',
    name: '菱格纹托特包',
    category: '奢华手袋',
    price: 18500,
    rating: 4.8,
    img: '/images/quilted_tote_bag.png',
    desc: '经典菱格纹，甄选小牛皮，法国匠心工艺，永恒优雅。',
    tag: '畅销',
  },
  {
    id: 'woven_chain_bag',
    name: '编织链条包',
    category: '奢华手袋',
    price: 12800,
    rating: 4.7,
    img: '/images/woven_chain_bag.png',
    desc: '匠心编织皮革，金属链条点缀，现代与经典的完美交融。',
    tag: '甄选',
  },
];

const filters = ['全部臻品', '珠宝臻品', '香水雅韵', '奢华手袋'];
const sortOptions = ['默认排序', '价格从低到高', '价格从高到低', '评分最高'];

export function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState('全部臻品');
  const [sortBy, setSortBy] = useState('默认排序');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { addToCart, cart, wishlist, toggleWishlist } = useApp();

  const filtered = activeFilter === '全部臻品'
    ? [...allProducts]
    : allProducts.filter((p) => p.category === activeFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === '价格从低到高') return a.price - b.price;
    if (sortBy === '价格从高到低') return b.price - a.price;
    if (sortBy === '评分最高') return b.rating - a.rating;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paged = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isInCart = (id: string) => cart.some((i) => i.id === id);

  return (
    <section id="products" className="py-28 px-6 md:px-16 lg:px-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4A84B)' }} />
          <span className="text-xs tracking-[0.3em] uppercase" style={{ color: '#D4A84B' }}>甄选臻品</span>
          <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, #D4A84B, transparent)' }} />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-light">
          探索 <em className="not-italic" style={{
            background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>臻选</em>世界
        </h2>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
              activeFilter === f
                ? 'text-foreground'
                : 'text-foreground/50 hover:text-foreground border-border/50'
            }`}
            style={
              activeFilter === f
                ? { background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))', border: '1px solid rgba(155,127,255,0.4)' }
                : { border: '1px solid rgba(240,236,230,0.08)' }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex justify-end mb-8 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/50 tracking-[0.1em] uppercase">排序</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-[rgba(26,26,46,0.6)] border border-[rgba(240,236,230,0.12)] rounded-lg text-foreground text-xs font-sans outline-none focus:border-purple/50 transition-colors"
          >
            {sortOptions.map((o) => (
              <option key={o} value={o} className="bg-[#0d0521]">{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paged.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(26,26,46,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(240,236,230,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden group">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
              />
              {product.tag && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[0.62rem] tracking-[0.15em] uppercase"
                  style={{
                    background: 'rgba(13,5,33,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(240,236,230,0.08)',
                  }}
                >
                  {product.tag}
                </div>
              )}
              {/* Quick View */}
              <div
                className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-2 text-xs tracking-[0.15em] uppercase text-foreground/60 transition-all duration-300"
                style={{
                  background: 'rgba(13,5,33,0.9)',
                  backdropFilter: 'blur(12px)',
                  transform: 'translateY(100%)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(100%)'; }}
                onClick={() => addToCart(product)}
              >
                <Eye size={14} /> 快速鉴赏
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-1">{product.category}</p>
              <h3 className="font-heading text-lg font-normal mb-2 leading-snug">{product.name}</h3>
              <p className="text-xs text-foreground/50 mb-4 leading-relaxed" style={{ minHeight: '2.8em' }}>{product.desc}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={wishlist.includes(product.id) ? `从心愿单移除 ${product.name}` : `加入心愿单 ${product.name}`}
                    aria-pressed={wishlist.includes(product.id)}
                    className="w-9 h-9 rounded-full border border-[rgba(240,236,230,0.08)] flex items-center justify-center text-foreground/50 hover:border-red-400/50 hover:text-red-400 transition-colors text-sm"
                  >
                    {wishlist.includes(product.id) ? <Heart size={14} fill="currentColor" className="text-red-400" /> : <Heart size={14} />}
                  </button>
                </div>
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
                <button
                  onClick={() => addToCart(product)}
                  aria-label={isInCart(product.id) ? `${product.name} 已在购物袋中` : `将 ${product.name} 加入购物袋`}
                  aria-pressed={isInCart(product.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    border: isInCart(product.id) ? '1px solid rgba(155,127,255,0.5)' : '1px solid rgba(155,127,255,0.3)',
                    color: isInCart(product.id) ? '#9B7FFF' : 'rgba(155,127,255,0.7)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(155,127,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(155,127,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = isInCart(product.id) ? 'rgba(155,127,255,0.5)' : 'rgba(155,127,255,0.3)';
                  }}
                >
                  <ShoppingCart size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg text-xs transition-all duration-300 text-foreground/60 hover:text-foreground disabled:opacity-30"
            style={{ background: 'rgba(26,26,46,0.6)', border: '1px solid rgba(240,236,230,0.08)' }}
          >
            上一页
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-10 h-10 rounded-lg text-xs transition-all duration-300 ${
                  currentPage === p ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'
                }`}
                style={
                  currentPage === p
                    ? { background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))', border: '1px solid rgba(155,127,255,0.4)' }
                    : { background: 'rgba(26,26,46,0.6)', border: '1px solid rgba(240,236,230,0.08)' }
                }
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg text-xs transition-all duration-300 text-foreground/60 hover:text-foreground disabled:opacity-30"
            style={{ background: 'rgba(26,26,46,0.6)', border: '1px solid rgba(240,236,230,0.08)' }}
          >
            下一页
          </button>
        </div>
      )}
    </section>
  );
}
