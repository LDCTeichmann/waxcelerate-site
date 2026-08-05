// Gemeinsame Bausteine fuer alle Prerender-Skripte.
//
// Warum es diese Datei gibt: Bis August 2026 lagen stripHead, buildPage,
// metaTags, ld, esc und write nur in generate-blog-html.mjs. Mit dem zweiten
// Generator (generate-product-html.mjs) haetten sie dupliziert werden muessen,
// und Duplikate driften. Besonders stripHead ist heikel: Wenn dort ein Tag
// vergessen wird, traegt eine Unterseite still den Titel oder das Canonical der
// Startseite, und genau dieser Fehler hat die zwoelf Produktseiten monatelang
// als Startseiten-Duplikate erscheinen lassen.
//
// Der Vertrag dieser Datei: Verhalten identisch zur fruheren Inline-Fassung.
// Aenderungen hier wirken auf Blog, feste Seiten und Produktseiten gleichzeitig
// und muessen gegen einen Referenz-Build gediffed werden.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const BASE = 'https://waxcelerate.de';

export const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** JSON-LD-Typen aus index.html, die nur die Startseite beschreiben. */
export const PAGE_SPECIFIC_SCHEMA = new Set(['Product', 'FAQPage', 'HowTo', 'ItemList']);

/**
 * Laedt dist/index.html als Huelle. Bricht ab, wenn der Vite-Build fehlt,
 * denn ohne die gehashten Asset-Tags waere jede erzeugte Seite tot.
 */
export function loadShell(dist) {
  const shellPath = join(dist, 'index.html');
  if (!existsSync(shellPath)) {
    console.error('✗ dist/index.html fehlt. Erst "vite build" laufen lassen.');
    process.exit(1);
  }
  return readFileSync(shellPath, 'utf8');
}

/**
 * Die beiden Hero-Bild-Preloads aus index.html (chain-bg.jpg, wax-cutout.webp).
 * Nur auf der Startseite korrekt — dort ist chain-bg.jpg das echte LCP-Bild.
 * stripHead() entfernt sie fuer jede Unterseite, jedes Prerender-Skript setzt
 * per imagePreload() sein eigenes, seitenrichtiges Paar. Ohne diese Trennung
 * laed jede der ~40 Unterseiten zwei Bilder mit hoechster Prioritaet vor, die
 * dort nie erscheinen, und nimmt dem tatsaechlichen LCP-Bild auf gedrosseltem
 * Mobilfunk rund 394 KB Bandbreite weg (Audit vom 05.08.2026, Problem 1).
 */
const HOME_ONLY_PRELOADS = /<link\s+rel="preload"\s+as="image"\s+href="\/images\/hero\/(?:chain-bg\.jpg|wax-cutout\.webp)"[^>]*>\s*/gi;

/** Entfernt die globalen Head-Tags aus der Huelle, die wir pro Seite ersetzen. */
export function stripHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(HOME_ONLY_PRELOADS, '')
    .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (full, json) => {
      // index.html traegt die JSON-LD-Bloecke der STARTSEITE. Als Huelle wuerden sie
      // sonst auf jeder Unterseite mitlaufen, d. h. jeder Artikel und jede
      // Produktseite behauptete zusaetzlich, das Startseiten-Product mit
      // AggregateRating zu sein und die Startseiten-FAQs zu beantworten. Das ist
      // irrefuehrendes Markup (Google-Spam-Policy) und ueberschreibt die
      // seiteneigenen Angaben.
      // Organization, WebSite und Person beschreiben die Site als Ganzes und bleiben.
      try {
        const type = JSON.parse(json)['@type'];
        return PAGE_SPECIFIC_SCHEMA.has(type) ? '' : full;
      } catch {
        return full;
      }
    });
}

/** Baut eine vollstaendige Seite aus Huelle + Head-Tags + Body-Inhalt. */
export function buildPage(shell, { head, body }) {
  let html = stripHead(shell);
  html = html.replace('</head>', `${head}\n</head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${body}</div>`,
  );
  return html;
}

export function metaTags({ title, description, canonical, image, type = 'website', published, modified }) {
  const abs = image?.startsWith('http') ? image : `${BASE}${image ?? '/images/hero-chain-texture.jpg'}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="Waxcelerate">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${abs}">`,
    published ? `<meta property="article:published_time" content="${published}">` : '',
    modified ? `<meta property="article:modified_time" content="${modified}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${abs}">`,
  ].filter(Boolean).join('\n  ');
}

export const ld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

/**
 * Seitenrichtiger Ersatz fuer die entfernten Home-Preloads. fetchpriority
 * "high" zusaetzlich zu rel="preload", weil Lighthouses lcp-discovery-insight
 * beides getrennt prueft: ohne Preload-Tag ist die Anfrage im initialen
 * Dokument nicht auffindbar (der Preload-Scanner sieht sie erst nach dem
 * JS-Start), ohne fetchpriority="high" konkurriert sie mit CSS und Fonts.
 * `type` ist optional, hilft dem Browser aber bei der Formatentscheidung
 * (z. B. AVIF/WebP-Unterstuetzung) ohne zusaetzliche Anfrage.
 */
export function imagePreload(href, type) {
  // href bleibt wie uebergeben (site-relativ wie "/images/..." oder absolut
  // wie eine externe eBay-URL) — beides loest der Browser im <head> korrekt
  // auf, eine Umwandlung in eine absolute URL ist hier anders als bei
  // metaTags()/og:image nicht noetig.
  const typeAttr = type ? ` type="${type}"` : '';
  return `<link rel="preload" as="image" href="${href}"${typeAttr} fetchpriority="high">`;
}

/** Leitet den MIME-Type aus der Dateiendung ab, fuer imagePreload(). */
export function mimeOf(src) {
  if (src.endsWith('.webp')) return 'image/webp';
  if (src.endsWith('.avif')) return 'image/avif';
  if (src.endsWith('.png')) return 'image/png';
  if (src.endsWith('.jpg') || src.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

/** Schreibt nach dist/<relDir>/index.html. */
export function write(dist, relDir, html) {
  const dir = join(dist, relDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}
