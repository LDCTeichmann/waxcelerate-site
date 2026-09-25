// ─── LabFilm — der Wachsfilm als Block im Labor ──────────────────────────────
//
// Dieselbe Geometrie wie WaxField (Faecher aus echten Keimen am Stahl,
// amorphe Keile, Plaettchen, Antioxidans-Marken, FIELD_ANCHORS), aber als
// Objekt im dunklen Labor gezeichnet: gebuersteter Stahl mit echter Rauheit,
// durchscheinendes Wachs, leuchtende Lamellen, sechseckige MoS2-Plaettchen.
//
// Die Vorderseite ist der Schnitt. Oberseite (Filmoberflaeche) und
// Seitenkante sind eigene Flaechen in CSS 3D (.lab-block, index.css); die
// Kippung haengt an --tilt, das FilmLab pro Frame aus dem Scroll setzt.
//
// Das Wachstum der Lamellen haengt an --grow (0..1), ebenfalls vom Scroll:
// jede Lamelle hat pathLength=1 und wird ueber stroke-dashoffset gezeichnet.
// Kein React-Rendern pro Frame, nur eine CSS-Variable.

import { COMPONENTS, EDGES } from '@/lib/science';
import {
  FANS, WEDGES, PLATELETS, PLATELETS_SUNKEN, ANTIOX, FIELD_ANCHORS, STEEL_Y, FILM_TOP, VB,
  steelTopPath, type FieldKey, type Lamella,
} from '../WaxField';

export const LAB_Y0 = FILM_TOP - 6;               // Oberkante des Schnitts
export const LAB_H = VB.h - LAB_Y0;               // Hoehe der Vorderseite
const keyOf = (node: number) => COMPONENTS.find(c => c.node === node)?.id as FieldKey | undefined;
const hash = (i: number) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };

function lamellaPath(l: Lamella) {
  return `M ${l.x1.toFixed(1)} ${l.y1.toFixed(1)} L ${l.mx.toFixed(1)} ${l.my.toFixed(1)} L ${l.x2.toFixed(1)} ${l.y2.toFixed(1)}`;
}

/** Sechseckiges Plaettchen in Seitenansicht (flach, mit Glanzkante). */
function hexPlate(w: number) {
  const h = 4.2, c = 3;
  return `M ${-w / 2} 0 L ${-w / 2 + c} ${-h / 2} L ${w / 2 - c} ${-h / 2} L ${w / 2} 0 L ${w / 2 - c} ${h / 2} L ${-w / 2 + c} ${h / 2} Z`;
}

