// ─── Die Formel-Reise: von der Kette bis zum Molekuel und zurueck ────────────
//
// Luca, 26.09.2026: das Film-Labor wirkte wie eine Diashow. Die Ringe am
// Anfang lasen sich nicht als Kette, der Zoom endete in einem grauen Oval,
// danach sprang das Bild hart auf einen Block, und sechs Stationen sahen
// gleich aus. Jetzt ist es EINE Kamerafahrt durch eine Welt in echten
// Massen (geometry.ts), vom Kettenblatt (~10 cm) bis in den Film (~10 µm),
// und am Ende zurueck:
//
//   Akt 1 Kette    die Kette laeuft aufs Blatt, jedes Glied knickt ein
//   Akt 2 Gelenk   durchleuchtet, die drei Reibstellen nacheinander
//   Akt 3 Spalt    Reibstelle 01: Oel mit Staub gegen festes Wachs
//   Akt 4 Film     jede Zutat als Antwort auf ein Problem (erst das
//                  Versagen, dann die Loesung), die Lupe zeigt die Molekuele
//   Akt 5 Zurueck  Rueckfahrt zur Kette, dann die gemessenen Zahlen
//
// Technik: ein passiver Scroll-Listener liest nur die Zielposition. Ein
// rAF-Loop laeuft ihr mit Nachlauf hinterher (daher das weiche Gleiten auch
// bei ruckigem Mausrad) und stoppt, sobald er angekommen ist. Pro Frame
// werden nur transform-Matrizen und CSS-Variablen gesetzt; React rendert
// ausschliesslich beim Wechsel des Takts. Die Kamera zoomt ueber die
// SVG-Matrix, nicht ueber CSS-scale: so bleibt jede Stufe Vektor und scharf.

import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { JOURNEY_ACTS, JOURNEY_BEATS, JOURNEY_HOTSPOTS, type JourneyHotspot } from '@/lib/science';
import { waxVsOil } from '@/lib/data';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import {
  ALPHA_F, DELTA, CONTACT_MATRIX, PIN_B, PIN_R, COLLAR_R, ROLLER_R, RING_R, SCOPE_ANCHOR, GRIT, contactToWorld, pinsAt, smooth, clamp01, lerp,
} from './geometry';
import { ChainLayer, ContactLayer, Defs, JointLayer, LINK_SLOTS } from './scenes';
import { NANO, type NanoKey } from './NanoScenes';
import { useSceneClock } from './useSceneClock';

type M = [number, number, number, number, number, number];
const mul = (A: M, B: M): M => [
  A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5],
];
const apply = (A: M, x: number, y: number) => ({ x: A[0] * x + A[2] * y + A[4], y: A[1] * x + A[3] * y + A[5] });
const mstr = (A: M) => `matrix(${A.map(n => +n.toPrecision(9)).join(' ')})`;

// ─── Takte ───────────────────────────────────────────────────────────────────
interface Cam { fx: number; fy: number; w: number; rot: number; film?: boolean }
interface Beat { weight: number; tf: number; cam: Cam }

const wide: Cam = { fx: -18, fy: -RING_R + 24, w: 210, rot: 0 };
const atB = (w: number, dx = 0, dy = 0): Cam => ({ fx: PIN_B.x + dx, fy: PIN_B.y + dy, w, rot: 0 });
const cGap = contactToWorld(0, -1.5);
const cFilm = contactToWorld(0.3, -1.5);
const gapCam: Cam = { fx: cGap.x, fy: cGap.y, w: 0.07, rot: 90 };
const filmCam: Cam = { fx: cFilm.x, fy: cFilm.y, w: 0.0108, rot: 90, film: true };

// Reihenfolge wie JOURNEY_BEATS, plus der Ergebnis-Takt am Ende.
const BEATS: Beat[] = [
  { weight: 1.1, tf: 0.3, cam: wide },
  { weight: 1.0, tf: 0.55, cam: atB(64, -6, 6) },
  { weight: 1.0, tf: 0.55, cam: atB(22) },
  { weight: 0.95, tf: 0.4, cam: atB(15, -1.4) },
  { weight: 0.9, tf: 0.3, cam: atB(15, 0) },
  { weight: 0.9, tf: 0.3, cam: atB(16, 0) },
  { weight: 1.25, tf: 0.95, cam: gapCam },
  { weight: 1.05, tf: 0.2, cam: gapCam },
  { weight: 0.95, tf: 0.2, cam: gapCam },
  { weight: 1.25, tf: 0.42, cam: filmCam },
  { weight: 1.15, tf: 0.2, cam: filmCam },
  { weight: 1.15, tf: 0.2, cam: filmCam },
  { weight: 1.15, tf: 0.2, cam: filmCam },
  { weight: 1.1, tf: 0.2, cam: filmCam },
  { weight: 1.1, tf: 0.2, cam: filmCam },
  { weight: 1.3, tf: 0.9, cam: wide },
  { weight: 1.0, tf: 0.2, cam: wide },
];
const CUM = BEATS.reduce<number[]>((a, b) => [...a, a[a.length - 1] + b.weight], [0]);
const UNITS = CUM[CUM.length - 1];
const UNIT_SVH = 52;
const ACT_START = [0, 2, 6, 9, 15];
const RESULT = BEATS.length - 1;

const beatAt = (u: number) => {
  let i = 0;
  while (i < BEATS.length - 1 && u >= CUM[i + 1]) i++;
  return i + clamp01((u - CUM[i]) / BEATS[i].weight);
};

/** Kamera bei Takt-Position b. Zoom logarithmisch; der Zielpunkt wandert so
 *  mit, dass er auf dem Bildschirm ruhig an seinen Platz gleitet. */
