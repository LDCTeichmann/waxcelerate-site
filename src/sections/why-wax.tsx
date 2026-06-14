import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';
import { SegmentedToggle, AnimatedNumber, InstrumentFrame, Chain } from '@/components/viz';
import { waxVsOil } from '@/lib/data';

const cardStyle = {
  background: 'var(--card-bg)',
  boxShadow: 'var(--card-shad)',
};

// Condition hooks — slim chips that replace the old tall benefit cards.
// Each links to the matching deep section on the science page.
const conditions = [
  { metric: 'Nässe',    labelDe: 'Dichter Film',  labelEn: 'Denser film',  anchor: '#kristallstruktur' },
  { metric: '−8 °C',    labelDe: 'Elastisch',     labelEn: 'Stays elastic', anchor: '#winterformel' },
  { metric: '+75 °C',   labelDe: 'Stabil',        labelEn: 'Holds position', anchor: '#matrix' },
];

// ─── Wax⇄Oil toggle — the section's glanceable centerpiece ───────────────────
function WaxOilToggle({ de }: { de: boolean }) {
  const [state, setState] = useState<'wax' | 'oil'>('wax');
  const wax = state === 'wax';

  const friction = waxVsOil.friction[state];
  const [wLo, wHi] = waxVsOil.watts[state];
  const life = waxVsOil.life[state];

  // wax = the good state → accent; oil = worse → muted.
  const valColor = { color: wax ? 'var(--accent)' : 'var(--txm)', transition: 'color 300ms ease' };
  const valCls = 'num-data font-semibold text-[19px] leading-none tabular-nums';

  return (
    <InstrumentFrame eyebrow={de ? 'Öl vs. Wachs' : 'Oil vs. Wax'} className="mb-10">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">

        {/* Illustration */}
        <div className="order-2 lg:order-1">
          <Chain state={state} className="max-w-[420px] mx-auto" />
          <p className="text-center text-[12px] mt-4 transition-colors duration-300"
            style={{ color: wax ? 'var(--accent)' : 'var(--txm)' }}>
            {wax
              ? (de ? 'Trockener Wachsfilm — nichts haftet an.' : 'Dry wax film — nothing sticks.')
              : (de ? 'Öl bindet Schmutz zur Schleifpaste.' : 'Oil binds dirt into grinding paste.')}
          </p>
        </div>

        {/* Toggle + metrics */}
        <div className="order-1 lg:order-2">
          <SegmentedToggle
            ariaLabel={de ? 'Öl oder Wachs' : 'Oil or wax'}
            value={state}
            onChange={setState}
            className="w-full mb-5"
            options={[
              { value: 'wax', label: de ? 'Wachs' : 'Wax' },
              { value: 'oil', label: de ? 'Öl' : 'Oil' },
            ]}
          />

          <dl>
            {/* Friction */}
            <div className="flex items-center justify-between py-3">
              <dt className="text-[13px] text-wx-txm">{de ? 'Reibung' : 'Friction'}</dt>
              <dd>
                <AnimatedNumber value={friction} decimals={2} prefix="μ " className={valCls} style={valColor} />
              </dd>
            </div>
            {/* Drivetrain loss */}
            <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--bd2)' }}>
              <dt className="text-[13px] text-wx-txm">{de ? 'Antriebsverlust' : 'Drivetrain loss'}</dt>
              <dd className={valCls} style={valColor}>
                <AnimatedNumber value={wLo} />
                <span>–</span>
                <AnimatedNumber value={wHi} suffix=" W" />
              </dd>
            </div>
            {/* Chain life */}
            <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--bd2)' }}>
              <dt className="text-[13px] text-wx-txm">{de ? 'Kettenlaufzeit' : 'Chain life'}</dt>
              <dd>
                <AnimatedNumber value={life} suffix="×" className={valCls} style={valColor} />
              </dd>
            </div>
            {/* Cleanliness */}
            <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--bd2)' }}>
              <dt className="text-[13px] text-wx-txm">{de ? 'Sauberkeit' : 'Cleanliness'}</dt>
              <dd className="text-[13px] font-medium" style={valColor}>
                {wax
                  ? (de ? 'Trocken & sauber' : 'Dry & clean')
                  : (de ? 'Bindet Schmutz' : 'Binds dirt')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </InstrumentFrame>
  );
}

