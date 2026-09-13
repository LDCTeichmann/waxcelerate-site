// ─── /ketten — eigene Route statt eines useState in products.tsx ───────────
// Stufe 3 der Produktkarten-Neugliederung (K10): die Kettenliste war bisher
// ein useState INNERHALB der Produktsektion, der das Regal ersetzte — keine
// eigene Adresse, keine Indexierung, kein Teilen, Doppelueberschrift beim
// Aufklappen. Jetzt eine Route mit eigenem H1, Meta, Schema und Footer.
// #produkte (das Regal) bleibt unveraendert bestehen (K9) — nur die vier
// Ketten-Einstiege haengen auf /ketten um.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { products, compatibilityMatrix, checkoutEnabled } from '@/lib/data';
import { getEstimatedDelivery, removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ChainCard } from '@/components/ChainCard';
import { SecondaryTile, minSetPrice } from '@/sections/ProductShelf';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { TogButton, ChipRow } from '@/components/tools/primitives';
import { TURNAROUND } from '@/pages/rewax/content';
import {
  BASE, KETTEN_TITLE, KETTEN_TITLE_EN, KETTEN_DESCRIPTION, KETTEN_DESCRIPTION_EN,
  KETTEN_H1, KETTEN_H1_EN, KETTEN_LEAD, KETTEN_LEAD_EN, chainBenefits, kettenCollectionSchema,
} from '@/pages/ketten/content';

type Brand = 'all' | 'shimano' | 'sram' | 'campagnolo';
type Speed = 'all' | '11' | '12';

const BRANDS: { v: Brand; labelDe: string; labelEn: string }[] = [
  { v: 'all', labelDe: 'Alle', labelEn: 'All' },
  { v: 'shimano', labelDe: 'Shimano', labelEn: 'Shimano' },
  { v: 'sram', labelDe: 'SRAM', labelEn: 'SRAM' },
  { v: 'campagnolo', labelDe: 'Campagnolo', labelEn: 'Campagnolo' },
];
const SPEEDS: { v: Speed; labelDe: string; labelEn: string }[] = [
  { v: 'all', labelDe: 'Alle', labelEn: 'All' },
  { v: '11', labelDe: '11-fach', labelEn: '11-speed' },
  { v: '12', labelDe: '12-fach', labelEn: '12-speed' },
];

const isBrand = (v: string | null): v is Brand => v === 'shimano' || v === 'sram' || v === 'campagnolo';
const isSpeed = (v: string | null): v is Speed => v === '11' || v === '12';

