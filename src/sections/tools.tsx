import { useState, useEffect, useRef, useMemo } from 'react';
import { Calculator, Package, PiggyBank, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { waxIntervals } from '@/lib/data';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';

gsap.registerPlugin(ScrollTrigger);

// ─── Animated number ticker ───────────────────────────────────────────────────
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    const to = value;
    prev.current = to;
    if (from === to) return;

    tweenRef.current?.kill();
    const counter = { val: from };
    tweenRef.current = gsap.to(counter, {
      val: to,
      duration: 0.38,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${prefix}${counter.val.toFixed(decimals)}${suffix}`;
      },
    });
  }, [value, prefix, suffix, decimals]);

  const fmt = value.toFixed(decimals);
  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{fmt}{suffix}
    </span>
  );
}

// ─── Scroll-reveal hook (3D version) ─────────────────────────────────────────
function useScrollReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.set(el, { opacity: 0, y: 28, rotateX: 8, transformPerspective: 700, transformOrigin: '50% 0%' });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.7, ease: 'power3.out', delay: delay / 1000,
          onComplete: () => { el.style.willChange = 'auto'; el.style.transform = ''; },
        });
      },
    });
    return () => trigger.kill();
  }, [delay]);
  return { ref };
}

// Theme-aware chip toggle — works in all three modes
const tog = (active: boolean) =>
  `px-3 py-1.5 rounded-md text-sm transition-all border cursor-pointer ${
    active
      ? 'border-[#4A6AEE]/40 bg-[#4A6AEE]/10 text-wx-tx1'
      : 'border-wx-bd text-wx-txf hover:text-wx-tx2 hover:border-wx-bd'
  }`;

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-xl border border-wx-bd hover:border-wx-bd2"
      style={{
        background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)',
        boxShadow: 'var(--card-shad)',
        transition: 'background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
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
          style={{ background: 'rgba(74,106,238,0.1)', boxShadow: '0 0 0 1px rgba(74,106,238,0.18)' }}
        >
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold text-wx-tx1">{title}</h3>
      </div>
      <p className="text-[13px] text-wx-txm leading-snug ml-11">{subtitle}</p>
      <div className="mt-5 border-t border-wx-bd2" />
    </div>
  );
}

function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-xs text-wx-txf uppercase tracking-[0.12em] font-medium">{label}</span>
      {value && <span className="text-[12px] text-wx-txm tabular-nums">{value}</span>}
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border border-wx-bd2 p-4"
      style={{ background: 'var(--sf2)' }}
    >
      {children}
    </div>
  );
}

// ─── Tool 1: Rewax Interval Calculator ───────────────────────────────────────
function RewaxCalculator({ featured = false }: { featured?: boolean }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('trocken');
  const [terrain, setTerrain] = useState<'strasse' | 'gravel' | 'mtb'>('strasse');
  const [kmPerWeek, setKmPerWeek] = useState(100);

  const MAX_REWAX_WEEKS = 26; // ~6 months — wax oxidizes regardless of riding distance

  const interval = waxIntervals[weather][terrain];
  const rawWeeks = kmPerWeek > 0 ? Math.round(interval / kmPerWeek) : MAX_REWAX_WEEKS;
  const weeks = Math.min(rawWeeks, MAX_REWAX_WEEKS);
  const weeksCapped = rawWeeks > MAX_REWAX_WEEKS;

  const weatherOpts: { value: 'trocken' | 'gemischt' | 'nass'; label: string }[] = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts: { value: 'strasse' | 'gravel' | 'mtb'; label: string }[] = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];

  return (
    <ToolCard>
      {featured && (
        <div className="px-6 pt-5 pb-0">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(74,106,238,0.1)', color: '#4A6AEE', border: '1px solid rgba(74,106,238,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6AEE] animate-pulse inline-block" />
            {de ? 'Empfohlener Einstieg' : 'Recommended Start'}
          </span>
        </div>
      )}
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.rewax.title}
        subtitle={de ? 'Nie wieder zu früh oder zu spät — erhalte dein genaues Rewax-Intervall.' : 'Never too early or too late — get your exact rewax interval.'}
      />
      <div className={`px-6 pb-6 ${featured ? 'grid grid-cols-2 gap-8 items-start pt-2' : 'flex flex-col flex-1 gap-5'}`}>
        <div className="space-y-5">
          <div>
            <FieldLabel label={t.tools.rewax.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <button key={o.value} onClick={() => setWeather(o.value)} className={tog(weather === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.rewax.terrain} />
            <div className="flex flex-wrap gap-2">
              {terrainOpts.map(o => (
                <button key={o.value} onClick={() => setTerrain(o.value)} className={tog(terrain === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} />
            <Slider value={[kmPerWeek]} onValueChange={v => setKmPerWeek(v[0])} min={20} max={400} step={10} className="py-1" />
          </div>
        </div>

        <ResultBox>
          <p className="text-[42px] font-bold text-wx-tx1 text-center leading-none tracking-tight">
            <AnimatedNumber value={weeks} />
          </p>
          <p className="text-[13px] text-wx-txf text-center mt-1">
            {weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')} {de ? 'bis zum nächsten Rewaxen' : 'until next rewax'}
            {weeksCapped && <span className="text-wx-txff"> (max.)</span>}
          </p>
          <p className="text-[12px] text-wx-txm text-center mt-0.5">
            {interval} km · {de ? `bei ${kmPerWeek} km/Wo.` : `at ${kmPerWeek} km/wk`}
          </p>
          <p className="text-xs text-wx-txff text-center mt-3 leading-snug">
            {de ? 'Rewaxe wenn die Kette leise kratzt oder deutlich lauter läuft als gewohnt — das Wachs ist aufgebraucht.' : 'Re-wax when the chain starts scratching quietly or runs noticeably louder than usual — the wax is used up.'}
          </p>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 3: Wax Stock Calculator ────────────────────────────────────────────
function WaxStockCalculator() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [chainCount, setChainCount] = useState(2);
  const [kmPerMonth, setKmPerMonth] = useState(400);
  const [weather, setWeather] = useState<'trocken' | 'gemischt' | 'nass'>('gemischt');
  const [terrain, setTerrain] = useState<'strasse' | 'gravel' | 'mtb'>('strasse');

  const WAX_GRAMS_PER_APP = 15;
  const MAX_MONTHS = 30;

  const appsPerMonth = kmPerMonth / waxIntervals[weather][terrain];
  const waxPerMonth = appsPerMonth * WAX_GRAMS_PER_APP * chainCount;
  const tooLittle = waxPerMonth < 5;

  const months300 = tooLittle ? MAX_MONTHS : Math.min(Math.max(1, Math.round(300 / waxPerMonth)), MAX_MONTHS);
  const months500 = tooLittle ? MAX_MONTHS : Math.min(Math.max(1, Math.round(500 / waxPerMonth)), MAX_MONTHS);
  const cost300 = (22.95 / months300).toFixed(2);
  const cost500 = (29.95 / months500).toFixed(2);
  const rec = waxPerMonth > 80 ? '500' : parseFloat(cost500) < parseFloat(cost300) ? '500' : '300';

  const weatherOpts: { value: 'trocken' | 'gemischt' | 'nass'; label: string }[] = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts: { value: 'strasse' | 'gravel' | 'mtb'; label: string }[] = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];

  return (
    <ToolCard>
      <ToolHeader
        icon={<Package className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.stock.title}
        subtitle={de ? 'Bestell genau das richtige Paket — keine Verschwendung, kein Engpass.' : 'Order exactly the right amount — no waste, no shortfall.'}
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.stock.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <button key={o.value} onClick={() => setWeather(o.value)} className={tog(weather === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={de ? 'Gelände' : 'Terrain'} />
            <div className="flex flex-wrap gap-2">
              {terrainOpts.map(o => (
                <button key={o.value} onClick={() => setTerrain(o.value)} className={tog(terrain === o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.stock.chainCount} value={`${chainCount}`} />
            <Slider value={[chainCount]} onValueChange={v => setChainCount(v[0])} min={1} max={4} step={1} className="py-1" />
          </div>
          <div>
            <FieldLabel label={t.tools.stock.kmPerMonth} value={`${kmPerMonth} km`} />
            <Slider value={[kmPerMonth]} onValueChange={v => setKmPerMonth(v[0])} min={50} max={1200} step={50} className="py-1" />
          </div>
        </div>

        <ResultBox>
          {tooLittle ? (
            <>
              <p className="text-xs text-wx-txf uppercase tracking-[0.1em] mb-2">{de ? 'Empfehlung' : 'Recommendation'}</p>
              <p className="text-[13px] text-wx-txm leading-snug">
                {de ? 'Dein Verbrauch ist sehr niedrig — der 300g-Block reicht länger als seine Haltbarkeit (~2–3 Jahre). Die 300g genügen vollkommen.' : 'Your usage is very low — the 300g block lasts longer than its shelf life (~2–3 years). The 300g is more than enough.'}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-wx-txf uppercase tracking-[0.1em] mb-4">{de ? 'Empfohlene Packung' : 'Recommended Package'}</p>
              <div className="grid grid-cols-2 gap-2">
                {(['300', '500'] as const).map(size => {
                  const isRec = rec === size;
                  const months = size === '300' ? months300 : months500;
                  const cost = size === '300' ? cost300 : cost500;
                  const price = size === '300' ? '22,95' : '29,95';
                  const url = size === '300' ? 'https://www.ebay.de/itm/395811183957' : 'https://www.ebay.de/itm/395811184583';
                  return (
                    <a key={size} href={url} target="_blank" rel="noopener noreferrer">
                      <div
                        className="rounded-lg border p-3 text-center transition-all hover:border-[#4A6AEE]/40"
                        style={{
                          borderColor: isRec ? 'rgba(74,106,238,0.45)' : 'var(--bd)',
                          background: isRec ? 'rgba(74,106,238,0.08)' : 'transparent',
                        }}
                      >
                        {isRec && <p className="text-[11px] text-[#4A6AEE] uppercase tracking-[0.12em] mb-1">{de ? 'Empfohlen' : 'Recommended'}</p>}
                        <p className="text-[20px] font-bold text-wx-tx1 leading-none">~<AnimatedNumber value={months} /><span className="text-[12px] font-normal text-wx-txm ml-1">{de ? 'Mo.' : 'mo.'}</span></p>
                        <p className="text-xs text-wx-tx2 mt-1">{size}g — {price} €</p>
                        <p className="text-xs text-wx-txf mt-0.5">{cost} €/{de ? 'Monat' : 'month'}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
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

  return (
    <div ref={ref} className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
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
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [chainPrice, setChainPrice] = useState(45);

  const CASSETTE_PRICE = 80;
  const WAX_APP_COST = 1.5;
  const REWAX_INTERVAL = 500;

  const oilLubeCostPerYear = kmPerYear * (8 / (30 * 200)); // ≈ 0.00133 €/km

  const waxCost = Math.round(
    (kmPerYear / 9000) * chainPrice +
    (kmPerYear / 15000) * CASSETTE_PRICE +
    (kmPerYear / REWAX_INTERVAL) * WAX_APP_COST
  );
  const oilCost = Math.round(
    (kmPerYear / 2500) * chainPrice +
    (kmPerYear / 8000) * CASSETTE_PRICE +
    oilLubeCostPerYear
  );
  const savings = Math.max(0, oilCost - waxCost);
  const waxBarPct = Math.round((waxCost / Math.max(oilCost, 1)) * 100);

  return (
    <ToolCard>
      <ToolHeader
        icon={<PiggyBank className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={t.tools.savings.title}
        subtitle={de ? 'Sieh in Euro, wie viel Wachs vs. Kettenöl pro Jahr wirklich spart.' : 'See in euros how much wax vs. chain oil really saves per year.'}
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
          <p className="text-xs text-wx-txff leading-relaxed -mt-2">
            {de ? 'Kassette €80 · Wachskette 9.000km · Ölkette 2.500km · Wachsen €1,50/Session' : 'Cassette €80 · Wax chain 9,000km · Oil chain 2,500km · Waxing €1.50/session'}
          </p>
        </div>

        <ResultBox>
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs text-wx-tx2">{de ? 'Wachs' : 'Wax'}</span>
                <AnimatedNumber value={waxCost} suffix=" €" className="text-[13px] font-bold text-wx-tx1" />
              </div>
              <AnimatedBar pct={waxBarPct} color="linear-gradient(90deg, #4A68E8, #7090FF)" delay={0} />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs text-wx-txf">{de ? 'Kettenöl' : 'Chain oil'}</span>
                <AnimatedNumber value={oilCost} suffix=" €" className="text-[13px] font-bold text-wx-txf line-through decoration-wx-bd" />
              </div>
              <AnimatedBar pct={100} color="var(--sf3)" delay={150} />
            </div>
          </div>

          <div className="rounded-lg border border-[#4A6AEE]/20 p-3 text-center" style={{ background: 'rgba(74,106,238,0.06)' }}>
            <p className="text-xs text-[#4A6AEE] uppercase tracking-[0.14em] mb-1">{de ? 'Deine Ersparnis' : 'Your savings'}</p>
            <AnimatedNumber value={savings} prefix="+" suffix=" €" className="text-[36px] font-bold text-wx-tx1 leading-none tracking-tight" />
            <p className="text-xs text-wx-txf mt-0.5">{de ? 'pro Jahr' : 'per year'}</p>
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 5: Rotation ROI ─────────────────────────────────────────────────────
function RotationROI() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [showHow, setShowHow] = useState(false);

  const CHAIN_KM_1   = 6000;
  const CHAIN_KM_2   = 8500;
  const CASSETTE_KM_1 = 15000;
  const CASSETTE_KM_2 = 22000;
  const CHAIN_PRICE   = 45;
  const CASSETTE_PRICE = 80;
  const REWAX_KM      = 500;

  const chainMonths1  = Math.max(1, Math.round((CHAIN_KM_1 / kmPerYear) * 12));
  const chainMonths2  = Math.max(1, Math.round((CHAIN_KM_2 / kmPerYear) * 12));
  const cassetteYrs1  = parseFloat((CASSETTE_KM_1 / kmPerYear).toFixed(1));
  const cassetteYrs2  = parseFloat((CASSETTE_KM_2 / kmPerYear).toFixed(1));
  const chainGain     = chainMonths2 - chainMonths1;
  const cassetteGain  = parseFloat((cassetteYrs2 - cassetteYrs1).toFixed(1));
  const rewaxPerYear  = Math.ceil(kmPerYear / REWAX_KM);

  // 5-year total cost comparison
  const km5 = kmPerYear * 5;
  const cost1 = Math.round((km5 / CHAIN_KM_1) * CHAIN_PRICE + (km5 / CASSETTE_KM_1) * CASSETTE_PRICE);
  const cost2 = Math.round((km5 / CHAIN_KM_2) * CHAIN_PRICE + (km5 / CASSETTE_KM_2) * CASSETTE_PRICE);
  const savingsPerYear = Math.round((cost1 - cost2) / 5);
  const breakEvenMonths = savingsPerYear > 0 ? Math.round((CHAIN_PRICE / savingsPerYear) * 12) : 0;

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: '#8AAAFF' }} />}
        title={de ? 'Lohnen sich mehrere Ketten?' : 'Is rotating multiple chains worth it?'}
        subtitle={de ? 'Kettenverschleiß und Kassettenlaufzeit realistisch verglichen.' : 'Chain wear and cassette lifetime realistically compared.'}
      />
      <div className="px-6 flex flex-col flex-1 gap-4 pb-6">
        <div>
          <FieldLabel label={de ? 'km pro Jahr' : 'km per year'} value={`${kmPerYear} km`} />
          <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={10000} step={500} className="py-1" />
        </div>

        {/* Hero: annual savings */}
        <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(74,106,238,0.07)', border: '1px solid rgba(74,106,238,0.22)' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-wx-txf mb-2">{de ? 'Ersparnis pro Jahr' : 'Savings per year'}</p>
          <p className="text-[38px] font-bold tabular-nums leading-none" style={{ color: '#8AAAFF' }}>~<AnimatedNumber value={savingsPerYear} suffix=" €" /></p>
          <p className="text-xs text-wx-txf mt-1.5">
            {de ? `2. Kette amortisiert sich in ~${breakEvenMonths} Monaten` : `2nd chain pays off in ~${breakEvenMonths} months`}
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1 chain */}
          <div className="rounded-lg border border-wx-bd p-3 text-center" style={{ background: 'var(--sf3)' }}>
            <p className="text-xs text-wx-txff mb-2">{de ? '1 Kette' : '1 chain'}</p>
            <p className="text-[22px] font-bold text-wx-txm leading-none">{chainMonths1}</p>
            <p className="text-xs text-wx-txff mt-0.5">{de ? 'Mo. / Kette' : 'mo. / chain'}</p>
            <div className="mt-2.5 pt-2.5 border-t border-wx-bd2">
              <p className="text-[13px] font-semibold text-wx-txm">{cassetteYrs1} {de ? 'J.' : 'yr.'}</p>
              <p className="text-xs text-wx-txff mt-0.5">{de ? 'Kassette' : 'cassette'}</p>
            </div>
          </div>

          {/* 2 chains */}
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: 'rgba(74,106,238,0.38)', background: 'rgba(74,106,238,0.06)' }}>
            <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: '#4A6AEE' }}>{de ? 'Empfohlen' : 'Recommended'}</p>
            <p className="text-xs text-wx-txf mb-1.5">{de ? '2 Ketten' : '2 chains'}</p>
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-[22px] font-bold text-wx-tx1 leading-none">{chainMonths2}</p>
              {chainGain > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(74,106,238,0.18)', color: '#8AAAFF' }}>
                  +{chainGain} {de ? 'Mo.' : 'mo.'}
                </span>
              )}
            </div>
            <p className="text-xs text-wx-txf mt-0.5">{de ? 'Mo. / Kette' : 'mo. / chain'}</p>
            <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: 'rgba(74,106,238,0.2)' }}>
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[13px] font-semibold text-wx-tx1">{cassetteYrs2} {de ? 'J.' : 'yr.'}</p>
                {cassetteGain > 0 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(74,106,238,0.18)', color: '#8AAAFF' }}>
                    +{cassetteGain} {de ? 'J.' : 'yr.'}
                  </span>
                )}
              </div>
              <p className="text-xs text-wx-txf mt-0.5">{de ? 'Kassette' : 'cassette'}</p>
            </div>
          </div>
        </div>

        {/* Honest note */}
        <p className="text-xs text-wx-txff text-center -mt-1">
          {de ? `Rewax-Frequenz bleibt gleich: ~${rewaxPerYear}× pro Jahr — du wechselst nur ab.` : `Rewax frequency stays the same: ~${rewaxPerYear}× per year — you just alternate.`}
        </p>

        {/* Expandable: how it works */}
        <div className="rounded-lg border border-wx-bd overflow-hidden" style={{ background: 'var(--sf3)' }}>
          <button
            type="button"
            onClick={() => setShowHow(v => !v)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-wx-txf hover:text-wx-tx2 transition-colors"
          >
            <span className="text-xs font-medium">{de ? 'Wie funktioniert das?' : 'How does this work?'}</span>
            <span
              className="text-xs transition-transform duration-[320ms] inline-block"
              style={{ transform: showHow ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >↓</span>
          </button>
          <div
            className="overflow-hidden transition-[grid-template-rows,opacity] duration-[320ms]"
            style={{
              display: 'grid',
              gridTemplateRows: showHow ? '1fr' : '0fr',
              opacity: showHow ? 1 : 0,
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-3 border-t border-wx-bd2 space-y-2">
                <p className="text-xs text-wx-txm leading-relaxed">
                  {de ? 'Beim Abwechseln zwischen zwei Ketten trägt sich jede Kette nur halb so schnell ab — sie hält dadurch ~40 % länger. Da die Kassette durch Kettendehnung verschleißt, lebt auch sie deutlich länger.' : 'Alternating between two chains means each chain wears at half the rate — lasting ~40% longer. Since the cassette wears through chain stretch, it lasts significantly longer too.'}
                </p>
                <p className="text-xs text-wx-txf leading-relaxed">
                  {de ? 'Du rewaxst genauso oft (die Strecke pro Rewax bleibt gleich), wechselst aber die Kette ab. Ergebnis: weniger Ketten kaufen, viel seltener Kassette wechseln.' : 'You re-wax just as often (the distance per rewax stays the same), but alternate the chain. Result: fewer chains to buy, much less frequent cassette replacement.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full rounded-lg border border-[#4A6AEE]/25 p-2.5 text-center hover:border-[#4A6AEE]/45 transition-colors"
          style={{ background: 'rgba(74,106,238,0.05)' }}
        >
          <span className="text-[12px] font-medium" style={{ color: '#8AAAFF' }}>{de ? '2. Kette im Shop ansehen →' : 'View 2nd chain in shop →'}</span>
        </button>
      </div>
    </ToolCard>
  );
}

// ─── Reveal wrapper ──────────────────────────────────────────────────────────
function RevealSlot({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { ref } = useScrollReveal(delay);
  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const TAB_LABELS = useMemo(() =>
    de ? ['Intervall', 'Vorrat', 'Ersparnis', 'Rotation']
       : ['Interval', 'Stock', 'Savings', 'Rotation'],
  [de]);
  const [activeTab, setActiveTab] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabPillRef = useRef<HTMLDivElement>(null);

  // Initialize pill position on mount (instant, no animation)
  useEffect(() => {
    const btn = tabButtonRefs.current[activeTab];
    const bar = tabBarRef.current;
    const pill = tabPillRef.current;
    if (!btn || !bar || !pill) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.set(pill, { x: btnRect.left - barRect.left, width: btnRect.width });
  }, []); // eslint-disable-line

  // Animate pill on tab change
  useEffect(() => {
    const idx = TAB_LABELS.indexOf(TAB_LABELS[activeTab]);
    const btn = tabButtonRefs.current[idx];
    const bar = tabBarRef.current;
    const pill = tabPillRef.current;
    if (!btn || !bar || !pill) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.to(pill, {
      x: btnRect.left - barRect.left,
      width: btnRect.width,
      duration: 0.38,
      ease: 'power3.inOut',
      overwrite: 'auto',
    });
  }, [activeTab, TAB_LABELS]);

  // Recalculate pill position on window/container resize
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => {
      const btn = tabButtonRefs.current[activeTab];
      const pill = tabPillRef.current;
      if (!btn || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: btnRect.left - barRect.left, width: btnRect.width });
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, [activeTab, TAB_LABELS]);

  const toolComponents = useMemo(() => [
    <RewaxCalculator />,
    <WaxStockCalculator />,
    <CostSavingsCalculator />,
    <RotationROI />,
  ], []);

  return (
    <section id="tools" className="relative py-24" style={{ background: 'var(--tool-bg)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div ref={headerRef} className="text-center mb-16">
            <span data-reveal="eyebrow" className="section-eyebrow mb-4 block">
              {de ? 'Planungs-Tools' : 'Planning Tools'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal text={t.tools.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2 max-w-xl mx-auto text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          {/* ── Mobile: tab switcher (one tool at a time) ── */}
          <div className="md:hidden">
            <div
              ref={tabBarRef}
              className="relative flex gap-1 p-1 rounded-xl border border-wx-bd mb-5 overflow-x-auto"
              style={{ background: 'var(--sf2)' }}
            >
              <div
                ref={tabPillRef}
                className="absolute top-1 bottom-1 rounded-full bg-[#4A6AEE] pointer-events-none"
                style={{ width: 0 }}
              />
              {TAB_LABELS.map((label, i) => (
                <button
                  key={i}
                  ref={el => { tabButtonRefs.current[i] = el; }}
                  onClick={() => setActiveTab(i)}
                  className={`relative z-10 flex-1 min-w-[60px] px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeTab === i ? 'text-white' : 'text-wx-txf hover:text-wx-tx2'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {toolComponents.map((comp, i) => (
              <div key={i} style={{ display: activeTab === i ? 'block' : 'none' }}>
                {comp}
              </div>
            ))}
          </div>

          {/* ── Desktop: 1 featured + 3-col ── */}
          <div className="hidden md:block space-y-4">
            {/* Featured — full width */}
            <RevealSlot delay={0}>
              <RewaxCalculator featured />
            </RevealSlot>
            {/* Secondary tools — 3 col */}
            <div className="grid md:grid-cols-3 gap-4 items-stretch">
              <RevealSlot delay={90}><WaxStockCalculator /></RevealSlot>
              <RevealSlot delay={180}><CostSavingsCalculator /></RevealSlot>
              <RevealSlot delay={270}><RotationROI /></RevealSlot>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom gradient — bridges to Guides below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--sf))', zIndex: 1 }}
      />
    </section>
  );
}
