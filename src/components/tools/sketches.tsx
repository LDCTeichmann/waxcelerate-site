// ── Skizzen, die rechnen ────────────────────────────────────────────────────
//
// Mit dem Hoehen-Umbau (f26cf83) war diagrams.tsx geloescht worden — die Karten
// sollten auf eine Bildschirmhoehe passen, und die Skizzen kosteten Hoehe. Das
// Ergebnis waren Rechner, die Begriffe wie „Kettenstrebe" oder „Lehrenmarke"
// abfragten, ohne zu zeigen, was gemeint ist. Die Bildschirmhoehen-Regel ist
// wieder aufgehoben; die Skizzen sind zurueck.
//
// Seit 09/2026 hat jede Karte genau EINE Grafik, die mit der Eingabe
// mitrechnet: der Antrieb der Kettenlaenge (Groesse der Zahnraeder und
// Strebenlaenge folgen den Feldern) samt Zaehl-Skizze, die Kosten-Hantel, die
// Verschleissskala und der Rewax-Zeitstrahl. Messstrecke, Lehre, Kostenkurve
// und Kassetten-Vergleich sind raus (siehe Grafik-Grammatik weiter unten).
//
// Weiterhin eigene SVG statt Fotos oder Videos: keine Rechte Dritter, keine
// Cookies, Themefarben inklusive.

import { useLayoutEffect, useRef, useState } from 'react';

const STROKE = 'var(--tx2)';
const FAINT = 'var(--bd2)';
const ACCENT = 'var(--brand)';
const LABEL = 'var(--txm)';
/** Weiche Uebergaenge, wenn eine Eingabe die Geometrie aendert. */
const MORPH: React.CSSProperties = { transition: 'all 280ms var(--ease-ui, ease)' };

// ── Kettenlaenge ────────────────────────────────────────────────────────────

/** Teilkreisradius eines Zahnrads in mm: Umfang = Zaehne × 12,7 mm Teilung. */
const pitchRadiusMm = (teeth: number) => (teeth * 12.7) / (2 * Math.PI);

export type DrivetrainPart = 'stay' | 'ring' | 'sprocket' | null;

/**
 * Seitenansicht Kette um groesstes Kettenblatt und groesstes Ritzel —
 * genau die Lage, die die Formel beschreibt: zwei gerade Trume (je einmal die
 * Kettenstrebe), ungefaehr eine halbe Umschlingung vorne und hinten, plus
 * Reserve fuers Schaltwerk. Die drei Anteile tragen dieselben Markierungen wie
 * die Zeilen der Rechnung unter der Skizze.
 *
 * Masstaeblich: Radien aus der Zaehnezahl, Achsabstand aus der Strebenlaenge.
 * Wer 34 auf 42 Zaehne stellt, sieht das Ritzel wachsen.
 */
