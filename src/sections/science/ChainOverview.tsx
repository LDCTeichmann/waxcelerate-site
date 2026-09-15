// ─── Der Einstieg: die Kette als Inhaltsverzeichnis ──────────────────────────
//
// Loest das Kassettenfoto im Hero ab. Das Foto zeigte die FOLGE (eine
// abgenutzte Zahnflanke) und die Seite erklaerte danach die URSACHE, ohne dass
// die Verbindung je gezeichnet wurde. Ausserdem kam die Kassette nach dem Hero
// nie wieder vor. Sie ist nicht geloescht, sondern nach ACT III gewandert, wo
// der Verschleiss ohnehin besprochen wird.
//
// Hier steht jetzt die Kette so, wie sie am Rad haengt: Seitenansicht, eine
// Lupe im Gelenk, rechts das Ritzel. Genau die Ansicht, die auf der
// Produktseite (FrictionLens) funktioniert, und Lucas wiederkehrende
// Rueckmeldung dazu lautete: eine Kette sieht man am Rad von der Seite, nie
// auf der Kante liegend.
//
// Die drei Einstiege sind bewusst HTML-Knoepfe UNTER der Zeichnung, keine
// Beschriftungen im SVG:
//   - ihre Schriftgroesse haengt nicht am Skalierungsfaktor der viewBox, das
//     11-px-Problem aus DESIGN.md Abschnitt 2 entsteht also gar nicht erst,
//   - sie sind ohne Zusatzarbeit bedienbar und tastaturfaehig,
//   - und es ist dasselbe Muster, das ContactZones eine Bildschirmhoehe
//     weiter unten bereits benutzt: eine Liste steuert eine Figur.
//
// Geometrie kommt aus components/viz/chain/geometry.ts, derselben Quelle, aus
// der auch ChainWaxMap und der Rechner-Antrieb lesen.

import { useState } from 'react';
import {
  JOINT, METAL, HAIR, LINE, sideAt,
  platePath, ringPath, sprocketPath,
} from '@/components/viz/chain/geometry';

// ── Aufbau ──────────────────────────────────────────────────────────────────
// Die Kette laeuft waagerecht an und wickelt sich rechts auf das Ritzel.
// Teilung und Zahnteilung sind dieselbe Zahl, deshalb sitzt jeder Bolzen in
// einem Sitz: das ist der Grund, warum eine gelaengte Kette die Zahnflanken
// frisst, und damit die Bruecke vom Gelenk zum Verschleiss.
const SPR = { cx: 505, cy: 205, n: 13, R: 136.6 };
const P = (2 * Math.PI * SPR.R) / SPR.n;   // Teilung in viewBox-Einheiten, hier ~66
const STEP = (2 * Math.PI) / SPR.n;        // Winkel je Zahn
const TANGENT_Y = SPR.cy - SPR.R;          // Kettenlinie = Scheitel des Teilkreises
const SIDE = sideAt(P);                    // Kettenradien in der Teilung dieses Ritzels
const LUPE = { cx: 168, cy: 250, r: 86 };

type Pt = { x: number; y: number };

/** Bolzen von links nach rechts: erst das gerade Trum, dann auf den Bogen.
 *  Der Bolzen am Scheitel gehoert beiden, er ist der Umschlingungsbeginn. */
const STRAIGHT = 7, WRAP = 3;
const pins: Pt[] = [
  ...Array.from({ length: STRAIGHT }, (_, j) => ({
    x: SPR.cx - (STRAIGHT - j) * P, y: TANGENT_Y,
  })),
  ...Array.from({ length: WRAP + 1 }, (_, k) => ({
    x: SPR.cx + SPR.R * Math.cos(-Math.PI / 2 + k * STEP),
    y: SPR.cy + SPR.R * Math.sin(-Math.PI / 2 + k * STEP),
  })),
];
const MARK = 2;   // Gelenk unter der Lupe, im geraden Trum

export type Entry = 0 | 1 | 2;

/** Eine Lasche zwischen zwei Bolzen, in die Richtung der Verbindung gedreht.
 *  platePath zeichnet waagerecht, die Drehung macht daraus ein Kettenglied
 *  an beliebiger Stelle, also auch auf dem Bogen. */
