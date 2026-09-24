// ─── Nano-Szenen — der Mechanismus jeder Komponente, im Molekuelmassstab ─────
//
// Luca, 25.09.2026: "viel echter, viel logischer, der Realitaet entsprechend".
// Die Filmfigur (WaxField) zeigt, WO ein Stoff sitzt. Diese Szenen zeigen,
// WAS er dort tut — jeweils genau den Vorgang, den science.ts in Worten
// beschreibt, und keinen anderen:
//
//  Paraffin     Ketten ordnen sich beim Erstarren zu Lamellen (4–5 nm)
//  MoS2         S-Mo-S-Schichten gleiten auf der Basalebene, am Stahl waechst
//               der Fe–S-Transferfilm (2–5 nm)
//  FT-Wachs     Waermetest: Paraffin allein rundet ab ~60 °C ab, mit FT-Wachs
//               haelt die Form bis ~75 °C (Tropfpunkt), danach wird auch es weich
//  Mikro        Biegen bei −8 °C: mit Mikrokristallin federt der Film, ohne reisst er
//  Dispergier   gleiche Zeit, links ohne Huelle (sinkt, klumpt), rechts mit Huelle
//  Antioxidans  ein Peroxylradikal ROO• trifft auf das Phenol, bekommt dessen
//               H-Atom und ist neutral, bevor es eine Wachskette angreift
//
// Farben wie in WaxField: Blau ist nur Wachs, MoS2 ist das kontraststaerkste
// Element (var(--tx1)), Stahl ist neutrales Grau. Das Radikal ist das einzige
// warme Element: es ist der Angreifer. Schrift steht NICHT im SVG (die Lupe
// ist klein, <text> fiele unter 11 px), sondern als HTML-Zeile darunter.

import type { FieldKey } from '../WaxField';

const TAU = Math.PI * 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
/** Deterministisches "Rauschen" je Index, damit nichts flimmert. */
const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const WAX = 'var(--accent)';
const WAX_SOFT = 'rgba(var(--accent-rgb),0.18)';
const STEEL = 'rgba(128,128,128,0.35)';
const STEEL_EDGE = 'rgba(128,128,128,0.9)';
const MO = 'var(--tx1)';
const S_ATOM = 'rgba(128,128,128,0.75)';
const RADICAL = '#D9822B';

export interface NanoScene { art: React.ReactNode; cap: string }

