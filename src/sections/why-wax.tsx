import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

const frictionBars = [
  { labelDe: 'Waxcelerate Pro',     labelEn: 'Waxcelerate Pro',     val: 'μ 0,03–0,06', pct: 100, highlight: true  },
  { labelDe: 'Waxcelerate Classic', labelEn: 'Waxcelerate Classic', val: 'μ 0,05–0,07', pct: 80,  highlight: true  },
  { labelDe: 'Kettenöl',            labelEn: 'Chain oil',           val: 'μ 0,18–0,25', pct: 18,  highlight: false },
];

const heroStats: { numDe: string; numEn: string; labelDe: string; labelEn: string; subDe: string; subEn: string }[] = [
  {
    numDe: 'μ 0,03', numEn: 'μ 0.03',
    labelDe: 'Reibungsverlust', labelEn: 'Friction loss',
    subDe: 'Kettenöl: μ 0,25', subEn: 'Chain oil: μ 0.25',
  },
  {
    numDe: '−46 %', numEn: '−46 %',
    labelDe: 'Kostenersparnis', labelEn: 'Cost savings',
    subDe: '€81 statt €151 / 12.000 km', subEn: '€81 vs €151 / 12,000 km',
  },
  {
    numDe: '3×', numEn: '3×',
    labelDe: 'Kettenlaufzeit', labelEn: 'Chain life',
    subDe: '12.000 km statt 4.000 km', subEn: '12,000 km vs 4,000 km',
  },
];

