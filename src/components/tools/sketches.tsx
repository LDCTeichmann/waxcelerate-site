// ── Skizzen, die rechnen ────────────────────────────────────────────────────
//
// Mit dem Hoehen-Umbau (f26cf83) war diagrams.tsx geloescht worden — die Karten
// sollten auf eine Bildschirmhoehe passen, und die Skizzen kosteten Hoehe. Das
// Ergebnis waren Rechner, die Begriffe wie „Kettenstrebe" oder „Lehrenmarke"
// abfragten, ohne zu zeigen, was gemeint ist. Die Bildschirmhoehen-Regel ist
// wieder aufgehoben; die Skizzen sind zurueck.
//
// Die alten Skizzen (Messstrecke, Lehre, Kassetten-Verschleiss) stehen
// unveraendert hier. Neu sind die, die mit der Eingabe
// mitrechnen: der Antrieb der Kettenlaenge (Groesse der Zahnraeder und
// Strebenlaenge folgen den Feldern), die Zaehl-Skizze und die
// Kostenkurve des Umstiegs.
//
// Weiterhin eigene SVG statt Fotos oder Videos: keine Rechte Dritter, keine
// Cookies, Themefarben inklusive.

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

// ── Umstieg ─────────────────────────────────────────────────────────────────

/**
 * Kumulierte Kosten ueber die Zeit: Oel startet bei null und steigt steil,
 * Wachs startet beim Werkzeug und steigt flacher. Der Schnittpunkt ist der
 * Monat, ab dem der Umstieg im Plus ist — dieselbe Groesse wie
 * switchEconomics().breakEvenMonths, nur sichtbar statt als Zahl.
 */