function camAt(b: number): Omit<Cam, "film"> & { film: number } {
  const i = Math.min(BEATS.length - 1, Math.floor(b));
  const B = BEATS[i].cam, A = i > 0 ? BEATS[i - 1].cam : B;
  const t = smooth(0, 1, (b - i) / BEATS[i].tf);
  const w = A.w * Math.pow(B.w / A.w, t);
  const f = Math.abs(A.w - B.w) < 1e-9 ? t : (A.w - w) / (A.w - B.w);
  const fa = A.film ? 1 : 0, fb = B.film ? 1 : 0;
  return { fx: lerp(A.fx, B.fx, f), fy: lerp(A.fy, B.fy, f), w, rot: lerp(A.rot, B.rot, smooth(0.15, 0.85, t)), film: lerp(fa, fb, t) };
}

function alphaAt(b: number) {
  if (b < 1) return ALPHA_F - 4.5 * DELTA * (1 - (1 - Math.pow(1 - clamp01(b), 3)));
  if (b < 15) return ALPHA_F;
  return ALPHA_F + (b - 15) * 2.2 * DELTA;
}

const fadeLog = (w: number, a: number, b: number) => smooth(Math.log(a), Math.log(b), Math.log(w));
const win = (b: number, i: number) => smooth(i - 0.05, i + 0.25, b) * (1 - smooth(i + 0.85, i + 1.1, b));
const fail = (b: number, i: number) => { const l = b - i; return smooth(0.08, 0.32, l) * (1 - smooth(0.5, 0.68, l)); };
const fix = (b: number, i: number) => smooth(0.52, 0.8, b - i);

function niceScale(mm: number) {
  const e = Math.pow(10, Math.floor(Math.log10(mm)));
  const n = mm / e;
  const L = (n >= 5 ? 5 : n >= 2 ? 2 : 1) * e;
  const label = L >= 10 ? `${+(L / 10).toPrecision(3)} cm` : L >= 1 ? `${+L.toPrecision(3)} mm` : L >= 1e-3 ? `${+(L * 1000).toPrecision(3)} µm` : `${+(L * 1e6).toPrecision(3)} nm`;
  return { L, label };
}

// ─── Lupe ────────────────────────────────────────────────────────────────────
interface ScopeCfg { key: NanoKey; without: boolean; unit: string; anchor: { x: number; y: number } }
function scopeFor(beat: number, phase: number): ScopeCfg | null {
  const second = phase === 1;
  switch (beat) {
    case 9: return { key: 'kristallstruktur', without: false, unit: 'nm', anchor: SCOPE_ANCHOR.paraffin };
    case 10: return { key: 'mos2', without: !second, unit: 'nm', anchor: SCOPE_ANCHOR.mos2 };
    case 11: return { key: 'matrix', without: !second, unit: 'nm', anchor: SCOPE_ANCHOR.ft };
    case 12: return { key: 'winterformel', without: !second, unit: 'nm', anchor: SCOPE_ANCHOR.micro };
    case 13: return second
      ? { key: 'sedimentation', without: false, unit: 'nm', anchor: SCOPE_ANCHOR.disp }
      : { key: 'block', without: true, unit: 'mm', anchor: SCOPE_ANCHOR.disp };
    case 14: return { key: 'antioxidans', without: !second, unit: 'nm', anchor: SCOPE_ANCHOR.antiox };
    default: return null;
  }
}

function Scope({ cfg, de, id }: { cfg: ScopeCfg; de: boolean; id: string }) {
  const { t, ref } = useSceneClock(true, NANO[cfg.key].still);
  const sc = NANO[cfg.key].render(t, de, cfg.without);
  return (
    <>
      <svg ref={ref} viewBox="0 0 240 240" className="block w-full h-full" role="img" aria-label={sc.cap}>
        <defs>
          <clipPath id={`${id}-sc`}><circle cx="120" cy="120" r="118" /></clipPath>
          <radialGradient id={`${id}-scbg`} cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#141922" /><stop offset="1" stopColor="#07090C" /></radialGradient>
          <radialGradient id={`${id}-scvig`} cx="0.5" cy="0.5" r="0.5"><stop offset="0.72" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient>
        </defs>
        <g clipPath={`url(#${id}-sc)`}>
          <rect width="240" height="240" fill={`url(#${id}-scbg)`} />
          {sc.art}
          <rect width="240" height="240" fill={`url(#${id}-scvig)`} />
        </g>
        <circle cx="120" cy="120" r="118.5" fill="none" stroke={cfg.without ? '#FF8A3D' : 'rgba(255,255,255,0.85)'} strokeWidth="1.6" />
      </svg>
      <span className="jr-scope-unit">{cfg.unit}</span>
      <span className="jr-scope-state" data-bad={cfg.without || undefined}>
        {cfg.key === 'kristallstruktur' ? (de ? 'Paraffin' : 'Paraffin') : cfg.without ? (de ? 'ohne' : 'without') : (de ? 'mit' : 'with')}
      </span>
      <p className="jr-scope-cap">{sc.cap}</p>
    </>
  );
}