// ── Paraffin: vom Knaeuel zur Lamelle ──────────────────────────────────────
function paraffin(t: number, de: boolean): NanoScene {
  const period = 7;
  const u = t % period;
  const order = smooth(1.6, 4.2, u);
  const chains: string[] = [];
  const band = (y0: number, y1: number, seed: number) => {
    for (let i = 0; i < 9; i++) {
      const cx = 38 + i * 15.5;
      const pts: string[] = [];
      for (let k = 0; k <= 12; k++) {
        const n = hash(seed + i * 31 + k);
        const wob = Math.sin(t * 2.3 + i * 1.7 + k * 0.9) * 9 + (n - 0.5) * 18;
        const dis = (1 - order) * wob;
        const x = cx + (k % 2 ? 3.2 : -3.2) + dis + (1 - order) * (hash(seed + i) - 0.5) * 20;
        const y = y0 + ((y1 - y0) * k) / 12 + (1 - order) * (hash(seed + i * 7 + k) - 0.5) * 8;
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      chains.push(pts.join(' '));
    }
  };
  band(34, 96, 1);
  band(106, 168, 99);
  return {
    art: (
      <>
        {chains.map((pts, i) => (
          <polyline key={i} points={pts} fill="none" stroke={WAX} strokeWidth={2.2} strokeLinejoin="round" opacity={0.55 + 0.45 * order} />
        ))}
        {/* Lamellendicke, erst sichtbar wenn geordnet */}
        <g opacity={order}>
          <line x1="178" y1="34" x2="178" y2="96" stroke="var(--txm)" strokeWidth="1" />
          <line x1="174" y1="34" x2="182" y2="34" stroke="var(--txm)" strokeWidth="1" />
          <line x1="174" y1="96" x2="182" y2="96" stroke="var(--txm)" strokeWidth="1" />
          <rect x="24" y="97.5" width="152" height="7" fill={WAX_SOFT} />
        </g>
      </>
    ),
    cap: order < 0.5
      ? (de ? 'Schmelze: die C₂₀–C₃₆-Ketten liegen ungeordnet durcheinander.' : 'Melt: the C₂₀–C₃₆ chains lie in disorder.')
      : (de ? 'Erstarrt: die Ketten richten sich auf und stapeln sich zu Lamellen, je 4–5 nm dick. Das ist das Gerüst des Films.' : 'Solid: the chains straighten and stack into lamellae, 4–5 nm each. This is the scaffold of the film.'),
  };
}

// ── MoS2: Schichten gleiten, Transferfilm waechst ───────────────────────────
// Eine S-Mo-S-Lage als echtes Blatt: Mo in der Mitte, S oben und unten
// versetzt, dazwischen die kovalenten Bindungen (Zickzack). Zwischen zwei
// Lagen gibt es KEINE Bindung, nur van-der-Waals — genau dort gleitet es.
function trilayer(y: number, dx: number, key: string) {
  const step = 26, out: React.ReactNode[] = [], bonds: string[] = [];
  for (let i = -2; i < 10; i++) {
    const mx = 6 + i * step + dx, sx = mx + step / 2;
    bonds.push(`M${sx} ${y} L${mx} ${y + 12} L${sx} ${y + 24}`, `M${sx} ${y} L${mx + step} ${y + 12} L${sx} ${y + 24}`);
    out.push(<circle key={`${key}m${i}`} cx={mx} cy={y + 12} r={6.5} fill={MO} />);
    out.push(<circle key={`${key}s1${i}`} cx={sx} cy={y} r={4.6} fill={S_ATOM} />);
    out.push(<circle key={`${key}s2${i}`} cx={sx} cy={y + 24} r={4.6} fill={S_ATOM} />);
  }
  return [<path key={`${key}b`} d={bonds.join(' ')} stroke="var(--txff)" strokeWidth="1.4" fill="none" />, ...out];
}
function mos2(t: number, de: boolean): NanoScene {
  const slide = Math.sin(t * 1.3) * 13;
  const grow = clamp01((t % 10) / 7);
  const film = 3 + grow * 12;
  return {
    art: (
      <>
        {/* Last von oben */}
        <path d="M100 6 L100 22 M93 15 L100 23 L107 15" stroke="var(--tx2)" strokeWidth="2" fill="none" />
        <g>{trilayer(34, slide, 'a')}</g>
        {/* van-der-Waals-Spalt: hier gleitet es */}
        <line x1="0" y1="76" x2="200" y2="76" stroke={WAX} strokeDasharray="4 4" strokeWidth="1.4" />
        <g>{trilayer(90, -slide * 0.15, 'b')}</g>
        {/* Transferfilm und Stahl */}
        <rect x="0" y={164 - film} width="200" height={film} fill={MO} opacity={0.5} />
        <rect x="0" y="164" width="200" height="40" fill={STEEL} />
        <line x1="0" y1="164" x2="200" y2="164" stroke={STEEL_EDGE} strokeWidth="2" />
        <path d={`M${128 + slide} 26 l18 0 m-6 -5 l6 5 l-6 5`} stroke="var(--tx2)" strokeWidth="1.8" fill="none" />
      </>
    ),
    cap: de
      ? `S–Mo–S-Blätter gleiten zwischen den Lagen, ohne zu brechen. Am Stahl wächst der Fe–S-Transferfilm: ${(2 + grow * 3).toFixed(1).replace('.', ',')} nm.`
      : `S–Mo–S sheets glide between layers without breaking. On the steel the Fe–S transfer film grows: ${(2 + grow * 3).toFixed(1)} nm.`,
  };
}

// ── FT-Wachs: der Waermetest ─────────────────────────────────────────────────
function slumpPath(x0: number, x1: number, s: number) {
  const top = 70 + 46 * s, bulge = 10 * s, mid = (x0 + x1) / 2;
  return `M ${x0 - bulge} 168 L ${x0 - bulge * 0.4} ${top + 14 * s}
          Q ${x0} ${top} ${mid} ${top - 6 * (1 - s)} Q ${x1} ${top} ${x1 + bulge * 0.4} ${top + 14 * s}
          L ${x1 + bulge} 168 Z`;
}
function ftWax(t: number, de: boolean): NanoScene {
  const u = (t % 10) / 10;
  const temp = 40 + 45 * (u < 0.55 ? smooth(0, 0.55, u) : 1 - smooth(0.7, 1, u));
  const sPar = smooth(58, 64, temp);
  const sFt = smooth(74, 82, temp);
  const tempPct = (temp - 30) / 60;
  return {
    art: (
      <>
        <rect x="0" y="168" width="200" height="32" fill={STEEL} />
        <line x1="0" y1="168" x2="200" y2="168" stroke={STEEL_EDGE} strokeWidth="1.6" />
        <path d={slumpPath(22, 76, sPar)} fill={WAX_SOFT} stroke={WAX} strokeWidth="1.4" strokeDasharray="4 3" />
        <path d={slumpPath(96, 150, sFt)} fill={WAX_SOFT} stroke={WAX} strokeWidth="1.8" />
        {/* FT-Lamellen im rechten Block, kraeftiger wie in WaxField */}
        <g opacity={1 - sFt * 0.7}>
          {[106, 118, 130, 142].map(x => <line key={x} x1={x} y1="160" x2={x - 2} y2={82 + 40 * sFt} stroke={WAX} strokeWidth="2" />)}
        </g>
        {/* Thermometer */}
        <rect x="170" y="22" width="12" height="130" rx="6" fill="none" stroke="var(--txff)" />
        <rect x="173" y={25 + 124 * (1 - tempPct)} width="6" height={124 * tempPct} rx="3" fill={RADICAL} opacity="0.85" />
        <line x1="164" y1={25 + 124 * (1 - (60 - 30) / 60)} x2="188" y2={25 + 124 * (1 - (60 - 30) / 60)} stroke="var(--txm)" strokeDasharray="2 2" />
        <line x1="164" y1={25 + 124 * (1 - (75 - 30) / 60)} x2="188" y2={25 + 124 * (1 - (75 - 30) / 60)} stroke="var(--txm)" strokeDasharray="2 2" />
      </>
    ),
    cap: de
      ? `${Math.round(temp)} °C. Links nur Paraffin: ab ~60 °C rundet es ab. Rechts mit FT-Wachs: die Form hält bis zum Tropfpunkt von ~75 °C.`
      : `${Math.round(temp)} °C. Left paraffin only: rounds off from ~60 °C. Right with FT wax: holds its shape up to the ~75 °C drop point.`,
  };
}

// ── Mikrokristallin: Biegen in der Kaelte ────────────────────────────────────
function strip(yc: number, k: number, crack: number) {
  // Band entlang eines Bogens; k = Kruemmung (0..1). crack oeffnet einen Spalt in der Mitte.
  const pts = (off: number, from: number, to: number) => {
    const out: string[] = [];
    for (let i = from; i <= to; i++) {
      const x = 16 + (168 * i) / 20;
      const d = (x - 100) / 84;
      const y = yc + off + k * 22 * d * d;
      const gap = crack * (x < 100 ? -5 : 5);
      out.push(`${(x + gap).toFixed(1)},${y.toFixed(1)}`);
    }
    return out;
  };
  if (crack < 0.05) {
    const top = pts(-9, 0, 20), bot = pts(9, 0, 20).reverse();
    return [`M ${top.join(' L ')} L ${bot.join(' L ')} Z`];
  }
  const l = [pts(-9, 0, 10), pts(9, 0, 10).reverse()];
  const r = [pts(-9, 10, 20), pts(9, 10, 20).reverse()];
  return [`M ${l[0].join(' L ')} L ${l[1].join(' L ')} Z`, `M ${r[0].join(' L ')} L ${r[1].join(' L ')} Z`];
}
function micro(t: number, de: boolean): NanoScene {
  const u = (t % 6) / 6;
  const k = Math.sin(u * Math.PI);
  const crack = smooth(0.45, 0.7, k);
  return {
    art: (
      <>
        {strip(62, k, 0).map((d, i) => <path key={`a${i}`} d={d} fill={WAX_SOFT} stroke={WAX} strokeWidth="1.6" />)}
        {/* verzweigte Molekuele fuellen die Luecken und federn */}
        {[40, 70, 100, 130, 160].map((x, i) => {
          const d = (x - 100) / 84; const y = 62 + k * 22 * d * d;
          return <path key={i} d={`M ${x} ${y + 5} l0 -8 m0 3 l-5 -4 m5 4 l5 -4`} stroke={WAX} strokeWidth="1.3" fill="none" />;
        })}
        {/* unten: dasselbe Wachs ohne Mikrokristallin — spröde, reisst in der Mitte */}
        {strip(132, k, crack).map((d, i) => <path key={`b${i}`} d={d} fill={WAX_SOFT} stroke={WAX} strokeWidth="1.6" strokeDasharray="5 3" />)}
        {crack > 0.05 && <path d={`M100 ${121} l-3 7 l4 6 l-3 7`} stroke={RADICAL} strokeWidth="1.8" fill="none" opacity={crack} />}
      </>
    ),
    cap: de ? 'Die Kette biegt den Film bei jeder Umdrehung. Oben mit Mikrokristallin: er federt bis −8 °C. Unten ohne: er reißt.' : 'The chain flexes the film on every turn. Top with microcrystalline: it springs back down to −8 °C. Bottom without: it cracks.',
  };
}

// ── Dispergiersystem: Stokes gegen sterische Huelle ─────────────────────────
function dispersant(t: number, de: boolean): NanoScene {
  const u = t % 9;
  const parts: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const y0 = 40 + hash(i) * 90;
    // links: sinkt und liegt dann unten (gestapelt)
    const floor = 162 - Math.floor(i / 3) * 7;
    const yl = Math.min(floor, y0 + u * 26);
    const xl = 22 + (i % 3) * 24 + (yl >= floor ? 0 : Math.sin(t * 3 + i) * 2);
    parts.push(<rect key={`l${i}`} x={xl} y={yl - 2.5} width="20" height="5" rx="2" fill={MO} />);
    // rechts: Brownsche Bewegung um die Ausgangshoehe, mit Huelle
    const xr = 110 + (i % 3) * 26 + Math.sin(t * 1.9 + i * 2.1) * 4;
    const yr = y0 + Math.sin(t * 1.4 + i * 1.3) * 6;
    parts.push(
      <g key={`r${i}`}>
        <ellipse cx={xr + 10} cy={yr} rx="16" ry="8" fill="none" stroke={WAX} strokeDasharray="3 3" strokeWidth="1.4" />
        <rect x={xr} y={yr - 2.5} width="20" height="5" rx="2" fill={MO} />
      </g>,
    );
  }
  return {
    art: (
      <>
        <rect x="14" y="24" width="172" height="146" fill={WAX_SOFT} opacity="0.6" />
        <line x1="100" y1="24" x2="100" y2="170" stroke="var(--txff)" strokeDasharray="3 3" />
        {parts}
      </>
    ),
    cap: de ? 'MoS₂ ist 5,6× dichter als Wachs. Links ohne Hülle: die Plättchen sinken und klumpen. Rechts mit Hülle: sie bleiben verteilt.' : 'MoS₂ is 5.6× denser than wax. Left without a shell: platelets sink and clump. Right with one: they stay dispersed.',
  };
}