export function CumulativeCostChart({ oilPerYear, waxPerYear, upfront, months = 24, de = true }: {
  oilPerYear: number; waxPerYear: number; upfront: number; months?: number; de?: boolean;
}) {
  const W = 310, H = 132;
  const L = 34, R = 10, T = 12, B = 22;
  const oilAt = (m: number) => (oilPerYear * m) / 12;
  const waxAt = (m: number) => upfront + (waxPerYear * m) / 12;
  const yMax = Math.max(oilAt(months), waxAt(months), 1) * 1.08;
  const x = (m: number) => L + (m / months) * (W - L - R);
  const y = (v: number) => T + (1 - v / yMax) * (H - T - B);

  const monthlyGain = (oilPerYear - waxPerYear) / 12;
  const crossM = monthlyGain > 0 ? upfront / monthlyGain : null;
  const crossIn = crossM !== null && crossM <= months;

  const eur = (v: number) => `${Math.round(v)} €`;
  const ticks = [0, Math.round(yMax / 2 / 10) * 10, Math.floor(yMax / 10) * 10].filter((v, i, a) => a.indexOf(v) === i);

  // Flaeche zwischen den Kurven nach dem Schnittpunkt = gesparter Betrag.
  const gainArea = crossIn
    ? `M${x(crossM!)},${y(oilAt(crossM!))} L${x(months)},${y(oilAt(months))} L${x(months)},${y(waxAt(months))} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label={de
        ? `Kumulierte Kosten über ${months} Monate: Öl gegen Wachs${crossIn ? `, Wachs ab Monat ${Math.ceil(crossM!)} günstiger` : ''}`
        : `Cumulative cost over ${months} months: oil versus wax${crossIn ? `, wax cheaper from month ${Math.ceil(crossM!)}` : ''}`}>
      {ticks.map(v => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={FAINT} strokeWidth={1} />
          <text x={L - 5} y={y(v) + 3} textAnchor="end" fontSize="8.5" fill={LABEL}>{eur(v)}</text>
        </g>
      ))}
      {[0, 6, 12, 18, 24].filter(m => m <= months).map(m => (
        <text key={m} x={x(m)} y={H - 7} textAnchor={m === months ? 'end' : m === 0 ? 'start' : 'middle'} fontSize="8.5" fill={LABEL}>
          {m === 0 ? (de ? 'Start' : 'Start') : `${m} ${de ? 'Mon.' : 'mo'}`}
        </text>
      ))}

      {gainArea && <path d={gainArea} fill="rgba(var(--ok-rgb),0.16)" style={MORPH} />}

      <path d={`M${x(0)},${y(0)} L${x(months)},${y(oilAt(months))}`} stroke="var(--txf)" strokeWidth={2} fill="none" style={MORPH} />
      <path d={`M${x(0)},${y(upfront)} L${x(months)},${y(waxAt(months))}`} stroke={ACCENT} strokeWidth={2.4} fill="none" style={MORPH} />
      <circle cx={x(0)} cy={y(upfront)} r={3} fill={ACCENT} />

      <text x={x(months) - 2} y={y(oilAt(months)) - 5} textAnchor="end" fontSize="9.5" fill="var(--txf)" fontWeight={600}>
        {de ? 'Öl' : 'Oil'}
      </text>
      <text x={x(months) - 2} y={y(waxAt(months)) + 12} textAnchor="end" fontSize="9.5" fill={ACCENT} fontWeight={600}>
        {de ? 'Wachs' : 'Wax'}
      </text>
      <text x={L + 6} y={T + 8} fontSize="8.5" fill={ACCENT}>
        ● {de ? 'Start: Werkzeug' : 'Start: tools'} {eur(upfront)}
      </text>

      {crossIn && (
        <g style={MORPH}>
          <line x1={x(crossM!)} x2={x(crossM!)} y1={y(oilAt(crossM!))} y2={H - B} stroke="var(--ok)" strokeWidth={1.2} strokeDasharray="3 2" />
          <circle cx={x(crossM!)} cy={y(oilAt(crossM!))} r={4} fill="var(--sf)" stroke="var(--ok)" strokeWidth={2} />
          <text x={x(crossM!)} y={y(oilAt(crossM!)) - 9} textAnchor="middle" fontSize="8.5" fontWeight={600} fill="var(--ok)">
            {de ? 'ab hier im Plus' : 'ahead from here'}
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Aus der frueheren diagrams.tsx ─────────────────────────────────────────

/** Messstrecke ueber 12 Glieder: Bolzenmitte bis Bolzenmitte, 12 Zoll. */
export function ChainMeasureDiagram() {
  const R = 7;
  const PITCH = 26;
  const CY = 30;
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
      {[...left, ...right].map(x => <circle key={`p${x}`} cx={x} cy={CY} r={1.8} fill={STROKE} />)}
      <path d={`M144,${CY - 12} l6,24 M156,${CY - 12} l6,24`} stroke={FAINT} strokeWidth={1.4} fill="none" />
      <g stroke={ACCENT} strokeWidth={1.4}>
        <path d={`M22,${CY + 20} v10 M268,${CY + 20} v10`} />
        <path d={`M22,${CY + 25} H268`} />
      </g>
      <text x="145" y={CY + 42} textAnchor="middle" fontSize="10" fill={LABEL}>
        12 Glieder = 304,8 mm (neu)
      </text>
      <circle cx="22" cy={CY} r={3.4} fill="none" stroke={ACCENT} strokeWidth={1.6} />
      <circle cx="268" cy={CY} r={3.4} fill="none" stroke={ACCENT} strokeWidth={1.6} />
      <text x="22" y="14" textAnchor="middle" fontSize="9" fill={ACCENT}>Mitte</text>
      <text x="268" y="14" textAnchor="middle" fontSize="9" fill={ACCENT}>Mitte</text>
    </svg>
  );
}

/**
 * Wie eine Kettenlehre greift: fester Fuss am einen Ende, Pruefspitze am
 * anderen. `state` folgt dem Urteil: 'ok' — Spitze liegt auf, 'worn' — sie
 * faellt in die Luecke.
 */
export function ChainGaugeDiagram({ state = 'worn' }: { state?: 'ok' | 'worn' }) {
  const R = 7;
  const PITCH = 26;
  const CY = 64;
  const xs = [0, 1, 2, 3, 4, 5, 6].map(i => 26 + i * PITCH);
  const plate = xs.slice(0, -1).map((x, i) => (
    <rect key={x} x={x - R - 1} y={CY - (R + 1)} width={xs[i + 1] - x + (R + 1) * 2}
      height={(R + 1) * 2} rx={R + 1} />
  ));
  const footX = (xs[0] + xs[1]) / 2;
  const tipX = (xs[5] + xs[6]) / 2;

  return (
    <svg viewBox="0 0 310 104" className="w-full h-auto" role="img"
      aria-label="Kettenlehre: fester Fuß am einen Ende, Prüfspitze am anderen">
      <g stroke={STROKE} strokeWidth={1.4} fill="var(--sf2)">
        {plate}
        {xs.map(x => <circle key={`r${x}`} cx={x} cy={CY} r={R} />)}
      </g>
      {xs.map(x => <circle key={`p${x}`} cx={x} cy={CY} r={1.8} fill={STROKE} />)}
      <rect x={footX - 6} y={26} width={tipX - footX + 12} height={13} rx={4}
        fill="var(--sf2)" stroke={STROKE} strokeWidth={1.4} />
      <path d={`M${footX},39 V${CY - 2}`} stroke={STROKE} strokeWidth={1.7} />
      <circle cx={footX} cy={CY - 1} r={3} fill="none" stroke={STROKE} strokeWidth={1.4} />
      <text x={footX} y={20} textAnchor="middle" fontSize="9" fill={LABEL}>fester Fuß</text>
      <g style={{ ...MORPH, transform: `translateY(${state === 'ok' ? -6 : 0}px)` }}>
        <path d={`M${tipX},39 V${CY + 1}`} stroke={ACCENT} strokeWidth={1.9} />
        <circle cx={tipX} cy={CY} r={3.4} fill="none" stroke={ACCENT} strokeWidth={1.6} />
        <path d={`M${tipX + 12},44 l-7,4 l3,-6 z`} fill={ACCENT} />
      </g>
      <text x={tipX + 6} y={20} textAnchor="middle" fontSize="9" fill={ACCENT}>0,5 %</text>
      <text x="155" y={92} textAnchor="middle" fontSize="10" fill={LABEL}>
        {state === 'ok' ? 'Spitze liegt auf: Kette in Ordnung' : 'Spitze fällt hinein: Kette raus'}
      </text>
    </svg>
  );
}

/**
 * Zwei Kassetten im Vergleich: links nach einer stark gelaengten Kette
 * („Hai-Zahn"), rechts nach Ketten im Wechsel.
 */
export function CassetteWearDiagram({ de = true }: { de?: boolean }) {
  const CY = 56;
  const R = 20;
  const TEETH = 10;

  function cogPoints(cx: number, worn: boolean): string {
    const pts: string[] = [];
    for (let i = 0; i < TEETH; i++) {
      const aBase = (i / TEETH) * Math.PI * 2 - Math.PI / 2;
      const aTip = ((i + 0.5) / TEETH) * Math.PI * 2 - Math.PI / 2;
      const tipR = worn && i % 2 === 0 ? R + 2.5 : R + 6;
      pts.push(`${(cx + Math.cos(aBase) * R).toFixed(1)},${(CY + Math.sin(aBase) * R).toFixed(1)}`);
      pts.push(`${(cx + Math.cos(aTip) * tipR).toFixed(1)},${(CY + Math.sin(aTip) * tipR).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  function chainArc(cx: number, loose: boolean) {
    const pitch = loose ? 12.5 : 10.5;
    const xs = [-1, 0, 1].map(i => cx + i * pitch);
    const y = CY - R - (loose ? 9 : 7);
    return (
      <g stroke={loose ? ACCENT : STROKE} strokeWidth={1.3} fill="var(--sf2)">
        {xs.slice(0, -1).map((x, i) => (
          <rect key={x} x={x - 4.5} y={y - 4.5} width={xs[i + 1] - x + 9} height={9} rx={4.5} />
        ))}
        {xs.map(x => <circle key={`r${x}`} cx={x} cy={y} r={3.6} />)}
      </g>
    );
  }

  const half = (cx: number, worn: boolean, caption: string) => (
    <g>
      <polygon points={cogPoints(cx, worn)} fill="var(--sf2)" stroke={worn ? STROKE : ACCENT} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={cx} cy={CY} r={5} fill={FAINT} />
      {chainArc(cx, worn)}
      <text x={cx} y="122" textAnchor="middle" fontSize="11" fill={LABEL}>{caption}</text>
    </g>
  );

  return (
    <svg viewBox="0 0 310 130" className="w-full h-auto" role="img"
      aria-label={de
        ? 'Vergleich: Kassette nach einer Kette gegen Kassette im Wechsel mehrerer Ketten'
        : 'Comparison: cassette after one chain versus a cassette used with chains in rotation'}>
      {half(78, true, de ? 'Eine Kette, lange gefahren' : 'One chain, ridden long')}
      {half(232, false, de ? 'Mehrere Ketten im Wechsel' : 'Several chains in rotation')}
      <text x="155" y="11" textAnchor="middle" fontSize="10" fill={LABEL}>
        {de ? 'Zahnflanken bei Kettenwechsel' : 'Tooth flanks at chain swap'}
      </text>
    </svg>
  );
}

/** Rahmen fuer eine Skizze auf der Karte — gleiche Flaeche ueberall. */
// `maxWidth`: die SVG-Beschriftung waechst mit der Breite. Auf einer 750 px
// breiten Karte waeren die 10er-Schriften sonst 24 px gross.
// `split`: erstes Kind (die Skizze) und zweites (z. B. die Rechnung) stehen
// auf breiten Karten nebeneinander (.cq-split in index.css).
export function SketchFrame({ children, caption, maxWidth = 360, split }: {
  children: React.ReactNode; caption?: React.ReactNode; maxWidth?: number; split?: boolean;
}) {
  return (
    <figure className="rounded-2xl px-3 pt-2.5 pb-2" style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)' }}>
      {split
        ? <div className="cq-split">{children}</div>
        : <div className="mx-auto" style={{ maxWidth }}>{children}</div>}
      {caption && <figcaption className="text-[11.5px] leading-snug mt-1" style={{ color: 'var(--txf)' }}>{caption}</figcaption>}
    </figure>
  );
}
