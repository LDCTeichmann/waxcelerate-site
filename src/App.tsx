import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/sections/navigation';
import { Hero } from '@/sections/hero';
import { Products } from '@/sections/products';
import { WhyWax } from '@/sections/why-wax';
import { Tools } from '@/sections/tools';
import { Guides } from '@/sections/guides';
import { FAQ } from '@/sections/faq';
import { About } from '@/sections/about';
import { Reviews } from '@/sections/reviews';
import { Contact } from '@/sections/contact';
import { Footer } from '@/sections/footer';

const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage').then(m => ({ default: m.ImpressumPage })));
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage').then(m => ({ default: m.DatenschutzPage })));
const AGBPage = lazy(() => import('@/pages/AGBPage').then(m => ({ default: m.AGBPage })));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const BlogIndexPage = lazy(() => import('@/pages/blog/BlogIndexPage').then(m => ({ default: m.BlogIndexPage })));
const BlogArticlePage = lazy(() => import('@/pages/blog/BlogArticlePage').then(m => ({ default: m.BlogArticlePage })));
const SciencePage = lazy(() => import('@/pages/SciencePage').then(m => ({ default: m.SciencePage })));
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/sonner';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cart';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MobileStickyCTA } from '@/components/MobileStickyCTA';
import { CartPersistenceHint } from '@/components/CartPersistenceHint';
import { SectionDots } from '@/components/SectionDots';

const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--pg)' }} />
);

function AppContent() {
  const fetchStock = useCartStore((s) => s.fetchStock);

  useEffect(() => { void fetchStock(); }, [fetchStock]);

  return (
    <div className="min-h-screen bg-wx-bg text-wx-tx1">
      <ScrollProgress />
      <CartPersistenceHint />
      <ScrollToTop />
      <SectionDots />
      <MobileStickyCTA />
      <CartDrawer />
      <Routes>
        <Route path="/produkt/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<PageLoader />}><BlogIndexPage /></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogArticlePage /></Suspense>} />
        <Route path="/bestellung-erfolgreich" element={<Suspense fallback={<PageLoader />}><OrderSuccess /></Suspense>} />
        <Route path="/impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
        <Route path="/datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />
        <Route path="/agb" element={<Suspense fallback={<PageLoader />}><AGBPage /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
        <Route path="/wissenschaft" element={<Suspense fallback={<PageLoader />}><SciencePage /></Suspense>} />
        <Route path="*" element={
          <>
            <Navigation />
            <main>
              <Hero />
              <WhyWax />
              <Reviews />
              <Products />
              <About />
              <Tools />
              <Guides />
              <FAQ />
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
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
