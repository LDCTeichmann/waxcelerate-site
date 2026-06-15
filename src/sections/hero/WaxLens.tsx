import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ZoomIn } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { BLOCK_HOTSPOT } from '@/sections/hero/constants';

/**
 * WaxLens — die „Blick ins Wachs"-Lupe als Custom-Cursor-Affordanz.
 *
 * Über dem Wachsblock verschwindet der native Cursor und eine weiße Glas-Lupe
 * folgt dem Zeiger eng und ruckelfrei (Hysterese gegen Rand-Flackern). Ein
 * Klick auf den Block öffnet die „Blick ins Wachs"-Übersicht — der Klick wird
 * direkt auf der Karte abgegriffen (`onOpen`), unabhängig von darüber liegenden
 * Ebenen. Ein dezent pulsierender Punkt in der Blockmitte macht vorab sichtbar,
 * dass es hier etwas zu entdecken gibt; er blendet beim Hovern aus.
 *
 * Gegated über `enabled` (Desktop + feiner Zeiger, kein reduced-motion).
 */
export function WaxLens({ cardRef, enabled, de, onOpen }: {
  cardRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  de: boolean;
  onOpen: () => void;
}) {
  const lensRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const card = cardRef.current;
    const lens = lensRef.current;
    const hint = hintRef.current;
    if (!card || !lens) return;

    gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0 });
    if (hint) gsap.set(hint, { autoAlpha: 0.9 });
    // Enger Eased-Follow — die Linse „klebt" am Cursor.
    const qx = gsap.quickTo(lens, 'x', { duration: 0.22, ease: 'power3.out' });
    const qy = gsap.quickTo(lens, 'y', { duration: 0.22, ease: 'power3.out' });

    // Block-Rechteck in Pixeln; `margin` gibt eine Hysterese (Ein 0 / Aus 30px),
    // damit die Linse an der Kante nicht flackert.
    const within = (px: number, py: number, w: number, h: number, margin = 0) => {
      const left   = (1 - BLOCK_HOTSPOT.right - BLOCK_HOTSPOT.width) * w - margin;
      const right  = (1 - BLOCK_HOTSPOT.right) * w + margin;
      const top    = BLOCK_HOTSPOT.top * h - margin;
      const bottom = (BLOCK_HOTSPOT.top + BLOCK_HOTSPOT.height) * h + margin;
      return px >= left && px <= right && py >= top && py <= bottom;
    };

    let inside = false;
    const reveal = () => {
      gsap.to(lens, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.6)', overwrite: true });
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.25, overwrite: true });
    };
    const dismiss = () => {
      gsap.to(lens, { scale: 0.3, autoAlpha: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
      if (hint) gsap.to(hint, { autoAlpha: 0.9, duration: 0.4, overwrite: true });
    };

    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      // Eintritt scharf, Austritt erst 30px außerhalb — kein Boundary-Flackern.
      const now = within(px, py, r.width, r.height, inside ? 30 : 0);
      if (now) {
        if (!inside) {
          inside = true;
          gsap.set(lens, { x: px, y: py }); // sofort am Cursor, kein Hereinfliegen
          reveal();
        } else {
          qx(px); qy(py);
        }
      } else if (inside) {
        inside = false;
        dismiss();
      }
    };
    const onLeave = () => { if (inside) { inside = false; dismiss(); } };
    const onDown = () => { if (inside) gsap.to(lens, { scale: 0.86, duration: 0.12, ease: 'power2.out', overwrite: 'auto' }); };
    const onUp   = () => { if (inside) gsap.to(lens, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', overwrite: 'auto' }); };
    // Klick auf dem Block → Übersicht öffnen (robust, egal welche Ebene oben liegt).
    const onClick = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      if (within(e.clientX - r.left, e.clientY - r.top, r.width, r.height)) onOpen();
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('mousedown', onDown);
    card.addEventListener('click', onClick);
    window.addEventListener('mouseup', onUp);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      card.removeEventListener('mousedown', onDown);
      card.removeEventListener('click', onClick);
      window.removeEventListener('mouseup', onUp);
      gsap.killTweensOf(lens);
      if (hint) gsap.killTweensOf(hint);
    };
  }, [enabled, cardRef, onOpen]);

  if (!enabled) return null;

  return (
    <>
      {/* Vorab-Hinweis: dezent pulsierender Punkt in der Blockmitte */}
      <div
        ref={hintRef}
        aria-hidden
        className="absolute z-[11] pointer-events-none"
        style={{ left: '74%', top: '46%', transform: 'translate(-50%,-50%)' }}
      >
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: 'rgba(255,255,255,0.55)' }} />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }} />
        </span>
      </div>

      {/* Glas-Lupe, die dem Cursor folgt */}
      <div
        ref={lensRef}
        aria-hidden
        className="absolute top-0 left-0 z-[12] flex items-center justify-center rounded-full pointer-events-none will-change-transform"
        style={{
          width: 116,
          height: 116,
          visibility: 'hidden',
          border: '1.5px solid rgba(255,255,255,0.92)',
          background: 'radial-gradient(125% 125% at 32% 26%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(3px) saturate(1.05)',
          WebkitBackdropFilter: 'blur(3px) saturate(1.05)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        <span className="absolute rounded-full pointer-events-none" style={{ inset: 7, border: '1px solid rgba(255,255,255,0.16)' }} />
        <span className="absolute rounded-full pointer-events-none" style={{ top: 14, left: 20, width: 34, height: 22, background: 'radial-gradient(closest-side, rgba(255,255,255,0.5), transparent)', filter: 'blur(2px)' }} />
        <ZoomIn className="h-8 w-8" strokeWidth={1.75} style={{ color: '#fff' }} />
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 mt-3 whitespace-nowrap text-[10px] uppercase font-semibold"
          style={{ letterSpacing: '0.24em', color: 'rgba(255,255,255,0.94)', textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}
        >
          {de ? 'Blick ins Wachs' : 'Look inside'}
        </span>
      </div>
    </>
  );
}
