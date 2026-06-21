import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function CartPanel() {
  const {
    cart, isCartOpen, toggleCart,
    removeFromCart, updateQty, getCartTotal, getCartCount,
    openCheckout,
  } = useApp();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      // Not logged in - close cart, open auth modal
      toggleCart();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('eclat:open-auth-from-checkout'));
      }, 200);
      return;
    }
    openCheckout();
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isCartOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] transition-opacity ${
          isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={toggleCart}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isCartOpen ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 right-0 w-[400px] max-w-[95vw] h-screen bg-[#0d0521]/98 backdrop-blur-md border-l border-border z-[2001] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!isCartOpen}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 id="cart-title" className="font-heading text-xl font-normal tracking-[0.05em]">购物袋 ({getCartCount()})</h3>
          <button
            onClick={toggleCart}
            aria-label="关闭购物袋"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-foreground/40">
              <div className="text-4xl mb-4 opacity-40">🛍️</div>
              <p className="text-sm">购物袋为空</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b border-border/50">
                <div className="w-[70px] h-[70px] rounded-lg overflow-hidden border border-border flex-shrink-0 bg-foreground/5">
                  <img
                    src={item.img}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-1 truncate">{item.name}</p>
                  <p
                    className="font-heading text-base"
                    style={{
                      background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ¥{(item.price * item.qty).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label={`减少 ${item.name} 数量`}
                      className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs text-foreground/60 hover:border-purple/50 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span
                      className="text-xs w-4 text-center"
                      aria-label={`当前数量 ${item.qty}`}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label={`增加 ${item.name} 数量`}
                      className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs text-foreground/60 hover:border-purple/50 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`从购物袋移除 ${item.name}`}
                    className="text-xs text-foreground/30 hover:text-red-400 transition-colors mt-1"
                  >
                    移除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm tracking-[0.1em] uppercase text-foreground/60">合计</span>
              <span
                className="font-heading text-xl"
                style={{
                  background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ¥{getCartTotal().toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              aria-label="前往结算"
              className="w-full py-3 rounded-full text-sm tracking-[0.18em] uppercase transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.15))',
                border: '1px solid rgba(155,127,255,0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(155,127,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.15))';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              前往结算
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
