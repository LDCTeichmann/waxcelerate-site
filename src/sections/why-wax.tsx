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

export function WhyWax() {
  const { lang } = useLanguage();
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const act1Ref     = useRef<HTMLDivElement>(null);
  const act2Ref     = useRef<HTMLDivElement>(null);
  const act3Ref     = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useSectionReveal(headerRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Act 1 images — stagger in
      const imgs = act1Ref.current?.querySelectorAll('.act1-img');
      if (imgs?.length) {
        gsap.fromTo(imgs, { opacity: 0, y: 24, scale: 0.97 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: act1Ref.current, start: 'top 80%', once: true },
        });
      }

      // Act 2 friction bars
      act2Ref.current?.querySelectorAll('.fbar').forEach((bar) => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: pct, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: act2Ref.current, start: 'top 78%', once: true },
        });
      });

      // Act 2 cost numbers count-up feel
      const costNums = act2Ref.current?.querySelectorAll('.cost-num');
      if (costNums?.length) {
        gsap.fromTo(costNums, { opacity: 0, y: 16 }, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: act2Ref.current, start: 'top 78%', once: true },
        });
      }

      // Act 3 cards
      const cards = act3Ref.current?.querySelectorAll('.act3-card');
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: act3Ref.current, start: 'top 82%', once: true },
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
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── Header ── */}
          <div ref={headerRef}>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Formel' : 'The Formula'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Was Waxcelerate anders macht.' : 'What makes Waxcelerate different.'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-lg text-[15px]">
              {de
                ? 'Die Formel, die Charge, der Preis — warum Waxcelerate kein Kompromiss ist.'
                : 'The formula, the batch, the price — why Waxcelerate makes no compromise.'}
            </p>
          </div>

          {/* ══ ACT 1 — Das Problem ══ */}
          <div ref={act1Ref}>
            {/* Problem statement */}
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3" style={{ color: 'var(--txf)' }}>
                {de ? 'Das Problem' : 'The Problem'}
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-wx-tx1 leading-[1.2] max-w-xl">
                {de
                  ? 'Kettenöl klebt. Sammelt Dreck. Frisst deine Kette.'
                  : 'Chain oil clings. Collects grit. Eats your chain.'}
              </p>
            </div>

            {/* Chain comparison images */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="act1-img relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img
                  src="/images/chain-dirty.jpg"
                  alt={de ? 'Kette mit Kettenöl — schmutzig' : 'Chain with oil — dirty'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <span className="text-white font-semibold text-[13px]">{de ? 'Mit Kettenöl' : 'With chain oil'}</span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(220,60,60,0.85)', color: '#fff' }}
                  >
                    {de ? 'Dreck & Verschleiß' : 'Grit & wear'}
                  </span>
                </div>
              </div>

              <div className="act1-img relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img
                  src="/images/chain-clean.jpg"
                  alt={de ? 'Kette mit Heißwachs — sauber' : 'Chain with hot wax — clean'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <span className="text-white font-semibold text-[13px]">{de ? 'Mit Heißwachs' : 'With hot wax'}</span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(26,120,74,0.85)', color: '#fff' }}
                  >
                    {de ? 'Trocken & sauber' : 'Dry & clean'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══ ACT 2 — Die Zahlen ══ */}
          <div ref={act2Ref}>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-8" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Zahlen' : 'The Numbers'}
            </p>

            <div className="grid sm:grid-cols-2 gap-3">

              {/* Friction chart — hero */}
              <div
                className="rounded-2xl border border-wx-bd p-6 flex flex-col gap-5"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--txf)' }}>
                    {de ? 'Reibungsverlust' : 'Friction loss'}
                  </p>
                  <p className="font-display font-bold text-wx-tx1 text-[40px] leading-none tracking-[-0.03em]">
                    μ 0,03
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--txm)' }}>
                    {de ? 'gegenüber μ 0,25 mit Kettenöl — 8× weniger Verlust' : 'vs. μ 0.25 with chain oil — 8× less friction'}
                  </p>
                </div>

                <div className="space-y-4 flex-1">
                  {frictionBars.map((item, i) => {
                    const label = de ? item.labelDe : item.labelEn;
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1.5">
                          <span
                            className="text-[12px] font-medium"
                            style={{ color: item.highlight ? 'var(--tx1)' : 'var(--txf)' }}
                          >
                            {label}
                          </span>
                          <span
                            className="text-[12px] font-mono tabular-nums"
                            style={{ color: item.highlight ? 'var(--tx2)' : 'var(--txff)' }}
                          >
                            {item.val}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
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

                <Link
                  to="/wissenschaft"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium pt-3 transition-opacity hover:opacity-70"
                  style={{ color: '#264E8C', borderTop: '1px solid var(--bd2)' }}
                >
                  <FlaskConical className="w-3 h-3" />
                  {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
                </Link>
              </div>

              {/* Cost comparison */}
              <div
                className="rounded-2xl border border-wx-bd p-6 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--txf)' }}>
                    {de ? 'Kosten über 12.000 km' : 'Cost over 12,000 km'}
                  </p>
                  <p className="text-[12px] mb-6" style={{ color: 'var(--txm)' }}>
                    {de ? 'Schmiermittel + Kette + Ritzel gerechnet' : 'Lubricant + chain + cassette included'}
                  </p>
                </div>

                <div className="flex items-end justify-around mb-6">
                  <div className="text-center cost-num">
                    <p
                      className="font-display font-bold leading-none tracking-[-0.03em]"
                      style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', color: 'var(--txm)' }}
                    >
                      €151
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--txf)' }}>
                      {de ? 'mit Kettenöl' : 'with chain oil'}
                    </p>
                    {/* Bar */}
                    <div className="mx-auto mt-3 w-1.5 rounded-full" style={{ height: '64px', background: 'var(--bd2)' }} />
                  </div>

                  <div className="text-center cost-num">
                    <p
                      className="font-display font-bold leading-none tracking-[-0.03em]"
                      style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', color: 'var(--tx1)' }}
                    >
                      €81
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--txf)' }}>
                      {de ? 'mit Waxcelerate' : 'with Waxcelerate'}
                    </p>
                    {/* Bar — shorter = cheaper */}
                    <div
                      className="mx-auto mt-3 w-1.5 rounded-full"
                      style={{ height: '32px', background: 'linear-gradient(180deg, #0F2450, #3D67CA)' }}
                    />
                  </div>

                  <div className="text-center cost-num">
                    <p
                      className="font-display font-bold leading-none tracking-[-0.02em] text-wx-tx1"
                      style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
                    >
                      ~€70
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--txf)' }}>
                      {de ? 'gespart' : 'saved'}
                    </p>
                    <div
                      className="mx-auto mt-3 w-1.5 rounded-full"
                      style={{ height: '48px', background: 'linear-gradient(180deg, #1a7a4a, #25D366)' }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-center" style={{ color: 'var(--txff)' }}>
                  {de
                    ? '* Kette €30, Ritzel €45, Rewax-Intervall ~500 km, Ölwechsel ~300 km'
                    : '* Chain €30, cassette €45, rewax interval ~500 km, oil interval ~300 km'}
                </p>
              </div>
            </div>
          </div>

          {/* ══ ACT 3 — Die Formel ══ */}
          <div ref={act3Ref}>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-8" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Formel' : 'The Formula'}
            </p>

            <div className="grid sm:grid-cols-2 gap-3">

              {/* Stuttgart batch card — with product image */}
              <div
                className="act3-card rounded-2xl border border-wx-bd overflow-hidden flex flex-col"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <div className="relative overflow-hidden" style={{ height: '160px' }}>
                  <img
                    src="/images/wax-packaging.jpeg"
                    alt={de ? 'Waxcelerate Produktion Stuttgart' : 'Waxcelerate production Stuttgart'}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--card-to) 100%)' }}
                  />
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--txf)' }}>
                    {de ? 'Chargenqualität' : 'Batch Quality'}
                  </p>
                  <p className="font-serif-display italic text-[18px] font-bold text-wx-tx1 leading-[1.2]">
                    {de ? 'Erster Block = letzter Block' : 'First block = last block'}
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                    {de
                      ? 'Kleinstchargen in Stuttgart, kontrolliert homogenisiert — jeder Block identisch.'
                      : 'Small batches in Stuttgart, controlled homogenisation — every block identical.'}
                  </p>
                </div>
              </div>

              {/* Classic vs Pro selector */}
              <div
                className="act3-card rounded-2xl border border-wx-bd p-5 flex flex-col gap-4"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                }}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--txf)' }}>
                    {de ? 'Zwei Formeln' : 'Two Formulas'}
                  </p>
                  <p className="font-serif-display italic text-[18px] font-bold text-wx-tx1 leading-[1.2]">
                    {de ? 'Classic oder Pro — kein Kompromiss' : 'Classic or Pro — no compromise'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {/* Classic */}
                  <div
                    className="rounded-xl p-4 flex items-start gap-3"
                    style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(42,84,153,0.12)', color: '#264E8C' }}
                    >
                      C
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-wx-tx1">Classic (PTFE)</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--txm)' }}>
                        {de ? 'Frühjahr – Herbst · Straße · Gravel' : 'Spring – Autumn · Road · Gravel'}
                      </p>
                    </div>
                  </div>

                  {/* Pro */}
                  <div
                    className="rounded-xl p-4 flex items-start gap-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15,36,80,0.08) 0%, rgba(61,103,202,0.06) 100%)',
                      border: '1px solid rgba(42,84,153,0.25)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(42,84,153,0.15)', color: '#264E8C' }}
                    >
                      P
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-wx-tx1">
                        Pro (MoS₂)
                        <span
                          className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(42,84,153,0.12)', color: '#264E8C' }}
                        >
                          {de ? 'Ganzjahr' : 'Year-round'}
                        </span>
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--txm)' }}>
                        {de ? 'Winter · E-Bike · Nässe · −8 °C' : 'Winter · E-Bike · Wet · −8 °C'}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/#produkte"
                  onClick={(e) => { e.preventDefault(); document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="flex items-center justify-center w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
                >
                  {de ? 'Produkte ansehen →' : 'See products →'}
                </Link>
              </div>
            </div>
          </div>

          {/* Science link */}
          <Link
            to="/wissenschaft"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
            style={{ color: '#264E8C' }}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {de ? 'Wissenschaft & Formeln lesen →' : 'Read science & formulas →'}
          </Link>

        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
