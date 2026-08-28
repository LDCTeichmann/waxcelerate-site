import { useState, useEffect, useRef, useMemo } from 'react';
import { Calculator, Package, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useSectionReveal } from '@/hooks/useAnimation';
import { waxIntervals, products } from '@/lib/data';
import { type Weather, type Terrain, loadRidingProfile, saveRidingProfile } from '@/lib/ridingProfile';
import { gsap } from '@/lib/gsap';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { AnimatedNumber } from '@/components/viz';
import { Section } from '@/components/Section';


// ─── Toggle button — blue accent active state ────────────────────────────────
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
      // Visible pill stays compact (that's the point of the chip look), but
      // the tappable area is padded out to the project's own 44px minimum
      // (Mobile-Plan B5) via an invisible after: pseudo-element — the same
      // technique already used for the swipe-dot indicators below.
      className={`relative px-4 py-2 rounded-xl text-[13px] transition-all cursor-pointer after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-11 after:h-11${active ? ' chip-active' : ''}`}
      style={{
        border: active ? undefined : '1px solid var(--tog-bd)',
        background: active ? undefined : 'var(--tog-bg)',
        color: active ? 'var(--tx1)' : 'var(--tog-fg)',
        fontWeight: active ? 500 : 400,
        boxShadow: 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────
// No backdrop-filter here: var(--card-bg) is a fully opaque gradient (see
// index.css), so blurring whatever sits behind an opaque card is invisible —
// pure wasted compositing work (and, with 5 of these cards on the page, a
// likely source of the scroll/render jank reported around this section).
function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-3xl"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--bd)',
        boxShadow: 'var(--card-shad)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Tool header ─────────────────────────────────────────────────────────────
function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-3 pb-2.5 sm:pt-5 sm:pb-4">
      <div className="flex items-start gap-3 mb-2.5 sm:mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>
            {title}
          </h3>
          {/* Hidden below sm: on a swipeable mobile tab, the tab label plus
              this title already say what the card is — the subtitle is
              context that desktop's roomier deck can afford but a
              one-screen mobile card can't, per the fit-in-one-screen ask. */}
          <p className="hidden sm:block text-[12px] leading-snug mt-0.5" style={{ color: 'var(--txf)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: 'var(--inset-bd)' }} />
    </div>
  );
}

// ─── Field label ─────────────────────────────────────────────────────────────
function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5 sm:mb-2.5">
      <span
        className="text-meta uppercase tracking-[0.1em] font-medium"
        style={{ color: 'var(--txf)' }}
      >
        {label}
      </span>
      {value && (
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--tx2)' }}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Distance slider — FieldLabel + Slider pairing, shared so Tab 1's
// km/week and Tab 3's km/year stay visually identical by construction ───────
function DistanceSlider({ label, valueLabel, value, onValueChange, min, max, step, ariaLabel }: {
  label: string;
  valueLabel: string;
  value: number;
  onValueChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
}) {
  return (
    <div>
      <FieldLabel label={label} value={valueLabel} />
      <Slider
        value={[value]}
        onValueChange={v => onValueChange(v[0])}
        min={min} max={max} step={step}
        className="py-1"
        aria-label={ariaLabel}
      />
    </div>
  );
}

// ─── Shared CTA button — consistent across all tools ────────────────────────
function ToolCTA({ onClick, href, children }: {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    background: 'var(--inset-bg)',
    border: '1px solid var(--brand)',
  };
  const className = "w-full rounded-xl py-2.5 px-4 text-center transition-opacity hover:opacity-70 active:opacity-50 cursor-pointer";
  const inner = (
    <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
      {children}
    </span>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`block ${className}`} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}

function parseWaxedStamp(raw: string | null): Date | null {
  const s = (raw || '').trim();
  if (!s) return null;
  let y = 0, mo = 0, day = 0;
  if (/^\d{8}$/.test(s)) {
    y = Number(s.slice(0, 4));
    mo = Number(s.slice(4, 6));
    day = Number(s.slice(6, 8));
  } else {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    y = Number(m[1]); mo = Number(m[2]); day = Number(m[3]);
  }
  const dt = new Date(y, mo - 1, day);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== day) return null;
  const earliest = new Date(2020, 0, 1);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dt < earliest || dt > today) return null;
  return dt;
}

function waxedStampFromLocation(): Date | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const fromQ = parseWaxedStamp(q.get('w') || q.get('waxed'));
  if (fromQ) return fromQ;
  const h = (window.location.hash || '').replace(/^#/, '');
  const m = h.match(/(?:^|[?&])w=(\d{8}|\d{4}-\d{2}-\d{2})/) || h.match(/^(\d{8})$/);
  return parseWaxedStamp(m ? m[1] : null);
}

function addWeeks(base: Date, weeks: number): Date {
  const x = new Date(base.getTime());
  x.setDate(x.getDate() + weeks * 7);
  return x;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MAX_REWAX_WEEKS = 26;

// ─── Shared riding profile — one source of truth for all three calculators ──
// Weather, terrain, weekly distance and last-waxed date used to disagree
// across tabs (Tab 2 had its own implied km/week, Tab 3 hardcoded a fixed
// 300km interval) — this hook is the single place that now owns them, passed
// down as one `profile` prop instead of three independent useState calls.
function useToolsProfile() {
  // Seeded from localStorage (if a returning visitor already used this
  // calculator before) so the product detail page can read the same values
  // read-only and show a personalized estimate — see src/lib/ridingProfile.ts.
  // lastWaxedDate is deliberately NOT persisted: it already has its own
  // one-way URL-seeding (?w=YYYYMMDD, below) for a specific QR-link flow, and
  // persisting it would mean a stale date silently reappearing weeks later.
  const [weather, setWeather] = useState<Weather>(() => loadRidingProfile()?.weather ?? 'trocken');
  const [terrain, setTerrain] = useState<Terrain>(() => loadRidingProfile()?.terrain ?? 'strasse');
  const [kmPerWeek, setKmPerWeek] = useState(() => loadRidingProfile()?.kmPerWeek ?? 100);
  const [lastWaxedDate, setLastWaxedDate] = useState<Date | null>(() => waxedStampFromLocation());

  useEffect(() => {
    saveRidingProfile({ weather, terrain, kmPerWeek });
  }, [weather, terrain, kmPerWeek]);

  const interval = waxIntervals[weather][terrain];
  const rawWeeks = kmPerWeek > 0 ? Math.round(interval / kmPerWeek) : MAX_REWAX_WEEKS;
  const weeks = Math.min(rawWeeks, MAX_REWAX_WEEKS);
  const weeksCapped = rawWeeks > MAX_REWAX_WEEKS;

  return {
    weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek,
    lastWaxedDate, setLastWaxedDate, interval, weeks, weeksCapped,
  };
}
type ToolsProfile = ReturnType<typeof useToolsProfile>;

// Compact read-only readout of the shared profile, shown inside Tab 2/3 on
// both mobile (swipe) and the desktop deck — either way, only one card is
// visible at a time, so a visitor on Tab 2/3 hasn't necessarily seen Tab 1's
// controls. Surfaces what's driving their result plus a way to jump back.
function ProfileReadout({ profile, onJump }: { profile: ToolsProfile; onJump: () => void }) {
  const { t } = useLanguage();
  const weatherLabel = { trocken: t.tools.rewax.dry, gemischt: t.tools.rewax.mixed, nass: t.tools.rewax.wet }[profile.weather];
  const terrainLabel = { strasse: t.tools.rewax.road, gravel: t.tools.rewax.gravel, mtb: t.tools.rewax.mtb }[profile.terrain];
  return (
    <button
      onClick={onJump}
      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-left transition-opacity hover:opacity-80 cursor-pointer"
      style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)' }}
    >
      <span className="text-[12px] truncate" style={{ color: 'var(--txf)' }}>
        {weatherLabel} · {terrainLabel} · {profile.kmPerWeek} {t.tools.profile.kmSuffix}
      </span>
      <span className="text-[12px] font-medium flex-shrink-0" style={{ color: 'var(--brand)' }}>
        {t.tools.profile.jumpToInterval}
      </span>
    </button>
  );
}

// ─── Tool 1: Rewax Interval Calculator ───────────────────────────────────────
function RewaxCalculator({ profile }: { profile: ToolsProfile }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const { weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek,
          lastWaxedDate, setLastWaxedDate, interval, weeks, weeksCapped } = profile;

  const weatherOpts: { value: Weather; label: string }[] = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts: { value: Terrain; label: string }[] = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];

  // Quick-pick presets instead of forcing the native calendar picker open by
  // default — that popup's own chrome can't be restyled in any browser, so
  // most visitors never need to see it. "Heute" maps to `null`, preserving
  // the existing `lastWaxedDate ?? new Date()` semantics used everywhere else.
  // Exactly 3, matching the weather/terrain rows above it — one consistent
  // rhythm down the card instead of an odd 4th chip wrapping to its own row.
  // Anything further back than 2 weeks goes through "Genaues Datum" instead.
  const today = new Date();
  const datePresets: { key: string; date: Date | null; label: string }[] = [
    { key: 'today', date: null, label: t.tools.rewax.lastWaxedToday },
    { key: '1w', date: addWeeks(today, -1), label: t.tools.rewax.lastWaxed1Week },
    { key: '2w', date: addWeeks(today, -2), label: t.tools.rewax.lastWaxed2Weeks },
  ];
  const isPresetActive = (presetDate: Date | null) =>
    presetDate === null
      ? lastWaxedDate === null
      : lastWaxedDate !== null && isoDate(lastWaxedDate) === isoDate(presetDate);

  // Lazy init (not an effect): only decide once, at mount, whether the
  // current date already matches a preset. An effect keyed on lastWaxedDate
  // would re-run on every change and fight a user who manually collapses
  // this panel after picking their own exact date — this still auto-expands
  // correctly for a QR-seeded date that doesn't match any preset.
  const [customDateOpen, setCustomDateOpen] = useState(() =>
    lastWaxedDate !== null && !datePresets.some(p => p.date !== null && isoDate(p.date) === isoDate(lastWaxedDate))
  );

  const goToWax = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'wax' }));
  };

  const rewaxDate = useMemo(() => {
    const origin = lastWaxedDate ?? new Date();
    return addWeeks(origin, weeks).toLocaleDateString(de ? 'de-DE' : 'en-GB', {
      day: 'numeric', month: 'long',
    });
  }, [weeks, de, lastWaxedDate]);
  const waxedLabel = lastWaxedDate
    ? lastWaxedDate.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const SEP = <div style={{ borderTop: '1px solid var(--inset-bd)' }} />;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.rewax.title}
        subtitle={de
          ? 'Nie wieder zu früh oder zu spät — erhalte dein genaues Rewax-Intervall.'
          : 'Never too early or too late — get your exact rewax interval.'}
      />
      <div className="flex flex-col flex-1">

        {/* Hero result — always visible, updates live as parameters change below */}
        <div className="px-6 pt-2.5 pb-2 sm:pt-4 sm:pb-4 text-center flex flex-col items-center">
          <div className="flex items-baseline justify-center gap-2 mb-1 sm:mb-2">
            <span className="text-[40px] sm:text-[56px] font-bold leading-none tabular-nums" style={{ color: 'var(--tx1)' }}>
              <AnimatedNumber value={weeks} />
            </span>
            <span className="text-[18px] sm:text-[22px] font-semibold leading-none" style={{ color: 'var(--tx2)' }}>
              {weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')}
              {weeksCapped && <span className="text-[14px]" style={{ color: 'var(--txm)' }}> max.</span>}
            </span>
          </div>
          {/* Hidden below sm: implied by the card title right above it, and
              cut for the fit-in-one-screen mobile requirement. */}
          <p className="hidden sm:block text-[12px] mb-3" style={{ color: 'var(--txf)' }}>
            {waxedLabel
              ? (de ? `gewachst am ${waxedLabel}` : `waxed ${waxedLabel}`)
              : (de ? 'bis zum nächsten Rewaxen' : 'until next rewax')}
          </p>
          {/* Compact meta: date · range per wax */}
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-medium" style={{ color: 'var(--txm)' }}>
              {de ? `ca. ${rewaxDate}` : `~${rewaxDate}`}
            </span>
            <span style={{ color: 'var(--bd2)' }}>·</span>
            <span className="text-[12px] tabular-nums" style={{ color: 'var(--txff)' }}>
              <AnimatedNumber value={interval} suffix={de ? ' km/Wachsung' : ' km/wax'} />
            </span>
          </div>
        </div>

        {SEP}

        {/* Parameters — fixed top-anchored stack, not position-coupled to the
            last-waxed panel's expand/collapse height below it */}
        <div className="px-6 pt-2 pb-3 sm:pt-4 sm:pb-4 flex flex-col flex-1 gap-2 sm:gap-4">
          <div>
            <FieldLabel label={t.tools.rewax.weather} />
            <div className="flex flex-wrap gap-2">
              {weatherOpts.map(o => (
                <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel label={t.tools.rewax.terrain} />
            <div className="flex flex-wrap gap-2">
              {terrainOpts.map(o => (
                <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </div>
          </div>

          <DistanceSlider
            label={t.tools.rewax.kmPerWeek}
            valueLabel={`${kmPerWeek} km`}
            value={kmPerWeek}
            onValueChange={setKmPerWeek}
            min={20} max={400} step={10}
            ariaLabel={t.tools.rewax.kmPerWeek}
          />

          <div>
            <FieldLabel label={t.tools.rewax.lastWaxed} />
            {/* Chips and the exact-date field are alternatives, not additions —
                showing both at once is what pushed this card past the deck's
                fixed height. Toggling to "Genaues Datum" swaps the chip row
                out instead of appending the date field below it. */}
            {!customDateOpen && (
              <div className="flex flex-wrap gap-2">
                {datePresets.map(p => (
                  <TogButton key={p.key} active={isPresetActive(p.date)} onClick={() => setLastWaxedDate(p.date)}>
                    {p.label}
                  </TogButton>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setCustomDateOpen(v => !v)}
              // Same 44px-minimum-tap-area technique as TogButton above —
              // the visible text link stays small, only the hit area grows.
              className="relative mt-1 sm:mt-2 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer after:content-[''] after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:h-11"
              style={{ color: 'var(--brand)' }}
            >
              {customDateOpen ? t.tools.rewax.lastWaxedHideExact : t.tools.rewax.lastWaxedExact}
            </button>
            {customDateOpen && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="date"
                  value={lastWaxedDate ? isoDate(lastWaxedDate) : ''}
                  min="2020-01-01"
                  max={isoDate(new Date())}
                  onChange={e => setLastWaxedDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                  className="w-full px-4 py-3 rounded-xl text-[14px]"
                  style={{
                    background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)',
                    colorScheme: theme === 'noir' ? 'dark' : 'light',
                  }}
                />
                {lastWaxedDate && (
                  <button
                    type="button"
                    onClick={() => setLastWaxedDate(null)}
                    aria-label={t.tools.rewax.lastWaxedClear}
                    className="flex-shrink-0 w-11 h-11 rounded-xl grid place-items-center transition-colors hover:opacity-80 cursor-pointer"
                    style={{ border: '1px solid var(--bd2)', background: 'var(--tog-bg)', color: 'var(--txf)' }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA — prompt to buy wax after seeing the interval */}
        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA onClick={goToWax}>
            {de ? 'Wachs kaufen →' : 'Buy wax →'}
          </ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}

// ─── Tool 2: Wax Stock Calculator ────────────────────────────────────────────
function fmtDuration(months: number, de: boolean): string {
  if (months > 24) return de ? `~${Math.round(months / 12)} Jahre` : `~${Math.round(months / 12)} yrs`;
  return de ? `~${months} Monate` : `~${months} months`;
}

// Split value/unit so the hero can render it in the same "big number + small
// unit" typography as Tab 1's weeks and Tab 3's savings, instead of one plain
// string — one shared hero pattern across all three cards.
function durationParts(months: number, de: boolean): { value: number; unit: string } {
  if (months > 24) {
    const years = Math.round(months / 12);
    return { value: years, unit: de ? (years === 1 ? 'Jahr' : 'Jahre') : (years === 1 ? 'yr' : 'yrs') };
  }
  return { value: months, unit: de ? 'Monate' : 'months' };
}

const wax500 = products.find(p => p.id === 'wax-500')!;
const wax300 = products.find(p => p.id === 'wax-300')!;

function formatEUR(price: number, de: boolean): string {
  return new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(price);
}

function WaxStockCalculator({ profile, showProfilePill, onJumpToProfile }: {
  profile: ToolsProfile;
  showProfilePill?: boolean;
  onJumpToProfile?: () => void;
}) {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const WAX_PER_REWAX = 20; // grams per wax session (300g ÷ 20 = 15 sessions, aligns with "20–25 apps/300g")
  const SHELF_LIFE_MONTHS = 30;

  // Derived from the shared riding profile instead of its own frequency
  // question — Tab 1 already establishes how often this rider rewaxes, so
  // asking again here (as a separate, disconnected bucket) is what caused the
  // two tabs to imply different rewax cadences for the same visitor.
  // Deliberately the *uncapped* interval/kmPerWeek, not profile.weeks: Tab 1's
  // 26-week display cap exists only so its own hero number never shows an
  // absurd figure — applying it here would make a low-mileage rider's stock
  // duration look artificially short.
  const preciseWeeksPerRewax = profile.kmPerWeek > 0 ? profile.interval / profile.kmPerWeek : Infinity;
  const rewaxPerMonth = Number.isFinite(preciseWeeksPerRewax) && preciseWeeksPerRewax > 0 ? 4.345 / preciseWeeksPerRewax : 0;
  const waxPerMonth = rewaxPerMonth * WAX_PER_REWAX;

  const months300 = waxPerMonth > 0 ? Math.max(1, Math.round(300 / waxPerMonth)) : 0;
  const months500 = waxPerMonth > 0 ? Math.max(1, Math.round(500 / waxPerMonth)) : 0;

  // Recommend 300g only when 300g already outlasts shelf life
  const rec: '300' | '500' = months300 > SHELF_LIFE_MONTHS ? '300' : '500';

  const recMonths  = rec === '500' ? months500 : months300;
  const altMonths  = rec === '500' ? months300 : months500;
  const recProduct = rec === '500' ? wax500 : wax300;
  const altProduct = rec === '500' ? wax300 : wax500;
  const altSize    = rec === '500' ? '300' : '500';

  // Concrete reason based on actual session count
  const rewaxPerYear = Math.round(rewaxPerMonth * 12);
  const recReason = rec === '500'
    ? (de
      ? `Du wachst ~${rewaxPerYear}× im Jahr — 500g ist günstiger pro Anwendung.`
      : `You wax ~${rewaxPerYear}× per year — 500g is cheaper per session.`)
    : (de
      ? `Bei ~${rewaxPerYear}× im Jahr reicht 300g über die gesamte Saison.`
      : `At ~${rewaxPerYear}× per year, 300g lasts the whole season.`);

  const recParts = durationParts(recMonths, de);
  const goToWax = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'wax' }));
  };
  const SEP = <div style={{ borderTop: '1px solid var(--inset-bd)' }} />;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Package className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={de ? 'Wie viel Wachs brauche ich?' : 'How much wax do I need?'}
        subtitle={de
          ? 'Bestell genau das richtige Paket — keine Verschwendung, kein Engpass.'
          : 'Order exactly the right amount — no waste, no shortfall.'}
      />
      <div className="flex flex-col flex-1">
        {showProfilePill && onJumpToProfile && (
          <div className="px-6 pt-5">
            <ProfileReadout profile={profile} onJump={onJumpToProfile} />
          </div>
        )}

        {/* Hero — same pattern as Tab 1/3 but with more room: this tab has
            genuinely less content than its siblings (no inputs left to ask,
            everything comes from the shared profile), so what IS here — the
            actual purchase decision — gets more prominence instead of being
            padded out with unrelated filler. */}
        <div className="px-6 pt-3 pb-3 sm:pt-6 sm:pb-6 text-center flex flex-col items-center">
          <div className="flex items-baseline justify-center gap-2 mb-1 sm:mb-3">
            <span className="text-[40px] sm:text-[72px] font-bold leading-none tabular-nums" style={{ color: 'var(--tx1)' }}>
              <AnimatedNumber value={recParts.value} />
            </span>
            <span className="text-[18px] sm:text-[26px] font-semibold leading-none" style={{ color: 'var(--tx2)' }}>
              {recParts.unit}
            </span>
          </div>
          <p className="text-[12px] sm:text-[13px] mb-2 sm:mb-4 max-w-[36ch]" style={{ color: 'var(--txf)' }}>
            {recReason}
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-medium" style={{ color: 'var(--txm)' }}>
              {de ? 'Empfohlen' : 'Recommended'}
            </span>
            <span style={{ color: 'var(--bd2)' }}>·</span>
            <span className="text-[12px] tabular-nums" style={{ color: 'var(--txff)' }}>
              {rec}g — {formatEUR(recProduct.price, de)}
            </span>
          </div>
        </div>

        {SEP}

        {/* 2-option comparison — same visual language as Tab 3's chain-count
            cards (bordered box, recommended tinted in brand colour). Sized
            generously on desktop (this is the actual decision the tab exists
            to answer, and Tab 2 has room to spare there) but compact on
            mobile, where every screen's worth of scroll is at a premium. */}
        <div className="px-4 py-3 sm:px-5 sm:py-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { size: rec, product: recProduct, months: recMonths, isRec: true },
              { size: altSize, product: altProduct, months: altMonths, isRec: false },
            ].map(opt => (
              <a
                key={opt.size}
                href={opt.product.ebayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl flex flex-col transition-opacity hover:opacity-85 p-3 sm:px-4 sm:py-[18px]"
                style={{
                  background: opt.isRec ? 'rgba(var(--accent-rgb),0.08)' : 'var(--sf)',
                  border: opt.isRec ? '1.5px solid var(--brand)' : '1px solid var(--bd2)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-3">
                  <p className="text-[13px] font-semibold leading-none" style={{ color: opt.isRec ? 'var(--brand)' : 'var(--tx2)' }}>
                    {opt.size}g
                  </p>
                  <span className="text-meta" style={{ color: opt.isRec ? 'var(--brand)' : 'var(--txff)' }}>eBay →</span>
                </div>
                <p className="text-[20px] sm:text-[28px] font-bold tabular-nums leading-none mb-1 sm:mb-1.5" style={{ color: opt.isRec ? 'var(--brand)' : 'var(--tx2)' }}>
                  {fmtDuration(opt.months, de)}
                </p>
                <p className="text-[13px]" style={{ color: 'var(--txff)' }}>
                  {formatEUR(opt.product.price, de)}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* CTA — same closing pattern as Tab 1 & Tab 3 */}
        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA onClick={goToWax}>
            {de ? 'Wachs kaufen →' : 'Buy wax →'}
          </ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}

// ─── Tool 3: Rotation & Savings (merged) ─────────────────────────────────────
function RotationAndSavings({ profile, showProfilePill, onJumpToProfile }: {
  profile: ToolsProfile;
  showProfilePill?: boolean;
  onJumpToProfile?: () => void;
}) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  // kmPerYear is a derived, two-way-synced view of the shared kmPerWeek —
  // editing either tab's slider updates both, instead of Tab 3 keeping its
  // own independent default (previously 5000, vs. kmPerWeek's 100×52=5200).
  const kmPerYear = Math.round(profile.kmPerWeek * 52);
  const setKmPerYear = (y: number) => profile.setKmPerWeek(Math.round(y / 52));

  // Financial constants — Shimano M8100 12s reference
  // REWAX_KM now comes from the shared profile (weather × terrain) instead of
  // a fixed 300km for everyone — previously a wet/MTB rider whom Tab 1 says
  // needs rewaxing every 120km still got a savings/frequency projection built
  // as if they only needed it every 300km.
  const REWAX_KM        = profile.interval;
  const CHAIN_PRICE     = 45;
  const CASSETTE_PRICE  = 85.70;
  const WAX_BLOCK_PRICE = 35;
  const APPS_PER_BLOCK  = 33;
  const OIL_CHAIN_KM    = 4000;
  const OIL_CASSETTE_KM = 15000;
  const OIL_PRICE_PER_APP     = 1.10;
  const OIL_APP_INTERVAL_KM   = 1000;
  const CASSETTE_KM: number[] = [30000, 40000, 48000]; // per chain count 1/2/3
  const CHAIN_KM:    number[] = [6000,  8500,  10500];

  type ChainOption = {
    n: number;
    sessionsPerYear: number;
    annualCost: number;
    annualSavings: number;
    savingsPct: number;
    cassetteSavingsVsOil: number;
    sessionsSavedPct: number;
    dateStr: string;
  };

  type CalcResult = {
    oilAnnual: number;
    chains: ChainOption[];
  };

  const data: CalcResult = useMemo(() => {
    const origin = profile.lastWaxedDate ?? new Date();
    const kmPerWeek = kmPerYear / 52;
    const WAX_LUBE_PER_KM = WAX_BLOCK_PRICE / (APPS_PER_BLOCK * REWAX_KM);
    const OIL_LUBE_PER_KM = OIL_PRICE_PER_APP / OIL_APP_INTERVAL_KM;
    const oilCassettePerKm = CASSETTE_PRICE / OIL_CASSETTE_KM;
    const oilCostPerKm = CHAIN_PRICE / OIL_CHAIN_KM + oilCassettePerKm + OIL_LUBE_PER_KM;
    const oilAnnual = Math.round(kmPerYear * oilCostPerKm);

    const singleChainSessionsPerYear = Math.ceil(kmPerYear / REWAX_KM);

    const chains: ChainOption[] = [1, 2, 3].map(n => {
      const weeksRaw = Math.min((n * REWAX_KM) / kmPerWeek, MAX_REWAX_WEEKS);
      const sessionsPerYear = Math.ceil(kmPerYear / (n * REWAX_KM));
      const waxCassettePerKm = CASSETTE_PRICE / CASSETTE_KM[n - 1];
      const costPerKm = CHAIN_PRICE / CHAIN_KM[n - 1] + waxCassettePerKm + WAX_LUBE_PER_KM;
      const annualCost = Math.round(kmPerYear * costPerKm);
      const annualSavings = Math.max(0, oilAnnual - annualCost);
      const savingsPct = oilAnnual > 0 ? Math.round((annualSavings / oilAnnual) * 100) : 0;
      const cassetteSavingsVsOil = Math.max(0, Math.round(kmPerYear * (oilCassettePerKm - waxCassettePerKm)));
      const sessionsSavedPct = n > 1 ? Math.round((1 - sessionsPerYear / singleChainSessionsPerYear) * 100) : 0;
      const nextDate = addWeeks(origin, Math.round(weeksRaw));
      const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric', month: 'short',
        ...(nextDate.getFullYear() !== origin.getFullYear() ? { year: 'numeric' } : {}),
      };
      const dateStr = nextDate.toLocaleDateString(de ? 'de-DE' : 'en-GB', opts);
      return { n, sessionsPerYear, annualCost, annualSavings, savingsPct, cassetteSavingsVsOil, sessionsSavedPct, dateStr };
    });

    return { oilAnnual, chains };
  }, [kmPerYear, de, REWAX_KM, profile.lastWaxedDate]); // eslint-disable-line

  // Dynamic recommendation — adapts to actual km/year
  const rec = kmPerYear < 2500 ? 1 : kmPerYear >= 8000 ? 3 : 2;
  const recData = data.chains[rec - 1];
  const discountPct = rec === 2 ? 5 : rec === 3 ? 10 : 0;

  const goToChains = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'chain' }));
  };

  const SEP = <div style={{ borderTop: '1px solid var(--inset-bd)' }} />;

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={de ? 'Rotation & Ersparnis' : 'Rotation & Savings'}
        subtitle={de
          ? 'Ketten im Wechsel: seltener waxen, Kassette schonen, Geld sparen.'
          : 'Rotate chains: wax less often, protect the cassette, save money.'}
      />
      <div className="flex flex-col flex-1">

        {showProfilePill && onJumpToProfile && (
          <div className="px-6 pt-5">
            <ProfileReadout profile={profile} onJump={onJumpToProfile} />
          </div>
        )}

        {/* Hero — savings + recommendation + oil baseline context in one block */}
        <div className="px-6 pt-3 pb-3 sm:pt-4 sm:pb-4 text-center flex flex-col items-center">
          <div className="flex items-baseline justify-center gap-3 mb-1 sm:mb-2">
            <AnimatedNumber
              value={recData.annualSavings}
              prefix="~€"
              className="num text-[40px] sm:text-[56px] font-bold leading-none"
              style={{ color: 'var(--tx1)' }}
            />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--brand)' }}>
                {de ? 'gespart' : 'saved'}
              </span>
              <span className="text-meta" style={{ color: 'var(--txf)' }}>
                {de ? '/Jahr' : '/year'}
              </span>
            </div>
          </div>
          {/* Single subtitle line: recommendation + oil baseline */}
          <p className="text-[12px]" style={{ color: 'var(--txf)' }}>
            {de
              ? `mit ${rec} ${rec === 1 ? 'Kette' : 'Ketten'} · vs. Kettenöl (~€${data.oilAnnual}/Jahr)`
              : `with ${rec} ${rec === 1 ? 'chain' : 'chains'} · vs. chain oil (~€${data.oilAnnual}/yr)`}
          </p>
        </div>

        {SEP}

        {/* Slider — adjust km/year to tune results */}
        <div className="px-6 pt-3 pb-2 sm:pt-4 sm:pb-3">
          <DistanceSlider
            label={t.tools.rotation.kmPerYear}
            valueLabel={`${kmPerYear.toLocaleString(de ? 'de-DE' : 'en-US')} km`}
            value={kmPerYear}
            onValueChange={setKmPerYear}
            min={1000} max={10000} step={500}
            ariaLabel={t.tools.rotation.kmPerYear}
          />
        </div>

        {SEP}

        {/* 3 comparison cards — the single source of truth */}
        <div className="px-4 py-2.5 sm:py-4 flex-1">
          {/* items-start, not h-full: CSS Grid's default stretch was forcing
              the two non-recommended cards to match the recommended card's
              much taller content, leaving visible empty space inside them —
              the same "empty box" problem already fixed once in Tab 2's
              comparison, just not caught here until a real screenshot showed
              it (DOM-only measurements don't reveal internal dead space). */}
          <div className="grid grid-cols-3 gap-2 items-start">
            {data.chains.map(({ n, sessionsPerYear, annualSavings, savingsPct, dateStr }) => {
              const isRec = n === rec;
              const cardDiscountPct = n === 2 ? 5 : n === 3 ? 10 : 0;

              // Non-recommended options: only the one number that matters for
              // comparison (savings) — no session count, no discount badge, no
              // next-wax date. Full detail stays on the recommended option only,
              // cutting simultaneous numbers here from ~15 to ~7 (user feedback:
              // too many numbers at once, unclear what each one means).
              if (!isRec) {
                return (
                  <div
                    key={n}
                    className="rounded-2xl flex flex-col items-center justify-center text-center"
                    style={{ background: 'var(--sf)', border: '1px solid var(--bd2)', padding: '12px 10px' }}
                  >
                    <p className="text-meta font-semibold leading-none mb-2" style={{ color: 'var(--tx2)' }}>
                      {n} {de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains')}
                    </p>
                    <p
                      className="text-[18px] font-bold tabular-nums leading-none"
                      style={{ color: annualSavings > 0 ? 'var(--txm)' : 'var(--txff)' }}
                    >
                      {annualSavings > 0 ? `~€${annualSavings}` : '—'}
                    </p>
                    <p className="text-meta mt-0.5" style={{ color: 'var(--txff)' }}>
                      {de ? '/Jahr' : '/yr'}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={n}
                  className="rounded-2xl flex flex-col"
                  style={{
                    background: 'rgba(var(--accent-rgb),0.08)',
                    border: '1.5px solid var(--brand)',
                    padding: '12px 10px',
                  }}
                >
                  {/* Top: label row */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-meta font-semibold leading-none" style={{ color: 'var(--brand)' }}>
                      {n} {de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains')}
                    </p>
                    {cardDiscountPct > 0 && (
                      <span
                        className="rounded px-1 py-0.5 text-meta font-semibold leading-none"
                        style={{ background: 'var(--accent-wash)', color: 'var(--brand)' }}
                      >
                        −{cardDiscountPct}%
                      </span>
                    )}
                  </div>

                  {/* Savings — primary metric */}
                  <p className="text-[22px] font-bold tabular-nums leading-none" style={{ color: 'var(--brand)' }}>
                    {annualSavings > 0 ? `~€${annualSavings}` : '—'}
                  </p>
                  <p className="text-meta mt-0.5 mb-3" style={{ color: 'var(--txff)' }}>
                    {savingsPct > 0
                      ? (de ? `/Jahr · −${savingsPct}%` : `/yr · −${savingsPct}%`)
                      : (de ? '/Jahr vs. Öl' : '/yr vs. oil')}
                  </p>

                  {/* Sessions */}
                  <p className="text-[16px] font-bold tabular-nums leading-none mb-0.5" style={{ color: 'var(--txm)' }}>
                    {sessionsPerYear}×
                  </p>
                  <p className="text-meta" style={{ color: 'var(--txff)' }}>
                    {de ? 'Waxen/Jahr' : 'wax/yr'}
                  </p>

                  {/* Next wax date — always at bottom */}
                  <div className="mt-auto pt-3">
                    <p className="text-meta" style={{ color: 'var(--txff)' }}>
                      {de ? 'Nächstes Waxen' : 'Next wax'}
                    </p>
                    <p className="text-meta font-medium mt-0.5" style={{ color: 'var(--brand)' }}>
                      {dateStr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA onClick={goToChains}>
            {de
              ? rec === 1
                ? 'Einzelkette ansehen →'
                : `${rec}-Ketten-Kit ansehen · ${discountPct}% Rabatt →`
              : rec === 1
                ? 'View single chain →'
                : `View ${rec}-chain kit · ${discountPct}% off →`}
          </ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}

// ─── Tab labels ───────────────────────────────────────────────────────────────
// Feeds both the mobile tablist and the desktop deck's tablist/cover labels.
const TOOL_TAB_LABELS_DE = ['Intervall', 'Vorrat', 'Rotation'];
const TOOL_TAB_LABELS_EN = ['Interval', 'Stock', 'Rotation'];

// ─── Desktop deck ─────────────────────────────────────────────────────────────
// The 3D deck, without the flaw that had it replaced by a flat grid: the old
// version parked its side cards at 0.85 scale and 0.58 opacity, 560px
// off-centre, so on a 1440px screen two of the three calculators were
// unreadable ghosts clipped by the section edge — most visitors only ever saw
// one of them. Here the side cards stay legible (0.88 / 0.9) and sit close
// enough to read, and they ARE the control: clicking one brings it forward.
// Labelled tabs and arrows below make all three reachable without anyone
// having to discover that the cards are clickable.
//
// Driven by CSS transitions over React state rather than a GSAP timeline:
// each card derives one transform string from its slot, so there is no
// timeline to fall out of sync, nothing to overwrite mid-flight, and an
// interrupted move re-targets from wherever it is. Three slots is the whole
// state space, so the table below is exhaustive — no modulo edge case at the
// wrap point.
//
// Geometry note: the card is centred by `left:50%` + `translate(-50%)`, so the
// extra `translateX(±58%)` offsets its centre by 58% of a card width. At 48%
// container width that keeps the outer edge of a side card inside the column
// at every lg+ breakpoint (checked at 1024 and 1440).
// Offsets are tuned so a side card's own CENTRE always lands outside the active
// card's edge (0.72w > 0.5w), which is what keeps its label readable instead of
// hidden behind the front card, while its outer edge still stays inside the
// column: 0.72w + 0.9w/2 = 1.17w ≤ half the container at 42% width. Checked at
// 1024 and 1440.
const DECK_POS = [
  { transform: 'translate(-50%) rotateY(0deg) scale(1)',                     zIndex: 30, opacity: 1    },
  { transform: 'translate(-50%) translateX(72%) rotateY(-18deg) scale(0.9)',  zIndex: 20, opacity: 0.96 },
  { transform: 'translate(-50%) translateX(-72%) rotateY(18deg) scale(0.9)',  zIndex: 20, opacity: 0.96 },
] as const;

// Tall enough for the tallest calculator at deck width so no card's content is
// clipped — they are absolutely positioned and therefore all share this height.
// Measured live (not guessed): Rewax ≈679px is the tallest after trimming the
// last-waxed presets to 3 and tightening shared paddings; Rotation ≈650px;
// Stock ≈519px once it had a real hero+comparison+CTA instead of one small
// centred box (which is what made it look broken/empty at the old height).
// 700 gives every card ~20px of margin without reopening the old overflow.
const DECK_HEIGHT = 700;

type DeckToolComp = (props: {
  profile: ToolsProfile;
  showProfilePill?: boolean;
  onJumpToProfile?: () => void;
}) => React.ReactElement;

const DECK: { key: string; Comp: DeckToolComp; Icon: typeof Calculator; coverDe: string; coverEn: string; hintDe: string; hintEn: string }[] = [
  { key: 'rewax', Comp: RewaxCalculator, Icon: Calculator,
    coverDe: 'Wann muss ich rewaxen?',      coverEn: 'When do I re-wax?',
    hintDe: 'Dein Intervall in Wochen — nach Wetter, Gelände und Kilometern.',
    hintEn: 'Your interval in weeks — from weather, terrain and distance.' },
  { key: 'stock', Comp: WaxStockCalculator, Icon: Package,
    coverDe: 'Wie viel Wachs brauche ich?', coverEn: 'How much wax do I need?',
    hintDe: '300 g oder 500 g — welcher Block bei dir länger reicht.',
    hintEn: '300 g or 500 g — which block lasts you longer.' },
  { key: 'rotation', Comp: RotationAndSavings, Icon: RotateCcw,
    coverDe: 'Rotation & Ersparnis',        coverEn: 'Rotation & savings',
    hintDe: 'Was zwei oder drei Ketten im Wechsel pro Jahr sparen.',
    hintEn: 'What rotating two or three chains saves you per year.' },
];

function DeckSlot({ rel, label, cover, hint, Icon, onActivate, de, children }: {
  rel: number;
  label: string;
  cover: string;
  hint: string;
  Icon: typeof Calculator;
  onActivate: () => void;
  de: boolean;
  children: React.ReactNode;
}) {
  const pos = DECK_POS[rel] ?? DECK_POS[0];
  const active = rel === 0;
  return (
    <div className="deck-slot absolute inset-y-0 left-1/2 w-[42%]" style={pos}>
      {/* `inert` takes the whole inactive card out of tab order and off the
          a11y tree in one go — a background card must not be reachable by Tab
          or announced as if it were the one on screen. */}
      <div className="h-full" inert={!active}>{children}</div>

      {/* Cover for the two background cards. Three live calculators fanned out
          at once is visual noise — sliders, chips and numbers competing behind
          the one you're meant to be reading. The cover reduces each background
          card to the question it answers, and cross-fades out as that card
          rotates to the front, which is what reads as the card "flipping open".
          Kept mounted (rather than conditionally rendered) so that fade has
          something to animate in both directions. */}
      <button
        type="button"
        onClick={onActivate}
        aria-label={label}
        aria-hidden={active}
        tabIndex={active ? -1 : 0}
        className="deck-cover absolute inset-0 z-10 rounded-3xl flex flex-col items-center justify-center gap-4 px-8 text-center"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--bd)',
          boxShadow: 'var(--card-shad)',
          opacity: active ? 0 : 1,
          pointerEvents: active ? 'none' : 'auto',
        }}
      >
        <span
          className="w-12 h-12 rounded-2xl grid place-items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
          }}
        >
          <Icon className="h-5 w-5" style={{ color: 'var(--txm)' }} />
        </span>
        <span className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>
          {cover}
        </span>
        <span className="text-[12.5px] leading-relaxed max-w-[26ch]" style={{ color: 'var(--txf)' }}>
          {hint}
        </span>
        <span className="text-[12px] font-medium mt-1" style={{ color: 'var(--brand)' }}>
          {de ? 'Rechner öffnen →' : 'Open calculator →'}
        </span>
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Tools() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const headerRef = useRef<HTMLDivElement>(null);
  useSectionReveal(headerRef);

  // Shared by all three calculators, desktop and mobile alike.
  const profile = useToolsProfile();

  // Shared by the mobile tab bar and the desktop deck's tablist.
  const TAB_LABELS = useMemo(() => (de ? TOOL_TAB_LABELS_DE : TOOL_TAB_LABELS_EN), [de]);

  // ── Desktop deck state ────────────────────────────────────────────────────
  const [activeCard, setActiveCard] = useState(0);
  const deckTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving tabindex: only the selected tab is tabbable, so when the arrow keys
  // move the selection the focus has to travel with it — otherwise focus is
  // left sitting on a button that just became tabIndex -1 and the next Tab
  // press jumps somewhere unrelated.
  const moveDeck = (next: number) => {
    setActiveCard(next);
    deckTabRefs.current[next]?.focus();
  };

  // ── Mobile tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabPillRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number; isSlider: boolean }>({ x: 0, y: 0, isSlider: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stamp = waxedStampFromLocation();
    if (!stamp) return;
    let attempts = 0;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      const el = document.getElementById('tools');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else if (attempts < 20) {
        attempts += 1;
        setTimeout(go, 120);
      }
    };
    go();
    return () => { cancelled = true; };
  }, []);

  const pillX = (btnRect: DOMRect, barRect: DOMRect) =>
    btnRect.left - barRect.left - 1;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const btn = tabButtonRefs.current[0];
      const bar = tabBarRef.current;
      const pill = tabPillRef.current;
      if (!btn || !bar || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.set(pill, { x: pillX(btnRect, barRect), width: btnRect.width });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const btn = tabButtonRefs.current[activeTab];
    const bar = tabBarRef.current;
    const pill = tabPillRef.current;
    if (!btn || !bar || !pill) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.to(pill, {
      x: pillX(btnRect, barRect),
      width: btnRect.width,
      duration: 0.35,
      ease: 'power3.inOut',
      overwrite: 'auto',
    });
  }, [activeTab, TAB_LABELS]);

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
      gsap.set(pill, { x: pillX(btnRect, barRect), width: btnRect.width });
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="tools" style={{ background: 'var(--tool-bg)' }}>
          <div ref={headerRef} className="mb-16">
            <h2 className="section-title mb-4">
              <ScrollWordReveal text={t.tools.title} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-tx2 max-w-xl text-[15px]">
              {t.tools.subtitle}
            </p>
          </div>

          {/* ── Mobile / tablet: swipeable tabs (up to lg) ── */}
          <div className="lg:hidden">
            <div
              ref={tabBarRef}
              role="tablist"
              className="relative flex p-1 rounded-2xl mb-5 overflow-x-auto"
              style={{ background: 'var(--tab-track-bg)', border: '1px solid var(--tab-track-bd)' }}
            >
              <div
                ref={tabPillRef}
                className="absolute top-1 bottom-1 rounded-xl pointer-events-none"
                style={{
                  width: 0,
                  background: 'var(--tab-pill-bg)',
                  border: '1px solid var(--tab-pill-bd)',
                  boxShadow: 'var(--tab-pill-shadow)',
                }}
              />
              {TAB_LABELS.map((label, i) => (
                <button
                  key={i}
                  ref={el => { tabButtonRefs.current[i] = el; }}
                  onClick={() => setActiveTab(i)}
                  role="tab"
                  aria-selected={activeTab === i}
                  className="relative z-10 flex-1 min-w-[60px] px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors whitespace-nowrap"
                  style={{
                    color: activeTab === i ? 'var(--tx1)' : 'var(--txf)',
                    letterSpacing: activeTab === i ? '-0.01em' : '0',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className="overflow-hidden"
              onTouchStart={e => {
                const target = e.target as HTMLElement;
                touchStart.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                  isSlider: !!target.closest('[role="slider"], [data-orientation]'),
                };
              }}
              onTouchEnd={e => {
                if (touchStart.current.isSlider) return;
                const dx = e.changedTouches[0].clientX - touchStart.current.x;
                const dy = e.changedTouches[0].clientY - touchStart.current.y;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                  if (dx < 0 && activeTab < 2) setActiveTab(activeTab + 1);
                  if (dx > 0 && activeTab > 0) setActiveTab(activeTab - 1);
                }
              }}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeTab * 100}%)` }}
              >
                <div className="min-w-full"><RewaxCalculator profile={profile} /></div>
                <div className="min-w-full">
                  <WaxStockCalculator profile={profile} showProfilePill onJumpToProfile={() => setActiveTab(0)} />
                </div>
                <div className="min-w-full">
                  <RotationAndSavings profile={profile} showProfilePill onJumpToProfile={() => setActiveTab(0)} />
                </div>
              </div>
            </div>
            {/* Dot indicators — the labelled tab bar above already teaches
                swipeability, so the separate "← swipe →" hint (and the
                vertical space it always reserved, even faded out) was cut
                for the one-screen-per-tab mobile requirement. */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {TAB_LABELS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="relative transition-all duration-300 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
                  aria-label={TAB_LABELS[i]}
                  style={{
                    width: i === activeTab ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === activeTab ? 'var(--accent)' : 'var(--bd)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Desktop: 3D deck (lg+) ──
              Restored per explicit user request after seeing the flat grid
              live — they wanted the flip mechanism back (side cards showing
              only a label, click to bring one to front), not a redesign.
              Back at `lg:` rather than the grid's `xl:`: at 1024px the deck's
              cards are 42% of the 912px column ≈383px — 33% wider than the
              grid's 288px column that caused the original overflow — so
              Rotation & Ersparnis's inner mini-grid gets ~112px per sub-card
              here, clear of the ~80px break point, before even counting the
              content reduction below. Side-card edges still clear the column
              at 1024px as originally measured. */}
          <div className="hidden lg:block">
            <div
              className="relative"
              style={{ perspective: '1900px', height: DECK_HEIGHT }}
            >
              {DECK.map((tool, i) => (
                <DeckSlot
                  key={tool.key}
                  rel={(i - activeCard + 3) % 3}
                  label={de ? `${TOOL_TAB_LABELS_DE[i]} anzeigen` : `Show ${TOOL_TAB_LABELS_EN[i]}`}
                  cover={de ? tool.coverDe : tool.coverEn}
                  hint={de ? tool.hintDe : tool.hintEn}
                  Icon={tool.Icon}
                  onActivate={() => setActiveCard(i)}
                  de={de}
                >
                  <tool.Comp profile={profile} showProfilePill onJumpToProfile={() => setActiveCard(0)} />
                </DeckSlot>
              ))}
            </div>

            {/* Arrows + labelled tabs. The old deck's only affordance was three
                4px dots with 10px labels; these are the real control surface,
                all ≥44px, and they name every calculator so nothing depends on
                guessing that a background card can be clicked. */}
            <div className="flex items-center justify-center gap-3 mt-9">
              <button
                type="button"
                onClick={() => setActiveCard((activeCard + 2) % 3)}
                aria-label={de ? 'Vorheriger Rechner' : 'Previous calculator'}
                className="w-11 h-11 rounded-full grid place-items-center transition-colors hover:opacity-80"
                style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div
                role="tablist"
                aria-label={de ? 'Rechner' : 'Calculators'}
                className="flex items-center gap-1 p-1 rounded-full"
                style={{ background: 'var(--tab-track-bg)', border: '1px solid var(--tab-track-bd)' }}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') { e.preventDefault(); moveDeck((activeCard + 1) % 3); }
                  if (e.key === 'ArrowLeft')  { e.preventDefault(); moveDeck((activeCard + 2) % 3); }
                  if (e.key === 'Home')       { e.preventDefault(); moveDeck(0); }
                  if (e.key === 'End')        { e.preventDefault(); moveDeck(2); }
                }}
              >
                {TAB_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    ref={el => { deckTabRefs.current[i] = el; }}
                    aria-selected={activeCard === i}
                    tabIndex={activeCard === i ? 0 : -1}
                    onClick={() => setActiveCard(i)}
                    className="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors"
                    style={{
                      background: activeCard === i ? 'var(--tab-pill-bg)' : 'transparent',
                      border: activeCard === i ? '1px solid var(--tab-pill-bd)' : '1px solid transparent',
                      boxShadow: activeCard === i ? 'var(--tab-pill-shadow)' : 'none',
                      color: activeCard === i ? 'var(--tx1)' : 'var(--txf)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveCard((activeCard + 1) % 3)}
                aria-label={de ? 'Nächster Rechner' : 'Next calculator'}
                className="w-11 h-11 rounded-full grid place-items-center transition-colors hover:opacity-80"
                style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

      {/* Bottom gradient — bridges to FAQ below */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--pg), transparent 100%), var(--pg))', zIndex: 1 }}
      />
    </Section>
  );
}
