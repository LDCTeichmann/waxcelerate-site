import { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function BeforeAfterSlider() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50); // percent
  const dragging = useRef(false);
  const autoAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = (v: number) => Math.max(5, Math.min(95, v));

  const posFromEvent = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 100);
  }, []);

  // Pointer handlers
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    if (autoAnimRef.current) clearTimeout(autoAnimRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setPos(posFromEvent(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos(posFromEvent(e.clientX));
  };
  const onPointerUp = () => { dragging.current = false; };

  // Auto-animate on first entry to telegraph interaction
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // Sweep left then settle at 50%
      let frame: number;
      const start = performance.now();
      const animate = (now: number) => {
        const t = Math.min((now - start) / 1800, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        // Go from 50 → 20 → 50
        const sweep = t < 0.5
          ? 50 - 30 * eased * 2
          : 20 + 30 * (eased - 0) * 2;
        setPos(clamp(sweep));
        if (t < 1) frame = requestAnimationFrame(animate);
      };
      autoAnimRef.current = setTimeout(() => {
        frame = requestAnimationFrame(animate);
      }, 600);
      return () => { cancelAnimationFrame(frame); };
    }, { threshold: 0.4 });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--txf)' }}>
          {de ? 'Mit Öl' : 'With oil'}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--txf)' }}>
          {de ? '← Ziehen zum Vergleichen →' : '← Drag to compare →'}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#2B52B0' }}>
          {de ? 'Mit Wachs' : 'With wax'}
        </span>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-xl cursor-ew-resize"
        style={{ aspectRatio: '16 / 7', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* After image (wax — clean) — full width underneath */}
        <img
          src="/images/chain-clean.jpg"
          alt={de ? 'Kette mit Wachs — sauber' : 'Chain with wax — clean'}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before image (oil — dirty) — clipped to left side */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src="/images/chain-dirty.jpg"
            alt={de ? 'Kette mit Öl — verschmutzt' : 'Chain with oil — dirty'}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Dark tint on oil side */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.18)' }} />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-px pointer-events-none"
          style={{ left: `${pos}%`, background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 8px rgba(0,0,0,0.6)' }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full pointer-events-none"
          style={{
            left: `${pos}%`,
            width: '40px',
            height: '40px',
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {/* Double chevron icon */}
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
            <path d="M6 1L1 6L6 11" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 1L17 6L12 11" stroke="#1A3C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Oil label overlay */}
        <div
          className="absolute bottom-3 left-3 text-[11px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(255,255,255,0.75)',
            opacity: pos > 20 ? 1 : 0,
            transition: 'opacity 150ms',
          }}
        >
          {de ? '⚫ Kettenöl' : '⚫ Chain oil'}
        </div>

        {/* Wax label overlay */}
        <div
          className="absolute bottom-3 right-3 text-[11px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full pointer-events-none"
          style={{
            background: 'rgba(43,82,176,0.65)',
            color: 'rgba(255,255,255,0.95)',
            opacity: pos < 80 ? 1 : 0,
            transition: 'opacity 150ms',
          }}
        >
          {de ? '✦ Waxcelerate' : '✦ Waxcelerate'}
        </div>
      </div>

      {/* Caption */}
      <p className="text-[12px] text-center mt-3 leading-relaxed" style={{ color: 'var(--txf)' }}>
        {de
          ? 'Dieselbe Kette nach 400 km — links mit Öl, rechts mit Waxcelerate.'
          : 'Same chain after 400 km — left with oil, right with Waxcelerate.'}
      </p>
    </div>
  );
}
