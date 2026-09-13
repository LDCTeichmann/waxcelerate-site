import { ExternalLink, X, ChevronDown, ArrowRight, Truck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/hooks/useLanguage';
import type { TranslationType } from '@/lib/i18n';
import { useSectionReveal } from '@/hooks/useAnimation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { products, canCheckout, isSoldOut, compatibilityMatrix } from '@/lib/data';
import { trackProductsSeen, trackEbayClick } from '@/lib/analytics';
import { richContent } from '@/lib/productContent';
import { ChainFinder } from '@/sections/ChainFinder';
import { ProductShelf, SecondaryTile } from '@/sections/ProductShelf';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PriceNote } from '@/components/PriceNote';
import { Stars } from '@/components/Stars';
import { Section } from '@/components/Section';
import { CompareTable } from '@/components/CompareTable';
import { getEstimatedDelivery } from '@/lib/utils';
import { TURNAROUND } from '@/pages/rewax/content';

export function Products() {
  const { t, lang } = useLanguage();
  // Nur noch die Kettenliste klappt auf. Das Wachs steht im Regal selbst — es
  // sind vier SKUs, die brauchen keine eigene Liste hinter einem Klick.
  const [listOpen, setListOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [speedFilter, setSpeedFilter] = useState<'all' | '11' | '12'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'shimano' | 'sram' | 'campagnolo'>('all');
  const de = lang === 'de';

  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // scroll_products (Mobile-Plan A6): feuert einmal, sobald die Produktsektion
  // sichtbar wird — misst, wie viele Besucher ueberhaupt so weit scrollen.
  // Schwelle 10%: die Sektion ist auf Mobile deutlich hoeher als der
  // Viewport, bei einer hohen Schwelle wuerde "sichtbar" erst ausloesen, wenn
  // fast die ganze Sektion durchgescrollt ist.
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { trackProductsSeen(); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rechner und Hero schicken weiter 'wax' | 'chain'. Das Wachs steht seit dem
  // Regal-Umbau ohne Klick da, also muss nur noch 'chain' etwas aufklappen —
  // das Scrollen zu #produkte erledigt der Absender selbst.
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<'wax' | 'chain'>).detail === 'chain') setListOpen(true);
    };
    window.addEventListener('wax:selectTab', handler);
    return () => window.removeEventListener('wax:selectTab', handler);
  }, []);

  const chainProducts = useMemo(() => products.filter(p => p.category === 'chain'), []);

  // Welche Ketten zu einer Marke passen, kommt jetzt aus derselben
  // `compatibilityMatrix` wie der „Welche Kette passt?"-Rechner
  // (waxMath/ChainMatchCalculator) — vorher hatten Rechner und Produktliste
  // zwei unabhaengige Antworten auf dieselbe Frage (String-Vergleiche hier,
  // Matrix dort), und ein Deep-Link vom Rechner haette hier etwas anderes
  // gezeigt als der Rechner gerade errechnet hatte.
  const brandChainIds = useMemo(() => {
    if (brandFilter === 'all') return null;
    const bySpeed = compatibilityMatrix[brandFilter] ?? {};
    const speeds = speedFilter === 'all' ? ['11', '12'] : [speedFilter];
    return new Set(speeds.flatMap(s => bySpeed[s] ?? []));
  }, [brandFilter, speedFilter]);

  const filteredChains = useMemo(() => chainProducts.filter(p => {
    if (speedFilter !== 'all' && p.chainSpeed !== `${speedFilter}-fach`) return false;
    if (brandChainIds && !brandChainIds.has(p.id)) return false;
    return true;
  }), [chainProducts, speedFilter, brandChainIds]);

  const formatter = useMemo(() =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }),
  [lang]);
  const formatPrice = useCallback((price: number) => formatter.format(price), [formatter]);
  // Gleiche Schaetzung wie die Wachs-Tafeln im Regal (ProductShelf.tsx) —
  // ChainCard zeigte bisher gar kein Lieferdatum, obwohl CardProps es schon
  // deklarierte (nie uebergeben).
  const chainDelivery = useMemo(() => getEstimatedDelivery(lang), [lang]);

  const resetFilters = useCallback(() => { setSpeedFilter('all'); setBrandFilter('all'); }, []);

  // Ein Klick vom Regal oder vom „Passende Kette"-Rechner in die gefilterte
  // Liste. `brand` optional, damit der einzige bisherige Aufrufer
  // (ProductShelf, immer 'all') unveraendert bleibt.
  const openChains = useCallback((
    speed: 'all' | '11' | '12',
    brand: 'all' | 'shimano' | 'sram' | 'campagnolo' = 'all',
  ) => {
    setSpeedFilter(speed);
    setBrandFilter(brand);
    setListOpen(true);
    // Erst nach dem Rendern der Liste scrollen — vorher gibt es das Ziel nicht.
    requestAnimationFrame(() => {
      document.getElementById('produkt-liste')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // Deep-Link vom „Passende Kette"-Rechner: /?ketten=shimano-12. Ungueltige
  // oder fehlende Werte werden still ignoriert — dieselbe Haltung wie beim
  // QR-Parameter ?w= des Intervall-Rechners (toolState.ts).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('ketten');
    if (!raw) return;
    const [brand, speed] = raw.split('-');
    const brands = ['shimano', 'sram', 'campagnolo'] as const;
    const matchedBrand = brands.find(b => b === brand);
    if (matchedBrand && (speed === '11' || speed === '12')) {
      openChains(speed, matchedBrand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chain card entrance — re-registers when filter changes so new cards animate in
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.chain-card', {
        onEnter: (els) => {
          const fresh = els.filter(el => !(el as HTMLElement).dataset.wxIn);
          if (!fresh.length) return;
          fresh.forEach(el => { (el as HTMLElement).dataset.wxIn = 'true'; });
          gsap.from(fresh, {
            y: 24, opacity: 0, duration: 0.6,
            stagger: 0.09, ease: 'power3.out',
            onStart: () => fresh.forEach(el => { (el as HTMLElement).style.willChange = 'transform, opacity'; }),
            onComplete: () => fresh.forEach(el => {
              // Only clear the transform GSAP itself animated (the entrance
              // y-offset) — NOT willChange. This element's will-change:
              // transform is a persistent hint set directly in its own style
              // (see the chain-card JSX above) precisely so the
              // corner-radius clip survives from here through to whenever the
              // user eventually hovers the card, however much later that is.
              // Clearing it here would strip that hint right back off again
              // moments after it was set, reopening the same glitch on hover.
              gsap.set(el, { clearProps: 'transform' });
            }),
          });
        },
        start: 'top 87%',
        once: true,
      });
    });
    return () => ctx.revert();
  }, [filteredChains.length]);

  return (
    <Section id="produkte" ref={sectionRef} className="bg-wx-bg">
          {/* Header */}
          <div ref={headerRef} className="mb-10">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.products.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl">
              {t.products.subtitle}
            </p>
          </div>

          {/* ── Regal ──
              Zeigt die Ware sofort statt drei Tueren davor. Nur die
              Kettenliste klappt darunter noch auf, weil acht SKUs mit
              Kompatibilitaetsfilter nicht auf den Schirm passen. */}
          {!listOpen && (
            <ProductShelf
              de={de}
              t={t}
              onOpenChains={openChains}
              onCompare={() => setCompareOpen(true)}
            />
          )}

          {/* Der Vergleich haengt am Regal, nicht mehr an einem Tab. */}
          <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} de={de} t={t} />

          {listOpen && (
          <>
          <button type="button" onClick={() => setListOpen(false)}
            className="inline-flex items-center gap-2 mb-6 text-[13px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--txm)' }}>
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
            {de ? 'Zurück zur Übersicht' : 'Back to overview'}
          </button>

          <div id="produkt-liste" className="scroll-mt-24">
            <h3 className="font-display font-bold leading-tight mb-2"
              style={{ fontSize: 'clamp(1.35rem, 2.6vw, 1.85rem)', color: 'var(--tx1)' }}>
              {t.products.shelf.chainsTitle}
            </h3>
          </div>

          {/* ── Kettenliste ──
              Die fruehere Kaeuferschutz-Zeile hier (preWaxedHint, "...Kauf
              direkt ueber eBay mit vollem Kaeuferschutz") stimmte laut Luca
              nicht und ist ersatzlos raus (Plan §2.4). Der Ultraschall-
              entfettet-Nutzen zieht ins Nutzenband der /ketten-Seite
              (Stufe 3), sobald die existiert. */}
              {/* Shared info — shown once instead of repeating identical pills on every card.
                  multiDiscount stand hier frueher mit dran, obwohl die Staffel nur fuer Wachs
                  gilt — steht jetzt auf den Wachskarten im Regal (ProductShelf.tsx). */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 px-1 text-meta" style={{ color: 'var(--txf)' }}>
                <span className="font-medium" style={{ color: 'var(--tx2)' }}>
                  {de ? 'Alle Ketten: vorgewachst · Quick-Link inklusive' : 'All chains: pre-waxed · Quick-Link included'}
                </span>
              </div>

              {/* Guided "Finde deine Kette" finder — drives the same brand/speed state */}
              <ChainFinder
                de={de}
                brand={brandFilter}
                speed={speedFilter}
                setBrand={setBrandFilter}
                setSpeed={setSpeedFilter}
                count={filteredChains.length}
              />

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
                // K1: 1 / 2 / 3 / 4 Spalten bei <640 / ≥640 / ≥1024 / ≥1280 —
                // bei 390px blieben zweispaltig nur ~149px Inhalt je Karte
                // (unter dieser Breite ist im Regal schon einmal ein Layout
                // zerbrochen, siehe docs/DESIGN.md §4). Acht Ketten ergeben
                // auf dem Desktop zwei saubere Reihen zu vier.
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                  {filteredChains.map((product) => (
                    <ChainCard
                      key={product.id}
                      product={product}
                      de={de}
                      formatPrice={formatPrice}
                      buyLabel={t.products.buyOnEbay}
                      deliveryDate={chainDelivery}
                      quickLinkLabel={t.products.shelf.chainQuickLink}
                    />
                  ))}
                </div>
              )}

              {/* Rewax-Karte steht normalerweise im Regal (ProductShelf,
                  unter Set und Ketten) — aber das Regal ist hier
                  ausgeblendet, solange die Liste offen ist. Ohne diese Kopie
                  waere die Rewax-Retention ausgerechnet fuer die Person
                  unsichtbar, die sich gerade am tiefsten mit Ketten
                  beschaeftigt. Eine einzelne Kachel, schmaler als die volle
                  Sektionsbreite, damit sie nicht wie eine vierte Kettenkarte
                  aussieht. */}
              <div className="max-w-sm mt-10">
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

              {/* PAngV: gleiche Luecke wie im Regal (ProductShelf.tsx) —
                  diese Ansicht zeigt eigene Preise (Kettenkarten, Rewax-
                  Kachel) und braucht deshalb ihre eigene, einmalige Zeile. */}
              <div className="mt-6 px-1">
                <PriceNote de={de} t={t} />
              </div>

          </>
          )}

      {/* Bottom gradient — bridges to About below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--sf), transparent 100%), var(--sf))', zIndex: 1 }}
      />
    </Section>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

type AnyProduct = typeof products[number];

interface CardProps {
  product: AnyProduct;
  de: boolean;
  formatPrice: (p: number) => string;
  buyLabel: string;
  deliveryDate?: string;
  multiDiscount?: string;
  quickLinkLabel?: string;
}

// Gleiches Muster wie cardFor/cardAvifFor in ProductDetailPage.tsx: nur die
// zwei lokal gehosteten Kettenfotos (hg701, ybn11) haben eine -card-Variante
// in AVIF und WebP. Die uebrigen sechs Ketten laufen noch auf eBay-Hotlinks
// (s-l500.webp) ohne eigene Groessen — die laden weiterhin ihren
// Originalpfad ohne <picture>. Das ist keine Stufe-1-Entscheidung, sondern
// eine Bildluecke, die Luca auffallen wird: sechs von acht Kettenfotos
// bekommen die AVIF-Pipeline nicht, weil es die Dateien dafuer noch nicht gibt.
const hasLocalChainCard = (src: string) => /\/chains\/(?:hg701|ybn11)\.webp$/.test(src);
const chainCardWebp = (src: string) => hasLocalChainCard(src) ? src.replace(/\.webp$/, '-card.webp') : src;
const chainCardAvif = (src: string) => hasLocalChainCard(src) ? src.replace(/\.webp$/, '-card.avif') : null;

// ── Chain Card ─────────────────────────────────────────────────────────────
// Stufe 1 der Produktkarten-Neugliederung: uebernimmt die .shelf-card-
// Grammatik aus ProductShelf.tsx (WaxPanel) statt eines eigenen Kartensatzes
// (U1 im Plan). Kein <button> mehr in einem <Link> (K2) — nur der Produktname
// ist der Link, gespannt per .stretched-link ueber die ganze Karte, der CTA
// bleibt mit position:relative darueber klickbar.
const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel, deliveryDate, quickLinkLabel }: CardProps) {
  const badge = de ? product.badge : product.badgeEn;
  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;
  const soldOut = isSoldOut(product);
  const avif = chainCardAvif(product.image);
  const webp = chainCardWebp(product.image);

  return (
    <div className="chain-card shelf-card group relative flex h-full flex-col rounded-[20px] overflow-hidden" style={{ willChange: 'transform' }}>
      {/* Foto 3:2 — hoechstens EIN Chip (Ausverkauft > Auszeichnung > keiner,
          Stufe-1-Anatomie). Der Geschwindigkeits-Chip, der hier vorher neben
          der Auszeichnung stand, zieht in die Klartextzeile unten (Marke,
          Modell, Schaltung, Glieder standen vorher teils doppelt: Overlay-
          Chip, Pill UND Modellname). */}
      <div className="relative overflow-hidden aspect-[3/2] flex-shrink-0" style={{ background: 'var(--hero-stage)' }}>
        <picture>
          {avif && <source type="image/avif" srcSet={avif} />}
          {webp !== product.image && <source type="image/webp" srcSet={webp} />}
          <img
            src={webp}
            alt={title}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${soldOut ? 'grayscale' : ''}`}
            style={soldOut ? { filter: 'saturate(0.15)' } : undefined}
            onError={e => { (e.target as HTMLImageElement).src = '/images/products/wax-block-spin.webp'; }}
          />
        </picture>
        {soldOut ? (
          <span className="absolute top-2.5 left-2.5 wx-badge"
            style={{ background: 'var(--chip-bg)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
            {de ? 'Ausverkauft' : 'Sold out'}
          </span>
        ) : badge && (
          <span className="absolute top-2.5 left-2.5 wx-badge"
            style={{ background: 'var(--chip-bg)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{brand}</p>
        {/* <p>, nicht <h3>: index.css erzwingt im Hellmodus global
            h1,h2,h3,h4 { color: var(--tx1) !important }, siehe WaxPanel. Der
            Stretched-Link (K2) sitzt hier statt auf der ganzen Karte. */}
        <p className="font-display font-bold leading-snug tracking-[-0.02em] mt-0.5"
          style={{ color: 'var(--tx1)', fontSize: 'clamp(1.05rem, 1.6vw, 1.15rem)' }}>
          <Link to={`/produkt/${product.id}`} className="stretched-link">
            {model}
          </Link>
        </p>

        {/* Klartext statt Pills — "11-fach" stand vorher dreimal (Overlay,
            Pill, Modellname). */}
        {(speed || chainLinks) && (
          <p className="text-[12px] mt-1" style={{ color: 'var(--txm)' }}>
            {[speed, chainLinks].filter(Boolean).join(' · ')}
          </p>
        )}

        {quickLinkLabel && (
          <p className="flex items-center gap-1.5 text-[12px] mt-1" style={{ color: 'var(--tx2)' }}>
            <Check className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
            {quickLinkLabel}
          </p>
        )}

        {/* Sterne nur wenn echte Zahlen gepflegt sind (Stufe 2 / Luca) — bei
            keiner Kette heute der Fall, siehe data.ts reviewCount. */}
        {!!product.reviewCount && (
          <p className="flex items-center gap-1.5 mt-1.5">
            <Stars rating={5} />
            <span className="num text-meta" style={{ color: 'var(--txm)' }}>
              {product.reviewCount} {de ? 'Bewertungen' : 'reviews'}
            </span>
          </p>
        )}

        {/* Preis + CTA — Preis ist die groesste Zahl der Karte, CTA unten
            rechts, ueber dem Stretched-Link per z-index. */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3.5">
          <span className="num text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
            {formatPrice(product.price)}
          </span>
          {soldOut ? (
            <Link to={`/produkt/${product.id}`}
              className="relative z-[1] inline-flex items-center gap-1 min-h-11 px-4 rounded-full text-[13px] font-semibold border transition-colors duration-150 hover:bg-[var(--accent-wash)]"
              style={{ borderColor: 'var(--bd)', color: 'var(--tx2)' }}>
              {de ? 'Details' : 'Details'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : canCheckout(product) ? (
            <div className="relative z-[1] flex flex-col items-end gap-1">
              <AddToCartButton product={product} size="sm" />
              <button
                onClick={() => { trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                className="text-meta transition-opacity hover:opacity-70"
                style={{ color: 'var(--txm)' }}
              >
                {de ? 'oder bei eBay →' : 'or on eBay →'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
              className="relative z-[1] flex items-center gap-1.5 min-h-11 px-5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {buyLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Fussstreifen: Lieferung, gleiche Common-Region-Begruendung wie im
            Regal (siehe WaxPanel). "inkl. Versand" kommt in Stufe 2 dazu,
            sobald die Versandaussage an checkoutEnabled gekoppelt ist (K8) —
            hier jetzt ohne Behauptung stehen zu lassen waere eine erfundene
            Zahl. */}
        {deliveryDate && (
          <div className="mt-3.5 -mx-4 px-4 pt-3 pb-3" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
            <span className="flex items-center gap-1.5 num text-meta" style={{ color: 'var(--tx2)' }}>
              <Truck className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
              {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Compare Modal ──────────────────────────────────────────────────────────

const CLASSIC_ACCENT = 'var(--accent-soft)';
const PRO_ACCENT = 'var(--accent-soft)';

// Gleiches Muster wie eur() in ProductShelf.tsx — CompareModal bekommt keine
// lang-basierte Intl.NumberFormat-Instanz durchgereicht (die des Elternteils
// ist an dessen eigenen `formatter`/`formatPrice` gebunden), daher lokal.
const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// Exportiert: die Produktseite (ProductDetailPage.tsx) verlinkt jetzt
// ebenfalls auf den Classic/Pro-Vergleich statt eines reinen Textlinks zum
// Pro-Produkt (Produktkarten-Neugliederung, siehe Plan Phase 3).
export function CompareModal({ open, onClose, de, t }: {
  open: boolean;
  onClose: () => void;
  de: boolean;
  t: TranslationType;
}) {
  const [classicOpen, setClassicOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  if (!open) return null;

  const classicRc = richContent['wax-500'];
  const proRc = richContent['wax-500-mos2'];
  const pt = t.products;

  // War als literaler, nur-deutscher String hardcodiert (CLAUDE.md: "Nur
  // src/lib/data.ts fuer Produktdaten") — desynct bei jeder Preisaenderung
  // und zeigte im englischen UI trotzdem "29,95 €" statt "€29.95". Gleiches
  // Muster wie eur() in ProductShelf.tsx.
  const classicPrice = eur(products.find(p => p.id === 'wax-500')!.price, de);
  const proPrice = eur(products.find(p => p.id === 'wax-500-mos2')!.price, de);

  const rawRows = [
    {
      label: de ? 'Wirkstoff' : 'Active ingredient',
      classic: 'PTFE-Film',
      pro: 'MoS₂-Transferfilm',
    },
    {
      label: de ? 'Reibungskoeffizient' : 'Friction coeff.',
      classic: '0,05–0,07',
      pro: '0,03–0,06',
    },
    {
      label: de ? 'Intervall trocken' : 'Dry interval',
      classic: '250–450 km',
      pro: '300–550 km',
    },
    {
      label: de ? 'Wintereignung' : 'Winter use',
      classic: de ? 'bedingt' : 'limited',
      pro: de ? 'bis −8°C' : 'to −8°C',
      proCheck: true,
    },
    {
      label: de ? 'Rostschutz' : 'Rust protection',
      classic: de ? 'Standard' : 'Standard',
      pro: de ? 'Hydrophob' : 'Hydrophobic',
      proCheck: true,
    },
    {
      label: 'PFAS / PTFE-frei',
      classic: '—',
      pro: '✓',
      proCheck: true,
      classicDim: true,
    },
  ];

  // Fuer <CompareTable> (Produktkarten-Neugliederung, Phase 6): proCheck/
  // classicDim aus rawRows werden zu winCol/dimCols, damit dieselbe
  // Komponente wie im PDP-Akkordeon greift, statt einer dritten eigenen
  // Grid-Implementierung. Nur Zeilen mit explizitem proCheck heben Pro
  // farblich hervor (Wirkstoff/Reibung/Intervall sind Abwaegungen, keine
  // klaren "Gewinner" — das war schon im alten Markup so und bleibt hier
  // erhalten).
  const compareRows = rawRows.map(row => ({
    label: row.label,
    cols: [row.classic, row.pro],
    winCol: row.proCheck ? 1 : undefined,
    dimCols: row.classicDim ? [0] : undefined,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'color-mix(in srgb, var(--pg) 72%, transparent)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[620px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--sf)',
          border: '1px solid var(--bd)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--bd)' }}
        >
          <div>
            <h3 className="text-[15px] font-semibold text-wx-tx1 tracking-[-0.01em]">{pt.compareTitle}</h3>
            <p className="text-meta mt-0.5" style={{ color: 'var(--txff)' }}>
              {de ? 'Alle Angaben für 500g Blöcke' : 'All figures for 500g blocks'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: 'var(--sf2)', color: 'var(--txf)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sf3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sf2)'; }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Comparison table — mit Fotos statt reinem Namens-Header
              (Luca: "vielleicht auch mit Bildern, der zwei Wachse
              nebeneinander mit der Information unten drunter"). Die Regal-
              Crops sind bereits im Browser (WaxPanel laedt dieselben
              Dateien), kein zusaetzlicher Download. */}
          <div className="px-4 pt-4 pb-2">
            <CompareTable
              headers={['Classic', 'Pro MoS₂']}
              images={['/images/shelf/wax-classic-800.webp', '/images/shelf/wax-pro-800.webp']}
              rows={compareRows}
              // Hex-Literal statt PRO_ACCENT ('var(--accent-soft)') — CompareTable
              // haengt einen Alpha-Suffix an (`${accentColor}0F`), der nur mit
              // Hex funktioniert, nicht mit einem CSS-Var-String. Gleicher Wert
              // wie cardAccent fuer isPro in ProductDetailPage.tsx.
              accentColor="#4A72D4"
              de={de}
            />
            {/* "Fuer wen" — dieselben, bereits abgesegneten Saetze wie im
                Regal (t.products.shelf.classicFor/proFor), statt einer
                dritten, leicht abweichenden Formulierung ("Sommer &
                Einsteiger") direkt im Modal-Header. */}
            <div className="grid grid-cols-2 gap-2.5 mt-2.5 text-center">
              <p className="text-meta" style={{ color: 'var(--txff)' }}>{pt.shelf.classicFor}</p>
              <p className="text-meta" style={{ color: 'var(--txff)' }}>{pt.shelf.proFor}</p>
            </div>
          </div>

          {/* ── Formula accordions ── */}
          <div className="px-4 pt-3 pb-4 space-y-2">

            {/* Classic Formula */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)', background: 'var(--sf2)' }}>
              <button
                onClick={() => setClassicOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-meta font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(var(--accent-soft-rgb), 0.08)', color: CLASSIC_ACCENT }}
                  >
                    Classic
                  </span>
                  <span className="text-[12px] font-medium text-wx-tx1">{pt.compareFormulaClassic}</span>
                  <span className="text-meta" style={{ color: 'var(--txff)' }}>
                    · {classicRc.formulaDetails?.length} {pt.compareComponents}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--txf)', transform: classicOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
                style={{ gridTemplateRows: classicOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: '1px solid var(--bd2)' }}>
                    {classicRc.formulaDetails?.map((f, i, arr) => (
                      <div
                        key={i}
                        className="flex gap-3.5 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                      >
                        <span className="text-meta font-bold tabular-nums flex-shrink-0 mt-0.5 w-5 text-right" style={{ color: CLASSIC_ACCENT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{f.name}</div>
                          <div className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {classicRc.techNote && (
                      <div
                        className="mx-4 mb-3 mt-1 rounded-lg p-3"
                        style={{ background: 'rgba(var(--accent-soft-rgb), 0.03)', border: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}
                      >
                        <div className="text-meta font-semibold uppercase tracking-widest mb-1" style={{ color: CLASSIC_ACCENT }}>
                          {classicRc.techNote.title}
                        </div>
                        <p className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>
                          {classicRc.techNote.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Formula */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(var(--accent-soft-rgb), 0.19)', background: 'rgba(var(--accent-soft-rgb), 0.02)' }}
            >
              <button
                onClick={() => setProOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-meta font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(var(--accent-soft-rgb), 0.09)', color: PRO_ACCENT }}
                  >
                    Pro MoS₂
                  </span>
                  <span className="text-[12px] font-medium text-wx-tx1">{pt.compareFormulaPro}</span>
                  <span className="text-meta" style={{ color: 'var(--txff)' }}>
                    · {proRc.formulaDetails?.length} {pt.compareComponents}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--txf)', transform: proOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
                style={{ gridTemplateRows: proOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div style={{ borderTop: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}>
                    {proRc.formulaDetails?.map((f, i, arr) => (
                      <div
                        key={i}
                        className="flex gap-3.5 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                      >
                        <span className="text-meta font-bold tabular-nums flex-shrink-0 mt-0.5 w-5 text-right" style={{ color: PRO_ACCENT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{f.name}</div>
                          <div className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                    {proRc.techNote && (
                      <div
                        className="mx-4 mb-3 mt-1 rounded-lg p-3"
                        style={{ background: 'rgba(var(--accent-soft-rgb), 0.03)', border: '1px solid rgba(var(--accent-soft-rgb), 0.13)' }}
                      >
                        <div className="text-meta font-semibold uppercase tracking-widest mb-1" style={{ color: PRO_ACCENT }}>
                          {proRc.techNote.title}
                        </div>
                        <p className="text-meta leading-relaxed" style={{ color: 'var(--txm)' }}>
                          {proRc.techNote.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer CTAs ── */}
        <div
          className="flex-shrink-0 grid grid-cols-2 gap-2.5 px-4 py-3.5"
          style={{ borderTop: '1px solid var(--bd)', background: 'var(--sf2)' }}
        >
          <Link
            to="/produkt/wax-500"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 py-3 rounded-xl text-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: 'var(--tx1)' }}>Classic</span>
            <span className="text-meta" style={{ color: 'var(--txff)' }}>{classicPrice}</span>
          </Link>
          <Link
            to="/produkt/wax-500-mos2"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 py-3 rounded-xl text-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'rgba(var(--accent-soft-rgb), 0.07)', border: '1px solid rgba(var(--accent-soft-rgb), 0.25)' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: PRO_ACCENT }}>Pro MoS₂</span>
            <span className="text-meta" style={{ color: 'rgba(var(--accent-soft-rgb), 0.6)' }}>{proPrice}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
