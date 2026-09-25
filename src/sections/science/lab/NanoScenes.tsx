// ─── Mikroskop-Szenen des Film-Labors ─────────────────────────────────────────
//
// Jede Szene zeigt den Vorgang, den science.ts fuer die Komponente in Worten
// beschreibt — und mit `without` genau den Zustand, der ohne sie eintritt
// (WITHOUT in SciencePage, FAILURES in science.ts). Schematisch, aber
// chemisch richtig gezeichnet:
//
//  Paraffin   n-Alkane C20–C36 als Zickzack aus C-Atomen. Aus dem Knaeuel der
//             Schmelze strecken sie sich und rasten zu Lamellen ein; die
//             Lamellendicke entspricht der gestreckten Kettenlaenge (4–5 nm),
//             zwischen zwei Lamellen liegt die Ebene der Methyl-Enden.
//  MoS2       S–Mo–S-Blaetter (Bindungen nur innerhalb eines Blatts), die unter
//             Last auf der Basalebene gleiten. Abgescherte Flocken lagern sich
//             in die Taeler der Stahlrauheit: so entsteht der Transferfilm.
//             Ohne: die Rauheitsspitzen reiben direkt, Abrieb entsteht.
//  FT-Wachs   Waermetest im Molekuelgitter: kurze Paraffinketten werden ab
//             ~60 °C unruhig, die langen FT-Ketten halten das Gitter bis ~75 °C.
//  Mikro      Zwischen zwei Lamellenstapeln fuellen verzweigte und zyklische
//             Molekuele die amorphe Zone. Unter Biegung bei −8 °C schert sie.
//             Ohne: die Grenze reisst auf.
//  Dispergier Zwei MoS2-Partikel mit Esterbuerste stossen sich ab (sterisch).
//             Ohne: sie ziehen sich an, verklumpen und sinken.
//  Antiox     Ein Peroxylradikal ROO• will ein H aus einer Wachskette ziehen.
//             Das gehinderte Phenol gibt sein H zuerst ab (ROOH, neutral).
//             Ohne: die Kette verliert ihr H, wird selbst Radikal, O2 lagert
//             sich an, die Reaktion laeuft weiter.
//
// Farben folgen der CPK-Konvention der Chemie, wo es um Atome geht (S gelb,
// O rot, H weiss), Blau bleibt Wachs, das Radikal ist warm.

import type { FieldKey } from '../WaxField';

export interface NanoScene { art: React.ReactNode; cap: string }
type Render = (t: number, de: boolean, without: boolean) => NanoScene;

const TAU = Math.PI * 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const C_BOND = '#7FA6DA';     // Wachs: Kohlenstoffgeruest
const C_ATOM = '#C9DAF2';
const H_ATOM = '#F4F6F8';
const S_ATOM = '#E8C547';
const MO_ATOM = '#AEB9C7';
const O_ATOM = '#E5534B';
const RADICAL = '#FF8A3D';
const STEEL_TOP = '#8C96A3';
const STEEL_BOT = '#2A2F36';

function steelDefs(id: string) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={STEEL_TOP} />
      <stop offset="1" stopColor={STEEL_BOT} />
    </linearGradient>
  );
}

