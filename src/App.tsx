import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from '@/sections/navigation';
import { Hero as HeroEditorial } from '@/sections/hero-light';
import { Products } from '@/sections/products';
import { Footer } from '@/sections/footer';

// Below-the-fold homepage sections — split into their own chunks that stream in
// parallel after first paint. Keeps the initial bundle light; nothing removed.
// WhyWax (Vergleich, Wissenschafts-Teaser, Slider) liegt unter Products, also
// nie im ersten Bildschirm — raus aus dem Startchunk (Mobile-Audit 15.09.2026).
//
// Seitenordnung Chat 2: die Startseite endet jetzt nach Reviews. TrustStrip,
// Origin und ClosingCTA sind geloescht (wiederholten nur Hero-Zahlen bzw.
// zogen Kennzahlen vor, die jetzt schon im Hero-Fussstreifen stehen). About,
// FAQ und Contact ziehen mit der Seitenordnung nach /kontakt bzw. /blog um
// (Chat 4) — hier nur die Imports/Sektionen entfernt, die Dateien selbst
// raeumt Chat 4 ab.
const WhyWax  = lazy(() => import('@/sections/why-wax').then(m => ({ default: m.WhyWax })));
const Reviews = lazy(() => import('@/sections/reviews').then(m => ({ default: m.Reviews })));