function Link({ a, b, R, waist, fill, stroke }: {
  a: Pt; b: Pt; R: number; waist: number; fill: string; stroke: string;
}) {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${a.x.toFixed(2)} ${a.y.toFixed(2)}) rotate(${ang.toFixed(2)})`}>
      <path d={platePath(0, d, 0, R, waist)} fill={fill} stroke={stroke} style={LINE} />
    </g>
  );
}

function Figure({ de, active }: { de: boolean; active: Entry | null }) {
  // Nicht angewaehlte Teile treten zurueck, statt dass das angewaehlte
  // aufleuchtet: ein Glow waere ein zweites Signal neben der Farbe, und Blau
  // ist auf dieser Seite fuer Wachs reserviert.
  const dim = (e: Entry) => (active === null || active === e ? 1 : 0.28);
  const t = { transition: 'opacity .35s' };
  const links = pins.slice(0, -1).map((a, i) => ({ a, b: pins[i + 1], i }));

  return (
    <svg viewBox="0 0 700 380" className="w-full h-auto" role="img"
      aria-label={de
        ? 'Fahrradkette in Seitenansicht, die rechts auf ein Ritzel laeuft. Eine Lupe zeigt ein Gelenk im Schnitt: Bolzen, Wachsspalt, Laschenkragen, Wachsspalt, Rolle.'
        : 'Bicycle chain in side view running onto a sprocket at the right. A loupe shows one joint in section: pin, wax gap, plate collar, wax gap, roller.'}>

      {/* ── Ritzel ── */}
      <g style={{ ...t, opacity: dim(2) }}>
        <path d={sprocketPath(SPR.cx, SPR.cy, SPR.n, SPR.R, P, -Math.PI / 2)}
          fill={METAL.light} stroke="var(--tx2)" style={LINE} />
        <circle cx={SPR.cx} cy={SPR.cy} r={SPR.R * 0.40} fill="var(--pg)" stroke="var(--txf)" style={HAIR} />
      </g>

      {/* ── Kette ──
             Innenlaschen (hinten, schmaler) und Aussenlaschen (vorn) wechseln
             sich ab, wie an der echten Kette. */}
      <g>
        {links.filter(l => l.i % 2 === 1).map(l => (
          <Link key={`i${l.i}`} a={l.a} b={l.b} R={SIDE.lobe - 5} waist={SIDE.waist - 4}
            fill={METAL.mid} stroke="var(--txf)" />
        ))}
        {links.filter(l => l.i % 2 === 0).map(l => (
          <Link key={`o${l.i}`} a={l.a} b={l.b} R={SIDE.lobe} waist={SIDE.waist}
            fill={METAL.light} stroke="var(--tx2)" />
        ))}
        {pins.map((pt, i) => (
          <g key={`p${i}`}>
            <circle cx={pt.x} cy={pt.y} r={SIDE.roller} fill="none" stroke="var(--txf)" style={HAIR} />
            <circle cx={pt.x} cy={pt.y} r={SIDE.collar} fill="none" stroke="var(--txf)" style={HAIR} />
            {/* Der Wachsfilm im Gelenk, in der Seitenansicht ein Ring. */}
            <circle cx={pt.x} cy={pt.y} r={(SIDE.collar + SIDE.pin) / 2} fill="none"
              stroke="var(--accent)" strokeWidth={3} opacity={0.75 * dim(1)} style={t} />
            <circle cx={pt.x} cy={pt.y} r={SIDE.pin} fill={METAL.strong} stroke="var(--tx2)" style={HAIR} />
          </g>
        ))}
      </g>

      {/* ── Markierung am Gelenk unter der Lupe, plus die beiden Leitlinien ── */}
      <g style={{ ...t, opacity: dim(0) }}>
        <circle cx={pins[MARK].x} cy={pins[MARK].y} r={SIDE.roller + 6} fill="none"
          stroke="var(--accent)" strokeDasharray="4 3" style={HAIR} />
        <line x1={pins[MARK].x - SIDE.roller} y1={pins[MARK].y + 14}
          x2={LUPE.cx - LUPE.r * 0.72} y2={LUPE.cy - LUPE.r * 0.70}
          stroke="var(--accent)" strokeDasharray="5 4" style={HAIR} opacity={0.45} />
        <line x1={pins[MARK].x + SIDE.roller} y1={pins[MARK].y + 14}
          x2={LUPE.cx + LUPE.r * 0.72} y2={LUPE.cy - LUPE.r * 0.70}
          stroke="var(--accent)" strokeDasharray="5 4" style={HAIR} opacity={0.45} />
      </g>

      {/* ── Lupe: dasselbe Gelenk als konzentrische Ringe ──
             Von aussen nach innen Rolle, Wachsspalt, Kragen, Wachsspalt,
             Bolzen. Ohne Vorwissen lesbar, weil es Kreise sind und keine
             Schnittzeichnung: so sieht ein Gelenk von der Seite wirklich aus. */}
      <circle cx={LUPE.cx} cy={LUPE.cy} r={LUPE.r} fill="var(--pg)" stroke="var(--txf)" style={LINE} />
      <g transform={`translate(${LUPE.cx} ${LUPE.cy}) scale(${LUPE.r / JOINT.roller})`}>
        <g style={{ ...t, opacity: dim(0) }}>
          <path d={ringPath(0, 0, JOINT.roller, JOINT.wax2)} fillRule="evenodd"
            fill={METAL.strong} stroke="var(--txf)" style={HAIR} />
          <path d={ringPath(0, 0, JOINT.collar, JOINT.wax1)} fillRule="evenodd"
            fill={METAL.mid} stroke="var(--txf)" style={HAIR} />
        </g>
        <g style={{ ...t, opacity: dim(1) }}>
          <path d={ringPath(0, 0, JOINT.wax2, JOINT.collar)} fillRule="evenodd" fill="var(--accent)" />
          <path d={ringPath(0, 0, JOINT.wax1, JOINT.pin)} fillRule="evenodd" fill="var(--accent)" />
        </g>
        <circle cx={0} cy={0} r={JOINT.pin} fill={METAL.strong}
          stroke="var(--tx2)" style={{ ...HAIR, ...t, opacity: dim(0) }} />
      </g>
    </svg>
  );
}

/** Ein Einstieg: Nummer, Zeile, Ziel. Steuert beim Darueberfahren die Figur. */
function EntryRow({ n, title, body, first, on, onEnter, onLeave, onGo }: {
  n: string; title: string; body: string; first: boolean; on: boolean;
  onEnter: () => void; onLeave: () => void; onGo: () => void;
}) {
  return (
    <button type="button"
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      onFocus={onEnter} onBlur={onLeave}
      onClick={onGo}
      className="w-full text-left py-3 transition-[padding] duration-500"
      style={{ borderTop: first ? 'none' : '1px solid var(--bd2)', paddingLeft: on ? 10 : 0 }}>
      <span className="flex items-baseline gap-3">
        <span className="num-data text-meta flex-shrink-0"
          style={{ color: on ? 'var(--accent)' : 'var(--txf)', transition: 'color .3s' }}>{n}</span>
        <span className="text-[14px] text-wx-tx1 leading-snug font-medium">{title}</span>
        <span aria-hidden className="ml-auto flex-shrink-0 text-[13px]"
          style={{ color: on ? 'var(--accent)' : 'var(--txf)', transition: 'color .3s' }}>→</span>
      </span>
      <span className="block text-[13px] leading-relaxed mt-1" style={{ color: 'var(--txm)' }}>{body}</span>
    </button>
  );
}

export function ChainOverview({ de, onGo }: { de: boolean; onGo: (anchor: string) => void }) {
  const [active, setActive] = useState<Entry | null>(null);

  const rows = de ? [
    { n: '01', title: 'Drei Flächen, mehr nicht', body: 'Wo im Gelenk die Reibung wirklich entsteht.', a: 'problem' },
    { n: '02', title: 'Was in den Spalt gehört', body: 'Sechs Komponenten, und warum keine einzelne reicht.', a: 'formel' },
    { n: '03', title: 'Was am Ende verschleißt', body: 'Die Zahlen, und woher sie stammen.', a: 'beweis' },
  ] : [
    { n: '01', title: 'Three surfaces, that is all', body: 'Where friction inside the joint actually happens.', a: 'problem' },
    { n: '02', title: 'What belongs in the gap', body: 'Six components, and why no single one is enough.', a: 'formel' },
    { n: '03', title: 'What wears out in the end', body: 'The figures, and where they come from.', a: 'beweis' },
  ];

  return (
    <div>
      <Figure de={de} active={active} />
      {/* Legende in HTML, nicht im SVG: die Schriftgroesse haengt damit nicht
          am Skalierungsfaktor der viewBox und faellt auf schmalen Geraeten
          nicht unter die 11-px-Grenze aus DESIGN.md Abschnitt 2. Ohne diese
          Zeile liest die Lupe wie eine Zielscheibe. */}
      <p className="text-meta mt-1 flex items-center gap-2" style={{ color: 'var(--txf)' }}>
        <span aria-hidden className="inline-block rounded-full"
          style={{ width: 9, height: 9, background: 'var(--accent)' }} />
        {de
          ? 'Blau ist der Wachsfilm. Die Lupe zeigt dasselbe Gelenk im Schnitt.'
          : 'Blue is the wax film. The loupe shows the same joint in section.'}
      </p>
      <div className="mt-4">
        {rows.map((r, i) => (
          <EntryRow key={r.n} n={r.n} title={r.title} body={r.body} first={i === 0}
            on={active === (i as Entry)}
            onEnter={() => setActive(i as Entry)} onLeave={() => setActive(null)}
            onGo={() => onGo(r.a)} />
        ))}
      </div>
    </div>
  );
}