// ── Paraffin ────────────────────────────────────────────────────────────────
const P_CHAINS = 11, P_ATOMS = 16, P_LEN = 78;
function coil(chain: number, k: number) {
  // gesaeter Zufallsweg: die Kette als Knaeuel in der Schmelze
  let x = 0, y = 0;
  for (let i = 0; i < k; i++) { const a = hash(chain * 97 + i) * TAU; x += Math.cos(a) * 6.5; y += Math.sin(a) * 6.5; }
  return { x, y };
}
const paraffin: Render = (t, de) => {
  const u = t % 10;
  const out: React.ReactNode[] = [];
  let ordered = 0;
  [30, 130].forEach((y0, band) => {
    for (let i = 0; i < P_CHAINS; i++) {
      const cx = 25 + i * 19;
      // Wachstumsfront von links: Kette i ordnet sich etwas spaeter als i-1
      const o = smooth(2 + i * 0.16 + band * 0.4, 3.6 + i * 0.16 + band * 0.4, u) * (1 - smooth(9.3, 9.9, u));
      if (band === 0) ordered += o / P_CHAINS;
      const pts: [number, number][] = [];
      for (let k = 0; k < P_ATOMS; k++) {
        const sx = cx + (k % 2 ? 3.4 : -3.4), sy = y0 + (k * P_LEN) / (P_ATOMS - 1);
        const c = coil(band * 50 + i, k);
        const mx = cx + c.x * 0.9 + Math.sin(t * 3 + i + k) * 2.5, my = y0 + 30 + c.y * 0.7 + Math.cos(t * 2.6 + k) * 2.5;
        const vib = 0.5 * Math.sin(t * 9 + i * 1.3 + k);
        pts.push([lerp(mx, sx + vib, o), lerp(my, sy, o)]);
      }
      out.push(<polyline key={`b${band}${i}`} points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={C_BOND} strokeWidth="1.8" strokeLinejoin="round" />);
      pts.forEach(([x, y], k) => out.push(<circle key={`a${band}${i}${k}`} cx={x} cy={y} r={k === 0 || k === P_ATOMS - 1 ? 2.8 : 2.1} fill={C_ATOM} />));
    }
  });
  return {
    art: (
      <>
        {out}
        <g opacity={ordered}>
          <rect x="10" y="110" width="220" height="18" fill="rgba(191,211,240,0.07)" />
          <line x1="10" y1="119" x2="230" y2="119" stroke="rgba(191,211,240,0.45)" strokeDasharray="3 4" />
          <path d="M226 30 L232 30 L232 108 L226 108" fill="none" stroke="#DDE7F4" strokeWidth="1.2" />
        </g>
      </>
    ),
    cap: ordered < 0.5
      ? (de ? 'Schmelze: die Paraffinketten (C₂₀–C₃₆) liegen als Knäuel durcheinander.' : 'Melt: the paraffin chains (C₂₀–C₃₆) lie tangled.')
      : (de ? 'Beim Erstarren strecken sich die Ketten und rasten zu Lamellen ein. Eine Lamelle ist so dick wie eine Kette lang: 4–5 nm.' : 'On solidifying the chains straighten and lock into lamellae. A lamella is as thick as a chain is long: 4–5 nm.'),
  };
};

