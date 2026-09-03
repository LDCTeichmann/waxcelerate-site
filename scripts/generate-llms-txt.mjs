// Regenerates public/llms.txt and public/llms-full.txt from the actual
// product and article data — both files were hand-written once and had
// drifted badly stale (llms.txt linked 6 of 18 blog articles, llms-full.txt
// had full content for only 2 of 18). Same class of bug generate-sitemap.mjs
// already fixed for sitemap.xml; this closes it for the AI-agent-facing
// files too, so it can't silently happen again.
//
// Run manually after adding/changing a product or blog article:
//   npx tsx scripts/generate-llms-txt.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { products, trustStats } from '../src/lib/data.ts';
import { articles, categoryOrder } from '../src/pages/blog/articles.ts';
import { TOOLS, TOOLS_HUB } from '../src/lib/toolRegistry.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://waxcelerate.de';

const wax = products.filter(p => p.category === 'wax');
const chains = products.filter(p => p.category === 'chain');

// ─── llms.txt — lightweight index ─────────────────────────────────────────

const llmsTxt = `# Waxcelerate

> Heißwachs für Fahrradketten aus Stuttgart. Zwei Formeln: Classic auf Paraffinbasis, MoS₂ Pro Edition PFAS- und PTFE-frei für Winter und Nässe. Handgefertigt in kleinen Chargen seit 2024.

Waxcelerate ist ein deutsches Kleinunternehmen, gegründet von Luca Teichmann (Medizinstudent, Stuttgart).
${trustStats.sold} verkaufte Einheiten, ${trustStats.reviews} Bewertungen, 100% positives Feedback. Verkauf seit 2024.

Produkte: Heißwachs in vier Varianten (Classic/Pro, 300g/500g) und ${chains.length} vorgewachste Fahrradketten.
Hauptvorteil gegenüber Kettenöl: trockener Film, keine Schmutzaufnahme, Kettenlaufzeit typisch 2–3× länger (6.000–12.000 km statt 2.000–3.000 km).
Empfohlenes Nachwachsen nach den Werten von Zero Friction Cycling: trockene Straße rund 300 km je Wachsung, gemischt oder nass 150–200 km, im Gelände etwa die halbe Strecke wie auf der Straße. Die Rechner unter /rechner arbeiten mit diesen Werten.

## Wichtigste Seiten

- [Startseite](${BASE}/): Produkte, Vergleich, Anleitungen, FAQ
- [Blog-Übersicht](${BASE}/blog): ${articles.length} Ratgeber und Anleitungen
- [Rechner](${BASE}/rechner): ${TOOLS.length} kostenlose Rechner rund um Kette und Kettenpflege

## Rechner — kostenlos, ohne Anmeldung

${TOOLS.map(t => `- [${t.cover}](${BASE}/rechner/${t.slug}): ${t.hint}`).join('\n')}

## Produkte — Wachs

${wax.map(p => `- [${p.title} (${p.price.toFixed(2).replace('.', ',')} €)](${BASE}/produkt/${p.id}): ${p.description}`).join('\n')}

## Produkte — Vorgewachste Ketten

${chains.map(p => `- [${p.title} (${p.price.toFixed(2).replace('.', ',')} €)](${BASE}/produkt/${p.id})`).join('\n')}

## Blog / Ratgeber

${categoryOrder.map(cat => {
  const inCat = articles.filter(a => a.category === cat);
  if (!inCat.length) return '';
  return `**${cat}:**\n${inCat.map(a => `- [${a.titleShort}](${BASE}/blog/${a.slug}): ${a.description}`).join('\n')}`;
}).filter(Boolean).join('\n\n')}

## Vollständige Inhalte für KI-Agenten

- [llms-full.txt](${BASE}/llms-full.txt): Alle Produkte und alle ${articles.length} Ratgeber-Artikel als vollständiger Markdown-Text
`;

// ─── llms-full.txt — full content dump ────────────────────────────────────

// Article body text can carry [[Link-Text|/pfad]] inline-link markers (see
// renderInlineText() in BlogArticlePage.tsx) — converts them to standard
// Markdown links here, consistent with every other link in this file.
const mdInlineLinks = (text = '') =>
  text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, label, href) => `[${label}](${BASE}${href})`);

const sectionToMd = (s) => {
  switch (s.type) {
    case 'h2': return `## ${s.text}`;
    case 'h3': return `### ${s.text}`;
    case 'p': return mdInlineLinks(s.text);
    case 'image': return `![${s.alt ?? ''}](${BASE}${s.src})${s.caption ? `\n*${s.caption}*` : ''}`;
    case 'ul': return (s.items ?? []).map(i => `- ${mdInlineLinks(i)}`).join('\n');
    case 'ol': return (s.items ?? []).map((i, idx) => `${idx + 1}. ${mdInlineLinks(i)}`).join('\n');
    case 'tip': return `> Tipp: ${mdInlineLinks(s.text)}`;
    case 'note': return `> Hinweis: ${mdInlineLinks(s.text)}`;
    default: return s.text ?? '';
  }
};

