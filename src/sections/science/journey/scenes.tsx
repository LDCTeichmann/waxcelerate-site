// ─── Szenen der Formel-Reise ─────────────────────────────────────────────────
//
// Drei Ebenen in EINEM SVG, jede in ihren eigenen Einheiten gezeichnet:
//   ChainLayer    Welt in mm: Kettenblatt und Kette (bewegt sich, siehe
//                 Journey.tsx → setChain)
//   JointLayer    Welt in mm: dieselbe Kette, stehend und durchleuchtet,
//                 dazu die drei Reibstellen an Bolzen B
//   ContactLayer  Kontaktrahmen in µm: Spalt, Oel/Wachs, der Film
//
// Journey.tsx setzt pro Frame nur die transform-Matrix jeder Ebene und ein
// paar CSS-Variablen auf der Buehne. Alles, was sich hier bewegt, liest diese
// Variablen (opacity, stroke-dashoffset, CSS-transform). React rendert die
// Szenen genau einmal.
//
// Farben: Metall bleibt grau, Blau ist ausschliesslich Wachs, Bernstein Oel,
// Orange ist Schaden (Kontakt, Riss, Radikal). Dieselbe Sprache wie auf den
// Produktseiten.

import { memo, useState } from 'react';
import {
  PINS_F, PIN_B, PIN_A, CONTACT, PIN_R, COLLAR_R, ROLLER_R, OUTER_PLATE, INNER_PLATE, RING_PATH, RING_R, PITCH,
  RING_HOLE, RING_INNER_R, BCD_R, SPIDER_ARM, ROOT_R, rng,
  PIN_SURFACE, BORE_SURFACE, PIN_BODY, BORE_BODY, FILM_BAND, PLATES, NEEDLES, FLAKES, PEAKS, CRACKS, ANTIOX, RADICALS, GRIT,
  pinY, boreY,
} from './geometry';

/** Anzahl Glied-Plaetze der bewegten Kette (pinsAt liefert 34 Bolzen). */
export const LINK_SLOTS = 33;
const v = (name: string) => `var(--${name})`;
const hexPath = (w: number, h: number) => { const c = h * 0.7; return `M${-w / 2} 0 L${-w / 2 + c} ${-h / 2} L${w / 2 - c} ${-h / 2} L${w / 2} 0 L${w / 2 - c} ${h / 2} L${-w / 2 + c} ${h / 2} Z`; };

