import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Snowflake, Droplets, Sun, TrendingDown, BarChart2, FlaskConical, ArrowRight } from 'lucide-react';
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

const frictionBars = [
  { label: 'Waxcelerate Pro',    descriptor: 'μ 0,03–0,06', pct: '100%', highlight: true,  isPro: true  },
  { label: 'Waxcelerate Classic', descriptor: 'μ 0,05–0,07', pct: '86%',  highlight: true               },
  { labelDe: 'Graphit-Heißwachs', labelEn: 'Graphite Wax',  descriptor: 'μ 0,08–0,12', pct: '60%',  highlight: false              },
  { labelDe: 'Kettenöl (nass)',   labelEn: 'Chain Oil (wet)', descriptor: 'μ 0,18–0,25', pct: '15%',  highlight: false, dim: true   },
];

const cardStyle = {
  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
  boxShadow: 'var(--card-shad)',
};

const iconBadgeStyle = {
  background: 'rgba(43,82,176,0.1)',
  boxShadow: '0 0 0 1px rgba(43,82,176,0.15)',
};

export function WhyWax() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const de = lang === 'de';
  const [costOpen, setCostOpen] = useState(false);

  useSectionReveal(headerRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.diff-card');
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        });
      }

      gridRef.current?.querySelectorAll('.fbar').forEach((bar) => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: pct, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-28 bg-wx-sf chain-texture">
      {/* Top gradient */}
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

          {/* ── 6-card uniform grid ── */}
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">

            {/* ── Card 1: Cost savings (collapsible) ── */}
            <div
              className="diff-card flex flex-col rounded-xl border border-wx-bd p-4"
              style={cardStyle}
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={iconBadgeStyle}>
                  <TrendingDown className="h-3.5 w-3.5" style={{ color: '#4A72D4' }} />
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: '#2B52B0' }}>
                  {de ? 'Kostenersparnis' : 'Cost Savings'}
                </p>
              </div>

              {/* Hero number — always visible */}
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="font-serif-display italic text-[38px] font-bold text-wx-tx1 tabular-nums leading-none">~€70</span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold leading-tight" style={{ color: '#2B52B0' }}>
                    {de ? 'gespart' : 'saved'}
                  </span>
                  <span className="text-[11px] text-wx-txf leading-tight">−46 %</span>
                </div>
              </div>
              <p className="text-[11px] text-wx-txm leading-relaxed mb-3 flex-1">
                {de ? 'vs. Kettenöl · 12.000 km' : 'vs. chain oil · 12,000 km'}
              </p>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => setCostOpen(v => !v)}
                className="flex items-center gap-1 text-[11px] font-medium cursor-pointer self-start transition-opacity hover:opacity-70"
                style={{ color: '#3D67CA' }}
              >
                {costOpen
                  ? (de ? 'Weniger ↑' : 'Less ↑')
                  : (de ? 'Aufstellung ↓' : 'Details ↓')}
              </button>

              {/* Collapsible detail */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: costOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div className="overflow-hidden">
                  <div className="pt-3 mt-3 border-t border-wx-bd">
                    {/* Mini comparison */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg p-2.5 text-center border border-wx-bd" style={{ background: 'var(--sf3)' }}>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-wx-txff font-medium mb-1">
                          {de ? 'Mit Öl' : 'With Oil'}
                        </p>
                        <p className="text-[20px] font-bold text-wx-txm tabular-nums leading-none">~€151</p>
                        <p className="text-[9px] text-wx-txff mt-0.5">{de ? '3 Ketten' : '3 chains'}</p>
                      </div>
                      <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(43,82,176,0.08)', border: '1px solid rgba(43,82,176,0.25)' }}>
                        <p className="text-[9px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: '#3D67CA' }}>Wax</p>
                        <p className="text-[20px] font-bold tabular-nums leading-none" style={{ color: '#4A72D4' }}>~€81</p>
                        <p className="text-[9px] mt-0.5" style={{ color: '#3D67CA' }}>{de ? '1 Kette' : '1 chain'}</p>
                      </div>
                    </div>
                    {/* Breakdown rows */}
                    <div className="grid grid-cols-2 gap-x-3">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-wx-txff font-medium mb-1.5">
                          {de ? 'Mit Öl' : 'Oil'}
                        </p>
                        {[
                          [de ? '3 Ketten × €46' : '3×chain', '€138'],
                          [de ? 'Öl 12× à €1,10' : 'Oil 12×', '€13'],
                          [de ? 'Gesamt' : 'Total', '~€151'],
                        ].map(([l, v], i) => (
                          <div key={i} className="flex justify-between text-[10px]">
                            <span className="text-wx-txf">{l}</span>
                            <span className="text-wx-txm tabular-nums font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1 pl-3 border-l border-wx-bd">
                        <p className="text-[9px] uppercase tracking-[0.16em] font-medium mb-1.5" style={{ color: '#2B52B0' }}>
                          Wax
                        </p>
                        {[
                          [de ? '1 Kette × €46' : '1×chain', '€46'],
                          [de ? '500g Block' : '500g block', '€35'],
                          [de ? 'Gesamt' : 'Total', '~€81'],
                        ].map(([l, v], i) => (
                          <div key={i} className="flex justify-between text-[10px]">
                            <span className="text-wx-txf">{l}</span>
                            <span className="tabular-nums font-semibold" style={{ color: '#4A72D4' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Cards 2–5: Differentiators ── */}
            {differentiators.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className="diff-card flex flex-col rounded-xl border border-wx-bd p-4"
                  style={cardStyle}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={iconBadgeStyle}>
                      <Icon className="h-3.5 w-3.5" style={{ color: '#4A72D4' }} />
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: '#2B52B0' }}>
                      {de ? d.catDe : d.catEn}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-wx-tx1 leading-snug mb-1.5">
                    {de ? d.titleDe : d.titleEn}
                  </p>
                  <p className="text-[11px] text-wx-txm leading-relaxed flex-1">
                    {de ? d.descDe : d.descEn}
                  </p>
                </div>
              );
            })}

            {/* ── Card 6: Friction chart ── */}
            <div
              className="diff-card flex flex-col rounded-xl border border-wx-bd p-4"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={iconBadgeStyle}>
                  <BarChart2 className="h-3.5 w-3.5" style={{ color: '#4A72D4' }} />
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: '#2B52B0' }}>
                  {de ? 'Reibung' : 'Friction'}
                </p>
              </div>
              <p className="text-[13px] font-bold text-wx-tx1 leading-snug mb-3">
                {de ? 'Messbar weniger Reibung' : 'Measurably less friction'}
              </p>

              <div className="space-y-3 flex-1">
                {frictionBars.map((item, i) => {
                  const label = 'label' in item ? item.label : (de ? item.labelDe : item.labelEn);
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[11px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txm'}`}>
                          {label}
                          {item.isPro && (
                            <span
                              className="ml-1.5 text-[9px] font-bold tracking-[0.15em] uppercase px-1 py-0.5 rounded"
                              style={{ background: 'linear-gradient(135deg, #1A3080, #4A72D4)', color: 'rgba(255,255,255,0.9)' }}
                            >
                              PRO
                            </span>
                          )}
                        </span>
                        <span className={`text-[10px] tabular-nums font-mono ${
                          item.highlight ? 'text-wx-tx2' : item.dim ? 'text-wx-txff' : 'text-wx-txf'
                        }`}>
                          {item.descriptor}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                        <div
                          className="fbar h-full w-full rounded-full"
                          data-w={item.pct}
                          style={{
                            background: item.highlight
                              ? (item.isPro
                                  ? 'linear-gradient(90deg, #1A3080, #6A8AE8)'
                                  : 'linear-gradient(90deg, #2B52B0, #4A72D4)')
                              : item.dim ? 'var(--bd2)' : 'var(--txff)',
                            transformOrigin: 'left center',
                            transform: 'scaleX(0)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-wx-txff mt-4 pt-3 leading-relaxed" style={{ borderTop: '1px solid var(--bd2)' }}>
                {de
                  ? 'Pro mit MoS₂ führt die Skala an — Classic auf Augenhöhe mit Graphit-Heißwachs.'
                  : 'Pro with MoS₂ leads — Classic on par with graphite hot wax.'}
              </p>
            </div>

          </div>

          {/* ── Science entry card ── */}
          <Link
            to="/wissenschaft"
            className="group relative flex items-center justify-between gap-4 rounded-xl p-5 overflow-hidden transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(26,48,128,0.1) 0%, rgba(43,82,176,0.05) 100%)', border: '1px solid rgba(43,82,176,0.2)', boxShadow: '0 0 0 0 rgba(43,82,176,0)', outline: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(43,82,176,0.35), 0 4px 24px rgba(43,82,176,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,114,212,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 rgba(43,82,176,0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(43,82,176,0.2)'; }}
          >
            {/* Subtle corner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, rgba(74,114,212,0.12), transparent 70%)' }} />

            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105" style={{ background: 'rgba(43,82,176,0.14)', boxShadow: '0 0 0 1px rgba(43,82,176,0.25), 0 0 16px rgba(43,82,176,0.08)' }}>
                <FlaskConical className="w-4 h-4" style={{ color: '#4A72D4' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: '#4A72D4' }}>
                  {de ? 'Formulierungsdokumentation' : 'Formulation Documentation'}
                </p>
                <p className="text-[13px] font-semibold text-wx-tx1 leading-snug mb-2">
                  {de ? 'Die Wissenschaft hinter der Formel' : 'The science behind the formula'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {['6 Stoffe', 'MoS₂ &lt;5 µm', 'μ 0.03'].map((tag, i) => (
                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(43,82,176,0.1)', color: 'rgba(106,138,232,0.9)', border: '1px solid rgba(43,82,176,0.15)' }} dangerouslySetInnerHTML={{ __html: tag }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 text-[12px] font-semibold transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#4A72D4' }}>
              {de ? 'Lesen' : 'Read'}
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

        </div>
      </div>
      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }}
      />
    </section>
  );
}
