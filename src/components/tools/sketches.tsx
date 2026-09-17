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
// Verschleissskala und der Rewax-Zeitstrahl.
//
// v2 (15.09.2026): Technische Zeichnung statt Strichskizze. Zahnraeder mit
// Rollensitzen, Kettenglieder mit Innen-/Aussenlasche und Nietkopf, Lehre als
// Stahlblech mit Lupe auf die Kontaktstelle, Bemassung mit Pfeilen. Die Kette
// im Antrieb laeuft Glied fuer Glied, die Raeder drehen im Uebersetzungs-
// verhaeltnis mit (Bogenlaenge / Teilkreisradius).
//
// Weiterhin eigene SVG statt Fotos oder Videos: keine Rechte Dritter, keine
// Cookies, Themefarben inklusive.

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const ACCENT = 'var(--brand)';
const LABEL = 'var(--txm)';
const EDGE = 'var(--metal-edge)';
const EASE = 'cubic-bezier(0.22,1,0.36,1)';
/** Nur noch Deckkraft: Geometrie wird per useTween gerechnet, nicht per CSS. */
const MORPH: React.CSSProperties = { transition: `opacity 280ms ${EASE}` };
/** 12 px ist die Untergrenze der Seite (Mobile-Audit 09/2026), auch in SVG. */
const FONT = { fontSize: 12, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' } as const;
/** Freistellung: Kontur in Rahmenfarbe hinter der Schrift — Etiketten bleiben auf Linien lesbar. */
const HALO: React.CSSProperties = { paintOrder: 'stroke', stroke: 'var(--sketch-bg)', strokeWidth: 3, strokeLinejoin: 'round' };

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Die eine Easing-Kurve der Grafik-Grammatik, auch fuer rAF-Werte, die CSS
 * nicht interpolieren kann (Zahlen, `d`-Pfade). Deckungsgleich mit `EASE`. */
const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);

// ── Kettenlaenge ────────────────────────────────────────────────────────────

/** Teilkreisradius eines Zahnrads in mm: Umfang = Zaehne × 12,7 mm Teilung. */
const pitchRadiusMm = (teeth: number) => (teeth * 12.7) / (2 * Math.PI);

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

/**
 * Einmal true, sobald das Element zur Haelfte sichtbar ist — Startsignal fuer
 * die Erklaer-Animation einer Skizze. Bei reduzierter Bewegung sofort true,
 * dann steht die Skizze gleich im Endzustand.
 */
function useRevealOnce(ref: React.RefObject<Element | null>) {
  const [shown, setShown] = useState(() =>
    typeof window === 'undefined' || !('IntersectionObserver' in window) || prefersReduced());
  useEffect(() => {
    const el = ref.current;
    if (shown || !el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, shown]);
  return shown;
}

/**
 * Zahlen weich nachfuehren (ease-out, eine rAF-Schleife, danach Ruhe). CSS kann
 * `d`, `x1` oder eine Zaehnezahl nicht interpolieren — deshalb rechnet die
 * Skizze mit den nachgefuehrten Werten. Wird das Ziel mitten im Lauf
 * geaendert, geht es vom aktuellen Wert aus weiter, ohne Sprung.
 */
function useTweenList(target: number[], ms = 320): number[] {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  const key = target.join(',');
  useEffect(() => {
    const from = cur.current;
    const to = key.split(',').map(Number);
    const dur = prefersReduced() ? 0 : ms;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      const e = easeOutCubic(k);
      const next = to.map((b, i) => (from[i] ?? b) + (b - (from[i] ?? b)) * e);
      cur.current = next;
      setV(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key, ms]);
  return v;
}
const useTween = (target: number, ms?: number) => useTweenList([target], ms)[0];

/**
 * Eine Fusszeile, die bei zu wenig Platz an einer Wortgrenze nahe der Mitte
 * umbricht, statt am Rahmen abgeschnitten zu werden (wie WearScale/
 * RewaxTimeline es fuer ihre Etiketten schon tun — hier nur ein Text statt
 * mehrerer, deshalb Umbruch statt Wegfallen). `ch` ist die geschaetzte
 * Zeichenbreite bei 12 px (6.6, wie ueberall in dieser Datei).
 */
function wrapCaption(text: string, maxW: number, ch = 6.6): string[] {
  if (text.length * ch <= maxW) return [text];
  const mid = text.length / 2;
  let best = -1, bestDist = Infinity;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ' ') continue;
    const d = Math.abs(i - mid);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best < 0 ? [text] : [text.slice(0, best), text.slice(best + 1)];
}

/** Eindeutige ids je SVG — mehrere Karten stehen gleichzeitig im DOM. */
function useSvgId() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (name: string) => `wx${base}-${name}`;
}
type SvgId = ReturnType<typeof useSvgId>;
const url = (id: SvgId, name: string) => `url(#${id(name)})`;

/**
 * Material: gebuerstetes Metall von oben belichtet. Farben als Tokens
 * (index.css, --metal-*), damit Hell und Noir ohne Sonderweg mitziehen.
 * `steel`/`deep` braucht jede Grafik mit Metallteilen; `roller` (Glanzpunkt)
 * und `lift` (Schlagschatten fuers bewegte Werkzeug) nur die Lehre — als
 * eigene Defs, damit die anderen Grafiken keine ungenutzten Filter tragen.
 */
function MaterialDefs({ id }: { id: SvgId }) {
  return (
    <defs>
      <linearGradient id={id('steel')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--metal-hi)' }} />
        <stop offset="0.55" style={{ stopColor: 'var(--metal-mid)' }} />
        <stop offset="1" style={{ stopColor: 'var(--metal-lo)' }} />
      </linearGradient>
      <linearGradient id={id('deep')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--metal-mid)' }} />
        <stop offset="1" style={{ stopColor: 'var(--metal-deep)' }} />
      </linearGradient>
    </defs>
  );
}

function GaugeDefs({ id }: { id: SvgId }) {
  return (
    <defs>
      <radialGradient id={id('roller')} cx="0.36" cy="0.3" r="0.8">
        <stop offset="0" style={{ stopColor: 'var(--metal-hi)' }} />
        <stop offset="0.5" style={{ stopColor: 'var(--metal-mid)' }} />
        <stop offset="1" style={{ stopColor: 'var(--metal-deep)' }} />
      </radialGradient>
      <filter id={id('lift')} x="-10%" y="-30%" width="120%" height="180%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.3" style={{ floodColor: 'var(--shade)' }} />
      </filter>
    </defs>
  );
}

/**
 * Bemassung wie in der Werkstattzeichnung: Hilfslinien mit Abstand zum
 * Bauteil, Masslinie mit gefuellten Pfeilen, Masszahl darunter.
 */
function Dim({ x1, x2, y, from1, from2, label, labelX, anchor = 'middle', color = ACCENT }: {
  x1: number; x2: number; y: number; from1: number; from2: number;
  label: React.ReactNode; labelX?: number; anchor?: 'start' | 'middle' | 'end'; color?: string;
}) {
  const A = 5, B = 2.3;
  return (
    <g>
      <path d={`M${x1},${from1} V${y + 4} M${x2},${from2} V${y + 4}`} stroke={color} strokeWidth={0.8} strokeOpacity={0.55} />
      <path d={`M${x1 + A},${y} H${x2 - A}`} stroke={color} strokeWidth={1} />
      <path d={`M${x1},${y} l${A},${-B} v${2 * B} Z M${x2},${y} l${-A},${-B} v${2 * B} Z`} fill={color} />
      <text x={labelX ?? (x1 + x2) / 2} y={y + 16} textAnchor={anchor} style={{ ...FONT, ...HALO }} fontWeight={600} fill={color}>
        {label}
      </text>
    </g>
  );
}

/**
 * Zahnrad-Silhouette: je Zahn ein Rollensitz (Radius ≈ Rolle, ISO 606) und ein
 * gerundeter Zahnkopf. Teilung und Zahnteilung stehen im selben Massstab —
 * deshalb liegen die Kettenbolzen genau in den Sitzen. `phase` dreht das Rad.
 */