export function DrivetrainSketch({ chainstayMm, chainring, sprocket, focus, de = true }: {
  chainstayMm: number; chainring: number; sprocket: number; focus: DrivetrainPart; de?: boolean;
}) {
  const K = 0.34; // px je mm
  const CY = 74;
  const RX = 64; // Hinterachse, fest
  const d = Math.min(Math.max(chainstayMm, 350), 550) * K;
  const r1 = pitchRadiusMm(Math.min(Math.max(sprocket, 9), 60)) * K;
  const r2 = pitchRadiusMm(Math.min(Math.max(chainring, 20), 60)) * K;
  const FX = RX + d;

  // Aeussere Tangenten: Normale n mit n.x = -(r2 - r1)/d, oben n.y < 0.
  const nx = -(r2 - r1) / d;
  const ny = Math.sqrt(Math.max(0, 1 - nx * nx));
  const p = (cx: number, r: number, sy: number) => ({ x: cx + r * nx, y: CY + sy * r * ny });
  const u1 = p(RX, r1, -1), u2 = p(FX, r2, -1);
  const l1 = p(RX, r1, 1), l2 = p(FX, r2, 1);

  const on = (part: DrivetrainPart) => focus === null || focus === part;
  const dim = (part: DrivetrainPart) => ({ opacity: on(part) ? 1 : 0.28, ...MORPH });

  const teethRing = (cx: number, r: number, n: number) => {
    // Kurze Zahnstriche statt echter Zahnform — lesbar und leicht.
    const ticks = Math.min(n, 60);
    return Array.from({ length: ticks }, (_, i) => {
      const a = (i / ticks) * Math.PI * 2;
      return `M${(cx + Math.cos(a) * r).toFixed(1)},${(CY + Math.sin(a) * r).toFixed(1)} L${(cx + Math.cos(a) * (r + 2.6)).toFixed(1)},${(CY + Math.sin(a) * (r + 2.6)).toFixed(1)}`;
    }).join(' ');
  };

  // Umschlingung: hinten ueber die linke Seite, vorne ueber die rechte.
  // Das kleinere Rad wird unter 180 Grad umschlungen, das groessere darueber.
  const wrapRear = `M${u1.x},${u1.y} A${r1},${r1} 0 ${r1 > r2 ? 1 : 0} 0 ${l1.x},${l1.y}`;
  const wrapFront = `M${u2.x},${u2.y} A${r2},${r2} 0 ${r2 >= r1 ? 1 : 0} 1 ${l2.x},${l2.y}`;

  const CHAIN = { strokeWidth: 3.2, strokeLinecap: 'butt' as const, strokeDasharray: '3.4 1.6', fill: 'none' };

  return (
    <svg viewBox="0 0 320 156" className="w-full h-auto" role="img"
      aria-label={de
        ? `Kette um Kettenblatt mit ${chainring} Zähnen und Ritzel mit ${sprocket} Zähnen, Kettenstrebe ${chainstayMm} mm`
        : `Chain around a ${chainring}-tooth chainring and ${sprocket}-tooth sprocket, chainstay ${chainstayMm} mm`}>
      {/* Zahnraeder */}
      <g stroke={STROKE} strokeWidth={1.2} fill="var(--sf2)">
        <circle cx={RX} cy={CY} r={r1} style={dim('sprocket')} />
        <circle cx={FX} cy={CY} r={r2} style={dim('ring')} />
      </g>
      <path d={teethRing(RX, r1, sprocket)} stroke={STROKE} strokeWidth={1} style={dim('sprocket')} />
      <path d={teethRing(FX, r2, chainring)} stroke={STROKE} strokeWidth={1} style={dim('ring')} />

      {/* Strebe als Rohr zwischen den Achsen, darunter liegend */}
      <line x1={RX} y1={CY} x2={FX} y2={CY} stroke={FAINT} strokeWidth={7} strokeLinecap="round" style={MORPH} />
      <circle cx={RX} cy={CY} r={3.2} fill={STROKE} />
      <circle cx={FX} cy={CY} r={4.2} fill={STROKE} />

      {/* Kette: Trume = 2 × Strebe, Umschlingungen = je halbe Zaehnezahl */}
      <path d={wrapRear} stroke="var(--tx1)" {...CHAIN} style={dim('sprocket')} />
      <path d={wrapFront} stroke="var(--tx1)" {...CHAIN} style={dim('ring')} />
      <path d={`M${u1.x},${u1.y} L${u2.x},${u2.y} M${l1.x},${l1.y} L${l2.x},${l2.y}`} stroke={ACCENT} {...CHAIN} style={dim('stay')} />

      {/* Massangaben */}
      <g style={dim('stay')}>
        <path d={`M${RX},${CY + 48} v8 M${FX},${CY + 48} v8 M${RX},${CY + 52} H${FX}`} stroke={ACCENT} strokeWidth={1.2} style={MORPH} />
        <text x={(RX + FX) / 2} y={CY + 72} textAnchor="middle" fontSize="12.5" fill={ACCENT} fontWeight={600} style={MORPH}>
          {de ? 'Kettenstrebe' : 'Chainstay'} · {chainstayMm} mm
        </text>
      </g>
      <text x={RX} y={Math.max(13, CY - r1 - 10)} textAnchor="middle" fontSize="12.5" fill={LABEL} style={{ ...dim('sprocket') }}>
        {de ? 'Ritzel' : 'Sprocket'} · {sprocket}
      </text>
      <text x={FX} y={Math.max(13, CY - r2 - 10)} textAnchor="middle" fontSize="12.5" fill={LABEL} style={{ ...dim('ring') }}>
        {de ? 'Kettenblatt' : 'Chainring'} · {chainring}
      </text>
    </svg>
  );
}

/**
 * Wie man die alte Kette zaehlt: jeder Bolzen ist ein halbes Gliederpaar,
 * also ein Glied. Innen- und Aussenlaschen wechseln sich ab, das Kettenschloss
 * ersetzt ein Aussenglied und zaehlt mit.
 */