// ─── Hotspots ────────────────────────────────────────────────────────────────
// Ebene 'w' = Welt in mm, 'c' = Kontaktrahmen in µm (siehe geometry.ts).
const polar = (r: number, deg: number) => ({ x: PIN_B.x + r * Math.cos((deg * Math.PI) / 180), y: PIN_B.y + r * Math.sin((deg * Math.PI) / 180) });
const toothDeg = 38;
const ANCHORS: Record<string, { l: 'w' | 'c'; x: number; y: number }> = {
  tension: { l: 'w', x: PIN_B.x - 42, y: PIN_B.y },
  tooth: { l: 'w', x: (RING_R + 1.2) * Math.sin((toothDeg * Math.PI) / 180), y: -(RING_R + 1.2) * Math.cos((toothDeg * Math.PI) / 180) },
  pinB: { l: 'w', x: PIN_B.x, y: PIN_B.y },
  pin: { l: 'w', ...polar(PIN_R * 0.6, -14) },
  collar: { l: 'w', ...polar((PIN_R + COLLAR_R) / 2, -14) },
  roller: { l: 'w', ...polar((COLLAR_R + ROLLER_R) / 2, -14) },
  plates: { l: 'w', x: PIN_B.x + 4.3, y: PIN_B.y + 2.6 },
  gap: { l: 'c', x: 0, y: -1.5 },
  grit: { l: 'c', x: GRIT[4].x0, y: GRIT[4].y },
  waxfilm: { l: 'c', x: 10, y: -1.5 },
  paraffin: { l: 'c', ...SCOPE_ANCHOR.paraffin },
  mos2: { l: 'c', ...SCOPE_ANCHOR.mos2 },
  ft: { l: 'c', ...SCOPE_ANCHOR.ft },
  micro: { l: 'c', ...SCOPE_ANCHOR.micro },
  disp: { l: 'c', ...SCOPE_ANCHOR.disp },
  antiox: { l: 'c', ...SCOPE_ANCHOR.antiox },
};
const hsVis = (h: JourneyHotspot, b: number) => smooth(h.from - 0.02, h.from + 0.18, b) * (1 - smooth(h.to - 0.18, h.to - 0.02, b));

