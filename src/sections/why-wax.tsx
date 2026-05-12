import { useRef, useEffect, useState } from 'react';
import { ExternalLink, Shield, Snowflake, Droplets, Sun } from 'lucide-react';
import { ComparisonSlider } from '@/components/comparison-slider';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const differentiators = [
  {
    icon: Shield,
    catDe: 'Konsistenz', catEn: 'Consistency',
    titleDe: 'Jeder Block wirkt gleich', titleEn: 'Every block performs identically',
    credDe: 'Sterischer Stabilisator · MoS₂-Dispersion', credEn: 'Steric stabilizer · MoS₂ dispersion',
    descDe: 'Additive sedimentieren nicht in der Schmelze — erster und letzter Block identisch.',
    descEn: 'Additives don\'t sediment in the melt — first and last block perform identically.',
  },
  {
    icon: Snowflake,
    catDe: 'Winter', catEn: 'Winter',
    titleDe: 'Schaltet noch bei −8°C', titleEn: 'Shifts cleanly at −8°C',
    credDe: 'Amorphe Wachskomponente', credEn: 'Amorphous wax component',
    descDe: 'Matrix bleibt flexibel bei Frost — kein Verhärten in den Gelenken, kein Schalten unter Last.',
    descEn: 'Matrix stays flexible at sub-zero — no hardening in the links, no skipping under load.',
  },
  {
    icon: Droplets,
    catDe: 'Rostschutz', catEn: 'Rust Protection',
    titleDe: 'Weniger Rost nach Regen', titleEn: 'Less rust after rain',
    credDe: 'Hydrophobe Matrix · PTFE < 1 µm', credEn: 'Hydrophobic matrix · PTFE < 1 µm',
    descDe: 'Lagert weniger Wasser ein — weniger freiliegendes Metall, geringere Rostneigung nach Regenfahrten.',
    descEn: 'Absorbs less water — less exposed metal, reduced rust tendency after wet rides.',
  },
  {
    icon: Sun,
    catDe: 'Sommer', catEn: 'Summer',
    titleDe: 'Bleibt auf der Kette — auch bei 35°C', titleEn: 'Stays on the chain — even at 35°C',
    credDe: 'Synthetisches Hartwachs · Tropfpunkt ~75°C', credEn: 'Synthetic hard wax · drop point ~75°C',
    descDe: 'Kein Wachsverlust im Hochsommer, keine Migration auf Schaltwerk oder Umwerfer.',
    descEn: 'No wax loss in summer heat, no migration to the derailleur or front mech.',
  },
];

const OIL_INTERVAL = 150;
const WAX_INTERVAL = 450;
const TOTAL_KM = 5000;
const oilCount = Math.floor(TOTAL_KM / OIL_INTERVAL);
const waxCount = Math.floor(TOTAL_KM / WAX_INTERVAL);

