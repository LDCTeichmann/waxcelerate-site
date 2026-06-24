import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { waxVsOil } from '@/lib/data';

// Derived comparison rows — values come from data.ts, never hardcoded twice.
// waxShare ∈ [0,1] = how much of the advantage wax owns (drives the dominance bar).
function buildMetrics(de: boolean) {
  const f = waxVsOil.friction, w = waxVsOil.watts, l = waxVsOil.life;
  return [
    {
      label: de ? 'Reibung' : 'Friction',
      wax: `μ ${f.wax.toFixed(2)}`, oil: `μ ${f.oil.toFixed(2)}`, waxShare: 0.85,
    },
    {
      label: de ? 'Antriebsverlust' : 'Drivetrain loss',
      wax: `${w.wax[0]}–${w.wax[1]} W`, oil: `${w.oil[0]}–${w.oil[1]} W`, waxShare: 0.72,
    },
    {
      label: de ? 'Kettenlaufzeit' : 'Chain life',
      wax: `${l.wax}×`, oil: `${l.oil}×`, waxShare: 0.75,
    },
    {
      label: de ? 'Sauberkeit' : 'Cleanliness',
      wax: de ? 'Trocken' : 'Dry', oil: de ? 'Schmutz' : 'Grime', waxShare: 0.9,
    },
  ];
}

const conditions = [
  { metric: 'Nässe',  labelDe: 'Dichter Film', labelEn: 'Denser film',    anchor: '#kristallstruktur' },
  { metric: '−8 °C',  labelDe: 'Elastisch',    labelEn: 'Stays elastic',  anchor: '#winterformel' },
  { metric: '+75 °C', labelDe: 'Stabil',       labelEn: 'Holds position', anchor: '#matrix' },
];

