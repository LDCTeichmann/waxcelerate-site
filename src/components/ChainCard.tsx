import { ExternalLink, ArrowRight, Truck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { canCheckout, isSoldOut, type Product } from '@/lib/data';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Stars } from '@/components/Stars';
import { trackEbayClick } from '@/lib/analytics';

export interface ChainCardProps {
  product: Product;
  de: boolean;
  formatPrice: (p: number) => string;
  buyLabel: string;
  deliveryDate?: string;
  quickLinkLabel?: string;
  /** "inkl. Versand" — an checkoutEnabled gekoppelt (K8), vom Aufrufer
   *  berechnet statt hier fest verdrahtet, damit die Karte selbst keine
   *  Meinung zum Versandstatus braucht. */
  shippingIncludedLabel?: string;
  /** Stufe 4 (K4): erste Bildreihe eager + fetchpriority high, Rest lazy.
   *  Der Aufrufer kennt die Spaltenzahl der jeweiligen Ansicht, die Karte
   *  selbst nicht. */
  priority?: boolean;
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
// bleibt mit position:relative darueber klickbar. Ab Stufe 3 aus products.tsx
// herausgeloest, weil sowohl das Regal (SecondaryTile-Vorschau entfaellt dort)
// als auch die neue /ketten-Route dieselbe Karte brauchen.
export const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel, deliveryDate, quickLinkLabel, shippingIncludedLabel, priority }: ChainCardProps) {
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
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
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
          <Link to={`/produkt/${product.id}`} className="stretched-link" viewTransition>
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
            <Link to={`/produkt/${product.id}`} viewTransition
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

        {/* Fussstreifen: Versand + Lieferung, gleiche Common-Region-
            Begruendung wie im Regal (siehe WaxPanel). Versand-Zeile erst ab
            Stufe 2 moeglich (K8: checkoutEnabled-Kopplung), deshalb hier
            jetzt ergaenzt statt einer erfundenen Behauptung. */}
        {(deliveryDate || shippingIncludedLabel) && (
          <div className="mt-3.5 -mx-4 px-4 pt-3 pb-3 space-y-1" style={{ borderTop: '1px solid var(--bd2)', background: 'var(--sf3)' }}>
            {shippingIncludedLabel && (
              <p className="num text-meta" style={{ color: 'var(--tx2)' }}>{shippingIncludedLabel}</p>
            )}
            {deliveryDate && (
              <span className="flex items-center gap-1.5 num text-meta" style={{ color: 'var(--txf)' }}>
                <Truck className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
                {de ? `Lieferung ${deliveryDate}` : `Delivery ${deliveryDate}`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
