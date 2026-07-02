import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/sections/navigation';
import { Hero as HeroEditorial } from '@/sections/hero-light';
import { Products } from '@/sections/products';
import { WhyWax } from '@/sections/why-wax';
import { Footer } from '@/sections/footer';

// A/B hero variants (only served on ports 5177/5178 or ?hero=) — lazy so the
// default build never ships two extra hero implementations.
const HeroSpecimen = lazy(() => import('@/sections/hero-light-award').then(m => ({ default: m.HeroAward })));
const HeroGallery  = lazy(() => import('@/sections/hero').then(m => ({ default: m.Hero })));

// Below-the-fold homepage sections — split into their own chunks that stream in
// parallel after first paint. Keeps the initial bundle light; nothing removed.
const Reviews = lazy(() => import('@/sections/reviews').then(m => ({ default: m.Reviews })));
const About   = lazy(() => import('@/sections/about').then(m => ({ default: m.About })));
const Tools   = lazy(() => import('@/sections/tools').then(m => ({ default: m.Tools })));
const Guides  = lazy(() => import('@/sections/guides').then(m => ({ default: m.Guides })));
const FAQ     = lazy(() => import('@/sections/faq').then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import('@/sections/contact').then(m => ({ default: m.Contact })));

const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ProductStagePage = lazy(() => import('@/pages/ProductStagePage').then(m => ({ default: m.ProductStagePage })));
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
import { PendingAnchorScroll } from '@/components/PendingAnchorScroll';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MobileStickyCTA } from '@/components/MobileStickyCTA';
import { CartPersistenceHint } from '@/components/CartPersistenceHint';
import { SectionDots } from '@/components/SectionDots';

const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--pg)' }} />
);

// ── Hero A/B registry ───────────────────────────────────────────────────────
// Three named heroes, pickable by `?hero=<name>` or by dev-server port:
//   gallery   → the original dark photo-stage hero      (port 5178)
//   editorial → the current light editorial hero         (port 5176, default)
//   specimen  → the bold "award" variant (callouts etc.) (port 5177)
// Production (no port, no flag) always renders `editorial`.
const HEROES = { gallery: HeroGallery, editorial: HeroEditorial, specimen: HeroSpecimen } as const;
type HeroName = keyof typeof HEROES;
const PORT_TO_HERO: Record<string, HeroName> = { '5176': 'editorial', '5177': 'specimen', '5178': 'gallery' };

function pickHero(): HeroName {
  if (typeof window === 'undefined') return 'editorial';
  const q = new URLSearchParams(window.location.search).get('hero');
  if (q && q in HEROES) return q as HeroName;
  return PORT_TO_HERO[window.location.port] ?? 'editorial';
}
const HeroVariant = HEROES[pickHero()];

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
        <Route path="/produkt/:id/stage" element={<Suspense fallback={<PageLoader />}><ProductStagePage /></Suspense>} />
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
            <PendingAnchorScroll />
            <main>
              <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
                <HeroVariant />
              </Suspense>
              <WhyWax />
              <Products />
              <Suspense fallback={null}>
                <Reviews />
                <About />
                <Tools />
                <Guides />
                <FAQ />
                <Contact />
              </Suspense>
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
