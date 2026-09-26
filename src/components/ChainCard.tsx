import { ExternalLink, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { canCheckout, cheapestChainIds, isSoldOut, CHAIN_TIERS, type Product } from '@/lib/data';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CardPerks } from '@/components/CardPerks';
import { Stars } from '@/components/Stars';
import { trackEbayClick } from '@/lib/analytics';

export interface ChainCardProps {
  product: Product;
  de: boolean;
  formatPrice: (p: number) => string;
  buyLabel: string;
  deliveryDate?: string;
  quickLinkLabel?: string;
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
const hasLocalChainCard = (src: string) => /\/chains\/[a-z0-9]+\.webp$/.test(src);
const chainCardWebp = (src: string) => hasLocalChainCard(src) ? src.replace(/\.webp$/, '-card.webp') : src;
const chainCardAvif = (src: string) => hasLocalChainCard(src) ? src.replace(/\.webp$/, '-card.avif') : null;

// ── Chain Card ─────────────────────────────────────────────────────────────
// .shelf-card-Grammatik wie das Regal. Nur der Produktname ist der Link,
// gespannt per .stretched-link ueber die ganze Karte (K2), der CTA liegt mit
// z-index darueber.
// 14.09.2026 (Luca): kompakter und mit den Fakten, die kaufen lassen. Der
// graue Fussstreifen ist weg — Versand steht jetzt als gruene Pille direkt
// unter dem Preis, wo das Auge beim Preisvergleich ohnehin landet. Foto
// 16:10 statt 3:2; auf dem Foto steht, womit gewachst wurde.
export const ChainCard = memo(function ChainCard({ product, de, formatPrice, buyLabel, deliveryDate, quickLinkLabel, priority }: ChainCardProps) {
  const { t } = useLanguage();
  const s = t.products.shelf;
  const brand = product.chainBrand ?? '';
  const model = product.chainModel ?? '';
  const speed = product.chainSpeed ?? '';
  const chainLinks = product.chainLinks ?? '';
  const title = de ? product.title : product.titleEn;
  const soldOut = isSoldOut(product);
  const avif = chainCardAvif(product.image);
  const webp = chainCardWebp(product.image);

  // Hoechstens EIN Badge: Ausverkauft > gepflegte Auszeichnung > aus den
  // Daten abgeleitet (guenstigste der Schaltstufe). Nichts wird behauptet,
  // was die Daten nicht hergeben.
  const badge = soldOut
    ? (de ? 'Ausverkauft' : 'Sold out')
    : (de ? product.badge : product.badgeEn)
      ?? (cheapestChainIds.has(product.id) ? s.chainCheapest.replace('{speed}', de ? speed : speed.replace('-fach', '-speed')) : undefined);

  const points = [s.chainDegreased, quickLinkLabel, s.chainReady].filter(Boolean) as string[];

  return (
    <div className="chain-card shelf-card group relative flex h-full flex-col rounded-[20px] overflow-hidden" style={{ willChange: 'transform' }}>
      <div className="relative overflow-hidden aspect-[16/10] flex-shrink-0" style={{ background: 'var(--hero-stage)' }}>
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
        {badge && (
          <span className={`absolute top-2.5 left-2.5 photo-chip uppercase tracking-[0.1em] text-[10px] ${soldOut ? '' : 'photo-chip--light'}`}>
            {badge}
          </span>
        )}
        {/* Womit gewachst wurde — die Info, die man am Foto sucht. Schwarzer
            Punkt = Pro (schwarzes MoS₂-Wachs), weisser Ring fuer Kontrast. */}
        {!soldOut && (
          <span className="absolute bottom-2.5 left-2.5 photo-chip">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: '#0b0b0d', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.75)' }} />
            {s.chainProWaxed}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{brand}</p>
        {/* <p>, nicht <h3>: index.css erzwingt im Hellmodus global
            h1,h2,h3,h4 { color: var(--tx1) !important }, siehe WaxPanel. */}
        {/* Zwei Zeilen reserviert (25.09.2026): "Dura-Ace / XTR CN-M9100"
            bricht um, "S11 / 11S" nicht — ohne Reserve sprang die ganze
            Zeile mit Stufe und Gliedern von Karte zu Karte. */}
        <p className="font-display font-bold leading-snug tracking-[-0.02em] mt-0.5 line-clamp-2 min-h-[2.75em]"
          style={{ color: 'var(--tx1)', fontSize: 'clamp(1.05rem, 1.6vw, 1.15rem)' }}>
          <Link to={`/produkt/${product.id}`} className="stretched-link" viewTransition>
            {model}
          </Link>
        </p>

        {(speed || chainLinks) && (
          <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--tx2)' }}>
            {[speed, chainLinks].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Drei Fakten in einer umbrechenden Zeile statt drei Zeilen. */}
        <ul className="flex flex-wrap content-start gap-x-3 gap-y-1 mt-2.5 min-h-[2.6rem]">
          {points.map(p => (
            <li key={p} className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--tx2)' }}>
              <Check className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent-soft)' }} aria-hidden />
              {p}
            </li>
          ))}
        </ul>

        {/* Sterne nur wenn echte Zahlen gepflegt sind (Stufe 2 / Luca). */}
        {!!product.reviewCount && (
          <p className="flex items-center gap-1.5 mt-1.5">
            <Stars rating={5} />
            <span className="num text-meta" style={{ color: 'var(--txm)' }}>
              {product.reviewCount} {de ? 'Bewertungen' : 'reviews'}
            </span>
          </p>
        )}

        {/* Preis links, CTA rechts; Versand-Pille + Lieferdatum als eigene
            Zeile darunter (neben dem Preis gestapelt brach "Bei eBay kaufen"
            bei vier Spalten auf zwei Zeilen um). */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 mt-auto pt-4">
          <span className="num text-[21px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
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
              className="relative z-[1] flex items-center gap-1.5 min-h-11 px-5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
            >
              {buyLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Versand, Lieferdatum und Staffel als gemeinsamer Block aller
            Produktkarten (CardPerks, 26.09.2026). */}
        {!soldOut && (
          <div className="mt-3">
            <CardPerks t={t} delivery={deliveryDate} tiers={CHAIN_TIERS} />
          </div>
        )}
      </div>
    </div>
  );
});
