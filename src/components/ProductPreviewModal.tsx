import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useReviews } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export function ProductPreviewModal() {
  const { isPreviewOpen, closePreview, previewProduct, addToCart, toggleWishlist, wishlist } = useApp();
  const { getReviewsFor, addReview } = useReviews();
  const { user } = useAuth();
  const { notifyAddedToCart, notifyAddedToWishlist, notifyRemovedFromWishlist } = useToast();
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!previewProduct) return null;
  const isWish = wishlist.includes(previewProduct.id);

  const handleAddToCart = () => {
    addToCart(previewProduct);
    notifyAddedToCart(previewProduct.name);
    closePreview();
  };

  const handleToggleWishlist = () => {
    if (isWish) {
      notifyRemovedFromWishlist(previewProduct.name);
    } else {
      notifyAddedToWishlist(previewProduct.name);
    }
    toggleWishlist(previewProduct.id);
  };
  const isWish = wishlist.includes(previewProduct.id);
  const reviews = getReviewsFor(previewProduct.id);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : previewProduct.rating || 5;

  const handleAddReview = () => {
    if (userRating === 0 || !reviewText.trim()) return;
    addReview({
      productId: previewProduct.id,
      userId: user?.id ?? null,
      userName: user?.name ?? '匿名用户',
      rating: userRating,
      content: reviewText.trim(),
    });
    setUserRating(0);
    setReviewText('');
  };

  return (
    <AnimatePresence>
      {isPreviewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] flex items-center justify-center p-8"
          onClick={closePreview}
        >
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="bg-[rgba(20,10,45,0.98)] backdrop-blur-md border border-border rounded-2xl w-full max-w-[760px] max-h-[85vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
              <img
                src={previewProduct.img}
                alt={previewProduct.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col">
              {/* Close */}
              <button
                onClick={closePreview}
                aria-label="关闭预览"
                className="self-end w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors mb-6"
              >
                ✕
              </button>

              <span className="text-xs tracking-[0.2em] uppercase text-gold mb-2">
                {previewProduct.category}
              </span>
              <h2 className="font-heading text-2xl font-light mb-3">{previewProduct.name}</h2>
              <p
                className="font-heading text-xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ¥{previewProduct.price?.toLocaleString()}
              </p>
              <p className="text-sm text-foreground/50 leading-relaxed mb-4">
                {previewProduct.desc || '甄选奢品，匠心独运，为您呈现卓越品质与永恒之美。'}
              </p>

              {/* Rating Display */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= Math.round(averageRating) ? 'text-gold fill-gold' : 'text-foreground/20'}
                  />
                ))}
                <span className="text-xs text-foreground/40 ml-2">
                  {averageRating.toFixed(1)} · {reviews.length} 条评价
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 rounded-full text-sm tracking-[0.18em] uppercase transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.15))',
                    border: '1px solid rgba(155,127,255,0.35)',
                  }}
                >
                  <ShoppingCart size={14} className="inline mr-2" />
                  加入购物袋
                </button>
                <button
                  onClick={handleToggleWishlist}
                  aria-label={isWish ? '取消收藏' : '加入收藏'}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    isWish ? 'text-red-400 border-red-400/50' : 'text-foreground/60 border-border hover:text-red-400'
                  }`}
                >
                  <Heart size={16} fill={isWish ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Reviews Section */}
              <div className="mt-auto pt-4 border-t border-border">
                <h4 className="font-heading text-base italic mb-3">鉴赏者评价</h4>
                <div className="max-h-[140px] overflow-y-auto mb-3 pr-1 space-y-2">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-foreground/40 text-center py-4">
                      还没有评价 · 成为第一个评价的人
                    </p>
                  ) : (
                    reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-2 bg-[rgba(155,127,255,0.05)] rounded-lg border border-border/50 text-sm"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={s <= r.rating ? 'text-gold fill-gold' : 'text-foreground/20'}
                            />
                          ))}
                          <span className="text-xs text-foreground/50 ml-1">{r.userName}</span>
                          <span className="text-[10px] text-foreground/30 ml-auto">
                            {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-foreground/60 text-xs leading-relaxed">{r.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add review */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setUserRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${n} 星`}
                        className="p-0.5"
                      >
                        <Star
                          size={14}
                          className={n <= (hoverRating || userRating) ? 'text-gold' : 'text-foreground/30'}
                          fill={n <= (hoverRating || userRating) ? '#D4A84B' : 'none'}
                        />
                      </button>
                    ))}
                    <span className="text-[10px] text-foreground/40 ml-1">
                      {userRating > 0 ? `${userRating} 星` : '选择评分'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddReview();
                      }}
                      placeholder="写一条评价..."
                      className="flex-1 px-3 py-1.5 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-xs"
                      style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                    />
                    <button
                      onClick={handleAddReview}
                      disabled={userRating === 0 || !reviewText.trim()}
                      className="px-3 py-1.5 rounded text-[10px] text-foreground tracking-wider uppercase transition-all duration-300 disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))',
                        border: '1px solid rgba(155, 127, 255, 0.3)',
                      }}
                    >
                      发表
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