export function WhyWax() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const frictionRef = useRef<HTMLDivElement>(null);
  const compBarsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const costBarsRef = useRef<HTMLDivElement>(null);
  const [rider, setRider] = useState<'summer' | 'allseason' | null>(null);
  const de = lang === 'de';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.diff-card');
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }

      frictionRef.current?.querySelectorAll('.fbar').forEach((bar) => {
        const w = (bar as HTMLElement).dataset.w!;
        gsap.fromTo(bar, { width: '0%' }, {
          width: w, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: frictionRef.current, start: 'top 80%' },
        });
      });

      compBarsRef.current?.querySelectorAll('.cbar').forEach((bar) => {
        const w = (bar as HTMLElement).dataset.w!;
        gsap.fromTo(bar, { width: '0%' }, {
          width: w, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: compBarsRef.current, start: 'top 80%' },
        });
      });

      costBarsRef.current?.querySelectorAll('.cost-bar').forEach((bar) => {
        const w = (bar as HTMLElement).dataset.w!;
        gsap.fromTo(bar, { width: '0%' }, {
          width: w, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: costBarsRef.current, start: 'top 82%' },
        });
      });

      if (timelineRef.current) {
        const oilDots = timelineRef.current.querySelectorAll('.oil-dot');
        const waxDots = timelineRef.current.querySelectorAll('.wax-dot');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: timelineRef.current, start: 'top 75%' },
        });
        tl.fromTo(oilDots, { opacity: 0, scale: 0 }, {
          opacity: 1, scale: 1, duration: 0.18, stagger: 0.04, ease: 'back.out(2)',
        }).fromTo(waxDots, { opacity: 0, scale: 0 }, {
          opacity: 1, scale: 1, duration: 0.3, stagger: 0.2, ease: 'back.out(1.5)',
        }, '+=0.25');
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#090909]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <span className="text-[10px] tracking-[0.35em] text-[#5B7AEE] uppercase mb-3 block font-medium">
              {de ? 'Die Formulierung' : 'The Formulation'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {de ? 'Warum Waxcelerate' : 'Why Waxcelerate'}
            </h2>
            <p className="text-[#52526A] max-w-lg mx-auto text-[15px]">
              {de
                ? 'Nicht warum Wachs — sondern warum diese Formulierung besser durchdacht ist als die meisten Alternativen.'
                : 'Not why wax — but why this formulation is more carefully developed than most alternatives.'}
            </p>
          </div>

          {/* ── Quick Summary (scanner-first) ── */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-5 mb-16">
            {[
              { stat: '3–5×', labelDe: 'längere Kettenlaufzeit', labelEn: 'longer chain lifetime' },
              { stat: '3×', labelDe: 'weniger Wartung als mit Öl', labelEn: 'less maintenance than oil' },
              { stat: '~€70', labelDe: 'gespart auf 12.000 km', labelEn: 'saved over 12,000 km' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-[30px] sm:text-[36px] font-bold text-white tabular-nums leading-none mb-1.5">
                  {item.stat}
                </p>
                <p className="text-[12px] text-[#6B7088]">{de ? item.labelDe : item.labelEn}</p>
              </div>
            ))}
          </div>

          {/* ── Comparison Slider ── */}
          <div className="mb-20">
            <ComparisonSlider
              beforeImage="/images/chain-dirty.jpg"
              afterImage="/images/chain-clean.jpg"
              beforeLabel={de ? 'Mit Öl · nach 2.000 km' : 'With Oil · after 2,000 km'}
              afterLabel={de ? 'Mit Wachs · nach 2.000 km' : 'With Wax · after 2,000 km'}
            />
          </div>

          {/* ── Block 1: Cost Savings ── */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#4A4A62] mb-2">
                {de ? 'Kostenvergleich · 12.000 km' : 'Cost comparison · 12,000 km'}
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                {de ? '~€70 gespart auf 12.000 km' : '~€70 saved over 12,000 km'}
              </h3>
              <p className="text-[13px] text-[#3A3A52] mt-2">
                {de
                  ? 'Basis: CN-M8100 (€45,99) · 1–1,5 Fahrsaisons · aktiver Fahrer'
                  : 'Basis: CN-M8100 (€45.99) · 1–1.5 seasons · active rider'}
              </p>
            </div>

            <div ref={costBarsRef} className="rounded-xl border border-[#1A1A28] p-6 sm:p-8" style={{ background: '#0C0C10' }}>

              {/* Savings hero */}
              <div
                className="rounded-lg border border-[#5B7AEE]/20 p-4 text-center mb-7"
                style={{ background: 'rgba(91,122,238,0.06)' }}
              >
                <p className="text-[10px] text-[#5B7AEE] uppercase tracking-[0.16em] mb-1">
                  {de ? 'Deine Ersparnis' : 'Your savings'}
                </p>
                <p className="text-[44px] font-bold text-white leading-none tracking-tight">~€70</p>
                <p className="text-[12px] text-[#4A4A62] mt-1">
                  {de ? 'auf 12.000 km · aktiver Straßenfahrer' : 'over 12,000 km · active road rider'}
                </p>
              </div>

              {/* Bar comparison */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[13px] font-medium text-[#52526A]">
                      {de ? 'Mit Kettenöl' : 'With Chain Oil'}
                    </span>
                    <span className="text-[20px] font-bold text-[#52526A] tabular-nums">~€151</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="cost-bar h-full rounded-full"
                      data-w="100%"
                      style={{ width: '0%', background: '#2A2A3A' }}
                    />
                  </div>
                  <p className="text-[11px] text-[#2A2A38] mt-1.5">
                    {de ? '3 Ketten à €46 + Öl (12×) = €13' : '3 chains × €46 + oil (12×) = €13'}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[13px] font-medium text-white">
                      {de ? 'Mit Waxcelerate' : 'With Waxcelerate'}
                    </span>
                    <span className="text-[20px] font-bold text-white tabular-nums">~€81</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="cost-bar h-full rounded-full"
                      data-w="54%"
                      style={{ width: '0%', background: 'linear-gradient(90deg, #4A6AEE, #6888FF)' }}
                    />
                  </div>
                  <p className="text-[11px] text-[#4A5080] mt-1.5">
                    {de ? '1 Kette à €46 + 500g Wachsblock = €35' : '1 chain × €46 + 500g wax block = €35'}
                  </p>
                </div>
              </div>

              {/* Chain count visual */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-[#131320]">
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid #161620' }}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#3A3A52] mb-2">
                    {de ? 'Kettenöl' : 'Chain oil'}
                  </p>
                  <div className="flex gap-1.5 mb-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-5 h-5 rounded-sm flex-shrink-0" style={{ background: '#252535' }} />
                    ))}
                  </div>
                  <p className="text-[12px] text-[#3A3A52]">
                    {de ? '3 Ketten in 12.000 km' : '3 chains in 12,000 km'}
                  </p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(91,122,238,0.04)', border: '1px solid rgba(91,122,238,0.12)' }}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#5B7AEE] mb-2">Waxcelerate</p>
                  <div className="flex gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4A6AEE, #6888FF)' }} />
                  </div>
                  <p className="text-[12px] text-[#7A80A0]">
                    {de ? '1 Kette in 12.000 km' : '1 chain in 12,000 km'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Block 2: Differentiator Cards ── */}
          <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-20">
            {differentiators.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className="diff-card flex flex-col rounded-xl border border-[#1A1A28] p-4 sm:p-5 hover:border-[#252538] transition-all duration-300"
                  style={{
                    background: 'linear-gradient(160deg, #0D0D16 0%, #09090F 100%)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Icon + category on one row — saves vertical space on mobile */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(91,122,238,0.1)', boxShadow: '0 0 0 1px rgba(91,122,238,0.15)' }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: '#8AAAFF' }} />
                    </div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#5B7AEE]">
                      {de ? d.catDe : d.catEn}
                    </p>
                  </div>

                  {/* Benefit headline */}
                  <p className="text-[13px] sm:text-[14px] lg:text-[15px] font-bold text-white leading-snug mb-3">
                    {de ? d.titleDe : d.titleEn}
                  </p>

                  {/* Technical credential — spec-block treatment */}
                  <div
                    className="rounded-md px-2.5 py-1.5 mb-3"
                    style={{ background: 'rgba(91,122,238,0.05)', border: '1px solid rgba(91,122,238,0.1)' }}
                  >
                    <p className="font-mono text-[9px] text-[#5A6A9A] tracking-wide leading-relaxed">
                      {de ? d.credDe : d.credEn}
                    </p>
                  </div>

                  {/* Plain-language consequence */}
                  <p className="text-[11px] sm:text-[12px] text-[#6B7088] leading-relaxed flex-1">
                    {de ? d.descDe : d.descEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Block 3: Classic vs Pro ── */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#4A4A62] mb-2">
                {de ? 'Produktwahl' : 'Product choice'}
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                {de ? 'Classic oder Pro?' : 'Classic or Pro?'}
              </h3>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-7">
              <button
                type="button"
                onClick={() => setRider(rider === 'summer' ? null : 'summer')}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border ${
                  rider === 'summer'
                    ? 'border-[#C0C0D0]/40 bg-[#C0C0D0]/10 text-[#C0C4DC]'
                    : 'border-[#1E1E2C] text-[#4E4E62] hover:border-[#2E2E40] hover:text-[#7A7A9A]'
                }`}
              >
                {de ? 'Ich fahre nur im Sommer' : 'I ride only in summer'}
              </button>
              <button
                type="button"
                onClick={() => setRider(rider === 'allseason' ? null : 'allseason')}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border ${
                  rider === 'allseason'
                    ? 'border-[#5B7AEE]/50 bg-[#5B7AEE]/12 text-[#A8BFFF]'
                    : 'border-[#1E1E2C] text-[#4E4E62] hover:border-[#2E2E40] hover:text-[#7A7A9A]'
                }`}
              >
                {de ? 'Ich fahre ganzjährig' : 'I ride year-round'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Classic */}
              <div
                className="rounded-xl border p-6 transition-all duration-500 flex flex-col"
                style={{
                  background: 'linear-gradient(160deg, #0E0E17 0%, #0A0A10 100%)',
                  borderColor: rider === 'summer'
                    ? 'rgba(192,192,208,0.35)'
                    : rider === 'allseason' ? '#111118' : '#1A1A28',
                  boxShadow: rider === 'summer'
                    ? '0 0 50px rgba(192,192,208,0.06), 0 4px 20px rgba(0,0,0,0.5)'
                    : '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7088] mb-1">Waxcelerate</p>
                  <p className="font-display text-[22px] font-bold text-[#C0C4DC]">Classic</p>
                  <p className="text-[11px] text-[#3A3A52] mt-1">Paraffin + PTFE + Stearin</p>
                </div>
                <div className="space-y-3 mb-6 flex-1">
                  {[
                    de ? 'Trocken & sauber — kein Dreck, kein Belag' : 'Dry & clean — no grime, no residue',
                    de ? '250–450 km Intervall (trocken)' : '250–450 km interval (dry)',
                    de ? 'Reibungskoeffizient 0,05–0,07' : 'Friction coefficient 0.05–0.07',
                    de ? '20–32 Anwendungen pro 500g Block' : '20–32 applications per 500g block',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[#4A4A62] mt-0.5 flex-shrink-0 text-[10px]">◆</span>
                      <span className="text-[14px] text-[#8890A8] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#131320] pt-4">
                  <p className="text-[11px] text-[#4A4A62] mb-1">{de ? 'Für wen' : 'Best for'}</p>
                  <p className="text-[13px] text-[#6B7088] leading-snug mb-4">
                    {de ? 'Einstieg, Sommer, regelmäßiges Wachsen' : 'Entry level, summer, regular waxing'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-semibold text-[#C0C4DC]">{de ? 'ab €22,95' : 'from €22.95'}</p>
                    <a
                      href="https://www.ebay.de/usr/waxcelerate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[12px] font-medium text-[#7A7A96] hover:text-[#C0C4DC] transition-colors"
                    >
                      {de ? 'Ansehen' : 'View'} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pro */}
              <div className="relative">
                {/* Recommended badge */}
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                  <span
                    className="text-[10px] font-semibold px-3 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #4A6AEE, #6888FF)' }}
                  >
                    {de ? 'Empfohlen für Ganzjahresfahrer' : 'Recommended for year-round riders'}
                  </span>
                </div>
                <div
                  className="rounded-xl border p-6 transition-all duration-500 flex flex-col h-full"
                  style={{
                    background: 'linear-gradient(160deg, #0C0E18 0%, #0A0A14 100%)',
                    borderColor: rider === 'allseason'
                      ? 'rgba(91,122,238,0.45)'
                      : rider === 'summer' ? '#0F0F16' : '#1A1A28',
                    boxShadow: rider === 'allseason'
                      ? '0 0 50px rgba(91,122,238,0.10), 0 4px 20px rgba(0,0,0,0.5)'
                      : '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="mb-5 mt-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#5B7AEE] mb-1">Waxcelerate</p>
                    <p className="font-display text-[22px] font-bold text-[#8AAAFF]">Pro</p>
                    <p className="text-[11px] text-[#4A5080] mt-1">+ MoS₂ · amorph · Antioxidans</p>
                  </div>
                  <div className="space-y-3 mb-5 flex-1">
                    {[
                      de ? 'Ganzjährig — Sommer, Winter, Nässe' : 'All-season — summer, winter, wet',
                      de ? 'Reibungskoeffizient 0,03–0,06' : 'Friction coefficient 0.03–0.06',
                      de ? 'Rostschutz durch hydrophobe Matrix' : 'Rust protection via hydrophobic matrix',
                      de ? 'Oxidationsschutz (phenolisches Antioxidans)' : 'Oxidation protection (phenolic antioxidant)',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-[#5B7AEE] mt-0.5 flex-shrink-0 text-[10px]">◆</span>
                        <span className="text-[14px] text-[#8890A8] leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-lg p-4 mb-5"
                    style={{ background: 'rgba(6,6,14,0.8)', border: '1px solid #1A1A2E' }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#4A5080] mb-3">
                      {de ? 'Intervall' : 'Interval'}
                    </p>
                    {[
                      { label: de ? 'Trocken' : 'Dry', display: '300–550 km', pct: 46 },
                      { label: de ? 'Nass / gemischt' : 'Wet / mixed', display: '150–300 km', pct: 25 },
                      { label: '+ Topup', display: de ? 'bis 1.200 km' : 'up to 1,200 km', pct: 100 },
                    ].map((bar, i) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] text-[#52526A]">{bar.label}</span>
                          <span className="text-[11px] text-[#7A80A0] tabular-nums">{bar.display}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#131320]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${bar.pct}%`,
                              background: i === 2
                                ? 'linear-gradient(90deg, #3A5ADE, #7090FF)'
                                : 'linear-gradient(90deg, #4A6AEE, #6888FF)',
                              opacity: i === 2 ? 0.45 : 0.75,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#1A1A2E] pt-4">
                    <p className="text-[11px] text-[#4A5080] mb-1">{de ? 'Für wen' : 'Best for'}</p>
                    <p className="text-[13px] text-[#6B7088] leading-snug mb-4">
                      {de ? 'Ganzjahresfahrer, 3-Ketten-Rotation, Winter' : 'Year-round riders, 3-chain rotation, winter'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[16px] font-semibold text-[#8AAAFF]">{de ? 'ab €26,95' : 'from €26.95'}</p>
                      <a
                        href="https://www.ebay.de/usr/waxcelerate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[12px] font-medium text-[#5B7AEE] hover:text-[#8AAAFF] transition-colors"
                      >
                        {de ? 'Ansehen' : 'View'} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[12px] text-[#3A3A52] mt-5 italic">
              {de
                ? 'Beide vollwertig — optimiert für unterschiedliche Fahrerprofile.'
                : 'Both full-featured — optimised for different rider profiles.'}
            </p>
          </div>

          {/* ── Block 4: Friction Coefficient ── */}
          <div ref={frictionRef} className="mb-20">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#4A4A62] mb-2">
                {de ? 'Reibungskoeffizient' : 'Friction coefficient'}
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                {de ? 'Messbar weniger Reibung' : 'Measurably less friction'}
              </h3>
            </div>

            <div className="rounded-xl border border-[#1A1A28] p-6 sm:p-8" style={{ background: '#0C0C10' }}>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#3A3A52] mb-6">
                {de ? 'Schmierungseffizienz — längerer Balken = besser' : 'Lubrication efficiency — longer bar = better'}
              </p>
              <div className="space-y-6">
                {[
                  {
                    label: 'Waxcelerate Classic',
                    descriptor: de ? 'μ 0,05–0,07' : 'μ 0.05–0.07',
                    pct: '95%',
                    highlight: true,
                    danger: false,
                  },
                  {
                    label: de ? 'Graphit-Heißwachs' : 'Graphite Wax',
                    descriptor: de ? 'μ 0,08–0,12' : 'μ 0.08–0.12',
                    pct: '72%',
                    highlight: false,
                    danger: false,
                  },
                  {
                    label: de ? 'Kettenöl (nass)' : 'Chain Oil (wet)',
                    descriptor: de ? 'μ 0,18–0,25' : 'μ 0.18–0.25',
                    pct: '18%',
                    highlight: false,
                    danger: true,
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={`text-[14px] font-medium ${item.highlight ? 'text-[#C0C4DC]' : 'text-[#52526A]'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[12px] tabular-nums font-mono ${
                        item.highlight ? 'text-[#8AAAFF]' : item.danger ? 'text-[#7A4A52]' : 'text-[#3A3A52]'
                      }`}>
                        {item.descriptor}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#131320] overflow-hidden">
                      <div
                        className="fbar h-full rounded-full"
                        data-w={item.pct}
                        style={{
                          background: item.highlight
                            ? 'linear-gradient(90deg, #4A6AEE, #6888FF)'
                            : item.danger ? '#3A2228' : '#252535',
                          width: '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#3A3A52] italic mt-6">
                {de
                  ? 'Index basiert auf gemessenem Reibungskoeffizient (μ). Waxcelerate Classic auf Augenhöhe mit Graphit-Wachs — bei sauberem Antrieb.'
                  : 'Index derived from measured friction coefficient (μ). Waxcelerate Classic on par with graphite wax on a clean drivetrain.'}
              </p>
            </div>
          </div>

          {/* ── Block 5: Maintenance Timeline ── */}
          <div ref={timelineRef} className="mb-20">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#4A4A62] mb-2">
                {de ? 'Wartungsaufwand' : 'Maintenance effort'}
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                {de ? 'Ölen vs. Wachsen auf 5.000 km' : 'Oiling vs. Waxing over 5,000 km'}
              </h3>
            </div>

            <div className="rounded-xl border border-[#1A1A28] p-6 sm:p-8" style={{ background: '#0C0C10' }}>

              {/* Legend */}
              <div className="flex gap-6 mb-7">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3A3452] flex-shrink-0" />
                  <span className="text-[11px] text-[#3A3A52]">
                    {de ? '= einmal ölen' : '= one oil application'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4A6AEE, #7090FF)' }}
                  />
                  <span className="text-[11px] text-[#7A80A0]">
                    {de ? '= einmal wachsen' : '= one wax application'}
                  </span>
                </div>
              </div>

              {/* Oil row */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-[#52526A]">
                    {de ? 'Kettenöl' : 'Chain Oil'}
                  </span>
                  <span className="text-[12px] text-[#3A3A52] tabular-nums">
                    ~{oilCount}× {de ? 'ölen' : 'oil stops'}
                  </span>
                </div>
                <div className="relative h-5 flex items-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-[#1A1A28]" />
                  </div>
                  {Array.from({ length: oilCount }, (_, i) => (
                    <div
                      key={i}
                      className="oil-dot absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        left: `${((i + 1) * OIL_INTERVAL / TOTAL_KM) * 100}%`,
                        background: '#3A3452',
                        transform: 'translate(-50%, -50%)',
                        top: '50%',
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Wax row */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-[#C0C4DC]">
                    {de ? 'Heißwachs' : 'Hot Wax'}
                  </span>
                  <span className="text-[12px] text-[#8AAAFF] tabular-nums">
                    ~{waxCount}× {de ? 'wachsen' : 'wax stops'}
                  </span>
                </div>
                <div className="relative h-5 flex items-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-[#1A1A28]" />
                  </div>
                  {Array.from({ length: waxCount }, (_, i) => (
                    <div
                      key={i}
                      className="wax-dot absolute w-2.5 h-2.5 rounded-full"
                      style={{
                        left: `${((i + 1) * WAX_INTERVAL / TOTAL_KM) * 100}%`,
                        background: 'linear-gradient(135deg, #4A6AEE, #7090FF)',
                        transform: 'translate(-50%, -50%)',
                        top: '50%',
                        boxShadow: '0 0 6px rgba(91,122,238,0.5)',
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* X-axis */}
              <div className="flex justify-between pt-2 border-t border-[#131320]">
                {['0 km', '1.250 km', '2.500 km', '3.750 km', '5.000 km'].map((label, i) => (
                  <span key={i} className="text-[10px] text-[#2E2E3A] tabular-nums">{label}</span>
                ))}
              </div>

              <p className="text-[12px] text-[#3A3A52] italic mt-4">
                {de
                  ? `${oilCount} Ölstopps vs. ${waxCount} Wachsanwendungen — bei gleichzeitig längerer Kettenlaufzeit.`
                  : `${oilCount} oil stops vs. ${waxCount} wax applications — with a longer chain lifetime on top.`}
              </p>
            </div>
          </div>

          {/* ── Block 6: Pre-waxed vs Oil ── */}
          <div ref={compBarsRef} className="mb-16">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#4A4A62] mb-2">
                {de ? 'Vorgewachste Ketten' : 'Pre-waxed Chains'}
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                {de ? 'Einbauen und fahren' : 'Install and ride'}
              </h3>
              <p className="text-[14px] text-[#52526A] mt-2">
                {de
                  ? 'MoS₂-vorgewachst, vollständig fahrbereit, Kettenschloss dabei.'
                  : 'MoS₂ pre-waxed, fully ride-ready, quick-link included.'}
              </p>
            </div>

            <div className="rounded-xl border border-[#1A1A28] p-6 sm:p-8" style={{ background: '#0C0C10' }}>
              <div className="space-y-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#4A4A62] mb-4">
                    {de ? 'Wartungsintervall' : 'Maintenance interval'}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[14px] font-medium text-[#C0C4DC]">{de ? 'Vorgewachst' : 'Pre-waxed'}</span>
                        <span className="text-[14px] text-[#8AAAFF] tabular-nums">300–550 km</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#131320] overflow-hidden">
                        <div className="cbar h-full rounded-full" data-w="100%"
                          style={{ width: '0%', background: 'linear-gradient(90deg, #4A6AEE, #6888FF)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[14px] text-[#52526A]">{de ? 'Kettenöl' : 'Chain oil'}</span>
                        <span className="text-[14px] text-[#3A3A52] tabular-nums">50–150 km</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#131320] overflow-hidden">
                        <div className="cbar h-full rounded-full" data-w="27%"
                          style={{ width: '0%', background: '#2A2A3A' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#4A4A62] mb-4">
                    {de ? 'Kettenlaufzeit' : 'Chain lifetime'}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[14px] font-medium text-[#C0C4DC]">{de ? 'Vorgewachst' : 'Pre-waxed'}</span>
                        <span className="text-[14px] text-[#8AAAFF]">{de ? '3–5× länger' : '3–5× longer'}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#131320] overflow-hidden">
                        <div className="cbar h-full rounded-full" data-w="100%"
                          style={{ width: '0%', background: 'linear-gradient(90deg, #4A6AEE, #6888FF)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[14px] text-[#52526A]">{de ? 'Kettenöl' : 'Chain oil'}</span>
                        <span className="text-[14px] text-[#3A3A52]">Basis (1×)</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#131320] overflow-hidden">
                        <div className="cbar h-full rounded-full" data-w="20%"
                          style={{ width: '0%', background: '#2A2A3A' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#4A4A62] mb-4">
                    {de ? 'Pflegeaufwand' : 'Maintenance effort'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="rounded-lg p-4"
                      style={{ background: 'rgba(91,122,238,0.05)', border: '1px solid rgba(91,122,238,0.15)' }}
                    >
                      <p className="text-[11px] font-semibold text-[#8AAAFF] mb-2">{de ? 'Vorgewachst' : 'Pre-waxed'}</p>
                      <p className="text-[15px] font-medium text-[#C0C4DC]">
                        {de ? 'Einbauen & fahren' : 'Install & ride'}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid #161620' }}
                    >
                      <p className="text-[11px] font-semibold text-[#3A3A52] mb-2">{de ? 'Kettenöl' : 'Chain oil'}</p>
                      <p className="text-[15px] text-[#52526A]">
                        {de ? 'Alle 100–150 km ölen' : 'Oil every 100–150 km'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#161620]">
                {[
                  de ? 'Quick-Link dabei' : 'Quick-link included',
                  de ? 'Sofort fahrbereit' : 'Ready immediately',
                  de ? '145× verifiziert · 100% positiv' : '145× verified · 100% positive',
                  de ? '9–12 fach kompatibel' : '9–12 speed compatible',
                ].map((badge, i) => (
                  <span
                    key={i}
                    className="text-[12px] px-3 py-1.5 rounded-full"
                    style={{
                      background: i === 2 ? 'rgba(91,122,238,0.08)' : '#111118',
                      border: i === 2 ? '1px solid rgba(91,122,238,0.2)' : '1px solid #1A1A28',
                      color: i === 2 ? '#7A8FCC' : '#52526A',
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="text-center pt-4 border-t border-[#1A1A28]">
            <p className="text-[#3A3A52] text-[13px] mb-6">
              {de
                ? '145 eBay-Bewertungen · 100% positiv · Versand am gleichen Tag'
                : '145 eBay reviews · 100% positive · Same-day shipping'}
            </p>
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-medium text-[14px] transition-all hover:shadow-[0_0_50px_rgba(91,122,238,0.3)]"
              style={{ background: 'linear-gradient(135deg, #4A6AEE 0%, #6080F8 100%)' }}
            >
              {de ? 'Zum eBay-Shop' : 'Visit eBay Shop'}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
