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

// ─── Toggle button — premium dark/white style ────────────────────────────────
function TogButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer"
      style={{
        border: `1px solid ${active ? 'rgba(255,255,255,0.13)' : 'transparent'}`,
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.30)',
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </button>
  );
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────
function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-2xl"
      style={{
        background: '#0d0d10',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Tool header ─────────────────────────────────────────────────────────────
function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-6 pb-5">
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {title}
          </h3>
          <p className="text-[12px] leading-snug mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

// ─── Field label ─────────────────────────────────────────────────────────────
function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2.5">
      <span
        className="text-[11px] uppercase tracking-[0.1em] font-medium"
        style={{ color: 'rgba(255,255,255,0.32)' }}
      >
        {label}
      </span>
      {value && (
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.72)' }}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Result inset box ────────────────────────────────────────────────────────
function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
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

  const MAX_REWAX_WEEKS = 26;

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

  const hint = de
    ? 'Rewaxe wenn die Kette leise kratzt oder deutlich lauter läuft als gewohnt — das Wachs ist aufgebraucht.'
    : 'Re-wax when the chain starts scratching quietly or runs noticeably louder than usual — the wax is used up.';

  return (
    <ToolCard>
      {featured && (
        <div className="px-6 pt-5 pb-0">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(43,82,176,0.1)', color: '#2B52B0', border: '1px solid rgba(43,82,176,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B52B0] animate-pulse inline-block" />
            {de ? 'Empfohlener Einstieg' : 'Recommended Start'}
          </span>
        </div>
      )}
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.55)' }} />}
        title={t.tools.rewax.title}
        subtitle={de
          ? 'Nie wieder zu früh oder zu spät — erhalte dein genaues Rewax-Intervall.'
          : 'Never too early or too late — get your exact rewax interval.'}
      />

      {featured ? (
        /* ── Featured: 3-col inputs + full-width result ── */
        <div className="px-6 pb-6 pt-2 space-y-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Weather */}
            <div>
              <FieldLabel label={t.tools.rewax.weather} />
              <div className="flex flex-col gap-1.5 mt-1">
                {weatherOpts.map(o => (
                  <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                    {o.label}
                  </TogButton>
                ))}
              </div>
            </div>
            {/* Terrain */}
            <div>
              <FieldLabel label={t.tools.rewax.terrain} />
              <div className="flex flex-col gap-1.5 mt-1">
                {terrainOpts.map(o => (
                  <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                    {o.label}
                  </TogButton>
                ))}
              </div>
            </div>
            {/* km/week */}
            <div>
              <FieldLabel label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} />
              <Slider
                value={[kmPerWeek]}
                onValueChange={v => setKmPerWeek(v[0])}
                min={20} max={400} step={10}
                className="py-1 mt-3"
              />
              <div className="flex justify-between mt-2">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>20 km</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>400 km</span>
              </div>
            </div>
          </div>

          <ResultBox>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[56px] font-bold text-white leading-none tabular-nums">
                  <AnimatedNumber value={weeks} />
                </p>
                <p className="mt-1.5 text-[14px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')}{' '}
                  {de ? 'bis zum nächsten Rewaxen' : 'until next rewax'}
                  {weeksCapped && <span style={{ color: 'rgba(255,255,255,0.2)' }}> (max.)</span>}
                </p>
              </div>
              <div className="text-right pb-0.5">
                <p className="text-[13px] tabular-nums" style={{ color: 'rgba(255,255,255,0.32)' }}>
                  {interval} km
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {de ? `bei ${kmPerWeek} km/Wo.` : `at ${kmPerWeek} km/wk`}
                </p>
              </div>
            </div>
            <p
              className="text-[12px] mt-4 pt-3 leading-relaxed"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.22)' }}
            >
              {hint}
            </p>
          </ResultBox>
        </div>
      ) : (
        /* ── Non-featured: vertical stack ── */
        <div className="px-6 pb-6 flex flex-col flex-1 gap-5">
          <div className="space-y-5 flex-1">
            <div>
              <FieldLabel label={t.tools.rewax.weather} />
              <div className="flex flex-wrap gap-1.5">
                {weatherOpts.map(o => (
                  <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                    {o.label}
                  </TogButton>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel label={t.tools.rewax.terrain} />
              <div className="flex flex-wrap gap-1.5">
                {terrainOpts.map(o => (
                  <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                    {o.label}
                  </TogButton>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} />
              <Slider
                value={[kmPerWeek]}
                onValueChange={v => setKmPerWeek(v[0])}
                min={20} max={400} step={10}
                className="py-1"
              />
            </div>
          </div>

          <ResultBox>
            <p className="text-[46px] font-bold text-white text-center leading-none tabular-nums">
              <AnimatedNumber value={weeks} />
            </p>
            <p className="text-[13px] text-center mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')}{' '}
              {de ? 'bis zum nächsten Rewaxen' : 'until next rewax'}
              {weeksCapped && <span style={{ color: 'rgba(255,255,255,0.2)' }}> (max.)</span>}
            </p>
            <p className="text-[12px] text-center mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {interval} km · {de ? `bei ${kmPerWeek} km/Wo.` : `at ${kmPerWeek} km/wk`}
            </p>
            <p
              className="text-[11px] text-center mt-3 pt-3 leading-snug"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}
            >
              {hint}
            </p>
          </ResultBox>
        </div>
      )}
    </ToolCard>
  );
}

// ─── Tool 2: Wax Stock Calculator ────────────────────────────────────────────
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
        icon={<Package className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.55)' }} />}
        title={t.tools.stock.title}
        subtitle={de
          ? 'Bestell genau das richtige Paket — keine Verschwendung, kein Engpass.'
          : 'Order exactly the right amount — no waste, no shortfall.'}
      />
      <div className="px-6 flex flex-col flex-1 gap-5 pb-6">
        <div className="space-y-5 flex-1">
          <div>
            <FieldLabel label={t.tools.stock.weather} />
            <div className="flex flex-wrap gap-1.5">
              {weatherOpts.map(o => (
                <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={de ? 'Gelände' : 'Terrain'} />
            <div className="flex flex-wrap gap-1.5">
              {terrainOpts.map(o => (
                <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                  {o.label}
                </TogButton>
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
              <p
                className="text-[11px] uppercase tracking-[0.1em] mb-2"
                style={{ color: 'rgba(255,255,255,0.32)' }}
              >
                {de ? 'Empfehlung' : 'Recommendation'}
              </p>
              <p className="text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {de
                  ? 'Dein Verbrauch ist sehr niedrig — der 300g-Block reicht länger als seine Haltbarkeit (~2–3 Jahre). Die 300g genügen vollkommen.'
                  : 'Your usage is very low — the 300g block lasts longer than its shelf life (~2–3 years). The 300g is more than enough.'}
              </p>
            </>
          ) : (
            <>
              <p
                className="text-[11px] uppercase tracking-[0.1em] mb-3"
                style={{ color: 'rgba(255,255,255,0.32)' }}
              >
                {de ? 'Empfohlene Packung' : 'Recommended Package'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['300', '500'] as const).map(size => {
                  const isRec = rec === size;
                  const months = size === '300' ? months300 : months500;
                  const cost = size === '300' ? cost300 : cost500;
                  const price = size === '300' ? '22,95' : '29,95';
                  const url = size === '300'
                    ? 'https://www.ebay.de/itm/395811183957'
                    : 'https://www.ebay.de/itm/395811184583';
                  return (
                    <a key={size} href={url} target="_blank" rel="noopener noreferrer">
                      <div
                        className="rounded-xl border p-3.5 text-center transition-all"
                        style={{
                          borderColor: isRec ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
                          background: isRec ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)',
                        }}
                      >
                        {isRec && (
                          <p
                            className="text-[10px] uppercase tracking-[0.14em] mb-1.5"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                          >
                            {de ? 'Empfohlen' : 'Recommended'}
                          </p>
                        )}
                        <p className="text-[22px] font-bold text-white leading-none tabular-nums">
                          ~<AnimatedNumber value={months} />
                          <span className="text-[12px] font-normal ml-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                            {de ? 'Mo.' : 'mo.'}
                          </span>
                        </p>
                        <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.48)' }}>
                          {size}g — {price} €
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.26)' }}>
                          {cost} €/{de ? 'Monat' : 'month'}
                        </p>
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

// ─── Tool 3: Cost Savings Calculator ─────────────────────────────────────────
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
    <div ref={ref} className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full w-full rounded-full"
        style={{
          background: color,
          transform: `scaleX(${width / 100})`,
          transformOrigin: 'left center',
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

  const oilLubeCostPerYear = kmPerYear * (8 / (30 * 200));

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
        icon={<PiggyBank className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.55)' }} />}
        title={t.tools.savings.title}
        subtitle={de
          ? 'Sieh in Euro, wie viel Wachs vs. Kettenöl pro Jahr wirklich spart.'
          : 'See in euros how much wax vs. chain oil really saves per year.'}
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
          <p className="text-[11px] leading-relaxed -mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {de
              ? 'Kassette €80 · Wachskette 9.000km · Ölkette 2.500km · Wachsen €1,50/Session'
              : 'Cassette €80 · Wax chain 9,000km · Oil chain 2,500km · Waxing €1.50/session'}
          </p>
        </div>

        <ResultBox>
          <div className="space-y-3.5 mb-4">
            {/* Wax bar */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {de ? 'Wachs' : 'Wax'}
                </span>
                <AnimatedNumber
                  value={waxCost}
                  suffix=" €"
                  className="text-[13px] font-bold text-white tabular-nums"
                />
              </div>
              <AnimatedBar pct={waxBarPct} color="rgba(255,255,255,0.6)" delay={0} />
            </div>
            {/* Oil bar */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {de ? 'Kettenöl' : 'Chain oil'}
                </span>
                <AnimatedNumber
                  value={oilCost}
                  suffix=" €"
                  className="text-[13px] font-bold tabular-nums line-through"
                  style={{ color: 'rgba(255,255,255,0.28)', textDecorationColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
              <AnimatedBar pct={100} color="rgba(255,255,255,0.14)" delay={150} />
            </div>
          </div>

          {/* Savings box */}
          <div
            className="rounded-lg p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.14em] mb-1.5"
              style={{ color: 'rgba(255,255,255,0.32)' }}
            >
              {de ? 'Deine Ersparnis' : 'Your savings'}
            </p>
            <AnimatedNumber
              value={savings}
              prefix="+"
              suffix=" €"
              className="text-[38px] font-bold text-white leading-none tracking-tight tabular-nums"
            />
            <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {de ? 'pro Jahr' : 'per year'}
            </p>
          </div>
        </ResultBox>
      </div>
    </ToolCard>
  );
}

// ─── Tool 4: Rotation ROI ─────────────────────────────────────────────────────
function RotationROI() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [kmPerYear, setKmPerYear] = useState(5000);
  const [showHow, setShowHow] = useState(false);

  const CHAIN_KM_1    = 6000;
  const CHAIN_KM_2    = 8500;
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

  const km5 = kmPerYear * 5;
  const cost1 = Math.round((km5 / CHAIN_KM_1) * CHAIN_PRICE + (km5 / CASSETTE_KM_1) * CASSETTE_PRICE);
  const cost2 = Math.round((km5 / CHAIN_KM_2) * CHAIN_PRICE + (km5 / CASSETTE_KM_2) * CASSETTE_PRICE);
  const savingsPerYear = Math.round((cost1 - cost2) / 5);
  const breakEvenMonths = savingsPerYear > 0 ? Math.round((CHAIN_PRICE / savingsPerYear) * 12) : 0;

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.55)' }} />}
        title={de ? 'Lohnen sich mehrere Ketten?' : 'Is rotating multiple chains worth it?'}
        subtitle={de
          ? 'Kettenverschleiß und Kassettenlaufzeit realistisch verglichen.'
          : 'Chain wear and cassette lifetime realistically compared.'}
      />
      <div className="px-6 flex flex-col flex-1 gap-4 pb-6">
        <div>
          <FieldLabel label={de ? 'km pro Jahr' : 'km per year'} value={`${kmPerYear} km`} />
          <Slider value={[kmPerYear]} onValueChange={v => setKmPerYear(v[0])} min={1000} max={10000} step={500} className="py-1" />
        </div>

        {/* Hero: annual savings */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.2em] mb-2"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {de ? 'Ersparnis pro Jahr' : 'Savings per year'}
          </p>
          <p className="text-[40px] font-bold tabular-nums leading-none text-white">
            ~<AnimatedNumber value={savingsPerYear} suffix=" €" />
          </p>
          <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {de
              ? `2. Kette amortisiert sich in ~${breakEvenMonths} Monaten`
              : `2nd chain pays off in ~${breakEvenMonths} months`}
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1 chain */}
          <div
            className="rounded-xl border p-3.5 text-center"
            style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <p className="text-[11px] mb-2.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {de ? '1 Kette' : '1 chain'}
            </p>
            <p className="text-[24px] font-bold leading-none tabular-nums" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {chainMonths1}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.24)' }}>
              {de ? 'Mo. / Kette' : 'mo. / chain'}
            </p>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[14px] font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {cassetteYrs1} {de ? 'J.' : 'yr.'}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.24)' }}>
                {de ? 'Kassette' : 'cassette'}
              </p>
            </div>
          </div>

          {/* 2 chains — recommended */}
          <div
            className="rounded-xl border p-3.5 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.14)' }}
          >
            <p
              className="text-[10px] uppercase tracking-wider mb-0.5"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {de ? 'Empfohlen' : 'Recommended'}
            </p>
            <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {de ? '2 Ketten' : '2 chains'}
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-[24px] font-bold text-white leading-none tabular-nums">{chainMonths2}</p>
              {chainGain > 0 && (
                <span
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}
                >
                  +{chainGain} {de ? 'Mo.' : 'mo.'}
                </span>
              )}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {de ? 'Mo. / Kette' : 'mo. / chain'}
            </p>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[14px] font-semibold text-white tabular-nums">
                  {cassetteYrs2} {de ? 'J.' : 'yr.'}
                </p>
                {cassetteGain > 0 && (
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}
                  >
                    +{cassetteGain} {de ? 'J.' : 'yr.'}
                  </span>
                )}
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {de ? 'Kassette' : 'cassette'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.22)' }}>
          {de
            ? `Rewax-Frequenz bleibt gleich: ~${rewaxPerYear}× pro Jahr — du wechselst nur ab.`
            : `Rewax frequency stays the same: ~${rewaxPerYear}× per year — you just alternate.`}
        </p>

        {/* Expandable: how it works */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            type="button"
            onClick={() => setShowHow(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between transition-colors"
          >
            <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {de ? 'Wie funktioniert das?' : 'How does this work?'}
            </span>
            <span
              className="text-[12px] transition-transform duration-[320ms] inline-block"
              style={{
                transform: showHow ? 'rotate(180deg)' : 'rotate(0deg)',
                color: 'rgba(255,255,255,0.28)',
              }}
            >
              ↓
            </span>
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
              <div
                className="px-4 pb-4 pt-3 space-y-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {de
                    ? 'Beim Abwechseln zwischen zwei Ketten trägt sich jede Kette nur halb so schnell ab — sie hält dadurch ~40 % länger. Da die Kassette durch Kettendehnung verschleißt, lebt auch sie deutlich länger.'
                    : 'Alternating between two chains means each chain wears at half the rate — lasting ~40% longer. Since the cassette wears through chain stretch, it lasts significantly longer too.'}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {de
                    ? 'Du rewaxst genauso oft (die Strecke pro Rewax bleibt gleich), wechselst aber die Kette ab. Ergebnis: weniger Ketten kaufen, viel seltener Kassette wechseln.'
                    : 'You re-wax just as often (the distance per rewax stays the same), but alternate the chain. Result: fewer chains to buy, much less frequent cassette replacement.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full rounded-xl p-3 text-center transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {de ? '2. Kette im Shop ansehen →' : 'View 2nd chain in shop →'}
          </span>
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

  // Initialize pill position — defer to rAF so layout is stable (avoids width:0 flash)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const btn = tabButtonRefs.current[0];
      const bar = tabBarRef.current;
      const pill = tabPillRef.current;
      if (!btn || !bar || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: btnRect.left - barRect.left, width: btnRect.width });
    });
    return () => cancelAnimationFrame(frame);
  }, []); // eslint-disable-line

  // Animate pill on tab change
  useEffect(() => {
    const btn = tabButtonRefs.current[activeTab];
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

  // Recalculate pill on resize — stable ref tracks active tab so deps stay []
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => {
      const btn = tabButtonRefs.current[activeTabRef.current];
      const pill = tabPillRef.current;
      if (!btn || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: btnRect.left - barRect.left, width: btnRect.width });
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []); // eslint-disable-line

  return (
    <section id="tools" className="relative py-24" style={{ background: 'var(--tool-bg)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div ref={headerRef} className="text-center mb-16">
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
              className="relative flex gap-1 p-1 rounded-xl mb-5 overflow-x-auto"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                ref={tabPillRef}
                className="absolute top-1 bottom-1 rounded-lg pointer-events-none"
                style={{ width: 0, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              {TAB_LABELS.map((label, i) => (
                <button
                  key={i}
                  ref={el => { tabButtonRefs.current[i] = el; }}
                  onClick={() => setActiveTab(i)}
                  className="relative z-10 flex-1 min-w-[60px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  style={{ color: activeTab === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)' }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Conditional render per tab — unmount/remount ensures scroll-triggered
                 animations (like AnimatedBar IntersectionObserver) fire correctly */}
            {activeTab === 0 && <RewaxCalculator />}
            {activeTab === 1 && <WaxStockCalculator />}
            {activeTab === 2 && <CostSavingsCalculator />}
            {activeTab === 3 && <RotationROI />}
          </div>

          {/* ── Desktop: 1 featured + 3-col ── */}
          <div className="hidden md:block space-y-4">
            <RevealSlot delay={0}>
              <RewaxCalculator featured />
            </RevealSlot>
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
