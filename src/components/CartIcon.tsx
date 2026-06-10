import { ShoppingCart } from 'lucide-react';
import { useCartStore, cartItemCount } from '@/store/cart';

export function CartIcon({ light = false }: { light?: boolean }) {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = cartItemCount(items);

  return (
    <button
      onClick={openCart}
      className={`relative p-2 transition-colors rounded-lg ${
        light ? 'text-white/85 hover:text-white' : 'text-wx-tx2 hover:text-wx-tx1'
      }`}
      aria-label={`Warenkorb (${count} Artikel)`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 text-[10px] font-bold text-white rounded-full flex items-center justify-center pointer-events-none"
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
