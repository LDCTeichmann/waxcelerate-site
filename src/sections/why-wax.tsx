import { useRef, useEffect } from 'react';
import { Shield, Snowflake, Droplets, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';


const differentiators = [
  {
    icon: Shield,
    catDe: 'Konsistenz', catEn: 'Consistency',
    titleDe: 'Jeder Block wirkt gleich', titleEn: 'Every block performs identically',
    descDe: 'Additive sedimentieren nicht in der Schmelze — erster und letzter Block identisch.',
    descEn: "Additives don't sediment in the melt — first and last block perform identically.",
  },
  {
    icon: Snowflake,
    catDe: 'Winter', catEn: 'Winter',
    titleDe: 'Schaltet noch bei −8°C', titleEn: 'Shifts cleanly at −8°C',
    descDe: 'Matrix bleibt flexibel bei Frost — kein Verhärten in den Gelenken.',
    descEn: 'Matrix stays flexible at sub-zero — no hardening in the links.',
  },
  {
    icon: Droplets,
    catDe: 'Rostschutz', catEn: 'Rust Protection',
    titleDe: 'Weniger Rost nach Regen', titleEn: 'Less rust after rain',
    descDe: 'Hydrophobe Matrix lagert weniger Wasser ein — geringere Rostneigung nach Regenfahrten.',
    descEn: 'Hydrophobic matrix absorbs less water — reduced rust tendency after wet rides.',
  },
  {
    icon: Sun,
    catDe: 'Sommer', catEn: 'Summer',
    titleDe: 'Bleibt auf der Kette — auch bei 35°C', titleEn: 'Stays on the chain — even at 35°C',
    descDe: 'Kein Wachsverlust im Hochsommer, keine Migration auf Schaltwerk.',
    descEn: 'No wax loss in summer heat, no migration to the derailleur.',
  },
];

export function WhyWax() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const costRef = useRef<HTMLDivElement>(null);
  const frictionRef = useRef<HTMLDivElement>(null);
  const de = lang === 'de';

  useSectionReveal(headerRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Diff card reveal
      const cards = cardsRef.current?.querySelectorAll('.diff-card');
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 82%', once: true },
        });
      }

      // Friction bars — animate scaleX (compositor only, no layout recalc)
      frictionRef.current?.querySelectorAll('.fbar').forEach((bar) => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: pct, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: frictionRef.current, start: 'top 80%', once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-28 bg-wx-sf chain-texture">
      {/* Top gradient — bridges from SocialProof (sf3) above */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }}
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="text-center mb-14">
            <h2 className="font-display text-5xl sm:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Warum Heißwachs?' : 'Why Hot Wax?'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-lg mx-auto text-[15px]">
              {de
                ? 'Messbare Vorteile, konkrete Kosten — und warum diese Formel besser durchdacht ist als die meisten Alternativen.'
                : 'Measurable advantages, real costs — and why this formulation is more carefully developed than most alternatives.'}
            </p>
          </div>

          {/* ── Cost Savings ── */}
          <div ref={costRef} className="mb-16">
            <div className="rounded-2xl border border-wx-bd overflow-hidden" style={{ background: 'var(--sf3)' }}>

              {/* Savings hero */}
              <div
                className="px-6 pt-7 pb-6 text-center border-b border-wx-bd"
                style={{ background: 'rgba(43,82,176,0.06)' }}
              >
                <p className="text-xs tracking-[0.25em] uppercase font-medium mb-3 text-wx-txf">
                  {de ? 'Kostenvergleich · 12.000 km' : 'Cost comparison · 12,000 km'}
                </p>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="font-serif-display italic text-[36px] sm:text-[52px] font-bold text-wx-tx1 tabular-nums leading-none">~€70</span>
                  <div className="flex flex-col items-start">
                    <span className="text-[15px] font-semibold leading-tight" style={{ color: '#2B52B0' }}>
                      {de ? 'gespart' : 'saved'}
                    </span>
                    <span className="text-[13px] text-wx-txf leading-tight">−46 %</span>
                  </div>
                </div>
                <p className="text-[12px] text-wx-txf mt-2">
                  {de ? 'gegenüber Kettenöl auf gleicher Strecke' : 'vs. chain oil over the same distance'}
                </p>
              </div>

              {/* Side-by-side cost cards */}
              <div className="px-5 py-5 flex items-stretch gap-3">
                {/* Oil */}
                <div className="flex-1 rounded-xl border border-wx-bd p-4 text-center" style={{ background: 'var(--sf3)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff font-medium mb-2.5">{de ? 'Mit Öl' : 'With Oil'}</p>
                  <span className="text-[32px] font-bold text-wx-txm tabular-nums leading-none">~€151</span>
                  <p className="text-[10px] text-wx-txff mt-1.5">{de ? '3 Ketten' : '3 chains'}</p>
                </div>
                {/* Wax */}
                <div className="flex-1 rounded-xl border p-4 text-center" style={{ borderColor: 'rgba(43,82,176,0.35)', background: 'rgba(43,82,176,0.06)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2.5" style={{ color: '#3D67CA' }}>Wax</p>
                  <span className="text-[32px] font-bold tabular-nums leading-none" style={{ color: '#4A72D4' }}>~€81</span>
                  <p className="text-[10px] mt-1.5" style={{ color: '#3D67CA' }}>{de ? '1 Kette' : '1 chain'}</p>
                </div>
              </div>

              {/* Calculation breakdown */}
              <div className="border-t border-wx-bd px-6 py-5 grid sm:grid-cols-2 gap-5" style={{ background: 'rgba(0,0,0,0.08)' }}>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-wx-txf font-medium mb-3">{de ? 'Mit Öl' : 'With Oil'}</p>
                  <div className="space-y-1.5">
                    {[
                      [de ? '3 Ketten × €46' : '3 chains × €46', '€138'],
                      [de ? 'Öl · 12× à €1,10' : 'Oil · 12× at €1.10', '€13'],
                      [de ? 'Gesamt' : 'Total', '~€151'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-baseline">
                        <span className="text-[12px] text-wx-txf">{label}</span>
                        <span className="text-[12px] text-wx-txm tabular-nums font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sm:border-l sm:border-wx-bd sm:pl-5 pt-4 sm:pt-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-medium mb-3" style={{ color: '#2B52B0' }}>
                    {de ? 'Mit Waxcelerate' : 'With Waxcelerate'}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      [de ? '1 Kette × €46' : '1 chain × €46', '€46'],
                      [de ? '500g Block (~20 Anw.)' : '500g block (~20 uses)', '€35'],
                      [de ? 'Gesamt' : 'Total', '~€81'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-baseline">
                        <span className="text-[12px] text-wx-txf">{label}</span>
                        <span className="text-[12px] tabular-nums font-semibold" style={{ color: '#4A72D4' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Why This Formula — 4 cards ── */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
            {differentiators.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className="diff-card flex flex-col rounded-xl border border-wx-bd p-4 sm:p-5"
                  style={{
                    background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                    boxShadow: 'var(--card-shad)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(43,82,176,0.1)', boxShadow: '0 0 0 1px rgba(43,82,176,0.15)' }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: '#4A72D4' }} />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: '#2B52B0' }}>
                      {de ? d.catDe : d.catEn}
                    </p>
                  </div>
                  <p className="text-[13px] sm:text-[14px] font-bold text-wx-tx1 leading-snug mb-2">
                    {de ? d.titleDe : d.titleEn}
                  </p>
                  <p className="text-[12px] text-wx-txm leading-relaxed flex-1">
                    {de ? d.descDe : d.descEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Friction ── */}
          <div ref={frictionRef} className="mb-16">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.18em] uppercase text-wx-txf mb-2">
                {de ? 'Reibungskoeffizient' : 'Friction coefficient'}
              </p>
              <h3 className="font-display text-2xl font-bold text-wx-tx1">
                {de ? 'Messbar weniger Reibung' : 'Measurably less friction'}
              </h3>
            </div>

            <div className="rounded-xl border border-wx-bd p-6 sm:p-8" style={{ background: 'var(--sf3)' }}>
              <p className="text-xs uppercase tracking-[0.16em] text-wx-txff mb-6">
                {de ? 'Schmierungseffizienz — längerer Balken = besser' : 'Lubrication efficiency — longer bar = better'}
              </p>
              <div className="space-y-6">
                {[
                  { label: 'Waxcelerate Pro', descriptor: 'μ 0,03–0,06', pct: '100%', highlight: true, isPro: true },
                  { label: 'Waxcelerate Classic', descriptor: 'μ 0,05–0,07', pct: '86%', highlight: true, isPro: false },
                  { label: de ? 'Graphit-Heißwachs' : 'Graphite Wax', descriptor: 'μ 0,08–0,12', pct: '60%', highlight: false },
                  { label: de ? 'Kettenöl (nass)' : 'Chain Oil (wet)', descriptor: 'μ 0,18–0,25', pct: '15%', highlight: false, dim: true },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[14px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txm'}`}>
                        {item.label}
                        {'isPro' in item && item.isPro && (
                          <span
                            className="ml-2 text-[10px] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded"
                            style={{ background: 'linear-gradient(135deg, #1A3080, #4A72D4)', color: 'rgba(255,255,255,0.9)' }}
                          >
                            PRO
                          </span>
                        )}
                      </span>
                      <span className={`text-[12px] tabular-nums font-mono ${
                        item.highlight ? 'text-wx-tx2' : item.dim ? 'text-wx-txff' : 'text-wx-txf'
                      }`}>
                        {item.descriptor}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                      <div
                        className="fbar h-full w-full rounded-full"
                        data-w={item.pct}
                        style={{
                          background: item.highlight
                            ? ('isPro' in item && item.isPro
                                ? 'linear-gradient(90deg, #1A3080, #6A8AE8)'
                                : 'linear-gradient(90deg, #2B52B0, #4A72D4)')
                            : item.dim ? 'var(--bd2)' : 'var(--txff)',
                          transformOrigin: 'left center',
                          transform: 'scaleX(0)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-wx-txff mt-6">
                {de
                  ? 'Index basiert auf gemessenem Reibungskoeffizient (μ). Waxcelerate Pro mit MoS₂ führt die Skala an — Classic auf Augenhöhe mit Graphit-Heißwachs.'
                  : 'Index derived from measured friction coefficient (μ). Waxcelerate Pro with MoS₂ leads the scale — Classic on par with graphite hot wax.'}
              </p>
            </div>
          </div>

        </div>
      </div>
      {/* Bottom gradient — bridges to Products (pg) below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