export function sprocketPath(cx: number, cy: number, n: number, R: number, P: number, phase: number) {
  const rs = 0.31 * P;
  const Ro = R + 0.32 * P;
  const step = (2 * Math.PI) / n;
  const dA = Math.min(rs / R, step * 0.3);
  const tA = step * 0.12;
  const pt = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  let d = '';
  for (let j = 0; j < n; j++) {
    const a = phase + j * step;
    d += `${j ? 'L' : 'M'}${pt(R + 0.05 * P, a - dA)} Q${pt(R - 1.9 * rs, a)} ${pt(R + 0.05 * P, a + dA)} `
      + `L${pt(Ro, a + step / 2 - tA)} Q${pt(Ro + 0.12 * P, a + step / 2)} ${pt(Ro, a + step / 2 + tA)} `;
  }
  return `${d}Z`;
}

export type DrivetrainPart = 'stay' | 'ring' | 'sprocket' | null;

/**
 * Seitenansicht Kette um groesstes Kettenblatt und groesstes Ritzel —
 * genau die Lage, die die Formel beschreibt: zwei gerade Trume (je einmal die
 * Kettenstrebe), ungefaehr eine halbe Umschlingung vorne und hinten, plus
 * Reserve fuers Schaltwerk.
 *
 * Masstaeblich: Radien aus der Zaehnezahl, Achsabstand aus der Strebenlaenge,
 * eine gerade Anzahl Glieder rund um beide Raeder. Beim ersten Sichtbarwerden
 * laeuft die Kette eine Ritzel-Umdrehung; Ritzel und Kettenblatt drehen um
 * Weg / Radius, also im Uebersetzungsverhaeltnis.
 */
export function DrivetrainSketch({ chainstayMm, chainring, sprocket, focus, remove = 0, de = true }: {
  chainstayMm: number; chainring: number; sprocket: number; focus: DrivetrainPart;
  /** Glieder, die von der Kaufkette abkommen — am unteren Trum markiert. */
  remove?: number; de?: boolean;
}) {
  const { t } = useLanguage();
  const sh = t.tools.shared;
  const [ref, W] = useWidth<HTMLDivElement>(320);
  const id = useSvgId();
  const shown = useRevealOnce(ref);
  const [stay, ring, sprk] = useTweenList([
    Math.min(Math.max(chainstayMm, 350), 550),
    Math.min(Math.max(chainring, 20), 60),
    Math.min(Math.max(sprocket, 9), 60),
  ]);

  const H = 156;
  const RX = 56 * (W / 320); // Hinterachse
  // px je mm: so gross, dass der ungünstigste Fall (550 mm Strebe, 60er
  // Kettenblatt) gerade noch in den Rahmen passt — bei 320 px rund 0,38.
  const K = (W - 8 - RX) / (550 + pitchRadiusMm(60) + 4.1);
  const P = 12.7 * K; // Teilung in px
  const TIP = 0.32 * P; // Zahnkopf ueber dem Teilkreis
  const r1 = pitchRadiusMm(sprk) * K;
  const r2 = pitchRadiusMm(ring) * K;
  const rMax = Math.max(r1, r2);
  // Oben die Zaehnezahl, unten die Bemassung: beide muessen in 156 px passen.
  const CY = Math.min(78, H - 30 - rMax - TIP - 9);
  const FX = RX + stay * K;

  // Aeussere Tangenten: Normale (nx, ±ny). beta ist der Winkel des unteren
  // Beruehrpunkts; vorne umschlingt die Kette 2·beta, hinten 2π − 2·beta.
  const nx = -(r2 - r1) / (FX - RX);
  const ny = Math.sqrt(Math.max(0, 1 - nx * nx));
  const beta = Math.atan2(ny, nx);
  const u1 = { x: RX + r1 * nx, y: CY - r1 * ny }, u2 = { x: FX + r2 * nx, y: CY - r2 * ny };
  const l1 = { x: RX + r1 * nx, y: CY + r1 * ny }, l2 = { x: FX + r2 * nx, y: CY + r2 * ny };
  const run = Math.hypot(u2.x - u1.x, u2.y - u1.y);
  const arcF = r2 * 2 * beta, arcR = r1 * (2 * Math.PI - 2 * beta);
  const L = 2 * run + arcF + arcR;
  /** Punkt auf der Kettenbahn nach Bogenlaenge: Obertrum → vorn → Untertrum → hinten. */
  const at = (s0: number) => {
    let s = ((s0 % L) + L) % L;
    if (s < run) { const k = s / run; return { x: u1.x + (u2.x - u1.x) * k, y: u1.y + (u2.y - u1.y) * k }; }
    s -= run;
    if (s < arcF) { const a = -beta + s / r2; return { x: FX + r2 * Math.cos(a), y: CY + r2 * Math.sin(a) }; }
    s -= arcF;
    if (s < run) { const k = s / run; return { x: l2.x + (l1.x - l2.x) * k, y: l2.y + (l1.y - l2.y) * k }; }
    s -= run;
    const a = beta + s / r1;
    return { x: RX + r1 * Math.cos(a), y: CY + r1 * Math.sin(a) };
  };

  // Einlauf: eine Ritzel-Umdrehung, sanft an- und auslaufend.
  const [o, setO] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!shown || ran.current || prefersReduced()) return;
    ran.current = true;
    const dist = 2 * Math.PI * pitchRadiusMm(Math.min(Math.max(sprocket, 9), 60)) * 0.34 * (W / 320);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1200);
      setO(easeOutCubic(k) * dist);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, sprocket, W]);

  // Glieder: gerade Anzahl, gleichmaessig auf die Bahn verteilt (Abweichung
  // von der Solllteilung < 1,5 %). Auf den Raedern liegen die Laschen als
  // Sehnen — das Polygon, das eine echte Kette um ein Zahnrad bildet.
  const N = Math.max(4, 2 * Math.round(L / (2 * P)));
  const pp = L / N;
  const cutFrom = run + arcF; // vorderes Ende des Untertrums
  const cutLen = Math.min(Math.max(remove, 0) * P, run * 0.45);
  const f = (n: number) => n.toFixed(2);
  const pr = 0.17 * P;
  let inner = '', outer = '', ghost = '', pins = '';
  const pts = Array.from({ length: N }, (_, k) => at(o + k * pp));
  pts.forEach((a, k) => {
    const b = pts[(k + 1) % N];
    const seg = `M${f(a.x)},${f(a.y)} L${f(b.x)},${f(b.y)} `;
    const mid = (((o + (k + 0.5) * pp) % L) + L) % L;
    if (cutLen > 0 && mid >= cutFrom && mid <= cutFrom + cutLen) ghost += seg;
    else if (k % 2) outer += seg;
    else inner += seg;
    pins += `M${f(a.x - pr)},${f(a.y)} a${f(pr)},${f(pr)} 0 1 0 ${f(2 * pr)},0 a${f(pr)},${f(pr)} 0 1 0 ${f(-2 * pr)},0 `;
  });

  // Zahnphase: dieselbe Bogenlaenge, die die Bolzen zurueckgelegt haben.
  const phaseS = beta + (o - 2 * run - arcF) / r1;
  const phaseF = -beta + (o - run) / r2;
  const inR = Math.max(r2 * 0.4, r2 - 0.9 * P - 2); // Fenster im Kettenblatt
  const armW = Math.max(3, r2 * 0.16);
  const arms = [0, 1, 2, 3].map(j => {
    const a = phaseF + (j * Math.PI) / 2;
    return `M${f(FX)},${f(CY)} L${f(FX + (inR + 1) * Math.cos(a))},${f(CY + (inR + 1) * Math.sin(a))}`;
  }).join(' ');
  const bolts = [0, 1, 2, 3].map(j => {
    const a = phaseF + (j * Math.PI) / 2;
    return { x: FX + (inR + 1.6) * Math.cos(a), y: CY + (inR + 1.6) * Math.sin(a) };
  });

  const on = (part: DrivetrainPart) => focus === null || focus === part;
  const dim = (part: DrivetrainPart): React.CSSProperties => ({ opacity: on(part) ? 1 : 0.3, ...MORPH });
  const dimY = CY + rMax + TIP + 9;
  const cutPt = at(cutFrom + cutLen);
  const window = `M${f(FX + inR)},${f(CY)} A${f(inR)},${f(inR)} 0 1 0 ${f(FX - inR)},${f(CY)} A${f(inR)},${f(inR)} 0 1 0 ${f(FX + inR)},${f(CY)} Z`;

  return (
    <div ref={ref} className="w-full">
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img"
      aria-label={de
        ? `Kette um Kettenblatt mit ${chainring} Zähnen und Ritzel mit ${sprocket} Zähnen, Kettenstrebe ${chainstayMm} mm`
        : `Chain around a ${chainring}-tooth chainring and ${sprocket}-tooth sprocket, chainstay ${chainstayMm} mm`}>
      <MaterialDefs id={id} />

      {/* Kettenstrebe: konisches Rohr hinter allem, am Tretlager kraeftiger */}
      <path d={`M${f(RX)},${f(CY - 2.5)} L${f(FX)},${f(CY - 4.5)} L${f(FX)},${f(CY + 4.5)} L${f(RX)},${f(CY + 2.5)} Z`}
        fill="var(--metal-lo)" stroke={EDGE} strokeWidth={0.6} strokeOpacity={0.5} style={dim('stay')} />

      {/* Ritzel: groesstes Ritzel, davor die kleineren der Kassette */}
      <g style={dim('sprocket')}>
        <path d={sprocketPath(RX, CY, Math.round(sprk), r1, P, phaseS)} fill={url(id, 'steel')} stroke={EDGE} strokeWidth={0.8} strokeLinejoin="round" />
        {[0.8, 0.62, 0.46].map(k => (
          <circle key={k} cx={RX} cy={CY} r={r1 * k} fill="none" stroke={EDGE} strokeOpacity={0.3} strokeWidth={0.8} />
        ))}
        <circle cx={RX} cy={CY} r={Math.max(3.5, r1 * 0.3)} fill={url(id, 'steel')} stroke={EDGE} strokeWidth={0.8} />
        <circle cx={RX} cy={CY} r={1.6} fill={EDGE} />
      </g>

      {/* Kettenblatt mit Fenster und Spider — dreht mit */}
      <g style={dim('ring')}>
        <path d={`${sprocketPath(FX, CY, Math.round(ring), r2, P, phaseF)} ${window}`} fillRule="evenodd"
          fill={url(id, 'steel')} stroke={EDGE} strokeWidth={0.8} strokeLinejoin="round" />
        <path d={arms} stroke={EDGE} strokeOpacity={0.55} strokeWidth={armW + 1.2} strokeLinecap="round" />
        <path d={arms} stroke="var(--metal-mid)" strokeWidth={armW} strokeLinecap="round" />
        {bolts.map((b, j) => <circle key={j} cx={b.x} cy={b.y} r={1.2} fill="var(--metal-deep)" stroke={EDGE} strokeWidth={0.5} />)}
        <circle cx={FX} cy={CY} r={Math.max(4, r2 * 0.2)} fill={url(id, 'steel')} stroke={EDGE} strokeWidth={0.8} />
        <circle cx={FX} cy={CY} r={1.8} fill={EDGE} />
      </g>

      {/* Kette. Im Fokus „Strebe" leuchten die beiden Trume — sie sind die
          2 × Kettenstrebe der Formel. */}
      {focus === 'stay' && (
        <path d={`M${f(u1.x)},${f(u1.y)} L${f(u2.x)},${f(u2.y)} M${f(l2.x)},${f(l2.y)} L${f(l1.x)},${f(l1.y)}`}
          stroke={ACCENT} strokeOpacity={0.22} strokeWidth={P * 1.9} strokeLinecap="round" />
      )}
      <path d={inner} stroke="var(--chain-inner)" strokeWidth={P * 0.62} fill="none" />
      <path d={outer} stroke="var(--chain-outer)" strokeWidth={P * 0.8} strokeLinecap="round" fill="none" />
      {ghost && <path d={ghost} stroke="var(--txff)" strokeOpacity={0.35} strokeWidth={P * 0.7} strokeLinecap="round" fill="none" />}
      <path d={pins} fill="var(--chain-pin)" />

      {cutLen > 0 && (
        <g style={dim('stay')}>
          <path d={`M${f(cutPt.x)},${f(cutPt.y - 6)} v12`} stroke="var(--tx1)" strokeWidth={1.4} />
          <text x={cutPt.x - 5} y={cutPt.y - 8} textAnchor="end" style={{ ...FONT, ...HALO }} fontWeight={600} fill="var(--tx2)">
            {sh.sketchRemove.replace('{n}', String(remove))}
          </text>
        </g>
      )}

      {/* Bemassung Achse zu Achse */}
      <g style={dim('stay')}>
        <Dim x1={RX} x2={FX} y={dimY} from1={CY + r1 + TIP + 3} from2={CY + r2 + TIP + 3}
          label={<>{de ? 'Kettenstrebe' : 'Chainstay'} · {chainstayMm} mm</>} />
      </g>
      <text x={RX} y={Math.max(13, CY - r1 - TIP - 8)} textAnchor="middle" style={{ ...FONT, ...HALO, ...dim('sprocket') }}>
        <tspan fill={LABEL}>{de ? 'Ritzel' : 'Sprocket'} </tspan>
        <tspan fill="var(--tx1)" fontWeight={600}>{sprocket} {sh.sketchTeeth}</tspan>
      </text>
      <text x={FX} y={Math.max(13, CY - r2 - TIP - 8)} textAnchor="middle" style={{ ...FONT, ...HALO, ...dim('ring') }}>
        <tspan fill={LABEL}>{de ? 'Kettenblatt' : 'Chainring'} </tspan>
        <tspan fill="var(--tx1)" fontWeight={600}>{chainring} {sh.sketchTeeth}</tspan>
      </text>
    </svg>
    </div>
  );
}

