// Generates public/google-merchant-feed.xml — a free Google Merchant Center
// product feed (Shopping tab, Google Images, Search, Lens). Built from the
// same product data as the site itself, so it can't drift out of sync.
//
// Run manually after adding/changing a product:
//   npx tsx scripts/generate-merchant-feed.mjs
//
// One-time setup still needed in Merchant Center (merchants.google.com):
//   1. Create/verify the account for waxcelerate.de.
//   2. Products → Feeds → add a "Scheduled fetch" feed pointing at
//      https://waxcelerate.de/google-merchant-feed.xml
//   3. EU requirement: link the account to a price-comparison service
//      (e.g. idealo) under Growth → Manage programs, or enable
//      "Preisvergleichsportal" linking — required for free listings in the EU.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { products, shipping } from '../src/lib/data.ts';
import { assertXml } from './assert-xml.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/google-merchant-feed.xml');
const BASE = 'https://waxcelerate.de';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Wax products store a relative path (/images/...); chain products store an
// already-absolute eBay-hosted URL. Prepending BASE unconditionally produced
// "https://waxcelerate.dehttps://i.ebayimg.com/..." for every chain — an
// invalid image_link that would get all 8 chain listings disapproved.
const imageUrl = (path) => path.startsWith('http') ? path : `${BASE}${path}`;

// Google's taxonomy has no bicycle-lubricant leaf, so both product types
// sit under the same bicycle-accessories branch rather than mis-filing wax
// under automotive lubricants, which would hurt relevance matching more
// than it would help.
const GOOGLE_CATEGORY = {
  wax:   'Sporting Goods > Outdoor Recreation > Cycling > Bicycle Accessories',
  chain: 'Sporting Goods > Outdoor Recreation > Cycling > Bicycle Accessories > Bicycle Parts > Bicycle Drivetrain Parts > Bicycle Chains',
};

// Pre-waxed chains are resold Shimano/SRAM/YBN parts, not Waxcelerate's own
// manufactured product — the brand/mpn must identify the actual
// manufacturer, or Google's identifier-mismatch checks (and buyers cross-
// checking the part) will flag it. Wax is genuinely self-made, so our own
// id doubling as brand/mpn there is correct, not a placeholder.
//
// P1-5: g:shipping ergaenzt aus derselben Tarifklasse (shipping.ts), die
// auch der Checkout/Warenkorb verwendet — ein Einzelposten-Satz, nicht die
// Warenkorb-Staffel mit Gratisversand ab 50 Euro. Die Schwelle ist eine
// Merchant-Center-Kontoeinstellung (Versand → "Ab X kostenlos"), keine
// Pro-Artikel-Angabe im Feed; das kann nur Luca im Dashboard setzen.
//
// g:item_group_id + g:size nur fuer die vier Wachs-SKUs: sie sind
// Varianten desselben Grundprodukts (Formel x Groesse), Ketten sind
// eigenstaendige Modelle ohne gemeinsame Gruppe.
//
// BEWUSST NICHT ergaenzt: g:identifier_exists. Der urspruengliche SEO-Plan
// (P1-5) nannte "identifier_exists: no" fuers Wachs — falsch uebernommen:
// das Feld ist fuer Produkte OHNE jede Kennung gedacht. Wachs hat bereits
// ein gueltiges brand+mpn-Paar (Waxcelerate + Produkt-ID), das reicht
// Google als Identifier-Nachweis; identifier_exists:no wuerde faelschlich
// behaupten, es gebe gar keine Kennung. Korrektur gegenueber dem Plan,
// nicht der Plan selbst umgesetzt.
//
// BEWUSST NICHT ergaenzt: lokale Kopien der 8 Ketten-Hotlink-Bilder
// (i.ebayimg.com). Das braeuchte den Download fremder Bilddateien aus
// einem eBay-Konto, das nicht meins ist — eine Aktion, die laut den
// Sicherheitsregeln dieser Session explizite Rueckfrage braucht, nicht
// stillschweigend im selben Schritt wie die reinen Datenaenderungen unten.
const SHIP_COUNTRY = 'DE';
const shippingXml = (p) => {
  const rate = shipping[p.shippingClass];
  if (!rate) return '';
  return `
      <g:shipping>
        <g:country>${SHIP_COUNTRY}</g:country>
        <g:service>${esc(rate.label)}</g:service>
        <g:price>${(rate.cents / 100).toFixed(2)} EUR</g:price>
      </g:shipping>`;
};

const WAX_ITEM_GROUP_ID = 'waxcelerate-wachs';
const variantXml = (p) => p.category === 'wax'
  ? `
      <g:item_group_id>${WAX_ITEM_GROUP_ID}</g:item_group_id>
      <g:size>${esc(p.weight ?? '')}</g:size>`
  : '';

const item = (p) => `    <item>
      <g:id>${esc(p.id)}</g:id>
      <title>${esc(p.title)}</title>
      <description>${esc(p.description)}</description>
      <link>${BASE}/produkt/${esc(p.id)}</link>
      <g:image_link>${esc(imageUrl(p.image))}</g:image_link>
      <g:availability>${p.soldOut ? 'out of stock' : 'in stock'}</g:availability>
      <g:price>${p.price.toFixed(2)} EUR</g:price>
      <g:brand>${esc(p.category === 'chain' ? (p.chainBrand || p.chainModel || 'Waxcelerate') : 'Waxcelerate')}</g:brand>
      <g:condition>new</g:condition>
      <g:mpn>${esc(p.category === 'chain' ? (p.chainModel || p.id) : p.id)}</g:mpn>
      <g:google_product_category>${esc(GOOGLE_CATEGORY[p.category])}</g:google_product_category>
      <g:product_type>${esc(p.category === 'wax' ? 'Kettenwachs' : 'Vorgewachste Kette')}</g:product_type>${shippingXml(p)}${variantXml(p)}
    </item>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Waxcelerate Produkte</title>
    <link>${BASE}</link>
    <description>Heißwachs-Kettenpflege und vorgewachste Fahrradketten aus Stuttgart</description>
${products.map(item).join('\n')}
  </channel>
</rss>
`;

assertXml(xml, 'google-merchant-feed.xml');
const nItems = (xml.match(/<item>/g) || []).length;
if (nItems !== products.length) {
  throw new Error(`google-merchant-feed.xml: ${nItems} items vs ${products.length} products`);
}
writeFileSync(OUT, xml);
console.log(`google-merchant-feed.xml written with ${products.length} products.`);