// ─── Gemeinsame Verlaeufe ────────────────────────────────────────────────────
export function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* Aussenlasche: gewalzter Stahl, oben Streiflicht, unten Eigenschatten */}
      <linearGradient id={`${id}-plate-o`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E6EBF1" /><stop offset="0.16" stopColor="#AEB7C2" /><stop offset="0.48" stopColor="#6E7783" />
        <stop offset="0.8" stopColor="#414852" /><stop offset="1" stopColor="#272C32" />
      </linearGradient>
      <linearGradient id={`${id}-plate-i`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9AA3AF" /><stop offset="0.45" stopColor="#555D68" /><stop offset="1" stopColor="#1E2227" />
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.12" /><stop offset="1" stopColor="#000000" stopOpacity="0.5" />
      </linearGradient>
      {/* Nietkopf: gestauchter Rand dunkel, Stirnflaeche hell, ein Glanzpunkt */}
      <radialGradient id={`${id}-pin`} cx="0.36" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.35" stopColor="#D5DCE4" /><stop offset="1" stopColor="#6F7985" />
      </radialGradient>
      <radialGradient id={`${id}-rivet`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.7" stopColor="#3B424B" /><stop offset="0.92" stopColor="#1B1F24" /><stop offset="1" stopColor="#0E1013" />
      </radialGradient>
      <radialGradient id={`${id}-roller`} cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#7C8591" /><stop offset="1" stopColor="#2A2F36" />
      </radialGradient>
      <linearGradient id={`${id}-anod`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3A414B" /><stop offset="0.5" stopColor="#1C2026" /><stop offset="1" stopColor="#0F1216" />
      </linearGradient>
      <radialGradient id={`${id}-bolt`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#E9EEF3" /><stop offset="0.55" stopColor="#8B95A1" /><stop offset="1" stopColor="#3A414A" />
      </radialGradient>
      <radialGradient id={`${id}-hub`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#07080A" /><stop offset="0.55" stopColor="#101317" /><stop offset="1" stopColor="#252A31" />
      </radialGradient>
      <linearGradient id={`${id}-steel-down`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B7C0CB" /><stop offset="0.015" stopColor="#6A7380" /><stop offset="0.12" stopColor="#434A54" /><stop offset="0.5" stopColor="#262A30" />
      </linearGradient>
      <linearGradient id={`${id}-steel-up`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#A9B2BE" /><stop offset="0.015" stopColor="#5B6470" /><stop offset="0.12" stopColor="#3A414A" /><stop offset="0.5" stopColor="#202328" />
      </linearGradient>
      <linearGradient id={`${id}-mos`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EEF2F6" /><stop offset="0.5" stopColor="#9AA4B1" /><stop offset="1" stopColor="#4B535E" />
      </linearGradient>
      <pattern id={`${id}-hatch`} width="0.45" height="0.45" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="0.45" stroke="#F2C94C" strokeWidth="0.12" />
      </pattern>
      {/* Schnittschraffur nach DIN ISO 128: benachbarte Teile gegenlaeufig
          bzw. mit anderem Abstand, damit man sie als getrennte Koerper liest. */}
      <pattern id={`${id}-sec-pin`} width="0.22" height="0.22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="0.22" stroke="rgba(255,255,255,0.42)" strokeWidth="0.045" />
      </pattern>
      <pattern id={`${id}-sec-collar`} width="0.26" height="0.26" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
        <line x1="0" y1="0" x2="0" y2="0.26" stroke="rgba(255,255,255,0.4)" strokeWidth="0.045" />
      </pattern>
      <pattern id={`${id}-sec-roller`} width="0.38" height="0.38" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="0.38" stroke="rgba(255,255,255,0.36)" strokeWidth="0.045" />
      </pattern>
      <clipPath id={`${id}-film`}><path d={FILM_BAND} /></clipPath>
      <clipPath id={`${id}-ringclip`}><path data-ring-clip d={`${RING_PATH} ${RING_HOLE}`} clipRule="evenodd" /></clipPath>
      <clipPath id={`${id}-upper`}><rect x={PIN_B.x - 6} y={PIN_B.y - 6} width="12" height="6" /></clipPath>
      <clipPath id={`${id}-lower`}><rect x={PIN_B.x - 6} y={PIN_B.y} width="12" height="6" /></clipPath>
    </defs>
  );
}

/** Gebuerstetes Blatt: einmal auf Canvas gerechnet, als Bild eingesetzt.
 *  Konzentrische Schleifspuren plus zwei Glanzkeulen, wie sie drehend
 *  geschliffenes Aluminium unter einer Lichtquelle zeigt. Das Bild dreht NICHT
 *  mit, nur seine Maske: so bleibt das Licht stehen, waehrend das Blatt laeuft. */
let brushedCache: string | null | undefined;
function makeBrushed(): string | null {
  const N = 1200, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); if (!g || !('createConicGradient' in g)) return null;
  const m = N / 2;
  const cg = g.createConicGradient(-Math.PI / 4, m, m);
  const stops: [number, string][] = [[0, '#D3DAE2'], [0.08, '#8C96A2'], [0.2, '#4A525C'], [0.32, '#3A414A'], [0.45, '#7F8995'],
    [0.5, '#C2CAD3'], [0.58, '#7E8894'], [0.7, '#3C434C'], [0.83, '#454D57'], [0.93, '#8B95A1'], [1, '#D3DAE2']];
  stops.forEach(([o, col]) => cg.addColorStop(o, col));
  g.fillStyle = cg; g.fillRect(0, 0, N, N);
  const r = rng(1234);
  for (let rad = 2; rad < m; rad += 0.9) {
    g.beginPath(); g.arc(m, m, rad, 0, Math.PI * 2);
    g.strokeStyle = r() > 0.5 ? `rgba(255,255,255,${(r() * 0.07).toFixed(3)})` : `rgba(0,0,0,${(r() * 0.12).toFixed(3)})`;
    g.lineWidth = 0.7; g.stroke();
  }
  return c.toDataURL('image/jpeg', 0.86);
}
/** Einmal pro Seitenaufruf gerechnet, von allen Buehnen geteilt. */
function useBrushed() {
  const [url] = useState(() => {
    if (typeof document === 'undefined') return null;
    if (brushedCache === undefined) brushedCache = makeBrushed();
    return brushedCache;
  });
  return url;
}

// ─── Kette am Kettenblatt (bewegt) ───────────────────────────────────────────
const TIP_OUT = RING_R + 4.2;
const BOLTS = Array.from({ length: 5 }, (_, i) => (i / 5) * 360 + 36);
const torx = (r: number) => Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2, rr = i % 2 ? r * 0.62 : r;
  return `${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`;
}).join(' ');
/** Schatten der Kette auf dem Blatt: Licht von oben links. Statisch, weil die
 *  Kette immer auf demselben Bogen liegt; drei weiche Striche statt Filter. */
const SHADOW = (() => {
  const end = (150 * Math.PI) / 180;
  return `M-320 ${-RING_R} L0 ${-RING_R} A${RING_R} ${RING_R} 0 0 1 ${RING_R * Math.sin(end)} ${-RING_R * Math.cos(end)}`;
})();

export const ChainLayer = memo(function ChainLayer({ id }: { id: string }) {
  const slots = Array.from({ length: LINK_SLOTS }, (_, i) => i);
  const brushed = useBrushed();
  return (
    <g data-layer="chain">
      <g data-ring>
        <path d={`${RING_PATH} ${RING_HOLE}`} fillRule="evenodd" fill="#5A626D" />
      </g>
      {brushed && <image href={brushed} x={-TIP_OUT} y={-TIP_OUT} width={TIP_OUT * 2} height={TIP_OUT * 2} clipPath={`url(#${id}-ringclip)`} preserveAspectRatio="none" />}
      <g data-ring>
        {/* Fase an Zahn und Innenkante: Streiflicht */}
        <path d={`${RING_PATH} ${RING_HOLE}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.4" />
        <path d={`${RING_PATH} ${RING_HOLE}`} fill="none" stroke="rgba(240,245,250,0.55)" strokeWidth="0.22" />
        {/* Gefraeste Stufe unterhalb der Zahnwurzel */}
        <circle r={ROOT_R - 5} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="0.5" />
        <circle r={ROOT_R - 5.35} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.18" />
        <circle r={RING_INNER_R + 0.3} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="0.6" />
        <text y={ROOT_R - 8.5} textAnchor="middle" fontSize="3" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontWeight="600"
          fill="rgba(20,24,29,0.32)" letterSpacing="0.6" transform="rotate(180)">40T · BCD 110</text>
        {/* Spider: fuenf Arme, Nabe, Bohrung der Achse */}
        {BOLTS.map(a => (
          <path key={a} d={SPIDER_ARM} transform={`rotate(${a - 180})`} fill={`url(#${id}-anod)`} stroke="rgba(255,255,255,0.16)" strokeWidth="0.3" />
        ))}
        <circle r="24" fill={`url(#${id}-anod)`} stroke="rgba(255,255,255,0.14)" strokeWidth="0.3" />
        <circle r="12" fill={`url(#${id}-hub)`} stroke="rgba(0,0,0,0.6)" strokeWidth="0.5" />
        {/* Kettenblattschrauben, Torx T30 */}
        {BOLTS.map(a => {
          const t = ((a - 180) * Math.PI) / 180, x = -BCD_R * Math.sin(t), y = BCD_R * Math.cos(t);
          return (
            <g key={a} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
              <circle r="4.6" fill="rgba(0,0,0,0.45)" transform="translate(0.35 0.5)" />
              <circle r="4.4" fill={`url(#${id}-bolt)`} stroke="rgba(0,0,0,0.5)" strokeWidth="0.2" />
              <polygon points={torx(1.7)} fill="#15181C" />
            </g>
          );
        })}
      </g>
      {/* Schatten der Kette */}
      <g transform="translate(0.9 1.5)" fill="none" stroke="#000" strokeLinecap="round">
        <path d={SHADOW} strokeWidth="11" strokeOpacity="0.14" />
        <path d={SHADOW} strokeWidth="9" strokeOpacity="0.18" />
        <path d={SHADOW} strokeWidth="7.4" strokeOpacity="0.22" />
      </g>
      <g data-inner>
        {slots.map(i => (
          <g key={i} data-slot={i}>
            <path d={INNER_PLATE} fill={`url(#${id}-plate-i)`} stroke="#0D0F12" strokeWidth="0.3" />
            <path d={INNER_PLATE} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="0.16" opacity="0.6" />
          </g>
        ))}
      </g>
      <g data-outer>
        {slots.map(i => (
          <g key={i} data-slot={i}>
            <path d={OUTER_PLATE} fill={`url(#${id}-plate-o)`} stroke="#0D0F12" strokeWidth="0.28" />
            <path d={OUTER_PLATE} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="0.2" />
            {[0, PITCH].map(x => (
              <g key={x} transform={`translate(${x} 0)`}>
                <circle r={PIN_R * 1.02} fill={`url(#${id}-rivet)`} />
                <circle r={PIN_R * 0.78} fill={`url(#${id}-pin)`} />
                <circle cx={-0.45} cy={-0.5} r={0.32} fill="#fff" opacity="0.75" />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* Einknick-Stelle: leuchtet, waehrend die Kamera zum ersten Mal naeher faehrt */}
      <g style={{ opacity: v('art') }}>
        <circle cx={PIN_B.x} cy={PIN_B.y} r="5.6" fill="none" stroke="#FFFFFF" strokeWidth="0.45" className="jr-pulse" />
        <circle cx={PIN_A.x} cy={PIN_A.y} r="5.6" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.3" />
        <path d={`M${PIN_B.x} ${PIN_B.y} L${PIN_B.x + 17} ${PIN_B.y}`} stroke="rgba(255,255,255,0.5)" strokeWidth="0.25" strokeDasharray="0.8 0.8" />
      </g>
    </g>
  );
});

// ─── Gelenk, durchleuchtet (stehend) ─────────────────────────────────────────
function Rings({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={ROLLER_R} fill="rgba(150,165,185,0.08)" stroke="rgba(200,215,235,0.5)" strokeWidth="0.07" />
      <circle r={COLLAR_R} fill="rgba(150,165,185,0.08)" stroke="rgba(200,215,235,0.5)" strokeWidth="0.07" />
      <circle r={COLLAR_R} fill="none" stroke="#6E9BE0" strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity={0.5} />
      <circle r={PIN_R + 0.01} fill="none" stroke="#6E9BE0" strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity={0.5} />
      <circle r={PIN_R} fill="rgba(220,228,236,0.22)" />
    </g>
  );
}

/** Gelenk B im Halbschnitt: oben aufgeschnitten und nach DIN ISO 128
 *  schraffiert, unten die Aussenansicht mit Lasche und Nietkopf. So liest man
 *  Bolzen, Kragen und Rolle als drei ineinandersteckende Koerper. */
function SectionB({ id }: { id: string }) {
  const B = PIN_B;
  const ann = (ro: number, ri: number) => `M${-ro} 0 A${ro} ${ro} 0 1 0 ${ro} 0 A${ro} ${ro} 0 1 0 ${-ro} 0 Z M${-ri} 0 A${ri} ${ri} 0 1 1 ${ri} 0 A${ri} ${ri} 0 1 1 ${-ri} 0 Z`;
  const edge = { fill: 'none', stroke: 'rgba(235,242,250,0.85)', strokeWidth: 0.06 } as const;
  return (
    <g>
      {/* unten: Aussenansicht */}
      <g clipPath={`url(#${id}-lower)`}>
        <circle cx={B.x} cy={B.y} r={ROLLER_R + 0.45} fill="#5B636E" />
        <circle cx={B.x} cy={B.y} r={ROLLER_R + 0.45} fill={`url(#${id}-plate-o)`} opacity="0.85" />
        <circle cx={B.x} cy={B.y} r={PIN_R * 1.02} fill={`url(#${id}-rivet)`} />
        <circle cx={B.x} cy={B.y} r={PIN_R * 0.78} fill={`url(#${id}-pin)`} />
      </g>
      {/* oben: Schnitt */}
      <g clipPath={`url(#${id}-upper)`}><g transform={`translate(${B.x} ${B.y})`}>
        <circle r={ROLLER_R + 0.45} fill="#0A0C10" />
        <path d={ann(ROLLER_R, COLLAR_R + 0.012)} fillRule="evenodd" fill="#4F5762" />
        <path d={ann(ROLLER_R, COLLAR_R + 0.012)} fillRule="evenodd" fill={`url(#${id}-sec-roller)`} />
        <path d={ann(COLLAR_R, PIN_R + 0.012)} fillRule="evenodd" fill="#434B55" />
        <path d={ann(COLLAR_R, PIN_R + 0.012)} fillRule="evenodd" fill={`url(#${id}-sec-collar)`} />
        <circle r={PIN_R} fill="#6A7380" />
        <circle r={PIN_R} fill={`url(#${id}-sec-pin)`} />
        <circle r={ROLLER_R} {...edge} /><circle r={COLLAR_R} {...edge} /><circle r={PIN_R} {...edge} />
      </g></g>
      {/* Schnittkante */}
      <line x1={B.x - ROLLER_R - 0.9} x2={B.x + ROLLER_R + 0.9} y1={B.y} y2={B.y} stroke="rgba(235,242,250,0.7)" strokeWidth="0.05" strokeDasharray="0.5 0.14 0.1 0.14" />
      {/* Wachsspalten: echt ~5 µm, hier als Linie */}
      <circle cx={B.x} cy={B.y} r={COLLAR_R} fill="none" stroke="#7FA8EA" strokeWidth={3} vectorEffect="non-scaling-stroke" />
      <circle cx={B.x} cy={B.y} r={PIN_R + 0.01} fill="none" stroke="#7FA8EA" strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

export const JointLayer = memo(function JointLayer({ id, de }: { id: string; de: boolean }) {
  const iB = PINS_F.findIndex(p => p.k === PIN_B.k);
  const near = PINS_F.slice(Math.max(0, iB - 3), iB + 4);
  const links = near.slice(0, -1).map((p, j) => {
    const q = near[j + 1];
    return { p, rot: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI, inner: p.k % 2 === 0 };
  });
  const B = PIN_B;
  const lbl = { fontSize: 0.34, fill: '#F2F6FB', fontWeight: 650, textAnchor: 'middle' as const, fontFamily: 'Inter, system-ui, sans-serif',
    stroke: 'rgba(8,10,13,0.85)', strokeWidth: 0.1, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const };
  return (
    <g data-layer="joint">
      {/* Laschen als Roentgenbild: nur Kontur und ein Hauch Flaeche */}
      {links.filter(l => l.inner).map((l, j) => (
        <path key={`i${j}`} d={INNER_PLATE} transform={`translate(${l.p.x} ${l.p.y}) rotate(${l.rot})`} fill="rgba(160,180,205,0.07)" stroke="rgba(200,215,235,0.45)" strokeWidth="0.08" />
      ))}
      {links.filter(l => !l.inner).map((l, j) => (
        <path key={`o${j}`} d={OUTER_PLATE} transform={`translate(${l.p.x} ${l.p.y}) rotate(${l.rot})`} fill="rgba(160,180,205,0.09)" stroke="rgba(220,230,242,0.6)" strokeWidth="0.08" />
      ))}
      {near.filter(p => p.k !== B.k).map(p => <Rings key={p.k} x={p.x} y={p.y} />)}
      <SectionB id={id} />

      {/* Beschriftung der Teile (Takt 2) */}
      <g style={{ opacity: v('lbl') }}>
        <text x={B.x} y={B.y - 0.75} {...lbl}>{de ? 'Bolzen' : 'Pin'}</text>
        <text x={B.x} y={B.y - (PIN_R + COLLAR_R) / 2 + 0.12} {...lbl} fontSize={0.26}>{de ? 'Kragen' : 'Collar'}</text>
        <text x={B.x} y={B.y - (COLLAR_R + ROLLER_R) / 2 + 0.12} {...lbl} fontSize={0.3}>{de ? 'Rolle' : 'Roller'}</text>
        <text x={B.x} y={B.y - 4.75} {...lbl}>{de ? 'Laschen' : 'Plates'}</text>
        <text x={B.x} y={B.y + 2.85} {...lbl} fontSize={0.24} fill="rgba(236,241,247,0.8)">{de ? 'Schnitt · Ansicht' : 'Section · view'}</text>
      </g>

      {/* 01 Bolzen gegen Kragen: Ring, Anlagepunkt, Drehung, Zug */}
      <g style={{ opacity: v('z1') }}>
        <circle cx={B.x} cy={B.y} r={PIN_R + 0.01} fill="none" stroke="#FFFFFF" strokeWidth="4" vectorEffect="non-scaling-stroke" />
        <circle cx={CONTACT.x} cy={CONTACT.y} r="0.32" fill="#FFFFFF" className="jr-pulse" />
        {/* Drehung beim Einknicken: ein Bogen unten rechts um den Bolzen */}
        <path d={`M${B.x + 1.35 * Math.cos(0.25)} ${B.y + 1.35 * Math.sin(0.25)} A1.35 1.35 0 0 1 ${B.x + 1.35 * Math.cos(1.35)} ${B.y + 1.35 * Math.sin(1.35)}`}
          fill="none" stroke="#1D2229" strokeWidth="0.09" />
        <path d={`M${B.x + 1.35 * Math.cos(1.35) + 0.28} ${B.y + 1.35 * Math.sin(1.35) - 0.05} L${B.x + 1.35 * Math.cos(1.35)} ${B.y + 1.35 * Math.sin(1.35)} L${B.x + 1.35 * Math.cos(1.35) + 0.12} ${B.y + 1.35 * Math.sin(1.35) - 0.28}`}
          fill="none" stroke="#1D2229" strokeWidth="0.09" />
        <path d={`M${B.x - 4.7} ${B.y} L${B.x - 7.9} ${B.y} M${B.x - 7.35} ${B.y - 0.4} L${B.x - 8.0} ${B.y} L${B.x - 7.35} ${B.y + 0.4}`} fill="none" stroke="#FFFFFF" strokeWidth="0.12" strokeLinecap="round" strokeLinejoin="round" />
        <text x={B.x - 6.35} y={B.y - 0.55} {...lbl} fontSize={0.32}>{de ? 'Zug' : 'Tension'}</text>
        <text x={CONTACT.x - 0.42} y={CONTACT.y + 0.36} {...lbl} textAnchor="end" fontSize={0.22}>{de ? 'liegt hier an' : 'bears here'}</text>
      </g>
      {/* 02 Rolle gegen Kragen */}
      <g style={{ opacity: v('z2') }}>
        <circle cx={B.x} cy={B.y} r={COLLAR_R} fill="none" stroke="#FFFFFF" strokeWidth="4" vectorEffect="non-scaling-stroke" />
        {[-0.5, 0.4, 1.3, 2.3, 3.4].map((a, i) => (
          <circle key={i} cx={B.x + (ROLLER_R + 0.7 + (i % 2) * 0.5) * Math.cos(a)} cy={B.y + (ROLLER_R + 0.7 + (i % 2) * 0.5) * Math.sin(a)}
            r={0.13 + (i % 3) * 0.05} fill="#C9A36A" />
        ))}
      </g>
      {/* 03 Lasche gegen Lasche: die flache Anlageflaeche um den Bolzen */}
      <g style={{ opacity: v('z3') }}>
        <path d={`M${B.x - 4.1} ${B.y} A4.1 4.1 0 1 0 ${B.x + 4.1} ${B.y} A4.1 4.1 0 1 0 ${B.x - 4.1} ${B.y} Z M${B.x - COLLAR_R} ${B.y} A${COLLAR_R} ${COLLAR_R} 0 1 1 ${B.x + COLLAR_R} ${B.y} A${COLLAR_R} ${COLLAR_R} 0 1 1 ${B.x - COLLAR_R} ${B.y} Z`}
          fill={`url(#${id}-hatch)`} fillRule="evenodd" opacity="0.8" />
        <circle cx={B.x} cy={B.y} r="4.1" fill="none" stroke="#F2C94C" strokeWidth="0.12" />
      </g>
    </g>
  );
});

// ─── Spalt und Film an der Druckseite (µm) ───────────────────────────────────
export const ContactLayer = memo(function ContactLayer({ id, de }: { id: string; de: boolean }) {
  const lbl = { fill: 'rgba(240,244,249,0.92)', fontWeight: 650, fontFamily: 'Inter, system-ui, sans-serif' };
  return (
    <g data-layer="contact">
      <path d={BORE_BODY} fill={`url(#${id}-steel-up)`} />
      <path d={PIN_BODY} fill={`url(#${id}-steel-down)`} />

      {/* Oel gegen Wachs */}
      <path d={FILM_BAND} fill="#C08A34" style={{ opacity: `calc(${v('oil')} * 0.55)` }} />
      <path d={FILM_BAND} fill="#3D67CA" style={{ opacity: `calc(${v('wax')} * 0.5)` }} />
      <path d={FILM_BAND} fill="#7FA6DA" style={{ opacity: `calc(${v('wax')} * ${v('fail11')} * 0.35)` }} />

      <path d={PIN_SURFACE} fill="none" stroke="#DCE3EA" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
      <path d={BORE_SURFACE} fill="none" stroke="#BAC3CE" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
      {/* Lichtkanten des Schmierstoffs an beiden Grenzflaechen */}
      <path d={PIN_SURFACE} transform="translate(0 -0.35)" fill="none" stroke="#F2C17A" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ opacity: `calc(${v('oil')} * 0.7)` }} />
      <path d={BORE_SURFACE} transform="translate(0 0.35)" fill="none" stroke="#F2C17A" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ opacity: `calc(${v('oil')} * 0.5)` }} />
      <path d={PIN_SURFACE} transform="translate(0 -0.3)" fill="none" stroke="#B9D2F2" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ opacity: `calc(${v('wax')} * 0.7)` }} />
      <path d={BORE_SURFACE} transform="translate(0 0.3)" fill="none" stroke="#B9D2F2" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ opacity: `calc(${v('wax')} * 0.5)` }} />

      {/* Spalt-Massstab: Staub im Oel, Kratzer im Stahl */}
      <g style={{ opacity: v('grit') }}>
        {GRIT.map((g, i) => (
          <g key={i}>
            <line x1={g.x0} x2={g.x0 + g.travel} y1={pinY(g.x0) - 0.1} y2={pinY(g.x0 + g.travel) - 0.1} pathLength={1}
              stroke="#FF8A3D" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeDasharray="1" style={{ strokeDashoffset: `calc(1 - ${v('g7')})` }} />
            <g transform={`translate(${g.x0} ${g.y})`}>
              <polygon points={g.pts} fill="#8A6A45" stroke="#D9B98A" strokeWidth="0.8" vectorEffect="non-scaling-stroke" className="jr-grit"
                style={{ transform: `translateX(calc(${v('g7')} * ${g.travel}px)) rotate(calc(${v('g7')} * ${g.spin}deg))` }} />
            </g>
          </g>
        ))}
      </g>
      <g style={{ opacity: v('gaplbl') }}>
        <text x={-16} y={-9} fontSize={1.5} {...lbl}>{de ? 'Kragen' : 'Collar'}</text>
        <text x={-16} y={11} fontSize={1.5} {...lbl}>{de ? 'Bolzen' : 'Pin'}</text>
        <text x={30} y={-4.4} fontSize={1.2} {...lbl} textAnchor="end" fill="rgba(221,228,236,0.6)">{de ? '← Gleiten beim Einknicken →' : '← sliding as it hinges →'}</text>
      </g>

      {/* Film-Massstab. Journey blendet die Gruppe per display aus, solange
          sie unsichtbar ist: gut 500 Elemente, die sonst bei jeder
          Variablenaenderung mitgerechnet wuerden. */}
      <g data-lod style={{ opacity: v('lod') }}>
        <g clipPath={`url(#${id}-film)`}>
          {/* Paraffin-Plaettchen, wachsen beim Abkuehlen vom Stahl nach oben */}
          {PLATES.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
              <rect x={-p.len / 2} y={-0.035} width={p.len} height={0.07} rx={0.03} fill="#A9C4E6" className="jr-grow"
                style={{
                  opacity: `calc(clamp(0, calc((${v('g9')} - ${p.d.toFixed(3)}) * 5), 1) * (1 - ${v('fail11')} * ${p.ft ? 0.1 : 0.7}) * 0.78)`,
                  transform: `scaleX(clamp(0.15, calc((${v('g9')} - ${p.d.toFixed(3)}) * 3 + 0.15), 1))`,
                }} />
              {p.ft && <rect x={-p.len / 2} y={-0.025} width={p.len} height={0.05} fill="#F4F8FF" style={{ opacity: v('ft') }} />}
            </g>
          ))}
          {/* Mikrowachs: feine, unregelmaessige Nadeln zwischen den Plaettchen */}
          {NEEDLES.map((n, i) => (
            <line key={i} x1={n.x - (n.len / 2) * Math.cos((n.rot * Math.PI) / 180)} y1={n.y - (n.len / 2) * Math.sin((n.rot * Math.PI) / 180)}
              x2={n.x + (n.len / 2) * Math.cos((n.rot * Math.PI) / 180)} y2={n.y + (n.len / 2) * Math.sin((n.rot * Math.PI) / 180)}
              stroke="#CFE0F7" strokeWidth="0.03" strokeLinecap="round"
              style={{ opacity: `calc(clamp(0, calc((${v('fix12')} - ${(n.d * 0.6).toFixed(3)}) * 3), 1) * 0.75)` }} />
          ))}
          {/* Risse bei Frost ohne Mikrowachs */}
          {CRACKS.map((c, i) => (
            <polyline key={i} points={c} fill="none" stroke="#FF8A3D" strokeWidth="0.07" strokeLinejoin="round" pathLength={1} strokeDasharray="1"
              style={{ strokeDashoffset: `calc(1 - ${v('fail12')})`, opacity: v('fail12') }} />
          ))}
          {/* MoS2-Plaettchen, am Stahl flach; darum die Esterhuelle */}
          {FLAKES.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`} style={{ opacity: v('fix10') }}>
              <ellipse rx={f.w / 2 + 0.2} ry={0.22} fill="rgba(169,196,230,0.1)" stroke="#A9C4E6" strokeWidth="0.018" strokeDasharray="0.05 0.05" style={{ opacity: v('fix13') }} />
              <path d={hexPath(f.w, 0.2)} fill={`url(#${id}-mos)`} stroke="#E8C547" strokeWidth="0.018" />
              <line x1={-f.w / 2 + 0.14} x2={f.w / 2 - 0.14} y1={0} y2={0} stroke="rgba(255,255,255,0.45)" strokeWidth="0.012" />
            </g>
          ))}
          {/* Antioxidans-Molekuele und die Radikale, die sie abfangen */}
          {ANTIOX.map((a, i) => (
            <path key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.a})`} d="M0 -0.1 L0.087 -0.05 L0.087 0.05 L0 0.1 L-0.087 0.05 L-0.087 -0.05 Z"
              fill="none" stroke="#DCE3EB" strokeWidth="0.02" style={{ opacity: v('fix14') }} />
          ))}
          {RADICALS.map((r, i) => (
            <g key={i} style={{ opacity: v('rad'), transform: `translate(calc(${v('g14')} * ${r.dx.toFixed(2)}px), calc(${v('g14')} * ${r.dy.toFixed(2)}px))` }}>
              <circle cx={r.x} cy={r.y} r="0.11" fill="#6B7480" />
              <circle cx={r.x} cy={r.y} r="0.11" fill="#FF8A3D" style={{ opacity: `calc(1 - ${v('fix14')})` }} />
            </g>
          ))}
        </g>
        {/* Transferfilm aus MoS2 auf beiden Stahlflaechen */}
        <path d={PIN_SURFACE} transform="translate(0 -0.06)" fill="none" stroke="#E4EAF1" strokeWidth="0.07" style={{ opacity: `calc(${v('fix10')} * 0.9)` }} />
        <path d={BORE_SURFACE} transform="translate(0 0.06)" fill="none" stroke="#E4EAF1" strokeWidth="0.07" style={{ opacity: `calc(${v('fix10')} * 0.9)` }} />
        {/* Ohne Festschmierstoff: Kontakt an den Rauheitsspitzen */}
        {PEAKS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y - 0.05} r="0.2" fill="#FF8A3D" className="jr-flash" style={{ opacity: v('fail10'), animationDelay: `${i * 0.23}s` }} />
        ))}
        <g style={{ opacity: v('filmlbl') }}>
          <text x={-8.2} y={boreY(-8.2) - 0.35} fontSize={0.2} {...lbl}>{de ? 'Kragen · Stahl' : 'Collar · steel'}</text>
          <text x={-8.2} y={pinY(-8.2) + 0.5} fontSize={0.2} {...lbl}>{de ? 'Bolzen · Stahl' : 'Pin · steel'}</text>
          <text x={8.2} y={pinY(8.2) + 0.5} fontSize={0.17} {...lbl} textAnchor="end" fill="rgba(221,228,236,0.6)">{de ? 'Film · wenige µm, schematisch' : 'Film · a few µm, schematic'}</text>
        </g>
      </g>
    </g>
  );
});
