import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { COMPONENTS, EDGES, FORMULA_STORY, STORY_DONE, type ScienceComponent } from '@/lib/science';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { curvedEdge, quadPoint, NodeCircle, EdgeLabel, LegendSwatch, type NodeState } from '@/sections/science/graphPrimitives';

const VB_W = 640, VB_H = 430;
const STEPS = FORMULA_STORY.length;            // 6 component steps; index === STEPS means "done"
const byNode = (n: number) => COMPONENTS.find(c => c.node === n)!;

// One node: a clean disc whose label is legible in every state (white on the
// accent-filled active disc, dark otherwise). Pop-in + recede are pure CSS
// transitions keyed on `built`/`focused`, so this stays hook-free for .map().
function GraphNode({ c, de, built, focused, dimmed, reduced, onActivate, onSelect }: {
  c: ScienceComponent; de: boolean; built: boolean; focused: boolean; dimmed: boolean;
  reduced: boolean; onActivate: (n: number | null) => void; onSelect: (id: string) => void;
}) {
  const state: NodeState = focused ? 'active' : 'dim';
  const opacity = !built ? 0 : focused ? 1 : dimmed ? 0.42 : 1;
  return (
    <g
      data-node
      role="button" tabIndex={built ? 0 : -1}
      aria-label={de ? c.nameDe : c.nameEn}
      style={{
        cursor: 'pointer', outline: 'none',
        opacity, transform: built ? 'scale(1)' : 'scale(0.4)',
        transformBox: 'fill-box', transformOrigin: 'center',
        transition: reduced ? 'none' : 'opacity 0.3s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: built ? 'auto' : 'none',
      }}
      onMouseEnter={() => onActivate(c.node)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(c.node)}
      onBlur={() => onActivate(null)}
      onClick={() => onSelect(c.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.id); } }}
    >
      <NodeCircle x={c.cx} y={c.cy} r={c.r} big={c.node === 4} state={state} />
      <circle cx={c.cx} cy={c.cy} r={c.r + 10} fill="transparent" />
    </g>
  );
}

