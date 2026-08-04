// Regenerates public/sitemap.xml from the actual product and article data,
// so it can never silently drift out of sync again (it previously listed
// 6 of 18 blog articles and referenced a hero image that no longer exists).
//
// Laeuft seit August 2026 automatisch im Build, siehe package.json.
//
// REIHENFOLGE IM BUILD, wichtig und leicht zu zerstoeren:
//
//   1. tsc -b
//   2. npm run gen:public   → sitemap.xml, llms.txt, google-merchant-feed.xml
//                             Diese Skripte schreiben nach public/ und muessen
//                             VOR vite build laufen, weil Vite public/ erst
//                             beim Build nach dist/ kopiert. Laufen sie danach,
//                             landen die neuen Dateien nie im Deployment.
//   3. vite build           → dist/ inkl. Kopie von public/
//   4. npm run gen:html     → generate-blog-html, generate-product-html,
//                             generate-home-html. Diese schreiben direkt nach
//                             dist/ und muessen daher NACH vite build laufen,
//                             sonst ueberschreibt der Build sie wieder.
//
//   Innerhalb von gen:html gilt zusaetzlich: generate-home-html muss ZULETZT
//   laufen. Die beiden anderen lesen dist/index.html als Huelle und erwarten
//   dort ein leeres <div id="root"></div>. Sobald die Startseite gefuellt ist,
//   wuerde ihr Inhalt sonst in jede Unterseite kopiert.
//
// Manuell nach Produkt- oder Artikeländerung:
//   npx tsx scripts/generate-sitemap.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { products } from '../src/lib/data.ts';
import { articles } from '../src/pages/blog/articles.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/sitemap.xml');
const BASE = 'https://waxcelerate.de';
const today = new Date().toISOString().slice(0, 10);

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0', image: {
      loc: `${BASE}/images/hero/chain-bg.jpg`,
      title: 'Waxcelerate Heißwachs für Fahrradketten',
      caption: 'Heißwachs-Kettenpflege aus Stuttgart — paraffinbasiert mit PTFE',
    } },
  { loc: '/wissenschaft', changefreq: 'monthly', priority: '0.8' },
  // Verkaufsseiten: hoehere Prioritaet als die Wissenschaftsseite, weil hier
  // gekauft und gebucht wird. Beide werden von generate-blog-html.mjs
  // vorgerendert, sonst saehen Crawler nur die Startseiten-Huelle.
  { loc: '/rewax', changefreq: 'monthly', priority: '0.9' },
  { loc: '/starter-set', changefreq: 'monthly', priority: '0.9' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
];

// Image-Sitemaps verlangen absolute URLs. Die Wachsprodukte speichern einen
// relativen Pfad (/images/...), die Ketten eine bereits absolute eBay-URL.
// Ohne diese Unterscheidung waeren entweder die vier Wachs-Bildeintraege
// ungueltig (relativ) oder die acht Kettenbilder kaputt ("https://waxcelerate.de"
// + "https://i.ebayimg.com/...").
const imageUrl = (path) => (path?.startsWith('http') ? path : `${BASE}${path}`);

const productPages = products.map(p => ({
  loc: `/produkt/${p.id}`,
  changefreq: 'monthly',
  priority: '0.9',
  lastmod: today,
  image: { loc: imageUrl(p.image), title: `${p.title} | Waxcelerate`, caption: p.description },
}));

const articlePages = articles.map(a => ({
  loc: `/blog/${a.slug}`,
  changefreq: 'monthly',
  priority: '0.7',
  lastmod: a.publishDate,
}));

const urlXml = ({ loc, changefreq, priority, lastmod, image }) => `  <url>
    <loc>${BASE}${loc}</loc>
${loc === '/' ? `    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/"/>
` : ''}    <lastmod>${lastmod ?? today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${image ? `    <image:image>
      <image:loc>${escape(image.loc)}</image:loc>
      <image:title>${escape(image.title)}</image:title>
      <image:caption>${escape(image.caption)}</image:caption>
    </image:image>
` : ''}  </url>`;

const all = [...staticPages, ...productPages, ...articlePages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${all.map(urlXml).join('\n')}
</urlset>
`;

writeFileSync(OUT, xml);
console.log(`sitemap.xml written with ${all.length} URLs (${productPages.length} products, ${articlePages.length} articles).`);
