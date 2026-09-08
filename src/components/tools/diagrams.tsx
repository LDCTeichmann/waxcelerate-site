// ── Skizzen fuer die Eingaben, die man nicht erklaeren kann ─────────────────
//
// Drei der abgefragten Werte sind raeumlich und mit Worten nur muehsam zu
// treffen: wo die Messstrecke ansetzt, was die Kettenstrebe ist und welche
// Zahnraeder man zaehlt. Genau dort steigt jemand aus, der kein
// Schrauber-Vokabular hat.
//
// Bewusst eigene SVG statt Fotos oder eingebetteter Videos:
//  - Fremde Aufnahmen und Videostandbilder sind urheberrechtlich geschuetzt.
//  - Ein YouTube-Embed setzt Cookies, bevor jemand eingewilligt hat, und
//    kollidiert mit der Datenschutzerklaerung der Seite.
//  - SVG traegt die Themefarben mit, wiegt nichts und bleibt beim Zoomen scharf.
//
// Keine Animation: es gibt hier nichts, was sich bewegt. Ein Standbild zeigt
// dieselbe Information, ohne Aufmerksamkeit zu kosten.
//
// Alle Skizzen teilen sich ein Zeichenvokabular (Strichstaerke, Farben, ein
// gemeinsamer Ketten-Baustein, gemeinsame Massketten), damit sie als Satz
// wirken und nicht wie sechs Handzeichnungen.

// ── Gemeinsames Vokabular ──────────────────────────────────────────────────
const INK = 'var(--tx2)';       // Hauptkontur
const HAIR = 'var(--bd2)';      // Hilfs-/Konstruktionslinien
const ACCENT = 'var(--brand)';  // genau das eine, worum es geht
const FILL = 'var(--sf2)';      // leiser Koerper-Fuellton
const LABEL = 'var(--txm)';     // Beschriftung

const SW = 1.5;   // Standard-Strichstaerke
const SW_HAIR = 1;

/** Pfeilkopf einer Masslinie, `dir` = -1 zeigt nach links, 1 nach rechts. */
function Arrow({ x, y, dir }: { x: number; y: number; dir: -1 | 1 }) {
  return <path d={`M${x + dir * 5},${y - 3} L${x},${y} L${x + dir * 5},${y + 3}`}
    fill="none" stroke={ACCENT} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />;
}

/**
 * Ein Stueck Rollenkette von der Seite. Aeussere und innere Laschen wechseln
 * sich ab (leichter Hoehenversatz), dazwischen die Rollen, in der Mitte die
 * Bolzen. `pins` legt die x-Positionen der Bolzenmitten fest.
 */
function RollerChain({
  pins, cy, roller = 5, stroke = INK, fill = FILL, opacity = 1,
}: { pins: number[]; cy: number; roller?: number; stroke?: string; fill?: string; opacity?: number }) {
  const h = roller + 2;
  return (
    <g opacity={opacity} strokeLinejoin="round">
      {/* Laschen: gleich hohe Stadionformen von Bolzen zu Bolzen */}
      {pins.slice(0, -1).map((x, i) => (
        <rect key={`pl${i}`}
          x={x - h} y={cy - h}
          width={pins[i + 1] - x + h * 2} height={h * 2} rx={h} ry={h}
          fill={fill} stroke={stroke} strokeWidth={SW_HAIR} />
      ))}
      {/* Rollen + Bolzen */}
      {pins.map((x, i) => <circle key={`ro${i}`} cx={x} cy={cy} r={roller} fill={fill} stroke={stroke} strokeWidth={SW} />)}
      {pins.map((x, i) => <circle key={`pi${i}`} cx={x} cy={cy} r={1.5} fill={stroke} />)}
    </g>
  );
}

/** Gleichmaessige Bolzenreihe. */
const row = (start: number, pitch: number, n: number) =>
  Array.from({ length: n }, (_, i) => start + i * pitch);

