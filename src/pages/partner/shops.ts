// Whitelist fuer personalisierte QR-Links (/partner?s=<slug>).
//
// Nur hier eingetragene Slugs blenden "Fuer <Shop>" ein. Alles andere zeigt die
// neutrale Fassung. Freier Text aus der URL wird bewusst NICHT angezeigt
// (sonst liesse sich die Seite mit beliebigem Namen faelschen).
//
// Bewusst leer ausgeliefert: dieses Objekt landet im oeffentlichen Bundle, und
// eine Liste angesprochener Shops geht Wettbewerber nichts an. Eintraege erst
// ergaenzen, wenn der Shop zugestimmt hat oder Partner ist, Beispiel:
//   'beispiel-rad': { name: 'Beispiel Rad', city: 'Leipzig', country: 'DE' },

export interface PartnerShop {
  name: string;
  city: string;
  country: 'DE' | 'AT';
}

export const PARTNER_SHOPS: Record<string, PartnerShop> = {};

export function shopFromSlug(slug: string | null): PartnerShop | null {
  if (!slug) return null;
  return Object.prototype.hasOwnProperty.call(PARTNER_SHOPS, slug) ? PARTNER_SHOPS[slug] : null;
}
