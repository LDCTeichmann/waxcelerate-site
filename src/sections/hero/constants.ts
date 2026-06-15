/**
 * Geteilte Hero-Konstanten — hero.tsx und die „Blick ins Wachs"-Lupe (WaxLens)
 * teilen sich Bildgeometrie und Block-Hotspot, damit Foto, Maske und Lupe in
 * jedem Viewport deckungsgleich bleiben.
 */

// Identisch für object-position UND mask-position des Hero-Fotos.
export const IMG_POS = '68% 50%';

/**
 * Der Wachsblock-Bereich als Bruchteile der Karten-Box (rechts/oben/Breite/Höhe).
 * Deckt sich mit dem Hotspot-Button in hero.tsx (right:4% top:16% w:44% h:60%).
 * Die Lupe erscheint nur, solange der Cursor innerhalb dieses Rechtecks liegt.
 */
export const BLOCK_HOTSPOT = {
  right: 0.04,
  top: 0.16,
  width: 0.44,
  height: 0.6,
} as const;

/**
 * Lupe nur dort, wo sie Sinn ergibt und der Hotspot existiert: Desktop (≥1024px),
 * feiner Zeiger (Maus) und kein `prefers-reduced-motion`. Touch/Tablet/reduced
 * fallen auf die bestehenden Affordanzen (Hotspot-Pill + „Blick ins Wachs"-Link)
 * zurück — die Lupe rendert dann gar nichts.
 */
export function waxLensEnabled(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wide = window.matchMedia('(min-width: 1024px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return fine && wide && !reduced;
}
