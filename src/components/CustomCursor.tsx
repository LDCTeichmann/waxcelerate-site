import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Smooth GSAP-powered custom cursor.
 * - 8px dot: tracks exactly at mouse position
 * - 36px ring: follows with a soft lerp delay
 * - Ring expands + dot hides on hover over interactive elements
 * - Only active on pointer-capable (non-touch) devices
 * - Respects prefers-reduced-motion
 */
export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show on true pointer devices, not touch
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Initial position off-screen so it doesn't flash at 0,0
    let mouseX = -100;
    let mouseY = -100;
    let ringX  = -100;
    let ringY  = -100;

    // Dot tracks exactly
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    // Ring lerps toward mouse on every GSAP tick
    const LERP = 0.11;
    const ticker = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      ringX += dx * LERP;
      ringY += dy * LERP;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        gsap.set(ring, { x: ringX, y: ringY });
      }
    };
    gsap.ticker.add(ticker);

    // Hover states — expand ring, hide dot
    const onEnter = () => {
      gsap.to(ring, { scale: 2.0, opacity: 0.7, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(dot,  { scale: 0,   opacity: 0,   duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
    };
    const onLeave = () => {
      gsap.to(ring, { scale: 1.0, opacity: 1,   duration: 0.30, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(dot,  { scale: 1.0, opacity: 1,   duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    };

    // Delegated hover listeners — no per-element attachment needed
    const onMouseOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button')) onEnter();
    };
    const onMouseOut = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button')) onLeave();
    };
    document.body.addEventListener('mouseover', onMouseOver);
    document.body.addEventListener('mouseout', onMouseOut);

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      document.body.style.cursor = '';
      gsap.ticker.remove(ticker);
      document.body.removeEventListener('mouseover', onMouseOver);
      document.body.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      {/* Dot — tracks exactly */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] will-change-transform"
        style={{
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#2B52B0',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Ring — lags softly */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9998] will-change-transform"
        style={{
          top: 0, left: 0,
          width: 36, height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(43,82,176,0.55)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
