// ─── Geteiltes Modul fuer /kettenwachs — React-Seite UND Prerender-Skript ───
// Gleiches Muster wie src/pages/ketten/content.ts: Meta, Text und JSON-LD
// stehen genau einmal, damit KettenwachsPage.tsx und generate-blog-html.mjs
// nie auseinanderlaufen (Seitenordnung Chat 2, docs/SEO_TECHNIK.md).

// Relativer Import statt @/-Alias — dieses Modul wird auch von
// generate-blog-html.mjs importiert (per tsx ohne tsconfig-paths-Aufloesung).
import { type Product } from '../../lib/data';

export const BASE = 'https://waxcelerate.de';

export const KETTENWACHS_TITLE = 'Kettenwachs kaufen | Waxcelerate';
export const KETTENWACHS_TITLE_EN = 'Buy chain wax | Waxcelerate';
export const KETTENWACHS_DESCRIPTION = 'Kettenwachs Classic und Pro, 300 oder 500 g, plus Starter-Set mit Zange und Draht. Handgegossen in Stuttgart, versandkostenfrei.';
export const KETTENWACHS_DESCRIPTION_EN = 'Chain wax Classic and Pro, 300 or 500 g, plus a starter set with pliers and wire. Hand-poured in Stuttgart, free shipping.';
export const KETTENWACHS_H1 = 'Kettenwachs kaufen';
export const KETTENWACHS_H1_EN = 'Buy Chain Wax';
export const KETTENWACHS_LEAD = 'Classic oder Pro, 300 oder 500 g — oder gleich als Starter-Set mit Zange und Draht.';
export const KETTENWACHS_LEAD_EN = 'Classic or Pro, 300 or 500 g — or as a starter set with pliers and wire.';

export function kettenwachsBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
      { '@type': 'ListItem', position: 2, name: KETTENWACHS_H1, item: `${BASE}/kettenwachs` },
    ],
  };
}

export function kettenwachsItemListSchema(waxProducts: Pick<Product, 'id' | 'title'>[]) {
  return {
    '@type': 'ItemList',
    itemListElement: waxProducts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}/produkt/${p.id}`,
      name: p.title,
    })),
  };
}

export function kettenwachsCollectionSchema(waxProducts: Pick<Product, 'id' | 'title'>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: KETTENWACHS_H1,
        description: KETTENWACHS_DESCRIPTION,
        url: `${BASE}/kettenwachs`,
        inLanguage: 'de-DE',
      },
      kettenwachsBreadcrumbSchema(),
      kettenwachsItemListSchema(waxProducts),
    ],
  };
}