export function KettenPage() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheet, setSheet] = useState<'marke' | 'gang' | null>(null);
  useBodyScrollLock(sheet !== null);

  // Vorgerenderte Fassung (generate-blog-html.mjs) setzt eigenes
  // title/description/canonical/JSON-LD — gleiches Muster wie
  // ProductDetailPage/RechnerHubPage.
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const brandParam = searchParams.get('marke');
  const speedParam = searchParams.get('gang');
  const brand: Brand = isBrand(brandParam) ? brandParam : 'all';
  const speed: Speed = isSpeed(speedParam) ? speedParam : 'all';

  const chainProducts = useMemo(() => products.filter(p => p.category === 'chain'), []);

  const brandChainIds = useMemo(() => {
    if (brand === 'all') return null;
    const bySpeed = compatibilityMatrix[brand] ?? {};
    const speeds = speed === 'all' ? ['11', '12'] : [speed];
    return new Set(speeds.flatMap(s => bySpeed[s] ?? []));
  }, [brand, speed]);

  const filteredChains = useMemo(() => chainProducts.filter(p => {
    if (speed !== 'all' && p.chainSpeed !== `${speed}-fach`) return false;
    if (brandChainIds && !brandChainIds.has(p.id)) return false;
    return true;
  }), [chainProducts, speed, brandChainIds]);

  // Zustand in Query-Parametern statt Ankern (K10) — RouteScrollReset haengt
  // nur an pathname, ein Filterwechsel per Query-Parameter loest also keinen
  // Sprung nach oben aus.
  const setBrand = useCallback((v: Brand) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v === 'all') next.delete('marke'); else next.set('marke', v);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSpeed = useCallback((v: Speed) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v === 'all') next.delete('gang'); else next.set('gang', v);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const formatter = useMemo(() =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }),
  [de]);
  const formatPrice = useCallback((price: number) => formatter.format(price), [formatter]);
  const chainDelivery = useMemo(() => getEstimatedDelivery(lang), [lang]);
  const quickLinkLabel = t.products.shelf.chainQuickLink;
  const shippingLabel = checkoutEnabled ? t.products.cardShippingReal : t.products.cardShippingIncluded;

  const title = de ? KETTEN_TITLE : KETTEN_TITLE_EN;
  const description = de ? KETTEN_DESCRIPTION : KETTEN_DESCRIPTION_EN;
  const canonical = `${BASE}/ketten`;

  const activeFilters = [
    ...(brand !== 'all' ? [{ key: 'marke', label: BRANDS.find(b => b.v === brand)!.labelDe, clear: () => setBrand('all') }] : []),
    ...(speed !== 'all' ? [{ key: 'gang', label: `${speed}-fach`, clear: () => setSpeed('all') }] : []),
  ];

  const resultText = de
    ? (filteredChains.length === 1 ? 'passende Kette' : 'passende Ketten')
    : (filteredChains.length === 1 ? 'matching chain' : 'matching chains');

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
        <script type="application/ld+json">{JSON.stringify(kettenCollectionSchema(chainProducts))}</script>
      </Helmet>

      <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
        <Navigation />

        <main className="pt-28 pb-24">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8">
            <Link to="/#produkte"
              className="inline-flex items-center gap-1.5 min-h-11 -ml-1 pl-1 text-[13px] font-medium mb-5 transition-opacity hover:opacity-70"
              style={{ color: 'var(--txm)' }}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> {de ? 'Alle Produkte' : 'All products'}
            </Link>

            <h1 className="section-title mb-3">{de ? KETTEN_H1 : KETTEN_H1_EN}</h1>
            <p className="text-wx-txm max-w-xl mb-5">{de ? KETTEN_LEAD : KETTEN_LEAD_EN}</p>

            {/* Nutzenband — ersetzt die graue Sammelzeile ("Alle Ketten:
                vorgewachst · Quick-Link inklusive"), die hier entfaellt (K9). */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
              {chainBenefits(de).map(b => (
                <span key={b} className="flex items-center gap-1.5 text-[13.5px] font-medium" style={{ color: 'var(--tx2)' }}>
                  <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
                  {b}
                </span>
              ))}
            </div>

            {/* Filterleiste statt einer 380px-Karte — sticky unter der Nav. */}
            <div className="sticky top-14 z-20 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3 mb-5"
              style={{ background: 'var(--pg)', borderBottom: '1px solid var(--bd2)' }}>
              {/* Desktop: eine Zeile, zwei Chip-Gruppen, Ergebniszahl rechts. */}
              <div className="hidden sm:flex items-center gap-4 flex-wrap">
                <ChipRow>
                  {BRANDS.map(b => (
                    <TogButton key={b.v} active={brand === b.v} onClick={() => setBrand(b.v)}>
                      {de ? b.labelDe : b.labelEn}
                    </TogButton>
                  ))}
                </ChipRow>
                <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--bd2)' }} />
                <ChipRow>
                  {SPEEDS.map(s => (
                    <TogButton key={s.v} active={speed === s.v} onClick={() => setSpeed(s.v)}>
                      {de ? s.labelDe : s.labelEn}
                    </TogButton>
                  ))}
                </ChipRow>
                <span className="ml-auto text-[13px] flex-shrink-0" style={{ color: 'var(--txm)' }}>
                  <span className="num font-bold" style={{ color: filteredChains.length > 0 ? 'var(--accent)' : 'var(--txm)' }}>
                    {filteredChains.length}
                  </span>{' '}{resultText}
                </span>
              </div>

              {/* Mobile: zwei Ausgangs-Chips oeffnen je ein Bottom-Sheet. */}
              <div className="flex sm:hidden items-center gap-2">
                <button type="button" onClick={() => setSheet('marke')} aria-haspopup="dialog"
                  className={`flex-1 min-h-11 px-3 rounded-lg text-[13px] font-medium border truncate ${brand !== 'all' ? 'chip-active' : ''}`}
                  style={brand === 'all' ? { borderColor: 'var(--bd)', color: 'var(--txm)' } : { borderColor: 'transparent' }}>
                  {de ? 'Marke' : 'Brand'}{brand !== 'all' ? `: ${BRANDS.find(b => b.v === brand)!.labelDe}` : ''}
                </button>
                <button type="button" onClick={() => setSheet('gang')} aria-haspopup="dialog"
                  className={`flex-1 min-h-11 px-3 rounded-lg text-[13px] font-medium border truncate ${speed !== 'all' ? 'chip-active' : ''}`}
                  style={speed === 'all' ? { borderColor: 'var(--bd)', color: 'var(--txm)' } : { borderColor: 'transparent' }}>
                  {de ? 'Schaltung' : 'Speed'}{speed !== 'all' ? `: ${speed}-fach` : ''}
                </button>
                <span className="text-[13px] flex-shrink-0 pl-1" style={{ color: 'var(--txm)' }}>
                  <span className="num font-bold" style={{ color: 'var(--accent)' }}>{filteredChains.length}</span>
                </span>
              </div>
            </div>

            {/* Aktive Filter als entfernbare Chips ueber dem Raster,
                X-Flaeche mindestens 44px. */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeFilters.map(f => (
                  <button key={f.key} type="button" onClick={f.clear}
                    className="chip-active inline-flex items-center gap-1 min-h-11 pl-3 pr-1.5 rounded-full text-[13px] font-medium border"
                    style={{ borderColor: 'transparent' }}>
                    {f.label}
                    <span className="flex items-center justify-center h-8 w-8 rounded-full">
                      <X className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filteredChains.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-wx-txm text-sm mb-3">
                  {de ? 'Keine passende Kette gefunden.' : 'No matching chain found.'}
                </p>
                <button onClick={resetFilters} className="text-[12px] transition-colors" style={{ color: 'var(--accent-soft)' }}>
                  {de ? 'Filter zurücksetzen' : 'Reset filters'}
                </button>
              </div>
            ) : (
              // K1: 1 / 2 / 3 / 4 Spalten, gleiches Raster wie Stufe 1.
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch mb-16">
                {filteredChains.map(product => (
                  <ChainCard
                    key={product.id}
                    product={product}
                    de={de}
                    formatPrice={formatPrice}
                    buyLabel={t.products.buyOnEbay}
                    deliveryDate={chainDelivery}
                    quickLinkLabel={quickLinkLabel}
                    shippingIncludedLabel={shippingLabel}
                  />
                ))}
              </div>
            )}

            {/* "Passt dazu" — die Seite endet nicht in einer Sackgasse. */}
            <div>
              <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
                {de ? 'Passt dazu' : 'Goes well with'}
              </p>
              <div className="grid gap-5 sm:grid-cols-3">
                <SecondaryTile
                  to="/#produkte"
                  image="/images/shelf/wax-classic" imageW={1000}
                  eyebrow={t.products.shelf.relatedWaxEyebrow} title={t.products.shelf.relatedWaxTitle}
                  body={t.products.shelf.relatedWaxBody}
                  cta={t.products.shelf.relatedWaxCta}
                  alt={de ? 'Waxcelerate Kettenwachs-Block' : 'Waxcelerate chain wax block'}
                />
                <SecondaryTile
                  to="/starter-set"
                  image="/images/shelf/shelf-set" imageW={1000}
                  eyebrow={t.products.shelf.setEyebrow} title={t.products.shelf.setTitle}
                  body={t.products.shelf.setBody}
                  price={`${de ? 'Ab' : 'From'} ${formatPrice(minSetPrice)}`}
                  cta={t.products.shelf.setCta}
                  alt={de ? 'Waxcelerate Wachsblock mit Kettenzange, Kette und Schaltauge-Zubehör des Starter-Sets' : 'Waxcelerate wax block with chain pliers, chain and quick-link tools from the starter set'}
                />
                <SecondaryTile
                  to="/kette-wachsen-lassen"
                  image="/images/shelf/shelf-rewax" imageW={1000}
                  eyebrow={t.products.shelf.rewaxEyebrow} title={t.products.shelf.rewaxTitle}
                  body={t.products.shelf.rewaxBody}
                  price={t.products.shelf.rewaxFrom}
                  delivery={de ? `Zurück in ${TURNAROUND.short} ab Ankunft` : `Back in ${TURNAROUND.shortEn} after arrival`}
                  deliveryIcon="rotate"
                  cta={t.products.shelf.rewaxCta}
                  alt={de ? 'Waxcelerate Versandkarton mit gewachster Kette vor Stuttgarter Landschaft' : 'Waxcelerate shipping box with a waxed chain in front of the Stuttgart hills'}
                />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile Bottom-Sheet — schliesst mit "X Ketten anzeigen" statt einem
          blossen "Fertig", damit der Effekt des Filters sofort sichtbar ist. */}
      {sheet && (
        <div className="fixed inset-0 z-[60] sm:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label={de ? 'Schließen' : 'Close'}
            className="absolute inset-0" style={{ background: 'rgba(var(--scrim-rgb),0.5)' }}
            onClick={() => setSheet(null)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            style={{ background: 'var(--sf)', boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}>
            <p className="font-display font-bold text-[16px] mb-4" style={{ color: 'var(--tx1)' }}>
              {sheet === 'marke' ? (de ? 'Marke' : 'Brand') : (de ? 'Schaltung' : 'Speed')}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(sheet === 'marke' ? BRANDS : SPEEDS).map(opt => (
                <TogButton
                  key={opt.v}
                  active={sheet === 'marke' ? brand === opt.v : speed === opt.v}
                  onClick={() => sheet === 'marke' ? setBrand(opt.v as Brand) : setSpeed(opt.v as Speed)}
                >
                  {de ? opt.labelDe : opt.labelEn}
                </TogButton>
              ))}
            </div>
            <button type="button" onClick={() => setSheet(null)}
              className="w-full min-h-11 rounded-full text-[14px] font-semibold"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
              {de ? `${filteredChains.length} Ketten anzeigen` : `Show ${filteredChains.length} chains`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
