// ─── /kettenwachs — Tür 1, jetzt eine eigene Seite ─────────────────────────
// Seitenordnung 09/2026, Chat 2. Vorher klappte die Startseite hier das
// Regal auf; jetzt fuehrt die Tuer "Kettenwachs" auf dieselbe Adressleiste
// wie Tuer 2 (/ketten) und Tuer 3 (/kette-wachsen-lassen) — konsistentes
// Verhalten statt einer Ausnahme (SEITENORDNUNG_PLAN.md).

import { useEffect, lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { products } from '@/lib/data';
import { removeStaticJsonLd, removeStaticHeadMeta, getEstimatedDelivery } from '@/lib/utils';
import { ProductShelf } from '@/sections/ProductShelf';
import { ProductDoors } from '@/sections/ProductDoors';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import {
  BASE, KETTENWACHS_TITLE, KETTENWACHS_TITLE_EN, KETTENWACHS_DESCRIPTION, KETTENWACHS_DESCRIPTION_EN,
  KETTENWACHS_H1, KETTENWACHS_H1_EN, KETTENWACHS_LEAD, KETTENWACHS_LEAD_EN, kettenwachsCollectionSchema,
} from '@/pages/kettenwachs/content';

const CompareModal = lazy(() => import('@/sections/CompareModal').then(m => ({ default: m.CompareModal })));

export function KettenwachsPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [compareOpen, setCompareOpen] = useState(false);
  const dispatchLine = useDispatchLine(de);
  const delivery = getEstimatedDelivery(lang);

  // Vorgerenderte Fassung (generate-blog-html.mjs) setzt eigenes
  // title/description/canonical/JSON-LD — gleiches Muster wie /ketten.
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const waxProducts = products.filter(p => p.category === 'wax');
  const title = de ? KETTENWACHS_TITLE : KETTENWACHS_TITLE_EN;
  const description = de ? KETTENWACHS_DESCRIPTION : KETTENWACHS_DESCRIPTION_EN;
  const canonical = `${BASE}/kettenwachs`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content={de ? 'de_DE' : 'en_US'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(kettenwachsCollectionSchema(waxProducts))}</script>
      </Helmet>

      <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
        <Navigation />

        <main id="main-content" className="pt-28 pb-24">
          <div className="wx-frame">
            <Link to="/#produkte" className="back-pill mb-6">
              <ArrowLeft className="h-4 w-4" aria-hidden /> {de ? 'Alle Produkte' : 'All products'}
            </Link>

            <h1 className="section-title mb-3">{de ? KETTENWACHS_H1 : KETTENWACHS_H1_EN}</h1>
            <p className="text-wx-txm max-w-xl mb-2">{de ? KETTENWACHS_LEAD : KETTENWACHS_LEAD_EN}</p>
            <p className="text-[13px] mb-9" style={{ color: 'var(--txm)' }}>{dispatchLine}</p>

            <ProductShelf de={de} t={t} onCompare={() => setCompareOpen(true)} />

            {/* ── Lieber anders? ── die zwei anderen Tueren, klein (SEITENORDNUNG_PLAN.md) */}
            <div className="mt-16 sm:mt-20">
              <h2 className="font-display font-bold leading-tight mb-4 sm:mb-5"
                style={{ fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)', color: 'var(--tx1)' }}>
                {de ? 'Lieber anders?' : 'Prefer a different way?'}
              </h2>
              <ProductDoors de={de} t={t} delivery={delivery} only={['chains', 'rewax']} compact />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {compareOpen && (
        <Suspense fallback={null}>
          <CompareModal open onClose={() => setCompareOpen(false)} de={de} t={t} />
        </Suspense>
      )}
    </>
  );
}
