import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { SegmentedToggle } from '@/components/viz';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { diveFormula, type ScienceComponent } from '@/lib/science';

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

// Radial map geometry — the paraffin matrix is the hub, additives orbit it.
const VB_W = 440, VB_H = 420;
const CX = 220, CY = 210;
const ORBIT_R = 140, HUB_R = 48, NODE_R = 35;

/**
 * WaxDive — the "look inside the wax" experience.
 *
 * LEFT: a radial system map — paraffin (the carrier matrix) sits at the centre,
 * every other component orbits it on a spoke, because everything is embedded in
 * that matrix. Nodes pop in, spokes draw, the selected node pulses; hovering
 * lifts a node. RIGHT: the selected component's card (role, metric, summary, a
 * compact diagram, the development insight) deep-linking to /wissenschaft#id.
 *
 * Themed entirely with design tokens (light in light mode) and rendered through
 * a portal so the hero white-heading rule doesn't leak in. Classic and Pro list
 * only what each variant genuinely contains.
 */
export function WaxDive({ open, onClose, de }: { open: boolean; onClose: () => void; de: boolean }) {
  const [variant, setVariant] = useState<'classic' | 'pro'>('pro');
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const components = diveFormula(variant);
  const active = components.find(c => c.id === activeId) ?? components[0];
  const hub = components[0];
  const orbitals = components.slice(1);
  const layout = orbitals.map((c, i) => {
    const a = (-90 + (360 / orbitals.length) * i) * Math.PI / 180;
    return { c, x: CX + ORBIT_R * Math.cos(a), y: CY + ORBIT_R * Math.sin(a), ang: a };
  });
  const activePos = active.id === hub.id
    ? { x: CX, y: CY, r: HUB_R }
    : (() => { const f = layout.find(l => l.c.id === active.id)!; return { x: f.x, y: f.y, r: NODE_R }; })();

  useEffect(() => { setActiveId(null); }, [variant]);

  // Body scroll lock + Escape + initial focus.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Spokes draw in on open / variant switch; the hint arrow nudges.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const svg = svgRef.current;
    if (!svg) return;
    const ctx = gsap.context(() => {
      const spokes = svg.querySelectorAll<SVGLineElement>('[data-spoke]');
      spokes.forEach((ln) => {
        const len = ln.getTotalLength?.() ?? 200;
        gsap.fromTo(ln, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 });
      });
      gsap.to('[data-nudge]', { x: 4, repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut' });
    }, svg);
    return () => ctx.revert();
  }, [open, variant]);

  // Selection ring pulses around the active node.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const svg = svgRef.current;
    const ring = svg?.querySelector('[data-pulse]') as SVGCircleElement | null;
    if (!ring) return;
    const cx = ring.getAttribute('cx'); const cy = ring.getAttribute('cy');
    const tw = gsap.fromTo(ring,
      { scale: 1, opacity: 0.5 },
      { scale: 1.4, opacity: 0, duration: 1.5, ease: 'power1.out', repeat: -1, svgOrigin: `${cx} ${cy}` });
    return () => { tw.kill(); gsap.set(ring, { opacity: 0 }); };
  }, [active.id, open, variant]);

  // Detail cross-fades when the selection changes.
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const el = detailRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [active.id, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(10,10,12,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Blick ins Wachs' : 'Inside the wax'}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl outline-none"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad), 0 40px 100px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-7 py-4"
          style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--bd)', backdropFilter: 'blur(10px)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)' }}>
              {de ? 'Blick ins Wachs' : 'Inside the wax'}
            </p>
            <p className="font-display font-bold text-[17px] leading-tight mt-0.5" style={{ color: 'var(--tx1)' }}>
              {de ? 'Die Formel unter der Lupe' : 'The formula up close'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SegmentedToggle
              ariaLabel={de ? 'Formel' : 'Formula'}
              value={variant}
              onChange={setVariant}
              className="w-[150px]"
              options={[{ value: 'classic', label: 'Classic' }, { value: 'pro', label: 'Pro' }]}
            />
            <button
              onClick={onClose}
              aria-label={de ? 'Schließen' : 'Close'}
              className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 btn-ghost"
              style={{ border: '1px solid var(--bd)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-5 sm:gap-7 p-5 sm:p-7">

          {/* LEFT — radial system map */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="eyebrow" style={{ color: 'var(--txf)' }}>
                {de ? `Aufbau · ${components.length} Komponenten` : `System · ${components.length} components`}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                {de ? 'Tippe einen Knoten' : 'Tap a node'}
                <ArrowRight data-nudge className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="relative rounded-xl" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto"
                role="group" aria-label={de ? 'Aufbau der Formel' : 'Formula system'}>
                <defs>
                  <radialGradient id="diveHubGlow" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="rgba(var(--accent-rgb),0.10)" />
                    <stop offset="1" stopColor="rgba(var(--accent-rgb),0)" />
                  </radialGradient>
                </defs>

                {/* matrix field — faint glow + orbit ring */}
                <circle cx={CX} cy={CY} r={ORBIT_R + 30} fill="url(#diveHubGlow)" />
                <circle cx={CX} cy={CY} r={ORBIT_R} fill="none" stroke="var(--bd)" strokeWidth={1} strokeDasharray="3 6" opacity={0.7} />

                {/* spokes hub → orbital */}
                {layout.map((l) => {
                  const on = active.id === l.c.id;
                  return (
                    <line key={`s-${l.c.id}`} data-spoke x1={CX} y1={CY} x2={l.x} y2={l.y}
                      stroke={on ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.28)'}
                      strokeWidth={on ? 2.5 : 1.5} strokeLinecap="round"
                      style={{ transition: 'stroke 0.25s, stroke-width 0.25s' }} />
                  );
                })}

                {/* pulse ring behind active node */}
                <circle data-pulse cx={activePos.x} cy={activePos.y} r={activePos.r + 6}
                  fill="none" stroke="var(--accent)" strokeWidth={1.5} opacity={0} />

                {/* orbital metric labels (outside the hover-scaling node groups) */}
                {layout.map((l) => {
                  const mr = NODE_R + 13;
                  const mx = l.x + mr * Math.cos(l.ang);
                  const my = l.y + mr * Math.sin(l.ang);
                  const on = active.id === l.c.id;
                  return (
                    <text key={`m-${l.c.id}`} x={mx} y={my} textAnchor="middle" dominantBaseline="middle"
                      fontSize={9.5} fontFamily={MONO} fill={on ? 'var(--accent)' : 'var(--txm)'}
                      style={{ pointerEvents: 'none', transition: 'fill 0.25s' }}>
                      {l.c.metric}
                    </text>
                  );
                })}

                {/* hub */}
                <DiveNode c={hub} x={CX} y={CY} r={HUB_R} isHub index={0} de={de}
                  selected={active.id === hub.id} onSelect={() => setActiveId(hub.id)} />
                {/* orbital nodes */}
                {layout.map((l, i) => (
                  <DiveNode key={l.c.id} c={l.c} x={l.x} y={l.y} r={NODE_R} index={i + 1} de={de}
                    selected={active.id === l.c.id} onSelect={() => setActiveId(l.c.id)} />
                ))}
              </svg>
            </div>

            <p className="text-[11px] mt-3" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Paraffin bildet die Matrix — alles andere ist darin eingebettet. Die Abstimmung ist die eigentliche Rezeptur.'
                : 'Paraffin forms the matrix — everything else is embedded in it. The balance is the real recipe.'}
            </p>
          </div>

          {/* RIGHT — selected component detail */}
          <div ref={detailRef} className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="font-display font-bold text-[1.25rem] leading-tight" style={{ color: 'var(--tx1)' }}>
                {de ? active.nameDe : active.nameEn}
              </h3>
              <span className="num-data font-semibold text-[15px]" style={{ color: 'var(--accent)' }}>
                {active.metric}
              </span>
            </div>
            <p className="eyebrow mt-1.5" style={{ color: 'var(--accent)' }}>
              {de ? active.roleDe : active.roleEn}
            </p>
            <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--tx2)' }}>
              {de ? active.sumDe : active.sumEn}
            </p>

            {/* compact diagram — deliberately small */}
            <div className="mt-4 max-w-[300px]">
              <ComponentDiagram which={active.diagram} de={de} />
            </div>

            <p className="text-[13px] leading-relaxed italic mt-4 pl-3"
              style={{ borderLeft: '2px solid var(--accent)', color: 'var(--txm)' }}>
              {de ? active.insightDe : active.insightEn}
            </p>

            <Link
              to={`/wissenschaft#${active.id}`}
              onClick={onClose}
              className="group inline-flex items-center gap-1.5 mt-5 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              {de ? 'Die ganze Geschichte' : 'The full story'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// One node of the map (wrapper component → no hooks in .map). Pops in on mount,
// lifts on hover, and flips to the accent fill when selected.
function DiveNode({ c, x, y, r, isHub, index, de, selected, onSelect }: {
  c: ScienceComponent; x: number; y: number; r: number; isHub?: boolean;
  index: number; de: boolean; selected: boolean; onSelect: () => void;
}) {
  const gref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const g = gref.current;
    if (!g) return;
    const t = gsap.from(g, { opacity: 0, scale: 0.4, duration: 0.5, ease: 'back.out(1.7)', delay: 0.2 + index * 0.06, svgOrigin: `${x} ${y}` });
    return () => { t.kill(); };
  }, []); // mount only

  const scaleTo = (s: number, d: number) => {
    if (!prefersReducedMotion()) gsap.to(gref.current, { scale: s, duration: d, svgOrigin: `${x} ${y}`, overwrite: 'auto' });
  };

  return (
    <g
      ref={gref}
      data-dive-node
      role="button"
      tabIndex={0}
      aria-label={de ? c.nameDe : c.nameEn}
      style={{ cursor: 'pointer', outline: 'none' }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      onMouseEnter={() => scaleTo(1.07, 0.2)}
      onMouseLeave={() => scaleTo(1, 0.3)}
    >
      <circle
        cx={x} cy={y} r={r}
        fill={selected ? 'var(--accent)' : 'var(--sf)'}
        stroke={selected ? 'var(--accent)' : 'var(--bd)'}
        strokeWidth={selected ? 2 : 1.5}
        style={{
          filter: selected
            ? 'drop-shadow(0 6px 16px rgba(var(--accent-rgb),0.35))'
            : 'drop-shadow(0 3px 8px rgba(0,0,0,0.12))',
          transition: 'fill 0.25s, stroke 0.25s',
        }}
      />
      <text x={x} y={isHub ? y - 3 : y + 1} textAnchor="middle" fontSize={isHub ? 13 : 10}
        fontWeight={600} fill={selected ? '#fff' : 'var(--tx1)'} style={{ pointerEvents: 'none' }}>
        {de ? c.graphLabelDe : c.graphLabelEn}
      </text>
      {isHub && (
        <text x={x} y={y + 14} textAnchor="middle" fontSize={10} fontFamily={MONO}
          fill={selected ? 'rgba(255,255,255,0.85)' : 'var(--txm)'} style={{ pointerEvents: 'none' }}>
          {c.metric}
        </text>
      )}
    </g>
  );
}
