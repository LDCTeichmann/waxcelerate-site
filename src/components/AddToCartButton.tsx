import { useState } from 'react';
import { ShoppingCart, Check, Ban } from 'lucide-react';
import { useCartStore, isInStock, isLowStock } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import type { Product } from '@/lib/data';
import { trackBuyClick } from '@/lib/analytics';

interface Props {
  product: Product;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function AddToCartButton({ product, size = 'md', fullWidth = false }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const stockMap = useCartStore((s) => s.stockMap);
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  // isInStock() falls open on an empty/failed stockMap fetch (see
  // store/cart.ts) — fine for a genuinely available product, but it also
  // means a product this component already knows is soldOut (product.soldOut,
  // synchronous, no network round trip) would render as buyable for however
  // long /api/stock takes to resolve, or forever if that request fails.
  const inStock = isInStock(stockMap, product.id) && !product.soldOut;
  const lowStock = isLowStock(stockMap, product.id);
  const stock = stockMap[product.id] ?? -1;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added || !inStock) return;
    addItem(product);
    trackBuyClick(product.id);
    setAdded(true);
    toast.success(t.cart.addedToast, { duration: 2000 });
    setTimeout(() => setAdded(false), 1500);
  };

  // Out of stock state
  if (!inStock) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          disabled
          className={`flex items-center gap-1.5 font-semibold rounded-xl opacity-50 cursor-not-allowed ${
            size === 'sm' ? 'px-3.5 py-2 text-xs' : 'px-5 py-2.5 text-sm'
          }`}
          style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--txf)' }}
        >
          <Ban className="h-3.5 w-3.5 flex-shrink-0" />
          {de ? 'Ausverkauft' : 'Sold out'}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : 'items-start'}`}>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 font-semibold rounded-xl transition-all active:scale-[0.97] ${
          size === 'sm'
            ? 'px-3.5 py-2 text-xs hover:scale-[1.03]'
            : 'px-5 py-2.5 text-sm hover:opacity-90'
        } ${fullWidth ? 'w-full justify-center' : ''}`}
        style={{
          background: added ? 'var(--ok)' : 'var(--cta-bg)',
          color: added ? '#ffffff' : 'var(--cta-fg)',
          transition: 'background 0.2s ease, transform 0.15s ease',
        }}
      >
        {added ? (
          <Check className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        {added ? t.cart.added : t.cart.addToCart}
      </button>

      {/* Low stock warning. #f59e0b (amber-500) hatte gegen Weiss nur ~2,1:1
          Kontrast — WCAG AA braucht 4,5:1 fuer Normaltext. amber-700
          (#B45309) liegt bei ~5,0:1, bleibt aber erkennbar als Warnfarbe.
          Rendert aktuell nirgends live (kein Produkt hat eine
          stripePriceId), der Fehler waere sonst erst beim Stripe-Go-Live
          sichtbar geworden. */}
      {lowStock && stock > 0 && (
        <span className="text-meta font-medium" style={{ color: '#B45309' }}>
          {de ? `Nur noch ${stock} verfügbar` : `Only ${stock} left`}
        </span>
      )}
    </div>
  );
}
