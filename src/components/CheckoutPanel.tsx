import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, CreditCard, Wallet } from 'lucide-react';
import { useState } from 'react';

export function CheckoutPanel() {
  const { isCheckoutOpen, closeCheckout, cart, getCartTotal, getCartCount } = useApp();
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('结算成功！感谢您的购买。');
    closeCheckout();
  };

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
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isCheckoutOpen ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 right-0 w-[480px] max-w-[95vw] h-screen bg-[#0d0521]/98 backdrop-blur-md border-l border-border z-[2501] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-heading text-xl font-normal tracking-[0.05em]">结算</h3>
          <button
            onClick={closeCheckout}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Order Items */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-foreground/50 mb-3">订单商品</h4>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 py-2 border-b border-border/50">
                  <div className="w-[50px] h-[50px] rounded-lg overflow-hidden border border-border flex-shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    <p className="text-xs text-foreground/40">x{item.qty}</p>
                  </div>
                  <div
                    className="font-heading text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ¥{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Form */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-foreground/50 mb-3">收货信息</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: '姓名', key: 'name', placeholder: '请输入姓名' },
                { label: '电话', key: 'phone', placeholder: '请输入电话号码' },
                { label: '地址', key: 'address', placeholder: '请输入收货地址', textarea: true },
                { label: '备注', key: 'note', placeholder: '选填', textarea: true },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="text-xs text-foreground/50 tracking-[0.05em]">{field.label}</label>
                  {field.textarea ? (
                    <textarea
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full p-3 bg-[rgba(255,255,255,0.03)] border border-border rounded-lg text-sm text-foreground resize-none min-h-[60px] focus:border-purple/50 focus:outline-none transition-colors font-sans"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full p-3 bg-[rgba(255,255,255,0.03)] border border-border rounded-lg text-sm text-foreground focus:border-purple/50 focus:outline-none transition-colors font-sans"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-foreground/50 mb-3">支付方式</h4>
            <div className="flex flex-col gap-2">
              {[
                { id: 'alipay', icon: '💰', name: '支付宝' },
                { id: 'wechat', icon: '💚', name: '微信支付' },
                { id: 'bank', icon: '🏦', name: '银行卡' },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                    paymentMethod === method.id
                      ? 'border-purple bg-[rgba(155,127,255,0.08)]'
                      : 'border-border bg-[rgba(255,255,255,0.02)] hover:border-purple/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="w-4 h-4 accent-purple cursor-pointer"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm">{method.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-full text-sm tracking-[0.18em] uppercase transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))',
              border: '1px solid rgba(155,127,255,0.45)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.4), rgba(212,168,75,0.25))';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(155,127,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            确认支付 ¥{getCartTotal().toLocaleString()}
          </button>
        </form>
      </motion.div>
    </>
  );
}
