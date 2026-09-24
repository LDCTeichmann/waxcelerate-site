// ─── FieldNet — das Wirkungsnetz, direkt im Filmschnitt ─────────────────────
//
// Luca, 25.09.2026: das alte Stern-Netz (FormulaGraph, entfernt 16.09.2026)
// zeigte, wer mit wem zusammenwirkt, der Filmschnitt (WaxField) zeigt, wo
// jede Komponente sitzt. Beides zusammen, ohne die zwei Fehler des alten
// Graphen:
//  - Die Knoten liegen nicht mehr frei erfunden im Raum, sondern auf
//    FIELD_ANCHORS: dem Ort, an dem der Stoff in dieser Zeichnung wirklich
//    ist. Eine Kante "FT-Wachs → Paraffin, Ko-Kristallisation" laeuft also
//    von einer FT-Lamelle zu einer Paraffin-Lamelle.
//  - Es steht nie das ganze Netz beschriftet da. Beschriftet sind nur die
//    Kanten der gerade erzaehlten Komponente; der Rest bleibt als feine
//    Linie sichtbar, damit das Netz waechst, statt als Oktopus zu starten.
//
// Die Kanten kommen unveraendert aus EDGES (science.ts). Beschriftungen
// liegen als HTML ueber dem SVG (DESIGN.md §2: Figurenschrift nie unter
// 11 px, eine <text>-Beschriftung in der viewBox skaliert darunter).

import { COMPONENTS, EDGES } from '@/lib/science';
import { FIELD_ANCHORS, FIELD_VB, type FieldKey } from './WaxField';

const keyOf = (node: number) => COMPONENTS.find(c => c.node === node)?.id as FieldKey | undefined;

interface Props {
  de: boolean;
  /** Komponenten, die schon im Film sind (Reihenfolge egal). */
  present: FieldKey[];
  /** Die gerade erzaehlte Komponente; ihre Kanten sind kraeftig und beschriftet. */
  focus: FieldKey | null;
  /** Wird eine Komponente weggelassen, fallen auch ihre Kanten weg. */
  missing?: FieldKey | null;
}

/** Quadratische Kurve, Kontrollpunkt senkrecht versetzt — nach oben, damit
 *  die Linien ueber dem Film gewoelbt statt quer durch die Lamellen laufen. */
function curve(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.22) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }          // immer nach oben woelben
  const c = { x: mx + nx * len * bend, y: my + ny * len * bend };
  // Punkt auf der Kurve bei t = 0,5 — dort sitzt die Beschriftung.
  const mid = { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y };
  return { d: `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`, mid };
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
// Knotennamen am Rand nicht aus der Figur schieben.
const pctX = (v: number) => `${Math.min(90, Math.max(10, (v / FIELD_VB.w) * 100))}%`;

export function FieldNet({ de, present, focus, missing = null }: Props) {
  const has = (k: FieldKey | undefined): k is FieldKey => !!k && present.includes(k) && k !== missing;

  const edges = EDGES.flatMap((e, i) => {
    const from = keyOf(e.from), to = keyOf(e.to);
    if (!has(from) || !has(to)) return [];
    const hot = !!focus && (from === focus || to === focus);
    // Zwei Kanten zwischen denselben Knoten gibt es nicht; die Biegung haengt
    // trotzdem an der Richtung, damit sich Hin- und Gegenkante nie decken.
    const { d, mid } = curve(FIELD_ANCHORS[from], FIELD_ANCHORS[to], e.balance ? 0.12 : 0.22);
    return [{ i, from, to, d, mid, hot, dash: e.dash, balance: !!e.balance, label: de ? e.labelDe : e.labelEn }];
  });

  const nodes = (Object.keys(FIELD_ANCHORS) as FieldKey[]).filter(has);
  const label = (k: FieldKey) => {
    const c = COMPONENTS.find(x => x.id === k)!;
    return de ? c.graphLabelDe : c.graphLabelEn;
  };
  const linked = new Set(edges.filter(e => e.hot).flatMap(e => [e.from, e.to]));

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <svg viewBox={`0 0 ${FIELD_VB.w} ${FIELD_VB.h}`} className="absolute inset-0 w-full h-full">
        <defs>
          <marker id="fn-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 z" fill="var(--accent)" />
          </marker>
          <marker id="fn-arrow-bal" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 z" fill="var(--tx1)" />
          </marker>
        </defs>

        {edges.map(e => (
          <path key={`${e.i}-${e.hot ? 'h' : 'c'}`} d={e.d} fill="none"
            className={e.hot ? 'fn-edge fn-edge-hot' : 'fn-edge'}
            pathLength={1}
            stroke={e.balance ? 'var(--tx1)' : 'var(--accent)'}
            strokeWidth={e.hot ? 2.2 : focus ? 1.1 : 1.5}
            strokeOpacity={e.hot ? 1 : focus ? 0.28 : 0.7}
            strokeDasharray={e.hot ? undefined : e.dash ? '0.012 0.012' : undefined}
            markerEnd={e.hot ? `url(#${e.balance ? 'fn-arrow-bal' : 'fn-arrow'})` : undefined}
            markerStart={e.hot && e.balance ? 'url(#fn-arrow-bal)' : undefined} />
        ))}
        {/* Leuchtspur: einmal durch jede frisch beschriftete Kante. */}
        {edges.filter(e => e.hot).map(e => (
          <path key={`c-${e.i}-${focus}`} d={e.d} fill="none" pathLength={1} className="fn-comet"
            stroke={e.balance ? 'var(--tx1)' : 'var(--accent)'} strokeWidth={3.4} strokeLinecap="round" />
        ))}

        {nodes.map(k => {
          const a = FIELD_ANCHORS[k];
          const on = k === focus;
          return (
            <g key={k} style={{ transition: 'opacity .4s' }} opacity={!focus || on || linked.has(k) ? 1 : 0.45}>
              {on && <circle cx={a.x} cy={a.y} r={13} fill="rgba(var(--accent-rgb),0.16)" className="fn-pulse" />}
              <circle cx={a.x} cy={a.y} r={on ? 6 : 4.5} fill="var(--pg)" stroke="var(--accent)" strokeWidth={on ? 2.4 : 1.6} />
            </g>
          );
        })}
      </svg>

      {/* Knotennamen und Kantenbeschriftungen als HTML */}
      {nodes.map(k => {
        const a = FIELD_ANCHORS[k];
        const on = k === focus;
        const show = !focus || on || linked.has(k);
        return (
          <span key={`n-${k}`} className="fn-node absolute -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-[2px] text-[11px] font-semibold"
            style={{
              left: pctX(a.x), top: pct(a.y - 24, FIELD_VB.h),
              background: on ? 'var(--accent)' : 'var(--pg)',
              color: on ? '#fff' : 'var(--tx2)',
              border: `1px solid ${on ? 'var(--accent)' : 'var(--bd)'}`,
              opacity: show ? 1 : 0,
            }}>
            {label(k)}
          </span>
        );
      })}
      {edges.filter(e => e.hot).map(e => (
        <span key={`l-${e.i}`} className="fn-label absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-1.5 py-[1px] text-[11px]"
          style={{
            left: pct(e.mid.x, FIELD_VB.w), top: pct(e.mid.y, FIELD_VB.h),
            background: 'var(--sf)', color: 'var(--tx2)',
            border: `1px ${e.dash ? 'dashed' : 'solid'} ${e.balance ? 'var(--tx2)' : 'var(--accent-soft)'}`,
          }}>
          {e.balance ? '⇄ ' : ''}{e.label}
        </span>
      ))}
    </div>
  );
}
