// Prerendert die zwoelf Produktseiten als statisches HTML nach dist/produkt/<id>/.
//
// Warum: Bis August 2026 lieferte /produkt/<id> im Roh-HTML die Startseiten-
// Huelle aus. Nicht nur ohne Inhalt, sondern mit dem Titel, der Description,
// dem Canonical UND dem Product-Schema der Startseite. Fuer Google sahen die
// zwoelf Produktseiten damit aus wie zwoelf Kopien der Startseite, die alle per
// Canonical auf die Startseite zeigen. Das ist schlechter als eine leere Seite,
// weil es aktiv ein falsches Signal setzt.
//
// react-helmet-async setzt zwar korrekte Titel, aber erst nachdem React
// gestartet ist. Crawler ohne JavaScript-Ausfuehrung (GPTBot, ClaudeBot,
// PerplexityBot, CCBot) sehen davon nichts.
//
// Ansatz wie bei generate-blog-html.mjs: kein Headless-Browser, sondern die
// vorhandene Datenstruktur aus src/lib/data.ts plus die gebaute dist/index.html
// als Huelle, damit die gehashten Asset-Tags erhalten bleiben und die SPA im
// Browser normal startet. React ersetzt #root beim Start komplett, es gibt
// daher keine Hydration-Mismatches.
//
// Laeuft am Ende des Builds, nach vite build:
//   npx tsx scripts/generate-product-html.mjs

import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { products, shipping } from '../src/lib/data.ts';
import { articles } from '../src/pages/blog/articles.ts';
import {
  BASE, esc, ld, metaTags, loadShell, buildPage, write, imagePreload, mimeOf,
} from './lib/prerender.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const shell = loadShell(DIST);

// ─── Bewusste inhaltliche Einschraenkung ────────────────────────────────────
// Die Felder `highlights`, `intervalDry` und `intervalWet` aus data.ts werden
// hier NICHT ausgegeben. Grund: Sie widersprechen aktuell den verbindlichen
// Vorgaben aus dem waxcelerate-Skill.
//
//   - highlights von wax-500 enthaelt "3x laengere Kettenlaufzeit". Decision
//     Log D2 schreibt "2 bis 3x" vor, die Einzelzahl ist untersagt.
//   - highlights von wax-500-mos2 enthaelt "Reibungskoeffizient 0,03-0,06".
//     PROJECT.md fuehrt diese Zahl selbst als offenen Streitpunkt.
//   - intervalDry sagt 250-450 km (Classic) bzw. 300-550 km (Pro). Decision
//     Log D1 und der gesamte Blog sagen 400-550 km.
//
// Diese Seiten sind neu und crawlbar. Widerspruechliche Zahlen dort erstmals zu
// veroeffentlichen waere schlimmer, als sie wegzulassen. Sobald Luca die Werte
// vereinheitlicht hat, koennen beide Bloecke hier ergaenzt werden; die Stellen
// sind unten markiert. Ausgegeben werden nur unstrittige Felder: Beschreibung,
// Preis, specs, Kompatibilitaet.

const ARTICLE_BY_PRODUCT = articles.reduce((acc, a) => {
  (acc[a.ctaSlug] ??= []).push(a);
  return acc;
}, {});

/** Versandkosten in Euro fuer die Tarifklasse des Produkts. */
const shippingRateEur = (p) => (shipping[p.shippingClass]?.cents ?? 0) / 100;

/**
 * Ketten sind zugekaufte Shimano-, SRAM- und YBN-Teile, kein Eigenprodukt.
 * brand und mpn muessen den echten Hersteller nennen, sonst schlagen Googles
 * Identifier-Pruefungen an und Kaeufer, die die Teilenummer gegenpruefen,
 * finden einen Widerspruch. Wachs ist selbst hergestellt, dort ist die eigene
 * Marke korrekt. Dieselbe Logik wie in generate-merchant-feed.mjs.
 */
