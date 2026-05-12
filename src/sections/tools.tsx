import { useState, useEffect, useRef } from 'react';
import { Calculator, Link2, Package, PiggyBank, RotateCcw, ExternalLink } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { waxIntervals, compatibilityMatrix, getProductById } from '@/lib/data';

const BLUE = '#5B7AEE';

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    },
  };
}

const tog = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-sm transition-all border cursor-pointer ${
    active
      ? 'border-[#5B7AEE]/50 bg-[#5B7AEE]/12 text-[#A8BFFF]'
      : 'border-[#1E1E2C] text-[#4E4E62] hover:border-[#2E2E40] hover:text-[#7A7A9A]'
  }`;

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-xl border border-[#1A1A28] transition-colors hover:border-[#2A2A3A]"
      style={{
        background: 'linear-gradient(160deg, #0E0E17 0%, #0A0A10 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {children}
    </div>
  );
}

function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-6 pb-5">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(91,122,238,0.1)', boxShadow: '0 0 0 1px rgba(91,122,238,0.18)' }}
        >
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      </div>
      <p className="text-[13px] text-[#6B7088] leading-snug ml-11">{subtitle}</p>
      <div className="mt-5 border-t border-[#131320]" />
    </div>
  );
}

function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-[10px] text-[#4A4A62] uppercase tracking-[0.12em] font-medium">{label}</span>
      {value && <span className="text-[12px] text-[#7A80A0] tabular-nums">{value}</span>}
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border border-[#1A1A2E] p-4"
      style={{ background: 'rgba(6,6,14,0.8)' }}
    >
      {children}
    </div>
  );
}

// ─── Tool 1: Rewax Interval Calculator ───────────────────────────────────────
function RewaxCalculator() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('trocken');
  const [terrain, setTerrain] = useState<'strasse' | 'gravel' | 'mtb'>('strasse');
  const [kmPerWeek, setKmPerWeek] = useState(100);

  const interval = waxIntervals[weather][terrain];
  const weeks = Math.max(1, Math.round(interval / kmPerWeek));

  const weatherOpts = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.rewax.title}
        subtitle="Nie wieder zu früh oder zu spät — erhalte dein genaues Rewax-Intervall."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.rewax.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <button key={o.value} onClick={() => setWeather(o.value as any)} className={tog(weather === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.rewax.terrain} />
            <div className="flex flex-wrap gap-2">
              {terrainOpts.map(o => (
                <button key={o.value} onClick={() => setTerrain(o.value as any)} className={tog(terrain === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} />
            <Slider value={[kmPerWeek]} onValueChange={v => setKmPerWeek(v[0])} min={20} max={400} step={10} className="py-1" />
          </div>
        </div>

        <ResultBox>
          <p className="text-[42px] font-bold text-white text-center leading-none tracking-tight">{interval}</p>
          <p className="text-[13px] text-[#4A4A62] text-center mt-1">km bis zum nächsten Rewaxen</p>
          <p className="text-[12px] text-[#6B7088] text-center mt-0.5">
            ≈ {weeks} {weeks === 1 ? 'Woche' : 'Wochen'} bei {kmPerWeek} km/Wo.
          </p>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 2: Chain Compatibility Check ───────────────────────────────────────
function CompatibilityCheck() {
  const { t, lang } = useLanguage();
  const [brand, setBrand] = useState<'shimano' | 'sram' | 'campagnolo'>('shimano');
  const [speed, setSpeed] = useState<'11' | '12'>('11');

  const compatibleChains = (compatibilityMatrix[brand]?.[speed] || [])
    .map(id => getProductById(id))
    .filter(Boolean);

  const brandOpts = [
    { value: 'shimano', label: 'Shimano' },
    { value: 'sram', label: 'SRAM' },
    { value: 'campagnolo', label: 'Campagnolo' },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Link2 className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.compatibility.title}
        subtitle="Sofort die passende gewachste Kette für dein Antriebssystem finden."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.compatibility.brand} />
            <div className="flex flex-wrap gap-2">
              {brandOpts.map(o => (
                <button key={o.value} onClick={() => setBrand(o.value as any)} className={tog(brand === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.compatibility.speed} />
            <div className="flex flex-wrap gap-2">
              {['11', '12'].map(o => (
                <button key={o} onClick={() => setSpeed(o as any)} className={tog(speed === o)}>{o}-fach</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.12em] mb-3">Passende Ketten</p>
          <div className="space-y-1.5">
            {compatibleChains.length === 0 ? (
              <p className="text-[13px] text-[#3E3E52] text-center py-4">Keine Ketten gefunden</p>
            ) : (
              compatibleChains.map((chain: any) => (
                <div
                  key={chain.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-[#181826] hover:border-[#252538] transition-colors"
                  style={{ background: 'rgba(6,6,14,0.7)' }}
                >
                  <div>
                    <p className="text-[13px] text-[#C0C4DC] leading-tight">{lang === 'de' ? chain.title : chain.titleEn}</p>
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#8AAAFF' }}>{chain.price.toFixed(2)} €</p>
                  </div>
                  <a href={chain.ebayUrl} target="_blank" rel="noopener noreferrer">
                    <button className="p-1.5 rounded-md border border-[#1E1E2C] text-[#3E3E52] hover:border-[#5B7AEE]/30 hover:text-[#8AAAFF] transition-all">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ToolCard>
  );
}

// ─── Tool 3: Wax Stock Calculator ────────────────────────────────────────────
function WaxStockCalculator() {
  const { t } = useLanguage();
  const [chainCount, setChainCount] = useState(2);
  const [kmPerMonth, setKmPerMonth] = useState(400);
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('gemischt');

  const intervals = { trocken: 500, gemischt: 350, nass: 200 };
  const appsPerMonth = kmPerMonth / intervals[weather];
  const waxPerMonth = Math.round(appsPerMonth * 20 * chainCount);
  const months300 = Math.max(1, Math.round(300 / Math.max(1, waxPerMonth)));
  const months500 = Math.max(1, Math.round(500 / Math.max(1, waxPerMonth)));
  const cost300 = (22.95 / months300).toFixed(2);
  const cost500 = (29.95 / months500).toFixed(2);
  const rec = waxPerMonth > 80 ? '500' : waxPerMonth < 30 ? '300' : parseFloat(cost500) < parseFloat(cost300) ? '500' : 'either';

  const weatherOpts = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Package className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.stock.title}
        subtitle="Bestell genau das richtige Paket — kein Verschwendung, kein Engpass."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.stock.chainCount} value={`${chainCount}`} />
            <Slider value={[chainCount]} onValueChange={v => setChainCount(v[0])} min={1} max={4} step={1} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.stock.kmPerMonth} value={`${kmPerMonth} km`} />
            <Slider value={[kmPerMonth]} onValueChange={v => setKmPerMonth(v[0])} min={50} max={1200} step={50} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.stock.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <button key={o.value} onClick={() => setWeather(o.value as any)} className={tog(weather === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
        </div>

        <ResultBox>
          <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.1em] mb-0.5">Verbrauch / Monat</p>
          <p className="text-[38px] font-bold text-white leading-none tracking-tight">{waxPerMonth} <span className="text-[20px] text-[#6B7088] font-normal">g</span></p>
          <p className="text-[11px] text-[#4A4A62] mt-1 mb-4">Empfohlene Packung:</p>
          <div className="grid grid-cols-2 gap-2">
            {['300', '500'].map(size => {
              const isRec = rec === size;
              return (
                <a key={size} href={size === '300' ? 'https://www.ebay.de/itm/395811183957' : 'https://www.ebay.de/itm/395811184583'} target="_blank" rel="noopener noreferrer">
                  <div
                    className="rounded-lg border p-3 text-center transition-all hover:border-[#5B7AEE]/40"
                    style={{
                      borderColor: isRec ? 'rgba(91,122,238,0.45)' : '#1E1E2C',
                      background: isRec ? 'rgba(91,122,238,0.08)' : 'transparent',
                    }}
                  >
                    <p className="text-[12px] font-semibold text-[#C0C4DC]">{size}g — {size === '300' ? '22,95' : '29,95'} €</p>
                    <p className="text-[10px] text-[#4A4A62] mt-0.5">
                      {size === '300' ? months300 : months500} Mo. · {size === '300' ? cost300 : cost500} €/Mo.
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 4: Cost Savings Calculator ─────────────────────────────────────────
function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct, delay]);
  // Reset animation when pct changes (slider moved)
  useEffect(() => { setWidth(pct); }, [pct]);

  return (
    <div ref={ref} className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color,
          transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </div>
  );
}

function CostSavingsCalculator() {
  const { t } = useLanguage();
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [chainPrice, setChainPrice] = useState(45);
  const [cassettePrice, setCassettePrice] = useState(80);

  const waxCost = Math.round((kmPerYear / 6000) * chainPrice + (kmPerYear / 15000) * cassettePrice + (kmPerYear / 400) * 5);
  const oilCost = Math.round((kmPerYear / 2500) * chainPrice + (kmPerYear / 8000) * cassettePrice + 48);
  const savings = oilCost - waxCost;
  const maxCost = Math.max(waxCost, oilCost);
  const waxPct = Math.round((waxCost / maxCost) * 100);

  return (
    <ToolCard>
      <ToolHeader
        icon={<PiggyBank className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.savings.title}
        subtitle="Sieh in Euro, wie viel Wachs vs. Kettenöl pro Jahr wirklich spart."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.savings.kmPerYear} value={`${kmPerYear} km`} />
            <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={15000} step={500} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.savings.chainPrice} value={`${chainPrice} €`} />
            <Slider value={[chainPrice]} onValueChange={v => setChainPrice(v[0])} min={20} max={100} step={5} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.savings.cassettePrice} value={`${cassettePrice} €`} />
            <Slider value={[cassettePrice]} onValueChange={v => setCassettePrice(v[0])} min={30} max={200} step={10} className="py-1" />
          </div>
        </div>

        <ResultBox>
          {/* Bar chart comparison */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-[#A8BFFF]">Wachs</span>
                <span className="text-[13px] font-bold text-white">{waxCost} €</span>
              </div>
              <AnimatedBar pct={waxPct} color="linear-gradient(90deg, #4A68E8, #7090FF)" delay={0} />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-[#4A4A62]">Kettenöl</span>
                <span className="text-[13px] font-bold text-[#4A4A62] line-through decoration-[#3E3E52]">{oilCost} €</span>
              </div>
              <AnimatedBar pct={100} color="rgba(255,255,255,0.1)" delay={150} />
            </div>
          </div>

          <div className="rounded-lg border border-[#5B7AEE]/20 p-3 text-center" style={{ background: 'rgba(91,122,238,0.06)' }}>
            <p className="text-[10px] text-[#5B7AEE] uppercase tracking-[0.14em] mb-1">Deine Ersparnis</p>
            <p className="text-[36px] font-bold text-white leading-none tracking-tight">+{savings} €</p>
            <p className="text-[11px] text-[#4A4A62] mt-0.5">pro Jahr</p>
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 5: Chain Rotation Planner ──────────────────────────────────────────
const STATE_LABELS = ['Im Einsatz', 'Wartet', 'Im Wachs'];
const STATE_COLORS = ['#5B7AEE', '#2A2A42', '#1A1A2E'];
const STATE_TEXT = ['#A8BFFF', '#52526A', '#3A3A52'];

function CycleDiagram({ chainCount }: { chainCount: number }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % chainCount), 1800);
    return () => clearInterval(timer);
  }, [chainCount]);

  const svgW = 220;
  const svgH = 140;
  const cx = svgW / 2;
  const cy = svgH / 2 + 4;
  const radius = chainCount === 2 ? 56 : chainCount === 3 ? 52 : 48;
  const nodeR = 26;

  const nodes = Array.from({ length: chainCount }, (_, i) => {
    const angle = (i / chainCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      stateIdx: i === 0 ? 0 : i === chainCount - 1 ? 2 : 1,
      label: `K${i + 1}`,
    };
  });

  // Build arrows: node[i] → node[(i+1) % n]
  const arrows = nodes.map((from, i) => {
    const to = nodes[(i + 1) % chainCount];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / dist;
    const uy = dy / dist;
    // Start/end offset by nodeR + 2 to clear circle border
    const x1 = from.x + ux * (nodeR + 3);
    const y1 = from.y + uy * (nodeR + 3);
    const x2 = to.x - ux * (nodeR + 7);
    const y2 = to.y - uy * (nodeR + 7);
    return { x1, y1, x2, y2 };
  });

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto overflow-visible">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 L1.5,3 Z" fill="rgba(91,122,238,0.35)" />
        </marker>
        <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 L1.5,3 Z" fill="#5B7AEE" />
        </marker>
      </defs>

      {/* Arrows */}
      {arrows.map((a, i) => {
        const isActiveLine = i === active;
        return (
          <line
            key={i}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke={isActiveLine ? '#5B7AEE' : 'rgba(91,122,238,0.25)'}
            strokeWidth={isActiveLine ? 1.5 : 1}
            markerEnd={isActiveLine ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
            style={{ transition: 'stroke 0.4s ease, stroke-width 0.4s ease' }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isActive = i === active;
        const stateIdx = node.stateIdx;
        return (
          <g key={i}>
            {isActive && (
              <circle cx={node.x} cy={node.y} r={nodeR + 6} fill="rgba(91,122,238,0.08)" />
            )}
            <circle
              cx={node.x} cy={node.y} r={nodeR}
              fill={isActive ? 'rgba(91,122,238,0.14)' : 'rgba(14,14,22,0.9)'}
              stroke={isActive ? '#5B7AEE' : STATE_COLORS[stateIdx]}
              strokeWidth={isActive ? 1.5 : 1}
              style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
            />
            <text
              x={node.x} y={node.y - 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fontWeight="700"
              fill={isActive ? '#A8BFFF' : STATE_TEXT[stateIdx]}
              style={{ transition: 'fill 0.4s ease' }}
            >
              {node.label}
            </text>
            <text
              x={node.x} y={node.y + 10}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7.5"
              fill={isActive ? 'rgba(168,191,255,0.7)' : 'rgba(82,82,106,0.6)'}
              style={{ transition: 'fill 0.4s ease' }}
            >
              {STATE_LABELS[stateIdx]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RotationPlanner() {
  const { t } = useLanguage();
  const [chainCount, setChainCount] = useState(3);
  const [kmPerWeek, setKmPerWeek] = useState(150);

  const weeksPerCycle = Math.max(1, Math.round(400 / kmPerWeek));

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.rotation.title}
        subtitle="Optimiere dein Kettenrotations-System für maximale Lebensdauer."
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.rotation.chainCount} value={`${chainCount} Ketten`} />
            <Slider value={[chainCount]} onValueChange={v => setChainCount(v[0])} min={2} max={4} step={1} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.rotation.kmPerWeek} value={`${kmPerWeek} km`} />
            <Slider value={[kmPerWeek]} onValueChange={v => setKmPerWeek(v[0])} min={50} max={400} step={10} className="py-1" />
          </div>
        </div>

        <ResultBox>
          <CycleDiagram chainCount={chainCount} />
          <div className="border-t border-[#131320] pt-3 mt-2 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.1em] mb-1">Rewax alle</p>
              <p className="text-[28px] font-bold text-white leading-none">{weeksPerCycle}<span className="text-[14px] font-normal text-[#6B7088] ml-1">Wo.</span></p>
              <p className="text-[10px] text-[#4A4A62] mt-0.5">ca. 400 km</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4A4A62] uppercase tracking-[0.1em] mb-1">Zeit / Session</p>
              <p className="text-[28px] font-bold text-white leading-none">~15<span className="text-[14px] font-normal text-[#6B7088] ml-1">Min.</span></p>
              <p className="text-[10px] text-[#4A4A62] mt-0.5">für alle {chainCount} Ketten</p>
            </div>
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Reveal wrapper (hook must be in component, not in map) ──────────────────
function RevealSlot({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { ref, style } = useScrollReveal(delay);
  return (
    <div ref={ref} style={{ ...style, willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t } = useLanguage();

  const tools = [
    <RewaxCalculator />,
    <CompatibilityCheck />,
    <WaxStockCalculator />,
    <CostSavingsCalculator />,
    <RotationPlanner />,
  ];

  return (
    <section id="tools" className="py-24" style={{ background: '#06060A' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[0.35em] uppercase mb-3 block font-medium" style={{ color: BLUE }}>
              Planungs-Tools
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.tools.title}
            </h2>
            <p className="text-[#52526A] max-w-xl mx-auto text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {tools.map((tool, i) => (
              <RevealSlot key={i} delay={i * 90}>
                {tool}
              </RevealSlot>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
