import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { trackProductsSeen } from '@/lib/analytics';
import { ProductShelf } from '@/sections/ProductShelf';
import { Section } from '@/components/Section';

const CompareModal = lazy(() => import('@/sections/CompareModal').then(m => ({ default: m.CompareModal })));

export function Products() {
  const { t, lang } = useLanguage();
  const [compareOpen, setCompareOpen] = useState(false);
  const de = lang === 'de';
  const navigate = useNavigate();

  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // scroll_products (Mobile-Plan A6): feuert einmal, sobald die Produktsektion
  // sichtbar wird — misst, wie viele Besucher ueberhaupt so weit scrollen.
  // Schwelle 10%: die Sektion ist auf Mobile deutlich hoeher als der
  // Viewport, bei einer hohen Schwelle wuerde "sichtbar" erst ausloesen, wenn
  // fast die ganze Sektion durchgescrollt ist.
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { trackProductsSeen(); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rechner und Hero schicken weiter 'wax' | 'chain'. Das Wachs steht seit dem
  // Regal-Umbau ohne Klick da, 'chain' fuehrte bisher zu einem lokalen
  // useState-Aufklappen — seit Stufe 3 (K10) ist die Kettenliste eine echte
  // Route, also navigiert dieser Handler stattdessen dorthin.
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<'wax' | 'chain'>).detail === 'chain') navigate('/ketten');
    };
    window.addEventListener('wax:selectTab', handler);
    return () => window.removeEventListener('wax:selectTab', handler);
  }, [navigate]);

  // Alte Deep-Links vom „Passende Kette"-Rechner: /?ketten=shimano-12
  // (#produkt-liste existierte auf der Startseite). Jetzt eine Weiterleitung
  // auf /ketten?marke=&gang= statt eines lokalen Aufklappens (K9: "Alte
  // ?ketten=-Links client-seitig weiterleiten"). Ungueltige oder fehlende
  // Werte werden still ignoriert — dieselbe Haltung wie beim QR-Parameter
  // ?w= des Intervall-Rechners (toolState.ts).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('ketten');
    if (!raw) return;
    const [brand, speed] = raw.split('-');
    const brands = ['shimano', 'sram', 'campagnolo'] as const;
    const matchedBrand = brands.find(b => b === brand);
    if (matchedBrand && (speed === '11' || speed === '12')) {
      navigate(`/ketten?marke=${matchedBrand}&gang=${speed}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section id="produkte" ref={sectionRef} className="bg-wx-bg">
          {/* Header */}
          <div ref={headerRef} className="mb-10">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.products.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl">
              {t.products.subtitle}
            </p>
          </div>

          {/* ── Regal ──
              Zeigt die Ware sofort statt drei Tueren davor. Die Kettenliste
              ist seit Stufe 3 die eigene Route /ketten (siehe SecondaryTile
              "Alle Ketten ansehen" in ProductShelf.tsx). */}
          <ProductShelf
            de={de}
            t={t}
            onCompare={() => setCompareOpen(true)}
          />

          {/* Der Vergleich haengt am Regal, nicht mehr an einem Tab. */}
          {compareOpen && (
            <Suspense fallback={null}>
              <CompareModal open onClose={() => setCompareOpen(false)} de={de} t={t} />
            </Suspense>
          )}

      {/* Bottom gradient — bridges to About below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--sf), transparent 100%), var(--sf))', zIndex: 1 }}
      />
    </Section>
  );
}

