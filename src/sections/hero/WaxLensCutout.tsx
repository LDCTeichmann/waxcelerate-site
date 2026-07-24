import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { LENS_GLASS_DARK, LENS_GLINT } from '@/sections/hero/constants';

const HERO_MASK_SRC = '/images/hero/wax-cutout-mask.png';

/**
 * WaxLensCutout — „Blick ins Wachs"-Lupe für hero-light.tsx, wo das Wachs ein
 * eigenständig positioniertes, freigestelltes Bild ist (wax-cutout.png), kein
 * Ausschnitt aus dem Vollbild-Hintergrundfoto. Die Trefferprüfung läuft daher
 * direkt gegen die Bounding-Box des Wachs-Elements — kein object-position/
 * mask-position-Mapping auf ein Vollbild nötig (siehe WaxLens.tsx für die
 * Variante, die das noch braucht).
 */
export function WaxLensCutout({ waxRef, enabled, de, onOpen, onActiveChange }: {
  waxRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  de: boolean;
  onOpen: () => void;
  onActiveChange?: (active: boolean) => void;
}) {
  const lensRef = useRef<HTMLDivElement>(null);
  const activeCb = useRef(onActiveChange);
  activeCb.current = onActiveChange;

  useEffect(() => {
    if (!enabled) return;
    const wax = waxRef.current;
    const lens = lensRef.current;
    if (!wax || !lens) return;

    gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0, x: 0, y: 0 });

    let rect = wax.getBoundingClientRect();
    const measure = () => { rect = wax.getBoundingClientRect(); };

    let alpha: Uint8ClampedArray | null = null;
    let maskW = 0, maskH = 0;
    const maskImg = new Image();
    maskImg.decoding = 'async';
    maskImg.src = HERO_MASK_SRC;
    const onMaskLoad = () => {
      try {
        maskW = maskImg.naturalWidth; maskH = maskImg.naturalHeight;
        if (!maskW || !maskH) return;
        const cv = document.createElement('canvas');
        cv.width = maskW; cv.height = maskH;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(maskImg, 0, 0);
        alpha = ctx.getImageData(0, 0, maskW, maskH).data;
      } catch {
        alpha = null;
      }
    };
    if (maskImg.complete) onMaskLoad();
    else maskImg.addEventListener('load', onMaskLoad);

    // Maske wird 1:1 auf die Wax-Box gestreckt (gleiches Seitenverhältnis wie
    // das sichtbare Bild) — reine Prozent-Skalierung, kein object-cover-Offset.
    const maskAlphaAt = (cx: number, cy: number): number | null => {
      if (!alpha || !maskW || !maskH) return null;
      const ix = Math.round(((cx - rect.left) / rect.width) * maskW);
      const iy = Math.round(((cy - rect.top) / rect.height) * maskH);
      if (ix < 0 || iy < 0 || ix >= maskW || iy >= maskH) return 0;
      return alpha[(iy * maskW + ix) * 4 + 3];
    };

    const inRect = (cx: number, cy: number, margin: number) =>
      cx >= rect.left - margin && cx <= rect.left + rect.width + margin &&
      cy >= rect.top - margin && cy <= rect.top + rect.height + margin;

    const overWax = (cx: number, cy: number, entering: boolean) => {
      const a = maskAlphaAt(cx, cy);
      if (a === null) return inRect(cx, cy, entering ? 0 : 20);
      return entering ? a > 140 : a > 0;
    };

    let inside = false;
    let lastX = -1, lastY = -1;
    // Coalesce raw mousemove (can fire far faster than the display refreshes)
    // down to at most one mask-lookup + gsap.set per animation frame.
    let rafId: number | null = null;
    let pendingX = 0, pendingY = 0;

    const setActive = (v: boolean) => { inside = v; activeCb.current?.(v); };
    const reveal = () => {
      setActive(true);
      gsap.to(lens, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)', overwrite: 'auto' });
    };
    const dismiss = () => {
      setActive(false);
      gsap.to(lens, { scale: 0.3, autoAlpha: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    };

    const processMove = (x: number, y: number) => {
      rafId = null;
      lastX = x; lastY = y;
      gsap.set(lens, { x, y });
      const now = overWax(x, y, !inside);
      if (now && !inside) reveal();
      else if (!now && inside) dismiss();
    };
    const onMove = (e: MouseEvent) => {
      pendingX = e.clientX; pendingY = e.clientY;
      if (rafId === null) rafId = requestAnimationFrame(() => processMove(pendingX, pendingY));
    };
    const onDown = () => { if (inside) gsap.to(lens, { scale: 0.86, duration: 0.12, ease: 'power2.out', overwrite: 'auto' }); };
    const onUp   = () => { if (inside) gsap.to(lens, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', overwrite: 'auto' }); };
    const onClick = (e: MouseEvent) => { if (overWax(e.clientX, e.clientY, true)) onOpen(); };
    const onScroll = () => { measure(); if (inside && !overWax(lastX, lastY, false)) dismiss(); };
    const onResize = () => { measure(); };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      maskImg.removeEventListener('load', onMaskLoad);
      if (rafId !== null) cancelAnimationFrame(rafId);
      activeCb.current?.(false);
      gsap.killTweensOf(lens);
    };
  }, [enabled, waxRef, onOpen]);

  if (!enabled) return null;

  return createPortal(
    <div
      ref={lensRef}
      aria-hidden
      className="fixed left-0 top-0 z-[60] flex items-center justify-center rounded-full pointer-events-none will-change-transform"
      style={{
        width: 116,
        height: 116,
        visibility: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.92)',
        background: LENS_GLASS_DARK,
        boxShadow: '0 8px 22px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      <span className="absolute rounded-full pointer-events-none" style={{ inset: 7, border: '1px solid rgba(255,255,255,0.16)' }} />
      <span className="absolute rounded-full pointer-events-none" style={{ top: 14, left: 20, width: 34, height: 22, background: LENS_GLINT, filter: 'blur(2px)' }} />
      <ZoomIn className="h-8 w-8" strokeWidth={1.75} style={{ color: '#fff' }} />
      <span
        className="absolute left-1/2 top-full -translate-x-1/2 mt-3 whitespace-nowrap text-[10px] uppercase font-semibold"
        style={{ letterSpacing: '0.24em', color: 'rgba(255,255,255,0.94)', textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}
      >
        {de ? 'Blick ins Wachs' : 'Look inside'}
      </span>
    </div>,
    document.body,
  );
}