/**
 * Wie man die alte Kette zaehlt: jede Teilung (Bolzen zu Bolzen) ist ein
 * Glied. Innen- und Aussenglieder wechseln sich ab, das Kettenschloss ersetzt
 * ein Aussenglied und zaehlt mit — deshalb ist die Summe immer gerade.
 * Nummeriert sind die Teilungen, nicht die Bolzen: ein offenes Stueck hat einen
 * Bolzen mehr als Glieder, geschlossen ist es gleich viele.
 */
export function ChainCountSketch({ de = true }: { de?: boolean }) {
  const { t } = useLanguage();
  const sh = t.tools.shared;
  const [ref, W] = useWidth<HTMLDivElement>(310);
  const id = useSvgId();
  const N = 8, CY = 44, H = 114;
  // Bisher bei W ≳ 308px gedeckelt (Cap 34 traf schneller als der verfuegbare
  // Platz) — auf breiten Rechner-Karten blieb die Kette winzig im grossen
  // Rahmen stehen. Cap jetzt bei 46, greift erst deutlich oberhalb typischer
  // Kartenbreiten (.cq-chart bleibt unter ~420px).
  const P = Math.min(46, (W - 36) / N);
  const x0 = (W - P * N) / 2;
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + i * P);
  const LOCK = 5; // Aussenglied zwischen xs[5] und xs[6]
  const half = P * 0.41;
  const lx = (xs[LOCK] + xs[LOCK + 1]) / 2;
  const dimY = CY + half + 9;

  return (
    <div ref={ref} className="w-full">
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img"
      aria-label={de ? 'Glieder der alten Kette zählen: jede Teilung ist ein Glied, das Kettenschloss zählt mit' : 'Count the links of the old chain: every pitch is one link, the quick link counts too'}>
      <MaterialDefs id={id} />
      <ChainStrip xs={xs} y={CY} p={P} id={id} tint={i => (i === LOCK ? ACCENT : undefined)} quick={LOCK} />
      {xs.slice(0, -1).map((x, i) => (
        <text key={i} x={x + P / 2} y={CY - half - 8} textAnchor="middle" style={FONT} fontWeight={600}
          fill={i === LOCK ? ACCENT : LABEL}>
          {i + 1}
        </text>
      ))}
      <Dim x1={xs[0]} x2={xs[1]} y={dimY} from1={CY + P * 0.2} from2={CY + P * 0.2}
        label={sh.sketchPitch} labelX={xs[0] - 2} anchor="start" color="var(--tx2)" />
      <path d={`M${lx},${CY + half + 3} v8`} stroke={ACCENT} strokeWidth={1.2} />
      <text x={lx} y={dimY + 16} textAnchor="middle" style={{ ...FONT, ...HALO }} fontWeight={600} fill={ACCENT}>
        {sh.sketchQuickLink}
      </text>
      {(() => {
        const lines = wrapCaption(sh.sketchCountNote, W - 8);
        const y0 = lines.length > 1 ? H - 21 : H - 6;
        return (
          <text x={W / 2} y={y0} textAnchor="middle" style={FONT} fill={LABEL}>
            {lines.map((l, i) => <tspan key={i} x={W / 2} dy={i === 0 ? 0 : 15}>{l}</tspan>)}
          </text>
        );
      })()}
    </svg>
    </div>
  );
}

