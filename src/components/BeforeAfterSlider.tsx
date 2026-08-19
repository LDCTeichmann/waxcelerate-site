// ─── BeforeAfterSlider — Ziehvergleich zweier Aufnahmen ──────────────────────
//
// Lag bis 08/2026 als lokale Komponente in SciencePage.tsx. Hierher gezogen,
// weil die Startseite (why-wax.tsx) dieselbe Gegenueberstellung braucht: die
// Mikroskopaufnahmen sind der einzige echte Eigenbeleg der Marke, und sie
// standen bisher ausschliesslich auf /wissenschaft, also hinter einem Klick,
// den die meisten Besucher nie machen. Unveraendert uebernommen — gleiche
// Sweep-Logik, gleiche Bedienung, nur nicht mehr an eine Seite gebunden.

import { useEffect, useRef, useState } from 'react';
import { ChevronsLeftRight, Hand } from 'lucide-react';

// Drag-to-reveal before/after — replaces a static side-by-side pair with an
// interactive one. Pointer position controls a clip-path on the "before"
// layer, so dragging left reveals more of the treated surface underneath.
export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt, beforeLabel, afterLabel }: {
  beforeSrc: string; afterSrc: string; beforeAlt: string; afterAlt: string;
  beforeLabel: string; afterLabel: string;
}) {
  const [pct, setPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  // Feedback (real users, not a guess): (1) the first version of this demo
  // moved in three ~450ms hops with a 500ms transition on each — each new
  // hop interrupted the previous one before it finished, which read as a
  // rushed stutter, not a drag. (2) It also only ever played once per visit,
  // so anyone not looking at that exact card in that exact second missed it
  // for good. Fixed here: one slow, smooth two-second there-and-back sweep,
  // repeating every 6s, forever — not just once — until the first real
  // drag/tap/arrow-key, which stops it for good (once you know, the motion
  // is just noise). A drifting hand-cursor icon rides along with the handle
  // during the sweep as a second, more literal "you can grab this" signal
  // alongside the pulse on the handle itself.
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inView, setInView] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(100, Math.max(0, raw)));
  };

  // Only sweep while the card is actually on screen — no point animating a
  // hint nobody can see, and it wastes the "still going" budget before
  // someone scrolls to it.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sweepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (!inView || hasInteracted) return;
    let cancelled = false;
    const runSweep = () => {
      if (cancelled || draggingRef.current || hasInteracted) return;
      setSweeping(true);
      sweepTimersRef.current.push(setTimeout(() => { if (!draggingRef.current && !hasInteracted) setPct(28); }, 50));
      sweepTimersRef.current.push(setTimeout(() => { if (!draggingRef.current && !hasInteracted) setPct(72); }, 1050));
      sweepTimersRef.current.push(setTimeout(() => { if (!draggingRef.current && !hasInteracted) setPct(50); }, 2050));
      sweepTimersRef.current.push(setTimeout(() => setSweeping(false), 3050));
    };
    const initialDelay = setTimeout(runSweep, 800);
    // 20s, not 6s — "shouldn't move all the time" (real feedback). Frequent
    // enough that most people scrolling past will catch it once, rare enough
    // that it reads as an occasional hint, not a distraction competing with
    // reading the actual comparison.
    const iv = setInterval(runSweep, 20000);
    return () => {
      cancelled = true;
      clearTimeout(initialDelay);
      clearInterval(iv);
      sweepTimersRef.current.forEach(clearTimeout);
      sweepTimersRef.current = [];
    };
  }, [inView, hasInteracted]);

  const markInteracted = () => {
    if (!hasInteracted) setHasInteracted(true);
    setSweeping(false);
    sweepTimersRef.current.forEach(clearTimeout);
    sweepTimersRef.current = [];
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      if (clientX != null) updateFromClientX(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label={`${beforeLabel} / ${afterLabel}`}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className="relative select-none rounded-xl overflow-hidden aspect-[4/3] mx-3 mb-3"
      style={{ background: 'var(--hero-stage)', cursor: 'ew-resize', touchAction: 'none' }}
      onMouseDown={(e) => { draggingRef.current = true; markInteracted(); updateFromClientX(e.clientX); }}
      onTouchStart={(e) => { draggingRef.current = true; markInteracted(); updateFromClientX(e.touches[0].clientX); }}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        markInteracted();
        if (e.key === 'ArrowLeft') setPct(p => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setPct(p => Math.min(100, p + 5));
      }}
    >
      <img src={afterSrc} alt={afterAlt} className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)`, transition: sweeping ? 'clip-path 1s ease-in-out' : 'none' }}
      >
        <img src={beforeSrc} alt={beforeAlt} className="absolute inset-0 w-full h-full object-contain" draggable={false} />
      </div>

      {/* Hand cursor — rides along with the handle only during the automatic
          sweep, as a second and more literal "you can grab this" signal next
          to the pulsing handle. Own transition (slightly slower + a small
          vertical bob) so it visibly trails the handle instead of feeling
          welded to it, closer to how a real drag looks. */}
      <div
        aria-hidden
        className="absolute top-1/2 pointer-events-none"
        style={{
          left: `${pct}%`,
          transform: 'translate(-30%, -20%)',
          opacity: sweeping ? 1 : 0,
          transition: sweeping ? 'left 1.15s ease-in-out, opacity 0.3s ease' : 'opacity 0.3s ease',
        }}
      >
        {/* Dark backdrop circle, not just a drop-shadow on the icon — a white
            hand only reads on white against the darker half of the
            comparison. A drop-shadow alone still let it wash out over light
            micrograph areas (real feedback: "hard to see them"). Same
            any-background-contrast fix already used for the gallery's own
            page-number rail a few components up. */}
        <div className="flex items-center justify-center rounded-full"
          style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(3px)' }}>
          <Hand className="h-[18px] w-[18px]" style={{ color: '#fff' }} strokeWidth={2} />
        </div>
      </div>

      {/* Handle — idle pulse until the first real drag/tap/arrow-key,
          then it stops for good; see the comment on hasInteracted above. */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{ left: `${pct}%`, transition: sweeping ? 'left 1s ease-in-out' : 'none' }}
      >
        <div className="absolute inset-y-0" style={{ width: 1.5, left: 0, transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)' }} />
        <div
          className="absolute top-1/2 left-0 flex items-center justify-center rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-[1.15]"
          style={{
            width: 32, height: 32, background: '#fff', pointerEvents: 'auto',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            animation: hasInteracted ? 'none' : 'wx-slider-pulse 1.8s ease-in-out infinite',
          }}>
          <ChevronsLeftRight className="h-4 w-4" style={{ color: '#101013' }} strokeWidth={2.25} />
        </div>
      </div>

      {/* Labels — fade with proximity so they don't fight the handle */}
      <span className="absolute top-2 left-2 text-meta uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
        style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.35)' }}>
        {beforeLabel}
      </span>
      <span className="absolute top-2 right-2 text-meta uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
        style={{ color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.35)' }}>
        {afterLabel}
      </span>
    </div>
  );
}
