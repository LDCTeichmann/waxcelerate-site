import { useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/sections/navigation';
import { Hero } from '@/sections/hero';
import { SocialProof } from '@/sections/social-proof';
import { CustomCursor } from '@/components/CustomCursor';
import { Products } from '@/sections/products';
import { WhyWax } from '@/sections/why-wax';
import { Tools } from '@/sections/tools';
import { Guides } from '@/sections/guides';
import { FAQ } from '@/sections/faq';
import { About } from '@/sections/about';
import { Contact } from '@/sections/contact';
import { Footer } from '@/sections/footer';

const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage').then(m => ({ default: m.ImpressumPage })));
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage').then(m => ({ default: m.DatenschutzPage })));
const AGBPage = lazy(() => import('@/pages/AGBPage').then(m => ({ default: m.AGBPage })));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { CartDrawer } from '@/components/CartDrawer';

const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--pg)' }} />
);

// Konami code for specs
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function AppContent() {
  const { lang } = useLanguage();
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [logoClicks, setLogoClicks] = useState(0);

  // Konami code - shows technical specs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIdx]) {
        const next = konamiIdx + 1;
        setKonamiIdx(next);
        if (next === KONAMI.length) {
          toast(
            <div className="text-sm">
              <p className="font-semibold mb-1">Waxcelerate Specs</p>
              <p className="text-[#8896B0]">Schmelzpunkt: 58°C | Bad-Temp: 85°C | PTFE: &lt;1μm</p>
              <p className="text-zinc-500 text-xs mt-1">Made in Stuttgart • Ships worldwide</p>
            </div>,
            { duration: 5000 }
          );
          setKonamiIdx(0);
        }
      } else {
        setKonamiIdx(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [konamiIdx]);

  // Logo click Easter egg - 5 clicks shows hint
  useEffect(() => {
    if (logoClicks === 5) {
      toast.info(lang === 'de' ? 'Profi-Tipp: Pfeiltasten ↑↑↓↓←→←→BA' : 'Pro tip: Arrow keys ↑↑↓↓←→←→BA', {
        duration: 3000,
      });
      setLogoClicks(0);
    }
  }, [logoClicks, lang]);

  const handleLogoClick = useCallback(() => {
    setLogoClicks(c => c + 1);
  }, []);

  return (
    <div className="min-h-screen bg-wx-bg text-wx-tx1">
      <CustomCursor />
      <CartDrawer />
      <Routes>
        <Route path="/produkt/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
        <Route path="/bestellung-erfolgreich" element={<Suspense fallback={<PageLoader />}><OrderSuccess /></Suspense>} />
        <Route path="/impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
        <Route path="/datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />
        <Route path="/agb" element={<Suspense fallback={<PageLoader />}><AGBPage /></Suspense>} />
        <Route path="*" element={
          <>
            <Navigation onLogoClick={handleLogoClick} />
            <main>
              <Hero />
              <SocialProof />
              <WhyWax />
              <Products />
              <Tools />
              <Guides />
              <FAQ />
              <About />
              <Contact />
            </main>
            <Footer />
          </>
        } />
      </Routes>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#141414',
          border: '1px solid #27272a',
          color: '#fff',
        },
      }} />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
