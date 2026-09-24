// ─── Buehne der Formelreise: Gelenk, Kamerafahrt, Nano-Lupe ─────────────────
//
// Drei echte Massstaebe hintereinander, damit der Film nicht aus dem Nichts
// kommt: erst das Kettengelenk im Querschnitt (mm, dieselben Ringe wie die
// Lupe von FrictionLens), dann faehrt die Kamera in den Spalt von Zone 01
// (Bolzen gegen Laschenschulter) und dort liegt der Film (~1 µm, WaxField).
// Die Nano-Lupe setzt am Ort des gerade erzaehlten Stoffs an und zeigt den
// Vorgang im Molekuelmassstab (NanoScenes).
//
// Die Kamerafahrt ist ein CSS-Uebergang auf transform/opacity, kein
// Scroll-Scrub: sie laeuft einmal, wenn die Karte wechselt, und kostet
// sonst nichts.

import { createPortal } from 'react-dom';
import { NANO } from './NanoScenes';
import { useSceneClock } from './useSceneClock';
import { FIELD_ANCHORS, FIELD_VB, type FieldKey } from '../WaxField';

// Zone 01 im Gelenkschnitt: der innere Wachsring zwischen Bolzen (r 38) und
// Laschenschulter (r 76), rechts vom Mittelpunkt. Dorthin zoomt die Kamera.
const J = { cx: 260, cy: 150 };
const ZOOM_AT = { x: J.cx + 42, y: J.cy };

export function JointLayer({ de, zoomed }: { de: boolean; zoomed: boolean }) {
  return (
    <div className="journey-joint" data-zoomed={zoomed || undefined}
      style={{ transformOrigin: `${(ZOOM_AT.x / FIELD_VB.w) * 100}% ${(ZOOM_AT.y / FIELD_VB.h) * 100}%` }}>
      <svg viewBox={`0 0 ${FIELD_VB.w} ${FIELD_VB.h}`} className="w-full h-full" role="img"
        aria-label={de ? 'Querschnitt durch ein Kettengelenk: Rolle, Laschenschulter, Bolzen, dazwischen zwei Wachsspalte.' : 'Cross-section through a chain joint: roller, plate shoulder, pin, with two wax gaps between.'}>
        <circle cx={J.cx} cy={J.cy} r="140" fill="#101318" />
        <circle cx={J.cx} cy={J.cy} r="118" fill="#3B424C" stroke="#A9B2BD" strokeWidth="1.7" />
        <circle cx={J.cx} cy={J.cy} r="84" fill="#5685C0" />
        <circle cx={J.cx} cy={J.cy} r="76" fill="#2F353E" stroke="#A9B2BD" strokeWidth="1.7" />
        <circle cx={J.cx} cy={J.cy} r="46" fill="#5685C0" className="journey-zone1" />
        <circle cx={J.cx} cy={J.cy} r="38" fill="#C9D1DA" stroke="#8C959F" strokeWidth="1.7" />
        <circle cx={ZOOM_AT.x} cy={ZOOM_AT.y} r="11" fill="none" stroke="#fff" strokeWidth="1.6" className="journey-target" />
      </svg>
      <span className="journey-jl" style={{ left: '50%', top: '50%', color: '#2A2F36' }}>{de ? 'Bolzen' : 'Pin'}</span>
      <span className="journey-jl" style={{ left: '50%', top: '70%' }}>{de ? 'Laschenschulter' : 'Plate shoulder'}</span>
      <span className="journey-jl" style={{ left: '50%', top: '84%' }}>{de ? 'Rolle' : 'Roller'}</span>
      <span className="journey-jl journey-jl--hot" style={{ left: `${(ZOOM_AT.x / FIELD_VB.w) * 100 + 9}%`, top: '44%' }}>
        {de ? 'Zone 01 · hier liegt der Film' : 'Zone 01 · the film is here'}
      </span>
    </div>
  );
}

/** Die runde Nano-Lupe, gegenueber vom Anker ihres Stoffs, mit Fuehrungslinie. */
/** capSlot: Element unter der Buehne, in das die Beschriftung der Lupe
 *  gerendert wird — unter der Lupe selbst verdeckte sie den Film. */
export function NanoLens({ k, de, active, capSlot }: { k: FieldKey; de: boolean; active: boolean; capSlot: HTMLElement | null }) {
  const { t, ref } = useSceneClock(active, NANO[k].still);
  const sc = NANO[k].render(t, de);
  const a = FIELD_ANCHORS[k];
  const right = a.x < FIELD_VB.w * 0.5;
  // Lupe: 44 % der Buehnenbreite, oben, auf der Gegenseite des Ankers. In
  // dieser Station ist sie die Hauptfigur, der Film ist Kontext.
  const d = 0.44 * FIELD_VB.w;
  const cx = right ? FIELD_VB.w - 10 - d / 2 : 10 + d / 2;
  const cy = 6 + d / 2;
  const ang = Math.atan2(a.y - cy, a.x - cx);
  const ex = cx + Math.cos(ang) * (d / 2), ey = cy + Math.sin(ang) * (d / 2);
  return (
    <>
      <svg viewBox={`0 0 ${FIELD_VB.w} ${FIELD_VB.h}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke="var(--tx1)" strokeWidth="1.2" strokeDasharray="3 3" className="journey-lead" />
        <circle cx={a.x} cy={a.y} r="9" fill="none" stroke="var(--tx1)" strokeWidth="1.4" />
      </svg>
      <div className="journey-lens" style={{ width: '44%', top: '2%', [right ? 'right' : 'left']: `${(10 / FIELD_VB.w) * 100}%` }}>
        <svg ref={ref} viewBox="0 0 200 200" className="block w-full h-auto" role="img" aria-label={sc.cap}>
          <defs><clipPath id={`nl-${k}`}><circle cx="100" cy="100" r="97" /></clipPath></defs>
          <g clipPath={`url(#nl-${k})`}>
            <rect width="200" height="200" fill="var(--sf)" />
            {sc.art}
          </g>
          <circle cx="100" cy="100" r="97" fill="none" stroke="var(--tx1)" strokeWidth="2.4" />
        </svg>
        <span className="journey-scale">nm</span>
      </div>
      {capSlot && createPortal(<><b>{de ? 'In der Lupe: ' : 'In the loupe: '}</b>{sc.cap}</>, capSlot)}
    </>
  );
}