export function ChainCountSketch({ de = true }: { de?: boolean }) {
  const R = 8;
  const PITCH = 32;
  const CY = 48;
  const xs = Array.from({ length: 9 }, (_, i) => 27 + i * PITCH);
  const LOCK = 3; // Index des Kettenschlosses (Aussenglied zwischen xs[3] und xs[4])

  return (
    <svg viewBox="0 0 310 120" className="w-full h-auto" role="img"
      aria-label={de ? 'Glieder der alten Kette zählen: jeder Bolzen ist ein Glied' : 'Count the links of the old chain: each pin is one link'}>
      <g strokeWidth={1.3}>
        {xs.slice(0, -1).map((x, i) => {
          const outer = i % 2 === 1;
          const lock = i === LOCK;
          return (
            <rect key={x}
              x={x - R - (outer ? 2 : 0)} y={CY - R - (outer ? 2 : 0)}
              width={PITCH + (R + (outer ? 2 : 0)) * 2} height={(R + (outer ? 2 : 0)) * 2}
              rx={R + (outer ? 2 : 0)}
              fill={outer ? 'none' : 'var(--sf2)'}
              stroke={lock ? ACCENT : STROKE}
              strokeWidth={lock ? 2 : 1.3}
            />
          );
        })}
        {xs.map(x => <circle key={`r${x}`} cx={x} cy={CY} r={R - 2} fill="var(--sf)" stroke={STROKE} />)}
      </g>
      {xs.map(x => <circle key={`p${x}`} cx={x} cy={CY} r={1.6} fill={STROKE} />)}

      {/* Zaehlmarken an jedem Bolzen */}
      {xs.map((x, i) => (
        <text key={`n${x}`} x={x} y={CY - 18} textAnchor="middle" fontSize="12" fontWeight={600}
          fill={i === LOCK || i === LOCK + 1 ? ACCENT : LABEL}>
          {i + 1}
        </text>
      ))}

      <path d={`M${(xs[LOCK] + xs[LOCK + 1]) / 2},${CY + 13} v12`} stroke={ACCENT} strokeWidth={1.2} />
      <text x={(xs[LOCK] + xs[LOCK + 1]) / 2} y={CY + 38} textAnchor="middle" fontSize="12" fill={ACCENT}>
        {de ? 'Kettenschloss zählt mit' : 'Quick link counts too'}
      </text>
      <text x="155" y={CY + 62} textAnchor="middle" fontSize="12" fill={LABEL}>
        {de ? 'Jeder Bolzen = 1 Glied · Summe immer gerade' : 'Every pin = 1 link · total always even'}
      </text>
    </svg>
  );
}

/**
 * Das Ergebnis als Kettenstueck: die letzten Glieder, die abkommen, sind
 * markiert. Macht aus „2 Glieder abnehmen" eine Handlung, die man sieht.
 */
export function ChainTrimBar({ remove, de = true }: { remove: number; de?: boolean }) {
  const shown = 12;
  const R = 4;
  const PITCH = 14;
  const xs = Array.from({ length: shown }, (_, i) => 12 + i * PITCH);
  const cut = shown - Math.min(remove, shown - 2);
  return (
    <svg viewBox="0 0 200 30" className="w-full h-auto max-w-[240px]" role="img"
      aria-label={de ? `${remove} Glieder am Ende abnehmen` : `Remove ${remove} links at the end`}>
      {xs.slice(0, -1).map((x, i) => (
        <rect key={x} x={x - R} y={14 - R} width={PITCH + R * 2} height={R * 2} rx={R}
          fill="none" stroke={i + 1 >= cut ? ACCENT : STROKE} strokeWidth={1.2}
          strokeDasharray={i + 1 >= cut ? '2 1.5' : undefined} opacity={i + 1 >= cut ? 1 : 0.7} />
      ))}
      {xs.map((x, i) => <circle key={`p${x}`} cx={x} cy={14} r={1.4} fill={i >= cut ? ACCENT : STROKE} />)}
      {remove > 0 && (
        <path d={`M${xs[cut - 1] + PITCH / 2},3 v22`} stroke={ACCENT} strokeWidth={1.4} />
      )}
    </svg>
  );
}

