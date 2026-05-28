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


const cardStyle = {
  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
  boxShadow: 'var(--card-shad)',
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
                ? 'Was Heißwachs physikalisch anders macht — in Watt, in Verschleiß und in Euro.'
                : 'What hot wax does differently — in watts, in wear, and in euros.'}
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
                <TrendingDown className="h-4 w-4 flex-shrink-0 text-wx-txm" />
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                  {de ? 'Kostenersparnis' : 'Cost Savings'}
                </p>
              </div>

              {/* Hero number — always visible */}
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="font-serif-display italic text-[38px] font-bold text-wx-tx1 tabular-nums leading-none">~€70</span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold leading-tight" style={{ color: '#1A3C6E' }}>
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
                style={{ color: '#264E8C' }}
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
                      <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(184,114,26,0.08)', border: '1px solid rgba(184,114,26,0.25)' }}>
                        <p className="text-[9px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: '#B8721A' }}>Wax</p>
                        <p className="text-[20px] font-bold tabular-nums leading-none" style={{ color: '#C8842F' }}>~€81</p>
                        <p className="text-[9px] mt-0.5" style={{ color: '#B8721A' }}>{de ? '1 Kette' : '1 chain'}</p>
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
                        <p className="text-[9px] uppercase tracking-[0.16em] font-medium mb-1.5" style={{ color: '#B8721A' }}>
                          Wax
                        </p>
                        {[
                          [de ? '1 Kette × €46' : '1×chain', '€46'],
                          [de ? '500g Block' : '500g block', '€35'],
                          [de ? 'Gesamt' : 'Total', '~€81'],
                        ].map(([l, v], i) => (
                          <div key={i} className="flex justify-between text-[10px]">
                            <span className="text-wx-txf">{l}</span>
                            <span className="tabular-nums font-semibold" style={{ color: '#C8842F' }}>{v}</span>
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
                    <Icon className="h-4 w-4 flex-shrink-0 text-wx-txm" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
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

            {/* ── Card 6: Friction stat ── */}
            <div
              className="diff-card flex flex-col rounded-xl border border-wx-bd p-4"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="h-4 w-4 flex-shrink-0 text-wx-txm" />
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                  {de ? 'Reibung' : 'Friction'}
                </p>
              </div>

              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="font-serif-display italic text-[38px] font-bold text-wx-tx1 tabular-nums leading-none">μ 0,03</span>
              </div>
              <p className="text-[11px] text-wx-txm leading-relaxed mb-3 flex-1">
                {de
                  ? 'Waxcelerate Pro — niedrigster gemessener Wert vs. Kettenöl (μ 0,18–0,25).'
                  : 'Waxcelerate Pro — lowest measured value vs. chain oil (μ 0.18–0.25).'}
              </p>

              <Link
                to="/wissenschaft"
                className="flex items-center gap-1 text-[11px] font-medium self-start transition-opacity hover:opacity-70"
                style={{ color: '#264E8C' }}
                onClick={e => e.stopPropagation()}
              >
                {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
              </Link>
            </div>

          </div>

          {/* ── Science entry card ── */}
          <Link
            to="/wissenschaft"
            className="group relative flex items-center justify-between gap-4 rounded-xl p-5 overflow-hidden transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(26,60,110,0.1) 0%, rgba(26,60,110,0.05) 100%)', border: '1px solid rgba(26,60,110,0.2)', boxShadow: '0 0 0 0 rgba(26,60,110,0)', outline: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(26,60,110,0.35), 0 4px 24px rgba(26,60,110,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,84,153,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 rgba(26,60,110,0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,60,110,0.2)'; }}
          >
            {/* Subtle corner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, rgba(42,84,153,0.12), transparent 70%)' }} />

            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105" style={{ background: 'rgba(26,60,110,0.14)', boxShadow: '0 0 0 1px rgba(26,60,110,0.25), 0 0 16px rgba(26,60,110,0.08)' }}>
                <FlaskConical className="w-4 h-4" style={{ color: '#2A5499' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: '#2A5499' }}>
                  {de ? 'Wissenschaft & Formel' : 'Science & Formula'}
                </p>
                <p className="text-[13px] font-semibold text-wx-tx1 leading-snug mb-2">
                  {de ? 'Die Wissenschaft hinter der Formel' : 'The science behind the formula'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {['6 Stoffe', 'MoS₂ &lt;5 µm', 'μ 0.03'].map((tag, i) => (
                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(26,60,110,0.1)', color: 'rgba(106,138,232,0.9)', border: '1px solid rgba(26,60,110,0.15)' }} dangerouslySetInnerHTML={{ __html: tag }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 text-[12px] font-semibold transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#2A5499' }}>
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