// ── Passende Kette: welches System, wieviel Ritzel ──────────────────────────

/**
 * Kleine Kassetten-Schemazeichnung von der Achse aus gesehen (konzentrische
 * Ritzel, groesstes aussen) — kein eigener Rechenwert, nur der Stahl-Look der
 * anderen vier Karten fuer diese hier: bisher zeigte „Passende Kette" nur die
 * Produktliste ohne eigene Grafik. Das aeussere Ritzel bekommt ein
 * dekoratives Zahnprofil (`sprocketPath`, feste Zaehnezahl — die echte
 * Kassetten-Abstufung ist nicht Teil der Rechnung), die inneren sind duenne
 * Fuehrungskreise wie die Kassettenringe im Antrieb.
 */
export function CassetteSchematic({ speed, systemLabel, de = true }: {
  speed: number; systemLabel: string; de?: boolean;
}) {
  const { t } = useLanguage();
  const [ref, W] = useWidth<HTMLDivElement>(280);
  const id = useSvgId();
  const H = 34;
  const CX = H / 2, CY = H / 2;
  const R = H / 2 - 4;
  const n = Math.max(8, Math.min(12, speed));

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img"
        aria-label={de ? `${systemLabel}, ${speed}-fach` : `${systemLabel}, ${speed}-speed`}>
        <MaterialDefs id={id} />
        <path d={sprocketPath(CX, CY, 26, R, R * 0.6, 0)} fill={url(id, 'steel')} stroke={EDGE} strokeWidth={0.8} strokeLinejoin="round" />
        {Array.from({ length: n - 1 }, (_, i) => (
          <circle key={i} cx={CX} cy={CY} r={Math.max(2.5, R * (1 - (0.62 * (i + 1)) / (n - 1)))}
            fill="none" stroke={EDGE} strokeOpacity={0.35} strokeWidth={0.8} />
        ))}
        <circle cx={CX} cy={CY} r={1.6} fill={EDGE} />
        <text x={H + 10} y={CY - 3} style={FONT} fill={LABEL}>{systemLabel}</text>
        <text x={H + 10} y={CY + 13} style={FONT} fontWeight={700} fill="var(--tx1)">
          {speed}{t.tools.shared.speedSuffix}
        </text>
      </svg>
    </div>
  );
}

// ── Grafik-Grammatik ────────────────────────────────────────────────────────
//
// Alle fuenf Grafiken folgen denselben Regeln, damit sie wie ein Werkzeug
// aussehen (docs/DESIGN.md, „Rechner-Karten"):
//  - 1:1-Skala. Die Breite kommt per ResizeObserver aus dem Rahmen, die
//    viewBox ist genau so breit. Eine SVG-Einheit ist ein Pixel.
//  - Schrift mindestens 12 px, Zahlen tabellarisch; Etiketten mit HALO
//    freigestellt, Werte fett in --tx1 oder der Tonfarbe.
//  - Bauteile aus Metall (--metal-*: Verlauf von oben, Kante --metal-edge),
//    Daten flach. Hilfslinien 1 px (--bd2), Daten 2–4 px.
//  - Masse als Bemassung (Dim) mit Pfeilen, nie als lose Linie.
//  - Direkt beschriftet, Legende nur bei zwei Reihen (Oel/Wachs).
//  - Farbe traegt die Identitaet der Marke, Text bleibt in Textfarben:
//    Wachs = --brand, Oel = --txf, handeln = --tool-warn.
//  - Bewegung: eine Kurve (EASE), 280 ms fuer Eingaben, 700–900 ms Einlauf,
//    1200 ms fuer die laufende Kette. Reduzierte Bewegung = Endzustand.

// ── Verschleiss: wo liegt die Kette auf der Skala ───────────────────────────

