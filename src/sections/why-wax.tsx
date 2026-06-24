import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Gauge, Clock, Sparkles, HandMetal, Wrench, PiggyBank, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { waxVsOil } from '@/lib/data';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function buildCards(de: boolean) {
  const f = waxVsOil.friction, w = waxVsOil.watts, l = waxVsOil.life;
  return [
    {
      icon: Gauge,
      value: `μ ${f.wax.toFixed(2)}`,
      label: de ? 'Reibung' : 'Friction',
      detail: de ? `${Math.round(f.oil / f.wax)}× weniger als Öl` : `${Math.round(f.oil / f.wax)}× less than oil`,
      share: 0.85,
    },
    {
      icon: Droplets,
      value: `${w.wax[0]}–${w.wax[1]} W`,
      label: de ? 'Antriebsverlust' : 'Drivetrain loss',
      detail: de ? `Öl: ${w.oil[0]}–${w.oil[1]} W` : `Oil: ${w.oil[0]}–${w.oil[1]} W`,
      share: 0.72,
    },
    {
      icon: Clock,
      value: `${l.wax}×`,
      label: de ? 'Kettenlaufzeit' : 'Chain life',
      detail: de ? 'gegenüber Öl' : 'vs oil lubrication',
      share: 0.75,
    },
    {
      icon: Sparkles,
      value: de ? 'Trocken' : 'Dry',
      label: de ? 'Sauberkeit' : 'Cleanliness',
      detail: de ? 'Kein Dreck, keine Flecken' : 'No grime, no stains',
      share: 0.9,
    },
  ];
}

function buildBenefits(de: boolean) {
  return [
    {
      icon: HandMetal,
      text: de ? 'Saubere Hände, saubere Hose' : 'Clean hands, clean clothes',
      sub: de ? 'Trockener Wachsfilm statt klebriger Ölschicht' : 'Dry wax film instead of sticky oil',
    },
    {
      icon: Wrench,
      text: de ? 'Kein Nachschmieren alle 100 km' : 'No re-lubing every 100 km',
      sub: de ? '250–550 km pro Wachsbehandlung' : '250–550 km per wax treatment',
    },
    {
      icon: Clock,
      text: de ? 'Kassette & Kettenblätter halten länger' : 'Cassette & chainrings last longer',
      sub: de ? 'Weniger abrasiver Verschleiß am gesamten Antrieb' : 'Less abrasive wear on the entire drivetrain',
    },
    {
      icon: PiggyBank,
      text: de
        ? `~€${waxVsOil.cost.savedEur} gespart über ${waxVsOil.cost.km.toLocaleString('de-DE')} km`
        : `~€${waxVsOil.cost.savedEur} saved over ${waxVsOil.cost.km.toLocaleString('en-US')} km`,
      sub: de
        ? `Öl ~€${waxVsOil.cost.oilEur} → Wachs ~€${waxVsOil.cost.waxEur}`
        : `Oil ~€${waxVsOil.cost.oilEur} → Wax ~€${waxVsOil.cost.waxEur}`,
    },
  ];
}

export function WhyWax() {
  const { lang }   = useLanguage();
  const de         = lang === 'de';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('[data-card]');
      if (cards?.length) {
        gsap.fromTo(cards,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', once: true } });
      }
      const bars = cardsRef.current?.querySelectorAll('[data-bar]');
      if (bars?.length) {
        gsap.fromTo(bars,
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left center', duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', once: true } });
      }
      const items = benefitsRef.current?.querySelectorAll('[data-benefit]');
      if (items?.length) {
        gsap.fromTo(items,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: benefitsRef.current, start: 'top 88%', once: true } });
      }
    }, section);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  const cards = buildCards(de);
  const benefits = buildBenefits(de);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-24 sm:py-32 bg-wx-sf">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-14 sm:mb-16">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Wachs gewinnt. In Zahlen.' : 'Wax wins. In numbers.'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl text-[15px] leading-relaxed">
              {de
                ? 'Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen.'
                : 'Same drivetrain, two lubricants — measured side by side.'}
            </p>
          </div>

          {/* ── Stat cards — 2×2 grid ── */}
          <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} data-card className="rounded-2xl px-5 py-5 sm:py-6 flex flex-col"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
                  <Icon className="h-5 w-5 mb-4" style={{ color: 'var(--accent-soft)' }} />
                  <span className="font-bold text-[26px] sm:text-[30px] leading-none tracking-[-0.03em]"
                    style={{ fontFamily: MONO, color: 'var(--tx1)' }}>
                    {c.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.14em] font-medium mt-2"
                    style={{ color: 'var(--txm)' }}>
                    {c.label}
                  </span>
                  <span className="text-[11px] mt-1" style={{ color: 'var(--txf)' }}>
                    {c.detail}
                  </span>
                  <div className="mt-auto pt-4 h-[3px] w-full rounded-full overflow-hidden"
                    style={{ background: 'var(--bd2)' }}>
                    <div data-bar className="h-full rounded-full"
                      style={{ width: `${Math.round(c.share * 100)}%`, background: 'var(--accent-soft)' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Real-world benefits ── */}
          <div ref={benefitsRef} className="mt-12 sm:mt-16">
            <p className="eyebrow mb-5" style={{ color: 'var(--txf)' }}>
              {de ? 'Was das bedeutet' : 'What this means'}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} data-benefit
                    className="flex items-start gap-4 rounded-xl px-5 py-4"
                    style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(var(--accent-rgb),0.08)' }}>
                      <Icon className="h-4 w-4" style={{ color: 'var(--accent-soft)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--tx1)' }}>
                        {b.text}
                      </p>
                      <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--txm)' }}>
                        {b.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Science CTA ── */}
          <Link to="/wissenschaft" data-benefit
            className="group flex items-center justify-between gap-4 mt-8 px-6 py-5 rounded-xl transition-all hover:shadow-md"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)' }}>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--tx1)' }}>
                {de ? 'Die Wissenschaft dahinter' : 'The science behind it'}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--txm)' }}>
                {de ? 'Kontaktzonen, Reibkurven, Mikroskopie — alles gemessen.' : 'Contact zones, friction curves, microscopy — all measured.'}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: 'var(--accent-soft)' }} />
          </Link>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </section>
  );
}
