import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { BLOCK_HOTSPOT, HERO_MASK_SRC, IMG_POS_X, IMG_POS_Y, LENS_GLASS_DARK, LENS_GLINT } from '@/sections/hero/constants';

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
export function WaxLens({ cardRef, enabled, de, onOpen, onActiveChange }: {
  cardRef: RefObject<HTMLElement | null>;
  enabled: boolean;
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
    const card = cardRef.current;
    const lens = lensRef.current;
    const hint = hintRef.current;
    if (!card || !lens) return;

    gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0, x: 0, y: 0 });
    if (hint) gsap.set(hint, { autoAlpha: 0.9 });

    // ── Karten-Box cachen ─────────────────────────────────────────────────────
    // getBoundingClientRect erzwingt ein synchrones Layout — niemals pro
    // mousemove (das ruckelt, während die Hero-Bühne scrollt/scrubbt). Stattdessen
    // einmal messen und nur bei scroll/resize neu (die Bühne transformiert nur
    // dann ihre Box).
    let rect = card.getBoundingClientRect();
    const measure = () => { rect = card.getBoundingClientRect(); };

    // ── Silhouetten-Treffer: Alpha der Wachs-Maske abtasten ───────────────────
    // Der Wachsblock ist gerundet und per object-cover (IMG_POS) beschnitten — ein
    // statisches Rechteck trifft seine Kontur nie. Wir laden die bereits genutzte
    // Maske einmal in ein Offscreen-Canvas, lesen ihren Alpha-Kanal aus und prüfen
    // pro Punkt, ob dort Wachs liegt. So erscheint die Lupe pixelgenau nur auf dem
    // Block (inkl. runder Ecken), unabhängig vom Viewport.
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
        alpha = null; // z. B. getImageData scheitert → Rechteck-Fallback greift
      }
    };
    if (maskImg.complete) onMaskLoad();
    else maskImg.addEventListener('load', onMaskLoad);

    // Alpha an Cursor (cx,cy) → Karten-lokal → object-cover-Bildraum → Maskenpixel.
    const maskAlphaAt = (cx: number, cy: number): number | null => {
      if (!alpha || !maskW || !maskH) return null;
      const cw = rect.width, ch = rect.height;
      const scale = Math.max(cw / maskW, ch / maskH);
      const dispW = maskW * scale, dispH = maskH * scale;
      const offX = (cw - dispW) * IMG_POS_X;
      const offY = (ch - dispH) * IMG_POS_Y;
      const ix = Math.round((cx - rect.left - offX) / scale);
      const iy = Math.round((cy - rect.top - offY) / scale);
      if (ix < 0 || iy < 0 || ix >= maskW || iy >= maskH) return 0;
      return alpha[(iy * maskW + ix) * 4 + 3];
    };

    // Rechteck-Fallback (alte Logik), falls die Maske (noch) nicht verfügbar ist.
    const inRect = (cx: number, cy: number, margin: number) => {
      const l = rect.left + (1 - BLOCK_HOTSPOT.right - BLOCK_HOTSPOT.width) * rect.width;
      const rt = rect.left + (1 - BLOCK_HOTSPOT.right) * rect.width;
      const t = rect.top + BLOCK_HOTSPOT.top * rect.height;
      const b = rect.top + (BLOCK_HOTSPOT.top + BLOCK_HOTSPOT.height) * rect.height;
      return cx >= l - margin && cx <= rt + margin && cy >= t - margin && cy <= b + margin;
    };

    // Trefferprüfung mit Hysterese: Eintritt verlangt deutliches Wachs (>140),
    // Austritt erst bei völlig freiem Pixel (0) — das verhindert Flackern an der
    // weichen Maskenkante. Ohne Maske: scharfer/30px-Rechtecktest wie zuvor.
    const overWax = (cx: number, cy: number, entering: boolean) => {
      const a = maskAlphaAt(cx, cy);
      if (a === null) return inRect(cx, cy, entering ? 0 : 30);
      return entering ? a > 140 : a > 0;
    };

    // ── Position: direkt am Cursor (geklebt, KEIN Lerp/Trailing) ──────────────
    // Die Lupe IST der Cursor — sie muss exakt folgen. Nur x/y werden gesetzt
    // (transform-only, compositor-günstig); scale/autoAlpha laufen als Tweens.
    let primed = false;
    let inside = false;
    let lastX = -1, lastY = -1;
    // Raw mousemove can fire far faster than the display refreshes (high-poll-
    // rate mice hit 500-1000Hz). The mask lookup + gsap.set below only need to
    // run once per rendered frame, not once per raw event — so mousemove just
    // stashes the latest coordinates (cheap) and schedules a single rAF to do
    // the actual work with whatever the newest position is by the time it runs.
    let rafId: number | null = null;
    let pendingX = 0, pendingY = 0;

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

    const processMove = (x: number, y: number) => {
      rafId = null;
      lastX = x; lastY = y;
      gsap.set(lens, { x, y });
      if (!primed) primed = true;
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
    // Beim Scrollen wandert der Block unter dem (ruhenden) Cursor weg → Box neu
    // messen und prüfen.
    const onScroll = () => { measure(); if (inside && !overWax(lastX, lastY, false)) dismiss(); };
    const onResize = () => { measure(); };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    card.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      card.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      maskImg.removeEventListener('load', onMaskLoad);
      if (rafId !== null) cancelAnimationFrame(rafId);
      activeCb.current?.(false);
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
            background: LENS_GLASS_DARK,
            // Kein backdrop-filter: der Live-Blur-Repaint pro Frame machte die Lupe
            // ruckelig. Gradient + Ring + Glint lesen weiterhin als Glas.
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
      )}
    </>
  );
}