/**
 * Messlineal 0 bis 1,25 %. Zonen folgen waxMath.wearVerdict: bis 80 % der
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
  const id = useSvgId();
  const MAX = 1.25, PAD = 10, H = 100, TY = 36, TH = 10;
  const x = (v: number) => PAD + (Math.min(v, MAX) / MAX) * (W - PAD * 2);
  const check = Math.min(limit + 0.25, 1.0);
  // Ein Band mit Verlauf statt fuenf Kacheln: Graustufen bis zur Grenze, dort
  // ein harter Wechsel auf Ocker, das zur Kassette hin satter wird.
  const stops = [
    { at: 0, c: 'var(--bd2)', a: 1 },
    { at: limit * 0.8, c: 'var(--txff)', a: 0.22 },
    { at: limit, c: 'var(--txff)', a: 0.4 },
    { at: limit, c: 'var(--tool-warn)', a: 0.32 },
    { at: check, c: 'var(--tool-warn)', a: 0.55 },
    { at: MAX, c: 'var(--tool-warn)', a: 0.85 },
  ];
  let fine = '', coarse = '';
  for (let i = 0; i <= MAX / 0.05 + 0.01; i++) {
    const tx = x(i * 0.05).toFixed(1);
    if (i % 5 === 0) coarse += `M${tx},${TY + TH + 2} v6 `;
    else fine += `M${tx},${TY + TH + 2} v3 `;
  }
  const ticks = [0, 0.5, 0.75, 1.0].filter(v => v !== limit && Math.abs(x(v) - x(limit)) >= 64);
  const mx = percent === null ? null : x(percent);
  const T = `all 300ms ${EASE}`;
  const sign = bound === 'atLeast' ? '≥ ' : bound === 'below' ? '< ' : '';
  const CH = 6.6; // geschaetzte Zeichenbreite bei 12 px

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block"
        aria-label={percent === null ? (empty ?? '') : `${labels.you}: ${sign}${fmt(percent)} %, ${labels.limit} ${fmt(limit)} %`}>
        <defs>
          <linearGradient id={id('band')} gradientUnits="userSpaceOnUse" x1={x(0)} x2={x(MAX)} y1={0} y2={0}>
            {stops.map((s, i) => (
              <stop key={i} offset={(s.at / MAX).toFixed(4)} style={{ stopColor: s.c, stopOpacity: s.a }} />
            ))}
          </linearGradient>
        </defs>
        <rect x={x(0)} y={TY} width={x(MAX) - x(0)} height={TH} rx={TH / 2} fill={url(id, 'band')} />
        <path d={fine} stroke="var(--bd2)" strokeWidth={1} />
        <path d={coarse} stroke="var(--txff)" strokeOpacity={0.6} strokeWidth={1} />
        {/* Grenze der Gangzahl: Doppellinie */}
        <g style={{ transform: `translateX(${x(limit)}px)`, transition: T }}>
          <path d={`M-1.2,${TY - 5} V${TY + TH + 5} M1.2,${TY - 5} V${TY + TH + 5}`} stroke="var(--tx1)" strokeWidth={1} />
        </g>

        {/* Zeile 1 unter der Skala: Werte, die Grenze hervorgehoben */}
        <g style={FONT}>
          {ticks.map(v => (
            <text key={v} x={x(v)} y={TY + TH + 21} textAnchor={v === 0 ? 'start' : 'middle'} fill="var(--txff)">{fmt(v)} %</text>
          ))}
          <text x={x(limit)} y={TY + TH + 21} textAnchor="middle" fontWeight={700} fill="var(--tx1)" style={{ transition: T }}>
            {labels.limit} {fmt(limit)} %
          </text>
        </g>
        {/* Zeile 2: was die Bereiche bedeuten. „tauschen" steht mittig in
            seinem Bereich und faellt weg, wenn es an eines der Randetiketten
            stoesst (schmale Karte) — das Urteil unten sagt es ohnehin. */}
        <g style={FONT} fill="var(--txf)">
          <text x={PAD} y={TY + TH + 39}>{labels.ok}</text>
          {(() => {
            const cx = (x(limit) + x(1.0)) / 2;
            const half = (labels.replace.length * CH) / 2;
            const leftEdge = PAD + labels.ok.length * CH + 8;
            const rightEdge = W - PAD - labels.cassette.length * CH - 8;
            return cx - half > leftEdge && cx + half < rightEdge
              ? <text x={cx} y={TY + TH + 39} textAnchor="middle">{labels.replace}</text>
              : null;
          })()}
          <text x={W - PAD} y={TY + TH + 39} textAnchor="end">{labels.cassette}</text>
        </g>

        {mx !== null && bound === 'below' ? (
          <g style={{ transition: T }}>
            <path d={`M${x(0)},${TY - 5} H${mx}`} stroke="var(--tx1)" strokeWidth={2} />
            <path d={`M${x(0)},${TY - 9} v8 M${mx},${TY - 9} v8`} stroke="var(--tx1)" strokeWidth={2} />
            <text x={x(0)} y={13} style={FONT} fontWeight={700} fill="var(--tx1)">
              {labels.you} {sign}{fmt(percent!)} %
            </text>
          </g>
        ) : mx !== null ? (
          <g style={{ transition: `transform 320ms ${EASE}`, transform: `translateX(${mx}px)` }}>
            {bound === 'atLeast' && (
              <path d={`M0,${TY + TH / 2} H${Math.max(0, x(MAX) - mx)}`} stroke="var(--tx1)" strokeWidth={2} strokeDasharray="3 3" />
            )}
            {/* Nadel mit Spitze auf der Bandoberkante */}
            <line x1={0} x2={0} y1={19} y2={TY - 8} stroke="var(--tx1)" strokeWidth={1.25} />
            <path d={`M-5,${TY - 9} H5 L0,${TY - 1} Z`} fill="var(--tx1)" />
            <text x={0} y={13} textAnchor={mx < 60 ? 'start' : mx > W - 60 ? 'end' : 'middle'} style={FONT} fontWeight={700} fill="var(--tx1)">
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

// ── Ketten-Baustein und Kettenlehre ─────────────────────────────────────────

/** Lasche in Seitenansicht: zwei runde Augen, dazwischen eine Taille. */
function platePath(x1: number, x2: number, y: number, a: number, waist: number) {
  const phi = 0.9;
  const c = a * Math.cos(phi), s = a * Math.sin(phi), m = (x1 + x2) / 2;
  // Quadratische Kurve: ihr Scheitel liegt bei (s + b) / 2 = waist.
  const b = 2 * waist - s;
  const f = (n: number) => n.toFixed(2);
  return `M${f(x1 + c)},${f(y - s)} Q${f(m)},${f(y - b)} ${f(x2 - c)},${f(y - s)} `
    + `A${f(a)},${f(a)} 0 1 1 ${f(x2 - c)},${f(y + s)} Q${f(m)},${f(y + b)} ${f(x1 + c)},${f(y + s)} `
    + `A${f(a)},${f(a)} 0 1 1 ${f(x1 + c)},${f(y - s)} Z`;
}

/**
 * Kettenstueck in Seitenansicht — ein Baustein fuer Lehre und Zaehlen.
 * Proportionen nach ISO 606 (08B) als Anteil der Teilung p: Innenlasche
 * dunkler und zurueckliegend, Aussenlasche mit ausgepraegter Taille davor,
 * Nietkoepfe mit Lichtkante obenauf. `xs` sind die Bolzen; wer sie
 * auseinanderzieht, zeigt Laengung. `quick` markiert ein Aussenglied als
 * Kettenschloss (Langloecher an beiden Bolzen).
 */
export function ChainStrip({ xs, y, p, id, tint, quick }: {
  xs: number[]; y: number; p: number; id: SvgId;
  /** Strichfarbe je Glied (Index = Glied zwischen xs[i] und xs[i + 1]). */
  tint?: (i: number) => string | undefined;
  quick?: number;
}) {
  const links = xs.slice(0, -1).map((x1, i) => ({ i, x1, x2: xs[i + 1], outer: i % 2 === 1 }));
  const plate = (l: (typeof links)[number], a: number, waist: number, fill: string) => {
    const c = tint?.(l.i);
    return (
      <path key={l.i} d={platePath(l.x1, l.x2, y, a, waist)} fill={fill}
        stroke={c ?? EDGE} strokeWidth={c ? 1.5 : 0.9} strokeLinejoin="round" />
    );
  };
  const pr = p * 0.15;
  const slot = (cx: number, dir: 1 | -1, c: string) => (
    <rect x={dir === 1 ? cx - p * 0.12 : cx - p * 0.24} y={y - p * 0.12} width={p * 0.36} height={p * 0.24} rx={p * 0.12}
      fill={url(id, 'deep')} stroke={c} strokeWidth={0.8} />
  );
  return (
    <g>
      {links.filter(l => !l.outer).map(l => plate(l, p * 0.4, p * 0.32, url(id, 'deep')))}
      {links.filter(l => l.outer).map(l => plate(l, p * 0.41, p * 0.27, url(id, 'steel')))}
      {quick !== undefined && xs[quick + 1] !== undefined && (
        <g>
          {slot(xs[quick], 1, tint?.(quick) ?? EDGE)}
          {slot(xs[quick + 1], -1, tint?.(quick) ?? EDGE)}
        </g>
      )}
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={pr} fill={url(id, 'steel')} stroke={EDGE} strokeWidth={0.8} />
          <circle cx={x - pr * 0.3} cy={y - pr * 0.3} r={pr * 0.38} fill="var(--metal-hi)" />
        </g>
      ))}
    </g>
  );
}

/**
 * Wie eine Kettenlehre antwortet (Go/No-go, wie Park CC-3.2). Der Haken links
 * greift hinter die erste Rolle, der Messzahn rechts steht ueber der
 * Nennposition der letzten. Bei einer neuen Kette setzt der Zahn auf der Rolle
 * auf und die Lehre kippt leicht hoch; bei einer gelaengten sind die Bolzen
 * auseinandergerueckt (ueberzeichnet, damit man es sieht) und der Zahn faellt
 * zwischen die Rollen ein.
 *
 * In der Seitenansicht verdecken die Laschen genau diese Stelle — deshalb die
 * Lupe: ein Schnitt ohne Laschen, nur Rollen und Zahn, 2,2-fach.
 * Farbe nur am Zahn: Blau = gut, Ocker = handeln, sonst Textfarbe.
 */
