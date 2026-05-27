import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

// ─── Composition ring data (categories only, no exact ingredient names) ───────
const ring = [
  { pct: 88.5, labelDe: 'Basismatrix',     labelEn: 'Base Matrix',     color: '#1A3080' },
  { pct:  7.0, labelDe: 'Mikrokristallin', labelEn: 'Microcrystalline',color: '#2B52B0' },
  { pct:  3.5, labelDe: 'Härtemodul',      labelEn: 'Hardener',        color: '#4A72D4' },
  { pct:  0.5, labelDe: 'MoS₂',            labelEn: 'MoS₂',           color: '#7A9AEC' },
  { pct: 0.35, labelDe: 'Dispergiermittel',labelEn: 'Dispersant',      color: '#A8C0F4' },
  { pct: 0.15, labelDe: 'Stabilisator',    labelEn: 'Stabilizer',      color: '#C8D8FA' },
];

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ de }: { de: boolean }) {
  const r = 82;
  const C = 2 * Math.PI * r;
  let cumPct = 0;
  const segments = ring.map(item => {
    const dash = C * item.pct / 100;
    const offset = -(C * cumPct / 100);
    cumPct += item.pct;
    return { ...item, dash, offset };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
        <g transform="rotate(-90 100 100)">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="100" cy="100" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={`${Math.max(seg.dash - 1.5, 0)} ${C}`}
              strokeDashoffset={seg.offset}
            />
          ))}
        </g>
        <text x="100" y="95" textAnchor="middle" fill="var(--tx1)" fontSize="30" fontWeight="700" fontFamily="Space Grotesk, sans-serif">6</text>
        <text x="100" y="114" textAnchor="middle" fill="var(--txm)" fontSize="10" fontFamily="Inter, sans-serif">
          {de ? 'Komponenten' : 'Components'}
        </text>
      </svg>
      <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-[260px]">
        {ring.map((item, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] text-wx-txm truncate">
              {de ? item.labelDe : item.labelEn}
              <span className="text-wx-txff ml-1">{item.pct}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Crystal Lattice visual ───────────────────────────────────────────────────
function CrystalLattice() {
  const rows = 5;
  const cols = 8;
  return (
    <div className="w-full rounded-xl overflow-hidden p-6" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const isBig = (row + col) % 3 === 0;
          return (
            <div
              key={i}
              className="aspect-square rounded-full mx-auto transition-all duration-700"
              style={{
                width: isBig ? '10px' : '6px',
                background: isBig ? '#2B52B0' : 'var(--bd)',
                boxShadow: isBig ? '0 0 8px rgba(43,82,176,0.4)' : 'none',
              }}
            />
          );
        })}
      </div>
      <p className="text-center text-[10px] text-wx-txff mt-4 uppercase tracking-widest">
        Lamellare Kristalldomänen · C₂₀–C₃₆
      </p>
    </div>
  );
}

