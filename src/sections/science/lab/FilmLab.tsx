// ─── FilmLab — die Formel als Inszenierung im dunklen Labor ──────────────────
//
// Luca, 25.09.2026 (Runde 3): die vorige Fassung klebte als kleine Grafik
// oben, daneben scrollten Karten. Jetzt steht die Buehne ueber die volle
// Bildschirmhoehe fest und die Grafik gross in der Mitte; der Scroll steuert
// sie direkt:
//
//   0 Gelenk        Querschnitt durchs Kettengelenk (mm)
//   1 Hinein        die Kamera faehrt in den Spalt von Zone 01   (--z)
//   2 Erstarrung    der Film als Block, Lamellen wachsen mit dem Scroll (--grow)
//   3–8 Stoffe      Block dreht frontal (--tilt), rueckt nach links, rechts
//                   oeffnet das Mikroskop mit Zoom-Kegel vom Ort des Stoffs;
//                   "Ohne X" zeigt, was ohne ihn passiert
//   9 System        alle Verbindungen leuchten einmal nacheinander auf
//
// Technik: EIN passiver Scroll-Listener, pro Frame hoechstens einmal (rAF),
// schreibt --z/--grow/--tilt als CSS-Variablen auf die Buehne. Alles
// Bewegte laeuft ueber transform/opacity/stroke-dashoffset. React rendert nur
// beim Wechsel der Station neu. Ohne Bewegung (prefers-reduced-motion) gibt
// es keine Fixierung: der fertige Film mit Netz steht als Standbild da.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { COMPONENTS, EDGES, FORMULA_STORY } from '@/lib/science';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { type FieldKey } from '../WaxField';
import { LabFilm } from './LabFilm';
import { LabJoint } from './LabJoint';
import { NANO } from './NanoScenes';
import { useSceneClock } from './useSceneClock';

const FIELD_KEYS: FieldKey[] = ['kristallstruktur', 'matrix', 'winterformel', 'mos2', 'sedimentation', 'antioxidans'];
const ORDER = FORMULA_STORY
  .map(s => COMPONENTS.find(c => c.node === s.node)!)
  .filter(c => c && (FIELD_KEYS as string[]).includes(c.id));
const N = 3 + ORDER.length + 1;      // Gelenk, Hinein, Erstarrung, Stoffe, System
const FIRST = 3, SYSTEM = N - 1;
const STEP_VH = 72;                  // Scrollweg je Station

const SHORT: Record<FieldKey, { de: string; en: string }> = {
  kristallstruktur: {
    de: 'Das Gerüst. Paraffinketten stapeln sich zu Lamellen und tragen alle anderen Stoffe.',
    en: 'The scaffold. Paraffin chains stack into lamellae and carry every other substance.',
  },
  mos2: {
    de: 'Der Festschmierstoff. Seine Schichten gleiten unter Last und bauen am Stahl einen Transferfilm auf, auch im Stillstand.',
    en: 'The solid lubricant. Its layers glide under load and build a transfer film on the steel, even at standstill.',
  },
  matrix: {
    de: 'Das Härtemodul. Lange Ketten heben den Tropfpunkt auf ~75 °C, die Matrix bleibt bei Sommerwärme an Ort und Stelle.',
    en: 'The hardener. Long chains lift the drop point to ~75 °C, the matrix stays put in summer heat.',
  },
  winterformel: {
    de: 'Der Weichmacher. Er füllt die Zonen zwischen den Lamellen und hält den Film bis −8 °C biegsam.',
    en: 'The plasticiser. It fills the zones between lamellae and keeps the film flexible down to −8 °C.',
  },
  sedimentation: {
    de: 'Der Stabilisator. Eine sterische Hülle um jedes MoS₂-Partikel verhindert, dass es verklumpt und absinkt.',
    en: 'The stabiliser. A steric shell around each MoS₂ particle stops it clumping and settling.',
  },
  antioxidans: {
    de: 'Der Schutz. Ein Phenol fängt Radikale ab, bevor sie das Wachs oder das MoS₂ angreifen.',
    en: 'The guard. A phenol traps radicals before they attack the wax or the MoS₂.',
  },
};

