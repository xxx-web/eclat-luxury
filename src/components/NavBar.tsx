import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { SearchPanel } from './SearchPanel';

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { wishlist, getCartCount, toggleCart, toggleWishlistPanel, openPreview } = useApp();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for open-auth request from UserCenter / CartPanel
  useEffect(() => {
    const handler = () => {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    };
    window.addEventListener('eclat:open-auth-from-center', handler);
    window.addEventListener('eclat:open-auth-from-checkout', handler);
    return () => {
      window.removeEventListener('eclat:open-auth-from-center', handler);
      window.removeEventListener('eclat:open-auth-from-checkout', handler);
    };
  }, []);

  const navLinks = [
    { label: '品类', href: '#categories' },
    { label: '臻选', href: '#products' },
    { label: '品牌', href: '#story' },
    { label: '评价', href: '#testimonials' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0d0521]/95 backdrop-blur-md py-3 h-15' : 'bg-transparent py-5 h-18'
      }`}
      style={{ borderBottom: isScrolled ? '1px solid rgba(240,236,230,0.08)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between h-full">
        {/* Logo - v29 style: simple gradient text, no glass pill */}
        <a
          href="#hero"
          className="font-serif text-[1.55rem] font-medium"
          style={{
            letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #B8A8FF, #F0CC8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ÉCLAT
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm tracking-[0.12em] uppercase text-foreground/60 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="搜索产品"
            className="luxury-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"
          >
            <Search size={18} />
          </button>

          <div className="relative">
            <button
              onClick={toggleWishlistPanel}
              aria-label={`心愿单（${wishlist.length} 件商品）`}
              className={`luxury-glass w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                wishlist.length > 0 ? 'text-red-400' : 'text-foreground/60 hover:text-red-400'
              }`}
            >
              <Heart size={18} fill={wishlist.length > 0 ? 'currentColor' : 'none'} />
            </button>
            {wishlist.length > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[11px] font-bold flex items-center justify-center text-white border-2 border-[#0d0521] pointer-events-none"
                style={{ zIndex: 9999, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
              >
                {wishlist.length > 99 ? '99+' : wishlist.length}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleCart}
              aria-label={`购物车（${getCartCount()} 件商品）`}
              className={`luxury-glass w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                getCartCount() > 0 ? 'text-primary' : 'text-foreground/60 hover:text-primary'
              }`}
            >
              <ShoppingCart size={18} />
            </button>
            {getCartCount() > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-[11px] font-bold flex items-center justify-center text-primary-foreground border-2 border-[#0d0521] pointer-events-none"
                style={{ zIndex: 9999, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
              >
                {getCartCount() > 99 ? '99+' : getCartCount()}
              </span>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden luxury-glass w-10 h-10 rounded-full flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Auth Buttons - Desktop only */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('eclat:open-user-center'));
                }}
                aria-label="打开用户中心"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.78rem] tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors"
                style={{
                  background: 'rgba(155, 127, 255, 0.05)',
                  border: '1px solid rgba(155, 127, 255, 0.15)',
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(155,127,255,0.3), rgba(212,168,75,0.2))',
                    color: '#B8A8FF',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name}
              </button>
              <button
                onClick={logout}
                className="px-4 py-1.5 rounded-full text-[0.78rem] tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors"
                style={{
                  border: '1px solid rgba(240,236,230,0.12)',
                }}
              >
                退出
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-full text-[0.78rem] tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors"
                style={{
                  border: '1px solid rgba(240,236,230,0.12)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(155,127,255,0.5)';
                  e.currentTarget.style.color = '#B8A8FF';
                  e.currentTarget.style.background = 'rgba(155,127,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(240,236,230,0.12)';
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.background = '';
                }}
              >
                登录
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-full text-[0.78rem] tracking-[0.1em] uppercase text-foreground transition-colors"
                style={{
                  background: 'linear-gradient(135deg, rgba(155,127,255,0.15), rgba(212,168,75,0.1))',
                  border: '1px solid rgba(155,127,255,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.25), rgba(212,168,75,0.15))';
                  e.currentTarget.style.borderColor = 'rgba(155,127,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,127,255,0.15), rgba(212,168,75,0.1))';
                  e.currentTarget.style.borderColor = 'rgba(155,127,255,0.3)';
                }}
              >
                注册
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#0d0521]/98 backdrop-blur-md"
            style={{ borderBottom: '1px solid rgba(240,236,230,0.08)' }}
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors border-b border-border pb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Auth Buttons */}
              {user ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('eclat:open-user-center'));
                    }}
                    className="text-lg tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors pb-4 border-b border-border text-left"
                  >
                    用户中心
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-lg tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors pb-4 border-b border-border text-left"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-lg tracking-[0.1em] uppercase text-foreground/60 hover:text-foreground transition-colors pb-4 border-b border-border text-left"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-lg tracking-[0.1em] uppercase text-foreground hover:text-primary transition-colors pb-4 border-b border-border text-left"
                  >
                    注册
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Search Panel */}
      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(p) => openPreview(p)}
      />
    </motion.nav>
  );
}
