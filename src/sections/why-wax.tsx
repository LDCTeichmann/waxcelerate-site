import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Snowflake, Droplets, Layers, TrendingDown, BarChart2, FlaskConical } from 'lucide-react';
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
  icon: React.ElementType;
  catDe: string; catEn: string;
  titleDe: string; titleEn: string;
  beforeDe: string; beforeEn: string;
  afterDe: string; afterEn: string;
  filters: FilterKey[];
}[] = [
  {
    icon: Shield,
    catDe: 'Chargenqualität', catEn: 'Batch Quality',
    titleDe: 'Erster Block = letzter Block — garantiert',
    titleEn: 'First block = last block — guaranteed',
    beforeDe: 'Bei großen Produktionschargen ist gleichmäßige Homogenisierung aufwändiger — Additivverteilung kann zwischen Chargen variieren',
    beforeEn: 'In large production batches, consistent homogenisation is more demanding — additive distribution can vary between runs',
    afterDe: 'Kleinstchargen in Stuttgart — kontrolliert homogenisiert. Konstante Wirksamkeit von Block zu Block.',
    afterEn: 'Small batches in Stuttgart — controlled homogenisation. Consistent performance from block to block.',
    filters: ['road', 'commute', 'gravel'],
  },
  {
    icon: Layers,
    catDe: 'Zwei Formeln', catEn: 'Two Formulas',
    titleDe: 'Classic oder Pro — für jede Saison das Richtige',
    titleEn: 'Classic or Pro — the right choice for every season',
    beforeDe: 'Ein einziges Wachs für alle Bedingungen — Kompromisse bei Kälte, Nässe oder Hochsommer',
    beforeEn: 'One single wax for all conditions — compromises in cold, wet or summer heat',
    afterDe: 'Classic (PTFE) für Frühjahr bis Herbst. Pro (MoS₂) für Ganzjahr, Winter und E-Bike. Kein Kompromiss.',
    afterEn: 'Classic (PTFE) for spring to autumn. Pro (MoS₂) for year-round, winter and e-bike. No compromise.',
    filters: ['road', 'commute', 'gravel'],
  },
  {
    icon: Snowflake,
    catDe: 'Winterformel', catEn: 'Winter Formula',
    titleDe: 'Pro mit MoS₂ — flexibel bis −8°C',
    titleEn: 'Pro with MoS₂ — flexible down to −8°C',
    beforeDe: 'Herkömmliche Wachse verhärten bei Frost — Gelenke blockieren, Schaltung schwergängig',
    beforeEn: 'Generic waxes harden at frost — link joints seize up, shifting turns stiff',
    afterDe: 'Amorphes MoS₂ als Hochdruckadditiv hält die Matrix flexibel — kein Verhärten in Gelenken',
    afterEn: 'Amorphous MoS₂ as high-pressure additive keeps the matrix flexible — no hardening in link joints',
    filters: ['commute', 'gravel'],
  },
  {
    icon: Droplets,
    catDe: 'Feuchtigkeitsschutz', catEn: 'Moisture Protection',
    titleDe: 'Mikrokristalline Schicht — Metall bleibt geschützt',
    titleEn: 'Microcrystalline layer — metal stays protected',
    beforeDe: 'Standard-Paraffin deckt die Metalloberfläche nicht vollständig ab — Wasser gelangt ans Metall, Rost entsteht',
    beforeEn: 'Standard paraffin alone doesn\'t fully cover the metal surface — water reaches the metal, rust forms',
    afterDe: 'Mikrokristallines Hartwachs vernetzt dichter — deckt mehr Metalloberfläche ab, weniger Wasserkontakt, weniger Oxidation',
    afterEn: 'Microcrystalline hard wax cross-links more densely — covers more metal surface, less water contact, less oxidation',
    filters: ['commute', 'gravel'],
  },
];

const frictionMini = [
  { label: 'Pro',     val: 'μ 0,03–0,06', pct: 100, highlight: true  },
  { label: 'Classic', val: 'μ 0,05–0,07', pct: 80,  highlight: true  },
  { labelDe: 'Kettenöl', labelEn: 'Chain Oil', val: 'μ 0,18–0,25', pct: 18, highlight: false },
];

const cardStyle = {
  background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
  boxShadow: 'var(--card-shad)',
};

