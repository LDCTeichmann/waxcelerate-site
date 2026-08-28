import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { COMPONENTS, EDGES, FORMULA_STORY, STORY_DONE, type ScienceComponent } from '@/lib/science';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { curvedEdge, quadPoint, NodeCircle, EdgeLabel, LegendSwatch, type NodeState } from '@/sections/science/graphPrimitives';

// Viewbox is cropped tight around the node layout (COMPONENTS' cx/cy/r span
// x:[120,580] y:[45,435] in the original 700x480 space) instead of centering
// it in a much larger box. Mobile renders this at full device width, so the
// old margins (120px horizontal, 45px vertical) were pure dead space eaten
// out of the only budget mobile has — cropping to a 55/35px margin (still
// comfortably beyond the +18px active-glow and +14px hub-halo reach) makes
// every node and label render ~23% larger on the same screen, at zero cost
// on desktop where there was room to spare anyway.
const VB_X = 65, VB_Y = 10, VB_W = 570, VB_H = 460;
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
  // Der fokussierte Knoten waechst leicht mit. Vorher unterschied sich aktiv
  // von inaktiv nur durch Fuellfarbe und Deckkraft, beides Eigenschaften, die
  // hart umschalten — der Wechsel von Knoten zu Knoten sah dadurch aus wie ein
  // Sprung, nicht wie eine Bewegung. Eine mitlaufende Skalierung gibt dem
  // Uebergang eine Richtung. Die Dauern sind laenger und alle auf dieselbe
  // weiche Kurve gelegt (kein Overshoot mehr beim Aufbau: der 1.56er-Rueckwurf
  // wirkte bei sechs schnell nacheinander aufpoppenden Knoten unruhig).
  const scale = !built ? 0.4 : focused ? 1.06 : 1;
  return (
    <g
      data-node
      role="button" tabIndex={built ? 0 : -1}
      aria-label={de ? c.nameDe : c.nameEn}
      style={{
        cursor: 'pointer', outline: 'none',
        opacity, transform: `scale(${scale})`,
        transformBox: 'fill-box', transformOrigin: 'center',
        transition: reduced ? 'none' : 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
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
      <circle cx={c.cx} cy={c.cy} r={c.r + 12} fill="transparent" />
    </g>
  );
}

export function FormulaGraph({ de, onSelect, scrollFocus, compact, mobile }: { de: boolean; onSelect: (id: string) => void; scrollFocus?: number | null; compact?: boolean; mobile?: boolean }) {
  const [reduced] = useState(() => prefersReducedMotion());
  // step ∈ [0 … STEPS]; STEPS === fully assembled, resting state (no active node).
  const [step, setStep] = useState(STEPS);
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  // Last-tapped node, kept highlighted once the build finishes. Only matters
  // when the caller doesn't drive focus itself via `scrollFocus` (i.e. the
  // mobile stacked view): without this, focus dropped to nothing the moment
  // the intro autoplay ended and hover/story-step both went idle, so the
  // whole diagram went flat and pale — exactly when a user is expected to
  // start tapping around it. Defaults to the first component so the graph
  // reads as "alive" even before the first tap, matching the detail card
  // mobile shows underneath (SciencePage defaults mobileCompId the same way).
  const [picked, setPicked] = useState<number | null>(COMPONENTS[0]?.node ?? null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<number | undefined>(undefined);

  // Edge geometry is state-independent — compute once.
  const edgeGeo = useMemo(() => EDGES.map((e) => {
    const a = byNode(e.from), b = byNode(e.to);
    const { d, c } = curvedEdge(a.cx, a.cy, b.cx, b.cy, 0.09, a.r + 4, b.r + 4);
    return { e, d, a, b, c };
  }), []);

  // What's on the stage = the union of every step up to `step`.
  const builtSteps = FORMULA_STORY.slice(0, Math.min(step, STEPS - 1) + 1);
  const builtNodes = new Set(builtSteps.map(s => s.node));
  const builtEdges = new Set(builtSteps.flatMap(s => s.edges));
  const done = step >= STEPS;

  // Focus = hover > scroll-linked > current step's node > last tapped.
  const focusNode = hover != null ? hover : (!done ? FORMULA_STORY[step].node : (scrollFocus ?? picked));
  // Highlighted edges: when hovering, every built edge touching the focus node;
  // during the build, exactly the current step's edges (one relationship at a time).
  const activeEdges = new Set<number>();
  if (hover != null) {
    EDGES.forEach((e, i) => { if (builtEdges.has(i) && (e.from === hover || e.to === hover)) activeEdges.add(i); });
  } else if (!done) {
    FORMULA_STORY[step].edges.forEach(i => activeEdges.add(i));
  } else if (focusNode != null) {
    EDGES.forEach((e, i) => { if (e.from === focusNode || e.to === focusNode) activeEdges.add(i); });
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
    if (!root || reduced || compact) return;
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
  const onPick = (id: string) => {
    setPlaying(false);
    const c = COMPONENTS.find(c => c.id === id);
    if (c) setPicked(c.node);
    onSelect(id);
  };

  const jumpTo = (i: number) => { setHover(null); setPlaying(false); setStep(i); };
  const onPlayPause = () => {
    if (done) { setHover(null); setStep(0); setPlaying(true); }
    else setPlaying(p => !p);
  };

  const focusComp = focusNode != null ? byNode(focusNode) : null;

  return (
    <div ref={rootRef}>
      <div className="relative">
        <svg viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ overflow: 'visible' }}
          role="group" aria-label={de ? 'Aufbau der Formel' : 'Formula assembly'}>
          <g data-edges>
            {edgeGeo.map(({ e, d }, i) => {
              const built = builtEdges.has(i);
              const act = activeEdges.has(i);
              const op = !built ? 0 : focusNode == null ? (e.main ? 0.5 : 0.34) : act ? 1 : 0.1;
              // DESIGN.md §2's dw-hair/line/bold scale is theme-aware (noir
              // strokes run thinner so they don't optically bloom on black);
              // act (the one highlighted edge) is the figure's "signal" tier,
              // everything else is plain geometry — matches ChainWaxMap.tsx's
              // token usage instead of the theme-fixed pixel values this used.
              const w = act ? 'var(--dw-bold)' : 'var(--dw-line)';
              return (
                <g key={i}>
                  <path d={d} fill="none"
                    stroke={act ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.34)'}
                    strokeWidth={w} strokeDasharray={e.dash ? '5 5' : undefined} strokeLinecap="round"
                    style={{ opacity: op, transition: reduced ? 'none' : 'opacity 0.35s ease, stroke 0.3s ease' }} />
                  {/* directional flow comet on the highlighted edge(s) */}
                  {act && !reduced && (
                    <path d={d} fill="none" pathLength={100} className="graph-flow"
                      stroke="var(--accent)" strokeWidth="var(--dw-bold)"
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
                  left: `${((c.cx - VB_X) / VB_W) * 100}%`, top: `${((c.cy - VB_Y) / VB_H) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: !built ? 0 : dimmed ? 0.42 : 1,
                  transition: reduced ? 'none' : 'opacity 0.3s ease',
                }}>
                {/* Nur noch der Name, keine Messzahl mehr.
                    Die Messzahl stand hier UND direkt darunter in der
                    Detailkarte (mobil) beziehungsweise daneben in der linken
                    Spalte (Desktop) — dieselbe Angabe zweimal auf einem
                    Bildschirm. Auf dem Knoten war sie ausserdem die zweite von
                    zwei Textzeilen in einem Kreis von 30 bis 40 Pixeln
                    Durchmesser: Sechs solche Knoten mit je zwei Zeilen sind
                    genau das, was den Graphen gedraengt aussehen liess. Eine
                    Zeile pro Knoten halbiert die Textmenge in der Figur, und
                    die Zahl steht unveraendert dort, wo man sie liest, sobald
                    man einen Knoten antippt. */}
                <span className={`block font-semibold ${c.node === 4 ? 'text-[13px]' : 'text-meta'}`}
                  style={{ color: focused ? '#fff' : 'var(--tx1)', lineHeight: 1.2 }}>
                  {de ? c.graphLabelDe : c.graphLabelEn}
                </span>
              </div>
            );
          })}
          {edgeGeo.map(({ e, a, b, c }, i) => {
            if (!activeEdges.has(i)) return null;
            // On mobile the resting/tapped state (see `picked` above) keeps a
            // hub node focused permanently, which can highlight 3-5 edges at
            // once (e.g. MoS₂). At mobile width there isn't room for that
            // many relationship pills without them colliding with the
            // neighbouring node's own label — confirmed by measuring actual
            // rendered rects, e.g. "Plastifiziert" landed directly on top of
            // "Mikrokris.". Gating this on `hover` alone isn't enough: a real
            // tap fires a browser-compat "mouseenter" too, so hover ends up
            // set right after every tap, not just on genuine desktop hover.
            // The full relationship is already spelled out in the CompCard
            // below once tapped, so mobile skips the pill outright and keeps
            // just the coloured line.
            if (mobile) return null;
            const t = focusNode === e.to ? 0.35 : 0.65;
            const p = quadPoint(a.cx, a.cy, c.x, c.y, b.cx, b.cy, t);
            return (
              <EdgeLabel key={`e-${i}`} x={p.x - VB_X} y={p.y - VB_Y} vbW={VB_W} vbH={VB_H} on>
                {de ? e.labelDe : e.labelEn}
              </EdgeLabel>
            );
          })}
        </div>
      </div>

      {/* ── Readout + transport (hidden in compact/scroll-driven mode) ────── */}
      {!compact && (
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
            <div className="flex items-center gap-1.5" role="group" aria-label={de ? 'Aufbauschritt' : 'Assembly step'}>
              {FORMULA_STORY.map((_, i) => {
                const reached = !done && i === step;
                const past = i < Math.min(step, STEPS - 1) + 1;
                return (
                  <button key={i} type="button" onClick={() => jumpTo(i)}
                    aria-label={(de ? 'Schritt ' : 'Step ') + (i + 1)}
                    className="relative rounded-full transition-all after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-11 after:h-11"
                    style={{
                      width: reached ? 22 : 8, height: 8,
                      background: reached ? 'var(--accent)' : past ? 'rgba(var(--accent-rgb),0.45)' : 'var(--bd)',
                    }} />
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-[10.5px]" style={{ color: 'var(--txm)' }}>
                <span className="flex items-center gap-1.5"><LegendSwatch /> {de ? 'Aufbau' : 'Build'}</span>
                <span className="flex items-center gap-1.5"><LegendSwatch dashed /> {de ? 'Schutz' : 'Guard'}</span>
              </div>
              {!reduced && (
                <button type="button" onClick={onPlayPause}
                  aria-label={done ? (de ? 'Erneut abspielen' : 'Replay') : playing ? (de ? 'Pause' : 'Pause') : (de ? 'Abspielen' : 'Play')}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-meta font-semibold transition-colors"
                  style={{ background: 'var(--accent-wash)', border: '1px solid rgba(var(--accent-rgb),0.22)', color: 'var(--accent)' }}>
                  {done ? <RotateCcw className="h-3.5 w-3.5" /> : playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {done ? (de ? 'Wiederholen' : 'Replay') : playing ? (de ? 'Pause' : 'Pause') : (de ? 'Abspielen' : 'Play')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
