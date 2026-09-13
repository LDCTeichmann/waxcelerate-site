// ─── Geteiltes Modul fuer /ketten — React-Seite UND Prerender-Skript ────────
// Gleiches Muster wie src/pages/rewax/content.ts: Meta, Nutzenband-Text und
// JSON-LD stehen genau einmal, damit KettenPage.tsx und
// generate-blog-html.mjs nie auseinanderlaufen (Produktkarten-Plan K9,
// docs/SEO_TECHNIK.md "beide Fassungen pflegen").

// Relativer Import statt @/-Alias: dieses Modul wird auch von
// generate-blog-html.mjs importiert (per tsx ohne tsconfig-paths-Aufloesung),
// gleiches Muster wie rewax/content.ts, das genau deshalb ganz ohne
// Cross-Modul-Import auskommt.
import { type Product } from '../../lib/data';

export const BASE = 'https://waxcelerate.de';

export const KETTEN_TITLE = 'Vorgewachste Fahrradketten kaufen | Waxcelerate';
export const KETTEN_TITLE_EN = 'Buy pre-waxed bicycle chains | Waxcelerate';
export const KETTEN_DESCRIPTION = 'Acht vorgewachste Fahrradketten für Shimano, SRAM und Campagnolo, 11- und 12-fach. Ultraschall-entfettet und handgewachst in Stuttgart, Quick-Link inklusive.';
export const KETTEN_DESCRIPTION_EN = 'Eight pre-waxed bicycle chains for Shimano, SRAM and Campagnolo, 11- and 12-speed. Ultrasonically degreased and hand-waxed in Stuttgart, quick-link included.';
export const KETTEN_H1 = 'Vorgewachste Fahrradketten';
export const KETTEN_H1_EN = 'Pre-Waxed Bicycle Chains';
export const KETTEN_LEAD = 'Ultraschall-entfettet und handgewachst in Stuttgart. Aufziehen und losfahren — kein eigenes Wachsbad nötig.';
export const KETTEN_LEAD_EN = 'Ultrasonically degreased and hand-waxed in Stuttgart. Fit it and ride — no wax bath of your own needed.';

/**
 * Nutzenband unter dem H1: drei Fakten statt der grauen Sammelzeile
 * ("Alle Ketten: vorgewachst · Quick-Link inklusive"), die hier entfaellt.
 * Versand ist immer kostenlos, bei eBay wie im eigenen Checkout (13.09.2026).
 */
export function chainBenefits(de: boolean): string[] {
  return [
    de ? 'Quick-Link inklusive' : 'Quick-link included',
    de ? 'Sofort fahrbereit' : 'Ready to ride',
    de ? 'Versand kostenlos' : 'Free shipping',
  ];
}

export function kettenBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
      { '@type': 'ListItem', position: 2, name: KETTEN_H1, item: `${BASE}/ketten` },
    ],
  };
}

export function kettenItemListSchema(chainProducts: Pick<Product, 'id' | 'title'>[]) {
  return {
    '@type': 'ItemList',
    itemListElement: chainProducts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}/produkt/${p.id}`,
      name: p.title,
    })),
  };
}

export function kettenCollectionSchema(chainProducts: Pick<Product, 'id' | 'title'>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: KETTEN_H1,
        description: KETTEN_DESCRIPTION,
        url: `${BASE}/ketten`,
        inLanguage: 'de-DE',
      },
      kettenBreadcrumbSchema(),
      kettenItemListSchema(chainProducts),
    ],
  };
}

/** Fallback-Rueckweg von einer Produktseite (K9/Zurueck-Weg): Ketten fuehren
 *  auf /ketten zurueck, Wachs auf das Regal. Ziel-Label statt Richtungslabel
 *  senkt die Klickhuerde. */
export function backTarget(category: Product['category'], de: boolean): { to: string; label: string } {
  return category === 'chain'
    ? { to: '/ketten', label: de ? 'Alle Ketten' : 'All chains' }
    : { to: '/#produkte', label: de ? 'Alle Produkte' : 'All products' };
}