const waxBlock = (p) => `### ${p.title}
- Preis: ${p.price.toFixed(2).replace('.', ',')} €
${p.formula ? `- Zusammensetzung: ${p.formula.join(', ')}\n` : ''}${p.applications ? `- Anwendungen pro Block: ${p.applications}\n` : ''}${p.intervalDry ? `- Rewax-Intervall trocken: ${p.intervalDry}\n` : ''}${p.intervalWet ? `- Rewax-Intervall nass: ${p.intervalWet}\n` : ''}${p.compatibility ? `- Kompatibilität: ${p.compatibility}\n` : ''}- Verkauf: ${BASE}/produkt/${p.id}`;

const chainBlock = (p) => `### ${p.title}
- Preis: ${p.price.toFixed(2).replace('.', ',')} €
${p.chainBrand ? `- Hersteller: ${p.chainBrand}\n` : ''}${p.chainModel ? `- Modell: ${p.chainModel}\n` : ''}${p.chainLinks ? `- Glieder: ${p.chainLinks}\n` : ''}${p.chainSpeed ? `- Schaltung: ${p.chainSpeed}\n` : ''}${p.compatibility ? `- Kompatibilität: ${p.compatibility}\n` : ''}- Verkauf: ${BASE}/produkt/${p.id}`;

const articleBlock = (a) => `## ${a.title}
*Kategorie: ${a.category} · Lesezeit: ${a.readingTime} · ${BASE}/blog/${a.slug}*

${a.intro}

${a.sections.map(sectionToMd).join('\n\n')}
${a.faq ? `\n**Häufige Fragen zu diesem Artikel:**\n\n${a.faq.map(f => `**${f.q}**\n${f.a}`).join('\n\n')}` : ''}`;

const llmsFullTxt = `# Waxcelerate — Vollständige Produktinformationen und Ratgeber

**Kurzfassung:** Waxcelerate ist ein deutsches Kleinunternehmen aus Stuttgart, das Heißwachs für Fahrradketten sowie vorgewachste Ketten verkauft. Gegründet 2024 von Luca Teichmann. ${trustStats.sold} verkaufte Einheiten, ${trustStats.reviews} Bewertungen, 100% positiv. Verkauf über waxcelerate.de und eBay.de.

---

## Was ist Heißwachs für Fahrradketten?

Heißwachs (englisch: hot wax) ist eine Methode zur Fahrradkettenpflege, bei der Paraffinwachs auf 85–90 °C erhitzt und die Kette darin eingetaucht wird. Im Gegensatz zu Kettenöl trocknet Wachs vollständig aus und bildet einen trockenen Schmierfilm innerhalb der Kettenglieder. Schmutz und Sand haften nicht an einer trockenen Kette — der Hauptvorteil gegenüber allen Ölschmierungen.

**Messbarer Unterschied:**
- Heißwachs Reibungskoeffizient: 0,03–0,06
- Flüssigwachs (z.B. Squirt, Silca Drip): 0,09–0,12
- Kettenöl (nass): 0,15–0,25

---

## Produkte — Wachs

${wax.map(waxBlock).join('\n\n')}

## Produkte — Vorgewachste Ketten

Alle Ketten wurden vor dem Versand vollständig entfettet (Ultraschallbad) und mit dem Waxcelerate Pro MoS₂ Heißwachs behandelt. Kettenschloss / Quick-Link liegt bei. Sofort einsatzbereit.

${chains.map(chainBlock).join('\n\n')}

---

## Rechner — ${TOOLS.length} Werkzeuge

${TOOLS_HUB.lead}

${TOOLS.map(t => `### ${t.h1}

URL: ${BASE}/rechner/${t.slug}
Beantwortet: ${t.cover}
Eingaben: ${t.hint}

${t.lead}

${t.answer.join('\n\n')}`).join('\n\n---\n\n')}

---

## Ratgeber — alle ${articles.length} Artikel

${articles.map(articleBlock).join('\n\n---\n\n')}
`;

writeFileSync(resolve(__dirname, '../public/llms.txt'), llmsTxt);
writeFileSync(resolve(__dirname, '../public/llms-full.txt'), llmsFullTxt);
console.log(`llms.txt + llms-full.txt written — ${wax.length + chains.length} products, ${articles.length} articles, ${TOOLS.length} calculators.`);
