import { useState } from 'react';

// ── CompareTable — eine Vergleichstabelle fuer alle Orte im Code, die vorher
// je eine eigene, harte grid-cols-Implementierung hatten: das "Vergleich"-
// Akkordeon und die "Vorgewachst vs. Kettenöl"-Tabelle in
// ProductDetailPage.tsx, sowie CompareModal in products.tsx. Keine der drei
// hatte einen Mobile-Zweig — vier Spalten wurden bei 390px einfach in
// dasselbe Raster gequetscht ("Ölfilm, bindet Dreck" brach zu Matsch), und
// keine hob die Gewinnerspalte optisch klar genug hervor (nur eingefaerbter
// Text statt einer eigenen Flaeche).
//
// Ab `sm:` das bekannte Grid-Layout, jetzt mit einer durchgehend getoenten
// Gewinnerspalte statt nur eingefaerbtem Text. Darunter eine Karte pro
// Attribut ("card transformation" — das anerkannte Mobile-Muster fuer
// breite Tabellen: LogRocket/UX-Patterns-Recherche zur Produktkarten-
// Neugliederung), plus optionalem Einklappen nachrangiger Spalten
// (`secondaryCols`) hinter einem "+ N vergleichen"-Button statt
// horizontalem Scrollen — eine versteckte, weggescrollte Spalte wird
// erfahrungsgemaess uebersehen, ein eingeklappter Button nicht.
export interface CompareRow {
  label: string;
  /** Positionsgleich zu `headers` — cols[i] gehoert zu headers[i]. */
  cols: string[];
  winCol?: number;
  dimCols?: number[];
}

export function CompareTable({ headers, rows, images, secondaryCols, accentColor, de, expanded, onToggleExpanded }: {
  headers: string[];
  rows: CompareRow[];
  /** Ein Foto je Spalte, optional — nur die Desktop-Kopfzeile zeigt sie
      (CompareModal in products.tsx nutzt das fuer Classic/Pro-Fotos). */
  images?: string[];
  /** Spaltenindizes, die auf Mobile hinter "+ N vergleichen" verschwinden,
      bis expanded true ist. */
  secondaryCols?: number[];
  /** Hex-Farbe, kein CSS-Var-String — wird mit einem Alpha-Suffix zur
      Toenung der Gewinnerspalte verwendet, gleiches Muster wie cardAccent
      in ProductDetailPage.tsx (`${cardAccent}12`). */
  accentColor: string;
  de: boolean;
  /** Kontrollierter State, damit ein Elternteil (z. B. die Kurzvergleichs-
      Bande) den aufgeklappten Zustand ueber einen Re-Mount hinweg halten
      kann. Unkontrolliert (eigener useState) wenn weggelassen. */
  expanded?: boolean;
  onToggleExpanded?: (next: boolean) => void;
}) {
  const clean = (h: string) => h.replace('Waxcelerate ', '').replace('-Heißwachs', '');
  const winBg = `${accentColor}0F`;
  const hasSecondary = !!secondaryCols?.length;

  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = expanded ?? localExpanded;
  const toggle = () => (onToggleExpanded ?? setLocalExpanded)(!isExpanded);

  return (
    <div>
      {/* ── Desktop / Tablet ── */}
      <div className="hidden sm:block rounded-lg overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
        <div className="grid gap-x-1.5 text-meta font-semibold uppercase tracking-wider px-3 py-2.5"
          style={{ gridTemplateColumns: `1.4fr repeat(${headers.length}, 1fr)`, background: 'var(--sf2)', borderBottom: '1px solid var(--bd)', color: 'var(--txff)' }}>
          <span />
          {headers.map((h, i) => (
            <span key={i} className="flex flex-col items-center gap-1 text-center leading-tight text-meta break-words py-1 rounded-md"
              style={{ background: rows.some(r => r.winCol === i) ? winBg : 'transparent' }}>
              {images?.[i] && (
                <img src={images[i]} alt="" className="h-10 w-10 rounded-md object-cover" style={{ border: '1px solid var(--bd)' }} />
              )}
              {clean(h)}
            </span>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="grid gap-x-1.5 px-3 py-2.5 text-meta"
            style={{ gridTemplateColumns: `1.4fr repeat(${headers.length}, 1fr)`, borderBottom: ri < rows.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <span style={{ color: 'var(--txm)' }}>{row.label}</span>
            {row.cols.map((col, ci) => (
              <span key={ci} className="text-center font-medium py-0.5 rounded-md"
                style={{
                  color: ci === row.winCol ? accentColor : row.dimCols?.includes(ci) ? 'var(--txff)' : 'var(--tx2)',
                  background: ci === row.winCol ? winBg : 'transparent',
                }}>
                {col}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── Mobile ── */}
      <div className="sm:hidden space-y-2.5">
        {rows.map((row, ri) => {
          const cells = headers.map((h, i) => ({ h, v: row.cols[i], i })).filter(c => isExpanded || !secondaryCols?.includes(c.i));
          return (
            <div key={ri} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
              <p className="text-meta font-semibold uppercase tracking-wider px-3 py-2" style={{ background: 'var(--sf2)', color: 'var(--txff)' }}>
                {row.label}
              </p>
              {cells.map(({ h, v, i }) => (
                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2"
                  style={{ background: i === row.winCol ? winBg : 'transparent', borderTop: '1px solid var(--bd)' }}>
                  <span className="text-[12px]" style={{ color: 'var(--txm)' }}>{clean(h)}</span>
                  <span className="text-[12.5px] font-medium text-right"
                    style={{ color: i === row.winCol ? accentColor : row.dimCols?.includes(i) ? 'var(--txff)' : 'var(--tx2)' }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
        {hasSecondary && (
          <button type="button" onClick={toggle}
            className="w-full text-center py-2 text-[12.5px] font-semibold"
            style={{ color: accentColor }}>
            {isExpanded
              ? (de ? 'Weniger anzeigen' : 'Show less')
              : `+ ${secondaryCols!.map(i => clean(headers[i])).join(', ')} ${de ? 'vergleichen' : 'compare'}`}
          </button>
        )}
      </div>
    </div>
  );
}
