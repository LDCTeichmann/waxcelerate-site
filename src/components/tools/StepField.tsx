// ── Eine Eingabe, als Schritt ───────────────────────────────────────────────
//
// Zwei Probleme, die das loest.
//
// Erstens die Reihenfolge: die Karten zeigten oben ein Ergebnis und darunter
// die Eingaben. Wer zum ersten Mal draufschaut, sieht damit eine Zahl, die er
// nicht einordnen kann, bevor er weiss, worauf sie sich bezieht. Nummerierte
// Schritte lesen sich von oben nach unten wie ein Formular, und das Ergebnis
// steht am Ende, wo eine Antwort hingehoert.
//
// Zweitens die Verstaendlichkeit: „Gangzahl" oder „groesstes Ritzel" sind fuer
// jemanden ohne Schrauber-Vokabular keine selbsterklaerenden Begriffe. Der
// Fragezeichen-Knopf klappt eine Zeile auf, die sagt, wo man das am Rad
// abliest — ohne die Karte im Normalfall zu verlaengern.

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export function StepField({ step, label, value, help, children }: {
  /** Schrittnummer ab 1. Weglassen (oder 0) bei Feldern ausserhalb einer
   *  Schrittfolge, etwa in der Profilleiste — dort waere eine Nummer irrefuehrend. */
  step?: number;
  label: string;
  /** Aktueller Wert, rechts neben dem Label. */
  value?: string;
  /** Wo man das am Rad abliest. Ohne help erscheint kein Fragezeichen. */
  help?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="flex items-baseline gap-2 min-w-0">
          {!!step && (
            <span
              className="flex-shrink-0 text-meta font-semibold tabular-nums"
              style={{ color: 'var(--brand)' }}
            >
              {step}
            </span>
          )}
          <span
            className="text-meta uppercase tracking-[0.1em] font-medium truncate"
            style={{ color: 'var(--txf)' }}
          >
            {label}
          </span>
          {help && (
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-label={`${label}: Erklärung`}
              className="relative flex-shrink-0 transition-opacity hover:opacity-70 cursor-pointer after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
            >
              <HelpCircle className="h-3.5 w-3.5" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />
            </button>
          )}
        </span>
        {value && (
          <span className="text-[13px] font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--tx2)' }}>
            {value}
          </span>
        )}
      </div>
      {open && help && (
        <p className="text-[12px] leading-snug mb-2" style={{ color: 'var(--txm)' }}>
          {help}
        </p>
      )}
      {children}
    </div>
  );
}