export function FormulaGraph({ de, onSelect }: { de: boolean; onSelect: (id: string) => void }) {
  const [reduced] = useState(() => prefersReducedMotion());
  // step ∈ [0 … STEPS]; STEPS === fully assembled, resting state (no active node).
  const [step, setStep] = useState(STEPS);
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<number | undefined>(undefined);

  // Edge geometry is state-independent — compute once.
  const edgeGeo = useMemo(() => EDGES.map((e) => {
    const a = byNode(e.from), b = byNode(e.to);
    const { d, c } = curvedEdge(a.cx, a.cy, b.cx, b.cy);
    return { e, d, a, b, c };
  }), []);

  // What's on the stage = the union of every step up to `step`.
  const builtSteps = FORMULA_STORY.slice(0, Math.min(step, STEPS - 1) + 1);
  const builtNodes = new Set(builtSteps.map(s => s.node));
  const builtEdges = new Set(builtSteps.flatMap(s => s.edges));
  const done = step >= STEPS;

  // Focus = the node the user is hovering, else the current step's node.
  const focusNode = hover != null ? hover : (!done ? FORMULA_STORY[step].node : null);
  // Highlighted edges: when hovering, every built edge touching the focus node;
  // during the build, exactly the current step's edges (one relationship at a time).
  const activeEdges = new Set<number>();
  if (hover != null) {
    EDGES.forEach((e, i) => { if (builtEdges.has(i) && (e.from === hover || e.to === hover)) activeEdges.add(i); });
  } else if (!done) {
    FORMULA_STORY[step].edges.forEach(i => activeEdges.add(i));
  }

  // ── Auto-advance the build ────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const iv = window.setInterval(() => setStep(s => Math.min(s + 1, STEPS)), 2600);
    return () => clearInterval(iv);
  }, [playing]);
  useEffect(() => { if (step >= STEPS) setPlaying(false); }, [step]);

  // Start the narrated build the first time the graph scrolls into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;  // reduced motion: stay fully assembled, no autoplay
    const t = ScrollTrigger.create({
      trigger: root, start: 'top 80%', once: true,
      onEnter: () => { setHover(null); setStep(0); setPlaying(true); },
    });
    return () => { t.kill(); clearTimeout(resumeRef.current); };
  }, [reduced]);

  // Hover/focus a node → pause the build and preview it; resume shortly after.
  const onActivate = (n: number | null) => {
    clearTimeout(resumeRef.current);
    if (n != null) { setHover(n); setPlaying(false); }
    else { setHover(null); if (!reduced && step < STEPS) resumeRef.current = window.setTimeout(() => setPlaying(true), 900); }
  };
  const onPick = (id: string) => { setPlaying(false); onSelect(id); };

  const jumpTo = (i: number) => { setHover(null); setPlaying(false); setStep(i); };
  const onPlayPause = () => {
    if (done) { setHover(null); setStep(0); setPlaying(true); }
    else setPlaying(p => !p);
  };

  const focusComp = focusNode != null ? byNode(focusNode) : null;

  return (
    <div ref={rootRef}>
      <div className="relative">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ overflow: 'visible' }}
          role="group" aria-label={de ? 'Aufbau der Formel' : 'Formula assembly'}>
          <g data-edges>
            {edgeGeo.map(({ e, d }, i) => {
              const built = builtEdges.has(i);
              const act = activeEdges.has(i);
              const op = !built ? 0 : focusNode == null ? (e.main ? 0.5 : 0.34) : act ? 1 : 0.1;
              const w = e.main ? (act ? 3 : 2.4) : (act ? 2.4 : 1.7);
              return (
                <g key={i}>
                  <path d={d} fill="none"
                    stroke={act ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.34)'}
                    strokeWidth={w} strokeDasharray={e.dash ? '5 5' : undefined} strokeLinecap="round"
                    style={{ opacity: op, transition: reduced ? 'none' : 'opacity 0.35s ease, stroke 0.3s ease' }} />
                  {/* directional flow comet on the highlighted edge(s) */}
                  {act && !reduced && (
                    <path d={d} fill="none" pathLength={100} className="graph-flow"
                      stroke="var(--accent)" strokeWidth={e.main ? 3 : 2.4}
                      strokeDasharray="14 86" strokeLinecap="round" style={{ opacity: 0.9 }} />
                  )}
                </g>
              );
            })}
          </g>

          {COMPONENTS.map(c => (
            <GraphNode key={c.node} c={c} de={de} reduced={reduced}
              built={builtNodes.has(c.node)}
              focused={focusNode === c.node}
              dimmed={focusNode != null && focusNode !== c.node}
              onActivate={onActivate} onSelect={onPick} />
          ))}
        </svg>

        {/* Node labels + the single active relationship pill — HTML overlay so text
            stays crisp and legible (white on the accent-filled active disc). */}
        <div className="absolute inset-0 pointer-events-none">
          {COMPONENTS.map(c => {
            const built = builtNodes.has(c.node);
            const focused = focusNode === c.node;
            const dimmed = focusNode != null && !focused;
            return (
              <div key={c.node} className="absolute text-center leading-tight"
                style={{
                  left: `${(c.cx / VB_W) * 100}%`, top: `${(c.cy / VB_H) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: !built ? 0 : dimmed ? 0.42 : 1,
                  transition: reduced ? 'none' : 'opacity 0.3s ease',
                }}>
                <span className={`block font-semibold ${c.node === 4 ? 'text-[14px]' : 'text-[12px]'}`}
                  style={{ color: focused ? '#fff' : 'var(--tx1)' }}>
                  {de ? c.graphLabelDe : c.graphLabelEn}
                </span>
                <span className="block num-data text-[11px]"
                  style={{ color: focused ? 'rgba(255,255,255,0.9)' : 'var(--accent-soft)' }}>
                  {c.metric}
                </span>
              </div>
            );
          })}
          {edgeGeo.map(({ e, a, b, c }, i) => {
            if (!activeEdges.has(i)) return null;
            const t = focusNode === e.to ? 0.6 : 0.4;     // ride the label out toward the focused node
            const p = quadPoint(a.cx, a.cy, c.x, c.y, b.cx, b.cy, t);
            return (
              <EdgeLabel key={`e-${i}`} x={p.x} y={p.y} vbW={VB_W} vbH={VB_H} on>
                {de ? e.labelDe : e.labelEn}
              </EdgeLabel>
            );
          })}
        </div>
      </div>

      {/* ── Readout + transport ──────────────────────────────────────────────── */}
      <div className="mt-3 rounded-xl px-4 py-3.5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
        <div aria-live="polite" className="min-h-[68px]">
          {hover != null && focusComp ? (
            <>
              <p className="eyebrow mb-1" style={{ color: 'var(--accent)' }}>{de ? focusComp.roleDe : focusComp.roleEn}</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display font-bold text-[15px]" style={{ color: 'var(--tx1)' }}>{de ? focusComp.nameDe : focusComp.nameEn}</span>
                <span className="num-data text-[12px]" style={{ color: 'var(--accent-soft)' }}>{focusComp.metric}</span>
              </div>
              <p className="text-[12.5px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>{de ? focusComp.whyDe : focusComp.whyEn}</p>
            </>
          ) : !done && focusComp ? (
            <>
              <p className="eyebrow mb-1" style={{ color: 'var(--accent-soft)' }}>
                {(de ? 'Schritt ' : 'Step ') + (step + 1) + '/' + STEPS} · {de ? focusComp.roleDe : focusComp.roleEn}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display font-bold text-[15px]" style={{ color: 'var(--tx1)' }}>{de ? focusComp.nameDe : focusComp.nameEn}</span>
                <span className="num-data text-[12px]" style={{ color: 'var(--accent-soft)' }}>{focusComp.metric}</span>
              </div>
              <p className="text-[12.5px] leading-snug mt-1" style={{ color: 'var(--tx2)' }}>{de ? FORMULA_STORY[step].captionDe : FORMULA_STORY[step].captionEn}</p>
            </>
          ) : (
            <>
              <p className="eyebrow mb-1" style={{ color: 'var(--accent-soft)' }}>{de ? 'Pro-Formel' : 'Pro formula'}</p>
              <p className="text-[12.5px] leading-snug mt-1" style={{ color: 'var(--tx2)' }}>{de ? STORY_DONE.de : STORY_DONE.en}</p>
            </>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          {/* progress dots — scrub the build */}
          <div className="flex items-center gap-1.5" role="group" aria-label={de ? 'Aufbauschritt' : 'Assembly step'}>
            {FORMULA_STORY.map((_, i) => {
              const reached = !done && i === step;
              const past = i < Math.min(step, STEPS - 1) + 1;
              return (
                <button key={i} type="button" onClick={() => jumpTo(i)}
                  aria-label={(de ? 'Schritt ' : 'Step ') + (i + 1)}
                  className="rounded-full transition-all"
                  style={{
                    width: reached ? 22 : 8, height: 8,
                    background: reached ? 'var(--accent)' : past ? 'rgba(var(--accent-rgb),0.45)' : 'var(--bd)',
                  }} />
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* legend — solid = build, dashed = protection */}
            <div className="hidden sm:flex items-center gap-3 text-[10.5px]" style={{ color: 'var(--txm)' }}>
              <span className="flex items-center gap-1.5"><LegendSwatch /> {de ? 'Aufbau' : 'Build'}</span>
              <span className="flex items-center gap-1.5"><LegendSwatch dashed /> {de ? 'Schutz' : 'Guard'}</span>
            </div>
            {!reduced && (
              <button type="button" onClick={onPlayPause}
                aria-label={done ? (de ? 'Erneut abspielen' : 'Replay') : playing ? (de ? 'Pause' : 'Pause') : (de ? 'Abspielen' : 'Play')}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
                style={{ background: 'rgba(var(--accent-rgb),0.10)', border: '1px solid rgba(var(--accent-rgb),0.22)', color: 'var(--accent)' }}>
                {done ? <RotateCcw className="h-3.5 w-3.5" /> : playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {done ? (de ? 'Wiederholen' : 'Replay') : playing ? (de ? 'Pause' : 'Pause') : (de ? 'Abspielen' : 'Play')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