const brandOf = (p) => (p.category === 'chain' ? p.chainBrand : 'Waxcelerate');
const mpnOf = (p) => (p.category === 'chain' ? p.chainModel : p.id);

const absImg = (src) => (src?.startsWith('http') ? src : `${BASE}${src}`);

const isPro = (p) => p.variant === 'pro';

// Deckt sich exakt mit lg() in src/pages/ProductDetailPage.tsx Zeile 22-25:
// die Galerie zeigt bei activeImage=0 (Erstladung) [product.image, ...images][0]
// = product.image, und fuer eigene Produktfotos (/products/...) die -lg.webp-
// Variante statt der Kartenansicht. Chain-Produkte fuehren ihr image als
// externe eBay-URL, die bleibt unveraendert (kein /products/-Pfad, kein Match).
const lg = (src) =>
  src.includes('/products/') && src.endsWith('.webp') && !src.endsWith('-lg.webp')
    ? src.replace('.webp', '-lg.webp')
    : src;

function titleOf(p) {
  return `${p.title} kaufen | Waxcelerate`;
}

function descriptionOf(p) {
  const price = p.price.toFixed(2).replace('.', ',');
  const base = p.description.replace(/\s+/g, ' ').trim();
  const suffix = ` ${price} €, versandkostenfrei ab 50 €.`;
  // Googles Snippet schneidet bei ungefaehr 160 Zeichen ab. Lieber selbst
  // sauber kuerzen als mitten im Wort abgeschnitten werden.
  const room = 160 - suffix.length;
  const head = base.length > room ? `${base.slice(0, room - 1).trimEnd()}…` : base;
  return head + suffix;
}

// ─── Schema ─────────────────────────────────────────────────────────────────

function productSchema(p) {
  const url = `${BASE}/produkt/${p.id}`;
  const images = [p.image, ...(p.images ?? [])].filter(Boolean).map(absImg);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description,
    image: images,
    sku: p.id,
    mpn: mpnOf(p),
    category: p.category === 'wax' ? 'Kettenwachs' : 'Vorgewachste Fahrradkette',
    brand: { '@type': 'Brand', name: brandOf(p) },
    url,
    offers: {
      '@type': 'Offer',
      url,
      price: p.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      // Per @id auf den Organization-Knoten aus index.html verweisen, statt
      // einen zweiten, unverbundenen Waxcelerate-Knoten aufzumachen. So
      // sammeln sich alle Angebote auf EINER Marken-Entitaet.
      seller: { '@id': `${BASE}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: shippingRateEur(p).toFixed(2),
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'DE',
        },
        // Ab 50 EUR entfaellt der Versand, siehe shipping.freeFromCents.
        freeShippingThreshold: {
          '@type': 'DeliveryChargeSpecification',
          eligibleTransactionVolume: {
            '@type': 'PriceSpecification',
            minPrice: (shipping.freeFromCents / 100).toFixed(2),
            priceCurrency: 'EUR',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'DE',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        // returnFees fehlt bewusst: Wer die Rueckversandkosten traegt, geht aus
        // den Rechtstexten nicht eindeutig hervor. Eine Angabe waere geraten,
        // und "FreeReturn" zu behaupten waere eine falsche Zusage. Sobald das
        // geklaert ist, gehoert das Feld hier ergaenzt.
      },
    },
  };

  // Die MoS2-Pro-Linie ist PFAS- und PTFE-frei. Stiftung Warentest empfiehlt
  // seit 05/2025 ausdruecklich, auf genau diese Kennzeichnung zu achten, und
  // die Suchnachfrage danach steigt. Als additionalProperty ist die Angabe
  // maschinenlesbar, ohne im Fliesstext werblich zu wirken.
  // Gilt NUR fuer Pro. Die Classic-Linie enthaelt derzeit noch PTFE, das wird
  // auf der Seite offen benannt statt umschrieben.
  if (isPro(p)) {
    schema.additionalProperty = [
      { '@type': 'PropertyValue', name: 'PFAS-frei', value: 'ja' },
      { '@type': 'PropertyValue', name: 'PTFE-frei', value: 'ja' },
    ];
  }

  return schema;
}

function breadcrumbSchema(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Produkte', item: `${BASE}/#produkte` },
      { '@type': 'ListItem', position: 3, name: p.title, item: `${BASE}/produkt/${p.id}` },
    ],
  };
}

