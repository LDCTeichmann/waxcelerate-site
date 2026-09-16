// ─── GiftCardObject — die Stempelkarte als Gegenstand ───────────────────────
//
// Die gedruckte Geschenkkarte als Objekt: leicht gedreht, mit Tiefe und
// Lichtkante, die Stempel füllen sich nacheinander (einmal pro Sichtbarkeit,
// dann Pause, dann von vorn). Genutzt von der Geschenk-Sektion auf
// /kette-wachsen-lassen (löst StampCard + GiftPreviewModal ab). Bei
// prefers-reduced-motion: keine Neigung, alle Stempel still gesetzt.

import { useEffect, useRef, useState } from 'react';
import { WaxcelerateMark } from '@/components/WaxcelerateMark';
import { prefersReducedMotion } from '@/hooks/useAnimation';

const STAMP_STAGGER_MS = 700;
const STAMP_HOLD_MS = 3200;
const STAMP_EMPTY_PAUSE_MS = 1100;

export function GiftCardObject({ count, de, animate = true, tilt = -3 }: {
  count: number; de: boolean; animate?: boolean; tilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced] = useState(() => prefersReducedMotion());
  const live = animate && !reduced;
  const [inView, setInView] = useState(false);
  const [stamped, setStamped] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!live) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  // Stempel-Schleife; neu gestartet, wenn sich die Kartengröße ändert.
  useEffect(() => {
    if (!live || !inView) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const run = (i: number) => {
      if (cancelled) return;
      if (i <= count) {
        setStamped(i);
        timer = setTimeout(() => run(i + 1), STAMP_STAGGER_MS);
      } else {
        timer = setTimeout(() => {
          if (cancelled) return;
          setStamped(0);
          timer = setTimeout(() => run(1), STAMP_EMPTY_PAUSE_MS);
        }, STAMP_HOLD_MS);
      }
    };
    setStamped(0);
    timer = setTimeout(() => run(1), 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [live, inView, count]);

  const onMove = (e: React.PointerEvent) => {
    if (!live || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setPointer({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const cols = count > 5 ? 5 : count;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[360px]" style={{ perspective: 900 }}
      onPointerMove={onMove} onPointerLeave={() => setPointer({ x: 0, y: 0 })}>
      <div
        className="relative rounded-[20px] p-5 sm:p-6 overflow-hidden transition-transform duration-300 ease-out"
        style={{
          background: 'linear-gradient(150deg, var(--sf) 0%, var(--sf2) 100%)',
          border: '1px solid rgba(var(--accent-rgb),0.28)',
          boxShadow: '0 30px 60px -18px rgba(0,0,0,0.35), 0 10px 24px -10px rgba(0,0,0,0.22)',
          transform: `rotate(${tilt}deg) rotateX(${-pointer.y * 8}deg) rotateY(${pointer.x * 10}deg)`,
        }}
      >
        {/* Lichtkante, folgt der Maus */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(420px circle at ${50 + pointer.x * 80}% ${20 + pointer.y * 60}%, rgba(255,255,255,0.22), transparent 55%)` }} />
        {/* Akzentband */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--accent)' }} />

        {/* Kopfzeile: Marke links, „ohne Ablauf" als Pille rechts. Beides
            nowrap; bei schmaler Karte rutscht die Pille in die zweite Zeile,
            statt dass die Wörter ineinander umbrechen (Luca, 16.09.2026). */}
        <div className="relative flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-5 h-5 flex-shrink-0"><WaxcelerateMark className="w-full h-full" /></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--txf)' }}>
              {de ? 'Geschenkkarte' : 'Gift card'}
            </span>
          </span>
          <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: 'var(--accent-wash)', color: 'var(--accent)' }}>
            {de ? 'ohne Ablauf' : 'no expiry'}
          </span>
        </div>

        <p className="relative font-display font-bold leading-[1.05] mt-4" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>
          {de ? <>{count}× frisch<br />gewachst.</> : <>{count}× freshly<br />waxed.</>}
        </p>

        <div className="relative grid gap-1.5 mt-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} aria-hidden>
          {Array.from({ length: count }, (_, i) => {
            // Ohne Bewegung: alle Stempel gesetzt, still — die Karte zeigt, was sie ist.
            const on = live ? i < stamped : true;
            return (
              <div key={i} className="rounded-lg flex items-center justify-center"
                style={{
                  aspectRatio: '1 / 1', border: '1px dashed rgba(var(--accent-rgb),0.35)', background: 'var(--sf)',
                  ...(on && live ? { animationName: 'wx-stamp-ring', animationDuration: '1000ms', animationTimingFunction: 'ease-out', animationFillMode: 'forwards' } : null),
                }}>
                <div className="w-[60%] h-[60%]"
                  style={on && live
                    ? { animationName: 'wx-stamp-pop', animationDuration: '1000ms', animationTimingFunction: 'cubic-bezier(0.34, 1.42, 0.64, 1)', animationFillMode: 'forwards' }
                    : on ? undefined : { filter: 'grayscale(1) opacity(0.3)' }}>
                  <WaxcelerateMark className="w-full h-full" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mt-5 pt-3" style={{ borderTop: '1px dashed var(--bd2)' }}>
          <div className="flex items-end gap-2">
            <span className="text-[11px]" style={{ color: 'var(--txf)' }}>{de ? 'Für' : 'For'}</span>
            <span className="flex-1 h-4" style={{ borderBottom: '1px solid var(--bd2)' }} />
          </div>
          <p className="num text-[10px] tracking-[0.2em] mt-3" style={{ color: 'var(--txff)' }}>CODE · ● ● ● ● ● ●</p>
        </div>
      </div>
    </div>
  );
}
