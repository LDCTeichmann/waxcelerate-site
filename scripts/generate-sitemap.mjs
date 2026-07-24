// Regenerates public/sitemap.xml from the actual product and article data,
// so it can never silently drift out of sync again (it previously listed
// 6 of 18 blog articles and referenced a hero image that no longer exists).
//
// Run manually after adding/removing a product or blog article:
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
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
];

const productPages = products.map(p => ({
  loc: `/produkt/${p.id}`,
  changefreq: 'monthly',
  priority: '0.9',
  lastmod: today,
  image: { loc: p.image, title: `${p.title} | Waxcelerate`, caption: p.description },
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