// ── Antioxidans: Radikalfaenger ─────────────────────────────────────────────
// Ein Peroxylradikal (warm, mit ungepaartem Elektron) ist auf dem Weg zu einer
// Wachskette — die gestrichelte Bahn zeigt, wohin es wollte. Das gehinderte
// Phenol liegt dazwischen, gibt sein H-Atom ab, das Radikal wird zu ROOH und
// ist neutral. Die Kette bleibt ganz.
function antiox(t: number, de: boolean): NanoScene {
  const u = (t % 6.5) / 6.5;
  const A = { x: 20, y: 30 }, C = { x: 104, y: 60 }, B = { x: 122, y: 92 };
  const path = (v: number) => {
    const w = 1 - v;
    return { x: w * w * A.x + 2 * w * v * C.x + v * v * B.x, y: w * w * A.y + 2 * w * v * C.y + v * v * B.y };
  };
  const fly = smooth(0.02, 0.5, u);
  const r = path(fly);
  const hop = smooth(0.52, 0.68, u);
  const P = { x: 150, y: 116 };                 // Phenol-Mitte
  const H0 = { x: P.x, y: P.y - 31 };           // H am O
  const hx = H0.x + (r.x + 8 - H0.x) * hop, hy = H0.y + (r.y - 8 - H0.y) * hop;
  const quenched = u > 0.68;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * TAU + Math.PI / 6;
    return `${(P.x + 17 * Math.cos(a)).toFixed(1)},${(P.y + 17 * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  const chain = (y: number, off: number) => Array.from({ length: 16 }, (_, i) => `${off + i * 13},${i % 2 ? y + 7 : y}`).join(' ');
  return {
    art: (
      <>
        {[150, 168, 186].map((y, i) => <polyline key={y} points={chain(y, -4 + i * 4)} fill="none" stroke={WAX} strokeWidth="2.4" strokeLinejoin="round" opacity={1 - i * 0.25} />)}
        {/* wohin das Radikal eigentlich wollte */}
        <path d={`M${A.x} ${A.y} Q 40 110 60 146`} fill="none" stroke={RADICAL} strokeDasharray="3 4" strokeWidth="1.4" opacity={quenched ? 0.15 : 0.5} />
        {/* Phenol (gehindert) mit OH */}
        <polygon points={hex} fill="none" stroke="var(--tx2)" strokeWidth="2" />
        <circle cx={P.x} cy={P.y} r="7" fill="none" stroke="var(--tx2)" strokeWidth="1.4" />
        <line x1={P.x} y1={P.y - 17} x2={P.x} y2={P.y - 25} stroke="var(--tx2)" strokeWidth="2" />
        <circle cx={P.x} cy={P.y - 28} r="4.6" fill="var(--pg)" stroke="var(--tx2)" strokeWidth="1.8" />
        {/* das H-Atom wandert vom Phenol zum Radikal */}
        <circle cx={hx} cy={hy} r="3.6" fill="var(--pg)" stroke="var(--tx1)" strokeWidth="1.6" />
        {/* Radikal: warm, mit ungepaartem Elektron; danach neutral */}
        {!quenched && <circle cx={r.x} cy={r.y} r={14 + Math.sin(t * 8) * 2.5} fill="none" stroke={RADICAL} opacity="0.35" strokeWidth="1.5" />}
        <circle cx={r.x} cy={r.y} r="9" fill={quenched ? 'rgba(128,128,128,0.55)' : RADICAL} style={{ transition: 'fill .3s' }} />
        {!quenched && <circle cx={r.x + 11} cy={r.y - 9} r="2.6" fill={RADICAL} />}
      </>
    ),
    cap: quenched
      ? (de ? 'Das Phenol gibt sein H-Atom ab: aus ROO• wird ROOH, neutral. Die Kettenreaktion ist gestoppt, das Wachs bleibt ganz.' : 'The phenol donates its H atom: ROO• becomes ROOH, neutral. The chain reaction stops, the wax stays intact.')
      : (de ? 'Ein Peroxylradikal ROO• ist auf dem Weg zu einer Wachskette. Trifft es, zerfällt sie und die Matrix wird spröde.' : 'A peroxyl radical ROO• is heading for a wax chain. If it hits, the chain breaks and the matrix turns brittle.'),
  };
}

export const NANO: Record<FieldKey, { still: number; render: (t: number, de: boolean) => NanoScene }> = {
  kristallstruktur: { still: 6, render: paraffin },
  mos2: { still: 8, render: mos2 },
  matrix: { still: 5, render: ftWax },
  winterformel: { still: 3, render: micro },
  sedimentation: { still: 8, render: dispersant },
  antioxidans: { still: 5, render: antiox },
};
