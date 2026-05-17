import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import type { Product } from '@/lib/data';

interface Props {
  product: Product;
  size?: 'sm' | 'md';
}

export function AddToCartButton({ product, size = 'md' }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const accent = product.variant === 'pro' ? '#8B6FFD' : '#4A6AEE';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;
    addItem(product);
    setAdded(true);
    toast.success(t.cart.addedToast, { duration: 2000 });
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 font-semibold text-white rounded-xl transition-all active:scale-[0.97] ${
        size === 'sm'
          ? 'px-3.5 py-2 text-xs hover:scale-[1.03]'
          : 'px-5 py-2.5 text-sm hover:opacity-90'
      }`}
      style={{
        background: added ? '#22c55e' : accent,
        transition: 'background 0.2s ease, transform 0.15s ease',
      }}
      aria-label={de ? t.cart.addToCart : t.cart.addToCart}
    >
      {added ? (
        <Check className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      {added ? t.cart.added : t.cart.addToCart}
    </button>
  );
}
