// ── Ein Ergebnis sieht ueberall gleich aus ──────────────────────────────────
//
// Vorher baute jede Karte ihren Ergebnisblock selbst, mit leicht abweichenden
// Groessen und Abstaenden (56 px hier, 72 px dort, unterschiedliche Reihenfolge
// von Begruendung und Meta-Zeile). Genau das liess die drei Rechner wie drei
// fremde Werkzeuge wirken statt wie ein System. Ab hier gibt es eine Komponente:
// grosse Zahl, Einheit, eine Begruendungszeile, eine Meta-Zeile, eine
// Aktionsreihe. Wer davon etwas nicht braucht, laesst es weg.

export type ResultTone = 'neutral' | 'good' | 'warn' | 'alert';

const TONE_COLOR: Record<ResultTone, string> = {
  neutral: 'var(--tx1)',
  good: 'var(--brand)',
  // Kein eigenes Rot/Gelb im Design-System — Warnstufen unterscheiden sich
  // ueber Gewicht und die Begruendungszeile, nicht ueber Ampelfarben.
  warn: 'var(--tx1)',
  alert: 'var(--brand)',
};

export function ToolResult({
  value, unit, reason, meta, tone = 'neutral', actions, compact = false,
}: {
  /** Die grosse Zahl. Als Node, damit AnimatedNumber hier hineinpasst. */
  value: React.ReactNode;
  unit?: string;
  /** Ein Satz, warum das Ergebnis so lautet. */
  reason?: React.ReactNode;
  /** Kleingedrucktes darunter — Datum, Umrechnung, Grenzwert. */
  meta?: React.ReactNode;
  tone?: ResultTone;
  /** Kalender-, Teilen- oder Kauf-Aktionen. */
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`px-6 text-center flex flex-col items-center ${compact ? 'pt-2.5 pb-2 sm:pt-4 sm:pb-4' : 'pt-3 pb-3 sm:pt-6 sm:pb-6'}`}>
      <div className="flex items-baseline justify-center gap-2 mb-1 sm:mb-2">
        <span
          className="text-[40px] sm:text-[56px] font-bold leading-none tabular-nums"
          style={{ color: TONE_COLOR[tone] }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[18px] sm:text-[22px] font-semibold leading-none" style={{ color: 'var(--tx2)' }}>
            {unit}
          </span>
        )}
      </div>
      {reason && (
        <p className="text-[12px] sm:text-[13px] max-w-[38ch] leading-snug" style={{ color: 'var(--txf)' }}>
          {reason}
        </p>
      )}
      {meta && (
        <div className="flex items-center gap-2.5 mt-1.5 sm:mt-2 flex-wrap justify-center">
          {meta}
        </div>
      )}
      {actions && <div className="w-full mt-3 sm:mt-4">{actions}</div>}
    </div>
  );
}

/** Punkt-getrennte Kleinteile fuer die Meta-Zeile. */
export function ResultMeta({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] tabular-nums" style={{ color: 'var(--txm)' }}>{children}</span>;
}

export function ResultDot() {
  return <span style={{ color: 'var(--bd2)' }}>·</span>;
}
