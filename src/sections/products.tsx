import { ExternalLink, X, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/hooks/useLanguage';
import type { TranslationType } from '@/lib/i18n';
import { useSectionReveal } from '@/hooks/useAnimation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { products, canCheckout, isSoldOut } from '@/lib/data';
import { trackProductsSeen, trackEbayClick } from '@/lib/analytics';
import { richContent } from '@/lib/productContent';
import { ChainFinder } from '@/sections/ChainFinder';
import { ProductShelf, SecondaryTile } from '@/sections/ProductShelf';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Section } from '@/components/Section';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

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

  const filteredChains = useMemo(() => chainProducts.filter(p => {
    if (speedFilter !== 'all' && p.chainSpeed !== `${speedFilter}-fach`) return false;
    if (brandFilter !== 'all') {
      const isYBN = p.chainBrand === 'YBN';
      if (brandFilter === 'campagnolo') {
        if (!p.compatibility?.includes('Campagnolo')) return false;
      } else {
        if (!isYBN && p.chainBrand?.toLowerCase() !== brandFilter) return false;
      }
    }
    return true;
  }), [chainProducts, speedFilter, brandFilter]);

  const formatter = useMemo(() =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }),
  [lang]);
  const formatPrice = useCallback((price: number) => formatter.format(price), [formatter]);

  const resetFilters = useCallback(() => { setSpeedFilter('all'); setBrandFilter('all'); }, []);

  // Ein Klick vom Regal in die gefilterte Liste. Vorher: Tuer, Tab, Finder.
  const openChains = useCallback((speed: 'all' | '11' | '12') => {
    setSpeedFilter(speed);
    setBrandFilter('all');
    setListOpen(true);
    // Erst nach dem Rendern der Liste scrollen — vorher gibt es das Ziel nicht.
    requestAnimationFrame(() => {
      document.getElementById('produkt-liste')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // Wax card entrance — runs once, cards never change.
  // Plain fade+rise, no 3D rotateX/perspective: the previous 3D tilt read as a
  // "flip" and — because rotateX forces the browser to recomposite the card
  // in a 3D rendering context — could disrupt the rounded-corner clip on the
  // image wrapper nested inside it for a frame (the same class of Chromium
  // compositing quirk fixed elsewhere on this site, just triggered by the
  // parent's 3D transform instead of the child's own). A 2D transform doesn't
  // have that problem. `data-wx-in` marks elements once animated so that if
  // this effect ever runs twice for the same DOM nodes (React StrictMode's
  // dev-only double-invoke, or any other re-registration), the second pass
  // is a no-op instead of visibly replaying the animation.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.wax-card', {
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
              // (see the wax-card/chain-card JSX above) precisely so the
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
              // (see the wax-card/chain-card JSX above) precisely so the
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

          {/* ── Kettenliste ── */}
              <p className="text-[13px] mb-6 px-1" style={{ color: 'var(--txm)' }}>
                {t.products.preWaxedHint}
              </p>

              {/* Shared info — shown once instead of repeating identical pills on every card */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 px-1 text-meta" style={{ color: 'var(--txf)' }}>
                <span className="font-medium" style={{ color: 'var(--tx2)' }}>
                  {de ? 'Alle Ketten: vorgewachst · Quick-Link inklusive' : 'All chains: pre-waxed · Quick-Link included'}
                </span>
                <span className="hidden sm:inline" style={{ color: 'var(--bd2)' }}>·</span>
                <span>{t.products.multiDiscount}</span>
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
                <div className="grid sm:grid-cols-2 gap-5 items-stretch">
                  {filteredChains.map((product) => (
                    <ChainCard
                      key={product.id}
                      product={product}
                      de={de}
                      formatPrice={formatPrice}
                      buyLabel={t.products.buyOnEbay}
                    />
                  ))}
                </div>
              )}

              {/* Rewax-Karte steht normalerweise im Regal (ProductShelf,
                  neben Set und Ketten) — aber das Regal ist hier ausgeblendet,
                  solange die Liste offen ist. Ohne diese Kopie waere die
                  Rewax-Retention ausgerechnet fuer die Person unsichtbar, die
                  sich gerade am tiefsten mit Ketten beschaeftigt. Eine
                  einzelne Kachel, schmaler als die volle Dreierreihe, damit
                  sie nicht wie eine vierte Kettenkarte aussieht. */}
              <div className="max-w-sm mt-10">
                <SecondaryTile
                  to="/kette-wachsen-lassen"
                  image="/images/blog/chains-hanging-gold-1600" imageW={1600}
                  eyebrow={t.products.shelf.rewaxEyebrow} title={t.products.shelf.rewaxTitle}
                  body={t.products.shelf.rewaxBody}
                  cta={t.products.shelf.rewaxCta}
                  alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
                  dark
                />
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
}



// ── Chain Card ─────────────────────────────────────────────────────────────

const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel }: CardProps) {
  const badge = de ? product.badge : product.badgeEn;
  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;

  return (
    <div className="chain-card relative h-full rounded-2xl" style={{ willChange: 'transform' }}>
      <Link
        to={`/produkt/${product.id}`}
        className="group flex flex-col h-full rounded-2xl"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
        }}
      >
        {/* Image — see WaxCard's image wrapper for why will-change: transform (not translateZ(0)) is here. */}
        <div className="relative overflow-hidden rounded-t-2xl aspect-[2/1] flex-shrink-0" style={{ willChange: 'transform' }}>
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={e => { (e.target as HTMLImageElement).src = '/images/products/wax-block-spin.webp'; }}
          />
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <span className="wx-badge"
              style={{ background: 'var(--chip-bg)', color: 'rgba(160,200,255,0.95)', border: '1px solid rgba(100,160,255,0.35)', backdropFilter: 'blur(4px)' }}>
              {speed}
            </span>
            {badge && (
              <span className="wx-badge"
                style={{ background: 'var(--chip-bg)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-3.5 sm:px-4 pt-2.5 sm:pt-3 pb-3 sm:pb-3.5 flex flex-col flex-1">
          <p className="text-meta font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--accent-soft)' }}>{brand}</p>
          <h3 className="text-[14px] sm:text-[15px] font-bold text-wx-tx1 leading-snug tracking-[-0.02em] mt-0.5">{model}</h3>

          {/* Specs as pills */}
          {(chainLinks || speed) && (
            <div className="hidden sm:flex items-center gap-2 mt-2 flex-wrap">
              {speed && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                  {speed}
                </span>
              )}
              {chainLinks && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-md tabular-nums" style={{ fontFamily: MONO, background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd2)' }}>
                  {chainLinks} {de ? 'Glieder' : 'links'}
                </span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-3">
            <span className="num text-[20px] font-bold text-wx-tx1 tracking-[-0.02em]">{formatPrice(product.price)}</span>
            {isSoldOut(product) ? (
              <span className="text-[13px] font-semibold" style={{ color: 'var(--txf)' }}>
                {de ? 'Ausverkauft' : 'Sold out'}
              </span>
            ) : canCheckout(product) ? (
              <div className="flex flex-col items-end gap-1">
                <AddToCartButton product={product} size="sm" />
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                  className="text-meta transition-opacity hover:opacity-70"
                  style={{ color: 'var(--txm)' }}
                >
                  {de ? 'oder bei eBay →' : 'or on eBay →'}
                </button>
              </div>
            ) : (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {buyLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </Link>
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

function CompareModal({ open, onClose, de, t }: {
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

  const rows = [
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'color-mix(in srgb, var(--pg) 72%, transparent)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
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

          {/* ── Comparison table ── */}
          <div className="px-4 pt-4 pb-2">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd2)' }}>

              {/* Column header row */}
              <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr 1fr', background: 'var(--sf2)', borderBottom: '1px solid var(--bd2)' }}>
                <div className="px-3 py-3" />
                {/* Classic header */}
                <div className="px-3 py-3 flex flex-col gap-0.5" style={{ borderLeft: '1px solid var(--bd2)' }}>
                  <span className="text-meta font-bold uppercase tracking-[0.12em]" style={{ color: CLASSIC_ACCENT }}>Classic</span>
                  <span className="text-meta leading-snug" style={{ color: 'var(--txff)' }}>
                    {de ? 'Sommer & Einsteiger' : 'Summer & Beginners'}
                  </span>
                </div>
                {/* Pro header */}
                <div className="px-3 py-3 flex flex-col gap-0.5" style={{ borderLeft: '1px solid var(--bd2)' }}>
                  <span className="text-meta font-bold uppercase tracking-[0.12em]" style={{ color: PRO_ACCENT }}>Pro MoS₂</span>
                  <span className="text-meta leading-snug" style={{ color: 'var(--txff)' }}>
                    {de ? 'Ganzjahr & E-Bike' : 'Year-round & E-Bike'}
                  </span>
                </div>
              </div>

              {/* Data rows */}
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  className="grid"
                  style={{ gridTemplateColumns: '1.1fr 1fr 1fr', borderBottom: ri < rows.length - 1 ? '1px solid var(--bd2)' : 'none' }}
                >
                  {/* Label */}
                  <div className="px-3 py-3 flex items-center">
                    <span className="text-meta" style={{ color: 'var(--txm)' }}>{row.label}</span>
                  </div>
                  {/* Classic value */}
                  <div className="px-3 py-3 flex items-center justify-center" style={{ borderLeft: '1px solid var(--bd2)' }}>
                    <span
                      className="text-[12px] font-medium text-center"
                      style={{ color: row.classicDim ? 'var(--txff)' : 'var(--tx2)' }}
                    >
                      {row.classic}
                    </span>
                  </div>
                  {/* Pro value */}
                  <div className="px-3 py-3 flex items-center justify-center" style={{ borderLeft: '1px solid var(--bd2)' }}>
                    <span
                      className="text-[12px] font-semibold text-center"
                      style={{ color: row.proCheck ? PRO_ACCENT : 'var(--tx2)' }}
                    >
                      {row.pro}
                    </span>
                  </div>
                </div>
              ))}
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
