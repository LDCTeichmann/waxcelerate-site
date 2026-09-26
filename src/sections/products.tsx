import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { trackProductsSeen } from '@/lib/analytics';
import { ProductDoors } from '@/sections/ProductDoors';
import { getEstimatedDelivery } from '@/lib/utils';
import { Section } from '@/components/Section';

export function Products() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const navigate = useNavigate();
  const delivery = getEstimatedDelivery(de ? 'de' : 'en');

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

  // Rechner und Hero schicken weiter 'wax' | 'chain'. Seitenordnung Chat 2:
  // die Tueren fuehren beide schon auf eine eigene Seite, dieser Listener
  // bleibt nur fuer bestehende Verweise auf das alte Regal-Verhalten
  // (SEITENORDNUNG_PLAN.md, "Die Weiterleitung wax:selectTab bleibt
  // erhalten").
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<'wax' | 'chain'>).detail === 'chain') navigate('/ketten');
      // 'wax' bleibt ohne Navigation: der Aufrufer (z.B. IntervalCalculator)
      // scrollt bereits selbst zu #produkte (den drei Tueren) — von dort
      // fuehrt die Tuer "Kettenwachs" gezielt weiter, ein sofortiger
      // Sprung nach /kettenwachs wuerde den eigenen Scroll unterbrechen.
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

  // Alte QR-Links auf dem Paket zeigten auf "/" mit ?w=JJJJMMTT bzw.
  // ?waxed=…, ausgewertet vom inzwischen geloeschten tools.tsx. Seit der
  // Seitenordnung liest /anleitung dieselben Parameter selbst (Chat 3) —
  // hier nur die Weiterleitung dorthin, falls der Link noch auf die
  // Startseite zeigt (SEITENORDNUNG_PLAN.md, Chat 2, Punkt 5).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('w') && !params.has('waxed')) return;
    navigate(`/anleitung${window.location.search}#rechner`, { replace: true });
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
              {t.products.doors.subtitle}
            </p>
          </div>

          {/* ── Drei Tueren ──
              Ersetzt seit der Seitenordnung (09/2026, Chat 2) das Regal: bei
              drei gleich grossen Wegen statt vierzehn Einzel-SKUs entscheidet
              man erst die Kategorie, dann das Produkt (Hick's Law). Das
              volle Regal steht jetzt auf /kettenwachs. */}
          <ProductDoors de={de} t={t} delivery={delivery} />

      {/* Bottom gradient — bridges to About below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--sf), transparent 100%), var(--sf))', zIndex: 1 }}
      />
    </Section>
  );
}
