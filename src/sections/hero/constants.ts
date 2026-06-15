/**
 * Geteilte Hero-Konstanten — hero.tsx und die WebGL-Lupe (WaxLens) müssen sich
 * über dieselbe Bildgeometrie einig sein, sonst „springt" das vergrößerte Bild
 * gegenüber dem Foto darunter. Daher leben object-position, Bildpfad und der
 * Block-Hotspot hier zentral.
 */

// Identisch für object-position UND mask-position des Hero-Fotos.
export const IMG_POS = '68% 50%';

// Das tatsächlich gezeichnete Hero-Foto (JPG-Fallback; die Lupe sampelt das JPG).
export const HERO_IMG = '/images/hero-wax-v5.jpg';

/**
 * Der Wachsblock-Bereich als Bruchteile der Karten-Box (rechts/oben/Breite/Höhe).
 * Deckt sich mit dem Hotspot-Button in hero.tsx (right:4% top:16% w:44% h:60%).
 * Die Lupe wird nur „aktiv", solange der Cursor innerhalb dieses Rechtecks liegt.
 */
export const BLOCK_HOTSPOT = {
  right: 0.04,
  top: 0.16,
  width: 0.44,
  height: 0.6,
} as const;