const smooth = (a: number, b: number, v: number) => { const x = Math.max(0, Math.min(1, (v - a) / (b - a))); return x * x * (3 - 2 * x); };

function Scope({ k, de, without }: { k: FieldKey; de: boolean; without: boolean }) {
  const { t, ref } = useSceneClock(true, NANO[k].still);
  const sc = NANO[k].render(t, de, without);
  return (
    <>
      <svg ref={ref} viewBox="0 0 240 240" className="block w-full h-full" role="img" aria-label={sc.cap}>
        <defs>
          <clipPath id="lab-scope-clip"><circle cx="120" cy="120" r="118" /></clipPath>
          <radialGradient id="lab-scope-bg" cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#141922" /><stop offset="1" stopColor="#07090C" />
          </radialGradient>
          <radialGradient id="lab-scope-vig" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.72" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" />
          </radialGradient>
        </defs>
        <g clipPath="url(#lab-scope-clip)">
          <rect width="240" height="240" fill="url(#lab-scope-bg)" />
          {sc.art}
          <rect width="240" height="240" fill="url(#lab-scope-vig)" />
        </g>
        <circle cx="120" cy="120" r="118.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" />
      </svg>
      <p className="lab-scope-cap">{sc.cap}</p>
    </>
  );
}

export function FilmLab({ de, onDetails }: { de: boolean; onDetails: () => void }) {
  const [reduce] = useState(prefersReducedMotion);
  const [station, setStation] = useState(reduce ? SYSTEM : 0);
  const [without, setWithout] = useState<FieldKey | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const [cone, setCone] = useState<{ k: FieldKey; ax: number; ay: number; x1: number; y1: number; x2: number; y2: number } | null>(null);

  // ── Scroll → CSS-Variablen ────────────────────────────────────────────────
  useEffect(() => {
    if (reduce) return;
    let raf = 0, last = -1;
    const tick = () => {
      raf = 0;
      const el = track.current, st = stage.current;
      if (!el || !st) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / total));
      const s = Math.min(N - 1, Math.floor(p * N));
      const sp = p * N - s;
      const z = s < 1 ? 0 : s > 1 ? 1 : smooth(0.05, 0.95, sp);
      const grow = s < 2 ? 0 : s > 2 ? 1 : Math.min(1, sp * 1.3);
      const tilt = s <= 2 ? 1 : s === FIRST ? 1 - smooth(0, 0.4, sp) : 0;
      st.style.setProperty('--z', z.toFixed(4));
      st.style.setProperty('--grow', grow.toFixed(4));
      st.style.setProperty('--tilt', tilt.toFixed(4));
      st.style.setProperty('--p', p.toFixed(4));
      // "Ohne X" gilt nur fuer die Station, in der es eingeschaltet wurde.
      if (s !== last) { last = s; setStation(s); setWithout(null); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [reduce]);

  const inComp = station >= FIRST && station < SYSTEM;
  const comp = inComp ? ORDER[station - FIRST] : null;
  const focus = comp ? (comp.id as FieldKey) : null;

  // ── Zoom-Kegel vom Ort des Stoffs zum Mikroskop, nachdem die Buehne steht ─
  useLayoutEffect(() => {
    if (!focus) return;
    const measure = () => {
      const v = view.current, sc = scopeRef.current;
      const a = v?.querySelector<SVGCircleElement>('[data-lab-focus]');
      if (!v || !sc || !a) return;
      const vr = v.getBoundingClientRect(), ar = a.getBoundingClientRect(), sr = sc.getBoundingClientRect();
      const ax = ar.left + ar.width / 2 - vr.left, ay = ar.top + ar.height / 2 - vr.top;
      const cx = sr.left + sr.width / 2 - vr.left, cy = sr.top + sr.height / 2 - vr.top, R = sr.width / 2;
      // Tangentenpunkte vom Anker an den Kreis: Winkel theta ± acos(R/d)
      const th = Math.atan2(ay - cy, ax - cx), d = Math.hypot(ax - cx, ay - cy);
      const be = Math.acos(Math.min(0.99, R / d));
      setCone({ k: focus, ax, ay, x1: cx + R * Math.cos(th + be), y1: cy + R * Math.sin(th + be), x2: cx + R * Math.cos(th - be), y2: cy + R * Math.sin(th - be) });
    };
    const t = window.setTimeout(measure, 720);
    window.addEventListener('resize', measure);
    return () => { window.clearTimeout(t); window.removeEventListener('resize', measure); };
  }, [focus, station]);

  const go = (i: number) => {
    const el = track.current; if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / N) * total, behavior: 'smooth' });
  };

  // ── Texte je Station ──────────────────────────────────────────────────────
  let eyebrow = '', title = '', body = '';
  if (station === 0) {
    eyebrow = de ? 'Maßstab 1 mm' : 'Scale 1 mm';
    title = de ? 'Im Spalt, wo es am härtesten reibt.' : 'In the gap where it rubs hardest.';
    body = de ? 'Ein Kettengelenk im Querschnitt. Zwischen Bolzen und Laschenschulter liegt Zone 01, der Spalt mit dem höchsten Druck. Genau dort muss der Film halten.'
      : 'A chain joint in section. Between pin and plate shoulder lies zone 01, the gap with the highest pressure. That is where the film has to hold.';
  } else if (station === 1) {
    eyebrow = de ? 'Tausendfach näher' : 'A thousand times closer';
    title = de ? 'Hinein in den Spalt.' : 'Into the gap.';
    body = de ? 'Zwischen Bolzen und Schulter liegt ein Wachsfilm, etwa einen Mikrometer dick.' : 'Between pin and shoulder sits a wax film, about one micrometre thick.';
  } else if (station === 2) {
    eyebrow = de ? 'Maßstab ~1 µm' : 'Scale ~1 µm';
    title = de ? 'So erstarrt der Film.' : 'How the film solidifies.';
    body = de ? 'Beim Abkühlen keimt das Wachs am Stahl und wächst in Fächern nach oben. Dort, wo zwei Fächer zusammenstoßen, bleiben amorphe Keile.'
      : 'As it cools, the wax nucleates on the steel and grows upward in fans. Where two fans meet, amorphous wedges remain.';
  } else if (comp) {
    const i = station - FIRST;
    eyebrow = `0${i + 1} · ${de ? comp.roleDe : comp.roleEn} · ${comp.metric}`;
    title = de ? comp.nameDe : comp.nameEn;
    body = de ? SHORT[comp.id as FieldKey].de : SHORT[comp.id as FieldKey].en;
  } else {
    eyebrow = de ? 'Das System' : 'The system';
    title = de ? 'Sechs Stoffe, zehn Verbindungen, ein Film.' : 'Six substances, ten links, one film.';
    body = de ? 'Keine Zutat arbeitet allein. Die Linien zeigen, wer wen stützt: durchgezogen baut auf, gestrichelt schützt, gelb sind die Gegenspieler.'
      : 'No ingredient works alone. The lines show who supports whom: solid builds, dashed protects, yellow marks the counterparts.';
  }

  const canRemove = !!comp && comp.id !== 'kristallstruktur';
  const net: 'focus' | 'all' | 'none' = station === SYSTEM ? 'all' : focus ? 'focus' : 'none';

  return (
    <div ref={track} className="lab-track" data-reduce={reduce || undefined}
      style={reduce ? undefined : { height: `calc(${N * STEP_VH}svh + 100svh)` }}>
      <div ref={stage} className="lab-stage" data-station={station} data-split={!!focus || undefined}>
        <div ref={view} className="lab-view">
          {!reduce && station <= 2 && <div className="lab-joint-wrap"><LabJoint de={de} /></div>}
          <div className="lab-filmwrap">
            <div className="lab-persp">
              {/* Im "Ohne"-Zustand steht der ganze Film unabgedunkelt da: man soll
                  sehen, was kaputtgeht, nicht einen hervorgehobenen Stoff. */}
              <LabFilm de={de} focus={without ? null : focus} without={without} net={without ? 'none' : net} />
            </div>
          </div>
          {cone && cone.k === focus && (
            <svg className="lab-cone" aria-hidden>
              <path d={`M ${cone.ax} ${cone.ay} L ${cone.x1} ${cone.y1} L ${cone.x2} ${cone.y2} Z`} fill="rgba(169,196,230,0.07)" />
              <line x1={cone.ax} y1={cone.ay} x2={cone.x1} y2={cone.y1} stroke="rgba(169,196,230,0.55)" strokeWidth="1" />
              <line x1={cone.ax} y1={cone.ay} x2={cone.x2} y2={cone.y2} stroke="rgba(169,196,230,0.55)" strokeWidth="1" />
            </svg>
          )}
          <div ref={scopeRef} className="lab-scope" data-on={!!focus || undefined}>
            {focus && <Scope key={`${focus}-${without ? 'x' : 'o'}`} k={focus} de={de} without={without === focus} />}
            <span className="lab-scope-scale">nm</span>
          </div>
        </div>

        {/* Text zur Station */}
        <div className="lab-panel" key={station} aria-live="polite">
          <p className="lab-panel-eyebrow">{eyebrow}</p>
          <h3 className="lab-panel-title">{title}</h3>
          <p className="lab-panel-body">{body}</p>
          {comp && (
            <ul className="lab-mesh" aria-label={de ? 'Wirkt zusammen mit' : 'Works together with'}>
              {EDGES.filter(e => e.from === comp.node || e.to === comp.node).map((e, j) => {
                const other = COMPONENTS.find(c => c.node === (e.from === comp.node ? e.to : e.from));
                if (!other) return null;
                return (
                  <li key={j} data-balance={e.balance || undefined}>
                    <b>{de ? other.graphLabelDe : other.graphLabelEn}</b> {e.balance ? '⇄' : '·'} {de ? e.labelDe : e.labelEn}
                  </li>
                );
              })}
            </ul>
          )}
          {canRemove && comp && (
            <button type="button" className="lab-without" aria-pressed={without === comp.id}
              onClick={() => setWithout(w => (w === comp.id ? null : (comp.id as FieldKey)))}>
              <span className="lab-switch" aria-hidden />
              {de ? `Ohne ${comp.graphLabelDe}` : `Without ${comp.graphLabelEn}`}
            </button>
          )}
          {station === SYSTEM && (
            <button type="button" className="lab-link" onClick={onDetails}>
              {de ? 'Die sechs Stoffe im Detail ↓' : 'The six substances in detail ↓'}
            </button>
          )}
        </div>

        {/* Stationen */}
        {!reduce && (
          <nav className="lab-rail" aria-label={de ? 'Stationen' : 'Stations'}>
            {Array.from({ length: N }, (_, i) => {
              const label = i === 0 ? (de ? 'Gelenk' : 'Joint') : i === 1 ? (de ? 'Hinein' : 'Zoom') : i === 2 ? (de ? 'Erstarrung' : 'Solidify')
                : i === SYSTEM ? (de ? 'System' : 'System') : (de ? ORDER[i - FIRST].graphLabelDe : ORDER[i - FIRST].graphLabelEn);
              return (
                <button key={i} type="button" onClick={() => go(i)} aria-current={i === station ? 'step' : undefined}
                  data-state={i === station ? 'on' : i < station ? 'past' : 'next'} className="lab-rail-dot">
                  <span className="lab-rail-label">{label}</span>
                </button>
              );
            })}
          </nav>
        )}
        {!reduce && <div className="lab-progress" aria-hidden />}
      </div>
    </div>
  );
}
