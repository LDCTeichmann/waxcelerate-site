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
// Fragezeichen-Knopf oeffnet ein Popover, das sagt, wo man das am Rad
// abliest — ohne die Karte im Normalfall zu verlaengern. Frueher klappte das
// inline auf und schob den Rest der Karte nach unten; mit einer festen
// Kartenhoehe (ToolTrack.tsx) darf kein Klick mehr das Layout veraendern,
// daher das Popover statt Inline-Aufklappen (siehe InfoPopover in primitives.tsx).

import { HelpCircle } from 'lucide-react';
import { InfoPopover } from '@/components/tools/primitives';

export function StepField({ step, label, value, help, figure, children }: {
  /** Schrittnummer ab 1. Weglassen (oder 0) bei Feldern ausserhalb einer
   *  Schrittfolge, etwa in der Profilleiste — dort waere eine Nummer irrefuehrend. */
  step?: number;
  label: string;
  /** Aktueller Wert, rechts neben dem Label. */
  value?: string;
  /** Wo man das am Rad abliest. Ohne help erscheint kein Fragezeichen. */
  help?: string;
  /** Skizze zur Erklaerung, erscheint zusammen mit dem Hilfetext. Manche
   *  Angaben sind raeumlich und mit Worten kaum zu treffen. */
  figure?: React.ReactNode;
  children: React.ReactNode;
}) {
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
          {(help || figure) && (
            <InfoPopover
              ariaLabel={`${label}: Erklärung`}
              trigger={open => <HelpCircle className="h-3.5 w-3.5" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
            >
              {help && (
                <p className="text-[12px] leading-snug" style={{ color: 'var(--txm)' }}>{help}</p>
              )}
              {figure && <div className={help ? 'mt-1' : ''}>{figure}</div>}
            </InfoPopover>
          )}
        </span>
        {value && (
          <span className="text-[13px] font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--tx2)' }}>
            {value}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