// ── 1 · Messstrecke ueber 12 Glieder ───────────────────────────────────────
/** Bolzenmitte bis Bolzenmitte, 12 Glieder = 12 Zoll = 304,8 mm (neu). */
export function ChainMeasureDiagram() {
  const CY = 34;
  const PITCH = 20;
  const left = row(20, PITCH, 5);          // 20 … 100
  const right = row(190, PITCH, 5);        // 190 … 270
  const gapMid = (left[4] + right[0]) / 2; // 145
  const A = left[0];       // erste Bolzenmitte
  const B = right[4];      // letzte Bolzenmitte (12 Glieder weiter)
  const dimY = CY + 22;

  return (
    <svg viewBox="0 0 290 74" className="w-full h-auto" role="img"
      aria-label="Messstrecke über 12 Glieder, von Bolzenmitte zu Bolzenmitte">
      <RollerChain pins={left} cy={CY} />
      <RollerChain pins={right} cy={CY} />

      {/* Bruchstelle „hier geht es genauso weiter" */}
      <path d={`M${gapMid - 7},${CY - 11} l5,22 M${gapMid + 3},${CY - 11} l5,22`}
        stroke={HAIR} strokeWidth={SW} fill="none" strokeLinecap="round" />

      {/* Ansatzpunkte */}
      {[A, B].map(x => (
        <g key={x}>
          <circle cx={x} cy={CY} r={3.2} fill="none" stroke={ACCENT} strokeWidth={SW} />
          <path d={`M${x},${CY + 8} V${dimY}`} stroke={HAIR} strokeWidth={SW_HAIR} />
        </g>
      ))}

      {/* Masskette */}
      <path d={`M${A},${dimY} H${B}`} stroke={ACCENT} strokeWidth={SW} strokeLinecap="round" />
      <Arrow x={A} y={dimY} dir={1} /><Arrow x={B} y={dimY} dir={-1} />

      <text x={(A + B) / 2} y={dimY + 15} textAnchor="middle" fontSize="10" fill={LABEL}>
        12 Glieder — 304,8 mm neu
      </text>
      <text x={A} y={CY - 13} textAnchor="middle" fontSize="8.5" fill={ACCENT}>Mitte</text>
      <text x={B} y={CY - 13} textAnchor="middle" fontSize="8.5" fill={ACCENT}>Mitte</text>
    </svg>
  );
}

// ── 2 · Kettenlehre ────────────────────────────────────────────────────────
/**
 * Eine 3-Punkt-Lehre auf der Kette: fester Fuss sitzt in einer Rollenluecke,
 * die Pruefspitze am anderen Ende. `state='ok'` — die Spitze liegt auf der
 * Rolle auf (Grenze nicht erreicht). `state='worn'` — die Spitze faellt in die
 * Luecke (Grenze erreicht, Kette raus).
 */
export function ChainGaugeDiagram({ state = 'worn' }: { state?: 'ok' | 'worn' }) {
  const CY = 60;
  const PITCH = 21;
  const pins = row(24, PITCH, 8);      // 24 … 171
  const footX = (pins[1] + pins[2]) / 2;
  const tipX = (pins[6] + pins[7]) / 2;
  const worn = state === 'worn';
  const tipY = worn ? CY : CY - 7;     // in die Luecke vs. auf der Rolle
  const bodyY = 22;

  return (
    <svg viewBox="0 0 290 96" className="w-full h-auto" role="img"
      aria-label="Kettenlehre: fester Fuß am einen Ende, Prüfspitze am anderen">
      <RollerChain pins={pins} cy={CY} />

      {/* Lehrenkoerper — flacher Riegel mit den zwei Fuehlern nach unten */}
      <path
        d={`M${footX - 9},${bodyY}
            H${tipX + 9}
            a4,4 0 0 1 4,4 V${bodyY + 9}
            a4,4 0 0 1 -4,4 H${tipX + 4}
            L${tipX + 2},${tipY - 6}
            H${tipX - 2}
            L${tipX - 4},${bodyY + 17}
            H${footX + 6}
            L${footX + 4},${CY - 4}
            H${footX - 4}
            L${footX - 6},${bodyY + 17}
            a4,4 0 0 1 -4,-4 V${bodyY + 4}
            a4,4 0 0 1 4,-4 Z`}
        fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />

      {/* fester Fuss — sitzt sauber in der Luecke */}
      <circle cx={footX} cy={CY - 2} r={2.6} fill="none" stroke={INK} strokeWidth={SW} />
      <text x={footX} y={16} textAnchor="middle" fontSize="8.5" fill={LABEL}>fester Fuß</text>

      {/* Pruefspitze — Akzent, Zustand sichtbar */}
      <g className="diagram-move">
        <path d={`M${tipX - 4},${bodyY + 17} L${tipX},${tipY - 2} L${tipX + 4},${bodyY + 17}`}
          fill={ACCENT} stroke="none" />
        <circle cx={tipX} cy={tipY} r={2.8} fill="none" stroke={ACCENT} strokeWidth={SW} />
      </g>
      <text x={tipX} y={16} textAnchor="middle" fontSize="8.5" fill={ACCENT}>0,5 %-Marke</text>

      <text x="145" y={90} textAnchor="middle" fontSize="10" fill={LABEL}>
        {worn ? 'Spitze fällt hinein — Kette raus' : 'Spitze liegt auf — Kette in Ordnung'}
      </text>
    </svg>
  );
}

