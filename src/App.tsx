import { BrowserRouter } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';
import { CategorySection } from './components/CategorySection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { BrandStorySection } from './components/BrandStorySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { CartPanel } from './components/CartPanel';
import { CheckoutPanel } from './components/CheckoutPanel';
import { ProductPreviewModal } from './components/ProductPreviewModal';

function AppInner() {
  const { isCartOpen, toggleCart, isCheckoutOpen, closeCheckout, isPreviewOpen, closePreview } = useApp();

  return (
    <div className="min-h-screen bg-[#0d0521] text-foreground overflow-x-hidden">
      <NavBar />

      <main>
        <HeroSection />
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

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2500] transition-opacity duration-300" onClick={closeCheckout} />
      )}
      <CheckoutPanel />

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[3000] flex items-center justify-center p-8 transition-opacity duration-300" onClick={closePreview} />
      )}
      <ProductPreviewModal />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
