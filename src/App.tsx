import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from '@/sections/navigation';
import { Hero as HeroEditorial } from '@/sections/hero-light';
import { Products } from '@/sections/products';
import { WhyWax } from '@/sections/why-wax';
import { TrustStrip } from '@/sections/TrustStrip';
import { Footer } from '@/sections/footer';

// Below-the-fold homepage sections — split into their own chunks that stream in
// parallel after first paint. Keeps the initial bundle light; nothing removed.
const Reviews = lazy(() => import('@/sections/reviews').then(m => ({ default: m.Reviews })));
const Origin  = lazy(() => import('@/sections/Origin').then(m => ({ default: m.Origin })));
const About   = lazy(() => import('@/sections/about').then(m => ({ default: m.About })));
const Tools   = lazy(() => import('@/sections/tools').then(m => ({ default: m.Tools })));
const Guides  = lazy(() => import('@/sections/guides').then(m => ({ default: m.Guides })));
const FAQ     = lazy(() => import('@/sections/faq').then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import('@/sections/contact').then(m => ({ default: m.Contact })));
const ClosingCTA = lazy(() => import('@/sections/closing-cta').then(m => ({ default: m.ClosingCTA })));

const StarterSetPage = lazy(() => import('@/pages/StarterSetPage').then(m => ({ default: m.StarterSetPage })));
const RewaxPage = lazy(() => import('@/pages/RewaxPage').then(m => ({ default: m.RewaxPage })));
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
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const WiderrufPage = lazy(() => import('@/pages/WiderrufPage').then(m => ({ default: m.WiderrufPage })));
const WiderrufsbelehrungPage = lazy(() => import('@/pages/WiderrufsbelehrungPage').then(m => ({ default: m.WiderrufsbelehrungPage })));
const VersandUndZahlungPage = lazy(() => import('@/pages/VersandUndZahlungPage').then(m => ({ default: m.VersandUndZahlungPage })));
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/sonner';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cart';
import { checkoutEnabled } from '@/lib/data';
import { ScrollToTop } from '@/components/ScrollToTop';
import { RouteScrollReset } from '@/components/RouteScrollReset';
import { PendingAnchorScroll } from '@/components/PendingAnchorScroll';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MobileStickyCTA } from '@/components/MobileStickyCTA';
import { CartPersistenceHint } from '@/components/CartPersistenceHint';
import { SectionDots } from '@/components/SectionDots';
import { Analytics } from '@vercel/analytics/react';

const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: 'var(--pg)' }} />
);

function AppContent() {
  const fetchStock = useCartStore((s) => s.fetchStock);
  const location = useLocation();

  // /api/stock nur laden, wenn die aktuelle Route ueberhaupt eine
  // Bestandsanzeige zeigen kann (AddToCartButton sitzt nur auf "/",
  // "/produkt/:id" und "/produkt/:id/stage"). Vorher lief der Call auf jeder
  // Route mit — ein Blogartikel, /impressum oder /wissenschaft zeigen nie
  // eine Bestandsanzeige, loesten aber trotzdem bei jedem Erstaufruf einen
  // zusaetzlichen API-Roundtrip aus (Audit vom 05.08.2026). Die Bedingung
  // haengt in den Effect-Deps, damit sie beim ersten Wechsel AUF eine
  // passende Route (z. B. Einstieg ueber einen Blogartikel, dann Klick zur
  // Startseite) erneut feuert, aber nicht bei jedem Produktwechsel innerhalb
  // von "/produkt/*" neu laedt.
  const needsStock = location.pathname === '/' || location.pathname.startsWith('/produkt/');
  useEffect(() => {
    if (needsStock) void fetchStock();
  }, [fetchStock, needsStock]);

  return (
    <div className="min-h-screen bg-wx-bg text-wx-tx1">
      <Analytics />
      <ScrollProgress />
      {checkoutEnabled && <CartPersistenceHint />}
      <RouteScrollReset />
      <ScrollToTop />
      <SectionDots />
      <MobileStickyCTA />
      {checkoutEnabled && <CartDrawer />}
      <Routes>
        <Route path="/produkt/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
        <Route path="/produkt/:id/stage" element={<Suspense fallback={<PageLoader />}><ProductStagePage /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<PageLoader />}><BlogIndexPage /></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogArticlePage /></Suspense>} />
        <Route path="/bestellung-erfolgreich" element={<Suspense fallback={<PageLoader />}><OrderSuccess /></Suspense>} />
        <Route path="/impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
        <Route path="/datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />
        <Route path="/agb" element={<Suspense fallback={<PageLoader />}><AGBPage /></Suspense>} />
        <Route path="/widerruf" element={<Suspense fallback={<PageLoader />}><WiderrufPage /></Suspense>} />
        <Route path="/widerrufsbelehrung" element={<Suspense fallback={<PageLoader />}><WiderrufsbelehrungPage /></Suspense>} />
        <Route path="/versand-und-zahlung" element={<Suspense fallback={<PageLoader />}><VersandUndZahlungPage /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
        <Route path="/starter-set" element={<Suspense fallback={<PageLoader />}><StarterSetPage /></Suspense>} />
        {/* Die Seite lag bis 08/2026 unter /rewax. "Rewax" ist ein Anglizismus,
            nach dem im deutschen Markt praktisch niemand sucht; gesucht wird
            "Kette wachsen lassen". Alte Adresse leitet per 301 hierher
            (vercel.json), damit geteilte Links und QR-Codes weiter greifen. */}
        <Route path="/kette-wachsen-lassen" element={<Suspense fallback={<PageLoader />}><RewaxPage /></Suspense>} />
        <Route path="/wissenschaft" element={<Suspense fallback={<PageLoader />}><SciencePage /></Suspense>} />
        <Route path="/" element={
          <>
            <Navigation />
            <PendingAnchorScroll />
            <main>
              <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
                <HeroEditorial />
              </Suspense>
              {/* Mobile-Plan B1: Produkte nach vorn. Vorher lag WhyWax (rund
                  drei Bildschirme Erklaerung) vor Products, sodass das erste
                  Produkt erst nach vier Bildschirmen sichtbar war. TrustStrip
                  ersetzt hier keinen Inhalt, sondern zieht drei bereits an
                  anderer Stelle stehende Fakten nach oben. WhyWax folgt jetzt
                  NACH Products, gekuerzt (siehe why-wax.tsx). Tools steht vor
                  About: Rechner beantworten Kauffragen, die Gruendergeschichte
                  nicht. Anker-IDs (#produkte, #warum-wachs, #bewertungen, …)
                  unveraendert — Navigation, MobileStickyCTA und
                  PendingAnchorScroll haengen daran. */}
              <TrustStrip />
              <Products />
              <WhyWax />
              <Suspense fallback={null}>
                <Reviews />
                <Origin />
                <Tools />
                <About />
                <Guides />
                <FAQ />
                <Contact />
                <ClosingCTA />
              </Suspense>
            </main>
            <Footer />
          </>
        } />
        {/* Everything else used to fall through to the homepage above at
            status 200 — a broken link looked like it worked, and search
            engines indexed the same content under unlimited URLs. */}
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
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
