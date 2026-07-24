/**
 * Geteilte Hero-Konstanten — von der „Blick ins Wachs"-Lupe (WaxLensCutout)
 * genutzt.
 */

/**
 * Lupe nur dort, wo sie Sinn ergibt und der Hotspot existiert: Desktop (≥1024px),
 * feiner Zeiger (Maus) und kein `prefers-reduced-motion`. Touch/Tablet/reduced
 * fallen auf die bestehenden Affordanzen (Hotspot-Pill + „Blick ins Wachs"-Link)
 * zurück — die Lupe rendert dann gar nichts.
 */
/**
 * Glas-Optik der Lupe — geteilt mit WaxLensCutout, hier zentral gepflegt statt
 * literal kopiert.
 */
export const LENS_GLASS_DARK = 'radial-gradient(125% 125% at 32% 26%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 100%)';
export const LENS_GLINT = 'radial-gradient(closest-side, rgba(255,255,255,0.5), transparent)';

export function waxLensEnabled(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wide = window.matchMedia('(min-width: 1024px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return fine && wide && !reduced;
}
