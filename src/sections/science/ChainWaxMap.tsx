// ─── ChainWaxMap — Draufsicht, Seitenansicht und eine Lupe ins Gelenk ────────
//
// Drei Ansichten, je eine Aufgabe, keine doppelt:
//
//   DRAUFSICHT     woraus die Kette besteht. Nur hier liegen die Teile ueber
//                  die Breite nebeneinander, also ist das die einzige Ansicht,
//                  in der man sie benennen kann, ohne dass sich die
//                  Fuehrungslinien verknoten. Und nur hier ist die dritte
//                  Gleitflaeche zu sehen — Innen- gegen Aussenlasche liegt
//                  seitlich und ist in der Seitenansicht prinzipiell unsichtbar.
//   SEITENANSICHT  so kennt man eine Kette. Reiner Erkennungsanker, keine
//                  Beschriftung, damit sie ruhig bleibt.
//   LUPE           wo das Wachs sitzt.
//
// Beide Ansichten teilen dieselben Bolzenpositionen und haengen an senkrechten
// Konstruktionslinien — wie auf dem Referenzblatt. Damit ist ohne ein Wort
// klar, dass oben und unten dieselbe Kette ist.
//
// Warum ueberhaupt zwei Ansichten und kein Schnitt: jeder Schnitt durch ein
// Kettengelenk liegt zwangslaeufig ENTLANG der Bolzenachse. Damit steht der
// Bolzen waagerecht im Bild und man schaut die Kette von der Kante an — Lucas
// wiederkehrende Rueckmeldung "die Kette liegt auf der Seite" beschreibt genau
// das, und sie stimmt: auf dem Rad sieht man eine Kette nie so. In echter
// Seitenansicht IST ein Gelenk dagegen von selbst ein Satz konzentrischer
// Kreise, es braucht also keinen Schnitt, nur eine Lupe.
//
// Die eigentliche Aussage: Wachs fuellt JEDEN Spalt — die runden (Bolzen gegen
// Kragen, Rolle gegen Kragen) und die flachen (Lasche gegen Lasche). Deshalb
// zwei Ansichten: es gibt zwei Sorten Spalt. Alles Metall bleibt neutral grau,
// blau ist ausschliesslich das Wachs.
//
// Moderne 9–12-fach-Ketten sind buchsenlos — der Kragen der Innenlasche hat
// die Buchse ersetzt. Eine Buchse waere fuer jede Kette, die wir verkaufen,
// schlicht falsch.

const P = 66;
const pins = Array.from({ length: 6 }, (_, i) => 92 + i * P);
const MARK = pins[4];                       // Gelenk unter der Lupe
const INNER: [number, number][] = [[1, 2], [3, 4]];
const OUTER: [number, number][] = [[0, 1], [2, 3], [4, 5]];

// ── Draufsicht ──────────────────────────────────────────────────────────────
const TY = 104;
const yOut: [number, number] = [TY - 40, TY - 32];   // Aussenlasche
const yWax: [number, number] = [TY - 32, TY - 25];   // Spalt = dritte Gleitflaeche
const yIn: [number, number] = [TY - 25, TY - 17];    // Innenlasche
const ROL_HW = 15, ROL_HL = 17;
const mir = (y: number) => 2 * TY - y;

// ── Seitenansicht ───────────────────────────────────────────────────────────
const CHY = 240;
const R_ROL = 22, R_COL = 15, R_PIN = 9, LOBE = 27, WAIST = 19;

// ── Lupe ────────────────────────────────────────────────────────────────────
const LX = 582, LY = 196, LR = 84;
// Verhaeltnis nah am echten Gelenk (Bolzen : Kragen : Rolle etwa 1:2:3), die
// Wachsspalte bewusst ueberhoeht — massstabsgetreu waeren sie Haarlinien.
const rPin = 21, rW1 = 28, rCol = 44, rW2 = 51, rRol = 67;

// Metallabstufung als neutrale Grauwaesche statt ueber die Flaechentoken:
// --sf2 ist zugleich der Fond der Teaser-Karte, dort waeren die Laschen
// unsichtbar, und --sf3 ist im Noir-Theme dunkler als die Seite. Mittleres
// Grau mit Alpha dunkelt helle Untergruende ab und hellt dunkle auf, wirkt
// also in beiden Themes in dieselbe Richtung. R=G=B, wie DESIGN.md §1 fordert.
const METAL = {
  light: 'rgba(128,128,128,0.10)',
  mid: 'rgba(128,128,128,0.22)',
  strong: 'rgba(128,128,128,0.34)',
};

