import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useWaxLens } from '@/hooks/useWaxLens';

/**
 * WaxLens — die WebGL-Wachs-Lupe als Hero-Overlay.
 *
 * Liegt als transparentes Canvas über der Foto-Bühne (z-[4]: über der
 * maskierten Block-Ebene z-[3], unter Hotspot z-[5] und Content z-10) und ist
 * `pointer-events-none` — der Klick auf den Block (→ WaxDive) bleibt unberührt.
 * Beim Hover über den Wachsblock erscheint eine Lupe, die das Foto vergrößert
 * und eine kristalline Mikrotextur einblendet.
 *
 * Die ganze Mechanik ist gegated: ohne feinen Zeiger, bei `prefers-reduced-
 * motion` oder ohne WebGL2 rendert die Komponente `null` — kein Canvas, keine
 * Listener, keine rAF-Kosten. Das Foto + der CSS-Spotlight bleiben dann allein.
 */
export function WaxLens({ cardRef }: { cardRef: RefObject<HTMLElement | null> }) {
  // Einmalig zur Mount-Zeit prüfen — die Bedingung ändert sich zur Laufzeit nicht.
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (typeof WebGL2RenderingContext === 'undefined') return false;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return fine && !reduced;
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hook ist selbst no-op bei !enabled — der Aufruf bleibt unbedingt (Hook-Regel).
  useWaxLens(canvasRef, cardRef, enabled);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 z-[4] pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