function rowOpacity(active: FilterKey | null, rowFilters: FilterKey[]): React.CSSProperties {
  if (!active) return {};
  return {
    opacity: rowFilters.includes(active) ? 1 : 0.25,
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
      const items = gridRef.current?.querySelectorAll('.diff-item');
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
    <section id="warum-wachs" ref={sectionRef} className="relative py-28 bg-wx-sf chain-texture">
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-10">
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
          <div className="flex items-center gap-2 mb-10 flex-wrap">
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
                  className="text-[11px] font-medium px-3 py-1 rounded-full border transition-all duration-200"
                  style={isActive ? {
                    background: 'rgba(26,60,110,0.2)',
                    borderColor: 'rgba(42,84,153,0.6)',
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

          {/* ── Two-column: editorial left · numbers right ── */}
          <div ref={gridRef} className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-14 items-start">

            {/* Left: differentiators as editorial rows */}
            <div>
              {differentiators.map((d, i) => {
                const Icon = d.icon;
                return (
                  <div
                    key={i}
                    className="diff-item flex gap-5 pb-10"
                    style={{
                      borderBottom: i < differentiators.length - 1 ? '1px solid var(--bd2)' : 'none',
                      marginBottom: i < differentiators.length - 1 ? '2.5rem' : 0,
                      ...rowOpacity(activeFilter, d.filters),
                    }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-4 w-4 text-wx-txm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--txf)' }}>
                        {de ? d.catDe : d.catEn}
                      </p>
                      <p className="font-serif-display italic text-[18px] font-bold text-wx-tx1 leading-snug mb-3">
                        {de ? d.titleDe : d.titleEn}
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-[13px] text-wx-txf leading-relaxed">
                          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-wx-txff mr-2">{de ? 'Andere' : 'Others'}</span>
                          {de ? d.beforeDe : d.beforeEn}
                        </p>
                        <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(106,138,232,0.85)' }}>
                          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] mr-2" style={{ color: '#264E8C' }}>Waxcelerate</span>
                          {de ? d.afterDe : d.afterEn}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Simple science link */}
              <Link
                to="/wissenschaft"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium pt-4 transition-opacity hover:opacity-70"
                style={{ color: '#264E8C' }}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                {de ? 'Wissenschaft & Formeln lesen →' : 'Read science & formulas →'}
              </Link>
            </div>

            {/* Right: sticky numbers panel — appears first on mobile */}
            <div className="order-first lg:order-last lg:sticky lg:top-28 space-y-4">

              {/* Cost savings card */}
              <div
                className="rounded-xl border border-wx-bd p-4"
                style={{ ...cardStyle, ...rowOpacity(activeFilter, ['road', 'commute', 'gravel']) }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                      {de ? 'Kostenersparnis' : 'Cost Savings'}
                    </p>
                  </div>
                  <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">~€70</span>
                </div>
                <p className="text-[11px] font-semibold mb-2.5" style={{ color: '#2B52B0' }}>
                  {de ? '46 % weniger über 12.000 km' : '46% less over 12,000 km'}
                </p>
                <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--bd2)' }}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-wx-txf">{de ? 'Mit Öl (3 Ketten)' : 'With oil (3 chains)'}</span>
                    <span className="text-wx-txm tabular-nums">~€151</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-wx-txf">{de ? 'Mit Wachs (1 Kette)' : 'With wax (1 chain)'}</span>
                    <span className="tabular-nums font-semibold" style={{ color: '#2B52B0' }}>~€81</span>
                  </div>
                </div>
              </div>

              {/* Friction card */}
              <div
                className="flex flex-col rounded-xl border border-wx-bd p-4"
                style={{ ...cardStyle, ...rowOpacity(activeFilter, ['road', 'gravel']) }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                      {de ? 'Reibung' : 'Friction'}
                    </p>
                  </div>
                  <span className="font-display font-bold text-wx-tx1 tabular-nums text-[18px] leading-none">μ 0,03</span>
                </div>
                <div className="space-y-2 flex-1">
                  {frictionMini.map((item, i) => {
                    const label = 'label' in item ? item.label : (de ? item.labelDe : item.labelEn);
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-0.5">
                          <span className={`text-[10px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{label}</span>
                          <span className={`text-[10px] font-mono tabular-nums ${item.highlight ? 'text-wx-tx2' : 'text-wx-txff'}`}>{item.val}</span>
                        </div>
                        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                          <div
                            className="fbar h-full w-full rounded-full"
                            data-w={item.pct}
                            style={{
                              background: item.highlight ? 'linear-gradient(90deg, #0F2450, #264E8C)' : 'var(--bd2)',
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
                  className="flex items-center gap-1 text-[11px] font-medium mt-3 pt-2.5 transition-opacity hover:opacity-70"
                  style={{ color: '#264E8C', borderTop: '1px solid var(--bd2)' }}
                >
                  {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
                </Link>
              </div>

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