export function WhyWax() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const frictionRef = useRef<HTMLDivElement>(null);
  const formulaRef = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useSectionReveal(headerRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stats row
      const statItems = statsRef.current?.querySelectorAll('.stat-item');
      if (statItems?.length) {
        gsap.fromTo(statItems, { opacity: 0, y: 18 }, {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        });
      }

      // Friction bars
      frictionRef.current?.querySelectorAll('.fbar').forEach((bar) => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: pct, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: frictionRef.current, start: 'top 82%', once: true },
        });
      });

      // Formula cards
      const cards = formulaRef.current?.querySelectorAll('.formula-card');
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: formulaRef.current, start: 'top 85%', once: true },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-24 bg-wx-sf chain-texture">
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* ── Header ── */}
          <div ref={headerRef}>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Formel' : 'The Formula'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Was Waxcelerate anders macht.' : 'What makes Waxcelerate different.'} />
            </h2>
            <p data-reveal="subtitle" className="max-w-xl text-[15px]" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Kettenöl klebt, sammelt Dreck und frisst die Kette. Heißwachs trocknet durch, schützt von innen — und hält dreimal so lang.'
                : 'Chain oil clings, collects grit and eats the chain. Hot wax penetrates dry, protects from within — and lasts three times as long.'}
            </p>
          </div>

          {/* ── Hero stats — 3 numbers ── */}
          <div ref={statsRef} className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--bd)' }}>
            {heroStats.map((s, i) => (
              <div
                key={i}
                className="stat-item flex flex-col items-center justify-center text-center px-4 py-8 sm:py-10"
                style={{ background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)' }}
              >
                <p
                  className="font-display font-bold tabular-nums leading-none tracking-[-0.03em] mb-2"
                  style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: 'var(--tx1)' }}
                >
                  {de ? s.numDe : s.numEn}
                </p>
                <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: 'var(--txf)' }}>
                  {de ? s.labelDe : s.labelEn}
                </p>
                <p className="text-[10px] sm:text-[11px]" style={{ color: 'var(--txff)' }}>
                  {de ? s.subDe : s.subEn}
                </p>
              </div>
            ))}
          </div>

          {/* ── Friction chart — full width ── */}
          <div
            ref={frictionRef}
            className="rounded-2xl border border-wx-bd p-6 sm:p-8"
            style={{
              background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
              boxShadow: 'var(--card-shad)',
            }}
          >
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--txf)' }}>
                  {de ? 'Reibungskoeffizient' : 'Friction coefficient'}
                </p>
                <p className="font-display font-bold text-wx-tx1 text-[32px] sm:text-[40px] leading-none tracking-[-0.03em]">
                  μ 0,03
                </p>
              </div>
              <p className="text-[12px] sm:text-[13px] max-w-xs text-right" style={{ color: 'var(--txm)' }}>
                {de
                  ? '8× weniger Reibung als Kettenöl — weniger Watt verloren, mehr Geschwindigkeit.'
                  : '8× less friction than chain oil — fewer watts lost, more speed.'}
              </p>
            </div>

            <div className="space-y-5">
              {frictionBars.map((item, i) => {
                const label = de ? item.labelDe : item.labelEn;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[12px] sm:text-[13px] font-medium" style={{ color: item.highlight ? 'var(--tx1)' : 'var(--txf)' }}>
                        {label}
                      </span>
                      <span className="text-[12px] sm:text-[13px] font-mono tabular-nums" style={{ color: item.highlight ? 'var(--tx2)' : 'var(--txff)' }}>
                        {item.val}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                      <div
                        className="fbar h-full w-full rounded-full"
                        data-w={item.pct}
                        style={{
                          background: item.highlight
                            ? 'linear-gradient(90deg, #0F2450, #3D67CA)'
                            : 'var(--bd2)',
                          transformOrigin: 'left center',
                          transform: 'scaleX(0)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--bd2)' }}>
              <Link
                to="/wissenschaft"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
                style={{ color: '#264E8C' }}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                {de ? 'Vollständiger Vergleich & Wissenschaft →' : 'Full comparison & science →'}
              </Link>
            </div>
          </div>

          {/* ── Formula — Classic vs Pro with product images ── */}
          <div ref={formulaRef}>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-6" style={{ color: 'var(--txf)' }}>
              {de ? 'Zwei Formeln. Eine Entscheidung.' : 'Two formulas. One decision.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-3">

              {/* Classic */}
              <div
                className="formula-card rounded-2xl border border-wx-bd overflow-hidden flex flex-col"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <div className="relative overflow-hidden bg-wx-sf2" style={{ aspectRatio: '4/3' }}>
                  <img
                    src="/images/wax-classic-hero.png"
                    alt="Waxcelerate Classic"
                    className="w-full h-full object-contain p-6"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(42,84,153,0.10)', color: '#264E8C' }}
                    >
                      Classic
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--txff)' }}>PTFE</span>
                  </div>
                  <p className="font-serif-display italic text-[17px] font-bold text-wx-tx1 leading-[1.2]">
                    {de ? 'Frühjahr bis Herbst' : 'Spring to Autumn'}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                    {de
                      ? 'Trockene und gemischte Bedingungen. Straße, Gravel, Alltag.'
                      : 'Dry and mixed conditions. Road, gravel, commute.'}
                  </p>
                </div>
              </div>

              {/* Pro */}
              <div
                className="formula-card rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                  border: '1px solid rgba(42,84,153,0.30)',
                }}
              >
                <div className="relative overflow-hidden bg-wx-sf2" style={{ aspectRatio: '4/3' }}>
                  <img
                    src="/images/wax-pro-hero.png"
                    alt="Waxcelerate Pro"
                    className="w-full h-full object-contain p-6"
                  />
                  <div
                    className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(15,36,80,0.85)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }}
                  >
                    {de ? 'Ganzjahr' : 'Year-round'}
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(15,36,80,0.12)', color: '#1A3C6E' }}
                    >
                      Pro
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--txff)' }}>MoS₂</span>
                  </div>
                  <p className="font-serif-display italic text-[17px] font-bold text-wx-tx1 leading-[1.2]">
                    {de ? 'Winter, Nässe, E-Bike' : 'Winter, wet, e-bike'}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                    {de
                      ? 'MoS₂ hält die Matrix bei Frost geschmeidig — flexibel bis −8 °C.'
                      : 'MoS₂ keeps the matrix supple at frost — flexible to −8 °C.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
                {de ? 'Nicht sicher? Classic für Einsteiger — Pro für Ganzjahresfahrer.' : 'Not sure? Classic for beginners — Pro for year-round riders.'}
              </p>
              <button
                onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-90 flex-shrink-0"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {de ? 'Produkte ansehen →' : 'See products →'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
