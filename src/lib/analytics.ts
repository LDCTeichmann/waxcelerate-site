// Cookiefreie, benutzerdefinierte Vercel-Analytics-Ereignisse — Mobile-Plan
// Paket A6 (Entscheidung D-M3). Bewusst nur drei Ereignisse, nicht mehr:
// "Wer alles misst, wertet nichts aus." Vier Wochen mitschreiben, BEVOR C1
// (nativer Checkout) live geht, damit der Vorher-Zustand als Vergleichswert
// erhalten bleibt — sonst ist nie belegbar, ob der eigene Checkout mehr
// bringt als die eBay-Uebergabe.
//
// @vercel/analytics ist cookiefrei und speichert keine personenbezogenen
// Daten, daher ohne Consent-Banner betreibbar (Grund fuer die Wahl, siehe
// MOBILE_PLAN.md A6 — nicht bloss Bequemlichkeit).

import { track } from '@vercel/analytics/react';

let productsSeen = false;

/** Feuert einmal pro Seitenaufruf, wenn die Produktsektion sichtbar wird. */
export function trackProductsSeen() {
  if (productsSeen) return;
  productsSeen = true;
  track('scroll_products');
}

/** Klick auf einen produktbezogenen eBay-Link (Kauf-CTA, nicht der allgemeine Shop-Link). */
export function trackEbayClick(productId: string) {
  track('click_ebay', { productId });
}

/** Klick auf "In den Warenkorb" bzw. den Kauf-Button. */
export function trackBuyClick(productId: string) {
  track('click_buy', { productId });
}
