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
// Jede Skizze steckt in der aufklappbaren Hilfe des jeweiligen Schritts — sie
// steht also nur da, wenn jemand tatsaechlich nicht weiterweiss.

const STROKE = 'var(--tx2)';
const FAINT = 'var(--bd2)';
const ACCENT = 'var(--brand)';
const LABEL = 'var(--txm)';

/** Messstrecke ueber 12 Glieder: Bolzenmitte bis Bolzenmitte, 12 Zoll. */
export function ChainMeasureDiagram() {
  const R = 7;
  const PITCH = 26;
  const CY = 30;
  // Vier Rollen links, Bruch, vier rechts — 25 Rollen waeren in dieser Groesse
  // Matsch. Die Bruchstelle sagt „hier geht es genauso weiter".
  const left = [0, 1, 2, 3].map(i => 22 + i * PITCH);
  const right = [0, 1, 2, 3].map(i => 190 + i * PITCH);
  const plate = (xs: number[]) =>
    xs.slice(0, -1).map((x, i) => (
      <rect key={x} x={x - R - 1} y={CY - (R + 1)} width={xs[i + 1] - x + (R + 1) * 2}
        height={(R + 1) * 2} rx={R + 1} />
    ));

  return (
    <svg viewBox="0 0 310 78" className="w-full h-auto" role="img"
      aria-label="Messstrecke über 12 Glieder, von Bolzenmitte zu Bolzenmitte">
      <g stroke={STROKE} strokeWidth={1.4} fill="var(--sf2)">
        {plate(left)}{plate(right)}
        {[...left, ...right].map(x => <circle key={`r${x}`} cx={x} cy={CY} r={R} />)}
      </g>
      {/* Bolzen */}
      {[...left, ...right].map(x => <circle key={`p${x}`} cx={x} cy={CY} r={1.8} fill={STROKE} />)}
      {/* Bruchstelle */}
      <path d={`M144,${CY - 12} l6,24 M156,${CY - 12} l6,24`} stroke={FAINT} strokeWidth={1.4} fill="none" />

      {/* Masslinie: erste bis letzte Bolzenmitte */}
      <g stroke={ACCENT} strokeWidth={1.4}>
        <path d={`M22,${CY + 20} v10 M268,${CY + 20} v10`} />
        <path d={`M22,${CY + 25} H268`} />
      </g>
      <text x="145" y={CY + 42} textAnchor="middle" fontSize="10" fill={LABEL}>
        12 Glieder = 304,8 mm (neu)
      </text>
      {/* Ansatzpunkte betonen */}
      <circle cx="22" cy={CY} r={3.4} fill="none" stroke={ACCENT} strokeWidth={1.6} />
      <circle cx="268" cy={CY} r={3.4} fill="none" stroke={ACCENT} strokeWidth={1.6} />
      <text x="22" y="14" textAnchor="middle" fontSize="9" fill={ACCENT}>Mitte</text>
      <text x="268" y="14" textAnchor="middle" fontSize="9" fill={ACCENT}>Mitte</text>
    </svg>
  );
}

/**
 * Wo die Kettenstrebe sitzt: Tretlagermitte bis Hinterachsmitte.
 *
 * Blickrichtung nach rechts, wie bei Fahrradzeichnungen ueblich: Hinterrad
 * links, Vorderrad rechts, Lenker rechts oben. Die erste Fassung hatte den
 * Lenker links — damit zeigte das Rad nach links, und die hervorgehobene
 * Strebe lief zum Vorderrad statt zum Hinterrad.
 */
export function ChainstayDiagram() {
  const REAR = { x: 62, y: 88 };
  const FRONT = { x: 238, y: 88 };
  const BB = { x: 140, y: 88 };      // Tretlager
  const SEAT = { x: 118, y: 36 };    // Sattelrohr oben
  const HEAD = { x: 196, y: 36 };    // Steuerrohr oben

  return (
    <svg viewBox="0 0 310 130" className="w-full h-auto" role="img"
      aria-label="Kettenstrebe: vom Tretlager zur Hinterachse">
      <g stroke={FAINT} strokeWidth={1.6} fill="none" strokeLinecap="round">
        <circle cx={REAR.x} cy={REAR.y} r="30" />
        <circle cx={FRONT.x} cy={FRONT.y} r="30" />
        {/* Rahmendreieck */}
        <path d={`M${BB.x},${BB.y} L${SEAT.x},${SEAT.y} L${HEAD.x},${HEAD.y} L${BB.x},${BB.y}`} />
        {/* Sitzstrebe zum Hinterrad */}
        <path d={`M${SEAT.x},${SEAT.y} L${REAR.x},${REAR.y}`} />
        {/* Gabel und Lenker vorne */}
        <path d={`M${HEAD.x},${HEAD.y} L${FRONT.x},${FRONT.y}`} />
        <path d={`M${HEAD.x},${HEAD.y} L${HEAD.x + 8},${HEAD.y - 12} L${HEAD.x - 12},${HEAD.y - 12}`} />
      </g>

      {/* Die Kettenstrebe: Tretlager → Hinterachse */}
      <path d={`M${BB.x},${BB.y} L${REAR.x},${REAR.y}`} stroke={ACCENT} strokeWidth={3}
        strokeLinecap="round" fill="none" />
      <circle cx={BB.x} cy={BB.y} r={4.5} fill={ACCENT} />
      <circle cx={REAR.x} cy={REAR.y} r={4.5} fill={ACCENT} />

      <text x={(BB.x + REAR.x) / 2} y="108" textAnchor="middle" fontSize="10" fill={ACCENT}>
        Kettenstrebe
      </text>
      <text x={BB.x + 8} y="80" fontSize="9" fill={LABEL}>Tretlager</text>
      <text x={REAR.x - 34} y="72" fontSize="9" fill={LABEL}>Hinterachse</text>
    </svg>
  );
}

/** Was gezaehlt wird: die Ritzel hinten, nicht die Kettenblaetter vorne. */
export function SprocketCountDiagram() {
  // Kassette von der Seite: gestapelte Scheiben, aussen klein, innen gross.
  const cogs = [30, 26.5, 23, 19.5, 16, 12.5];
  return (
    <svg viewBox="0 0 310 96" className="w-full h-auto" role="img"
      aria-label="Die Ritzel der Kassette am Hinterrad zählen">
      {/* Nabe */}
      <rect x="60" y="44" width="180" height="8" rx="4" fill={FAINT} />
      {cogs.map((h, i) => {
        const x = 70 + i * 28;
        return (
          <g key={i}>
            <rect x={x} y={48 - h} width={9} height={h * 2} rx={2}
              fill="var(--sf2)" stroke={STROKE} strokeWidth={1.4} />
            <text x={x + 4.5} y="90" textAnchor="middle" fontSize="10" fill={ACCENT}>{i + 1}</text>
          </g>
        );
      })}
      <text x="245" y="52" fontSize="10" fill={LABEL}>…</text>
      <text x="155" y="14" textAnchor="middle" fontSize="10" fill={LABEL}>
Die Scheiben zählen, nicht die Zähne
      </text>
    </svg>
  );
}
