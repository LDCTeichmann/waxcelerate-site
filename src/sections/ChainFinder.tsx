import { Search, RotateCcw } from 'lucide-react';

type Brand = 'all' | 'shimano' | 'sram' | 'campagnolo';
type Speed = 'all' | '11' | '12';

/**
 * ChainFinder — guided "Finde deine Kette" selector.
 * A two-step (brand → speed) finder that drives the chains-tab filter state in
 * src/sections/products.tsx. Replaces the plain filter bar: same state, friendlier
 * framing + a live result summary. Backed by the existing compatibilityMatrix logic.
 */
export function ChainFinder({
  de, brand, speed, setBrand, setSpeed, count,
}: {
  de: boolean;
  brand: Brand;
  speed: Speed;
  setBrand: (b: Brand) => void;
  setSpeed: (s: Speed) => void;
  count: number;
}) {
  const brands: { v: Brand; label: string }[] = [
    { v: 'all', label: de ? 'Alle' : 'All' },
    { v: 'shimano', label: 'Shimano' },
    { v: 'sram', label: 'SRAM' },
    { v: 'campagnolo', label: 'Campagnolo' },
  ];
  const speeds: { v: Speed; label: string }[] = [
    { v: 'all', label: de ? 'Alle' : 'All' },
    { v: '11', label: '11-fach' },
    { v: '12', label: '12-fach' },
  ];

  const opt = (active: boolean) =>
    `px-3.5 py-2 rounded-lg text-[13px] font-medium leading-none transition-all border cursor-pointer ${
      active
        ? 'text-wx-tx1 border-[var(--accent)]'
        : 'text-wx-txm border-wx-bd hover:text-wx-tx2 hover:border-[var(--accent-soft)]'
    }`;
  const activeBg = (active: boolean) =>
    active ? { background: 'var(--accent-wash)' } : { background: 'var(--sf2)' };

  const touched = brand !== 'all' || speed !== 'all';
  const reset = () => { setBrand('all'); setSpeed('all'); };

  // Human-readable summary of the current selection.
  const sel = [
    brand !== 'all' ? brands.find(b => b.v === brand)!.label : null,
    speed !== 'all' ? `${speed}-fach` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="mb-6 rounded-2xl border border-wx-bd p-4 sm:p-5" style={{ background: 'var(--sf)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Search className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        <h3 className="font-display font-bold text-wx-tx1 text-[16px] leading-tight">
          {de ? 'Finde deine Kette' : 'Find your chain'}
        </h3>
      </div>
      <p className="text-[12.5px] mb-4" style={{ color: 'var(--txm)' }}>
        {de ? 'In 2 Schritten zur passenden vorgewachsten Kette.' : 'Two steps to your matching pre-waxed chain.'}
      </p>

      {/* Step 1 — brand */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="num-data text-meta" style={{ color: 'var(--accent-soft)' }}>01</span>
          <span className="text-small uppercase tracking-[0.14em]" style={{ color: 'var(--txf)' }}>
            {de ? 'Marke' : 'Brand'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map(({ v, label }) => (
            <button key={v} onClick={() => setBrand(v)} className={opt(brand === v)} style={activeBg(brand === v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — speed */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="num-data text-meta" style={{ color: 'var(--accent-soft)' }}>02</span>
          <span className="text-small uppercase tracking-[0.14em]" style={{ color: 'var(--txf)' }}>
            {de ? 'Schaltung' : 'Speed'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {speeds.map(({ v, label }) => (
            <button key={v} onClick={() => setSpeed(v)} className={opt(speed === v)} style={activeBg(speed === v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result summary */}
      <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
        <p className="text-[13px]" style={{ color: 'var(--tx2)' }}>
          <span className="font-bold num" style={{ color: count > 0 ? 'var(--accent)' : 'var(--txm)' }}>{count}</span>
          {' '}
          {de ? (count === 1 ? 'passende Kette' : 'passende Ketten') : (count === 1 ? 'matching chain' : 'matching chains')}
          {sel && <span style={{ color: 'var(--txf)' }}> · {sel}</span>}
        </p>
        {touched && (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: 'var(--txm)' }}>
            <RotateCcw className="h-3.5 w-3.5" />
            {de ? 'Zurücksetzen' : 'Reset'}
          </button>
        )}
      </div>
    </div>
  );
}
