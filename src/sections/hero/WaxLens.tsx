import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { BLOCK_HOTSPOT } from '@/sections/hero/constants';

/**
 * WaxLens — die „Blick ins Wachs"-Lupe als Custom-Cursor-Affordanz.
 *
 * Robustheit zuerst: Die Lupe wird per Portal an <body> gehängt und in REINEN
 * Viewport-Koordinaten (`position: fixed`, Translate = clientX/clientY)
 * positioniert. So beeinflusst KEINE Transformation der Hero-Bühne (Entrance-
 * Scale, Scroll-Scrub, Parallax) ihre Position — sie sitzt immer exakt am
 * Cursor. Sichtbar ist sie nur, solange der Cursor im Bildschirm-Rechteck des
 * Wachsblocks liegt (aus der aktuellen Bühnen-Bounding-Box berechnet, inkl.
 * aller Transforms). Ein Klick auf den Block öffnet die Übersicht (`onOpen`).
 * Ein dezent pulsierender Punkt in der Blockmitte macht das Ganze auffindbar.
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
    const qx = gsap.quickTo(lens, 'x', { duration: 0.18, ease: 'power3.out' });
    const qy = gsap.quickTo(lens, 'y', { duration: 0.18, ease: 'power3.out' });

    // Bildschirm-Rechteck des Wachsblocks aus der aktuellen Bühnen-Box (mit allen
    // Transforms). `margin` gibt Hysterese: Eintritt scharf, Austritt 30px später.
    const inBlock = (cx: number, cy: number, margin: number) => {
      const r = card.getBoundingClientRect();
      const l = r.left + (1 - BLOCK_HOTSPOT.right - BLOCK_HOTSPOT.width) * r.width;
      const rt = r.left + (1 - BLOCK_HOTSPOT.right) * r.width;
      const t = r.top + BLOCK_HOTSPOT.top * r.height;
      const b = r.top + (BLOCK_HOTSPOT.top + BLOCK_HOTSPOT.height) * r.height;
      return cx >= l - margin && cx <= rt + margin && cy >= t - margin && cy <= b + margin;
    };

    let inside = false;
    let lastX = -1, lastY = -1;
    const reveal = () => {
      gsap.to(lens, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)', overwrite: true });
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.25, overwrite: true });
    };
    const dismiss = () => {
      gsap.to(lens, { scale: 0.3, autoAlpha: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
      if (hint) gsap.to(hint, { autoAlpha: 0.9, duration: 0.4, overwrite: true });
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX; lastY = e.clientY;
      if (inBlock(e.clientX, e.clientY, inside ? 30 : 0)) {
        if (!inside) { inside = true; gsap.set(lens, { x: e.clientX, y: e.clientY }); reveal(); }
        else { qx(e.clientX); qy(e.clientY); }
      } else if (inside) {
        inside = false; dismiss();
      }
    };
    const onDown = () => { if (inside) gsap.to(lens, { scale: 0.86, duration: 0.12, ease: 'power2.out', overwrite: 'auto' }); };
    const onUp   = () => { if (inside) gsap.to(lens, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', overwrite: 'auto' }); };
    const onClick = (e: MouseEvent) => { if (inBlock(e.clientX, e.clientY, 0)) onOpen(); };
    // Beim Scrollen wandert der Block unter dem (ruhenden) Cursor weg → neu prüfen.
    const onScroll = () => { if (inside && !inBlock(lastX, lastY, 30)) { inside = false; dismiss(); } };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    card.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      card.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      gsap.killTweensOf(lens);
      if (hint) gsap.killTweensOf(hint);
    };
  }, [enabled, cardRef, onOpen]);

  if (!enabled) return null;

  return (
    <>
      {/* Vorab-Hinweis: dezent pulsierender Punkt in der Blockmitte (in der Bühne,
          folgt damit Scroll & Parallax automatisch) */}
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

      {/* Glas-Lupe — per Portal an <body>, fixed, in Viewport-Koordinaten */}
      {createPortal(
        <div
          ref={lensRef}
          aria-hidden
          className="fixed left-0 top-0 z-[60] flex items-center justify-center rounded-full pointer-events-none will-change-transform"
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
        </div>,
        document.body,
      )}
    </>
  );
}