export function WhyWax() {
  const { lang }   = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const revealRef  = useRef<HTMLDivElement>(null);
  const de         = lang === 'de';

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      if (revealRef.current) {
        const els = revealRef.current.querySelectorAll('[data-reveal-item]');
        gsap.fromTo(els,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: revealRef.current, start: 'top 90%', once: true } },
        );
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-24 sm:py-32 bg-wx-sf chain-texture">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-10">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal
                text={de ? 'Wachs gewinnt. In Zahlen.' : 'Wax wins. In numbers.'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl text-[15px]">
              {de
                ? 'Umschalten und vergleichen — derselbe Antrieb, zwei Schmierstoffe.'
                : 'Flip and compare — same drivetrain, two lubricants.'}
            </p>
          </div>

          {/* ── Centerpiece ── */}
          <WaxOilToggle de={de} />

          <div ref={revealRef}>
            {/* ── Condition chips (replace tall benefit cards) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {conditions.map((c, i) => (
                <Link
                  key={i}
                  data-reveal-item
                  to={`/wissenschaft${c.anchor}`}
                  className="group rounded-xl border border-wx-bd p-4 flex items-center justify-between gap-3 transition-all duration-300 hover:border-[var(--accent-soft)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                  style={cardStyle}
                >
                  <div>
                    <span className="num-data font-semibold leading-none block text-[18px]"
                      style={{ color: 'var(--accent-soft)' }}>
                      {c.metric}
                    </span>
                    <p className="text-[12px] mt-1 text-wx-txm">{de ? c.labelDe : c.labelEn}</p>
                  </div>
                  <span aria-hidden className="text-[12px] transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ color: 'var(--accent)' }}>→</span>
                </Link>
              ))}
            </div>

            {/* ── Cost strip ── */}
            <Link
              to="/wissenschaft#reibung"
              data-reveal-item
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4 px-5 rounded-xl mb-3 transition-all duration-300 hover:border-[var(--accent-soft)]"
              style={{ ...cardStyle, border: '1px solid var(--bd)' }}
            >
              <p className="text-[13px] text-wx-tx2">
                <span className="num font-bold text-wx-tx1">~€{waxVsOil.cost.savedEur}</span>
                {de ? ' gespart · ' : ' saved · '}
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  {waxVsOil.cost.pctLess}{de ? ' % weniger' : '% less'}
                </span>
                {de ? ' über ' : ' over '}
                <span className="num">{waxVsOil.cost.km.toLocaleString(de ? 'de-DE' : 'en-US')} km</span>
              </p>
              <span className="text-[12px] num text-wx-txm">
                {de ? 'Öl ' : 'Oil '}~€{waxVsOil.cost.oilEur} → {de ? 'Wachs ' : 'Wax '}~€{waxVsOil.cost.waxEur}
              </span>
            </Link>

            {/* ── Formula selector ── */}
            <div data-reveal-item
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4 px-5 rounded-xl"
              style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
              <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
                <span className="font-semibold" style={{ color: 'var(--tx2)' }}>
                  {de ? 'Welche Formel?' : 'Which formula?'}
                </span>
                {' · '}
                <span>Classic (PTFE) — {de ? 'Frühjahr–Herbst' : 'spring–autumn'}</span>
                {'  ·  '}
                <span>Pro (MoS₂) — {de ? 'Ganzjahr, Winter & E-Bike' : 'year-round, winter & e-bike'}</span>
              </p>
              <Link to="/#produkte"
                className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}>
                {de ? 'Zu den Produkten →' : 'See products →'}
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </section>
  );
}