// ─── Seite ──────────────────────────────────────────────────────────────────

function renderProduct(p) {
  const url = `${BASE}/produkt/${p.id}`;
  const price = p.price.toFixed(2).replace('.', ',');

  // Das erste Galeriebild ist auf jeder Produktseite das LCP-Element (siehe
  // ProductDetailPage.tsx: gallery[0] = product.image, activeImage startet
  // bei 0). Ohne dieses Preload-Tag ist es fuer den Browser erst nach dem
  // Laden und Ausfuehren von JS auffindbar — auf gedrosseltem Mobilfunk der
  // Unterschied zwischen LCP 10,5 s und deutlich darunter (Audit vom
  // 05.08.2026, Problem 2). fetchPriority="high" traegt die React-Komponente
  // bereits selbst; das Preload-Tag macht die Anfrage zusaetzlich im
  // initialen Dokument auffindbar, bevor React ueberhaupt startet.
  const heroImg = lg(p.image);
  const head = [
    metaTags({
      title: titleOf(p),
      description: descriptionOf(p),
      canonical: url,
      image: p.image,
      type: 'product',
    }),
    imagePreload(heroImg, mimeOf(heroImg)),
    ld(productSchema(p)),
    ld(breadcrumbSchema(p)),
  ].join('\n  ');

  const specs = p.specs
    ? `<dl>${Object.entries(p.specs)
        .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
        .join('')}</dl>`
    : '';

  const related = ARTICLE_BY_PRODUCT[p.id] ?? [];
  const relatedHtml = related.length
    ? `<nav aria-label="Passende Ratgeber"><h2>Passend dazu</h2><ul>${related
        .map(a => `<li><a href="/blog/${a.slug}">${esc(a.titleShort)}</a></li>`)
        .join('')}</ul></nav>`
    : '';

  // Herkunftsangabe: Wachs wird selbst hergestellt, Ketten sind zugekauft und
  // werden nur gewachst. "Made in Germany" waere fuer die Ketten falsch.
  const origin = p.category === 'wax'
    ? 'Hergestellt in Stuttgart.'
    : `Kette von ${esc(p.chainBrand)}, handgewachst in Stuttgart.`;

  const proNote = isPro(p)
    ? `<p>Diese Formel ist PFAS- und PTFE-frei. Geschmiert wird mit Molybdändisulfid, einem metallischen Festschmierstoff.</p>`
    : '';

  const body = `
<nav aria-label="Brotkrumen"><a href="/">Startseite</a> › <span>${esc(p.title)}</span></nav>
<article>
  <h1>${esc(p.title)}</h1>
  <p>${esc(p.description)}</p>
  <p><strong>${price} €</strong> · versandkostenfrei ab 50 € · Lieferung innerhalb Deutschlands</p>
  ${proNote}
  ${p.compatibility ? `<p>Kompatibilität: ${esc(p.compatibility)}</p>` : ''}
  ${specs}
  <p>${origin}</p>
</article>
${relatedHtml}
<nav aria-label="Weitere Seiten">
  <p><a href="/">Zur Startseite</a> · <a href="/kette-wachsen-lassen">Kette wachsen lassen</a> · <a href="/starter-set">Starter-Set</a> · <a href="/wissenschaft">Wissenschaft</a> · <a href="/blog">Blog</a></p>
</nav>`.trim();

  return buildPage(shell, { head, body });
}

for (const p of products) {
  write(DIST, join('produkt', p.id), renderProduct(p));
}

console.log(`✓ ${products.length} Produktseiten vorgerendert nach dist/produkt/`);