// ── Grafik-Grammatik ────────────────────────────────────────────────────────
//
// Die drei Diagramme unten (Kosten, Verschleiss, Intervall) folgen denselben
// Regeln, damit fuenf Karten wie ein Werkzeug aussehen (docs/DESIGN.md,
// „Rechner-Karten"):
//  - 1:1-Skala. Die Breite kommt per ResizeObserver aus dem Rahmen, die
//    viewBox ist genau so breit. Eine SVG-Einheit ist ein Pixel, 11 heisst 11 px
//    — vorher skalierte eine 310er-viewBox auf 440 px, und aus 8,5 wurde 12.
//  - Striche: Hilfslinien 1 px (--bd2), Daten 2 px.
//  - Direkt beschriftet, Legende nur bei zwei Reihen (Oel/Wachs).
//  - Farbe traegt die Identitaet der Marke, Text bleibt in Textfarben:
//    Wachs = --brand, Oel = --txf, gut = --ok, handeln = --warn.


/** Breite eines Elements in px, fuer 1:1-SVG. */
function useWidth<T extends HTMLElement>(fallback = 320) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(200, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const FONT = { fontSize: 11, fontFamily: 'inherit' } as const;
const OIL = 'var(--txf)';
const OK = 'var(--ok)';

// ── Kosten: Oel gegen Wachs, Posten fuer Posten ─────────────────────────────

export interface CostRow { label: string; oil: number; wax: number }

/**
 * Hantel-Diagramm: je Posten (Kette, Kassette, Schmierstoff) ein Oel-Punkt und
 * ein Wachs-Punkt auf derselben Euro-Achse, dazwischen die Differenz. Zeigt in
 * einem Blick, WOHER die Ersparnis kommt — und dass Wachs beim Schmierstoff
 * selbst teurer ist. Ersetzt Tabelle „Pro Jahr" und Kostenkurve, die dieselben
 * Zahlen zweimal zeigten.
 */
export function CostDumbbell({ rows, oilLabel, waxLabel, perYear, eur }: {
  rows: CostRow[]; oilLabel: string; waxLabel: string; perYear: string;
  eur: (n: number) => string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const ROW = 38, TOP = 26, LABEL_W = 80, DELTA_W = 46, PAD = 4;
  const H = TOP + rows.length * ROW + 4;
  const x0 = LABEL_W, x1 = W - DELTA_W - PAD;
  const max = Math.max(1, ...rows.flatMap(r => [r.oil, r.wax])) * 1.04;
  const x = (v: number) => x0 + (v / max) * (x1 - x0);

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block"
        aria-label={rows.map(r => `${r.label}: ${oilLabel} ${eur(r.oil)}, ${waxLabel} ${eur(r.wax)}`).join('; ')}>
        {/* Legende: zwei Reihen, also immer da. */}
        <g style={FONT}>
          <circle cx={x0 + 5} cy={9} r={4.5} fill="var(--sf)" stroke={OIL} strokeWidth={2} />
          <text x={x0 + 14} y={13} fill="var(--txm)">{oilLabel}</text>
          <circle cx={x0 + 56} cy={9} r={5} fill="var(--brand)" />
          <text x={x0 + 65} y={13} fill="var(--txm)">{waxLabel}</text>
          {W >= 300 && <text x={W - PAD} y={13} textAnchor="end" fill="var(--txff)">{perYear}</text>}
        </g>

        {rows.map((r, i) => {
          const cy = TOP + i * ROW + ROW / 2;
          const saves = r.wax <= r.oil;
          const d = r.wax - r.oil;
          return (
            <g key={r.label} style={{ transition: 'all 280ms ease' }}>
              <title>{`${r.label}: ${oilLabel} ${eur(r.oil)} · ${waxLabel} ${eur(r.wax)}`}</title>
              <line x1={x0} x2={x1} y1={cy} y2={cy} stroke="var(--bd2)" strokeWidth={1} />
              <text x={0} y={cy + 4} style={FONT} fontSize={12} fill="var(--tx2)">{r.label}</text>
              <line x1={x(r.oil)} x2={x(r.wax)} y1={cy} y2={cy}
                stroke={saves ? OK : 'var(--txff)'} strokeWidth={3} strokeLinecap="round" style={{ transition: 'all 280ms ease' }} />
              <circle cx={x(r.oil)} cy={cy} r={5} fill="var(--sf)" stroke={OIL} strokeWidth={2} style={{ transition: 'all 280ms ease' }} />
              <circle cx={x(r.wax)} cy={cy} r={6} fill="var(--brand)" stroke="var(--sf)" strokeWidth={2} style={{ transition: 'all 280ms ease' }} />
              {/* Werte an den Punkten: Oel oberhalb, Wachs unterhalb — kollidieren
                  so auch nicht, wenn beide Punkte nah beieinander liegen. */}
              <text x={x(r.oil)} y={cy - 9} textAnchor="middle" style={FONT} fill="var(--txf)">{eur(r.oil)}</text>
              <text x={x(r.wax)} y={cy + 17} textAnchor="middle" style={FONT} fill="var(--tx2)">{eur(r.wax)}</text>
              <text x={W - PAD} y={cy + 4} textAnchor="end" style={FONT} fontSize={12} fontWeight={600}
                fill={saves ? 'var(--tx1)' : 'var(--txf)'}>
                {d === 0 ? '±0' : `${d < 0 ? '−' : '+'}${eur(Math.abs(d))}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Verschleiss: wo liegt die Kette auf der Skala ───────────────────────────

/**
 * Laengungsskala 0 bis 1,25 %. Zonen folgen waxMath.wearVerdict: bis 80 % der
 * Grenze „faehrt", bis zur Grenze „bald", dann „tauschen", ab Grenze + 0,25
 * „Kassette pruefen", ab 1,0 % „Kassette mit". Die Grenze der gewaehlten
 * Gangzahl ist markiert — bei 9-fach steht sie bei 0,75, nicht bei 0,5.
 * Die Lehre misst keinen Wert, sie beantwortet Ja/Nein je Marke:
 * `bound: 'atLeast'` („die 0,5er faellt rein") zieht vom Marker eine
 * gestrichelte Spanne nach rechts, `bound: 'below'` („keine Marke greift")
 * eine Spanne von 0 bis zur kleinsten Marke — statt einen Punkt zu behaupten.
 */
export function WearScale({ percent, limit, bound, empty, labels, fmt }: {
  percent: number | null; limit: number; bound?: 'atLeast' | 'below'; empty?: string;
  labels: { ok: string; replace: string; cassette: string; limit: string; you: string };
  fmt: (n: number) => string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const MAX = 1.25, PAD = 10, H = 100, TY = 36, TH = 14;
  const x = (v: number) => PAD + (Math.min(v, MAX) / MAX) * (W - PAD * 2);
  const check = Math.min(limit + 0.25, 1.0);
  const zones = [
    { from: 0, to: limit * 0.8, fill: 'var(--bd2)', op: 0.6 },
    { from: limit * 0.8, to: limit, fill: 'var(--warn)', op: 0.22 },
    { from: limit, to: check, fill: 'var(--warn)', op: 0.45 },
    { from: check, to: 1.0, fill: 'var(--warn)', op: 0.7 },
    { from: 1.0, to: MAX, fill: 'var(--warn)', op: 0.95 },
  ].filter(z => z.to > z.from);
  const ticks = [0, 0.5, 0.75, 1.0].filter(v => v !== limit && Math.abs(x(v) - x(limit)) >= 64);
  const mx = percent === null ? null : x(percent);
  const T = 'all 300ms cubic-bezier(0.22,1,0.36,1)';
  const sign = bound === 'atLeast' ? '≥ ' : bound === 'below' ? '< ' : '';

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block"
        aria-label={percent === null ? (empty ?? '') : `${labels.you}: ${sign}${fmt(percent)} %, ${labels.limit} ${fmt(limit)} %`}>
        {/* Zonen, mit 2 px Flaechenluecke dazwischen */}
        {zones.map((z, i) => (
          <rect key={i} x={x(z.from) + (i ? 1 : 0)} y={TY} width={Math.max(0, x(z.to) - x(z.from) - (i ? 2 : 1))} height={TH}
            rx={3} fill={z.fill} opacity={z.op} style={{ transition: T }} />
        ))}
        {/* Grenze der Gangzahl */}
        <line x1={x(limit)} x2={x(limit)} y1={TY - 4} y2={TY + TH + 4} stroke="var(--tx1)" strokeWidth={2} style={{ transition: T }} />

        {/* Zeile 1 unter der Skala: Werte, die Grenze hervorgehoben */}
        <g style={FONT}>
          {ticks.map(v => (
            <text key={v} x={x(v)} y={TY + TH + 17} textAnchor={v === 0 ? 'start' : 'middle'} fill="var(--txff)">{fmt(v)} %</text>
          ))}
          <text x={x(limit)} y={TY + TH + 17} textAnchor="middle" fontWeight={700} fill="var(--tx1)" style={{ transition: T }}>
            {labels.limit} {fmt(limit)} %
          </text>
        </g>
        {/* Zeile 2: was die Bereiche bedeuten. „tauschen" steht mittig in
            seinem Bereich und faellt weg, wenn es an eines der Randetiketten
            stoesst (schmale Karte) — das Urteil unten sagt es ohnehin. */}
        <g style={FONT} fill="var(--txf)">
          <text x={PAD} y={TY + TH + 35}>{labels.ok}</text>
          {(() => {
            const cx = (x(limit) + x(1.0)) / 2;
            const half = labels.replace.length * 3;
            const leftEdge = PAD + labels.ok.length * 6 + 8;
            const rightEdge = W - PAD - labels.cassette.length * 6 - 8;
            return cx - half > leftEdge && cx + half < rightEdge
              ? <text x={cx} y={TY + TH + 35} textAnchor="middle">{labels.replace}</text>
              : null;
          })()}
          <text x={W - PAD} y={TY + TH + 35} textAnchor="end">{labels.cassette}</text>
        </g>

        {mx !== null && bound === 'below' ? (
          <g style={{ transition: T }}>
            <path d={`M${x(0)},${TY - 5} H${mx}`} stroke="var(--tx1)" strokeWidth={2} />
            <path d={`M${x(0)},${TY - 9} v8 M${mx},${TY - 9} v8`} stroke="var(--tx1)" strokeWidth={2} />
            <text x={x(0)} y={13} style={FONT} fontSize={12} fontWeight={700} fill="var(--tx1)">
              {labels.you} {sign}{fmt(percent!)} %
            </text>
          </g>
        ) : mx !== null ? (
          <g style={{ transition: 'transform 320ms cubic-bezier(0.22,1,0.36,1)', transform: `translateX(${mx}px)` }}>
            {bound === 'atLeast' && (
              <path d={`M0,${TY + TH / 2} H${Math.max(0, x(MAX) - mx)}`} stroke="var(--tx1)" strokeWidth={2} strokeDasharray="3 3" />
            )}
            <line x1={0} x2={0} y1={20} y2={TY + TH / 2} stroke="var(--tx1)" strokeWidth={1.5} />
            <circle cx={0} cy={TY + TH / 2} r={6} fill="var(--tx1)" stroke="var(--sf)" strokeWidth={2} />
            <text x={0} y={13} textAnchor={mx < 60 ? 'start' : mx > W - 60 ? 'end' : 'middle'} style={FONT} fontSize={12} fontWeight={700} fill="var(--tx1)">
              {labels.you} {sign}{fmt(percent!)} %
            </text>
          </g>
        ) : (
          <text x={W / 2} y={13} textAnchor="middle" style={FONT} fill="var(--txf)">{empty}</text>
        )}
      </svg>
    </div>
  );
}

// ── Intervall: Zeitstrahl bis zum naechsten Wachsen ─────────────────────────

/**
 * Von „zuletzt gewachst" ueber „heute" bis „faellig", dazu die zwei
 * Folgetermine. Der gefahrene Anteil ist gefuellt — man sieht, wie viel vom
 * Intervall schon weg ist, statt es aus einer Wochenzahl zu errechnen.
 */
export function RewaxTimeline({ last, today, due, weeks, overdue, labels, fmtDate }: {
  last: Date; today: Date; due: Date; weeks: number; overdue: boolean;
  labels: { last: string; today: string; due: string };
  fmtDate: (d: Date) => string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const PAD = 14, H = 100, Y = 52;
  const DAY = 86400000;
  const cycle = weeks * 7 * DAY;
  const next = [1, 2].map(k => new Date(due.getTime() + k * cycle));
  const start = last.getTime();
  const end = Math.max(next[1].getTime(), today.getTime() + 7 * DAY);
  const x = (d: Date | number) => PAD + ((+d - start) / (end - start)) * (W - PAD * 2);
  const done = Math.min(+today, +due);
  const tone = overdue ? 'var(--warn)' : 'var(--brand)';
  // Etiketten unter dem Strahl, nach Wichtigkeit gesetzt: „faellig" immer,
  // dann „zuletzt" (nicht, wenn das heute war — das sagt die Marke oben), dann
  // die Folgetermine. Ueberlappt ein Etikett ein bereits gesetztes, bleibt es
  // weg. Breite grob mit 6 px je Zeichen geschaetzt (11 px Schrift).
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const candidates = [
    { d: due, text: `${labels.due} ${fmtDate(due)}`, strong: true },
    ...(sameDay(last, today) ? [] : [{ d: last, text: `${labels.last} ${fmtDate(last)}`, strong: false }]),
    ...next.map(d => ({ d, text: fmtDate(d), strong: false })),
  ];
  const placed: { from: number; to: number }[] = [];
  const shown = candidates.flatMap(c => {
    const bx = x(c.d);
    const w = c.text.length * 6;
    const anchor: 'start' | 'end' | 'middle' = bx < w / 2 + 2 ? 'start' : bx > W - w / 2 - 2 ? 'end' : 'middle';
    const from = anchor === 'start' ? bx : anchor === 'end' ? bx - w : bx - w / 2;
    const box = { from: from - 6, to: from + w + 6 };
    if (placed.some(p => box.from < p.to && box.to > p.from)) return [];
    placed.push(box);
    return [{ ...c, bx, anchor }];
  });

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block"
        aria-label={`${labels.last} ${fmtDate(last)}, ${labels.today} ${fmtDate(today)}, ${labels.due} ${fmtDate(due)}`}>
        <line x1={x(last)} x2={x(end)} y1={Y} y2={Y} stroke="var(--bd2)" strokeWidth={2} strokeLinecap="round" />
        <line x1={x(last)} x2={x(done)} y1={Y} y2={Y} stroke={tone} strokeWidth={4} strokeLinecap="round" style={{ transition: 'all 320ms ease' }} />
        {overdue && (
          <line x1={x(due)} x2={x(today)} y1={Y} y2={Y} stroke="var(--warn)" strokeWidth={4} strokeDasharray="4 3" />
        )}
        {next.map(d => (
          <circle key={+d} cx={x(d)} cy={Y} r={4} fill="var(--sf)" stroke="var(--txff)" strokeWidth={2} />
        ))}
        <circle cx={x(last)} cy={Y} r={4} fill="var(--txf)" />
        <circle cx={x(due)} cy={Y} r={7} fill="var(--sf)" stroke={tone} strokeWidth={2.5} style={{ transition: 'all 320ms ease' }} />

        {/* heute: Markierung oben */}
        <g style={{ transition: 'transform 320ms ease', transform: `translateX(${x(today)}px)` }}>
          <line x1={0} x2={0} y1={26} y2={Y - 6} stroke="var(--tx1)" strokeWidth={1.5} />
          <text x={0} y={18} textAnchor={x(today) < 40 ? 'start' : 'middle'} style={FONT} fontSize={12} fontWeight={700} fill="var(--tx1)">
            {labels.today}
          </text>
        </g>

        {shown.map(s => (
          <text key={s.text} x={s.bx} y={Y + 26} textAnchor={s.anchor}
            style={FONT} fontWeight={s.strong ? 700 : 400} fill={s.strong ? 'var(--tx1)' : 'var(--txf)'}>
            {s.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Rahmen fuer die eine Grafik einer Karte — gleiche Flaeche auf allen Karten.
 * Feste Mindesthoehe, die Grafik steht darin mittig: so liegt der Bildbereich
 * auf jeder Karte gleich, egal ob die Grafik 100 oder 150 px hoch ist.
 * `maxWidth` nur fuer Skizzen mit fester viewBox (Antrieb, Zaehlen): die
 * duerfen hoechstens 1:1 wachsen, sonst waechst ihre Schrift mit.
 */
export function SketchFrame({ children, caption, maxWidth }: {
  children: React.ReactNode; caption?: React.ReactNode; maxWidth?: number;
}) {
  return (
    <figure
      className="rounded-2xl px-3.5 py-3 min-h-[150px] flex flex-col justify-center"
      style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)' }}
    >
      <div className="w-full mx-auto" style={maxWidth ? { maxWidth } : undefined}>{children}</div>
      {caption && <figcaption className="text-[11.5px] leading-snug mt-2" style={{ color: 'var(--txf)' }}>{caption}</figcaption>}
    </figure>
  );
}
