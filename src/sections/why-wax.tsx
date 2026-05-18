import { useRef, useEffect, useState } from 'react';
import { ExternalLink, ArrowRight, Shield, Snowflake, Droplets, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const costOilRef = useRef<HTMLSpanElement>(null);
  const costWaxRef = useRef<HTMLSpanElement>(null);
  const frictionRef = useRef<HTMLDivElement>(null);
  const [rider, setRider] = useState<'summer' | 'allseason' | null>(null);

  const de = lang === 'de';

  useSectionReveal(headerRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Diff card reveal
      const cards = cardsRef.current?.querySelectorAll('.diff-card');
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 82%' },
        });
      }

      // Cost number counters — use gsap.to so val goes 0 → target (not target → 0)
      const oilCounter = { val: 0 };
      if (costOilRef.current) {
        gsap.to(oilCounter, {
          val: 151,
          duration: 1.6,
          ease: 'power2.out',
          snap: { val: 1 },
          scrollTrigger: { trigger: costOilRef.current, start: 'top 80%', once: true },
          onUpdate: () => {
            if (costOilRef.current) costOilRef.current.textContent = `~€${Math.round(oilCounter.val)}`;
          },
        });
      }

      const waxCounter = { val: 0 };
      if (costWaxRef.current) {
        gsap.to(waxCounter, {
          val: 81,
          duration: 1.6,
          ease: 'power2.out',
          snap: { val: 1 },
          scrollTrigger: { trigger: costWaxRef.current, start: 'top 80%', once: true },
          onUpdate: () => {
            if (costWaxRef.current) costWaxRef.current.textContent = `~€${Math.round(waxCounter.val)}`;
          },
        });
      }

      // Friction bars
      frictionRef.current?.querySelectorAll('.fbar').forEach((bar) => {
        const w = (bar as HTMLElement).dataset.w!;
        gsap.fromTo(bar, { width: '0%' }, {
          width: w, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: frictionRef.current, start: 'top 80%' },
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
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf3), transparent)', zIndex: 1 }}
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="text-center mb-14">
            <span data-reveal="eyebrow" className="section-eyebrow mb-4 block">
              {de ? 'Die Formulierung' : 'The Formulation'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={de ? 'Warum Waxcelerate' : 'Why Waxcelerate'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-lg mx-auto text-[15px]">
              {de
                ? 'Nicht warum Wachs — sondern warum diese Formulierung besser durchdacht ist als die meisten Alternativen.'
                : 'Not why wax — but why this formulation is more carefully developed than most alternatives.'}
            </p>
          </div>

          {/* ── Cost Savings ── */}
          <div ref={costRef} className="mb-16">
            <div className="rounded-2xl border border-wx-bd overflow-hidden" style={{ background: 'var(--sf3)' }}>

              {/* Savings hero */}
              <div
                className="px-6 pt-7 pb-6 text-center border-b border-wx-bd"
                style={{ background: 'rgba(74,106,238,0.06)' }}
              >
                <p className="text-xs tracking-[0.25em] uppercase font-medium mb-3 text-wx-txf">
                  {de ? 'Kostenvergleich · 12.000 km' : 'Cost comparison · 12,000 km'}
                </p>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="font-serif-display italic text-[36px] sm:text-[52px] font-bold text-wx-tx1 tabular-nums leading-none">~€70</span>
                  <div className="flex flex-col items-start">
                    <span className="text-[15px] font-semibold leading-tight" style={{ color: '#4A6AEE' }}>
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
                  <span ref={costOilRef} className="text-[32px] font-bold text-wx-txm tabular-nums leading-none">~€0</span>
                  <p className="text-[10px] text-wx-txff mt-1.5">{de ? '3 Ketten' : '3 chains'}</p>
                </div>
                {/* Wax */}
                <div className="flex-1 rounded-xl border p-4 text-center" style={{ borderColor: 'rgba(74,106,238,0.35)', background: 'rgba(74,106,238,0.06)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2.5" style={{ color: '#6A8AFF' }}>Wax</p>
                  <span ref={costWaxRef} className="text-[32px] font-bold tabular-nums leading-none" style={{ color: '#8AAAFF' }}>~€0</span>
                  <p className="text-[10px] mt-1.5" style={{ color: '#6A8AFF' }}>{de ? '1 Kette' : '1 chain'}</p>
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
                  <p className="text-[11px] uppercase tracking-[0.18em] font-medium mb-3" style={{ color: '#4A6AEE' }}>
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
                        <span className="text-[12px] tabular-nums font-semibold" style={{ color: '#8AAAFF' }}>{val}</span>
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
                      style={{ background: 'rgba(74,106,238,0.1)', boxShadow: '0 0 0 1px rgba(74,106,238,0.15)' }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: '#8AAAFF' }} />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: '#4A6AEE' }}>
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
                  { label: 'Waxcelerate Classic', descriptor: 'μ 0,05–0,07', pct: '95%', highlight: true },
                  { label: de ? 'Graphit-Heißwachs' : 'Graphite Wax', descriptor: 'μ 0,08–0,12', pct: '72%', highlight: false },
                  { label: de ? 'Kettenöl (nass)' : 'Chain Oil (wet)', descriptor: 'μ 0,18–0,25', pct: '18%', highlight: false, dim: true },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[14px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txm'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[12px] tabular-nums font-mono ${
                        item.highlight ? 'text-wx-tx2' : item.dim ? 'text-wx-txff' : 'text-wx-txf'
                      }`}>
                        {item.descriptor}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                      <div
                        className="fbar h-full rounded-full"
                        data-w={item.pct}
                        style={{
                          background: item.highlight
                            ? 'linear-gradient(90deg, #4A6AEE, #8AAAFF)'
                            : item.dim ? 'var(--bd2)' : 'var(--txff)',
                          width: '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-wx-txff mt-6">
                {de
                  ? 'Index basiert auf gemessenem Reibungskoeffizient (μ). Waxcelerate Classic auf Augenhöhe mit Graphit-Wachs — bei sauberem Antrieb.'
                  : 'Index derived from measured friction coefficient (μ). Waxcelerate Classic on par with graphite wax on a clean drivetrain.'}
              </p>
            </div>
          </div>

          {/* ── Classic or Pro ── */}
          <div className="mb-16">
            <div className="text-center mb-7">
              <p className="text-xs tracking-[0.18em] uppercase text-wx-txf mb-2">
                {de ? 'Produktwahl' : 'Product choice'}
              </p>
              <h3 className="font-display text-2xl font-bold text-wx-tx1">
                {de ? 'Classic oder Pro?' : 'Classic or Pro?'}
              </h3>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { key: 'summer' as const, label: de ? 'Ich fahre nur im Sommer' : 'I ride only in summer' },
                { key: 'allseason' as const, label: de ? 'Ich fahre ganzjährig' : 'I ride year-round' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRider(rider === key ? null : key)}
                  className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border ${
                    rider === key
                      ? 'border-[#4A6AEE]/50 bg-[#4A6AEE]/10 text-wx-tx1'
                      : 'border-wx-bd text-wx-txf hover:text-wx-tx2 hover:border-wx-bd'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Classic */}
              <div
                className="rounded-xl border p-6 flex flex-col transition-all duration-400"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  borderColor: rider === 'summer' ? 'rgba(192,192,208,0.35)' : 'var(--bd)',
                  boxShadow: 'var(--card-shad)',
                  opacity: rider === 'allseason' ? 0.45 : 1,
                }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-wx-txm mb-1">Waxcelerate</p>
                <p className="font-serif-display italic text-[22px] font-bold text-wx-tx1 mb-1">Classic</p>
                <p className="text-xs text-wx-txff mb-5">Paraffin + PTFE + Stearin</p>
                <div className="space-y-2.5 flex-1 mb-6">
                  {[
                    de ? 'Trocken & sauber — kein Dreck, kein Belag' : 'Dry & clean — no grime, no residue',
                    de ? '250–450 km Intervall (trocken)' : '250–450 km interval (dry)',
                    de ? 'Reibungskoeffizient 0,05–0,07' : 'Friction coefficient 0.05–0.07',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-wx-txf mt-0.5 flex-shrink-0 text-xs">◆</span>
                      <span className="text-[13px] text-wx-tx2 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-wx-bd pt-4 flex items-center justify-between">
                  <p className="text-[16px] font-semibold text-wx-tx1">{de ? 'ab €22,95' : 'from €22.95'}</p>
                  <a
                    href="https://www.ebay.de/usr/waxcelerate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-wx-bd hover:border-[#4A6AEE]/40 hover:text-wx-tx1 transition-all text-wx-txm"
                  >
                    {de ? 'Ansehen' : 'View'} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Pro */}
              <div className="relative">
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #4A6AEE, #8AAAFF)' }}
                  >
                    {de ? 'Empfohlen für Ganzjahresfahrer' : 'Recommended for year-round riders'}
                  </span>
                </div>
                <div
                  className="rounded-xl border p-6 flex flex-col h-full transition-all duration-400"
                  style={{
                    background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                    borderColor: rider === 'allseason' ? 'rgba(74,106,238,0.45)' : 'var(--bd)',
                    boxShadow: rider === 'allseason'
                      ? '0 0 40px rgba(74,106,238,0.1), var(--card-shad)'
                      : 'var(--card-shad)',
                    opacity: rider === 'summer' ? 0.45 : 1,
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] mb-1 mt-2" style={{ color: '#4A6AEE' }}>Waxcelerate</p>
                  <p className="font-serif-display italic text-[22px] font-bold mb-1" style={{ color: '#8AAAFF' }}>Pro</p>
                  <p className="text-xs text-wx-txff mb-5">+ MoS₂ · amorph · Antioxidans</p>
                  <div className="space-y-2.5 flex-1 mb-6">
                    {[
                      de ? 'Ganzjährig — Sommer, Winter, Nässe' : 'All-season — summer, winter, wet',
                      de ? 'Reibungskoeffizient 0,03–0,06' : 'Friction coefficient 0.03–0.06',
                      de ? 'Rostschutz durch hydrophobe Matrix' : 'Rust protection via hydrophobic matrix',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: '#4A6AEE' }}>◆</span>
                        <span className="text-[13px] text-wx-tx2 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-wx-bd pt-4 flex items-center justify-between">
                    <p className="text-[16px] font-semibold" style={{ color: '#8AAAFF' }}>{de ? 'ab €26,95' : 'from €26.95'}</p>
                    <a
                      href="https://www.ebay.de/usr/waxcelerate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-wx-bd hover:border-[#4A6AEE]/40 hover:text-wx-tx1 transition-all text-wx-txm"
                    >
                      {de ? 'Ansehen' : 'View'} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="text-center pt-6 border-t border-wx-bd">
            <p className="text-wx-txff text-[13px] mb-6">
              {de
                ? '154 eBay-Bewertungen · 100% positiv · Versand am gleichen Tag'
                : '154 eBay reviews · 100% positive · Same-day shipping'}
            </p>
            <button
              onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-medium text-[14px] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4A6AEE 0%, #6080F8 100%)' }}
            >
              {de ? 'Jetzt kaufen' : 'Buy now'}
              <ArrowRight className="h-4 w-4" />
            </button>
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