const HAIR = { strokeWidth: 'var(--dw-hair)' } as const;
const LINE = { strokeWidth: 'var(--dw-line)' } as const;

function plate(x1: number, x2: number, y: number, R: number, w: number) {
  const m = (x1 + x2) / 2;
  return `M ${x1} ${y - R} Q ${m} ${y - w} ${x2} ${y - R} A ${R} ${R} 0 0 1 ${x2} ${y + R} `
    + `Q ${m} ${y + w} ${x1} ${y + R} A ${R} ${R} 0 0 1 ${x1} ${y - R} Z`;
}

// Ring mit Loch. Gestapelte Vollkreise gingen nicht: die Metallflaechen sind
// halbtransparent, das Blau darunter schien durch und liess die Lupe wie eine
// blaue Scheibe aussehen.
function ring(cx: number, cy: number, ro: number, ri: number) {
  return `M ${cx - ro} ${cy} a ${ro} ${ro} 0 1 0 ${ro * 2} 0 a ${ro} ${ro} 0 1 0 ${-ro * 2} 0 `
    + `M ${cx - ri} ${cy} a ${ri} ${ri} 0 1 1 ${ri * 2} 0 a ${ri} ${ri} 0 1 1 ${-ri * 2} 0`;
}

function Bar({ x0, x1, y0, y1, fill, stroke = 'var(--txf)' }: {
  x0: number; x1: number; y0: number; y1: number; fill: string; stroke?: string;
}) {
  return <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={fill} stroke={stroke} style={LINE} />;
}

/** Balkenpaar, oben und an der Mittellinie gespiegelt. */
function Pair({ x0, x1, ys, fill, stroke }: {
  x0: number; x1: number; ys: [number, number]; fill: string; stroke?: string;
}) {
  return (
    <>
      <Bar x0={x0} x1={x1} y0={ys[0]} y1={ys[1]} fill={fill} stroke={stroke} />
      <Bar x0={x0} x1={x1} y0={mir(ys[1])} y1={mir(ys[0])} fill={fill} stroke={stroke} />
    </>
  );
}

const topLabels = (de: boolean) => [
  { x: pins[0] + 26, y: yOut[0], lx: 92, t: de ? 'Außenlasche' : 'Outer plate' },
  { x: pins[2] - 26, y: yIn[0], lx: 236, t: de ? 'Innenlasche' : 'Inner plate' },
  { x: pins[3], y: TY - ROL_HW, lx: 372, t: de ? 'Rolle' : 'Roller' },
  { x: pins[5], y: (yOut[0] + yOut[1]) / 2 - 3, lx: 486, t: de ? 'Bolzen' : 'Pin' },
];

