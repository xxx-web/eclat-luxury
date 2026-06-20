import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Star } from 'lucide-react';
import { allProducts, type Product } from '../data/products';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export function SearchPanel({ isOpen, onClose, onSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProducts.slice(0, 6);
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (p: Product) => {
    onSelect(p);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex items-start justify-center pt-20 md:pt-32 px-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="搜索产品"
          style={{ background: 'rgba(13, 5, 33, 0.7)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                'linear-gradient(180deg, rgba(20, 12, 40, 0.98) 0%, rgba(13, 5, 33, 0.98) 100%)',
              border: '1px solid rgba(155, 127, 255, 0.2)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
              <Search size={20} className="text-gold flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索臻品 · 名称/类别/描述"
                autoFocus
                className="flex-1 bg-transparent outline-none text-foreground placeholder-foreground/40 text-base"
                aria-label="搜索输入"
              />
              <button
                onClick={onClose}
                aria-label="关闭搜索"
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Results list */}
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-6 py-12 text-center text-foreground/50 text-sm">
                  没有找到匹配的产品
                </div>
              ) : (
                <ul className="py-2">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => handleSelect(p)}
                        className="w-full flex items-center gap-4 px-6 py-3 text-left transition-colors hover:bg-white/5"
                      >
                        <img
                          src={p.img}
                          alt={p.name}
                          loading="lazy"
                          className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground/50">
                            <span>{p.category}</span>
                            <span className="flex items-center gap-0.5">
                              <Star
                                size={11}
                                fill="#D4A84B"
                                stroke="#D4A84B"
                                aria-hidden
                              />
                              {p.rating}
                            </span>
                          </div>
                        </div>
                        <div
                          className="text-sm font-medium flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          ¥{p.price.toLocaleString()}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-foreground/40">
              <span>{results.length} 件臻品</span>
              <span>ESC 关闭</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
