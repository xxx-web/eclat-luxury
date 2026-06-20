import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Package, MapPin, CreditCard } from 'lucide-react';
import { useOrders, type Order } from '../hooks/useOrders';
import { useApp } from '../context/AppContext';

interface OrderConfirmationProps {
  orderId: string;
  onClose: () => void;
  onViewOrders: () => void;
}

const statusLabels: Record<Order['status'], string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消',
};

const statusColors: Record<Order['status'], string> = {
  pending: '#F0CC8A',
  paid: '#86EFAC',
  shipped: '#93C5FD',
  delivered: '#86EFAC',
  cancelled: '#FCA5A5',
};

export function OrderConfirmation({ orderId, onClose, onViewOrders }: OrderConfirmationProps) {
  const { orders } = useOrders();
  const { clearCart } = useApp();
  const [countdown, setCountdown] = useState(8);

  const order = orders.find((o) => o.id === orderId);

  // Clear cart on mount
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Auto redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      onViewOrders();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onViewOrders]);

  if (!order) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4" style={{ background: 'rgba(13,5,33,0.9)', backdropFilter: 'blur(8px)' }}>
        <div className="text-center">
          <p className="text-foreground/60 mb-4">订单不存在</p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))',
              border: '1px solid rgba(155, 127, 255, 0.3)',
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const paymentLabel = {
    alipay: '支付宝',
    wechat: '微信支付',
    card: '银行卡',
  }[order.payment];

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(13,5,33,0.92)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirm-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden my-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(20, 12, 40, 0.98) 0%, rgba(13, 5, 33, 0.98) 100%)',
          border: '1px solid rgba(155, 127, 255, 0.2)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Success header */}
        <div className="px-8 pt-10 pb-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(134, 239, 172, 0.08) 0%, transparent 60%)',
            }}
          />
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6, delay: 0.1 }}
            className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.2), rgba(74, 222, 128, 0.1))',
              border: '1px solid rgba(134, 239, 172, 0.4)',
            }}
          >
            <Check size={32} className="text-green-400" strokeWidth={2.5} />
          </motion.div>
          <h1
            id="order-confirm-title"
            className="font-serif text-2xl text-foreground mb-2"
          >
            订单提交成功
          </h1>
          <p className="text-sm text-foreground/60">
            感谢您的购买 · 订单已进入处理流程
          </p>
        </div>

        {/* Order meta */}
        <div className="px-8 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-b border-border">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/50 mb-1">
              订单号
            </p>
            <p className="text-sm font-mono text-foreground">{order.id}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/50 mb-1">
              下单时间
            </p>
            <p className="text-sm text-foreground">
              {new Date(order.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/50 mb-1">
              订单状态
            </p>
            <p className="text-sm font-medium" style={{ color: statusColors[order.status] }}>
              {statusLabels[order.status]}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center gap-2 mb-4 text-foreground/60">
            <Package size={16} />
            <h2 className="text-xs tracking-[0.2em] uppercase">
              订单商品 · {order.items.reduce((s, i) => s + i.qty, 0)} 件
            </h2>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4">
                <img
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">x{item.qty}</p>
                </div>
                <p
                  className="text-sm font-medium flex-shrink-0"
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

        {/* Shipping + Payment */}
        <div className="px-8 py-6 border-b border-border space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground/60">
              <MapPin size={14} />
              <span className="text-xs tracking-[0.15em] uppercase">收货信息</span>
            </div>
            <div className="text-sm text-foreground/80 pl-6">
              <p>
                {order.shipping.name} · {order.shipping.phone}
              </p>
              <p className="text-foreground/60 mt-0.5">{order.shipping.address}</p>
              {order.shipping.note && (
                <p className="text-foreground/50 text-xs mt-1">
                  备注：{order.shipping.note}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground/60">
              <CreditCard size={14} />
              <span className="text-xs tracking-[0.15em] uppercase">支付方式</span>
            </div>
            <p className="text-sm text-foreground/80 pl-6">{paymentLabel}</p>
          </div>
        </div>

        {/* Total */}
        <div className="px-8 py-6 flex items-center justify-between">
          <span className="text-sm text-foreground/60">应付总额</span>
          <span
            className="text-3xl font-light"
            style={{
              background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ¥{order.total.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
        <div
          className="px-8 py-5 flex flex-col sm:flex-row gap-3 border-t border-border"
          style={{ background: 'rgba(13,5,33,0.5)' }}
        >
          <button
            onClick={onViewOrders}
            className="flex-1 py-2.5 rounded-full text-foreground text-sm tracking-[0.1em] transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))',
              border: '1px solid rgba(155, 127, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(155,127,255,0.4), rgba(212,168,75,0.3))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))';
            }}
          >
            查看我的订单
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm tracking-[0.1em] text-foreground/60 hover:text-foreground transition-colors"
            style={{ border: '1px solid rgba(240,236,230,0.12)' }}
          >
            继续购物（{countdown}s）
          </button>
        </div>
      </motion.div>
    </div>
  );
}
