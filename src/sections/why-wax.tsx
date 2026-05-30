import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';


type FilterKey = 'road' | 'commute' | 'gravel';

const filterChips: { id: FilterKey; labelDe: string; labelEn: string }[] = [
  { id: 'road',    labelDe: 'Rennrad',          labelEn: 'Road'           },
  { id: 'commute', labelDe: 'Alltag / Pendeln',  labelEn: 'Commute'        },
  { id: 'gravel',  labelDe: 'Gravel / Winter',   labelEn: 'Gravel / Winter' },
];

const differentiators: {
  catDe: string; catEn: string;
  titleDe: string; titleEn: string;
  proofDe: string; proofEn: string;
  filters: FilterKey[];
}[] = [
  {
    catDe: 'Chargenqualität', catEn: 'Batch Quality',
    titleDe: 'Erster Block = letzter Block',
    titleEn: 'First block = last block',
    proofDe: 'Kleinstchargen in Stuttgart, kontrolliert homogenisiert — jeder Block identisch.',
    proofEn: 'Small batches in Stuttgart, controlled homogenisation — every block identical.',
    filters: ['road', 'commute', 'gravel'],
  },
  {
    catDe: 'Zwei Formeln', catEn: 'Two Formulas',
    titleDe: 'Classic oder Pro — kein Kompromiss',
    titleEn: 'Classic or Pro — no compromise',
    proofDe: 'Classic (PTFE) für Frühjahr bis Herbst. Pro (MoS₂) für Ganzjahr, Winter & E-Bike.',
    proofEn: 'Classic (PTFE) spring to autumn. Pro (MoS₂) year-round, winter & e-bike.',
    filters: ['road', 'commute', 'gravel'],
  },
  {
    catDe: 'Winterformel', catEn: 'Winter Formula',
    titleDe: 'Pro mit MoS₂ — flexibel bis −8 °C',
    titleEn: 'Pro with MoS₂ — flexible to −8 °C',
    proofDe: 'Amorphes MoS₂ hält die Wachsmatrix auch bei Frost geschmeidig — kein Verhärten in den Kettengelenken.',
    proofEn: 'Amorphous MoS₂ keeps the wax matrix supple at frost — no hardening inside chain links.',
    filters: ['commute', 'gravel'],
  },
  {
    catDe: 'Korrosionsschutz', catEn: 'Corrosion Protection',
    titleDe: 'Dichter Schutzfilm — Rost bleibt draußen',
    titleEn: 'Dense protective film — rust stays out',
    proofDe: 'Mikrokristallines Hartwachs schließt die Metalloberfläche dichter ab — weniger Kontakt mit Wasser und Sauerstoff.',
    proofEn: 'Microcrystalline hard wax seals the metal surface more tightly — less contact with water and oxygen.',
    filters: ['commute', 'gravel'],
  },
];

const frictionMini = [
  { label: 'Pro',     val: 'μ 0,03–0,06', pct: 100, highlight: true  },
  { label: 'Classic', val: 'μ 0,05–0,07', pct: 80,  highlight: true  },
  { labelDe: 'Kettenöl', labelEn: 'Chain Oil', val: 'μ 0,18–0,25', pct: 18, highlight: false },
];

function rowOpacity(active: FilterKey | null, rowFilters: FilterKey[]): React.CSSProperties {
  if (!active) return {};
  return {
    opacity: rowFilters.includes(active) ? 1 : 0.22,
    transition: 'opacity 0.25s ease',
  };
}


export function WhyWax() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const de = lang === 'de';
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  useSectionReveal(headerRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gridRef.current?.querySelectorAll('.diff-card');
      if (items?.length) {
        gsap.fromTo(items, { opacity: 0, y: 20 }, {
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

  const toggleFilter = (id: FilterKey) => setActiveFilter(v => v === id ? null : id);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-24 bg-wx-sf chain-texture">
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-8">
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

          {/* ── Filter chips ── */}
          <div className="flex items-center gap-2 mb-7 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.16em] text-wx-txff mr-1">
              {de ? 'Für mich relevant:' : 'Show for:'}
            </span>
            {filterChips.map(chip => {
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleFilter(chip.id)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all duration-200"
                  style={isActive ? {
                    background: 'rgba(26,60,110,0.15)',
                    borderColor: 'rgba(42,84,153,0.5)',
                    color: 'rgba(106,138,232,0.95)',
                  } : {
                    background: 'transparent',
                    borderColor: 'var(--bd)',
                    color: 'var(--txm)',
                  }}
                >
                  {de ? chip.labelDe : chip.labelEn}
                </button>
              );
            })}
          </div>

          {/* ── 2×2 feature cards — clean: eyebrow · title · proof only ── */}
          <div ref={gridRef} className="grid sm:grid-cols-2 gap-3 mb-3">
            {differentiators.map((d, i) => (
              <div
                key={i}
                className="diff-card rounded-2xl border border-wx-bd p-6 flex flex-col gap-3"
                style={{
                  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                  boxShadow: 'var(--card-shad)',
                  ...rowOpacity(activeFilter, d.filters),
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--txf)' }}>
                  {de ? d.catDe : d.catEn}
                </p>
                <p className="font-serif-display italic text-[18px] font-bold text-wx-tx1 leading-[1.2]">
                  {de ? d.titleDe : d.titleEn}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>
                  {de ? d.proofDe : d.proofEn}
                </p>
              </div>
            ))}
          </div>

          {/* ── Proof strip: cost + friction ── */}
          <div className="grid sm:grid-cols-2 gap-3 mb-6">

            {/* Cost savings */}
            <div
              className="diff-card rounded-2xl border border-wx-bd px-5 py-5 flex items-center gap-5"
              style={{
                background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                boxShadow: 'var(--card-shad)',
                ...rowOpacity(activeFilter, ['road', 'commute', 'gravel']),
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--txf)' }}>
                  {de ? 'Kostenersparnis' : 'Cost Savings'}
                </p>
                <p className="text-[13px] leading-snug" style={{ color: 'var(--txm)' }}>
                  {de
                    ? '46 % weniger über 12.000 km — ~€151 mit Öl, ~€81 mit Wachs.'
                    : '46% less over 12,000 km — ~€151 with oil, ~€81 with wax.'}
                </p>
              </div>
              <p className="font-display font-bold text-wx-tx1 tabular-nums text-[28px] leading-none flex-shrink-0 tracking-[-0.03em]">
                ~€70
              </p>
            </div>

            {/* Friction */}
            <div
              className="diff-card rounded-2xl border border-wx-bd p-5 flex flex-col gap-3"
              style={{
                background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
                boxShadow: 'var(--card-shad)',
                ...rowOpacity(activeFilter, ['road', 'gravel']),
              }}
            >
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--txf)' }}>
                  {de ? 'Reibung' : 'Friction'}
                </p>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[20px] leading-none tracking-[-0.02em]">
                  μ 0,03
                </span>
              </div>
              <div className="space-y-2.5 flex-1">
                {frictionMini.map((item, i) => {
                  const label = 'label' in item ? item.label : (de ? item.labelDe : item.labelEn);
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-medium" style={{ color: item.highlight ? 'var(--tx1)' : 'var(--txf)' }}>
                          {label}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums" style={{ color: item.highlight ? 'var(--tx2)' : 'var(--txff)' }}>
                          {item.val}
                        </span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
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
                className="text-[11px] font-medium pt-3 transition-opacity hover:opacity-70 inline-block"
                style={{ color: '#264E8C', borderTop: '1px solid var(--bd2)' }}
              >
                {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
              </Link>
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
