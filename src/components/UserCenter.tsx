import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  User,
  MapPin,
  LogOut,
  Star,
  Clock,
  Check,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOrders, useAddresses, type Address } from '../hooks/useOrders';
import { useReviews } from '../hooks/useOrders';

interface UserCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

type Tab = 'orders' | 'profile' | 'addresses';

const statusLabels = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消',
} as const;

const statusColors = {
  pending: '#F0CC8A',
  paid: '#86EFAC',
  shipped: '#93C5FD',
  delivered: '#86EFAC',
  cancelled: '#FCA5A5',
} as const;

export function UserCenter({ isOpen, onClose, onOpenAuth }: UserCenterProps) {
  const { user, logout } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useAddresses();
  const { addReview, getReviewsFor } = useReviews();

  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [reviewingOrder, setReviewingOrder] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    name: '',
    phone: '',
    province: '',
    city: '',
    detail: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('orders');
      setReviewingOrder(null);
      setShowAddAddress(false);
    }
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

  if (!isOpen) return null;

  // Not logged in state
  if (!user) {
    return (
      <div
        className="fixed inset-0 z-[2800] flex items-center justify-center p-4"
        style={{ background: 'rgba(13,5,33,0.85)', backdropFilter: 'blur(8px)' }}
        role="dialog"
        aria-modal="true"
        aria-label="用户中心"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            background:
              'linear-gradient(180deg, rgba(20, 12, 40, 0.98) 0%, rgba(13, 5, 33, 0.98) 100%)',
            border: '1px solid rgba(155, 127, 255, 0.2)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <X size={16} />
          </button>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(155,127,255,0.1)' }}
          >
            <User size={28} className="text-foreground/60" />
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-2">未登录</h2>
          <p className="text-sm text-foreground/60 mb-6">登录后查看您的订单、地址和评价</p>
          <button
            onClick={() => {
              onClose();
              setTimeout(onOpenAuth, 200);
            }}
            className="w-full py-3 rounded-full text-foreground text-sm tracking-[0.15em] uppercase"
            style={{
              background: 'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))',
              border: '1px solid rgba(155, 127, 255, 0.4)',
            }}
          >
            登录 / 注册
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSubmitReview = (productId: string) => {
    if (!reviewContent.trim()) return;
    addReview({
      productId,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      content: reviewContent.trim(),
    });
    setReviewContent('');
    setReviewRating(5);
    setReviewProductId(null);
    setReviewingOrder(null);
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.detail) return;
    addAddress(newAddress);
    setNewAddress({
      name: '',
      phone: '',
      province: '',
      city: '',
      detail: '',
      isDefault: false,
    });
    setShowAddAddress(false);
  };

  return (
    <div
      className="fixed inset-0 z-[2800] flex items-start justify-center pt-4 md:pt-12 px-2 md:px-4 overflow-y-auto"
      style={{ background: 'rgba(13,5,33,0.85)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="用户中心"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden my-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(20, 12, 40, 0.98) 0%, rgba(13, 5, 33, 0.98) 100%)',
          border: '1px solid rgba(155, 127, 255, 0.2)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-foreground">用户中心</h1>
            <p className="text-xs text-foreground/50 mt-1">欢迎回来，{user.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭用户中心"
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 md:px-8 border-b border-border flex gap-1">
          {[
            { id: 'orders' as const, label: '我的订单', icon: Package },
            { id: 'profile' as const, label: '个人资料', icon: User },
            { id: 'addresses' as const, label: '地址簿', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm tracking-[0.1em] transition-colors border-b-2 ${
                  active
                    ? 'text-foreground'
                    : 'text-foreground/50 hover:text-foreground/80'
                }`}
                style={{
                  borderBottomColor: active ? '#D4A84B' : 'transparent',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-foreground/60 hover:text-foreground transition-colors"
            >
              <LogOut size={13} />
              退出登录
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 min-h-[400px] max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {orders.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="还没有订单"
                    desc="浏览臻品后下单，订单会显示在这里"
                  />
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl p-5"
                        style={{
                          background: 'rgba(26,26,46,0.5)',
                          border: '1px solid rgba(240,236,230,0.08)',
                        }}
                      >
                        {/* Order header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-foreground/50 flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            <span className="text-xs font-mono text-foreground/70">
                              {order.id}
                            </span>
                          </div>
                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: `${statusColors[order.status]}20`,
                              color: statusColors[order.status],
                              border: `1px solid ${statusColors[order.status]}40`,
                            }}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-3 mb-4">
                          {order.items.map((item) => {
                            const reviewable =
                              order.status === 'paid' ||
                              order.status === 'shipped' ||
                              order.status === 'delivered';
                            return (
                              <div key={item.productId} className="flex items-center gap-3">
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-14 h-14 object-cover rounded-md"
                                  style={{ background: 'rgba(255,255,255,0.04)' }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{item.name}</p>
                                  <p className="text-xs text-foreground/50">x{item.qty}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <p
                                    className="text-sm"
                                    style={{
                                      background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent',
                                      backgroundClip: 'text',
                                    }}
                                  >
                                    ¥{(item.price * item.qty).toLocaleString()}
                                  </p>
                                  {reviewable && (
                                    <button
                                      onClick={() => {
                                        setReviewingOrder(order.id);
                                        setReviewProductId(item.productId);
                                      }}
                                      className="text-[10px] px-2 py-1 rounded border text-foreground/60 hover:text-foreground transition-colors"
                                      style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                                    >
                                      评价
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Total + actions */}
                        <div className="flex items-center justify-between text-xs text-foreground/60 pt-3 border-t border-border">
                          <span>共 {order.items.reduce((s, i) => s + i.qty, 0)} 件</span>
                          <span>
                            实付：
                            <span
                              className="ml-1 text-base font-medium"
                              style={{
                                background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                              }}
                            >
                              ¥{order.total.toLocaleString()}
                            </span>
                          </span>
                        </div>
                        {order.status === 'paid' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="mt-3 w-full text-xs py-2 rounded text-red-400/70 hover:text-red-400 border transition-colors"
                            style={{ borderColor: 'rgba(239,68,68,0.2)' }}
                          >
                            取消订单
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))',
                      border: '1px solid rgba(155, 127, 255, 0.4)',
                      color: '#B8A8FF',
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{user.name}</h2>
                    <p className="text-sm text-foreground/60 mt-1">{user.email}</p>
                    <p className="text-xs text-foreground/40 mt-1">
                      注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  <StatCard label="总订单" value={orders.length} />
                  <StatCard
                    label="已购买"
                    value={orders.filter((o) => o.status !== 'cancelled').length}
                  />
                  <StatCard
                    label="收藏"
                    value={0}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-foreground/60">已保存 {addresses.length} 个地址</p>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-foreground transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, rgba(155,127,255,0.2), rgba(212,168,75,0.1))',
                      border: '1px solid rgba(155, 127, 255, 0.3)',
                    }}
                  >
                    <Plus size={13} />
                    新增地址
                  </button>
                </div>

                {showAddAddress && (
                  <div
                    className="rounded-xl p-4 mb-4 space-y-3"
                    style={{
                      background: 'rgba(26,26,46,0.5)',
                      border: '1px solid rgba(155, 127, 255, 0.2)',
                    }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="姓名"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress((p) => ({ ...p, name: e.target.value }))}
                        className="px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm"
                        style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                      />
                      <input
                        type="tel"
                        placeholder="手机号"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                        className="px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm"
                        style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                      />
                      <input
                        type="text"
                        placeholder="省"
                        value={newAddress.province}
                        onChange={(e) => setNewAddress((p) => ({ ...p, province: e.target.value }))}
                        className="px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm"
                        style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                      />
                      <input
                        type="text"
                        placeholder="市"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                        className="px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm"
                        style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="详细地址"
                      value={newAddress.detail}
                      onChange={(e) => setNewAddress((p) => ({ ...p, detail: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm"
                      style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                    />
                    <label className="flex items-center gap-2 text-xs text-foreground/60">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress((p) => ({ ...p, isDefault: e.target.checked }))}
                      />
                      设为默认地址
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-1.5 rounded-full text-xs text-foreground"
                        style={{
                          background: 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))',
                          border: '1px solid rgba(155, 127, 255, 0.4)',
                        }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 py-1.5 rounded-full text-xs text-foreground/60"
                        style={{ border: '1px solid rgba(240,236,230,0.12)' }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title="还没有保存地址"
                    desc="新增地址便于结算时一键使用"
                  />
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-xl p-4"
                        style={{
                          background: 'rgba(26,26,46,0.5)',
                          border: '1px solid rgba(240,236,230,0.08)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{addr.name}</span>
                            <span className="text-xs text-foreground/50">{addr.phone}</span>
                            {addr.isDefault && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: 'rgba(212, 168, 75, 0.15)',
                                  color: '#F0CC8A',
                                }}
                              >
                                默认
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {!addr.isDefault && (
                              <button
                                onClick={() => setDefaultAddress(addr.id)}
                                className="text-[10px] px-2 py-1 text-foreground/60 hover:text-foreground"
                              >
                                设为默认
                              </button>
                            )}
                            <button
                              onClick={() => removeAddress(addr.id)}
                              className="text-[10px] px-2 py-1 text-red-400/70 hover:text-red-400"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/70">
                          {addr.province} {addr.city} {addr.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Review modal */}
        <AnimatePresence>
          {reviewingOrder && reviewProductId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-6"
              style={{ background: 'rgba(13,5,33,0.85)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-2xl p-6"
                style={{
                  background: 'linear-gradient(180deg, rgba(20, 12, 40, 0.98), rgba(13, 5, 33, 0.98))',
                  border: '1px solid rgba(155, 127, 255, 0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg">商品评价</h3>
                  <button
                    onClick={() => setReviewingOrder(null)}
                    aria-label="关闭"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setReviewRating(n)}
                      aria-label={`${n} 星`}
                      className="p-1"
                    >
                      <Star
                        size={28}
                        className={n <= reviewRating ? '' : 'text-foreground/20'}
                        fill={n <= reviewRating ? '#D4A84B' : 'none'}
                        stroke={n <= reviewRating ? '#D4A84B' : 'currentColor'}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="分享您的购物体验..."
                  rows={4}
                  className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.04)] border outline-none text-sm resize-none mb-4"
                  style={{ borderColor: 'rgba(240,236,230,0.12)' }}
                />

                <button
                  onClick={() => handleSubmitReview(reviewProductId)}
                  disabled={!reviewContent.trim()}
                  className="w-full py-2.5 rounded-full text-foreground text-sm tracking-[0.1em] uppercase transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))',
                    border: '1px solid rgba(155, 127, 255, 0.4)',
                  }}
                >
                  提交评价
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: typeof Package; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(155, 127, 255, 0.08)' }}
      >
        <Icon size={28} className="text-foreground/40" />
      </div>
      <p className="text-foreground/80 mb-1">{title}</p>
      <p className="text-foreground/40 text-sm">{desc}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        background: 'rgba(26,26,46,0.5)',
        border: '1px solid rgba(240,236,230,0.08)',
      }}
    >
      <p
        className="text-2xl font-light"
        style={{
          background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </p>
      <p className="text-xs text-foreground/50 mt-1">{label}</p>
    </div>
  );
}