// ── MoS2 ────────────────────────────────────────────────────────────────────
const VALLEYS = [34, 86, 138, 190];
function steelSurface(y0: number, amp: number, phase = 0) {
  const pts: string[] = [];
  for (let x = -10; x <= 250; x += 13) {
    const i = Math.round((x + 10) / 13);
    pts.push(`${x},${(y0 + (i % 2 ? -amp : amp) * (0.7 + 0.3 * hash(i + phase))).toFixed(1)}`);
  }
  return pts;
}
function sheet(y: number, dx: number, key: string) {
  const step = 24, out: React.ReactNode[] = [], bonds: string[] = [];
  for (let i = -2; i < 12; i++) {
    const mx = i * step + dx, sx = mx + step / 2;
    bonds.push(`M${sx} ${y} L${mx} ${y + 10} L${sx} ${y + 20}`, `M${sx} ${y} L${mx + step} ${y + 10} L${sx} ${y + 20}`);
    out.push(<circle key={`${key}m${i}`} cx={mx} cy={y + 10} r={6} fill={MO_ATOM} />);
    out.push(<circle key={`${key}a${i}`} cx={sx} cy={y} r={4.2} fill={S_ATOM} />);
    out.push(<circle key={`${key}b${i}`} cx={sx} cy={y + 20} r={4.2} fill={S_ATOM} />);
  }
  return [<path key={`${key}bd`} d={bonds.join(' ')} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" />, ...out];
}
const mos2: Render = (t, de, without) => {
  const steel = steelSurface(196, 9);
  // Ohne Transferfilm sinkt die Gegenflaeche unter Last bis auf die Spitzen
  // des Stahls: dort reiben Metall und Metall direkt.
  const top = steelSurface(26, 7, 5).map(p => { const [x, y] = p.split(',').map(Number); return `${x},${(y + (without ? 136 + Math.sin(t * 2.4) * 2 : 0)).toFixed(1)}`; });
  const u = t % 12;
  const art: React.ReactNode[] = [];
  art.push(<defs key="d">{steelDefs('ns-steel')}
    <linearGradient id="ns-steel-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={STEEL_BOT} /><stop offset="1" stopColor={STEEL_TOP} /></linearGradient>
  </defs>);
  art.push(<rect key="wax" x="0" y="0" width="240" height="240" fill="rgba(61,103,202,0.10)" />);
  // Gegenflaeche (Bolzen) oben
  art.push(<path key="top" d={`M -10 0 L ${top.join(' L ')} L 250 0 Z`} fill="url(#ns-steel-top)" />);
  if (!without) {
    const dx = (t * 9) % 24;
    art.push(<g key="s1">{sheet(58, dx, 'a')}</g>);
    art.push(<line key="vdw" x1="0" y1="89" x2="240" y2="89" stroke="rgba(191,211,240,0.35)" strokeDasharray="4 5" />);
    art.push(<g key="s2">{sheet(98, dx * 0.25, 'b')}</g>);
    // Flocken wandern in die Taeler und bleiben dort (Transferfilm)
    VALLEYS.forEach((vx, j) => {
      const start = 1 + j * 2.1, land = start + 1.8;
      const f = smooth(start, land, u);
      const fill = smooth(land, land + 1.2, u) * (1 - smooth(11.4, 11.9, u));
      if (u > start && u < land + 0.1) {
        const y = lerp(130, 188, f);
        art.push(<g key={`fl${j}`} transform={`translate(${vx} ${y}) rotate(${(1 - f) * 25})`}>
          <line x1="-9" y1="0" x2="9" y2="0" stroke="rgba(255,255,255,0.4)" />
          <circle cx="-8" cy="-3" r="2.6" fill={S_ATOM} /><circle cx="0" cy="0" r="3.4" fill={MO_ATOM} /><circle cx="8" cy="-3" r="2.6" fill={S_ATOM} />
        </g>);
      }
      art.push(<path key={`pv${j}`} d={`M ${vx - 13} ${196 - 9} Q ${vx} ${196 + 6} ${vx + 13} ${196 - 9} Z`} fill={MO_ATOM} opacity={0.75 * fill} />);
    });
  } else {
    // Spitzen treffen sich: Kontaktblitze und Abrieb
    [42, 94, 146, 198].forEach((x, j) => {
      const flash = Math.max(0, Math.sin(t * 4 + j * 2.2));
      art.push(<circle key={`fx${j}`} cx={x} cy={180} r={3 + flash * 7} fill={RADICAL} opacity={flash * 0.6} />);
      for (let k = 0; k < 3; k++) {
        const ph = (t * 0.8 + j * 0.37 + k * 0.33) % 1;
        art.push(<circle key={`d${j}${k}`} cx={x + (k - 1) * 8 + ph * 22} cy={180 - ph * 16} r="1.8" fill="#C9D1DA" opacity={1 - ph} />);
      }
    });
  }
  art.push(<path key="steel" d={`M -10 240 L ${steel.join(' L ')} L 250 240 Z`} fill="url(#ns-steel)" />);
  art.push(<polyline key="edge" points={steel.join(' ')} fill="none" stroke="#C9D1DA" strokeWidth="1.2" />);
  return {
    art: <>{art}</>,
    cap: without
      ? (de ? 'Ohne MoS₂ entsteht am Stahl kein Transferfilm. Die Rauheitsspitzen reiben direkt aufeinander, Abrieb entsteht.' : 'Without MoS₂ no transfer film forms on the steel. Asperity tips rub directly, wear debris forms.')
      : (de ? 'S–Mo–S-Blätter gleiten übereinander, Bindungen gibt es nur innerhalb eines Blatts. Abgescherte Flocken füllen die Täler der Stahlrauheit: der Transferfilm.' : 'S–Mo–S sheets glide over each other; bonds exist only within a sheet. Sheared flakes fill the valleys of the steel: the transfer film.'),
  };
};

// ── FT-Wachs ────────────────────────────────────────────────────────────────
const ftWax: Render = (t, de, without) => {
  const u = (t % 12) / 12;
  const T = 35 + 50 * (u < 0.6 ? smooth(0, 0.6, u) : 1 - smooth(0.7, 1, u));
  const dP = smooth(54, 62, T), dF = smooth(72, 80, T);
  const hold = without ? dP : Math.max(dP * 0.3, dF);
  const sag = without ? dP * 26 : dF * 18;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const cx = 18 + i * 17;
    const isFt = !without && i % 3 === 1;
    const bands = isFt ? [[34, 196]] : [[34, 108], [122, 196]];
    bands.forEach(([y0, y1], b) => {
      const n = isFt ? 26 : 12, pts: string[] = [];
      const dis = isFt ? dF : hold;
      for (let k = 0; k < n; k++) {
        const y = y0 + ((y1 - y0) * k) / (n - 1) + (isFt ? 0 : sag * (k / n));
        const jit = dis * 9 * Math.sin(t * (6 + i % 3) + k * 1.7 + i) + dis * 7 * (hash(i * 31 + k + b) - 0.5);
        pts.push(`${(cx + (k % 2 ? 3 : -3) + jit).toFixed(1)},${y.toFixed(1)}`);
      }
      out.push(<polyline key={`${i}${b}`} points={pts.join(' ')} fill="none" stroke={isFt ? '#DDE7F4' : C_BOND} strokeWidth={isFt ? 2.4 : 1.6} strokeLinejoin="round" opacity={isFt ? 1 : 0.9} />);
    });
  }
  const tp = (T - 30) / 60;
  return {
    art: (
      <>
        {out}
        <rect x="219" y="30" width="10" height="170" rx="5" fill="none" stroke="rgba(255,255,255,0.35)" />
        <rect x="221.5" y={32 + 166 * (1 - tp)} width="5" height={166 * tp} rx="2.5" fill={RADICAL} />
        {[60, 75].map(v => <line key={v} x1="212" x2="234" y1={32 + 166 * (1 - (v - 30) / 60)} y2={32 + 166 * (1 - (v - 30) / 60)} stroke="#DDE7F4" strokeDasharray="2 2" />)}
      </>
    ),
    cap: without
      ? (de ? `${Math.round(T)} °C · ohne FT-Wachs verliert das Gitter ab ~60 °C seinen Halt: die Matrix wird weich und wandert.` : `${Math.round(T)} °C · without FT wax the lattice loses its hold from ~60 °C: the matrix softens and migrates.`)
      : (de ? `${Math.round(T)} °C · die kurzen Paraffinketten werden ab ~60 °C unruhig, die langen FT-Ketten (hell) halten das Gitter bis ~75 °C.` : `${Math.round(T)} °C · the short paraffin chains stir from ~60 °C, the long FT chains (light) hold the lattice up to ~75 °C.`),
  };
};