export function ChainWaxMap({
  de,
  active,
  teaser = false,
  onZone,
}: {
  de: boolean;
  /** 0 = Bolzen/Kragen · 1 = Rolle/Kragen · 2 = Laschen. null zeigt alles gleich. */
  active: number | null;
  /** ScienceTeaser.tsx: blendet Seitenansicht, Beschriftungen und die
      Bildunterschrift aus (bei Teaser-Groesse nur Ballast, siehe dort), engt
      die viewBox auf Draufsicht+Lupe ein (zoomt beides sichtbar groesser),
      und macht den Zonenwechsel deutlich auffaelliger — kraeftigeres Blau auf
      der aktiven Flaeche statt der leichten Abdunklung im Vollmodus. Luca-
      Feedback: der Wechsel zwischen den Zonen war in der Startseiten-Karte zu
      subtil, um als "hier passiert gerade etwas" gelesen zu werden. */
  teaser?: boolean;
  onZone?: (i: number) => void;
}) {
  const dim = (i: number) => (active === null || active === i ? 1 : (teaser ? 0.1 : 0.45));
  const glow = (i: number) => (teaser && active === i
    ? { filter: 'drop-shadow(0 0 7px rgba(var(--accent-rgb),0.85))' } : undefined);
  const hit = (i: number) =>
    onZone ? { onMouseEnter: () => onZone(i), style: { cursor: 'pointer' } } : {};
  const TOP_LABELS = topLabels(de);

  return (
    <svg viewBox={teaser ? '40 6 640 294' : '0 0 700 300'} className="w-full h-auto" role="img"
      aria-label={de
        ? 'Fahrradkette in Draufsicht und Seitenansicht, dazu ein Gelenk vergrößert; blau markiert sind die Wachsfilme zwischen Laschen, Bolzen, Kragen und Rolle'
        : 'Bicycle chain in plan and side view, with one joint enlarged; blue marks the wax films between plates, pin, collar and roller'}>

      {/* ── Draufsicht: hier liegen die Teile nebeneinander, also werden sie
             hier benannt — und nur hier ist die Lasche-gegen-Lasche-Fläche zu
             sehen, die seitlich liegt. ── */}
      <g>
        {INNER.map(([a, b]) => (
          <Pair key={`ti${a}`} x0={pins[a] - 14} x1={pins[b] + 14} ys={yIn} fill={METAL.mid} />
        ))}
        {pins.slice(1, -1).map(x => (
          <Bar key={`tr${x}`} x0={x - ROL_HL} x1={x + ROL_HL} y0={TY - ROL_HW} y1={TY + ROL_HW} fill={METAL.strong} />
        ))}
        <g {...hit(2)}>
          {OUTER.map(([a, b]) => {
            const x0 = pins[a] - 16, x1 = pins[b] + 16;
            return (
              <g key={`to${a}`}>
                <rect x={x0} y={yWax[0]} width={x1 - x0} height={yWax[1] - yWax[0]}
                  fill="var(--accent)" opacity={0.9 * dim(2)} style={{ transition: 'opacity .35s', ...glow(2) }} />
                <rect x={x0} y={mir(yWax[1])} width={x1 - x0} height={yWax[1] - yWax[0]}
                  fill="var(--accent)" opacity={0.9 * dim(2)} style={{ transition: 'opacity .35s', ...glow(2) }} />
                <Pair x0={x0} x1={x1} ys={yOut} fill={METAL.light} stroke="var(--tx2)" />
              </g>
            );
          })}
        </g>
        {pins.map(x => (
          <g key={`tp${x}`}>
            <line x1={x} y1={yOut[0]} x2={x} y2={mir(yOut[0])} stroke="var(--txf)"
              strokeDasharray="4 3" style={HAIR} />
            {[(yOut[0] + yOut[1]) / 2, mir((yOut[0] + yOut[1]) / 2)].map(cy => (
              <ellipse key={cy} cx={x} cy={cy} rx={7} ry={3.2}
                fill={METAL.strong} stroke="var(--tx2)" style={HAIR} />
            ))}
          </g>
        ))}
        <line x1={54} y1={TY} x2={pins[5] + 34} y2={TY} stroke="var(--txf)"
          strokeDasharray="16 4 3 4" style={HAIR} />
      </g>

      {/* Benennung — Fuehrungslinien steigen dort auf, wo darueber nichts liegt.
          Im Teaser ausgeblendet: bei Teaser-Groesse nur Ballast, nicht lesbar. */}
      {!teaser && TOP_LABELS.map(({ x, y, lx, t }) => (
        <g key={t}>
          <line x1={x} y1={y} x2={lx} y2={34} stroke="var(--bd)" style={HAIR} />
          <text className="num-data" fontSize={16} fill="var(--txf)" textAnchor="middle" x={lx} y={26}>{t}</text>
        </g>
      ))}

      {/* Konstruktionslinien + Seitenansicht + ihre Lupe-Leitlinien: nur im
          Vollmodus. Der Teaser zeigt nur Draufsicht (Zone 03) und Lupe (Zonen
          01/02) — die Seitenansicht ist laut Kommentar oben ohnehin nur ein
          Erkennungsanker ohne eigene Aussage, ihr Wegfall gibt Draufsicht und
          Lupe mehr Platz in der engeren Teaser-viewBox. */}
      {!teaser && (
        <>
          {pins.map(x => (
            <line key={`c${x}`} x1={x} y1={mir(yOut[0]) + 10} x2={x} y2={CHY - 32}
              stroke="var(--bd)" strokeDasharray="3 4" style={HAIR} />
          ))}

          <g>
            {INNER.map(([a, b]) => (
              <path key={`si${a}`} d={plate(pins[a], pins[b], CHY, LOBE - 5, WAIST - 4)}
                fill={METAL.mid} stroke="var(--txf)" style={LINE} />
            ))}
            {OUTER.map(([a, b]) => (
              <path key={`so${a}`} d={plate(pins[a], pins[b], CHY, LOBE, WAIST)}
                fill={METAL.light} stroke="var(--tx2)" style={LINE} />
            ))}
            {pins.map(x => (
              <g key={`sp${x}`}>
                <circle cx={x} cy={CHY} r={R_ROL} fill="none" stroke="var(--txf)" style={HAIR} />
                <circle cx={x} cy={CHY} r={R_COL} fill="none" stroke="var(--txf)" style={HAIR} />
                <circle cx={x} cy={CHY} r={(R_COL + R_PIN) / 2} fill="none"
                  stroke="var(--accent)" strokeWidth={3} opacity={0.75} />
                <circle cx={x} cy={CHY} r={R_PIN} fill={METAL.strong} stroke="var(--tx2)" style={HAIR} />
              </g>
            ))}
            <circle cx={MARK} cy={CHY} r={R_ROL + 5} fill="none" stroke="var(--accent)"
              strokeDasharray="4 3" style={HAIR} />
          </g>

          <line x1={MARK + R_ROL} y1={CHY - 14} x2={LX - LR * 0.78} y2={LY + LR * 0.66}
            stroke="var(--accent)" strokeDasharray="5 4" style={HAIR} opacity={0.45} />
          <line x1={MARK + R_ROL} y1={CHY + 10} x2={LX - LR * 0.28} y2={LY + LR * 0.97}
            stroke="var(--accent)" strokeDasharray="5 4" style={HAIR} opacity={0.45} />
        </>
      )}

      {/* ── Lupe auf das markierte Gelenk ── */}
      <circle cx={LX} cy={LY} r={LR} fill="var(--sf)" stroke="var(--txf)" style={LINE} />
      <g {...hit(1)}>
        <path d={ring(LX, LY, rRol, rW2)} fillRule="evenodd" fill={METAL.strong}
          stroke="var(--txf)" style={LINE} />
        <path d={ring(LX, LY, rW2, rCol)} fillRule="evenodd" fill="var(--accent)"
          opacity={dim(1)} style={{ transition: 'opacity .35s', ...glow(1) }} />
      </g>
      <g {...hit(0)}>
        <path d={ring(LX, LY, rCol, rW1)} fillRule="evenodd" fill={METAL.mid}
          stroke="var(--txf)" style={LINE} />
        <path d={ring(LX, LY, rW1, rPin)} fillRule="evenodd" fill="var(--accent)"
          opacity={dim(0)} style={{ transition: 'opacity .35s', ...glow(0) }} />
      </g>
      <circle cx={LX} cy={LY} r={rPin} fill={METAL.strong} stroke="var(--tx2)" style={LINE} />
      <line x1={LX + 6} y1={LY - (rW1 + rPin) / 2 - 2} x2={LX + 26} y2={LY - LR - 14}
        stroke="var(--accent)" style={HAIR} opacity={0.6} />
      <text className="num-data" fontSize={16} fill="var(--accent)" textAnchor="middle"
        x={LX + 28} y={LY - LR - 18}>{de ? 'Wachsfilm' : 'Wax film'}</text>

      {/* Die Pointe: es gibt zwei Sorten Spalt, deshalb zwei Ansichten. Nur im
          Vollmodus — im Teaser uebernimmt das synchron mitlaufende Zonenlabel
          in ScienceTeaser.tsx diese Rolle. */}
      {!teaser && (
        <text className="num-data" fontSize={14} fill="var(--txf)" x={54} y={292}>
          {de ? 'Draufsicht: die flachen Spalte · Seitenansicht: die runden · ' : 'Plan view: the flat gaps · Side view: the round ones · '}
          <tspan fill="var(--accent)">{de ? 'blau = Wachs' : 'blue = wax'}</tspan>
        </text>
      )}
    </svg>
  );
}
