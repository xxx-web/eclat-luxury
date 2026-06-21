import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { allProducts } from '../data/products';

export function WishlistPanel() {
  const { isWishlistOpen, toggleWishlistPanel, wishlist, toggleWishlist, addToCart, openPreview } =
    useApp();
  const { notifyAddedToCart, notifyRemovedFromWishlist } = useToast();

  useEffect(() => {
    if (!isWishlistOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleWishlistPanel();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen, toggleWishlistPanel]);

  const wishlistIds = new Set(wishlist);
  const matched = allProducts.filter((p) => wishlistIds.has(p.id));
  // Fallback placeholders for IDs that no longer exist in the catalogue
  const missing = wishlist
    .filter((id) => !allProducts.some((p) => p.id === id))
    .map((id) => ({
      id,
      name: '已下架臻品',
      category: '—',
      price: 0,
      rating: 0,
      img: '',
      desc: '',
    }));
  const items = [...matched, ...missing];

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm"
            onClick={toggleWishlistPanel}
            aria-hidden
          />

          {/* Side panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] z-[200] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="心愿单"
            style={{
              background:
                'linear-gradient(180deg, rgba(20, 12, 40, 0.98) 0%, rgba(13, 5, 33, 0.98) 100%)',
              borderLeft: '1px solid rgba(155, 127, 255, 0.15)',
              boxShadow: '-24px 0 64px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-red-400" fill="currentColor" />
                <div>
                  <h2 className="font-serif text-lg text-foreground">心愿单</h2>
                  <p className="text-xs text-foreground/50 tracking-[0.1em]">
                    {items.length} 件臻品
                  </p>
                </div>
              </div>
              <button
                onClick={toggleWishlistPanel}
                aria-label="关闭心愿单"
                className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'rgba(155, 127, 255, 0.08)' }}
                  >
                    <Heart size={28} className="text-foreground/40" />
                  </div>
                  <p className="text-foreground/60 text-sm mb-1">心愿单是空的</p>
                  <p className="text-foreground/40 text-xs">浏览臻品时点击 ♡ 加入心愿单</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                    >
                      <button
                        onClick={() => {
                          openPreview(item);
                          toggleWishlistPanel();
                        }}
                        className="flex-shrink-0"
                        aria-label={`查看 ${item.name}`}
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          loading="lazy"
                          className="w-20 h-20 object-cover rounded-md"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => {
                            openPreview(item);
                            toggleWishlistPanel();
                          }}
                          className="text-sm text-foreground hover:text-gold transition-colors truncate block w-full text-left"
                        >
                          {item.name}
                        </button>
                        <div className="flex items-center gap-2 mt-1 text-xs text-foreground/50">
                          <span>{item.category}</span>
                          <span className="flex items-center gap-0.5">
                            <Star
                              size={10}
                              fill="#D4A84B"
                              stroke="#D4A84B"
                              aria-hidden
                            />
                            {item.rating}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 text-sm font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          ¥{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            addToCart(item);
                            notifyAddedToCart(item.name);
                          }}
                          aria-label={`将 ${item.name} 加入购物车`}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))',
                            border: '1px solid rgba(155, 127, 255, 0.3)',
                            color: '#F0CC8A',
                          }}
                        >
                          <ShoppingCart size={14} />
                        </button>
                        <button
                          onClick={() => {
                            toggleWishlist(item.id);
                            notifyRemovedFromWishlist(item.name);
                          }}
                          aria-label={`从心愿单移除 ${item.name}`}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
