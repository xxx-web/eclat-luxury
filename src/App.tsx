import { BrowserRouter } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { UserProvider } from './context/UserContext';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';
import { BrandStorySection } from './components/BrandStorySection';
import { SignatureCollections } from './components/SignatureCollections';
import { FeaturedProducts } from './components/FeaturedProducts';
import { CraftSection } from './components/CraftSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ClosingCTASection } from './components/ClosingCTASection';
import { RecommendationSection } from './components/RecommendationSection';
import { Footer } from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <UserProvider>
          <div className="min-h-screen bg-[#0d0521] text-foreground">
            <NavBar />
            
            <main>
              <HeroSection />
              <BrandStorySection />
              <SignatureCollections />
              <FeaturedProducts />
              <CraftSection />
              <TestimonialsSection />
              <RecommendationSection />
              <ClosingCTASection />
            </main>
            
            <Footer />
          </div>
        </UserProvider>
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;