// ─── Temperature Range Visual ─────────────────────────────────────────────────
function TempRange({ de }: { de: boolean }) {
  const items = [
    { labelDe: 'Unmodifiziertes Paraffin',  labelEn: 'Unmodified paraffin',   lo: 58, hi: 62, color: 'var(--bd)' },
    { labelDe: 'Waxcelerate Classic',        labelEn: 'Waxcelerate Classic',   lo: 60, hi: 76, color: '#2B52B0' },
    { labelDe: 'Waxcelerate Pro',            labelEn: 'Waxcelerate Pro',        lo: 60, hi: 79, color: '#4A72D4' },
  ];
  const min = 55, max = 85;
  const toX = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="w-full rounded-xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-wx-txff mb-4">
        {de ? 'Effektiver Erweichungspunkt' : 'Effective drop point'}
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-wx-txm">{de ? item.labelDe : item.labelEn}</span>
              <span className="text-[11px] font-mono text-wx-txf">{item.lo}–{item.hi}°C</span>
            </div>
            <div className="relative h-2 rounded-full" style={{ background: 'var(--bd2)' }}>
              <div
                className="absolute top-0 h-full rounded-full"
                style={{
                  left: `${toX(item.lo)}%`,
                  width: `${toX(item.hi) - toX(item.lo)}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {[55, 60, 65, 70, 75, 80, 85].map(t => (
          <span key={t} className="text-[9px] text-wx-txff font-mono">{t}°</span>
        ))}
      </div>
    </div>
  );
}

// ─── MoS₂ Layer Stack visual ──────────────────────────────────────────────────
function MoS2Layers({ de }: { de: boolean }) {
  return (
    <div className="w-full rounded-xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-wx-txff mb-5 text-center">
        {de ? 'Hexagonale Schichtstruktur · 2H-Polymorphe' : 'Hexagonal layer structure · 2H polymorph'}
      </p>
      <div className="flex flex-col items-center gap-0 select-none">
        {['S', 'Mo', 'S', '↕ van der Waals', 'S', 'Mo', 'S'].map((label, i) => {
          const isGap = label.includes('van');
          const isMo = label === 'Mo';
          const isS = label === 'S';
          return (
            <div key={i} className="flex items-center justify-center gap-1.5 w-full" style={{ height: isGap ? '20px' : '22px' }}>
              {isGap ? (
                <span className="text-[9px] text-wx-txff tracking-widest">{label}</span>
              ) : (
                <>
                  {[...Array(6)].map((_, j) => (
                    <div
                      key={j}
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: isMo ? '14px' : '10px',
                        height: isMo ? '14px' : '10px',
                        background: isMo ? '#4A72D4' : '#A8C0F4',
                        opacity: isMo ? 1 : 0.8,
                        boxShadow: isMo ? '0 0 6px rgba(74,114,212,0.5)' : 'none',
                      }}
                    />
                  ))}
                  <span className="text-[10px] text-wx-txff ml-2 w-4">{isS ? 'S' : 'Mo'}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-wx-bd2 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-[22px] font-bold tabular-nums" style={{ color: '#4A72D4' }}>μ 0.03</p>
          <p className="text-[10px] text-wx-txff">{de ? 'Reibungskoeff. (Trocken)' : 'Friction coeff. (dry)'}</p>
        </div>
        <div className="text-center">
          <p className="text-[22px] font-bold tabular-nums text-wx-tx1">&lt;5 µm</p>
          <p className="text-[10px] text-wx-txff">{de ? 'Partikelgröße d₅₀' : 'Particle size d₅₀'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Particle Sedimentation visual ────────────────────────────────────────────
function ParticleSuspension({ de }: { de: boolean }) {
  return (
    <div className="w-full rounded-xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <div className="grid grid-cols-2 gap-4">
        {[
          { titleDe: 'Ohne Dispergiermittel', titleEn: 'Without dispersant', settled: true },
          { titleDe: 'Mit Dispergiermittel',  titleEn: 'With dispersant',   settled: false },
        ].map((panel, pi) => (
          <div key={pi} className="flex flex-col items-center">
            <p className="text-[10px] text-wx-txff mb-3 text-center">{de ? panel.titleDe : panel.titleEn}</p>
            <div
              className="relative w-16 rounded"
              style={{ height: '80px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}
            >
              {panel.settled ? (
                <>
                  <div className="absolute bottom-0 left-0 right-0 rounded-b flex flex-wrap gap-0.5 p-1" style={{ background: 'rgba(43,82,176,0.3)' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#2B52B0' }} />
                    ))}
                  </div>
                  <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-0.5 opacity-20">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#2B52B0' }} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-wrap gap-1 p-1.5 items-center justify-center">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#4A72D4',
                        transform: `translate(${(i % 3 - 1) * 2}px, ${(Math.floor(i / 3) % 3 - 1) * 2}px)`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-[9px] text-wx-txff mt-2 text-center">
              {panel.settled
                ? (de ? 'Sedimentation ~0.3 mm/min' : 'Sedimentation ~0.3 mm/min')
                : (de ? 'Gleichmäßig verteilt' : 'Uniformly dispersed')}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-wx-txff mt-4 pt-3 border-t border-wx-bd2 text-center">
        {de
          ? 'Dichteunterschied MoS₂ zu Wachs: Faktor 5.6'
          : 'Density ratio MoS₂ to wax: 5.6×'}
      </p>
    </div>
  );
}

// ─── Friction bars (matches existing site style) ──────────────────────────────
function FrictionBars({ de }: { de: boolean }) {
  const bars = [
    { label: 'Waxcelerate Pro',   tag: 'PRO',  desc: 'μ 0.03–0.06', pct: 100, hi: true },
    { label: 'Waxcelerate Classic',             desc: 'μ 0.05–0.07', pct: 86,  hi: true },
    { labelDe: 'Graphit-Heißwachs', labelEn: 'Graphite Wax', desc: 'μ 0.08–0.12', pct: 60,  hi: false },
    { labelDe: 'Kettenöl (nass)',   labelEn: 'Chain oil (wet)', desc: 'μ 0.18–0.25', pct: 15,  hi: false, dim: true },
  ];

  return (
    <div className="w-full rounded-xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-wx-txff mb-4">
        {de ? 'Reibungskoeffizient μ (Grenzschmierung)' : 'Friction coefficient μ (boundary lubrication)'}
      </p>
      <div className="space-y-3">
        {bars.map((b, i) => {
          const label = 'label' in b ? b.label : (de ? b.labelDe : b.labelEn);
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[11px] font-medium ${b.hi ? 'text-wx-tx1' : 'text-wx-txm'}`}>
                  {label}
                  {'tag' in b && b.tag && (
                    <span className="ml-1.5 text-[8px] font-bold tracking-widest uppercase px-1 py-0.5 rounded" style={{ background: 'linear-gradient(135deg,#1A3080,#4A72D4)', color: 'rgba(255,255,255,0.9)' }}>
                      {b.tag}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-mono ${b.hi ? 'text-wx-tx2' : b.dim ? 'text-wx-txff' : 'text-wx-txf'}`}>{b.desc}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${b.pct}%`,
                    background: b.hi
                      ? (b.pct === 100 ? 'linear-gradient(90deg,#1A3080,#6A8AE8)' : 'linear-gradient(90deg,#2B52B0,#4A72D4)')
                      : b.dim ? 'var(--bd2)' : 'var(--txff)',
                    transition: 'width 1s ease-out',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); } },
      { threshold }
    );
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

