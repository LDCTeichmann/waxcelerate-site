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
// Feste Geometrie statt nur fester Reihenfolge: `mt-auto` sitzt jetzt an
// diesem Block, nicht mehr nur an ToolFooter — der freie Raum sammelt sich
// dadurch IMMER ueber dem Ergebnis, nie darunter, und die Oberkante des
// Ergebnisblocks liegt in allen sechs Karten auf derselben Hoehe, egal wie
// viele Eingabeschritte darueber stehen. Der Urteilssatz bekommt dafuer eine
// feste Zwei-Zeilen-Hoehe (`min-h` + `line-clamp-2`) und die Kennzahl-Zeile
// wird immer gerendert (bis zu zwei Eintraege nebeneinander) — sonst aendert
// sich die Blockhoehe selbst noch von Rechner zu Rechner.
//
// Weniger Zahlen gleichzeitig: genau eine grosse Zahl, ein Satz Klartext dazu,
// hoechstens zwei Zusatzangaben. Alles Weitere gehoert nicht ins Ergebnis,
// sondern in ein Popover oder auf die Rechner-Einzelseite.
//
// Die Handlungsaufforderung steht seit dem Hoehen-Umbau IN diesem Block statt
// als eigener Streifen darunter (der frueheren ToolFooter). Das spart die
// doppelten Innenabstaende — Karte und Block hatten je 16-20 px — und liest
// sich richtiger: Antwort und naechster Schritt gehoeren zusammen.
//
// Teilen und Termin sitzen im Kartenstapel (`compact`) rechts NEBEN der grossen
// Zahl: diese Zeile ist rechts ohnehin leer, eine eigene Zeile darunter kostete
// 46 px. Die Karte muss dort in eine Bildschirmhoehe passen (ToolTrack.tsx), und
// 46 px sind der Unterschied zwischen „Antwort sichtbar" und „abgeschnitten".
// Dort tragen die Knoepfe nur ihr Symbol (ResultActions `compact`) und brauchen
// rund 80 px. Auf den /rechner-Seiten sind sie beschriftet, brauchen damit ueber
// 250 px und stehen deshalb weiterhin in einer eigenen Zeile — nebeneinander
// legten sie sich bei schmalem Fenster ueber die Zahl.

export type ResultTone = 'neutral' | 'good' | 'warn';

export function ResultPanel({
  value, unit, verdict, facts, tone = 'neutral', actions, hero, cta, compact,
}: {
  /** Die eine grosse Zahl. Node, damit AnimatedNumber hineinpasst. */
  value: React.ReactNode;
  unit?: string;
  /** Ein bis zwei Saetze Klartext: was die Zahl bedeutet und was zu tun ist. */
  verdict?: React.ReactNode;
  /** Bis zu zwei Eintraege, nebeneinander. */
  facts?: { label: string; value: string }[];
  tone?: ResultTone;
  actions?: React.ReactNode;
  /** Schmaler Streifen zwischen der grossen Zahl und dem Urteil, z. B. ein
      Balkenvergleich. Optional — nur zwei Karten (Umstieg, Ersparnis)
      nutzen ihn, und verzichten dafuer auf die zweite Kennzahl. */
  hero?: React.ReactNode;
  /** Die eine Handlungsaufforderung, unterste Zeile des Blocks. */
  cta?: React.ReactNode;
  /** Im Kartenstapel der Startseite: Aktionen als Symbole neben die Zahl. */
  compact?: boolean;
}) {
  const shownFacts = (facts ?? []).slice(0, 2);
  const accent = tone === 'neutral' ? 'var(--tx1)' : 'var(--brand)';
  return (
    <div
      className="mt-auto mx-3.5 mb-3.5 sm:mx-4 sm:mb-4 rounded-2xl px-3.5 py-3 sm:px-4"
      style={{
        background: tone === 'neutral' ? 'var(--inset-bg)' : 'rgba(var(--accent-rgb),0.07)',
        border: tone === 'neutral' ? '1px solid var(--inset-bd)' : '1px solid rgba(var(--accent-rgb),0.28)',
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-2 min-w-0">
          <span className="text-[30px] sm:text-[34px] font-bold leading-none tabular-nums" style={{ color: accent }}>
            {value}
          </span>
          {unit && (
            <span className="text-[15px] sm:text-[16px] font-semibold leading-none truncate" style={{ color: 'var(--tx2)' }}>
              {unit}
            </span>
          )}
        </span>
        {compact && actions && <span className="flex-shrink-0 self-center">{actions}</span>}
      </div>

      {hero && <div className="mt-2.5">{hero}</div>}

      <p className="text-[12.5px] leading-snug mt-1.5 line-clamp-2 min-h-[2.4em]" style={{ color: 'var(--tx2)' }}>
        {verdict}
      </p>

      {shownFacts.length > 0 && (
        <dl
          className="grid gap-x-3 gap-y-1.5 mt-2 pt-2"
          style={{ borderTop: '1px solid var(--inset-bd)', gridTemplateColumns: `repeat(${shownFacts.length}, minmax(0,1fr))` }}
        >
          {shownFacts.map(f => (
            <div key={f.label} className="min-w-0">
              <dt className="text-meta truncate" style={{ color: 'var(--txff)' }}>{f.label}</dt>
              <dd className="text-[12px] font-medium tabular-nums truncate" style={{ color: 'var(--tx2)' }}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!compact && actions && <div className="mt-2.5">{actions}</div>}

      {cta && <div className="mt-2.5">{cta}</div>}
    </div>
  );
}
