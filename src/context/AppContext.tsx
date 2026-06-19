import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Product } from '../services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
}

interface AppState {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isPreviewOpen: boolean;
  previewProduct: Product | null;
}

interface AppContextType extends AppState {
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  toggleCart: () => void;
  toggleWishlist: (id: string) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openPreview: (product: Product) => void;
  closePreview: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('eclat-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eclat-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist from localStorage', e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('eclat-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('eclat-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === String(product.id));
      if (existing) {
        return prev.map((i) => (i.id === String(product.id) ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: String(product.id), name: product.name, price: product.price, img: product.img, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // 使用 useMemo 缓存计算结果，避免每次渲染都重新计算
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);

  const getCartTotal = () => cartTotal;
  const getCartCount = () => cartCount;

  return (
    <AppContext.Provider
      value={{
        cart, wishlist, isCartOpen, isCheckoutOpen, isPreviewOpen, previewProduct,
        addToCart, removeFromCart, updateQty, toggleWishlist,
        toggleCart: () => setIsCartOpen((v) => !v),
        openCheckout: () => { setIsCartOpen(false); setIsCheckoutOpen(true); },
        closeCheckout: () => setIsCheckoutOpen(false),
        openPreview: (p: Product) => { setPreviewProduct(p); setIsPreviewOpen(true); },
        closePreview: () => setIsPreviewOpen(false),
        getCartTotal, getCartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