// ─── Insight callout ──────────────────────────────────────────────────────────
function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-4 py-3 text-[13px] leading-relaxed text-wx-txm" style={{ background: 'rgba(43,82,176,0.08)', borderLeft: '3px solid #2B52B0' }}>
      {children}
    </div>
  );
}

// ─── Chapter component ────────────────────────────────────────────────────────
interface ChapterProps {
  num: string;
  catDe: string;
  catEn: string;
  titleDe: string;
  titleEn: string;
  bodyDe: React.ReactNode;
  bodyEn: React.ReactNode;
  insightDe: string;
  insightEn: string;
  visual: React.ReactNode;
  flip?: boolean;
  de: boolean;
}

function Chapter({ num, catDe, catEn, titleDe, titleEn, bodyDe, bodyEn, insightDe, insightEn, visual, flip, de }: ChapterProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="mb-20 lg:mb-28">
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        {/* Text side */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display text-5xl font-bold tabular-nums" style={{ color: 'rgba(43,82,176,0.25)', lineHeight: 1 }}>{num}</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#3D67CA' }}>
                {de ? catDe : catEn}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-wx-tx1 leading-tight">
              {de ? titleDe : titleEn}
            </h2>
          </div>
          <div className="space-y-3 text-[14px] leading-[1.8] text-wx-txm">
            {de ? bodyDe : bodyEn}
          </div>
          <Insight>{de ? insightDe : insightEn}</Insight>
        </div>
        {/* Visual side */}
        <div className="flex flex-col justify-start">
          {visual}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SciencePage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const heroRef = useReveal<HTMLDivElement>(0.05);

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      {/* ── Nav bar ── */}
      <nav className="sticky top-0 z-40 border-b border-wx-bd" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[13px] text-wx-txm hover:text-wx-tx1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <span className="font-display text-[13px] font-semibold text-wx-tx1">
            Waxcelerate <span style={{ color: '#4A72D4' }}>·</span> {de ? 'Wissenschaft' : 'Science'}
          </span>
          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <div ref={heroRef} className="pt-20 pb-16 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] mb-4" style={{ color: '#3D67CA' }}>
            {de ? 'Formulierungsdokumentation' : 'Formulation Documentation'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 leading-[1.1] mb-6">
            {de ? 'Sechs Stoffe.\nEine Entscheidung.' : 'Six components.\nOne decision each.'}
          </h1>
          <p className="text-[15px] leading-relaxed text-wx-txm max-w-xl mx-auto">
            {de
              ? 'Jede Komponente in dieser Formel existiert, weil ein Test gescheitert ist — oder weil ein Kompromiss nicht akzeptabel war. Hier steht, was drin ist und warum.'
              : "Every component in this formula exists because a test failed — or because a compromise was unacceptable. Here's what's in it, and why."}
          </p>
        </div>

        {/* ── Composition overview ── */}
        <div className="mb-24">
          <div className="rounded-2xl border border-wx-bd p-8 sm:p-10" style={{ background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: '#3D67CA' }}>
                  {de ? 'Zusammensetzung' : 'Composition'}
                </p>
                <h2 className="font-display text-2xl font-bold text-wx-tx1 mb-4">
                  {de ? 'Die vollständige Formel' : 'The complete formula'}
                </h2>
                <p className="text-[14px] leading-relaxed text-wx-txm mb-5">
                  {de
                    ? 'Die Formel ist das Ergebnis von über einem Jahr Iteration — von ersten Schmelzversuchen bis zur stabilen Produktion. Zwei der sechs Komponenten sind Additive in Spurenanteilen; sie sind unverzichtbar.'
                    : 'The formula is the result of over a year of iteration — from first melt tests to stable production. Two of the six components are trace-level additives; they are non-negotiable.'}
                </p>
                <div className="space-y-2">
                  {[
                    { pct: '88.5%', catDe: 'Basismatrix — kristallines Trägergerüst', catEn: 'Base matrix — crystalline scaffold' },
                    { pct:  '7.0%', catDe: 'Mikrokristallin — Plastifizierung & Haftung', catEn: 'Microcrystalline — plastification & adhesion' },
                    { pct:  '3.5%', catDe: 'Härtemodul — Schmelzpunkterhöhung', catEn: 'Hardener — drop point elevation' },
                    { pct:  '0.5%', catDe: 'MoS₂ — primärer Festschmierstoff', catEn: 'MoS₂ — primary solid lubricant' },
                    { pct: '0.35%', catDe: 'Dispergiermittel — Partikelstabilisierung', catEn: 'Dispersant — particle stabilization' },
                    { pct: '0.15%', catDe: 'Stabilisator — Langzeitschutz', catEn: 'Stabilizer — long-term protection' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ring[i].color }} />
                      <span className="text-[13px] font-mono font-semibold text-wx-tx1 w-12 flex-shrink-0">{item.pct}</span>
                      <span className="text-[12px] text-wx-txm">{de ? item.catDe : item.catEn}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <DonutChart de={de} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-20">
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-wx-txff">{de ? 'Kapitel für Kapitel' : 'Chapter by chapter'}</span>
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
        </div>

        {/* ══ CHAPTER 01 — Die Basis ════════════════════════════════════════════ */}
        <Chapter
          num="01" de={de}
          catDe="Die Basis" catEn="The Foundation"
          titleDe="Das kristalline Gerüst — 88.5%"
          titleEn="The crystalline scaffold — 88.5%"
          bodyDe={
            <>
              <p>Die erste Frage war täuschend einfach: Welches Paraffin? Paraffin ist kein Material, sondern eine Kategorie — sie reicht von weichen, öligen Kerzenwachsen bis hin zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich.</p>
              <p>Wir haben uns für ein vollraffiniertes Erdöldesillat mit einem exakt definierten 2°C-Erstarrungsfenster (58–60°C) entschieden. Diese Enge ist keine Präzision um ihrer selbst willen — sie sichert die Reproduzierbarkeit. Ein breiterer Erstarrungsbereich produziert je nach Batch leicht unterschiedliche Kristallstrukturen. Erster Block, letzter Block, gleiche Charge: identisch.</p>
              <p>Beim Abkühlen aus der Schmelze nucleieren die linearen Kohlenwasserstoffketten (C₂₀–C₃₆) und bilden lamellare Kristalldomänen — ein dreidimensionales Gitterwerk. Alle anderen Komponenten werden in den Zwischenbereichen dieses Gitters eingeschlossen und fixiert. Die Basismatrix ist das Skelett. Alles andere ist eingebettet.</p>
            </>
          }
          bodyEn={
            <>
              <p>The first question was deceptively simple: which paraffin wax? Paraffin isn't a material, it's a category — spanning soft, oily candle waxes to brittle technical grades. The decisive variable is the solidification range.</p>
              <p>We chose a fully refined petroleum distillate with a precisely defined 2°C solidification window (58–60°C). This narrow range isn't precision for its own sake — it ensures reproducibility. A wider solidification range produces subtly different crystal structures batch-to-batch. First block, last block, same production run: identical.</p>
              <p>On cooling from the melt, the linear hydrocarbon chains (C₂₀–C₃₆) nucleate and form lamellar crystal domains — an interlocking three-dimensional lattice. All other components are trapped and fixed in the spaces between these crystals. The base matrix is the skeleton. Everything else is embedded within it.</p>
            </>
          }
          insightDe="Das enge Erstarrungsfenster ist der Schlüssel zur Batch-Konsistenz — und damit zur gleichmäßigen Performance jedes Blocks."
          insightEn="The narrow solidification window is the key to batch consistency — and to every block performing the same."
          visual={<CrystalLattice />}
        />

        {/* ══ CHAPTER 02 — Härtemodul ══════════════════════════════════════════ */}
        <Chapter
          num="02" de={de} flip
          catDe="Härtemodul" catEn="Hardener Module"
          titleDe="Synthetisch reines Härtewachs — 3.5%"
          titleEn="Synthetically pure hard wax — 3.5%"
          bodyDe={
            <>
              <p>Das zweite Problem war der Sommer. An Kettenkontaktpunkten unter Last können Temperaturen 45–55°C erreichen. Reines Paraffinwachs mit einem Schmelzpunkt von 60°C würde bei diesen Bedingungen erweichen und migrieren — auf dem Schaltwerk landen statt in den Gelenkstiften.</p>
              <p>Die Lösung war ein synthetisches Wachs, hergestellt über den Fischer-Tropsch-Prozess: eine Kohlenstoff-Syntheseroute, die Kohlenwasserstoffketten von außergewöhnlicher Reinheit liefert. Kein Schwefel, keine Aromaten, keine Verzweigungen — nur lineare Moleküle, vollständig geordnet.</p>
              <p>Bei 3.5% Anteil erhöht dieses Additiv den effektiven Tropfpunkt der Gesamtmatrix von ~60°C auf ~72–78°C. Der Mechanismus: Es ko-kristallisiert mit der Basismatrix, bildet aber dichtere, defektärmere Kristalldomänen, die deutlich mehr Energie zum Schmelzen benötigen. Das Wachs bleibt thermisch stabil weit oberhalb jeder realistischen Sommerfahrtemperatur.</p>
            </>
          }
          bodyEn={
            <>
              <p>The second problem was summer. At chain contact points under load, temperatures can reach 45–55°C. Unmodified paraffin wax with a 60°C melting point would soften and migrate under these conditions — ending up on the derailleur instead of the chain pins.</p>
              <p>The solution was a synthetic wax produced via the Fischer-Tropsch process: a carbon synthesis route that yields hydrocarbon chains of exceptional purity. No sulfur, no aromatics, no branching — only linear molecules, perfectly ordered.</p>
              <p>At 3.5% loading, this additive raises the effective drop point of the matrix from ~60°C to ~72–78°C. The mechanism: it co-crystallizes with the base wax but forms denser, more defect-free crystal domains requiring significantly more energy to melt. The matrix remains thermally stable well above any realistic summer riding temperature.</p>
            </>
          }
          insightDe="Warum 3.5% statt 5%? Der Härtungseffekt setzt bei 3–4% vollständig ein. Mehr Anteil bringt keinen messbaren Vorteil — nur höhere Rohstoffkosten."
          insightEn="Why 3.5% and not 5%? The hardening effect saturates at 3–4%. More loading brings no measurable gain — only higher material cost."
          visual={<TempRange de={de} />}
        />

        {/* ══ CHAPTER 03 — Kälteflexibilität ══════════════════════════════════ */}
        <Chapter
          num="03" de={de}
          catDe="Kälteflexibilität" catEn="Cold Flexibility"
          titleDe="Mikrokristallines Wachs — 7.0%"
          titleEn="Microcrystalline wax — 7.0%"
          bodyDe={
            <>
              <p>Das entgegengesetzte Problem folgte sofort: Winter. Eine reine Paraffinmatrix mit Fischer-Tropsch-Härtemodul ist unterhalb von 5°C extrem spröde — spröde genug, um bei Biegebelastung zu brechen. Ein Kettengelenk, das sich in der Kälte bewegt, würde die Wachsschicht buchstäblich abplatzen lassen.</p>
              <p>Mikrokristallines Wachs löst dieses Problem. Im Gegensatz zu den geradkettigen Paraffinen besteht es aus hochverzweigten und zyklischen Molekülen, die keine geordneten Kristallstrukturen bilden können. Sie besetzen die amorphen Bereiche zwischen den Paraffindomänen und wirken als molekularer Plastifikator.</p>
              <p>Bei 7% Anteil passieren drei Dinge gleichzeitig: (1) Die Matrix bleibt bis −10°C elastisch verformbar statt zu brechen. (2) Die verzweigten Moleküle haben stärkere van-der-Waals-Wechselwirkungen mit der Stahloberfläche — bessere Haftung unter Scherkraft. (3) Die amorphen Bereiche betten die MoS₂-Partikel mechanisch in die Matrix ein und verhindern unkontrollierten Austritt.</p>
            </>
          }
          bodyEn={
            <>
              <p>The opposite problem arrived immediately: winter. A pure paraffin matrix with a Fischer-Tropsch hardener is extremely brittle below 5°C — brittle enough to crack under bending stress. A chain link flexing in cold weather would literally cause the wax coating to spall off.</p>
              <p>Microcrystalline wax solves this. Unlike the straight-chain paraffins, it consists of highly branched and cyclic molecules that cannot form ordered crystal structures. They occupy the amorphous zones between the paraffin crystal domains, acting as a molecular plasticizer.</p>
              <p>At 7% loading, three things happen simultaneously: (1) The matrix remains elastically deformable down to −10°C instead of fracturing. (2) The branched molecules have stronger van-der-Waals interactions with the steel surface — better adhesion under shear. (3) The amorphous regions mechanically embed the MoS₂ particles, preventing uncontrolled release.</p>
            </>
          }
          insightDe="Ursprünglich bei 10% formuliert. Die Reduzierung auf 7% war möglich, weil gleichzeitig der MoS₂-Anteil reduziert wurde — weniger Partikelmasse bedeutet weniger Bindermasse erforderlich."
          insightEn="Originally formulated at 10%. The reduction to 7% was possible because MoS₂ loading was simultaneously reduced — less particle mass means less binder mass needed."
          visual={
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-wx-txff">
                {de ? 'Temperaturfenster — Matrix bleibt flexibel' : 'Temperature window — matrix stays flexible'}
              </p>
              {[
                { labelDe: 'Kälteflexibilität bis', labelEn: 'Cold flexibility to', val: '−10°C', bar: 20, color: '#4A72D4' },
                { labelDe: 'Optimale Performance', labelEn: 'Optimal performance', val: '−8°C – +35°C', bar: 80, color: '#2B52B0' },
                { labelDe: 'Thermisch stabil bis', labelEn: 'Thermally stable to', val: '+78°C', bar: 100, color: '#1A3080' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-wx-txm">{de ? item.labelDe : item.labelEn}</span>
                    <span className="text-[11px] font-mono font-semibold text-wx-tx1">{item.val}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.bar}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-wx-bd2">
                {[
                  { labelDe: 'Plastifizierung', labelEn: 'Plastification' },
                  { labelDe: 'Haftung', labelEn: 'Adhesion' },
                  { labelDe: 'Partikelbindung', labelEn: 'Particle binding' },
                ].map((fn, i) => (
                  <div key={i} className="text-center rounded-lg p-2" style={{ background: 'rgba(43,82,176,0.08)' }}>
                    <p className="text-[9px] uppercase tracking-wide" style={{ color: '#4A72D4' }}>{de ? fn.labelDe : fn.labelEn}</p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* ══ CHAPTER 04 — MoS₂ ════════════════════════════════════════════════ */}
        <Chapter
          num="04" de={de} flip
          catDe="Festschmierstoff" catEn="Solid Lubricant"
          titleDe="Molybdändisulfid — 0.5% · &lt;5 µm"
          titleEn="Molybdenum disulfide — 0.5% · &lt;5 µm"
          bodyDe={
            <>
              <p>MoS₂ ist eines der wenigen Materialien, die unter Grenzschmierbedingungen einen Reibungskoeffizienten unter 0.05 erreichen. Der Grund liegt in der Kristallstruktur: Mo-Atome sandwichartig zwischen zwei Schwefelschichten, die Schichten untereinander nur durch schwache van-der-Waals-Kräfte gebunden. Unter Kontaktdruck scheren diese Bindungen — die Schichten gleiten lateral fast widerstandslos.</p>
              <p>An Kettenkontaktflächen unter Last entstehen Drücke von 50–300 MPa. Das ist das Regime der Grenzschmierung — konventionelle Öle können bei diesen Drücken keinen kontinuierlichen Film aufrechterhalten. MoS₂ braucht keinen Film. Es bildet einen Transferfilm: Partikel werden unter Druck mechanisch auf der Stahloberfläche deponiert und durch tribochemische Bindungen (Mo–S → Fe–S an Kontaktstellen) verankert. Dieser Film persistiert, auch nachdem der Wachsträger längst abgetragen ist.</p>
              <p>Die Partikelgröße ist nicht zufällig: Bei einem d₅₀ von ca. 4.5 µm passen die Partikel in die Kettenlagerungsspalte (typisch 5–15 µm), sind aber groß genug um substanzielle Masse pro Partikel zu transportieren. 0.5% Anteil ergibt ca. 1.3 Millionen Partikel pro Gramm Wachs — ausreichend für mehrfache Transferfilm-Regeneration über hunderte Kilometer.</p>
            </>
          }
          bodyEn={
            <>
              <p>MoS₂ is one of the few materials achieving a friction coefficient below 0.05 under boundary lubrication conditions. The reason lies in the crystal structure: Mo atoms sandwiched between two sulfur layers, with the layers bonded to each other only by weak van-der-Waals forces. Under contact pressure, these bonds shear — the layers slide laterally with almost no resistance.</p>
              <p>At chain contact surfaces under load, pressures reach 50–300 MPa. This is the boundary lubrication regime — conventional oils cannot maintain a continuous film at these pressures. MoS₂ doesn't need a film. It forms a transfer film: particles are mechanically deposited on the steel surface under pressure and anchored by tribochemical bonds (Mo–S → Fe–S at contact points). This film persists long after the wax carrier has been worn away.</p>
              <p>Particle size is deliberate: at a d₅₀ of ~4.5 µm, particles fit within chain clearances (typically 5–15 µm) while being large enough to carry meaningful mass. At 0.5% loading, approximately 1.3 million particles per gram of wax — sufficient for multiple cycles of transfer film formation and regeneration across hundreds of kilometers.</p>
            </>
          }
          insightDe="Der Transferfilm ist der eigentliche Schmierstoff — das Wachs ist nur das Trägervehikel. MoS₂-Schichten nanometerdicke auf dem Stahl schmieren noch, wenn der Block längst aufgebraucht ist."
          insightEn="The transfer film is the actual lubricant — the wax is just the delivery vehicle. Nanometer-thin MoS₂ layers on the steel continue lubricating long after the block is spent."
          visual={<MoS2Layers de={de} />}
        />

        {/* ══ CHAPTER 05 — Dispergiermittel ════════════════════════════════════ */}
        <Chapter
          num="05" de={de}
          catDe="Dispergiersystem" catEn="Dispersant System"
          titleDe="Amphiphiler Fettsäureester — 0.35%"
          titleEn="Amphiphilic fatty acid ester — 0.35%"
          bodyDe={
            <>
              <p>MoS₂ hat eine Dichte von 5.06 g/cm³. Paraffinwachs hat eine Dichte von 0.9 g/cm³. Dichteunterschied: Faktor 5.6. Gibt man MoS₂ in geschmolzenes Wachs ohne Stabilisierung, sinken die Partikel — mit ca. 0.3 mm/min nach der Stokesschen Sedimentationsformel. In den 10 Minuten zwischen Rührstopp und Guss bedeutet das messbare Konzentrationsgradienten im fertigen Block.</p>
              <p>Das Dispergiermittel ist ein amphiphiler Fettsäureester: ein Molekül mit einer polaren Kopfgruppe, die über Wasserstoffbrücken an MoS₂-Partikelkanten adsorbiert, und einer langen unpolaren Fettsäurekette, die sich in die Paraffinschmelze erstreckt. Diese Fettsäurehülle um jeden Partikel erzeugt eine sterische Barrierewirkung: Annähernde Partikel müssen die Ketten komprimieren — dieser entropische Widerstand verhindert Agglomeration und Sedimentation.</p>
              <p>Entscheidend für die Wahl dieses spezifischen Esters: Sein Schmelzpunkt (58–60°C) ist identisch mit dem der Basismatrix. Die Integration in die erstarrende Matrix verläuft thermodynamisch nahtlos — kein Auftrennen, keine Phasenseparation beim Abkühlen.</p>
            </>
          }
          bodyEn={
            <>
              <p>MoS₂ has a density of 5.06 g/cm³. Paraffin wax has a density of 0.9 g/cm³. Density ratio: 5.6×. Add MoS₂ to molten wax without stabilization, and the particles sink — at approximately 0.3 mm/min per Stokes' sedimentation law. In the 10 minutes between stopping agitation and casting, this creates measurable concentration gradients in the finished block.</p>
              <p>The dispersant is an amphiphilic fatty acid ester: a molecule with a polar head group that adsorbs to MoS₂ particle edges via hydrogen bonds, and a long nonpolar fatty acid tail that extends into the paraffin melt. This fatty acid shell around each particle creates a steric barrier: approaching particles must compress the tails — this entropic resistance prevents agglomeration and sedimentation.</p>
              <p>Critical to the choice of this specific ester: its melting point (58–60°C) is identical to the base matrix. Integration into the solidifying matrix is thermodynamically seamless — no phase separation on cooling, no layer formation.</p>
            </>
          }
          insightDe="Ohne Dispergiermittel variiert die MoS₂-Konzentration innerhalb des Blocks. Der erste Rewax-Vorgang wäre anders als der zwanzigste. Das ist nicht akzeptabel."
          insightEn="Without dispersant, MoS₂ concentration varies through the block. The first rewax would perform differently from the twentieth. That's not acceptable."
          visual={<ParticleSuspension de={de} />}
        />

        {/* ══ CHAPTER 06 — Stabilisator ════════════════════════════════════════ */}
        <Chapter
          num="06" de={de} flip
          catDe="Langzeitstabilität" catEn="Long-term Stability"
          titleDe="Gehindertes Phenol-Antioxidans — 0.15%"
          titleEn="Hindered phenolic antioxidant — 0.15%"
          bodyDe={
            <>
              <p>Die letzte Frage war Zeit. Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation: Sauerstoffradikale greifen C–H-Bindungen an und initiieren eine Kettenreaktion, die Peroxide, Alkohole und Ketone produziert. Diese Oxidationsprodukte verändern die mechanischen Eigenschaften des Wachses — und können die MoS₂-Oberfläche von einem Schmierstoff (MoS₂) in ein Abrasivum umwandeln (MoO₃, Molybdäntrioxid, gebildet durch Mo⁴⁺ → Mo⁶⁺).</p>
              <p>Ein gehindertes Phenol-Antioxidans bei 0.15% wirkt als Radikalkettenabbrecher: Die phenolische OH-Gruppe doniert ein Wasserstoffatom an Peroxylradikale (ROO•) und bricht die Oxidationskaskade ab. Das resultierende Phenoxyradikal ist durch sterische Gruppen stabilisiert und reaktionsträgert. Drei Schutzebenen in einer Komponente: Wachsmatrix, MoS₂-Oberfläche, Lagerstabilität.</p>
              <p>Die Konzentration wurde von 0.10% auf 0.15% erhöht, als wir einen separaten Korrosionsinhibitor aus einer früheren Formulierungsversion entfernt haben. Dieser hatte eine sekundäre antioxidative Wirkung auf Metalloberflächen. Ohne ihn trägt das Phenol-Antioxidans die gesamte Last — 0.15% kompensiert dies vollständig bei Mehrkosten von unter €1 pro 200-kg-Batch.</p>
            </>
          }
          bodyEn={
            <>
              <p>The last question was time. A wax block that performs in week 1 but degrades by month 6 isn't a product. Hydrocarbon waxes are susceptible to autoxidation: oxygen radicals attack C–H bonds, initiating a chain reaction producing peroxides, alcohols, and ketones. These oxidation products alter the mechanical properties of the wax — and can convert the MoS₂ surface from a lubricant (MoS₂) into an abrasive (MoO₃, molybdenum trioxide, formed by Mo⁴⁺ → Mo⁶⁺).</p>
              <p>A hindered phenolic antioxidant at 0.15% acts as a radical chain-breaker: the phenolic OH group donates a hydrogen atom to peroxyl radicals (ROO•), breaking the oxidation cascade. The resulting phenoxy radical is stabilized by steric bulk and is unreactive. Three protection layers in one component: wax matrix, MoS₂ surface, shelf life.</p>
              <p>Concentration was raised from 0.10% to 0.15% when we removed a separate corrosion inhibitor from an earlier formula version. That inhibitor had a secondary antioxidant effect on metal surfaces. Without it, the phenolic antioxidant carries the full stabilization load — 0.15% covers this completely at an additional cost of under €1 per 200-kg production batch.</p>
            </>
          }
          insightDe="Das Antioxidans schützt nicht nur das Wachs, sondern auch den Festschmierstoff. Ohne es wäre das MoS₂ nach 12 Monaten Lagerung messbar oxidativ degradiert."
          insightEn="The antioxidant protects not just the wax, but also the solid lubricant. Without it, MoS₂ would be measurably oxidatively degraded after 12 months of storage."
          visual={
            <div className="rounded-xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-wx-txff mb-5">
                {de ? 'Drei Schutzebenen' : 'Three protection layers'}
              </p>
              <div className="space-y-3">
                {[
                  {
                    numDe: '01', numEn: '01',
                    titleDe: 'Wachsmatrix', titleEn: 'Wax matrix',
                    descDe: 'Stoppt Autoxidation der Kohlenwasserstoffketten bei Produktionstemperatur (80–85°C) und Lagerung.',
                    descEn: 'Stops autoxidation of hydrocarbon chains at production temperature (80–85°C) and during storage.',
                  },
                  {
                    numDe: '02', numEn: '02',
                    titleDe: 'MoS₂-Oberfläche', titleEn: 'MoS₂ surface',
                    descDe: 'Bindet Sauerstoffspuren in der Matrix und verhindert langsame MoS₂ → MoO₃ Oxidation.',
                    descEn: 'Binds trace oxygen in the matrix, preventing slow MoS₂ → MoO₃ surface oxidation.',
                  },
                  {
                    numDe: '03', numEn: '03',
                    titleDe: 'Lagerstabilität', titleEn: 'Shelf life',
                    descDe: 'Peroxidzahl bleibt auch nach 12–24 Monaten Raumtemperaturlagerung unter dem Leistungsgrenzwert.',
                    descEn: 'Peroxide value stays below the performance threshold even after 12–24 months at room temperature.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'rgba(43,82,176,0.06)', border: '1px solid rgba(43,82,176,0.12)' }}>
                    <span className="font-display text-[18px] font-bold tabular-nums flex-shrink-0" style={{ color: 'rgba(43,82,176,0.35)', lineHeight: 1 }}>{de ? item.numDe : item.numEn}</span>
                    <div>
                      <p className="text-[12px] font-semibold text-wx-tx1 mb-0.5">{de ? item.titleDe : item.titleEn}</p>
                      <p className="text-[11px] text-wx-txm leading-relaxed">{de ? item.descDe : item.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* ── Results section ── */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: '#3D67CA' }}>
              {de ? 'Das Ergebnis' : 'The Result'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-wx-tx1">
              {de ? 'Was die Formel leistet' : 'What the formula delivers'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FrictionBars de={de} />
            <div className="rounded-xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-wx-txff mb-4">
                {de ? 'Konsistenz Block zu Block' : 'Block-to-block consistency'}
              </p>
              <div className="space-y-4">
                {[
                  { label: de ? 'Erster Block' : 'First block',   val: '100%' },
                  { label: de ? 'Zehnter Block' : 'Tenth block',   val: '100%' },
                  { label: de ? 'Zwanzigster Block' : 'Twentieth block', val: '100%' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-wx-txm">{item.label}</span>
                      <span className="text-[11px] font-mono font-semibold" style={{ color: '#4A72D4' }}>{item.val}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                      <div className="h-full rounded-full w-full" style={{ background: 'linear-gradient(90deg,#1A3080,#4A72D4)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-wx-txm mt-4 pt-3 leading-relaxed" style={{ borderTop: '1px solid var(--bd2)' }}>
                {de
                  ? 'Das Dispergiermittel stellt sicher, dass die MoS₂-Konzentration im Gussblock gleichmäßig ist — von der ersten bis zur letzten Scheibe.'
                  : 'The dispersant ensures uniform MoS₂ concentration throughout the cast block — from first slice to last.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mb-24 text-center">
          <div className="rounded-2xl border border-wx-bd p-10" style={{ background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)' }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: '#3D67CA' }}>
              {de ? 'Bereit?' : 'Ready?'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-wx-tx1 mb-4">
              {de ? 'Jetzt die Formel auf deiner Kette.' : 'Now put the formula on your chain.'}
            </h2>
            <p className="text-[14px] text-wx-txm mb-6 max-w-md mx-auto">
              {de
                ? 'Waxcelerate Pro und Classic direkt über eBay erhältlich — mit vollem Käuferschutz.'
                : 'Waxcelerate Pro and Classic available via eBay — with full buyer protection.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-[14px] text-white transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#1A3080,#4A72D4)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              {de ? 'Zurück zu den Produkten' : 'Back to products'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
