import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { canCheckout, isSoldOut, WAX_TIERS, CHAIN_TIERS, type Product } from '@/lib/data';
import { getEstimatedDelivery } from '@/lib/utils';
import { trackEbayClick } from '@/lib/analytics';
import { useLanguage } from '@/hooks/useLanguage';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CardPerks } from '@/components/CardPerks';

// Kaufbare Kurzkarte fuer Stellen mitten im Inhalt ("Mehr wissen"-Panels):
// dieselbe Kartensprache wie Regal und /ketten (Foto, Name, Preis,
// CardPerks, Kaufknopf), nur quer statt hoch. Luca, 26.09.2026: "einfach in
// den Warenkorb, eher wie die echten Karten".
export function ProductMiniCard({ product, label }: { product: Product; label?: string }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const name = de ? product.title : product.titleEn;
  const tiers = product.category === 'wax' ? WAX_TIERS : product.category === 'chain' ? CHAIN_TIERS : undefined;
  const price = product.price.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="shelf-card mini-card group relative rounded-[18px] overflow-hidden">
      <div className="mini-card__in">
      <div className="mini-card__ph">
        <img src={product.image} alt="" loading="lazy" decoding="async" className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      </div>
      <div className="mini-card__body">
        {label && <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{label}</p>}
        <p className="mini-card__name">
          <Link to={`/produkt/${product.id}`} className="stretched-link" viewTransition>{name}</Link>
        </p>
        <p className="mini-card__price num">{price} €</p>
        {!isSoldOut(product) && <CardPerks t={t} delivery={getEstimatedDelivery(lang)} tiers={tiers} />}
        <div className="mini-card__cta">
          {isSoldOut(product) ? (
            <span className="text-[13px] font-semibold" style={{ color: 'var(--txf)' }}>{de ? 'Ausverkauft' : 'Sold out'}</span>
          ) : canCheckout(product) ? (
            <AddToCartButton product={product} size="sm" />
          ) : (
            <button type="button"
              onClick={() => { trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
              className="inline-flex items-center gap-1.5 min-h-11 px-5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
              {t.products.buyOnEbay}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
