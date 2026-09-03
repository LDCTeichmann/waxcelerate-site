// ── Die Antwort, immer an derselben Stelle und immer gleich gebaut ──────────
//
// Loest drei Beanstandungen auf einmal.
//
// Gleiche Stelle: die Antwort steht in jeder Karte unten, nach den Eingaben
// und vor der Handlungsaufforderung. Vorher stand sie oben und jede Karte
// baute sie leicht anders — mal 56 px, mal 72 px, mal mit, mal ohne
// Begruendungszeile.
//
// Optisch abgesetzt: der getoente Block fuellt den Raum, der vorher als
// Leerflaeche zwischen Bedienelementen und Knopf stand, und trennt zugleich
// sichtbar „was ich eingebe" von „was dabei herauskommt".
//
// Weniger Zahlen gleichzeitig: genau eine grosse Zahl, ein Satz Klartext dazu,
// darunter hoechstens zwei Zusatzangaben. Alles Weitere gehoert nicht ins
// Ergebnis, sondern in die Erklaerung unter der Karte.

export type ResultTone = 'neutral' | 'good' | 'warn';

export function ResultPanel({
  value, unit, verdict, facts, tone = 'neutral', actions, children,
}: {
  /** Die eine grosse Zahl. Node, damit AnimatedNumber hineinpasst. */
  value: React.ReactNode;
  unit?: string;
  /** Ein Satz Klartext: was die Zahl bedeutet und was zu tun ist. */
  verdict?: React.ReactNode;
  /** Hoechstens zwei Kurzangaben, je Label und Wert. */
  facts?: { label: string; value: string }[];
  tone?: ResultTone;
  actions?: React.ReactNode;
  /** Wenn die Antwort keine Zahl ist, sondern eine Liste — etwa die Ketten,
   *  die passen. Steht zwischen Urteil und Kennzahlen. */
  children?: React.ReactNode;
}) {
  const accent = tone === 'neutral' ? 'var(--tx1)' : 'var(--brand)';
  return (
    <div
      className="mx-4 mb-4 sm:mx-5 sm:mb-5 rounded-2xl px-4 py-4 sm:px-5 sm:py-5"
      style={{
        background: tone === 'neutral' ? 'var(--inset-bg)' : 'rgba(var(--accent-rgb),0.07)',
        border: tone === 'neutral' ? '1px solid var(--inset-bd)' : '1px solid rgba(var(--accent-rgb),0.28)',
      }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[34px] sm:text-[40px] font-bold leading-none tabular-nums" style={{ color: accent }}>
          {value}
        </span>
        {unit && (
          <span className="text-[15px] sm:text-[16px] font-semibold leading-none" style={{ color: 'var(--tx2)' }}>
            {unit}
          </span>
        )}
      </div>

      {verdict && (
        <p className="text-[13px] leading-snug mt-2" style={{ color: 'var(--tx2)' }}>
          {verdict}
        </p>
      )}

      {children && <div className="mt-3">{children}</div>}

      {facts && facts.length > 0 && (
        <dl className="flex flex-wrap gap-x-5 gap-y-1 mt-3 pt-3" style={{ borderTop: '1px solid var(--inset-bd)' }}>
          {facts.map(f => (
            <div key={f.label} className="flex items-baseline gap-1.5">
              <dt className="text-meta" style={{ color: 'var(--txff)' }}>{f.label}</dt>
              <dd className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {actions && <div className="mt-3">{actions}</div>}
    </div>
  );
}
