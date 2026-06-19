import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useState } from 'react';

const reviewsData = [
  { author: '陈女士', rating: 5, text: '包装精美，品质超乎预期，非常满意！' },
  { author: '李先生', rating: 5, text: '匠心独运，细节之处见真章。' },
  { author: '王女士', rating: 4, text: '非常喜欢，物流迅速，包装精美。' },
];

export function ProductPreviewModal() {
  const { isPreviewOpen, closePreview, previewProduct, addToCart, toggleWishlist, wishlist } = useApp();
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  if (!previewProduct) return null;
  const isWish = wishlist.includes(previewProduct.id);

  const handleAddReview = () => {
    if (userRating === 0 || !reviewText.trim()) return;
    alert('感谢您的评价！');
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
              <img src={previewProduct.img} alt={previewProduct.name} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col">
              {/* Close */}
              <button
                onClick={closePreview}
                className="self-end w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors mb-6"
              >
                ✕
              </button>

              <span className="text-xs tracking-[0.2em] uppercase text-gold mb-2">{previewProduct.category}</span>
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
              <p className="text-sm text-foreground/50 leading-relaxed mb-4">{previewProduct.desc || '甄选奢品，匠心独运，为您呈现卓越品质与永恒之美。'}</p>

              {/* Rating Display */}
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className={s <= (previewProduct.rating || 5) ? 'text-gold fill-gold' : 'text-foreground/20'} />
                ))}
                <span className="text-xs text-foreground/40 ml-2">{previewProduct.rating || 5}.0</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { addToCart(previewProduct); closePreview(); }}
                  className="flex-1 py-3 rounded-full text-sm tracking-[0.18em] uppercase transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.15))',
                    border: '1px solid rgba(155,127,255,0.35)',
                  }}
                >
                  <ShoppingCart size={14} className="inline mr-2" />
                  加入购物袋
                </button>
                <button
                  onClick={() => toggleWishlist(previewProduct.id)}
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
                <div className="max-h-[120px] overflow-y-auto mb-3 pr-1 space-y-2">
                  {reviewsData.map((r, i) => (
                    <div key={i} className="p-2 bg-[rgba(155,127,255,0.05)] rounded-lg border border-border/50 text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={10} className={s <= r.rating ? 'text-gold fill-gold' : 'text-foreground/20'} />
                        ))}
                        <span className="text-xs text-foreground/50 ml-1">{r.author}</span>
                      </div>
                      <p className="text-foreground/60 text-xs leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Review */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <span
                        key={s}
                        onClick={() => setUserRating(s)}
                        className={`cursor-pointer text-lg transition-colors ${
                          s <= userRating ? 'text-gold' : 'text-foreground/20'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="分享您的鉴赏心得..."
                    className="w-full p-2 bg-[rgba(255,255,255,0.03)] border border-border rounded-lg text-xs text-foreground resize-none min-h-[50px] focus:border-purple/50 focus:outline-none font-sans"
                  />
                  <button
                    onClick={handleAddReview}
                    className="self-end px-4 py-1.5 rounded-full text-xs tracking-[0.15em] uppercase transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.15))',
                      border: '1px solid rgba(155,127,255,0.35)',
                    }}
                  >
                    提交评价
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