const StarterSetPage = lazy(() => import('@/pages/StarterSetPage').then(m => ({ default: m.StarterSetPage })));
const RewaxPage = lazy(() => import('@/pages/RewaxPage').then(m => ({ default: m.RewaxPage })));
const RewaxCityPage = lazy(() => import('@/pages/RewaxCityPage').then(m => ({ default: m.RewaxCityPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ProductStagePage = lazy(() => import('@/pages/ProductStagePage').then(m => ({ default: m.ProductStagePage })));
const AccessoryDetailPage = lazy(() => import('@/pages/AccessoryDetailPage').then(m => ({ default: m.AccessoryDetailPage })));
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage').then(m => ({ default: m.ImpressumPage })));
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage').then(m => ({ default: m.DatenschutzPage })));
const AGBPage = lazy(() => import('@/pages/AGBPage').then(m => ({ default: m.AGBPage })));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const BlogIndexPage = lazy(() => import('@/pages/blog/BlogIndexPage').then(m => ({ default: m.BlogIndexPage })));
const BlogArticlePage = lazy(() => import('@/pages/blog/BlogArticlePage').then(m => ({ default: m.BlogArticlePage })));
const SciencePage = lazy(() => import('@/pages/SciencePage').then(m => ({ default: m.SciencePage })));
const RechnerToolPage = lazy(() => import('@/pages/RechnerPage').then(m => ({ default: m.RechnerToolPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const WiderrufPage = lazy(() => import('@/pages/WiderrufPage').then(m => ({ default: m.WiderrufPage })));
const WiderrufsbelehrungPage = lazy(() => import('@/pages/WiderrufsbelehrungPage').then(m => ({ default: m.WiderrufsbelehrungPage })));
const VersandUndZahlungPage = lazy(() => import('@/pages/VersandUndZahlungPage').then(m => ({ default: m.VersandUndZahlungPage })));
const KontaktPage = lazy(() => import('@/pages/KontaktPage').then(m => ({ default: m.KontaktPage })));
const AnleitungPage = lazy(() => import('@/pages/AnleitungPage').then(m => ({ default: m.AnleitungPage })));
const KettenPage = lazy(() => import('@/pages/KettenPage').then(m => ({ default: m.KettenPage })));
const KettenwachsPage = lazy(() => import('@/pages/KettenwachsPage').then(m => ({ default: m.KettenwachsPage })));
const PartnerPage = lazy(() => import('@/pages/PartnerPage').then(m => ({ default: m.PartnerPage })));
const PartnerAreaPage = lazy(() => import('@/pages/PartnerAreaPage').then(m => ({ default: m.PartnerAreaPage })));
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/sonner';
// Lazy: rendert nur bei checkoutEnabled, das bis zum Stripe-Start aus ist.
const CartDrawer = lazy(() => import('@/components/CartDrawer').then(m => ({ default: m.CartDrawer })));
import { useCartStore } from '@/store/cart';
import { checkoutEnabled } from '@/lib/data';
import { ScrollToTop } from '@/components/ScrollToTop';
import { RouteScrollReset } from '@/components/RouteScrollReset';
import { PendingAnchorScroll } from '@/components/PendingAnchorScroll';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MobileStickyCTA } from '@/components/MobileStickyCTA';
import { CartPersistenceHint } from '@/components/CartPersistenceHint';
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
      <MobileStickyCTA />
      {checkoutEnabled && <Suspense fallback={null}><CartDrawer /></Suspense>}
      <Routes>
        <Route path="/produkt/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
        <Route path="/produkt/:id/stage" element={<Suspense fallback={<PageLoader />}><ProductStagePage /></Suspense>} />
        <Route path="/zubehoer/:slug" element={<Suspense fallback={<PageLoader />}><AccessoryDetailPage /></Suspense>} />
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
        <Route path="/kette-wachsen-lassen/:stadt" element={<Suspense fallback={<PageLoader />}><RewaxCityPage /></Suspense>} />
        <Route path="/wissenschaft" element={<Suspense fallback={<PageLoader />}><SciencePage /></Suspense>} />
        {/* /rechner (der Hub) leitet per 301 auf /anleitung#rechner
            (vercel.json) — die Seiten unter /rechner/:slug bleiben eigene
            Adressen und werden weiter direkt bedient. */}
        <Route path="/rechner/:slug" element={<Suspense fallback={<PageLoader />}><RechnerToolPage /></Suspense>} />
        {/* Seitenordnung Chat 4: "Über mich" und die FAQ sind auf /kontakt
            bzw. /blog#fragen umgezogen. vercel.json traegt den serverseitigen
            301 fuer direkte Aufrufe/Bookmarks; diese Routen fangen zusaetzlich
            eine SPA-Navigation ab (Link-Klick ohne vollen Seitenaufruf), die
            den Edge-Redirect sonst umgeht. */}
        <Route path="/ueber-uns" element={<Navigate to="/kontakt#ueber-mich" replace />} />
        <Route path="/kontakt" element={<Suspense fallback={<PageLoader />}><KontaktPage /></Suspense>} />
        <Route path="/faq" element={<Navigate to="/blog#fragen" replace />} />
        <Route path="/anleitung" element={<Suspense fallback={<PageLoader />}><AnleitungPage /></Suspense>} />
        {/* Stufe 3 (Produktkarten-Plan, K10): die Kettenliste war ein
            useState innerhalb der Produktsektion, jetzt eine echte Route mit
            eigener Adresse, Filter als Query-Parameter statt Anker. */}
        <Route path="/ketten" element={<Suspense fallback={<PageLoader />}><KettenPage /></Suspense>} />
        {/* Tuer 1 (Seitenordnung Chat 2): dieselbe Behandlung wie /ketten
            und /kette-wachsen-lassen — eine eigene Seite statt eines
            Aufklappens auf der Startseite. */}
        <Route path="/kettenwachs" element={<Suspense fallback={<PageLoader />}><KettenwachsPage /></Suspense>} />
        {/* B2B-Partnerseite (Ziel des QR-Codes im Partner-Infoblatt). Bewusst nur ueber
            einen kleinen Footer-Link erreichbar, nicht in Topbar oder Menue.
            /partner/konditionen ist noindex und laedt seinen Inhalt erst nach
            Code-Login von /api/partner-access (docs/plaene/PARTNER_SEITE.md).
            Kurzlinks: vercel.json traegt den 301, die Navigate-Routen fangen
            eine SPA-Navigation ab. */}
        <Route path="/partner" element={<Suspense fallback={<PageLoader />}><PartnerPage /></Suspense>} />
        <Route path="/partner/konditionen" element={<Suspense fallback={<PageLoader />}><PartnerAreaPage /></Suspense>} />
        <Route path="/fachhandel" element={<Navigate to="/partner" replace />} />
        <Route path="/haendler" element={<Navigate to="/partner" replace />} />
        <Route path="/" element={
          <>
            <Navigation />
            <PendingAnchorScroll />
            <main id="main-content">
              <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
                <HeroEditorial />
              </Suspense>
              {/* Seitenordnung Chat 2: Hero → Products (drei Tueren) →
                  WhyWax → Reviews → Footer, sonst nichts — die restlichen
                  zwoelf Startseiten-Abschnitte sind auf eigene Seiten
                  umgezogen (siehe SEITENORDNUNG_PLAN.md). TrustStrip fiel
                  weg (wiederholte nur Hero-Zahlen, siehe Hero-Fussstreifen).
                  Anker-IDs (#produkte, #warum-wachs, #bewertungen)
                  unveraendert — Navigation, MobileStickyCTA und
                  PendingAnchorScroll haengen daran. */}
              <Products />
              <Suspense fallback={null}>
                <WhyWax />
                <Reviews />
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
