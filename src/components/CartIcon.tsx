import { ShoppingCart } from 'lucide-react';
import { useCartStore, cartItemCount } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';

export function CartIcon({ light = false }: { light?: boolean }) {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = cartItemCount(items);
  // War hardcoded Deutsch — jede andere Cart-Komponente (AddToCartButton,
  // CartDrawer) haengt an useLanguage(), diese hier nicht. Unreachable
  // solange checkoutEnabled false ist, aber ein echter Bug, der sich beim
  // Aktivieren nicht von selbst loest.
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <button
      onClick={openCart}
      className={`relative p-2 transition-colors rounded-lg ${
        light ? 'text-white/85 hover:text-white' : 'text-wx-tx2 hover:text-wx-tx1'
      }`}
      aria-label={de ? `Warenkorb (${count} Artikel)` : `Cart (${count} items)`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 text-meta font-bold text-white rounded-full flex items-center justify-center pointer-events-none"
          style={{
            background: 'var(--accent)',
            minWidth: '1rem',
            height: '1rem',
            padding: '0 3px',
            lineHeight: 1,
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