// ── Mikrokristallin ─────────────────────────────────────────────────────────
const micro: Render = (t, de, without) => {
  const k = Math.sin(((t % 6) / 6) * Math.PI);
  const bend = (x: number, y: number) => y + k * 22 * ((x - 120) / 110) ** 2;
  const crack = without ? smooth(0.35, 0.75, k) : 0;
  const out: React.ReactNode[] = [];
  // zwei Lamellenstapel
  [[36, 96], [144, 204]].forEach(([y0, y1], b) => {
    for (let i = 0; i < 13; i++) {
      const x = 14 + i * 17.5;
      out.push(<line key={`l${b}${i}`} x1={x} y1={bend(x, y0)} x2={x} y2={bend(x, y1)} stroke={C_BOND} strokeWidth="2.2" strokeLinecap="round" />);
    }
  });
  if (!without) {
    // verzweigte und ringfoermige Molekuele in der amorphen Zone
    for (let i = 0; i < 9; i++) {
      const x = 22 + i * 25 + Math.sin(t * 2 + i) * 2, y = bend(x, 120 + Math.sin(t * 1.6 + i * 2) * 3);
      const rot = k * ((x - 120) / 110) * 30 + i * 40;
      out.push(i % 3 === 1
        ? <polygon key={`r${i}`} transform={`translate(${x} ${y}) rotate(${rot})`} points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="none" stroke="#A9C4E6" strokeWidth="1.5" />
        : <path key={`y${i}`} transform={`translate(${x} ${y}) rotate(${rot})`} d="M0 10 L0 0 L-7 -8 M0 0 L7 -8 M-7 -8 L-10 -14 M7 -8 L12 -12" fill="none" stroke="#A9C4E6" strokeWidth="1.5" strokeLinecap="round" />);
    }
  } else if (crack > 0.02) {
    // Riss entlang der Grenzflaeche, von der Mitte aus
    const w = crack * 120, pts: string[] = [], back: string[] = [];
    for (let x = 120 - w; x <= 120 + w; x += 8) {
      const j = (hash(Math.round(x)) - 0.5) * 6;
      pts.push(`${x},${bend(x, 116 + j - crack * 6)}`); back.unshift(`${x},${bend(x, 124 + j + crack * 6)}`);
    }
    out.push(<polygon key="crack" points={[...pts, ...back].join(' ')} fill="#05070A" stroke={RADICAL} strokeWidth="1.2" />);
  }
  return {
    art: <>{!without && <rect x="0" y={100} width="240" height="40" fill="rgba(169,196,230,0.08)" />}{out}</>,
    cap: without
      ? (de ? '−8 °C, gebogen: ohne Mikrokristallin ist die Zone zwischen den Lamellen spröde. Die Grenze reißt auf, der Film platzt ab.' : '−8 °C, flexed: without microcrystalline wax the zone between lamellae is brittle. The boundary cracks and the film spalls.')
      : (de ? '−8 °C, gebogen: verzweigte und ringförmige Moleküle füllen die Zone zwischen den Lamellen. Sie schert, statt zu reißen.' : '−8 °C, flexed: branched and ring molecules fill the zone between the lamellae. It shears instead of cracking.'),
  };
};