// ── 3 · Was gezaehlt wird: die Ritzel ──────────────────────────────────────
/**
 * Kassette von der Seite als „Treppe": jedes Ritzel eine flache Scheibe mit
 * Zahnkranz, aussen (rechts) klein, innen (links) gross — die vertraute
 * Kegelform. Nummeriert, weil gezaehlt werden die Scheiben, nicht die Zaehne.
 */
export function SprocketCountDiagram() {
  const cx = 145;
  const axisY = 52;
  const n = 8;
  const step = 15;
  const x0 = cx - ((n - 1) * step) / 2;
  const radiusAt = (i: number) => 32 - i * 3.2;     // aussen klein -> innen gross

  /** Zahnkranz als gezackter Kreisbogen (nur die sichtbare Kontur). */
  const cog = (x: number, r: number) => {
    const teeth = 20;
    const pts: string[] = [];
    for (let k = 0; k <= teeth; k++) {
      const a = (k / teeth) * Math.PI * 2 - Math.PI / 2;
      const rr = k % 2 === 0 ? r : r - 2;
      pts.push(`${(x + Math.cos(a) * 2.6).toFixed(1)},${(axisY + Math.sin(a) * rr).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg viewBox="0 0 290 104" className="w-full h-auto" role="img"
      aria-label="Die Ritzel der Kassette am Hinterrad zählen">
      {/* Nabe / Freilaufkoerper */}
      <path d={`M${x0 - 14},${axisY} H${x0 + (n - 1) * step + 14}`} stroke={HAIR} strokeWidth={5} strokeLinecap="round" />

      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * step;
        const r = radiusAt(i);
        const first = i === 0;
        return (
          <g key={i}>
            <polygon points={cog(x, r)} fill={FILL} stroke={first ? ACCENT : INK} strokeWidth={first ? SW : SW_HAIR} strokeLinejoin="round" />
            {/* Nummer der Scheibe */}
            <text x={x} y={axisY + 47} textAnchor="middle" fontSize="9" fill={first ? ACCENT : LABEL}>{i + 1}</text>
          </g>
        );
      })}
      <text x={x0 + (n - 1) * step + 12} y={axisY + 4} fontSize="11" fill={LABEL}>…</text>

      <text x={cx} y={14} textAnchor="middle" fontSize="10" fill={LABEL}>
        die Scheiben zählen, nicht die Zähne
      </text>
    </svg>
  );
}

// ── 4 · Kettenstrebe / Kettenblatt / Kassette am Rad ───────────────────────
/**
 * Rennrad-Seitenprofil, Blickrichtung nach rechts. Hebt per `highlight` das
 * Bauteil hervor, dessen Eingabefeld gerade fokussiert ist: die Kettenstrebe
 * (Tretlager -> Hinterachse), das grosse Kettenblatt oder das groesste Ritzel.
 * Immer genau eine Beschriftung, mit Fuehrungslinie, im freien Raum.
 */
export function ChainstayDiagram({ highlight = 'stay' }: { highlight?: 'stay' | 'ring' | 'sprocket' }) {
  const RW = 27;                       // Radradius
  const REAR = { x: 58, y: 84 };
  const FRONT = { x: 248, y: 84 };
  const BB = { x: 118, y: 88 };        // Tretlager
  const SEAT = { x: 116, y: 30 };      // Sattelklemme
  const HEAD_T = { x: 190, y: 32 };    // Steuerrohr oben
  const HEAD_B = { x: 204, y: 64 };    // Steuerrohr unten

  const isStay = highlight === 'stay';
  const isRing = highlight === 'ring';
  const isCog = highlight === 'sprocket';
  const on = (b: boolean) => (b ? ACCENT : INK);

  const line = (a: {x:number;y:number}, b: {x:number;y:number}, k = SW, o = 1) =>
    <path d={`M${a.x},${a.y} L${b.x},${b.y}`} stroke={INK} strokeWidth={k} opacity={o} />;

  return (
    <svg viewBox="0 0 300 142" className="w-full h-auto" role="img"
      aria-label="Kettenstrebe, Kettenblatt und Kassette am Fahrrad">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Laufraeder */}
        <circle cx={REAR.x} cy={REAR.y} r={RW} stroke={INK} strokeWidth={SW} opacity={0.85} />
        <circle cx={FRONT.x} cy={FRONT.y} r={RW} stroke={INK} strokeWidth={SW} opacity={0.85} />
        <circle cx={REAR.x} cy={REAR.y} r={2} fill={INK} stroke="none" />
        <circle cx={FRONT.x} cy={FRONT.y} r={2} fill={INK} stroke="none" />

        {/* Rahmendreieck + Steuerrohr */}
        {line(BB, SEAT)}
        {line(SEAT, HEAD_T)}
        {line(BB, HEAD_B)}
        {line(HEAD_T, HEAD_B)}
        {/* Sitzstrebe */}
        {line({ x: SEAT.x + 1, y: SEAT.y + 3 }, REAR, SW, 0.85)}
        {/* Gabel */}
        {line(HEAD_B, FRONT, SW, 0.85)}
        {/* Sattel */}
        <path d={`M${SEAT.x - 7},${SEAT.y - 3} q7,-4 14,0`} stroke={INK} strokeWidth={SW} />
        {/* Vorbau + angedeuteter Rennlenker */}
        <path d={`M${HEAD_T.x},${HEAD_T.y} l-4,-7 q-11,0 -12,9 q4,5 10,3`} stroke={INK} strokeWidth={SW} />
        {/* Kurbelarm + Pedal */}
        <path d={`M${BB.x},${BB.y} l12,15`} stroke={INK} strokeWidth={SW} />
        <path d={`M${BB.x + 8},${BB.y + 18} h9`} stroke={INK} strokeWidth={SW} />
      </g>

      {/* Kette — leises Trapez ueber Kettenblatt und Kassette */}
      <path d={`M${BB.x},${BB.y - 11} L${REAR.x},${REAR.y - 7} M${BB.x},${BB.y + 11} L${REAR.x},${REAR.y + 7}`}
        stroke={HAIR} strokeWidth={SW_HAIR} fill="none" />

      {/* Kettenstrebe */}
      <path d={`M${BB.x},${BB.y} L${REAR.x},${REAR.y}`} className="diagram-fade"
        stroke={on(isStay)} strokeWidth={isStay ? 3.6 : SW} opacity={isStay ? 1 : 0.85}
        fill="none" strokeLinecap="round" />

      {/* Kettenblatt */}
      <circle cx={BB.x} cy={BB.y} r={12} fill="none" className="diagram-fade"
        stroke={on(isRing)} strokeWidth={isRing ? 3 : SW} opacity={isRing ? 1 : 0.85} />
      <circle cx={BB.x} cy={BB.y} r={2.6} fill={on(isRing)} className="diagram-fade" />

      {/* Kassette */}
      <g className="diagram-fade">
        {[10, 8, 6.2, 4.4].map((r, i) => (
          <ellipse key={i} cx={REAR.x} cy={REAR.y} rx={2.4} ry={r}
            fill="none" stroke={on(isCog)} strokeWidth={isCog ? 2 : SW_HAIR} opacity={isCog ? 1 : 0.85} />
        ))}
      </g>

      {/* Genau eine Beschriftung, mit Fuehrungslinie, jeweils im freien Raum */}
      {isStay && (
        <g>
          <path d={`M${(BB.x + REAR.x) / 2},${BB.y + 3} V126`} stroke={ACCENT} strokeWidth={SW_HAIR} />
          <text x={(BB.x + REAR.x) / 2} y={137} textAnchor="middle" fontSize="10.5" fill={ACCENT}>Kettenstrebe</text>
        </g>
      )}
      {isRing && (
        <g>
          <path d={`M${BB.x},${BB.y + 13} V126`} stroke={ACCENT} strokeWidth={SW_HAIR} />
          <text x={BB.x} y={137} textAnchor="middle" fontSize="10.5" fill={ACCENT}>großes Kettenblatt</text>
        </g>
      )}
      {isCog && (
        <g>
          <path d={`M${REAR.x},${REAR.y - 11} V16`} stroke={ACCENT} strokeWidth={SW_HAIR} />
          <text x={REAR.x} y={12} textAnchor="middle" fontSize="10.5" fill={ACCENT}>größtes Ritzel</text>
        </g>
      )}
    </svg>
  );
}

// ── 5 · Kassette nach einer Kette vs. im Wechsel ───────────────────────────
/**
 * Zwei Ritzel im Vergleich. Links: lange auf einer stark gelaengten Kette
 * gelaufen — die Zaehne sind einseitig zu Haken eingelaufen („Hai-Zahn").
 * Rechts: nur kurz gelaengte Ketten gesehen, die Zaehne stehen symmetrisch.
 */
export function CassetteWearDiagram({ de = true }: { de?: boolean }) {
  // Zwei Ritzel als saubere Zahnraeder nebeneinander. Gesund: gerade,
  // symmetrische Zaehne. Verschlissen: die Zaehne zu „Haifischflossen"
  // geschert und verkuerzt — dieselbe Kontur, nur pro Zahn gekippt.
  const CY = 50;
  const R = 17;          // Fusskreis
  const TIP = 26;        // Kopfkreis (gesund)
  const TEETH = 11;
  const HALF = 0.30;     // halbe Zahnbreite in Zahnteilungen

  function gear(cx: number, worn: boolean) {
    const P = (turn: number, rad: number) => {
      const a = turn * Math.PI * 2 - Math.PI / 2;
      return `${(cx + Math.cos(a) * rad).toFixed(1)},${(CY + Math.sin(a) * rad).toFixed(1)}`;
    };
    const d: string[] = [];
    for (let i = 0; i < TEETH; i++) {
      const c = i / TEETH;                 // Zahnmitte
      const skew = worn ? 0.10 / TEETH : 0; // Kopf gegen die Laufrichtung versetzt
      const tipR = worn ? TIP - 3 : TIP;
      d.push(i === 0 ? `M${P(c - HALF / TEETH, R)}` : `L${P(c - HALF / TEETH, R)}`);
      d.push(`L${P(c - (HALF * 0.55) / TEETH + skew, tipR)}`);
      d.push(`L${P(c + (HALF * 0.55) / TEETH + skew, tipR)}`);
      d.push(`L${P(c + HALF / TEETH, R)}`);
      // Zahnluecke bis zum naechsten Zahn – verschlissen tiefer ausgehoehlt
      d.push(`L${P((i + 1) / TEETH - HALF / TEETH, worn ? R - 2 : R)}`);
    }
    d.push('Z');
    return d.join(' ');
  }

  const half = (cx: number, worn: boolean, caption: string) => (
    <g>
      <path d={gear(cx, worn)} fill={FILL} stroke={worn ? ACCENT : INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={cx} cy={CY} r={5} fill="none" stroke={worn ? ACCENT : INK} strokeWidth={SW_HAIR} />
      <circle cx={cx} cy={CY} r={1.6} fill={worn ? ACCENT : INK} />
      <text x={cx} y={CY + TIP + 16} textAnchor="middle" fontSize="9.5" fill={worn ? ACCENT : LABEL}>{caption}</text>
    </g>
  );

  return (
    <svg viewBox="0 0 290 108" className="w-full h-auto" role="img"
      aria-label={de
        ? 'Vergleich: Kassettenzähne nach einer stark gelängten Kette gegen Zähne im Kettenwechsel'
        : 'Comparison: cassette teeth after one badly worn chain versus teeth kept in rotation'}>
      <text x="145" y="13" textAnchor="middle" fontSize="10" fill={LABEL}>
        {de ? 'so laufen die Zähne ein' : 'how the teeth wear'}
      </text>
      {half(74, true, de ? 'eine Kette, lange gefahren' : 'one chain, ridden long')}
      {half(216, false, de ? 'Ketten im Wechsel' : 'chains in rotation')}
      <line x1="145" y1="22" x2="145" y2="94" stroke={HAIR} strokeWidth={SW_HAIR} strokeDasharray="2 3" />
    </svg>
  );
}
