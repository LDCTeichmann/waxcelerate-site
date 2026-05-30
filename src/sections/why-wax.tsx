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
    titleDe: 'Erster Block = letzter Block',
    titleEn: 'First block = last block',
    beforeDe: 'Additivverteilung variiert — letzter Block schwächer als der erste',
    beforeEn: 'Additive distribution varies — last block weaker than the first',
    afterDe: 'Kleinstchargen in Stuttgart, kontrolliert homogenisiert — jeder Block identisch',
    afterEn: 'Small batches in Stuttgart, controlled homogenisation — every block identical',
    filters: ['road', 'commute', 'gravel'],
  },
  {
    icon: Layers,
    catDe: 'Zwei Formeln', catEn: 'Two Formulas',
    titleDe: 'Classic oder Pro — kein Kompromiss',
    titleEn: 'Classic or Pro — no compromise',
    beforeDe: 'Ein Wachs für alle Bedingungen — Kompromisse bei Kälte und Hitze',
    beforeEn: 'One wax for all conditions — compromises in cold and heat',
    afterDe: 'Classic (PTFE) Frühjahr–Herbst. Pro (MoS₂) Ganzjahr, Winter & E-Bike.',
    afterEn: 'Classic (PTFE) spring–autumn. Pro (MoS₂) year-round, winter & e-bike.',
    filters: ['road', 'commute', 'gravel'],
  },
  {
    icon: Snowflake,
    catDe: 'Winterformel', catEn: 'Winter Formula',
    titleDe: 'Pro mit MoS₂ — flexibel bis −8°C',
    titleEn: 'Pro with MoS₂ — flexible down to −8°C',
    beforeDe: 'Standard-Wachse verhärten bei Frost — Gelenke blockieren, Schaltung schwergängig',
    beforeEn: 'Generic waxes harden at frost — joints seize, shifting turns stiff',
    afterDe: 'Amorphes MoS₂ hält die Matrix flexibel — kein Verhärten in Gelenken',
    afterEn: 'Amorphous MoS₂ keeps the matrix flexible — no hardening in link joints',
    filters: ['commute', 'gravel'],
  },
  {
    icon: Droplets,
    catDe: 'Feuchtigkeitsschutz', catEn: 'Moisture Protection',
    titleDe: 'Mikrokristalline Matrix — weniger freie Metalloberfläche',
    titleEn: 'Microcrystalline matrix — less exposed metal surface',
    beforeDe: 'Standard-Paraffin: grobkristallin, Lücken im Wachsfilm — Wasser an Metall, Rost entsteht',
    beforeEn: 'Standard paraffin: coarse-crystalline, gaps in film — water reaches metal, rust forms',
    afterDe: 'Mikrokristallines Hartwachs vernetzt dichter — mehr Metalloberfläche abgedeckt, weniger Oxidation',
    afterEn: 'Microcrystalline hard wax cross-links more densely — more surface covered, less oxidation',
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
                  className="text-[11px] font-medium px-3 py-1 rounded-full border transition-all duration-200"
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

          {/* ── 2×2 feature card grid ── */}
          <div ref={gridRef} className="grid sm:grid-cols-2 gap-3 mb-3">
            {differentiators.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className="diff-card rounded-xl border border-wx-bd p-5 flex flex-col gap-3"
                  style={{
                    ...cardStyle,
                    ...rowOpacity(activeFilter, d.filters),
                  }}
                >
                  {/* Category row */}
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--txm)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--txf)' }}>
                      {de ? d.catDe : d.catEn}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="font-serif-display italic text-[17px] font-bold text-wx-tx1 leading-snug">
                    {de ? d.titleDe : d.titleEn}
                  </p>

                  {/* Comparison */}
                  <div
                    className="space-y-2 pt-3 flex-1"
                    style={{ borderTop: '1px solid var(--bd2)' }}
                  >
                    {/* Before */}
                    <div className="flex gap-2.5 items-start">
                      <span
                        className="mt-0.5 flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--sf3)', color: 'var(--txff)', letterSpacing: '0.05em' }}
                      >
                        ✗
                      </span>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--txf)' }}>
                        {de ? d.beforeDe : d.beforeEn}
                      </p>
                    </div>
                    {/* After */}
                    <div className="flex gap-2.5 items-start">
                      <span
                        className="mt-0.5 flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(26,60,110,0.12)', color: '#5B8BED', letterSpacing: '0.05em' }}
                      >
                        ✓
                      </span>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(106,138,232,0.9)' }}>
                        {de ? d.afterDe : d.afterEn}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Proof strip: cost + friction ── */}
          <div className="grid sm:grid-cols-2 gap-3 mb-6">

            {/* Cost savings */}
            <div
              className="diff-card rounded-xl border border-wx-bd p-5"
              style={{ ...cardStyle, ...rowOpacity(activeFilter, ['road', 'commute', 'gravel']) }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Kostenersparnis' : 'Cost Savings'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">~€70</span>
              </div>
              <p className="text-[11px] font-semibold mb-3" style={{ color: '#2B52B0' }}>
                {de ? '46 % weniger über 12.000 km' : '46% less over 12,000 km'}
              </p>
              <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
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

            {/* Friction */}
            <div
              className="diff-card rounded-xl border border-wx-bd p-5 flex flex-col"
              style={{ ...cardStyle, ...rowOpacity(activeFilter, ['road', 'gravel']) }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Reibung' : 'Friction'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">μ 0,03</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {frictionMini.map((item, i) => {
                  const label = 'label' in item ? item.label : (de ? item.labelDe : item.labelEn);
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-[11px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{label}</span>
                        <span className={`text-[11px] font-mono tabular-nums ${item.highlight ? 'text-wx-tx2' : 'text-wx-txff'}`}>{item.val}</span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                        <div
                          className="fbar h-full w-full rounded-full"
                          data-w={item.pct}
                          style={{
                            background: item.highlight ? 'linear-gradient(90deg, #0F2450, #3D67CA)' : 'var(--bd2)',
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
                className="flex items-center gap-1 text-[11px] font-medium mt-3 pt-3 transition-opacity hover:opacity-70"
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
