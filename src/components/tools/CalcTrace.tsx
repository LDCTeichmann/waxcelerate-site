// ── So rechnen wir ──────────────────────────────────────────────────────────
//
// Die Annahmen (AssumptionsDisclosure) sagen, WOMIT gerechnet wird. Hier steht,
// WIE — Zeile fuer Zeile mit den Zahlen des eigenen Profils, damit jede Zahl
// der Karte nachrechenbar ist. Im Kartenstapel steht die Liste im Info-Popover
// (feste Kartenhoehe), auf den /rechner-Seiten aufklappbar unter der Karte.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface TraceRow {
  label: string;
  /** Der Rechenweg mit eingesetzten Zahlen. */
  detail?: string;
  value: string;
  /** Ergebniszeile: abgesetzt und hervorgehoben. */
  total?: boolean;
}

export function CalcTrace({ rows }: { rows: TraceRow[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(r => (
        <div
          key={r.label}
          className={`flex items-baseline justify-between gap-3 ${r.total ? 'pt-1.5 mt-0.5' : ''}`}
          style={r.total ? { borderTop: '1px solid var(--inset-bd)' } : undefined}
        >
          <span className="min-w-0">
            <span className="block text-[12px]" style={{ color: r.total ? 'var(--tx1)' : 'var(--tx2)', fontWeight: r.total ? 600 : 500 }}>
              {r.label}
            </span>
            {r.detail && (
              <span className="block text-[12px] sm:text-[11.5px] leading-snug tabular-nums" style={{ color: 'var(--txf)' }}>{r.detail}</span>
            )}
          </span>
          <span
            className="text-[12px] tabular-nums flex-shrink-0"
            style={{ color: r.total ? 'var(--brand)' : 'var(--tx2)', fontWeight: r.total ? 700 : 500 }}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CalcTraceDisclosure({ rows }: { rows: TraceRow[] }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-3.5 mb-3.5 sm:mx-4 sm:mb-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="relative flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer after:content-[''] after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:h-11"
        style={{ color: 'var(--brand)' }}
      >
        {t.tools.shared.traceTitle}
        <ChevronDown className="h-3.5 w-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && (
        <div className="mt-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)' }}>
          <CalcTrace rows={rows} />
        </div>
      )}
    </div>
  );
}

/** Kopfzeile fuer die Liste im Info-Popover des Kartenstapels. */
export function CalcTraceHeading() {
  const { t } = useLanguage();
  return (
    <span className="text-meta uppercase tracking-[0.1em] font-semibold pt-1" style={{ color: 'var(--tx2)', borderTop: '1px solid var(--inset-bd)' }}>
      {t.tools.shared.traceTitle}
    </span>
  );
}
