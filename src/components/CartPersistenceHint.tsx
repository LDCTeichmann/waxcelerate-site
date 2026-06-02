import { useEffect } from 'react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';

export function CartPersistenceHint() {
  const { lang } = useLanguage();

  useEffect(() => {
    if (window.location.pathname === '/bestellung-erfolgreich') return;
    if (sessionStorage.getItem('wx-cart-hint')) return;

    const timer = setTimeout(() => {
      const items = useCartStore.getState().items;
      if (items.length > 0) {
        const message =
          lang === 'de'
            ? 'Du hast noch Artikel im Warenkorb'
            : 'You have items in your cart';
        const actionLabel = lang === 'de' ? 'Zum Warenkorb' : 'View cart';
        toast(message, {
          action: {
            label: actionLabel,
            onClick: () => useCartStore.getState().openCart(),
          },
          duration: 6000,
        });
        sessionStorage.setItem('wx-cart-hint', '1');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [lang]);

  return null;
}
