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
// Seit v2 ist der Artikeltext nicht mehr ein Block, sondern nach <h2>
// gegliedert. Damit kann ein Treffer direkt in den Abschnitt springen, in dem
// die Antwort steht, statt nur auf den Artikel zu zeigen. Die FAQ liegt
// zusaetzlich getrennt bei: aus ihr baut die Suche die Antwortkarte.
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
import { headingId } from '../src/pages/blog/headingId.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Die eigene Inline-Link-Syntax [[Text|/pfad]] traegt nur mit dem Text bei,
 *  der Pfad wuerde als Tokenmuell im Index landen. */
const clean = (text) =>
  text.replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1').replace(/\s+/g, ' ').trim();

/** Artikel in Abschnitte zerlegen: ein Block vor der ersten <h2> (Intro), dann
 *  einer pro <h2>, zuletzt die FAQ (Anker #haeufige-fragen) und HowTo ohne
 *  Anker. Bewusst inklusive Ueberschriften und FAQ: dort
 *  steht das Vokabular, mit dem Leser tatsaechlich suchen ("Wachsbad zu kalt",
 *  "weisses Pulver"), waehrend Titel und Beschreibung eher SEO-Sprache sind. */
function toSections(article) {
  const blocks = [{ h: null, id: null, parts: [article.intro ?? ''] }];
  for (const stat of article.stats ?? []) blocks[0].parts.push(`${stat.value} ${stat.label}`);
  if (article.keyStat) blocks[0].parts.push(`${article.keyStat.value} ${article.keyStat.label}`);

  for (const section of article.sections ?? []) {
    if (section.type === 'h2' && section.text) {
      blocks.push({ h: section.text, id: headingId(section.text), parts: [section.text] });
      continue;
    }
    const current = blocks[blocks.length - 1];
    if (section.text) current.parts.push(section.text);
    if (section.items) current.parts.push(section.items.join(' '));
    if (section.caption) current.parts.push(section.caption);
    if (section.alt) current.parts.push(section.alt);
  }
  if (article.faq?.length) {
    // Seit die FAQ auf der Artikelseite sichtbar ist, hat sie einen eigenen Anker.
    blocks.push({ h: 'Häufige Fragen', id: 'haeufige-fragen', parts: article.faq.flatMap((f) => [f.q, f.a]) });
  }
  if (article.howTo?.steps?.length) {
    blocks.push({ h: null, id: null, parts: article.howTo.steps.flatMap((s) => [s.name ?? '', s.text ?? '']) });
  }
  return blocks
    .map((b) => ({ h: b.h, id: b.id, t: clean(b.parts.join(' ')) }))
    .filter((b) => b.t);
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
    sections: toSections(article),
    faq: (article.faq ?? []).map((f) => ({ q: f.q, a: clean(f.a) })),
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
  v: 2,
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
const faqCount = docs.reduce((n, d) => n + d.faq.length, 0);
console.log(`[search-index] ${docs.length} Artikel, ${aliasCount} Alias-Phrasen, ${faqCount} FAQ-Antworten, ${kb} kB → public/search-index.json`);
