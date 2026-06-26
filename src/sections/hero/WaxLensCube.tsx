import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import { gsap } from '@/lib/gsap';

const CUBE_MASK_SRC = '/images/hero/wax-cutout-new-mask.png';

/**
 * WaxLensCube — die „Blick ins Wachs"-Lupe für den FREISTEHENDEN Wachs-Cutout
 * (Light-Hero). Im Gegensatz zur Vollbild-Variante (WaxLens) sampelt sie die
 * Silhouette 1:1 in der Bounding-Box des Cube-Elements (das Mask-PNG ist der
 * exakte Crop des Cutouts), statt object-cover-Geometrie zu rechnen.
 *
 * Robust: Glas-Lupe per Portal an <body> in reinen Viewport-Koordinaten — keine
 * Bühnen-Transformation beeinflusst ihre Position. Sichtbar nur, solange der
 * Cursor wirklich über dem Wachs liegt (Alpha-Treffer, mit Hysterese gegen
 * Kantenflackern). Klick öffnet die Übersicht (`onOpen`).
 *
 * `light` schaltet die Optik um: dunkler Ink-Ring + dunkles Label auf hellem
 * Grund (Light-Hero), sonst weißes Glas (Noir).
 */
export function WaxLensCube({ cubeRef, enabled, light, de, onOpen, onActiveChange }: {
  cubeRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  light: boolean;
  de: boolean;
  onOpen: () => void;
  onActiveChange?: (active: boolean) => void;
}) {
  const lensRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const activeCb = useRef(onActiveChange);
  activeCb.current = onActiveChange;

  useEffect(() => {
    if (!enabled) return;
    const cube = cubeRef.current;
    const lens = lensRef.current;
    const hint = hintRef.current;
    if (!cube || !lens) return;

    gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0, x: 0, y: 0 });
    if (hint) gsap.set(hint, { autoAlpha: 0.9 });

    // Bounding-Box des Cube-Elements cachen — getBoundingClientRect niemals pro
    // mousemove (synchrones Layout → ruckelt). Neu messen bei scroll/resize.
    let rect = cube.getBoundingClientRect();
    const measure = () => { rect = cube.getBoundingClientRect(); };

    // Silhouette-Alpha einmal aus dem Mask-PNG in ein Offscreen-Canvas lesen.
    let alpha: Uint8ClampedArray | null = null;
    let maskW = 0, maskH = 0;
    const maskImg = new Image();
    maskImg.decoding = 'async';
    maskImg.src = CUBE_MASK_SRC;
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
        alpha = null; // getImageData scheitert → Rechteck-Fallback
      }
    };
    if (maskImg.complete) onMaskLoad();
    else maskImg.addEventListener('load', onMaskLoad);

    // Cursor → Cube-lokal → Maskenpixel (1:1, lineare Skala — Maske = exakter Crop).
    const maskAlphaAt = (cx: number, cy: number): number | null => {
      if (!alpha || !maskW || !maskH || !rect.width || !rect.height) return null;
      const ix = Math.round((cx - rect.left) / rect.width * maskW);
      const iy = Math.round((cy - rect.top) / rect.height * maskH);
      if (ix < 0 || iy < 0 || ix >= maskW || iy >= maskH) return 0;
      return alpha[(iy * maskW + ix) * 4 + 3];
    };

    // Rechteck-Fallback, falls die Maske (noch) nicht verfügbar ist.
    const inRect = (cx: number, cy: number, margin: number) =>
      cx >= rect.left - margin && cx <= rect.right + margin &&
      cy >= rect.top - margin && cy <= rect.bottom + margin;

    // Hysterese: Eintritt verlangt deutliches Wachs (>140), Austritt erst bei
    // freiem Pixel (0) — verhindert Flackern an der weichen Maskenkante.
    const overWax = (cx: number, cy: number, entering: boolean) => {
      const a = maskAlphaAt(cx, cy);
      if (a === null) return inRect(cx, cy, entering ? -8 : 8);
      return entering ? a > 140 : a > 0;
    };

    let primed = false;
    let inside = false;
    let lastX = -1, lastY = -1;

    const setActive = (v: boolean) => { inside = v; activeCb.current?.(v); };
    const reveal = () => {
      setActive(true);
      gsap.to(lens, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)', overwrite: 'auto' });
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.25, overwrite: 'auto' });
    };
    const dismiss = () => {
      setActive(false);
      gsap.to(lens, { scale: 0.3, autoAlpha: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      if (hint) gsap.to(hint, { autoAlpha: 0.9, duration: 0.4, overwrite: 'auto' });
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX; lastY = e.clientY;
      gsap.set(lens, { x: e.clientX, y: e.clientY });
      if (!primed) primed = true;
      const now = overWax(e.clientX, e.clientY, !inside);
      if (now && !inside) reveal();
      else if (!now && inside) dismiss();
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
      activeCb.current?.(false);
      gsap.killTweensOf(lens);
      if (hint) gsap.killTweensOf(hint);
    };
  }, [enabled, cubeRef, onOpen]);

  if (!enabled) return null;

  // Optik je nach Grund: Light-Hero → dunkler Ink-Ring auf hellem Cutout.
  const ring   = light ? 'rgba(16,16,19,0.42)' : 'rgba(255,255,255,0.92)';
  const glass  = light
    ? 'radial-gradient(125% 125% at 32% 26%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.10) 42%, rgba(255,255,255,0.0) 100%)'
    : 'radial-gradient(125% 125% at 32% 26%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 100%)';
  const iconCol = light ? '#0E2A4A' : '#fff';
  const labelCol = light ? 'rgba(16,16,19,0.82)' : 'rgba(255,255,255,0.94)';
  const labelShadow = light ? '0 1px 8px rgba(255,255,255,0.65)' : '0 1px 10px rgba(0,0,0,0.55)';
  return (
    <>
      {createPortal(
        <div
          ref={lensRef}
          aria-hidden
          className="fixed left-0 top-0 z-[60] flex items-center justify-center rounded-full pointer-events-none will-change-transform"
          style={{
            width: 116,
            height: 116,
            visibility: 'hidden',
            border: `1.5px solid ${ring}`,
            background: glass,
            boxShadow: light
              ? '0 10px 26px rgba(16,24,40,0.22), inset 0 1px 0 rgba(255,255,255,0.75), inset 0 0 0 1px rgba(16,16,19,0.06)'
              : '0 8px 22px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.08)',
            backdropFilter: light ? 'saturate(1.15) brightness(1.04)' : undefined,
          }}
        >
          <span className="absolute rounded-full pointer-events-none" style={{ inset: 7, border: `1px solid ${light ? 'rgba(16,16,19,0.10)' : 'rgba(255,255,255,0.16)'}` }} />
          <span className="absolute rounded-full pointer-events-none" style={{ top: 14, left: 20, width: 34, height: 22, background: 'radial-gradient(closest-side, rgba(255,255,255,0.5), transparent)', filter: 'blur(2px)' }} />
          <ZoomIn className="h-8 w-8" strokeWidth={1.75} style={{ color: iconCol }} />
          <span
            className="absolute left-1/2 top-full -translate-x-1/2 mt-3 whitespace-nowrap text-[10px] uppercase font-semibold"
            style={{ letterSpacing: '0.24em', color: labelCol, textShadow: labelShadow }}
          >
            {de ? 'Blick ins Wachs' : 'Look inside'}
          </span>
        </div>,
        document.body,
      )}
    </>
  );
}