// ── Dispergiersystem ────────────────────────────────────────────────────────
function particle(x: number, y: number, brush: boolean, key: string, t: number) {
  const w = 54, h = 11;
  const out: React.ReactNode[] = [];
  if (brush) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      const ex = Math.cos(a) * (w / 2 + 2), ey = Math.sin(a) * (h / 2 + 2);
      const L = 12 + Math.sin(t * 5 + i) * 1.5;
      const nx = Math.cos(a), ny = Math.sin(a) * 1.8;
      const nl = Math.hypot(nx, ny);
      out.push(<g key={`${key}b${i}`}>
        <line x1={x + ex} y1={y + ey} x2={x + ex + (nx / nl) * L} y2={y + ey + (ny / nl) * L} stroke="#A9C4E6" strokeWidth="1.3" />
        <circle cx={x + ex + (nx / nl) * L} cy={y + ey + (ny / nl) * L} r="1.8" fill="#A9C4E6" />
      </g>);
    }
  }
  out.push(<path key={`${key}p`} transform={`translate(${x} ${y})`} d={`M ${-w / 2} 0 L ${-w / 2 + 6} ${-h / 2} L ${w / 2 - 6} ${-h / 2} L ${w / 2} 0 L ${w / 2 - 6} ${h / 2} L ${-w / 2 + 6} ${h / 2} Z`} fill={MO_ATOM} stroke="#EEF2F6" strokeWidth="0.8" />);
  out.push(<line key={`${key}s`} x1={x - w / 2 + 6} x2={x + w / 2 - 6} y1={y - h / 2 + 2.5} y2={y - h / 2 + 2.5} stroke={S_ATOM} strokeWidth="1.4" opacity="0.8" />);
  return out;
}
const dispersant: Render = (t, de, without) => {
  const u = t % 7;
  let xa: number, xb: number, y: number;
  if (!without) {
    const gap = 60 + 30 * (0.5 + 0.5 * Math.cos((u / 7) * TAU));       // Mindestabstand = zwei Buersten
    xa = 120 - gap / 2 - 27; xb = 120 + gap / 2 + 27; y = 118 + Math.sin(t * 1.3) * 4;
  } else {
    const meet = smooth(0, 2.2, u);
    const d = lerp(120, 0, meet * meet);
    xa = 120 - d / 2 - 27; xb = 120 + d / 2 + 27;
    y = 118 + smooth(2.4, 6.2, u) * 120;
  }
  return {
    art: (
      <>
        <rect x="0" y="0" width="240" height="240" fill="rgba(61,103,202,0.10)" />
        {without && <path d="M205 150 L205 200 M199 192 L205 201 L211 192" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" fill="none" />}
        {particle(xa, y, !without, 'a', t)}
        {particle(xb, y + (without ? 0 : Math.sin(t * 1.7) * 3), !without, 'b', t)}
      </>
    ),
    cap: without
      ? (de ? 'Ohne Hülle ziehen sich die Partikel an, verklumpen und sinken. MoS₂ ist 5,6× dichter als Wachs.' : 'Without a shell the particles attract, clump and sink. MoS₂ is 5.6× denser than wax.')
      : (de ? 'Jedes Partikel trägt eine Esterbürste. Kommen sich zwei zu nahe, stoßen die Bürsten sie ab: sie bleiben in der Schwebe verteilt.' : 'Each particle carries an ester brush. When two get too close the brushes push them apart: they stay dispersed.'),
  };
};

// ── Antioxidans ─────────────────────────────────────────────────────────────
function waxChain(y: number, broken: number) {
  const out: React.ReactNode[] = [];
  const pts: [number, number][] = [];
  for (let i = 0; i < 15; i++) pts.push([10 + i * 16, i % 2 ? y + 7 : y]);
  for (let i = 0; i < pts.length - 1; i++) {
    if (broken > 0.5 && i === 4) continue;
    out.push(<line key={`cb${i}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[i + 1][0]} y2={pts[i + 1][1]} stroke={C_BOND} strokeWidth="2.4" />);
  }
  pts.forEach(([x, yy], i) => {
    out.push(<circle key={`c${i}`} cx={x} cy={yy} r="3.6" fill={C_ATOM} />);
    if (i !== 5) out.push(<circle key={`h${i}`} cx={x} cy={yy + (i % 2 ? 11 : -11)} r="2.2" fill={H_ATOM} opacity="0.85" />);
  });
  return { out, target: { x: pts[5][0], y: pts[5][1] - 11 } };
}
const antiox: Render = (t, de, without) => {
  const u = (t % 7.5) / 7.5;
  const art: React.ReactNode[] = [];
  const chain = waxChain(176, without ? smooth(0.78, 0.85, u) : 0);
  const R0 = { x: 26, y: 26 };
  // Das Ziel-H an Kohlenstoff 6 der Kette
  const H = chain.target;
  art.push(...chain.out);
  let rx: number, ry: number, quenched = false, chainRad = false;
  if (!without) {
    const P = { x: 158, y: 96 };
    const OH = { x: P.x, y: P.y - 30 };
    const f = smooth(0.05, 0.5, u);
    rx = lerp(R0.x, OH.x - 18, f) + Math.sin(u * 20) * 2 * (1 - f); ry = lerp(R0.y, OH.y - 6, f);
    const hop = smooth(0.52, 0.66, u);
    quenched = u > 0.66;
    // gehindertes Phenol: Ring, OH oben, tert-Butyl links und rechts oben
    const hex = Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * TAU - Math.PI / 2; return `${(P.x + 20 * Math.cos(a)).toFixed(1)},${(P.y + 20 * Math.sin(a)).toFixed(1)}`; }).join(' ');
    art.push(<polygon key="ring" points={hex} fill="none" stroke="#C4CBD3" strokeWidth="2" />);
    art.push(<circle key="ringin" cx={P.x} cy={P.y} r="11" fill="none" stroke="#C4CBD3" strokeWidth="1.2" strokeDasharray="3 3" />);
    art.push(<line key="co" x1={P.x} y1={P.y - 20} x2={OH.x} y2={OH.y + 5} stroke="#C4CBD3" strokeWidth="2" />);
    art.push(<circle key="o" cx={OH.x} cy={OH.y} r="5.5" fill={O_ATOM} />);
    [[-1, 1], [1, 1]].forEach(([sx], i) => {
      const bx = P.x + sx * 17.3, by = P.y - 10;
      const cx = bx + sx * 16, cy = by - 8;
      art.push(<g key={`tb${i}`} stroke="#9AA4B1" strokeWidth="1.6">
        <line x1={bx} y1={by} x2={cx} y2={cy} />
        <line x1={cx} y1={cy} x2={cx + sx * 10} y2={cy - 6} /><line x1={cx} y1={cy} x2={cx + sx * 4} y2={cy - 12} /><line x1={cx} y1={cy} x2={cx + sx * 11} y2={cy + 4} />
      </g>);
    });
    const hx = lerp(OH.x + 6, rx + 10, hop), hy = lerp(OH.y - 6, ry + 2, hop);
    art.push(<circle key="h" cx={hx} cy={hy} r="3.2" fill={H_ATOM} />);
    if (quenched) art.push(<circle key="phenoxyl" cx={OH.x + 8} cy={OH.y - 8} r="2" fill={RADICAL} opacity="0.45" />);
  } else {
    const f = smooth(0.05, 0.45, u);
    rx = lerp(R0.x, H.x - 14, f); ry = lerp(R0.y, H.y - 14, f);
    const hop = smooth(0.45, 0.58, u);
    quenched = u > 0.58;
    chainRad = u > 0.58;
    // das H der Kette wandert zum Radikal
    art.push(<circle key="hc" cx={lerp(H.x, rx + 10, hop)} cy={lerp(H.y, ry + 2, hop)} r="2.4" fill={H_ATOM} />);
    // O2 lagert sich an das neue Kettenradikal an
    const o2 = smooth(0.62, 0.76, u);
    if (u > 0.6) {
      art.push(<g key="o2" opacity={o2}>
        <circle cx={lerp(200, H.x - 4, o2)} cy={lerp(40, H.y - 6, o2)} r="5" fill={O_ATOM} />
        <circle cx={lerp(210, H.x + 6, o2)} cy={lerp(36, H.y - 12, o2)} r="5" fill={O_ATOM} />
      </g>);
    }
  }
  // Radikal ROO•: R (grau) – O – O mit ungepaartem Elektron
  art.push(<g key="rad">
    <circle cx={rx - 10} cy={ry + 6} r="4" fill="#9AA4B1" />
    <circle cx={rx - 2} cy={ry + 1} r="5.2" fill={quenched ? '#B3534E' : O_ATOM} />
    <circle cx={rx + 7} cy={ry - 3} r="5.2" fill={quenched ? '#B3534E' : O_ATOM} />
    {!quenched && <><circle cx={rx + 15} cy={ry - 10} r="2.6" fill={RADICAL} /><circle cx={rx + 2} cy={ry} r={17 + Math.sin(t * 8) * 3} fill="none" stroke={RADICAL} opacity="0.35" /></>}
  </g>);
  if (chainRad) art.push(<circle key="cr" cx={H.x + 8} cy={H.y + 4} r={3 + Math.sin(t * 9)} fill={RADICAL} />);
  return {
    art: <><rect x="0" y="0" width="240" height="240" fill="rgba(61,103,202,0.08)" />{art}</>,
    cap: without
      ? (de ? 'Ohne Antioxidans zieht ROO• ein H aus der Wachskette. Die Kette wird selbst Radikal, Sauerstoff lagert sich an, die Reaktion läuft weiter: die Matrix altert.' : 'Without antioxidant ROO• pulls an H from the wax chain. The chain becomes a radical, oxygen adds on, the reaction continues: the matrix ages.')
      : (de ? 'Das gehinderte Phenol gibt sein H zuerst ab: aus ROO• wird ROOH, neutral. Die tert-Butyl-Gruppen schirmen das verbleibende Radikal ab, die Kette bleibt ganz.' : 'The hindered phenol donates its H first: ROO• becomes ROOH, neutral. The tert-butyl groups shield the remaining radical, the chain stays intact.'),
  };
};

export const NANO: Record<FieldKey, { still: number; render: Render }> = {
  kristallstruktur: { still: 7, render: paraffin },
  mos2: { still: 9, render: mos2 },
  matrix: { still: 6, render: ftWax },
  winterformel: { still: 3, render: micro },
  sedimentation: { still: 4, render: dispersant },
  antioxidans: { still: 5.2, render: antiox },
};
