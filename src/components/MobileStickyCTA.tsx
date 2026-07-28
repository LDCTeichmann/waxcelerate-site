import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function MobileStickyCTA() {
  const location = useLocation();
  const { lang } = useLanguage();
  // Tracks "has the user scrolled past the hero" and "is #produkte itself on
  // screen" separately — the bar shows whenever the first is true and the
  // second is false. The previous version only ever set visible→false when
  // #produkte appeared and never set it back to true on leaving, so once a
  // visitor scrolled past the products section the bar was gone for the rest
  // of the page (Tools, Anleitungen, FAQ, Kontakt had no buy path on mobile).
  const [pastHero, setPastHero] = useState(false);
  const [onProducts, setOnProducts] = useState(false);

  const isMain = location.pathname === '/';

  useEffect(() => {
    if (!isMain) return;
    const home = document.getElementById('home');
    const products = document.getElementById('produkte');
    if (!home || !products) return;

    const homeObserver = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );

    const productsObserver = new IntersectionObserver(
      ([entry]) => setOnProducts(entry.isIntersecting),
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    homeObserver.observe(home);
    productsObserver.observe(products);

    return () => {
      homeObserver.disconnect();
      productsObserver.disconnect();
    };
  }, [isMain]);

  const visible = pastHero && !onProducts;

  if (!isMain) return null;

  const label = lang === 'de' ? 'Jetzt bestellen →' : 'Buy now →';

  const handleClick = () => {
    document.getElementById('produkte')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <button
        onClick={handleClick}
        className="w-full py-4 text-sm font-semibold"
        style={{
          background: 'var(--cta-bg)',
          color: 'var(--cta-fg)',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
        }}
      >
        {label}
      </button>
    </div>
  );
}