export function GaugeSketch({ dropped, markLabel, tone, de = true }: {
  dropped: boolean; markLabel: string; tone: 'ok' | 'soon' | 'warn'; de?: boolean;
}) {
  const { t } = useLanguage();
  const [ref, W] = useWidth<HTMLDivElement>();
  const id = useSvgId();
  const shown = useRevealOnce(ref);
  // Einlauf in drei Posen: schwebt → Haken greift (Zahn noch oben) → Zahn
  // setzt auf bzw. faellt ein. Bei reduzierter Bewegung sofort Pose 2.
  const [stage, setStage] = useState(() => (shown ? 2 : 0));
  useEffect(() => {
    if (!shown) return;
    const a = setTimeout(() => setStage(s => Math.max(s, 1)), 20);
    const b = setTimeout(() => setStage(2), 560);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [shown]);

  const LUPE = W >= 280;
  const LR = 27, LZ = 2.2;
  const N = 6;
  const LEFT_PAD = 8, GAP = 14;
  // Verfuegbare Breite fuer die Baugruppe (Kette + Lehre): rechts steht die
  // Lupe im Weg, links ein kleines Polster. Vorher war x0 bei LUPE fix 28 —
  // auf breiten Karten blieb die Baugruppe links kleben, mit viel Leerraum
  // vor der rechts stehenden Lupe. Jetzt fuellt sie ihre eigene Spalte und
  // steht darin mittig, wie die Lupe in ihrer.
  const availR = LUPE ? W - 8 - 2 * LR - GAP : W - 8;
  const availW = Math.max(80, availR - LEFT_PAD);
  // Koerperbreite als Funktion von P: N Teilungen + Rolle/Haken-Ueberstand
  // links (rr + 3,5 + 12) und Zahn-Ueberstand rechts (+12) — dieselben
  // Konstanten wie im Koerperpfad unten (xl/xr).
  const P = Math.min(34, (availW - 27.5) / (N + 0.3));
  const rr = P * 0.3; // Rolle: Ø 0,61 p
  const CY = 86, H = 128;
  const bodyW = N * P + rr + 3.5 + 24;
  const x0 = LEFT_PAD + (availW - bodyW) / 2 + rr + 3.5 + 12;
  const spread = useTween(dropped ? (rr + 3) / N : 0, 420);
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + i * (P + spread));
  const top = P * 0.41;
  const hx = x0 - rr - 3.5; // Haken liegt links an der ersten Rolle an
  const tx = x0 + N * P; // Messzahn ueber der Nennposition der letzten Rolle
  const restAng = (-Math.atan2(rr + 1.5, tx - hx) * 180) / Math.PI;
  const [dy, ang] = useTweenList([
    stage === 0 ? -16 : 0,
    stage < 2 ? restAng - 6 : dropped ? 0 : restAng,
  ], 420);
  const color = tone === 'ok' ? 'var(--brand)' : tone === 'warn' ? 'var(--tool-warn)' : 'var(--tx1)';

  // Lehrenkoerper als ein lasergeschnittenes Teil: Balken, Messzahn, Haken.
  const BH = 16, BY = CY - top - 22, pb = BY + BH;
  const xl = hx - 12, xr = tx + 12, R = BH / 2;
  const body = `M${xl + R},${BY} H${xr - R} A${R},${R} 0 0 1 ${xr - R},${pb} `
    + `H${tx + 3.4} L${tx + 1.2},${CY} H${tx - 1.2} L${tx - 3.4},${pb} `
    + `H${hx + 2.4} V${CY + 1.5} A2.4,2.4 0 0 1 ${hx - 2.4},${CY + 1.5} V${pb} `
    + `H${xl + R} A${R},${R} 0 0 1 ${xl + R},${BY} Z`;
  const tooth = `M${tx + 3.4},${pb} L${tx + 1.2},${CY} H${tx - 1.2} L${tx - 3.4},${pb} Z`;
  const slot0 = hx + 8, slot1 = hx + 8 + (tx - hx) * 0.34;
  const engrave = hx + (tx - hx) * 0.7;
  const pose = `translate(0 ${dy.toFixed(2)}) rotate(${ang.toFixed(3)} ${hx.toFixed(2)} ${CY})`;
  const gauge = (shadow: boolean) => (
    <g transform={pose}>
      <path d={body} fill={url(id, 'steel')} stroke={EDGE} strokeWidth={1} strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" filter={shadow ? url(id, 'lift') : undefined} />
      <path d={tooth} fill={color} style={{ transition: 'fill 300ms ease' }} />
      <rect x={slot0} y={BY + 5.5} width={slot1 - slot0} height={5} rx={2.5}
        fill={url(id, 'deep')} stroke={EDGE} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
      {/* Gravur: helle Kante unten, dunkle Schrift darueber */}
      <g style={{ ...FONT, letterSpacing: '0.04em' }} fontWeight={700} textAnchor="middle">
        <text x={engrave} y={BY + 12.4 + 0.7} fill="var(--metal-hi)">{markLabel} %</text>
        <text x={engrave} y={BY + 12.4} fill={EDGE}>{markLabel} %</text>
      </g>
    </g>
  );
  const caption = dropped
    ? (de ? `Zahn ${markLabel} fällt ein = mind. ${markLabel} % gelängt` : `Tooth ${markLabel} drops in = at least ${markLabel} % worn`)
    : (de ? `Zahn ${markLabel} liegt auf = unter ${markLabel} %` : `Tooth ${markLabel} rests on top = below ${markLabel} %`);

  // Lupe rechts oben, Fuehrungslinie von der Kontaktstelle.
  const lx = W - 8 - LR, ly = 46;
  const lead0 = { x: tx + 3, y: CY - top - 3 };
  const ld = Math.hypot(lead0.x - lx, lead0.y - ly) || 1;
  const lead1 = { x: lx + ((lead0.x - lx) / ld) * LR, y: ly + ((lead0.y - ly) / ld) * LR };
  const fade: React.CSSProperties = { opacity: stage === 0 ? 0 : 1, transition: 'opacity 300ms ease' };

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block" aria-label={caption}>
        <MaterialDefs id={id} />
        <GaugeDefs id={id} />
        {LUPE && <clipPath id={id('lupe')}><circle cx={lx} cy={ly} r={LR} /></clipPath>}

        {/* Lehre hinter der Kette: Haken und Zahn greifen zwischen die Laschen */}
        <g style={fade}>{gauge(true)}</g>
        <ChainStrip xs={xs} y={CY} p={P} id={id} />

        {W >= 260 && (
          <g style={FONT} fill="var(--txf)">
            <text x={xl} y={BY - 9} textAnchor="start">{de ? 'Haken' : 'Hook'}</text>
            <text x={xr} y={BY - 9} textAnchor="end">{de ? 'Messzahn' : 'Tooth'}</text>
          </g>
        )}

        {LUPE && (
          <g style={fade}>
            <path d={`M${lead0.x},${lead0.y} L${lead1.x},${lead1.y}`} stroke={EDGE} strokeOpacity={0.6} strokeWidth={0.8} strokeDasharray="2 2" />
            <g clipPath={url(id, 'lupe')}>
              <circle cx={lx} cy={ly} r={LR} fill="var(--sketch-bg)" />
              <g transform={`translate(${lx} ${ly}) scale(${LZ}) translate(${-tx} ${-(CY - rr * 0.6)})`}>
                <line x1={xs[N - 2]} x2={xs[N] + P} y1={CY} y2={CY} stroke="var(--txff)" strokeOpacity={0.5}
                  strokeWidth={1} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
                {[N - 2, N - 1, N].map(i => (
                  <circle key={i} cx={xs[i]} cy={CY} r={rr} fill={url(id, 'roller')} stroke={EDGE}
                    strokeWidth={1} vectorEffect="non-scaling-stroke" />
                ))}
                {gauge(false)}
              </g>
            </g>
            <circle cx={lx} cy={ly} r={LR} fill="none" stroke={dropped ? color : EDGE} strokeWidth={1.5}
              style={{ transition: 'stroke 300ms ease' }} />
            {dropped && (
              <text x={W - 4} y={12} textAnchor="end" style={FONT} fill="var(--txff)">{t.tools.shared.sketchExaggerated}</text>
            )}
          </g>
        )}

        {(() => {
          const lines = wrapCaption(caption, W - 8);
          const y0 = lines.length > 1 ? H - 21 : H - 6;
          return (
            <text x={W / 2} y={y0} textAnchor="middle" style={FONT} fontWeight={500} fill="var(--tx2)">
              {lines.map((l, i) => <tspan key={i} x={W / 2} dy={i === 0 ? 0 : 15}>{l}</tspan>)}
            </text>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Intervall: Zeitstrahl bis zum naechsten Wachsen ─────────────────────────

/**
 * Von „zuletzt gewachst" ueber „heute" bis „faellig", dazu die zwei
 * Folgetermine — auf einem Kalender-Lineal (Tage kurz, Montage lang,
 * Monatswechsel beschriftet). Der gefahrene Anteil ist gefuellt und in
 * Kilometern beschriftet: man sieht, wie viel vom Intervall schon weg ist.
 */
export function RewaxTimeline({ last, today, due, days, overdue, labels, fmtDate, kmPerWeek, kmPerWax }: {
  last: Date; today: Date; due: Date; days: number; overdue: boolean;
  labels: { last: string; today: string; due: string };
  fmtDate: (d: Date) => string;
  kmPerWeek?: number; kmPerWax?: number;
}) {
  const { t, lang } = useLanguage();
  const [ref, W] = useWidth<HTMLDivElement>();
  const id = useSvgId();
  const revealed = useRevealOnce(ref);
  const grow = useTween(revealed ? 1 : 0, 800);
  const PAD = 14, H = 100, Y = 54;
  const DAY = 86400000;
  const CH = 6.6; // geschaetzte Zeichenbreite bei 12 px
  const cycle = days * DAY;
  const next = [1, 2].map(k => new Date(due.getTime() + k * cycle));
  const start = last.getTime();
  const end = Math.max(next[1].getTime(), today.getTime() + 7 * DAY);
  const x = (d: Date | number) => PAD + ((+d - start) / (end - start)) * (W - PAD * 2);
  const done = Math.min(+today, +due);
  const tone = overdue ? 'var(--tool-warn)' : 'var(--brand)';

  // Kalender-Lineal
  const span = Math.round((end - start) / DAY);
  const pxDay = (W - PAD * 2) / Math.max(1, span);
  let dayTicks = '', weekTicks = '', monthTicks = '';
  const months: Date[] = [];
  for (let i = 0; i <= span; i++) {
    const d = new Date(start + i * DAY);
    const tx = x(d).toFixed(1);
    if (d.getDate() === 1 && i > 0) { monthTicks += `M${tx},${Y - 6} V${Y + 11} `; months.push(d); }
    else if (d.getDay() === 1) weekTicks += `M${tx},${Y + 5} v6 `;
    else if (pxDay >= 3.5) dayTicks += `M${tx},${Y + 5} v3 `;
  }
  const fmtMonth = (d: Date) => d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'short' });

  // Etiketten unter dem Strahl, nach Wichtigkeit gesetzt: „faellig" immer,
  // dann „zuletzt" (nicht, wenn das heute war — das sagt die Marke oben), dann
  // die Folgetermine, zuletzt Monatsnamen. Ueberlappt ein Etikett ein bereits
  // gesetztes, bleibt es weg.
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const candidates = [
    { d: due, text: `${labels.due} ${fmtDate(due)}`, strong: true, faint: false },
    ...(sameDay(last, today) ? [] : [{ d: last, text: `${labels.last} ${fmtDate(last)}`, strong: false, faint: false }]),
    ...next.map(d => ({ d, text: fmtDate(d), strong: false, faint: false })),
    ...months.map(d => ({ d, text: fmtMonth(d), strong: false, faint: true })),
  ];
  const placed: { from: number; to: number }[] = [];
  const shown = candidates.flatMap(c => {
    const bx = x(c.d);
    const w = c.text.length * CH;
    const anchor: 'start' | 'end' | 'middle' = bx < w / 2 + 2 ? 'start' : bx > W - w / 2 - 2 ? 'end' : 'middle';
    const from = anchor === 'start' ? bx : anchor === 'end' ? bx - w : bx - w / 2;
    const box = { from: from - 6, to: from + w + 6 };
    if (placed.some(p => box.from < p.to && box.to > p.from)) return [];
    placed.push(box);
    return [{ ...c, bx, anchor }];
  });

  // Kilometer seit dem letzten Wachsen stehen an der Heute-Nadel („heute ·
  // 100 von 300 km") — neben der Nadel ist zwischen zuletzt und heute meist
  // nur eine Woche Platz, zu schmal fuer eine eigene Beschriftung.
  const kmDone = kmPerWeek ? Math.round(((+today - start) / DAY / 7) * kmPerWeek) : 0;
  const todayText = kmPerWax && kmDone > 0
    ? `${labels.today} · ${t.tools.shared.sketchKm.replace('{done}', String(kmDone)).replace('{total}', String(kmPerWax))}`
    : labels.today;
  const todayW = todayText.length * CH;
  const todayAnchor: 'start' | 'end' | 'middle' =
    x(today) < todayW / 2 + 2 ? 'start' : x(today) > W - todayW / 2 - 2 ? 'end' : 'middle';
  const drop = 'M0,-4.2 C3.3,-0.6 3.3,3.6 0,3.6 C-3.3,3.6 -3.3,-0.6 0,-4.2 Z';

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block"
        aria-label={`${labels.last} ${fmtDate(last)}, ${labels.today} ${fmtDate(today)}, ${labels.due} ${fmtDate(due)}`}>
        <defs>
          <pattern id={id('hatch')} width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={1.6} height={4} fill="var(--tool-warn)" />
          </pattern>
        </defs>
        <line x1={x(last)} x2={x(end)} y1={Y} y2={Y} stroke="var(--bd2)" strokeWidth={2} strokeLinecap="round" />
        <path d={dayTicks} stroke="var(--bd2)" strokeWidth={1} />
        <path d={weekTicks} stroke="var(--txff)" strokeOpacity={0.5} strokeWidth={1} />
        <path d={monthTicks} stroke="var(--txff)" strokeOpacity={0.8} strokeWidth={1} />
        {done > start && (
          <line x1={x(last)} x2={x(last) + (x(done) - x(last)) * grow} y1={Y} y2={Y} stroke={tone} strokeWidth={4} strokeLinecap="round" />
        )}
        {overdue && (
          <rect x={x(due)} y={Y - 3} width={Math.max(0, x(today) - x(due))} height={6} rx={1.5} fill={url(id, 'hatch')} />
        )}
        {next.map(d => (
          <circle key={+d} cx={x(d)} cy={Y} r={4} fill="var(--sf)" stroke="var(--txff)" strokeWidth={2} />
        ))}
        <circle cx={x(last)} cy={Y} r={4} fill="var(--txf)" />
        {/* faellig: Ring mit Wachstropfen */}
        <g style={{ transform: `translate(${x(due)}px, ${Y}px)`, transition: `transform 320ms ${EASE}` }}>
          <circle r={8.5} fill="var(--sf)" stroke={tone} strokeWidth={2.5} />
          <path d={drop} fill={tone} />
        </g>

        {/* heute: Nadel mit Kopf */}
        <g style={{ transition: `transform 320ms ${EASE}`, transform: `translateX(${x(today)}px)` }}>
          <line x1={0} x2={0} y1={26} y2={Y - 6} stroke="var(--tx1)" strokeWidth={1.5} />
          <circle cx={0} cy={26} r={2.5} fill="var(--tx1)" />
          <text x={0} y={18} textAnchor={todayAnchor} style={FONT} fontWeight={700} fill="var(--tx1)">
            {todayText}
          </text>
        </g>

        {shown.map(s => (
          <text key={s.text} x={s.bx} y={Y + 28} textAnchor={s.anchor} style={FONT}
            fontWeight={s.strong ? 700 : 400} fill={s.strong ? 'var(--tx1)' : s.faint ? 'var(--txff)' : 'var(--txf)'}>
            {s.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Rahmen fuer die eine Grafik einer Karte — auf allen Karten dieselbe Flaeche.
 *
 * Feste Hoehe, nicht nur eine Mindesthoehe: zusammen mit `.cq-split`
 * (min-height GRAPHIC_H, index.css) haelt sie die Koerperzone jeder Karte
 * konstant. Ohne das war die Kettenlaenge in „Messen" 539 px hoch und in
 * „Zaehlen" 513 — und weil die hoechste Karte die Deckzeile bestimmt, wackelten
 * alle fuenf Karten, sobald jemand IN einer Karte etwas umschaltete.
 * 186 px ist am hoechsten Inhalt gemessen: die vier Kettenzeilen der
 * Passende-Kette-Karte.
 *
 * Zeichenblatt seit v2: feines Punktraster und eine Innenkante oben, damit
 * alle Grafiken auf demselben Papier stehen.
 */
export const GRAPHIC_H = 186;

export function SketchFrame({ children, caption, height = GRAPHIC_H }: {
  children: React.ReactNode; caption?: React.ReactNode;
  /** Abweichende Blatthoehe. Die festen 186 px gelten fuer das Deck, wo alle
   *  Karten gleich hoch sein muessen (DESIGN.md §7). Ausserhalb des Decks —
   *  etwa im Hero-Urteil — ist ein Blatt in Inhaltshoehe richtig, sonst steht
   *  unter der Grafik ein Streifen grauer Luft. */
  height?: number;
}) {
  return (
    <figure
      className="rounded-2xl px-3.5 py-3 flex flex-col justify-center overflow-hidden"
      style={{
        backgroundColor: 'var(--inset-bg)',
        backgroundImage: 'radial-gradient(var(--sketch-dot) 0.8px, transparent 1.1px)',
        backgroundSize: '10px 10px',
        backgroundPosition: '5px 5px',
        border: '1px solid var(--inset-bd)',
        boxShadow: 'inset 0 1px 2px var(--sketch-inset)',
        height,
      }}
    >
      <div className="w-full">{children}</div>
      {caption && <figcaption className="text-[12px] leading-snug mt-2" style={{ color: 'var(--txf)' }}>{caption}</figcaption>}
    </figure>
  );
}

// ── Der Block, geteilt in seine Wachsgaenge ─────────────────────────────────

/**
 * WaxBlockBar — ein Block als Balken, geteilt in die Wachsgaenge, die in ihm
 * stecken. Der Anteil, den ein Fahrprofil im ersten Jahr verbraucht, ist
 * getoent, der Rest bleibt grau.
 *
 * Das ist die einzige Grafik des Hero-Moments (WaxVerdict) und hat genau eine
 * Aufgabe: den abstrakten Block persoenlich machen. Man sieht seinen eigenen
 * Jahresverbrauch an dem Gegenstand, den man gerade angeklickt hat — eine
 * Zahl allein ("haelt dich ca. 14 Monate") leistet das nicht.
 *
 * Grammatik wie alle anderen: 1:1-Skala, Schrift >= 12 px, nur --brand und
 * die Textgrauwerte, Bemassung statt loser Linie mit Text.
 */
export function WaxBlockBar({ applications, perYear, blockLabel, usedLabel, leftoverLabel }: {
  /** Wachsgaenge, die im Block stecken. */
  applications: number;
  /** Wachsgaenge, die dieses Profil im ersten Jahr verbraucht. */
  perYear: number;
  /** Etikett links ueber dem Balken, z. B. "1 Block · 500 g". */
  blockLabel: string;
  /** Etikett an der Bemassung des verbrauchten Teils, z. B. "1. Jahr". */
  usedLabel: string;
  /** Etikett rechts ueber dem Balken, z. B. "20-32 Wachsgaenge". */
  leftoverLabel: string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const id = useSvgId();
  const shown = useRevealOnce(ref);

  const apps = Math.max(1, Math.round(applications));
  // Gedeckelt: mehr als ein Block im Jahr fuellt den Balken, laeuft aber nicht
  // darueber hinaus — die Aussage ist dann "reicht dir kein Jahr", und die
  // traegt die Bildunterschrift, nicht ein ueberzeichneter Balken.
  const share = Math.min(1, Math.max(0, perYear / apps));
  const k = useTween(shown ? share : 0, 520);

  const PAD = 2, BAR_Y = 24, BAR_H = 46, R = 8;
  const x0 = PAD, x1 = Math.max(x0 + 40, W - PAD);
  const barW = x1 - x0;
  const cut = x0 + barW * k;
  const dimY = BAR_Y + BAR_H + 16;
  const H = dimY + 16;

  // Trennlinien nur so viele, wie bei dieser Breite noch als Teilung lesbar
  // sind — darunter wird aus dem Raster eine graue Flaeche (DESIGN.md: Schrift
  // und Striche muessen unterscheidbar bleiben).
  const step = barW / apps;
  const divisions = step >= 6 ? apps : 0;

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" className="block"
        aria-label={`${blockLabel}, ${leftoverLabel}. ${usedLabel}: ${Math.round(perYear)}`}>
        <defs>
          {/* Der verbrauchte Teil wird zum Rand hin leicht heller: der Balken
              liest sich dadurch als Fuellstand und nicht als zweite Kachel. */}
          <linearGradient id={id('used')} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--accent-strong)" />
            <stop offset="1" stopColor="var(--accent-soft)" />
          </linearGradient>
          <clipPath id={id('clip')}>
            <rect x={x0} y={BAR_Y} width={barW} height={BAR_H} rx={R} />
          </clipPath>
        </defs>

        {/* Etiketten ueber dem Balken */}
        <g style={FONT}>
          <text x={x0} y={14} fill="var(--tx2)">{blockLabel}</text>
          <text x={x1} y={14} textAnchor="end" fill="var(--txf)">{leftoverLabel}</text>
        </g>

        {/* Der Block: Grundflaeche, verbrauchter Teil, Teilung, Kante */}
        <g clipPath={url(id, 'clip')}>
          <rect x={x0} y={BAR_Y} width={barW} height={BAR_H} fill="var(--sketch-bg)" />
          <rect x={x0} y={BAR_Y} width={Math.max(0, cut - x0)} height={BAR_H}
            fill={url(id, 'used')} />
          {divisions > 0 && Array.from({ length: divisions - 1 }, (_, i) => {
            const x = x0 + step * (i + 1);
            return (
              <line key={i} x1={x} x2={x} y1={BAR_Y} y2={BAR_Y + BAR_H}
                stroke={x <= cut ? 'var(--sketch-bg)' : 'var(--bd2)'}
                strokeWidth="var(--dw-hair)" opacity={x <= cut ? 0.45 : 1} />
            );
          })}
        </g>
        <rect x={x0} y={BAR_Y} width={barW} height={BAR_H} rx={R}
          fill="none" stroke="var(--bd)" strokeWidth="var(--dw-line)" />

        {/* Bemassung des verbrauchten Teils: Hilfslinie, Massline mit Pfeilen,
            Massszahl darunter — nie eine lose Linie mit Text. */}
        {k > 0.02 && (
          <g style={{ opacity: Math.min(1, k * 4) }}>
            <line x1={cut} x2={cut} y1={BAR_Y + BAR_H} y2={dimY + 4}
              stroke="var(--bd2)" strokeWidth="var(--dw-hair)" />
            <line x1={x0} x2={cut} y1={dimY} y2={dimY}
              stroke="var(--txf)" strokeWidth="var(--dw-hair)" />
            <path d={`M${x0},${dimY} l6,-3 v6 Z`} fill="var(--txf)" />
            <path d={`M${cut},${dimY} l-6,-3 v6 Z`} fill="var(--txf)" />
            {cut - x0 > 44 && (
              <text x={(x0 + cut) / 2} y={dimY + 13} textAnchor="middle"
                style={{ ...FONT, ...HALO }} fill="var(--tx2)">{usedLabel}</text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
