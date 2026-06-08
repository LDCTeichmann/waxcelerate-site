import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore, cartItemCount } from '@/store/cart';

export function MobileStickyCTA() {
  const location = useLocation();
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [visible, setVisible] = useState(false);

  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = cartItemCount(items);
  const hasItems = count > 0;

  const isMain = location.pathname === '/';

  useEffect(() => {
    if (!isMain) return;
    const home = document.getElementById('home');
    const products = document.getElementById('produkte');
    if (!home || !products) return;

    const homeObserver = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) setVisible(true); },
      { threshold: 0 }
    );

    const productsObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(false); },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    homeObserver.observe(home);
    productsObserver.observe(products);

    return () => { homeObserver.disconnect(); productsObserver.disconnect(); };
  }, [isMain]);

  if (!isMain) return null;

  const handleClick = () => {
    if (hasItems) {
      openCart();
    } else {
      document.getElementById('produkte')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const label = hasItems
    ? (de ? `Warenkorb ansehen · ${count}` : `View cart · ${count}`)
    : (de ? 'Jetzt bestellen →' : 'Buy now →');

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <button
        onClick={handleClick}
        className="w-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: 'var(--cta-bg)',
          color: 'var(--cta-fg)',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
        }}
      >
        {label}
        {hasItems && (
          <span
            className="inline-flex items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(255,255,255,0.25)', minWidth: '1.25rem', height: '1.25rem', padding: '0 4px' }}
          >
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