export function LabFilm({ de, focus, without, net }: {
  de: boolean;
  focus: FieldKey | null;
  without: FieldKey | null;
  /** 'focus': nur die Kanten der Komponente, 'all': ganzes Netz, 'none'. */
  net: 'focus' | 'all' | 'none';
}) {
  const noMicro = without === 'winterformel';
  const noFt = without === 'matrix';
  const noMos = without === 'mos2';
  const noDisp = without === 'sedimentation';
  const noAntiox = without === 'antioxidans';
  const dim = (k: FieldKey) => (focus && focus !== k ? 0.3 : 1);
  const platelets = noDisp ? PLATELETS_SUNKEN : PLATELETS;

  const edges = net === 'none' ? [] : EDGES.flatMap((e, i) => {
    const a = keyOf(e.from), b = keyOf(e.to);
    if (!a || !b || a === without || b === without) return [];
    const hot = net === 'all' || a === focus || b === focus;
    if (!hot) return [];
    const p = FIELD_ANCHORS[a], q = FIELD_ANCHORS[b];
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, len = Math.hypot(q.x - p.x, q.y - p.y);
    const c = { x: mx, y: my - len * (e.balance ? 0.12 : 0.24) };
    return [{ i, d: `M ${p.x} ${p.y} Q ${c.x} ${c.y} ${q.x} ${q.y}`, dash: e.dash, balance: !!e.balance }];
  });
  const nodes = (Object.keys(FIELD_ANCHORS) as FieldKey[]).filter(k => k !== without);
  const linked = new Set(edges.flatMap(e => [keyOf(EDGES[e.i].from), keyOf(EDGES[e.i].to)]));
  const nodeLabel = (k: FieldKey) => { const c = COMPONENTS.find(x => x.id === k)!; return de ? c.graphLabelDe : c.graphLabelEn; };
  const pctX = (x: number) => `${Math.min(92, Math.max(8, (x / VB.w) * 100))}%`;
  const pctY = (y: number) => `${((y - LAB_Y0) / LAB_H) * 100}%`;

  return (
    <div className="lab-block">
      {/* Oberseite: die Filmoberflaeche, von schraeg oben gesehen */}
      <div className="lab-face lab-face--top" aria-hidden />
      {/* Seitenkante: Wachs ueber Stahl */}
      <div className="lab-face lab-face--side" aria-hidden />

      <div className="lab-face lab-face--front">
        <svg viewBox={`0 ${LAB_Y0} ${VB.w} ${LAB_H}`} className="block w-full h-auto" role="img"
          aria-label={de
            ? 'Schnitt durch den Wachsfilm auf Stahl, etwa ein Mikrometer: Lamellenfächer wachsen von Keimen am Stahl nach oben, dazwischen amorphe Keile, darin MoS₂-Plättchen.'
            : 'Section through the wax film on steel, about one micrometre: lamellar fans grow up from nuclei on the steel, amorphous wedges between them, MoS₂ platelets inside.'}>
          <defs>
            <linearGradient id="lab-wax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6E9BD6" stopOpacity="0.16" />
              <stop offset="1" stopColor="#3D67CA" stopOpacity="0.34" />
            </linearGradient>
            <linearGradient id="lab-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8C96A3" />
              <stop offset="0.12" stopColor="#5B636E" />
              <stop offset="1" stopColor="#2A2F36" />
            </linearGradient>
            <pattern id="lab-brush" width="520" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1.5" x2="520" y2="1.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
              <line x1="0" y1="4.2" x2="520" y2="4.2" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="lab-mos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EEF2F6" />
              <stop offset="0.5" stopColor="#9AA4B1" />
              <stop offset="1" stopColor="#4B535E" />
            </linearGradient>
            <clipPath id="lab-filmclip"><rect x="0" y={FILM_TOP} width={VB.w} height={STEEL_Y - FILM_TOP + 4} /></clipPath>
          </defs>

          {/* Wachskoerper */}
          <rect x="0" y={FILM_TOP} width={VB.w} height={STEEL_Y - FILM_TOP} fill="url(#lab-wax)" />
          {/* Warme Waermeerweichung ohne FT-Wachs: Oberflaeche rundet ab */}
          {noFt && (
            <path d={`M 0 ${FILM_TOP} L 0 ${FILM_TOP + 20} Q ${VB.w * 0.25} ${FILM_TOP + 4} ${VB.w * 0.5} ${FILM_TOP + 26} Q ${VB.w * 0.75} ${FILM_TOP + 46} ${VB.w} ${FILM_TOP + 16} L ${VB.w} ${FILM_TOP} Z`}
              fill="#0E1116" stroke="rgba(169,196,230,0.5)" strokeDasharray="4 3" strokeWidth="1" className="lab-fade-in" />
          )}

          <g clipPath="url(#lab-filmclip)">
            {/* Amorphe Keile (Mikrokristallin) */}
            <g className="lab-grow-late"><g className="lab-dimmable" style={{ opacity: dim('winterformel') }}>
              {WEDGES.map((w, i) => (
                <path key={i}
                  d={`M ${w.x - w.halfW} ${w.top} L ${w.x + w.halfW} ${w.top} L ${w.x + 2} ${STEEL_Y} L ${w.x - 2} ${STEEL_Y} Z`}
                  fill={noMicro ? 'none' : 'rgba(150,185,235,0.22)'}
                  stroke={noMicro ? 'rgba(255,255,255,0.25)' : 'none'} strokeDasharray="3 3" strokeWidth="0.8" />
              ))}
            </g></g>

            {/* Paraffin-Lamellen: waechst mit --grow */}
            <g style={{ opacity: dim('kristallstruktur') }} className="lab-dimmable">
              {FANS.flatMap((f, fi) => f.lamellae.filter(l => !l.ft).map((l, li) => {
                const delay = (fi * 0.07 + hash(fi * 40 + li) * 0.18).toFixed(3);
                return (
                  <path key={`${fi}-${li}`} d={lamellaPath(l)} pathLength={1} className="lab-lamella"
                    style={{ ['--d' as string]: delay }} />
                );
              }))}
            </g>
            {/* FT-Lamellen: kraeftiger, dieselbe Wachstumsfront */}
            {!noFt && (
              <g style={{ opacity: dim('matrix') }} className="lab-dimmable">
                {FANS.flatMap((f, fi) => f.lamellae.filter(l => l.ft).map((l, li) => (
                  <path key={`ft-${fi}-${li}`} d={lamellaPath(l)} pathLength={1} className="lab-lamella lab-lamella--ft"
                    style={{ ['--d' as string]: (fi * 0.07 + 0.05 + hash(fi * 7 + li) * 0.12).toFixed(3) }} />
                )))}
              </g>
            )}

            {/* Risse ohne Mikrokristallin */}
            {noMicro && WEDGES.map((w, i) => {
              const top = FILM_TOP + 2, bot = STEEL_Y - 1;
              const k = (f: number) => top + (bot - top) * f;
              const wid = (f: number) => 1.5 + f * 7;
              const pts = [0, 0.34, 0.68, 1];
              const l = pts.map(f => `${w.x - wid(f) + (f === 0.34 ? -5 : f === 0.68 ? 4 : 0)},${k(f)}`);
              const r = pts.slice().reverse().map(f => `${w.x + wid(f) + (f === 0.34 ? -5 : f === 0.68 ? 4 : 0)},${k(f)}`);
              return <polygon key={`c${i}`} points={[...l, ...r].join(' ')} fill="#0B0D11" stroke="#FF8A3D" strokeWidth="0.9" className="lab-fade-in" />;
            })}

            {/* MoS2-Plaettchen mit Dispergier-Huelle */}
            {!noMos && (
              <g className="lab-grow-late"><g className="lab-dimmable" style={{ opacity: dim('mos2') }}>
                {platelets.map((pl, i) => (
                  <g key={i} transform={`translate(${pl.x} ${pl.y}) rotate(${pl.rot})`}>
                    {!noDisp && (
                      <ellipse rx={pl.w / 2 + 6} ry={7.5} fill="rgba(169,196,230,0.08)" stroke="rgba(169,196,230,0.55)"
                        strokeDasharray="2 2.4" strokeWidth="0.8" style={{ opacity: dim('sedimentation') }} className="lab-dimmable" />
                    )}
                    <path d={hexPlate(pl.w)} fill="url(#lab-mos)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
                  </g>
                ))}
              </g></g>
            )}

            {/* Antioxidans: feine Marken im Volumen */}
            {!noAntiox && (
              <g className="lab-grow-late"><g className="lab-dimmable" style={{ opacity: dim('antioxidans') }}>
                {ANTIOX.map((a, i) => (
                  <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.a})`}>
                    <line x1={-3} y1="0" x2={3} y2="0" stroke="#BFD3F0" strokeWidth="0.9" />
                    <line x1="0" y1={-3} x2="0" y2={3} stroke="#BFD3F0" strokeWidth="0.9" />
                  </g>
                ))}
              </g></g>
            )}
          </g>

          {/* Stahl mit Rauheit */}
          <path d={`${steelTopPath()} L ${VB.w} ${VB.h} L 0 ${VB.h} Z`} fill="url(#lab-steel)" />
          <path d={`${steelTopPath()} L ${VB.w} ${VB.h} L 0 ${VB.h} Z`} fill="url(#lab-brush)" />
          <path d={steelTopPath()} fill="none" stroke="#C9D1DA" strokeWidth="1.2" />
          {/* Fe–S-Transferfilm */}
          {!noMos && <path d={steelTopPath()} fill="none" stroke="#DCE3EB" strokeWidth="2.4" transform="translate(0,-2.2)" className="lab-grow-late" opacity="0.8" />}

          {/* Netz */}
          {edges.map(e => (
            <path key={`e${e.i}`} d={e.d} fill="none" pathLength={1}
              className={net === 'all' ? 'lab-edge lab-edge--all' : 'lab-edge'}
              style={{ ['--i' as string]: e.i }}
              stroke={e.balance ? '#F2C94C' : '#A9C4E6'} strokeWidth={1.6}
              strokeDasharray={e.dash ? '0.015 0.012' : undefined} />
          ))}
          {net !== 'none' && nodes.map(k => {
            const a = FIELD_ANCHORS[k]; const on = k === focus;
            return (
              <g key={k}>
                {on && <circle cx={a.x} cy={a.y} r="12" fill="rgba(169,196,230,0.18)" className="lab-pulse" />}
                <circle cx={a.x} cy={a.y} r={on ? 5.5 : 3.6} fill="#0E1116" stroke={on ? '#FFFFFF' : '#A9C4E6'} strokeWidth={on ? 2 : 1.3} data-lab-focus={on || undefined} />
              </g>
            );
          })}
        </svg>

        {/* Beschriftungen als HTML (>= 11 px) */}
        <span className="lab-tag" style={{ left: '2%', top: pctY(STEEL_Y + 22) }}>{de ? 'Stahl' : 'Steel'}</span>
        <span className="lab-tag" style={{ left: '2%', top: pctY(FILM_TOP - 4), transform: 'translateY(-100%)' }}>{de ? 'Filmoberfläche · ~1 µm' : 'Film surface · ~1 µm'}</span>
        {net !== 'none' && nodes.filter(k => net === 'all' || k === focus || linked.has(k)).map(k => (
          <span key={`n${k}`} className={`lab-node${k === focus ? ' lab-node--on' : ''}`}
            style={{ left: pctX(FIELD_ANCHORS[k].x), top: pctY(FIELD_ANCHORS[k].y - 16) }}>
            {nodeLabel(k)}
          </span>
        ))}
      </div>
    </div>
  );
}
