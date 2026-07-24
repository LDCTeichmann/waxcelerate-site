// ─── SegmentedToggle — equal-width segmented control with sliding indicator ──
// One shared toggle voice for the whole site (Wax⇄Oil, Classic⇄Pro, …).
// Theme-driven via CSS vars; the indicator slides via CSS transform only.
export interface SegOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const n = options.length;
  const activeIdx = Math.max(0, options.findIndex(o => o.value === value));

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative grid p-1 rounded-2xl ${className}`}
      style={{
        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
        background: 'var(--tog-bg)',
        border: '1px solid var(--tog-bd)',
      }}
    >
      {/* Sliding indicator */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 rounded-xl"
        style={{
          left: `calc(${(activeIdx / n) * 100}% + 4px)`,
          width: `calc(${100 / n}% - 8px)`,
          background: 'rgba(var(--accent-rgb), 0.12)',
          border: '1px solid rgba(var(--accent-rgb), 0.40)',
          transition: 'left 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className="relative z-10 px-4 py-2 rounded-xl text-[13px] transition-colors cursor-pointer"
            style={{
              color: active ? 'var(--tx1)' : 'var(--tog-fg)',
              fontWeight: active ? 500 : 400,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
