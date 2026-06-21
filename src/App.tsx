import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';
import { SectionDivider } from './components/SectionDivider';
import { Marquee } from './components/Marquee';
import { CategorySection } from './components/CategorySection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { BrandStorySection } from './components/BrandStorySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { CartPanel } from './components/CartPanel';
import { WishlistPanel } from './components/WishlistPanel';
import { CheckoutPanel } from './components/CheckoutPanel';
import { ProductPreviewModal } from './components/ProductPreviewModal';
import { OrderConfirmation } from './components/OrderConfirmation';
import { UserCenter } from './components/UserCenter';

function AppInner() {
  const { isCartOpen, toggleCart, isCheckoutOpen, closeCheckout, isPreviewOpen, closePreview } = useApp();
  const [confirmationOrderId, setConfirmationOrderId] = useState<string | null>(null);
  const [isUserCenterOpen, setIsUserCenterOpen] = useState(false);

  // Listen for order-placed event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ orderId: string }>).detail;
      if (detail?.orderId) {
        setConfirmationOrderId(detail.orderId);
      }
    };
    window.addEventListener('eclat:order-placed', handler);
    return () => window.removeEventListener('eclat:order-placed', handler);
  }, []);

  // Listen for open-user-center event (from NavBar)
  useEffect(() => {
    const handler = () => setIsUserCenterOpen(true);
    window.addEventListener('eclat:open-user-center', handler);
    return () => window.removeEventListener('eclat:open-user-center', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0521] text-foreground overflow-x-hidden">
      <NavBar />

      <main>
        <HeroSection />
        <SectionDivider />
        <Marquee />
        <SectionDivider />
        <CategorySection />
        <FeaturedProducts />
        <BrandStorySection />
        <TestimonialsSection />
      </main>

      <Footer />

      {/* Overlay Panels */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] transition-opacity duration-300" onClick={toggleCart} />
      )}
      <CartPanel />
      <WishlistPanel />

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2500] transition-opacity duration-300" onClick={closeCheckout} />
      )}
      <CheckoutPanel />

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[3000] flex items-center justify-center p-8 transition-opacity duration-300" onClick={closePreview} />
      )}
      <ProductPreviewModal />

      {/* Order confirmation overlay (top of all) */}
      {confirmationOrderId && (
        <OrderConfirmation
          orderId={confirmationOrderId}
          onClose={() => setConfirmationOrderId(null)}
          onViewOrders={() => {
            setConfirmationOrderId(null);
            setIsUserCenterOpen(true);
          }}
        />
      )}

      {/* User center */}
      <UserCenter
        isOpen={isUserCenterOpen}
        onClose={() => setIsUserCenterOpen(false)}
        onOpenAuth={() => {
          // Will be triggered via NavBar's existing auth modal logic
          window.dispatchEvent(new CustomEvent('eclat:open-auth-from-center'));
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <ToastProvider>
            <AppInner />
          </ToastProvider>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