export function WhyWax() {
  const { lang }   = useLanguage();
  const de         = lang === 'de';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const footerRef  = useRef<HTMLDivElement>(null);

  useSectionReveal(headerRef);

  // Comparison rows + footer ease in on scroll; the dominance bars then sweep
  // out to their wax-share width — one quiet, intentional beat.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const rows = compareRef.current?.querySelectorAll('[data-row]');
      if (rows?.length) {
        gsap.fromTo(rows,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: compareRef.current, start: 'top 85%', once: true } });
      }
      // Bars grow via scaleX (GPU transform) — no per-frame layout reflow.
      // Their layout width is already the wax-share %; scaleX animates 0→1 from the left.
      const bars = compareRef.current?.querySelectorAll('[data-bar]');
      if (bars?.length) {
        gsap.fromTo(bars,
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left center', duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: compareRef.current, start: 'top 80%', once: true } });
      }
      const items = footerRef.current?.querySelectorAll('[data-foot]');
      if (items?.length) {
        gsap.fromTo(items,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.07,
            scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true } });
      }
    }, section);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  const metrics = buildMetrics(de);

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

          {/* ── Editorial comparison — photo | scoreboard ── */}
          <div className="grid lg:grid-cols-[0.92fr_1fr] gap-12 lg:gap-16 items-center">

            {/* Chain photo */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                style={{ border: '1px solid var(--bd)' }}>
                <img
                  src="/images/hero/chain.jpg"
                  alt={de ? 'Saubere, gewachste Fahrradketten auf Schieferplatte' : 'Clean wax-coated bicycle chains on slate'}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
                <p className="absolute bottom-0 left-0 right-0 px-5 pb-4 text-[12.5px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {de
                    ? 'Trockener Wachsfilm — Schmutz findet keinen Halt.'
                    : 'A dry wax film gives dirt nothing to cling to.'}
                </p>
              </div>
            </div>

            {/* Scoreboard */}
            <div ref={compareRef} className="order-1 lg:order-2">
              {/* column labels */}
              <div className="flex items-end justify-end gap-8 sm:gap-10 mb-1 pb-3"
                style={{ borderBottom: '1px solid var(--bd)' }}>
                <span className="text-[10.5px] uppercase font-semibold tracking-[0.18em] w-[88px] text-right"
                  style={{ color: 'var(--accent-soft)' }}>{de ? 'Wachs' : 'Wax'}</span>
                <span className="text-[10.5px] uppercase font-semibold tracking-[0.18em] w-[100px] text-right"
                  style={{ color: 'var(--txf)' }}>{de ? 'Öl' : 'Oil'}</span>
              </div>

              {metrics.map((m, i) => (
                <div key={i} data-row className="py-4"
                  style={i > 0 ? { borderTop: '1px solid var(--bd2)' } : undefined}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] uppercase tracking-[0.16em] font-medium"
                      style={{ color: 'var(--txm)' }}>{m.label}</span>
                    <div className="flex items-baseline gap-8 sm:gap-10">
                      <span className="num-data font-semibold text-[19px] leading-none w-[88px] text-right"
                        style={{ color: 'var(--accent-soft)' }}>{m.wax}</span>
                      <span className="num-data text-[15px] leading-tight w-[100px] text-right"
                        style={{ color: 'var(--txf)' }}>{m.oil}</span>
                    </div>
                  </div>
                  {/* dominance bar — accent = wax's share of the advantage */}
                  <div className="mt-3 h-[3px] w-full rounded-full overflow-hidden"
                    style={{ background: 'var(--bd2)' }}>
                    <div data-bar data-to={`${Math.round(m.waxShare * 100)}%`}
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(m.waxShare * 100)}%`, background: 'var(--accent-soft)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Calm editorial footer — hairlines, no boxes ── */}
          <div ref={footerRef} className="mt-16 sm:mt-20">

            {/* Conditions — three quiet inline proofs */}
            <div data-foot className="grid grid-cols-1 sm:grid-cols-3"
              style={{ borderTop: '1px solid var(--bd)' }}>
              {conditions.map((c, i) => (
                <Link key={i} to={`/wissenschaft${c.anchor}`}
                  className="group flex items-baseline justify-between gap-3 py-5 sm:px-5 first:sm:pl-0 transition-colors"
                  style={i > 0 ? { borderTop: '1px solid var(--bd2)' } : undefined}>
                  <span>
                    <span className="num-data font-semibold text-[16px] block"
                      style={{ color: 'var(--accent-soft)' }}>{c.metric}</span>
                    <span className="text-[12px] mt-1 block" style={{ color: 'var(--txm)' }}>
                      {de ? c.labelDe : c.labelEn}
                    </span>
                  </span>
                  <span aria-hidden className="text-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ color: 'var(--accent-soft)' }}>→</span>
                </Link>
              ))}
            </div>

            {/* Cost — one quiet measured line */}
            <Link to="/wissenschaft#reibung" data-foot
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-5"
              style={{ borderTop: '1px solid var(--bd)' }}>
              <p className="text-[14px]" style={{ color: 'var(--tx2)' }}>
                <span className="num font-bold" style={{ color: 'var(--tx1)' }}>~€{waxVsOil.cost.savedEur}</span>
                {de ? ' gespart · ' : ' saved · '}
                <span className="font-semibold" style={{ color: 'var(--accent-soft)' }}>
                  {waxVsOil.cost.pctLess}{de ? ' % weniger Reibverlust' : '% less drag'}
                </span>
                {de ? ' über ' : ' over '}
                <span className="num">{waxVsOil.cost.km.toLocaleString(de ? 'de-DE' : 'en-US')} km</span>
              </p>
              <span className="text-[12.5px] num" style={{ color: 'var(--txm)' }}>
                {de ? 'Öl ' : 'Oil '}~€{waxVsOil.cost.oilEur} → {de ? 'Wachs ' : 'Wax '}~€{waxVsOil.cost.waxEur}
              </span>
            </Link>

            {/* Science CTA */}
            <Link to="/wissenschaft" data-foot
              className="group flex items-center justify-between gap-4 py-5"
              style={{ borderTop: '1px solid var(--bd)' }}>
              <p className="text-[14px]" style={{ color: 'var(--tx2)' }}>
                <span className="font-semibold" style={{ color: 'var(--tx1)' }}>
                  {de ? 'Die Wissenschaft dahinter' : 'The science behind it'}
                </span>
                <span style={{ color: 'var(--txm)' }}>
                  {de ? ' — Kontaktzonen, Reibkurven, Mikroskopie' : ' — contact zones, friction curves, microscopy'}
                </span>
              </p>
              <span className="text-[14px] font-medium shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: 'var(--accent-soft)' }}>→</span>
            </Link>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </section>
  );
}
