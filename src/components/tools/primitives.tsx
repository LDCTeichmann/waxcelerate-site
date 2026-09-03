// ── Bausteine, aus denen jeder Rechner besteht ──────────────────────────────
//
// Vorher lagen diese sechs Komponenten privat in sections/tools.tsx, wo nur die
// drei Rechner der Startseite an sie herankamen. Verhalten und Styles sind
// unveraendert uebernommen; einzige Aenderung ist, dass sie jetzt exportiert
// sind und von allen Rechnern geteilt werden.

import { Slider } from '@/components/ui/slider';

// Sichtbare Pille bleibt kompakt (das ist der Sinn der Chip-Optik), aber die
// Tapp-Flaeche wird ueber ein unsichtbares after:-Pseudoelement auf die im
// Projekt geltenden 44 px gebracht (Mobile-Plan B5).
export function TogButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
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

// Kein backdrop-filter: var(--card-bg) ist ein vollstaendig deckender Verlauf
// (index.css). Hinter einer deckenden Karte zu blurren ist unsichtbar und reine
// Compositing-Arbeit.
export function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-full rounded-3xl"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}
    >
      {children}
    </div>
  );
}

export function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
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
          <h3 className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>{title}</h3>
          {/* Unter sm ausgeblendet: auf einer wischbaren Karte sagen Reiter und
              Titel schon, worum es geht — der Untertitel ist Kontext, den nur
              das breitere Deck sich leisten kann. */}
          <p className="hidden sm:block text-[12px] leading-snug mt-0.5" style={{ color: 'var(--txf)' }}>{subtitle}</p>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: 'var(--inset-bd)' }} />
    </div>
  );
}

export function FieldLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5 sm:mb-2.5">
      <span className="text-meta uppercase tracking-[0.1em] font-medium" style={{ color: 'var(--txf)' }}>{label}</span>
      {value && (
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--tx2)' }}>{value}</span>
      )}
    </div>
  );
}

export function DistanceSlider({ label, valueLabel, value, onValueChange, min, max, step, ariaLabel }: {
  label: string; valueLabel: string; value: number; onValueChange: (v: number) => void;
  min: number; max: number; step: number; ariaLabel: string;
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

export function ToolCTA({ onClick, href, children }: {
  onClick?: () => void; href?: string; children: React.ReactNode;
}) {
  const style: React.CSSProperties = { background: 'var(--inset-bg)', border: '1px solid var(--brand)' };
  const className = 'w-full rounded-xl py-2.5 px-4 text-center transition-opacity hover:opacity-70 active:opacity-50 cursor-pointer';
  const inner = <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>{children}</span>;
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={`block ${className}`}
        style={style}
      >
        {inner}
      </a>
    );
  }
  return <button onClick={onClick} className={className} style={style}>{inner}</button>;
}

/** Trennlinie zwischen den Bloecken einer Karte. */
export function ToolSeparator() {
  return <div style={{ borderTop: '1px solid var(--inset-bd)' }} />;
}
