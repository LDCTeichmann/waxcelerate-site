// Cookiefreie, benutzerdefinierte Vercel-Analytics-Ereignisse — Mobile-Plan
// Paket A6 (Entscheidung D-M3). Ursprünglich bewusst nur drei Ereignisse:
// "Wer alles misst, wertet nichts aus." Vier Wochen mitschreiben, BEVOR C1
// (nativer Checkout) live geht, damit der Vorher-Zustand als Vergleichswert
// erhalten bleibt — sonst ist nie belegbar, ob der eigene Checkout mehr
// bringt als die eBay-Uebergabe. Die drei ursprünglichen Ereignisse
// (scroll_products, click_ebay, click_buy) bleiben unveraendert, damit dieser
// Vorher-Vergleich intakt bleibt.
//
// P1-4 (SEO-/Sichtbarkeitsplan): sieben weitere Ereignisse ergänzt, jedes an
// eine konkrete Frage aus dem Messplan gebunden, keins "nur weil messbar" —
// Produktseitenansicht, Größen-/Variantenwahl, Classic-vs-Pro-Vergleich,
// Rechnerabschluss, Blog-zu-Produkt-Klick, Starter-Set-/Rewax-Interesse.
// Dieselbe Disziplin wie oben, nur mit einem größeren, jetzt benötigten
// Fragenkatalog. Der Kaufabschluss selbst bleibt bei eBay — all das hier
// misst Vor-Kauf-Signale, keine Conversion.
//
// @vercel/analytics ist cookiefrei und speichert keine personenbezogenen
// Daten, daher ohne Consent-Banner betreibbar (Grund fuer die Wahl, siehe
// docs/plaene/MOBILE_PLAN.md A6 — nicht bloss Bequemlichkeit).

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

/** Produktseitenansicht — beantwortet "wie viele Besucher sehen ein Produkt
 *  überhaupt", die Grundlage jeder Trichter-Rechnung darunter. */
export function trackProductView(productId: string) {
  track('view_product', { productId });
}

/** Größen-/Variantenwahl auf der Produktseite (z. B. 300g ↔ 500g). */
export function trackSizeSelect(productId: string, size: string) {
  track('select_size', { productId, size });
}

/** Classic-vs-Pro-Vergleich — Wechsel der Formel auf der Produktseite oder
 *  Öffnen des Vergleichsmodals. `productId` ist das Zielprodukt nach dem
 *  Wechsel, nicht das Ausgangsprodukt. */
export function trackFormulaCompare(productId: string) {
  track('compare_formula', { productId });
}

/** Ein Rechner liefert ein Ergebnis — beantwortet, welche Rechner tatsächlich
 *  bis zum Ende genutzt werden, nicht nur geöffnet. */
export function trackCalcComplete(toolSlug: string) {
  track('calc_complete', { toolSlug });
}

/** Klick von einem Blogartikel auf ein Produkt (Haupt- oder Zweit-CTA). */
export function trackBlogToProduct(articleSlug: string, productId: string) {
  track('blog_to_product', { articleSlug, productId });
}

/** Interesse am Starter-Set — Klick auf eine Starter-Set-Option oder deren CTA. */
export function trackStarterInterest(optionId: string) {
  track('interest_starter', { optionId });
}

/** Interesse am Rewax-/Einschick-Service. */
export function trackRewaxInterest() {
  track('interest_rewax');
}

/** Klick auf einen ALLGEMEINEN eBay-Shop-Link (Footer, Über-uns, Reviews,
 *  Warenkorb-Hinweis) — bewusst getrennt von trackEbayClick(productId), das
 *  laut eigenem Kommentar dort ausdrücklich "Kauf-CTA, nicht der allgemeine
 *  Shop-Link" misst. Bis 09/2026 waren diese sechs Stellen komplett
 *  ungetrackt: wie viele Besucher hier abspringen, war unbekannt.
 *  `source` benennt die Stelle, nicht das Produkt — es gibt keins. */
export function trackShopClick(source: string) {
  track('click_ebay_shop', { source });
}
