// ── Bausteine, aus denen jeder Rechner besteht ──────────────────────────────
//
// Jede Karte folgt ab hier demselben Aufbau, damit sechs Rechner sich wie ein
// Werkzeug anfuehlen und nicht wie sechs:
//
//   ToolCard
//     ToolHeader   — Icon, die Frage, ein Satz Kontext
//     StepList     — die Eingaben, nummeriert, immer mit denselben Abstaenden
//     ResultPanel  — die Antwort, getoent abgesetzt, immer an dieser Stelle
//     ToolFooter   — genau eine Handlungsaufforderung
//
// Vorher setzte jede Karte ihre eigenen Paddings, ihre eigene Reihenfolge und
// ihre eigenen Schriftgroessen — daher die ungleichmaessigen Abstaende und der
// Eindruck, mal sei es zu eng, mal stehe zu viel leer.

import { Slider } from '@/components/ui/slider';

// Ein Wert, den mehrere Karten brauchen: der horizontale Innenabstand. An
// einer Stelle definiert, damit Kopf, Eingaben und Fuss bündig stehen.
const PAD = 'px-4 sm:px-5';

export function TogButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      // Sichtbare Pille bleibt kompakt, die Tapp-Flaeche waechst ueber ein
      // unsichtbares after:-Pseudoelement auf die im Projekt geltenden 44 px
      // (Mobile-Plan B5).
      className={`relative px-3.5 py-2 rounded-xl text-[13px] transition-all cursor-pointer after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-11 after:h-11${active ? ' chip-active' : ''}`}
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

/** Chip-Reihe. Immer dieselbe Luecke, damit Umbrueche ueberall gleich fallen. */
export function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

// Kein backdrop-filter: var(--card-bg) ist ein vollstaendig deckender Verlauf
// (index.css). Hinter einer deckenden Karte zu blurren ist unsichtbar und reine
// Compositing-Arbeit.
// Bewusst OHNE h-full: im Deck hatten alle Karten die feste Deckhoehe und
// streckten ihren Inhalt darauf — eine Karte mit drei Zahlenfeldern bekam so
// dieselbe Hoehe wie die vollste und stand entsprechend leer. Jetzt ist jede
// Karte so hoch wie ihr Inhalt, und der Deck-Slot zentriert sie vertikal.
export function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col rounded-3xl overflow-hidden"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}
    >
      {children}
    </div>
  );
}

export function ToolHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className={`${PAD} pt-4 pb-3 sm:pt-5 sm:pb-4`} style={{ borderBottom: '1px solid var(--inset-bd)' }}>
      <div className="flex items-start gap-3">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.22) 0%, rgba(var(--accent-rgb),0.06) 100%)',
            border: '1px solid rgba(var(--accent-rgb),0.30)',
          }}
        >
          {icon}
        </span>
        <span className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--tx1)' }}>{title}</h3>
          <p className="text-[12px] leading-snug mt-0.5" style={{ color: 'var(--txf)' }}>{subtitle}</p>
        </span>
      </div>
    </div>
  );
}

/** Der Eingabebereich. Waechst mit seinem Inhalt, streckt sich nicht. */
export function StepList({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${PAD} pt-4 pb-4 flex flex-col gap-4`}>
      {children}
    </div>
  );
}

export function ToolFooter({ children }: { children: React.ReactNode }) {
  return <div className={`${PAD} pb-4 sm:pb-5`}>{children}</div>;
}

export function ToolSlider({ value, onValueChange, min, max, step, ariaLabel }: {
  value: number; onValueChange: (v: number) => void;
  min: number; max: number; step: number; ariaLabel: string;
}) {
  return (
    <Slider
      value={[value]}
      onValueChange={v => onValueChange(v[0])}
      min={min} max={max} step={step}
      className="py-1"
      aria-label={ariaLabel}
    />
  );
}

/** Zahleneingabe im Kartenstil. */
export function NumberInput({ value, onChange, min, max, step, ariaLabel, theme, suffix }: {
  value: string; onChange: (v: string) => void;
  min: number; max: number; step?: number; ariaLabel: string; theme: string; suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={`w-full px-3.5 py-2.5 rounded-xl text-[14px] tabular-nums ${suffix ? 'pr-12' : ''}`}
        style={{
          background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)',
          colorScheme: theme === 'noir' ? 'dark' : 'light',
        }}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none" style={{ color: 'var(--txff)' }}>
          {suffix}
        </span>
      )}
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

/** Kleiner Hinweis unter einem Schritt — Warnungen, Einschraenkungen. */
export function StepNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11.5px] leading-snug" style={{ color: 'var(--txff)' }}>{children}</p>
  );
}
