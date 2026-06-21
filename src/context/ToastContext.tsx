import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Heart, ShoppingCart, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'wishlist' | 'cart';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  icon?: 'heart' | 'cart' | 'check' | 'info';
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  notifyAddedToCart: (productName: string) => void;
  notifyAddedToWishlist: (productName: string) => void;
  notifyRemovedFromWishlist: (productName: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICON_MAP = {
  heart: Heart,
  cart: ShoppingCart,
  check: Check,
  info: Info,
};

const TYPE_STYLES: Record<ToastType, { gradient: string; border: string }> = {
  success: {
    gradient: 'linear-gradient(135deg, rgba(134, 239, 172, 0.18), rgba(74, 222, 128, 0.08))',
    border: 'rgba(134, 239, 172, 0.4)',
  },
  info: {
    gradient: 'linear-gradient(135deg, rgba(155, 127, 255, 0.18), rgba(212, 168, 75, 0.08))',
    border: 'rgba(155, 127, 255, 0.4)',
  },
  wishlist: {
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(212, 168, 75, 0.08))',
    border: 'rgba(239, 68, 68, 0.4)',
  },
  cart: {
    gradient: 'linear-gradient(135deg, rgba(155, 127, 255, 0.2), rgba(212, 168, 75, 0.12))',
    border: 'rgba(155, 127, 255, 0.5)',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `t_${Date.now()}_${++counterRef.current}`;
      const full: Toast = { id, ...toast };
      setToasts((prev) => [...prev, full]);
      // Auto-dismiss after 2.5s
      setTimeout(() => removeToast(id), 2500);
    },
    [removeToast]
  );

  const notifyAddedToCart = useCallback(
    (productName: string) => {
      showToast({
        type: 'cart',
        icon: 'cart',
        message: '已加入购物袋',
        description: productName,
      });
    },
    [showToast]
  );

  const notifyAddedToWishlist = useCallback(
    (productName: string) => {
      showToast({
        type: 'wishlist',
        icon: 'heart',
        message: '已加入心愿单',
        description: productName,
      });
    },
    [showToast]
  );

  const notifyRemovedFromWishlist = useCallback(
    (productName: string) => {
      showToast({
        type: 'info',
        icon: 'info',
        message: '已移出心愿单',
        description: productName,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        notifyAddedToCart,
        notifyAddedToWishlist,
        notifyRemovedFromWishlist,
      }}
    >
      {children}

      {/* Toast viewport (top-right) */}
      <div
        className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.icon ? ICON_MAP[t.icon] : Check;
            const style = TYPE_STYLES[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto rounded-xl px-4 py-3 min-w-[260px] max-w-[360px] flex items-start gap-3"
                style={{
                  background: style.gradient,
                  border: `1px solid ${style.border}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                }}
                role="status"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(13, 5, 33, 0.4)' }}
                >
                  <Icon size={16} className="text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{t.message}</p>
                  {t.description && (
                    <p className="text-xs text-foreground/60 mt-0.5 truncate">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  aria-label="关闭通知"
                  className="text-foreground/40 hover:text-foreground/80 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