function HotspotCard({ h, de, onClose }: { h: JourneyHotspot; de: boolean; onClose: () => void }) {
  const src = de ? h.sourceDe : h.sourceEn;
  return (
    <div className="jr-card" role="dialog" aria-modal="false" aria-labelledby={`jr-card-${h.id}`} onClick={e => e.stopPropagation()}>
      <button type="button" className="jr-card-x" onClick={onClose} aria-label={de ? 'Schließen' : 'Close'}>×</button>
      <p className="jr-card-eyebrow">{de ? 'Die Physik dahinter' : 'The physics'}{h.schematic ? (de ? ' · Schema' : ' · schematic') : ''}</p>
      <h4 id={`jr-card-${h.id}`}>{de ? h.titleDe : h.titleEn}</h4>
      <p className="jr-card-body">{de ? h.bodyDe : h.bodyEn}</p>
      {h.formula && <p className="jr-card-f">{de ? h.formula : h.formula.replace(/(\d),(\d)/g, '$1.$2')}</p>}
      {(h.valueDe || h.valueEn) && <p className="jr-card-v">{de ? h.valueDe : h.valueEn}</p>}
      <div className="jr-card-foot">
        {src && <span>{de ? 'Quelle: ' : 'Source: '}{src}</span>}
        {h.detail && (
          <button type="button" className="jr-card-more" onClick={() => { onClose(); document.getElementById(h.detail!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
            {de ? 'Alles dazu weiter unten ↓' : 'Full detail below ↓'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Buehne: SVG + Ueberlagerungen, von aussen per Takt-Position gesteuert ───
/** Leerlauf-Effekte: zusaetzlicher Drehwinkel der Kette (rad) und ein leichtes
 *  Heranatmen der Kamera (0…1). Nur fuer die Vorschau am Anfang. */
export interface StageFx { spin: number; breathe: number }
export interface StageApi { render: (b: number, fx?: StageFx) => void; measure: () => void }

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const ACT_SCALE = ['~10 cm', '~1 cm', '~100 µm', '~10 µm', '~10 cm'];
/** Was ungefaehr so breit ist wie der Bildausschnitt. Groessen: Handbreite
 *  ~8,5 cm, Fingernagel ~1,2 cm, Haar ~70 µm, rotes Blutkoerperchen ~7,5 µm. */
function widthRef(mm: number, de: boolean) {
  const f = (v: string, w: string) => (de ? v : w);
  if (mm > 150) return f(`≈ ${Math.round(mm / 85)} Handbreiten`, `≈ ${Math.round(mm / 85)} hand widths`);
  if (mm > 55) return f('etwa eine Handbreite', 'about a hand’s width');
  if (mm > 6 && mm < 25) return f('etwa ein Fingernagel', 'about a fingernail');
  if (mm < 0.2 && mm >= 0.035) return f(`≈ ${Math.max(1, Math.round(mm / 0.07))} Haar${mm / 0.07 >= 1.5 ? 'e' : ''} breit`, `≈ ${Math.max(1, Math.round(mm / 0.07))} hair${mm / 0.07 >= 1.5 ? 's' : ''} wide`);
  if (mm < 0.035 && mm > 0.004) return f(`≈ ${Math.max(1, Math.round(mm / 0.0075))} rote${mm / 0.0075 >= 1.5 ? '' : 's'} Blutkörperchen`, `≈ ${Math.max(1, Math.round(mm / 0.0075))} red blood cell${mm / 0.0075 >= 1.5 ? 's' : ''}`);
  return '';
}

// Sichtfeld-Breite in Zehnerschritten. Die Kamera faehrt bis ~10 µm; was
// darunter liegt, zeigt die Lupe mit eigenem Massstab (nm).
const RULER_LABELS = ['10 cm', '1 cm', '1 mm', '100 µm', '10 µm'];
const RULER_MM = [100, 0.01] as const;

/** Die Buehne: besitzt alle Refs selbst und gibt nach aussen nur render(b)
 *  und measure() heraus. So bleibt die Steuerung (Scroll oder Standbild)
 *  vom Zeichnen getrennt. */
function Stage({ de, scope, className, text, extra, rail, handle, open, setOpen, bare, cam: camOverride }: {
  de: boolean; scope: ScopeCfg | null; className: string;
  text?: React.ReactNode; extra?: React.ReactNode; rail?: React.ReactNode;
  handle: React.Ref<StageApi>;
  open?: string | null; setOpen?: (id: string | null) => void;
  /** Ohne Instrumente (Lineal, Zaehler, Massstab), Motiv mittig: fuer Hero und Linse. */
  bare?: boolean;
  /** Feste Kamera statt der Takt-Kamera (Hero). */
  cam?: Cam;
}) {
  const id = useId().replace(/:/g, '');
  const stage = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const cone = useRef<SVGPathElement>(null);
  const scopeEl = useRef<HTMLDivElement>(null);
  const scaleBar = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const thermo = useRef<HTMLDivElement>(null);
  const mag = useRef<HTMLDivElement>(null);
  const hots = useRef<HTMLDivElement>(null);
  const acts = useRef<HTMLDivElement>(null);
  const cache = useRef<{ vars: Record<string, string>; alpha: number; dims: { W: number; H: number; mobile: boolean } | null; scale: string; therm: string; mag: string; ref: string; scope: ScopeCfg | null; b: number }>(
    { vars: {}, alpha: NaN, dims: null, scale: '', therm: '', mag: '', ref: '', scope: null, b: 0 });

  const measure = useCallback(() => {
    const el = view.current; if (!el) return;
    const r = el.getBoundingClientRect();
    cache.current.dims = { W: r.width, H: r.height, mobile: window.innerWidth < 900 };
    svg.current?.setAttribute('viewBox', `0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`);
  }, []);

  const api = useMemo<Pick<StageApi, "render">>(() => ({
    render(b: number, fx?: StageFx) {
      const c = cache.current, st = stage.current, s = svg.current;
      c.b = b;
      if (!c.dims) measure();
      const d = c.dims; if (!st || !s || !d) return;
      const cam = camOverride ? { ...camOverride, film: 0 } : camAt(b);
      if (fx?.breathe) cam.w *= 1 - 0.035 * fx.breathe;
      // Bildausschnitt: w passt in die Breite, Hoehe mit Reserve
      // Desktop: die Buehne ist vollflaechig, links liegt der Text ueber einem
      // Verlauf. Das Motiv bekommt deshalb nur ~62 % der Breite und sitzt
      // rechts davon; im Film-Massstab rueckt es zur Mitte, weil rechts die Lupe steht.
      const usable = d.mobile || bare ? d.W : d.W * 0.62;
      const S = bare ? Math.min(d.W / cam.w, d.H / cam.w) : Math.min(usable / cam.w, d.H / (cam.w * 0.62));
      const ax = bare ? 0.5 : d.mobile ? 0.5 : lerp(0.64, 0.5, cam.film), ay = bare ? 0.5 : d.mobile ? lerp(0.5, 0.36, cam.film) : 0.53;
      const th = (cam.rot * Math.PI) / 180, co = Math.cos(th) * S, si = Math.sin(th) * S;
      const W: M = [co, si, -si, co, 0, 0];
      W[4] = ax * d.W - (W[0] * cam.fx + W[2] * cam.fy);
      W[5] = ay * d.H - (W[1] * cam.fx + W[3] * cam.fy);

      const layers = s.querySelectorAll<SVGGElement>('[data-layer]');
      const op: Record<string, number> = {
        chain: fadeLog(cam.w, 20, 42),
        joint: fadeLog(cam.w, 55, 30) * fadeLog(cam.w, 0.12, 0.4),
        contact: fadeLog(cam.w, 0.7, 0.22),
      };
      layers.forEach(g => {
        const k = g.dataset.layer!;
        const o = op[k];
        if (o <= 0.001) { g.setAttribute('display', 'none'); return; }
        g.removeAttribute('display');
        g.setAttribute('opacity', o.toFixed(3));
        g.setAttribute('transform', mstr(k === 'contact' ? mul(W, CONTACT_MATRIX) : W));
      });

      // Kette bewegen (nur wenn sichtbar und der Winkel sich aendert)
      const alpha = alphaAt(b) + (fx?.spin ?? 0);
      if (op.chain > 0.001 && alpha !== c.alpha) {
        c.alpha = alpha;
        const pins = pinsAt(alpha);
        const rot = `rotate(${((alpha * 180) / Math.PI).toFixed(3)})`;
        s.querySelectorAll('[data-ring], [data-ring-clip]').forEach(el => el.setAttribute('transform', rot));
        const inner = s.querySelectorAll<SVGGElement>('[data-inner] > g'), outer = s.querySelectorAll<SVGGElement>('[data-outer] > g');
        for (let i = 0; i < LINK_SLOTS; i++) {
          const p = pins[i], q = pins[i + 1];
          const rot = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          const tr = `translate(${p.x.toFixed(3)} ${p.y.toFixed(3)}) rotate(${rot.toFixed(3)})`;
          const isInner = ((p.k % 2) + 2) % 2 === 0;
          inner[i].setAttribute('transform', tr); outer[i].setAttribute('transform', tr);
          inner[i].setAttribute('display', isInner ? 'inline' : 'none');
          outer[i].setAttribute('display', isInner ? 'none' : 'inline');
        }
      }

      // Zustaende der Szenen als CSS-Variablen
      const oil = smooth(6.55, 6.95, b) * (1 - smooth(8.0, 8.35, b));
      const wax = smooth(8.0, 8.35, b);
      const vars: Record<string, number> = {
        art: win(b, 1),
        lbl: smooth(1.9, 2.3, b) * (1 - smooth(5.9, 6.25, b)),
        z1: win(b, 3) + 0.0, z2: win(b, 4), z3: win(b, 5),
        oil, wax,
        grit: smooth(7.0, 7.12, b) * (1 - smooth(8.0, 8.3, b)),
        g7: clamp01((b - 7.05) / 0.85),
        gaplbl: smooth(6.5, 6.9, b) * (1 - smooth(9.05, 9.3, b)),
        lod: fadeLog(cam.w, 0.04, 0.016),
        filmlbl: smooth(9.3, 9.6, b) * (1 - smooth(15.0, 15.2, b)),
        g9: b < 9 ? 0 : clamp01((b - 9.3) / 0.62),
        fail10: fail(b, 10), fix10: fix(b, 10),
        fail11: fail(b, 11), ft: fix(b, 11) * (1 - 0.55 * smooth(12, 12.3, b)),
        fail12: fail(b, 12), fix12: fix(b, 12),
        fix13: fix(b, 13),
        rad: smooth(14.05, 14.2, b) * (1 - smooth(15.0, 15.2, b)), g14: clamp01((b - 14.05) / 0.45), fix14: fix(b, 14),
      };
      const lodG = s.querySelector('[data-lod]');
      if (vars.lod < 0.001) lodG?.setAttribute('display', 'none'); else lodG?.removeAttribute('display');
      for (const k in vars) {
        const val = vars[k].toFixed(3);
        if (c.vars[k] !== val) { c.vars[k] = val; st.style.setProperty(`--${k}`, val); }
      }

      // Text: jeder Takt gleitet mit dem Scroll herein und hinaus
      st.querySelectorAll<HTMLElement>('[data-beat]').forEach(el => {
        const i = +el.dataset.beat!;
        const inn = i === 0 ? 1 : smooth(i - 0.02, i + 0.16, b), out = i === RESULT ? 0 : smooth(i + 0.84, i + 1.0, b);
        const o = inn * (1 - out);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - inn) * 18 - out * 18).toFixed(1)}px, 0)`;
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      });

      // Thermometer (Hitze, Kaelte)
      const heat = win(b, 11), cold = win(b, 12);
      const T = b < 12 ? 20 + 45 * smooth(0.05, 0.42, b - 11) : 20 - 28 * smooth(0.05, 0.42, b - 12);
      if (thermo.current) {
        const txt = `${Math.round(T)} °C`;
        if (c.therm !== txt) { c.therm = txt; thermo.current.firstElementChild!.textContent = txt; }
        thermo.current.style.opacity = Math.max(heat, cold).toFixed(3);
        thermo.current.dataset.cold = T < 10 ? '1' : '';
      }

      // Massstab: Balken, Lineal, Vergroesserung
      const fov = usable / S;
      const { L, label } = niceScale(fov * 0.16);
      if (scaleBar.current) {
        const px = (L * S).toFixed(1);
        if (c.scale !== label + px) {
          c.scale = label + px;
          (scaleBar.current.firstElementChild as HTMLElement).style.width = `${px}px`;
          scaleBar.current.lastElementChild!.textContent = label;
        }
      }
      if (mag.current) {
        const m = BEATS[0].cam.w / cam.w;
        const r = m < 1.5 ? 1 : +m.toPrecision(2);
        const txt = `×${r.toLocaleString(de ? 'de-DE' : 'en-US')}`;
        if (c.mag !== txt) { c.mag = txt; mag.current.firstElementChild!.textContent = txt; }
        const ref = widthRef(fov, de);
        if (c.ref !== ref) { c.ref = ref; mag.current.lastElementChild!.textContent = ref; }
      }
      if (ruler.current) {
        const pos = clamp01((Math.log10(RULER_MM[0]) - Math.log10(fov)) / (Math.log10(RULER_MM[0]) - Math.log10(RULER_MM[1])));
        ruler.current.style.setProperty('--pos', pos.toFixed(4));
        // Die naechstliegende Groessenordnung leuchtet mit.
        const on = Math.round(pos * (RULER_LABELS.length - 1));
        ruler.current.querySelectorAll('span').forEach((el, i) => el.toggleAttribute('data-on', i === on));
      }

      // Kapitelzeile beim Eintritt in einen neuen Akt, scrollgebunden
      if (acts.current) acts.current.querySelectorAll<HTMLElement>('[data-act]').forEach(el => {
        const a0 = ACT_START[+el.dataset.act!];
        const o = smooth(a0 - 0.45, a0 - 0.12, b) * (1 - smooth(a0 + 0.12, a0 + 0.42, b));
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        el.style.transform = `translate3d(0, ${((a0 - b) * 40).toFixed(1)}px, 0)`;
      });

      // Hotspots: der Kamera folgen, nur im eigenen Takt-Fenster sichtbar
      if (hots.current) {
        const WC = mul(W, CONTACT_MATRIX);
        hots.current.querySelectorAll<HTMLElement>('[data-hs]').forEach(el => {
          const h = JOURNEY_HOTSPOTS[+el.dataset.hs!], A = ANCHORS[h.anchor];
          const o = hsVis(h, b);
          if (o < 0.01) { if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'; return; }
          const p = apply(A.l === 'c' ? WC : W, A.x, A.y);
          el.style.visibility = 'visible';
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${(0.7 + 0.3 * o).toFixed(3)})`;
          el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
        });
      }

      // Zoom-Kegel vom Ort des Stoffs zur Lupe
      const sc = c.scope, sEl = scopeEl.current, cn = cone.current;
      if (cn && sEl) {
        const vis = sc ? smooth(0.2, 0.9, cam.film) * fadeLog(cam.w, 0.03, 0.013) : 0;
        if (sc && vis > 0.01) {
          const a = apply(mul(W, CONTACT_MATRIX), sc.anchor.x, sc.anchor.y);
          const vr = view.current!.getBoundingClientRect(), sr = sEl.getBoundingClientRect();
          const cx = sr.left + sr.width / 2 - vr.left, cy = sr.top + sr.height / 2 - vr.top, R = sr.width / 2;
          const ang = Math.atan2(a.y - cy, a.x - cx), dist = Math.hypot(a.x - cx, a.y - cy);
          const be = Math.acos(Math.min(0.99, R / dist));
          cn.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${(cx + R * Math.cos(ang + be)).toFixed(1)} ${(cy + R * Math.sin(ang + be)).toFixed(1)} L${(cx + R * Math.cos(ang - be)).toFixed(1)} ${(cy + R * Math.sin(ang - be)).toFixed(1)} Z`);
        }
        cn.style.opacity = vis.toFixed(3);
        sEl.style.opacity = vis.toFixed(3);
        sEl.style.transform = `scale(${(0.6 + 0.4 * vis).toFixed(3)})`;
        sEl.style.visibility = vis < 0.01 ? 'hidden' : 'visible';
      }
    },
  }), [measure, de, bare, camOverride]);

  useImperativeHandle(handle, () => ({ render: api.render, measure }), [api, measure]);
  // Neue Lupe: Kegel und Deckkraft sofort fuer die aktuelle Position nachziehen.
  useLayoutEffect(() => { cache.current.scope = scope; api.render(cache.current.b); }, [scope, api]);

  return (
    <div ref={stage} className={className} data-card={open ? '' : undefined} onClick={() => open && setOpen?.(null)}>
      {text}
      <div ref={view} className="jr-view">
        <svg ref={svg} className="jr-svg" aria-hidden>
          <Defs id={id} />
          <ChainLayer id={id} />
          <JointLayer id={id} de={de} />
          <ContactLayer id={id} de={de} />
          <path ref={cone} fill="rgba(169,196,230,0.07)" stroke="rgba(169,196,230,0.5)" strokeWidth="1" style={{ opacity: 0 }} />
        </svg>
        {!bare && <>
        <div ref={scopeEl} className="jr-scope" style={{ opacity: 0, visibility: 'hidden' }}>
          {scope && <Scope key={`${scope.key}-${scope.without}`} cfg={scope} de={de} id={id} />}
        </div>
        <div ref={thermo} className="jr-thermo" style={{ opacity: 0 }} aria-hidden><span>20 °C</span></div>
        <div ref={scaleBar} className="jr-scalebar" aria-hidden><span /><b /></div>
        <div ref={mag} className="jr-mag" aria-hidden><b>×1</b><span>{de ? 'Vergrößerung' : 'Magnification'}</span><i /></div>
        <div ref={ruler} className="jr-ruler" aria-hidden>
          {RULER_LABELS.map((l, i) => <span key={l} style={{ top: `${(i / (RULER_LABELS.length - 1)) * 92}%` }}>{l}</span>)}
          <i />
        </div>
        </>}
        {!bare && <div ref={acts} className="jr-acts" aria-hidden>
          {JOURNEY_ACTS.map((a, i) => i === 0 ? null : (
            <div key={i} data-act={i} style={{ visibility: 'hidden', opacity: 0 }}>
              <span>{ROMAN[i]} · {ACT_SCALE[i]}</span><b>{de ? a.de : a.en}</b>
            </div>
          ))}
        </div>}
        {setOpen && (
          <div ref={hots} className="jr-hots">
            {JOURNEY_HOTSPOTS.map((h, i) => (
              <button key={h.id} type="button" data-hs={i} className="jr-hs" style={{ visibility: 'hidden' }}
                aria-expanded={open === h.id} aria-label={(de ? 'Physik: ' : 'Physics: ') + (de ? h.titleDe : h.titleEn)}
                onClick={e => { e.stopPropagation(); setOpen(open === h.id ? null : h.id); }}>
                <span aria-hidden>+</span><em>{de ? h.titleDe : h.titleEn}</em>
              </button>
            ))}
          </div>
        )}
        {extra}
      </div>
      {open && setOpen && (() => { const h = JOURNEY_HOTSPOTS.find(x => x.id === open); return h ? <HotspotCard h={h} de={de} onClose={() => setOpen(null)} /> : null; })()}
      {rail}
    </div>
  );
}

function BeatText({ i, de, onBeweis }: { i: number; de: boolean; onBeweis?: () => void }) {
  if (i === RESULT) {
    const w = waxVsOil.watts, l = waxVsOil.life;
    return (
      <>
        <p className="jr-eyebrow">{de ? 'Das Ergebnis' : 'The result'}</p>
        <h3 className="jr-title">{de ? 'Weniger Verlust, längere Laufzeit.' : 'Less loss, longer life.'}</h3>
        <div className="jr-result">
          <p><b>{w.wax[0]}–{w.wax[1]} W</b><span>{de ? `statt ${w.oil[0]}–${w.oil[1]} W Reibungsverlust in der Kette` : `instead of ${w.oil[0]}–${w.oil[1]} W friction loss in the chain`}</span></p>
          <p><b>{l.waxLo}–{l.wax}×</b><span>{de ? 'typische Kettenlaufzeit gegenüber Öl' : 'typical chain life versus oil'}</span></p>
        </div>
        <p className="jr-body jr-note">{de ? `Wattzahlen: Laborwerte von Zero Friction Cycling bei ${w.inputW} W Tretleistung, nicht selbst gemessen.` : `Watts: lab values from Zero Friction Cycling at ${w.inputW} W input, not our own measurement.`}</p>
        {onBeweis && <button type="button" className="jr-link" onClick={onBeweis}>{de ? 'Wie das gemessen wurde ↓' : 'How it was measured ↓'}</button>}
      </>
    );
  }
  const t = JOURNEY_BEATS[i];
  return (
    <>
      <p className="jr-eyebrow">{de ? t.eyebrowDe : t.eyebrowEn}</p>
      <h3 className="jr-title">{de ? t.titleDe : t.titleEn}</h3>
      <p className="jr-body">{de ? t.bodyDe : t.bodyEn}</p>
    </>
  );
}

// ─── Reise mit Scroll ────────────────────────────────────────────────────────
export function Journey({ de, onBeweis }: { de: boolean; onBeweis: () => void }) {
  const [reduce] = useState(prefersReducedMotion);
  if (reduce) return <JourneyStatic de={de} onBeweis={onBeweis} />;
  return <JourneyScroll de={de} onBeweis={onBeweis} />;
}

function JourneyScroll({ de, onBeweis }: { de: boolean; onBeweis: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<StageApi>(null);
  const [pos, setPos] = useState({ beat: 0, phase: 0 });
  const [open, setOpen] = useState<string | null>(null);
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);

  // Karte schliesst per Esc und sobald ihr Takt-Fenster verlassen ist.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const scope = useMemo(() => scopeFor(pos.beat, pos.phase), [pos.beat, pos.phase]);

  const [idle, setIdle] = useState(false);
  const [nudge, setNudge] = useState(false);

  useLayoutEffect(() => {
    let raf = 0, shown = -1, target = 0, last = 0, lastKey = '';
    // Leerlauf-Vorschau: Kette laeuft von selbst aufs Blatt. `base` ist der
    // Drehwinkel, `resid` der Rest ueber einem Vielfachen von zwei Teilungen,
    // der beim Losscrollen bis b = 0,8 ausklingt. Zwei Teilungen weiter sieht
    // die Kette identisch aus, darum passt das Gelenk bei b = 1 wieder genau.
    const fx = { base: 0, resid: 0, breathe: 0, t: 0 };
    let lastInput = performance.now(), idleRaf = 0, idleOn = false, idleLast = 0, bNow = 0;
    const fxAt = (b: number) => ({ spin: fx.base + fx.resid * (1 - smooth(0, 0.8, b)), breathe: fx.breathe });
    const read = () => {
      const el = track.current; if (!el) return;
      const r = el.getBoundingClientRect();
      target = clamp01(-r.top / (r.height - window.innerHeight));
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16.7; last = now;
      // Grosse Spruenge (Sprungmarke, Neuladen mitten in der Seite) nicht
      // nachziehen, sonst faehrt die Kamera sekundenlang hinterher.
      if (shown < 0 || Math.abs(target - shown) > 0.2) shown = target;
      else shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.7));
      if (Math.abs(target - shown) < 0.00004) shown = target;
      const b = beatAt(shown * UNITS); bNow = b;
      if (!idleOn && fx.breathe > 0) { fx.breathe *= Math.pow(0.9, dt / 16.7); if (fx.breathe < 0.002) fx.breathe = 0; }
      stage.current?.render(b, fxAt(b));
      const oh = openRef.current && JOURNEY_HOTSPOTS.find(h => h.id === openRef.current);
      if (oh && (b < oh.from - 0.05 || b > oh.to + 0.05)) setOpen(null);
      const beat = Math.min(BEATS.length - 1, Math.floor(b)), phase = b - beat >= 0.5 ? 1 : 0;
      const key = `${beat}.${phase}`;
      if (key !== lastKey) { lastKey = key; setPos({ beat, phase }); }
      if (shown !== target || (!idleOn && fx.breathe > 0)) raf = requestAnimationFrame(frame); else last = 0;
    };
    const idleFrame = (now: number) => {
      idleRaf = 0;
      if (!idleOn) return;
      const dt = idleLast ? Math.min(64, now - idleLast) : 16.7; idleLast = now;
      fx.t += dt / 1000;
      const ramp = smooth(0, 1.6, fx.t);
      fx.base += (dt / 1000) * DELTA * 0.9 * ramp;
      fx.breathe = ramp * (0.5 - 0.5 * Math.cos(fx.t * 0.9));
      stage.current?.render(bNow, fxAt(bNow));
      idleRaf = requestAnimationFrame(idleFrame);
    };
    const startIdle = () => {
      if (idleOn) return;
      idleOn = true; idleLast = 0; fx.t = 0;
      fx.base = fxAt(bNow).spin; fx.resid = 0;
      setIdle(true);
      idleRaf = requestAnimationFrame(idleFrame);
    };
    const stopIdle = () => {
      if (!idleOn) return;
      idleOn = false; cancelAnimationFrame(idleRaf); idleRaf = 0;
      const k = 2 * DELTA, r = Math.round(fx.base / k) * k;
      fx.resid = fx.base - r; fx.base = r;
      setIdle(false);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onInput = () => { lastInput = performance.now(); stopIdle(); setNudge(false); };
    const tick = window.setInterval(() => {
      const quiet = performance.now() - lastInput;
      if (document.hidden) return;
      if (quiet > 3000 && bNow < 0.12 && shown === target) startIdle();
      if (quiet > 8000 && bNow > 0.4 && bNow < RESULT - 0.3 && shown === target) setNudge(true);
    }, 400);
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    inputs.forEach(e => window.addEventListener(e, onInput, { passive: true }));
    const kick = () => { read(); if (Math.abs(target - shown) > 1e-5) onInput(); if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { stage.current?.measure(); shown = -1; kick(); };
    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', kick); window.removeEventListener('resize', onResize);
      inputs.forEach(e => window.removeEventListener(e, onInput));
      window.clearInterval(tick); cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf);
    };
  }, []);

  // Der schwebende Nach-oben-Knopf lag am Handy ueber dem Text.
  useEffect(() => {
    const el = track.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => document.documentElement.toggleAttribute('data-lab-active', e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => { io.disconnect(); document.documentElement.removeAttribute('data-lab-active'); };
  }, []);

  const go = (beat: number) => {
    const el = track.current; if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const u = CUM[beat] + BEATS[beat].weight * 0.55;
    window.scrollTo({ top: top + (u / UNITS) * (el.offsetHeight - window.innerHeight), behavior: 'smooth' });
  };
  const act = ACT_START.filter(a => a <= pos.beat).length - 1;

  return (
    <div ref={track} className="jr-track" style={{ height: `calc(${(UNITS * UNIT_SVH).toFixed(0)}svh + 100svh)` }}>
      <Stage handle={stage} de={de} scope={scope} className="jr-stage" open={open} setOpen={setOpen}
        text={
          <div className="jr-text" aria-live="polite">
            {BEATS.map((_, i) => (
              <div key={i} data-beat={i} className="jr-beat" style={{ opacity: i === 0 ? 1 : 0 }} aria-hidden={i !== pos.beat}>
                <BeatText i={i} de={de} onBeweis={onBeweis} />
              </div>
            ))}
          </div>
        }
        extra={<>
          {pos.beat === 0 && (
            <p className="jr-hint" data-idle={idle || undefined} aria-hidden>
              <i className="jr-hint-ico" /><span className="jr-hint-txt">{de ? 'Scrollen, um hineinzufahren' : 'Scroll to zoom in'}</span>
            </p>
          )}
          {nudge && !open && pos.beat > 0 && pos.beat < RESULT && (
            <button type="button" className="jr-nudge" onClick={() => { setNudge(false); go(pos.beat + 1); }}>
              {de ? 'Weiter' : 'Next'} <span aria-hidden>↓</span>
            </button>
          )}
        </>}
        rail={
          <nav className="jr-rail" aria-label={de ? 'Akte der Reise' : 'Acts of the journey'}>
            {JOURNEY_ACTS.map((a, i) => (
              <button key={i} type="button" onClick={() => go(ACT_START[i])} aria-current={i === act ? 'step' : undefined}
                data-state={i === act ? 'on' : i < act ? 'past' : 'next'} className="jr-rail-item">
                <span>{de ? a.de : a.en}</span>
              </button>
            ))}
          </nav>
        }
      />
    </div>
  );
}

// ─── Ohne Bewegung: fuenf Standbilder mit Text ───────────────────────────────
const STILLS = [1.7, 3.6, 8.7, 10.9, RESULT + 0.5];

function StillFrame({ b, de, onBeweis }: { b: number; de: boolean; onBeweis: () => void }) {
  const stage = useRef<StageApi>(null);
  useLayoutEffect(() => {
    const run = () => { stage.current?.measure(); stage.current?.render(b); };
    run();
    window.addEventListener('resize', run);
    return () => window.removeEventListener('resize', run);
  }, [b]);
  return (
    <Stage handle={stage} de={de} scope={null} className="jr-still"
      text={<div className="jr-text jr-text--still"><div className="jr-beat"><BeatText i={Math.floor(b)} de={de} onBeweis={onBeweis} /></div></div>} />
  );
}

function JourneyStatic({ de, onBeweis }: { de: boolean; onBeweis: () => void }) {
  return (
    <div className="jr-static">
      {STILLS.map(b => <StillFrame key={b} b={b} de={de} onBeweis={onBeweis} />)}
    </div>
  );
}

// ─── Hero: dieselbe Welt als Standbild, die Kette laeuft ruhig ──────────────
// Bild 0 der Reise, gross. Die Linse zeigt das Gelenk B im Halbschnitt, also
// genau die Stelle, in die die Reise weiter unten hineinfaehrt.
const HERO_CAM: Cam = { fx: -4, fy: -RING_R * 0.34, w: 176, rot: 0 };
const LENS_CAM: Cam = { fx: PIN_B.x, fy: PIN_B.y - 0.35, w: 9.2, rot: 0 };

export function ChainringHero({ de }: { de: boolean }) {
  const ring = useRef<StageApi>(null);
  const lens = useRef<StageApi>(null);
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const still = prefersReducedMotion();
    let raf = 0, last = 0, spin = 0, on = false;
    const draw = () => { ring.current?.render(0.9, { spin, breathe: 0 }); lens.current?.render(2.6); };
    const loop = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16.7; last = now;
      spin += (dt / 1000) * DELTA * 0.55;
      ring.current?.render(0.9, { spin, breathe: 0 });
      raf = on ? requestAnimationFrame(loop) : 0;
    };
    const measureAll = () => { ring.current?.measure(); lens.current?.measure(); draw(); };
    measureAll();
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting && !still;
      if (on && !raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
    io.observe(el);
    window.addEventListener('resize', measureAll);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('resize', measureAll); };
  }, []);
  return (
    <div ref={box} className="sh-fig">
      <Stage handle={ring} de={de} scope={null} className="sh-ring" bare cam={HERO_CAM} />
      <div className="sh-lens" aria-hidden>
        <Stage handle={lens} de={de} scope={null} className="sh-lens-stage" bare cam={LENS_CAM} />
      </div>
      <p className="sh-lens-cap">{de ? 'Ein Gelenk im Schnitt: Bolzen, Kragen, Rolle. Dazwischen arbeitet der Film.' : 'One joint in section: pin, collar, roller. The film works in between.'}</p>
    </div>
  );
}
