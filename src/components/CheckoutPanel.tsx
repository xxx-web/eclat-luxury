import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOrders, type OrderItem } from '../hooks/useOrders';

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

const paymentOptions = [
  { value: 'alipay' as const, label: '支付宝', icon: '支' },
  { value: 'wechat' as const, label: '微信支付', icon: '微' },
  { value: 'card' as const, label: '银行卡', icon: '卡' },
];

function validateForm(data: { name: string; phone: string; address: string }): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = '请输入收货人姓名';
  if (!data.phone.trim()) {
    errors.phone = '请输入联系电话';
  } else if (!/^1[3-9]\d{9}$/.test(data.phone.trim())) {
    errors.phone = '请输入有效的 11 位手机号';
  }
  if (!data.address.trim()) errors.address = '请输入详细收货地址';
  return errors;
}

export function CheckoutPanel() {
  const {
    isCheckoutOpen,
    closeCheckout,
    cart,
    getCartTotal,
    getCartCount,
  } = useApp();
  const { createOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (isCheckoutOpen) {
      setErrors({});
      setSubmitting(false);
    }
  }, [isCheckoutOpen]);

  // ESC to close
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckout();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCheckoutOpen, closeCheckout]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateForm(formData);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (cart.length === 0) {
      setErrors({ address: '购物车为空' });
      return;
    }

    setSubmitting(true);

    // Simulate payment processing
    setTimeout(() => {
      const items: OrderItem[] = cart.map((c) => ({
        productId: c.id,
        name: c.name,
        img: c.img,
        price: c.price,
        qty: c.qty,
        category: c.category,
      }));

      const order = createOrder({
        items,
        total: getCartTotal(),
        shipping: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          note: formData.note.trim() || undefined,
        },
        payment: paymentMethod,
      });

      // Dispatch custom event so App.tsx can navigate to confirmation
      window.dispatchEvent(
        new CustomEvent('eclat:order-placed', { detail: { orderId: order.id } })
      );
      closeCheckout();
    }, 800);
  };

  const total = getCartTotal();
  const count = getCartCount();
  const shipping = total >= 5000 ? 0 : 30;

  return (
    <>
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-[2500]"
            onClick={closeCheckout}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 right-0 w-[480px] max-w-[95vw] h-screen bg-[#0d0521]/98 backdrop-blur-md border-l border-border z-[2501] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="结算"
            noValidate
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-xl font-normal tracking-[0.05em]">结算</h3>
              <button
                onClick={closeCheckout}
                aria-label="关闭结算"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body - scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Items summary */}
              <div className="p-6 border-b border-border">
                <h4 className="text-xs tracking-[0.2em] uppercase text-foreground/50 mb-3">
                  订单商品 · {count} 件
                </h4>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.img}
                        alt={item.name}
                        loading="lazy"
                        className="w-12 h-12 object-cover rounded"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-foreground/50">x{item.qty}</p>
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{
                          background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        ¥{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping form */}
              <div className="p-6 border-b border-border space-y-4">
                <h4 className="text-xs tracking-[0.2em] uppercase text-foreground/50">
                  收货信息
                </h4>

                <div>
                  <label className="block text-xs text-foreground/60 mb-1">
                    收货人姓名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="请输入姓名"
                    aria-invalid={!!errors.name}
                    className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none transition-colors text-sm"
                    style={{
                      borderColor: errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(240,236,230,0.12)',
                    }}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-foreground/60 mb-1">
                    联系电话 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="11 位手机号"
                    aria-invalid={!!errors.phone}
                    className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none transition-colors text-sm"
                    style={{
                      borderColor: errors.phone ? 'rgba(239, 68, 68, 0.5)' : 'rgba(240,236,230,0.12)',
                    }}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-foreground/60 mb-1">
                    详细地址 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="省/市/区 + 街道 + 门牌号"
                    rows={2}
                    aria-invalid={!!errors.address}
                    className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none transition-colors text-sm resize-none"
                    style={{
                      borderColor: errors.address ? 'rgba(239, 68, 68, 0.5)' : 'rgba(240,236,230,0.12)',
                    }}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-400 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-foreground/60 mb-1">
                    备注 <span className="text-foreground/40">(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    placeholder="订单备注（如有）"
                    className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm"
                    style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="p-6 border-b border-border">
                <h4 className="text-xs tracking-[0.2em] uppercase text-foreground/50 mb-3">
                  支付方式
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {paymentOptions.map((opt) => {
                    const active = paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPaymentMethod(opt.value)}
                        aria-pressed={active}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm"
                        style={{
                          background: active
                            ? 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))'
                            : 'rgba(255,255,255,0.04)',
                          border: active
                            ? '1px solid rgba(155, 127, 255, 0.5)'
                            : '1px solid rgba(240,236,230,0.12)',
                        }}
                      >
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: 'rgba(155,127,255,0.2)',
                            color: '#B8A8FF',
                          }}
                        >
                          {opt.icon}
                        </span>
                        <span className={active ? 'text-foreground' : 'text-foreground/60'}>
                          {opt.label}
                        </span>
                        {active && <Check size={14} className="ml-auto text-gold" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer - price + submit */}
            <div className="p-6 border-t border-border" style={{ background: 'rgba(13,5,33,0.6)' }}>
              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex justify-between text-foreground/60">
                  <span>商品小计</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>运费</span>
                  <span>{shipping === 0 ? '免运费' : `¥${shipping}`}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-border">
                  <span className="text-base">应付总额</span>
                  <span
                    className="text-2xl font-light"
                    style={{
                      background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ¥{(total + shipping).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full py-3 rounded-full text-foreground text-sm tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))',
                  border: '1px solid rgba(155, 127, 255, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, rgba(155,127,255,0.4), rgba(212,168,75,0.3))';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(155, 127, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <CreditCard size={16} />
                {submitting ? '处理中...' : '提交订单'}
              </button>
              {total < 5000 && (
                <p className="text-[10px] text-foreground/40 text-center mt-2">
                  满 ¥5000 免运费 · 还差 ¥{(5000 - total).toLocaleString()}
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}
