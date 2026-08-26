// Prerendert die Zubehör-Seiten (Quick-Link-Zange, Aufhängedraht) als
// statisches HTML nach dist/zubehoer/<slug>/.
//
// Gleicher Grund wie bei generate-product-html.mjs: ohne dieses Skript liefert
// /zubehoer/<slug> im Roh-HTML nur die Startseiten-Hülle, und react-helmet-async
// setzt Titel/Description/JSON-LD erst nach dem React-Start — für Crawler ohne
// JS-Ausführung unsichtbar. Deutlich schlankere Fassung als bei den Produkten:
// keine Formel-/Kompatibilitäts-/MoS2-Sonderfälle, weil Accessory keins davon hat.
//
// Läuft am Ende des Builds, nach vite build:
//   npx tsx scripts/generate-accessory-html.mjs

import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { accessories } from '../src/lib/data.ts';
import {
  BASE, esc, ldClientManaged, metaTags, loadShell, buildPage as buildPageWithShell,
  write as writeToDist, imagePreload, mimeOf,
} from './lib/prerender.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const shell = loadShell(DIST);

const buildPage = (parts) => buildPageWithShell(shell, parts);
const write = (relDir, html) => writeToDist(DIST, relDir, html);

function productSchema(a) {
  const url = `${BASE}/zubehoer/${a.slug}`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: a.title, description: a.description, image: `${BASE}${a.image}`, sku: a.id,
    brand: { '@type': 'Brand', name: 'Waxcelerate' },
    url,
  };
  // Kein Offer ohne echte eBay-URL — sonst behauptet das Schema Kaufbarkeit,
  // die die Seite selbst (noch) nicht anbietet ("Demnächst auf eBay").
  if (a.ebayUrl) {
    schema.offers = {
      '@type': 'Offer', url: a.ebayUrl, price: a.price.toFixed(2), priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${BASE}/#organization` },
    };
  }
  return schema;
}

function breadcrumbSchema(a) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Starter-Set', item: `${BASE}/starter-set` },
      { '@type': 'ListItem', position: 3, name: a.title, item: `${BASE}/zubehoer/${a.slug}` },
    ],
  };
}

function renderAccessory(a) {
  const url = `${BASE}/zubehoer/${a.slug}`;
  const price = a.price.toFixed(2).replace('.', ',');

  const head = [
    metaTags({ title: `${a.title} | Waxcelerate`, description: a.description, canonical: url, image: a.image, type: 'product' }),
    imagePreload(a.image, mimeOf(a.image)),
    ldClientManaged(productSchema(a)),
    ldClientManaged(breadcrumbSchema(a)),
  ].join('\n  ');

  const specs = a.specs
    ? `<dl>${Object.entries(a.specs).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`
    : '';
  const highlights = a.highlights?.length
    ? `<ul>${a.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>`
    : '';

  const body = `
<nav aria-label="Brotkrumen"><a href="/">Startseite</a> › <a href="/starter-set">Starter-Set</a> › <span>${esc(a.title)}</span></nav>
<article>
  <h1>${esc(a.title)}</h1>
  <p>${esc(a.description)}</p>
  <p><strong>${price} €</strong></p>
  ${highlights}
  ${specs}
  ${a.howTo ? `<p>${esc(a.howTo)}</p>` : ''}
</article>
<nav aria-label="Weitere Seiten">
  <p><a href="/">Zur Startseite</a> · <a href="/starter-set">Starter-Set</a></p>
</nav>`.trim();

  return buildPage({ head, body });
}

for (const a of accessories) {
  write(join('zubehoer', a.slug), renderAccessory(a));
}

console.log(`✓ ${accessories.length} Zubehör-Seiten vorgerendert nach dist/zubehoer/`);
