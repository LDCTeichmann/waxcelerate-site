// Baut public/search-index.json fuer die Ratgeber-Suche.
//
// Warum ueberhaupt ein eigener Index, wo die Artikel doch schon als TS-Modul
// vorliegen: articles.ts ist ~150 KB Fliesstext plus Markup-Struktur und wird
// von der Blog-Seite gar nicht vollstaendig gebraucht. Der Index enthaelt nur
// die durchsuchbaren Felder als flachen Text, wird erst beim ersten Tippen
// nachgeladen (siehe BlogIndexPage) und belastet die Startseite dadurch nicht.
//
// Der zweite, wichtigere Grund: hier werden die Alias-Flaechen aus
// articleAliases.ts eingemischt. Die sind der eigentliche Trick der Suche
// (Alltagssprache -> Fachtext), gehoeren aber nicht ins Client-Bundle. Zur
// Build-Zeit eingebacken kosten sie zur Laufzeit nichts.
//
// REIHENFOLGE: schreibt nach public/ und muss deshalb VOR `vite build` laufen
// (siehe ausfuehrliche Begruendung in scripts/generate-sitemap.mjs).
//
// Manuell nach Artikelaenderung:
//   npx tsx scripts/generate-search-index.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { articles, categoryOrder } from '../src/pages/blog/articles.ts';
import { articleAliases } from '../src/pages/blog/articleAliases.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Alle Textbausteine eines Artikels zu einer Zeichenkette verflachen.
 *  Bewusst inklusive der Abschnittsueberschriften und der FAQ: dort steht das
 *  Vokabular, mit dem Leser tatsaechlich suchen ("Wachsbad zu kalt",
 *  "weisses Pulver"), waehrend Titel und Beschreibung eher SEO-Sprache sind. */
function flattenBody(article) {
  const parts = [article.intro ?? ''];

  for (const section of article.sections ?? []) {
    if (section.text) parts.push(section.text);
    if (section.items) parts.push(section.items.join(' '));
    if (section.caption) parts.push(section.caption);
    if (section.alt) parts.push(section.alt);
  }
  for (const entry of article.faq ?? []) parts.push(entry.q, entry.a);
  for (const step of article.howTo?.steps ?? []) parts.push(step.name ?? '', step.text ?? '');
  for (const stat of article.stats ?? []) parts.push(`${stat.value} ${stat.label}`);
  if (article.keyStat) parts.push(`${article.keyStat.value} ${article.keyStat.label}`);

  return parts
    .join(' ')
    // Die eigene Inline-Link-Syntax [[Text|/pfad]] beitraegt nur mit dem Text,
    // der Pfad wuerde als Tokenmuell im Index landen.
    .replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const missingAliases = [];

const docs = articles.map((article) => {
  const aliases = articleAliases[article.slug];
  if (!aliases?.length) missingAliases.push(article.slug);

  return {
    // id ist der Slug: MiniSearch braucht eine stabile ID, und der Slug ist
    // ohnehin schon eindeutig und wird fuer den Link gebraucht.
    id: article.slug,
    title: article.title,
    titleShort: article.titleShort,
    description: article.description,
    category: article.category,
    readingTime: article.readingTime,
    keyStat: article.keyStat ?? null,
    takeaways: (article.takeaways ?? []).join(' '),
    aliases: (aliases ?? []).join(' '),
    body: flattenBody(article),
  };
});

if (missingAliases.length) {
  // Kein harter Abbruch: ein neuer Artikel soll sich auch ohne Aliase schon
  // finden lassen. Aber laut genug, dass es im Build-Log nicht untergeht.
  console.warn(
    `[search-index] WARNUNG: keine Aliase fuer ${missingAliases.join(', ')}.\n` +
    '  Die Suche findet diese Artikel nur ueber woertliche Treffer.\n' +
    '  Ergaenze sie in src/pages/blog/articleAliases.ts.',
  );
}

const payload = {
  // Version hochzaehlen, wenn sich das Dokumentschema aendert — der Client
  // verwirft dann einen alten, aus dem Cache geladenen Index.
  v: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  categories: categoryOrder,
  docs,
};

const outDir = resolve(root, 'public');
mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, 'search-index.json');
writeFileSync(out, JSON.stringify(payload), 'utf8');

const kb = (JSON.stringify(payload).length / 1024).toFixed(1);
const aliasCount = Object.values(articleAliases).reduce((n, list) => n + list.length, 0);
console.log(`[search-index] ${docs.length} Artikel, ${aliasCount} Alias-Phrasen, ${kb} kB → public/search-index.json`);
