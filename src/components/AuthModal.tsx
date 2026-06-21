import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccess('');
      setSubmitting(false);
    }
  }, [isOpen, initialMode]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (mode === 'register') {
      const result = register(name, email, password);
      if (!result.ok) {
        setError(result.error || '注册失败');
        setSubmitting(false);
        return;
      }
      setSuccess('注册成功！欢迎加入 ÉCLAT');
      setSubmitting(false);
      setTimeout(() => {
        onClose();
        setName('');
        setEmail('');
        setPassword('');
      }, 1200);
    } else {
      const result = login(email, password);
      if (!result.ok) {
        setError(result.error || '登录失败');
        setSubmitting(false);
        return;
      }
      setSuccess('登录成功！');
      setSubmitting(false);
      setTimeout(() => {
        onClose();
        setName('');
        setEmail('');
        setPassword('');
      }, 800);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          style={{ background: 'rgba(13, 5, 33, 0.75)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(20, 12, 40, 0.98) 0%, rgba(13, 5, 33, 0.98) 100%)',
              border: '1px solid rgba(155, 127, 255, 0.2)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="关闭"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center">
              <div
                className="font-serif italic text-2xl mb-2"
                style={{
                  background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ÉCLAT
              </div>
              <h2
                id="auth-modal-title"
                className="font-serif text-2xl text-foreground mb-2"
              >
                {mode === 'login' ? '欢迎回来' : '加入 ÉCLAT'}
              </h2>
              <p className="text-sm text-foreground/60">
                {mode === 'login' ? '登录您的账户以继续' : '创建账户，开启奢品之旅'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8">
              {mode === 'register' && (
                <div className="mb-4">
                  <label className="block text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder-foreground/30 outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(240, 236, 230, 0.08)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(155, 127, 255, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(240, 236, 230, 0.08)';
                    }}
                    aria-label="姓名"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-lg text-foreground placeholder-foreground/30 outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(240, 236, 230, 0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 127, 255, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(240, 236, 230, 0.08)';
                  }}
                  aria-label="邮箱"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'}
                  className="w-full px-4 py-3 rounded-lg text-foreground placeholder-foreground/30 outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(240, 236, 230, 0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 127, 255, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(240, 236, 230, 0.08)';
                  }}
                  aria-label="密码"
                />
              </div>

              {/* Error / Success Message */}
              {error && (
                <div
                  className="mb-4 px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                  }}
                  role="alert"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="mb-4 px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#86EFAC',
                  }}
                  role="status"
                >
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full text-foreground text-sm tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))',
                  border: '1px solid rgba(155, 127, 255, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.4), rgba(212,168,75,0.3))';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(155, 127, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.2))';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {submitting ? '处理中...' : mode === 'login' ? '登录' : '注册'}
              </button>

              {/* Switch Mode */}
              <div className="mt-6 text-center text-sm text-foreground/60">
                {mode === 'login' ? '还没有账户？' : '已有账户？'}{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium transition-colors"
                  style={{ color: '#B8A8FF' }}
                >
                  {mode === 'login' ? '立即注册' : '立即登录'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
