import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ZoomIn } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { BLOCK_HOTSPOT } from '@/sections/hero/constants';

/**
 * WaxLens — die „Blick ins Wachs"-Lupe als Custom-Cursor-Affordanz.
 *
 * Bewegt sich der Zeiger über den Wachsblock, verschwindet der native Cursor
 * und eine weiße Glas-Lupe (Zoom-in-Glyphe + Label) folgt ihm mit weicher,
 * magnetischer Trägheit — beim Eintreten skaliert sie federnd ein, beim
 * Verlassen wieder aus. Klick öffnet die Wissenschafts-Übersicht (WaxDive):
 * die Lupe selbst ist `pointer-events-none`, der Klick landet auf dem
 * darunterliegenden Hotspot-Button.
 *
 * Gegated über `enabled` (Desktop + feiner Zeiger, kein reduced-motion) →
 * sonst rendert die Komponente `null`: keine Listener, kein Cursor-Tausch.
 */
export function WaxLens({ cardRef, enabled, de }: {
  cardRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  de: boolean;
}) {
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const card = cardRef.current;
    const lens = lensRef.current;
    if (!card || !lens) return;

    // Disc auf den Cursor zentrieren; Start unsichtbar und klein.
    gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0 });
    // Magnetischer Eased-Follow — der „liquide" Award-Touch.
    const qx = gsap.quickTo(lens, 'x', { duration: 0.45, ease: 'power3.out' });
    const qy = gsap.quickTo(lens, 'y', { duration: 0.45, ease: 'power3.out' });

    let inside = false;
    const within = (px: number, py: number, w: number, h: number) => {
      const left   = (1 - BLOCK_HOTSPOT.right - BLOCK_HOTSPOT.width) * w;
      const right  = (1 - BLOCK_HOTSPOT.right) * w;
      const top    = BLOCK_HOTSPOT.top * h;
      const bottom = (BLOCK_HOTSPOT.top + BLOCK_HOTSPOT.height) * h;
      return px >= left && px <= right && py >= top && py <= bottom;
    };

    const reveal = () =>
      gsap.to(lens, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.6)', overwrite: true });
    const dismiss = () =>
      gsap.to(lens, { scale: 0.3, autoAlpha: 0, duration: 0.35, ease: 'power2.out', overwrite: true });

    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      if (within(px, py, r.width, r.height)) {
        if (!inside) {
          inside = true;
          gsap.set(lens, { x: px, y: py }); // ohne Hereinfliegen vom Rand
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
    // Press-Feedback — die Lupe drückt sich beim Klick kurz zusammen.
    const onDown = () => { if (inside) gsap.to(lens, { scale: 0.86, duration: 0.12, ease: 'power2.out', overwrite: 'auto' }); };
    const onUp   = () => { if (inside) gsap.to(lens, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', overwrite: 'auto' }); };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      card.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      gsap.killTweensOf(lens);
    };
  }, [enabled, cardRef]);

  if (!enabled) return null;

  return (
    <div
      ref={lensRef}
      aria-hidden
      className="absolute top-0 left-0 z-[6] flex items-center justify-center rounded-full pointer-events-none will-change-transform"
      style={{
        width: 96,
        height: 96,
        visibility: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.88)',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(4px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(4px) saturate(1.1)',
        boxShadow: '0 14px 44px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.10)',
      }}
    >
      <ZoomIn className="h-7 w-7" strokeWidth={1.5} style={{ color: '#fff' }} />
      {/* Label hängt unter der Disc — beeinflusst die Zentrierung nicht. */}
      <span
        className="absolute left-1/2 top-full -translate-x-1/2 mt-3 whitespace-nowrap text-[10px] uppercase font-semibold"
        style={{ letterSpacing: '0.24em', color: 'rgba(255,255,255,0.94)', textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}
      >
        {de ? 'Blick ins Wachs' : 'Look inside'}
      </span>
    </div>
  );
}
