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
import {
  products, trustStats, waxIntervals, starterSet, starterSetOptions, accessories, waxVsOil, frictionRanges,
} from '../src/lib/data.ts';
import { COMPONENTS } from '../src/lib/science.ts';
import { articles, categoryOrder } from '../src/pages/blog/articles.ts';
import { TOOLS, TOOLS_HUB } from '../src/lib/toolRegistry.ts';
import { translations } from '../src/lib/i18n.ts';

const DE = translations.de;

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
- [Über Waxcelerate](${BASE}/ueber-uns): Gründer, Herkunft, Fakten
- [Wissenschaft](${BASE}/wissenschaft): Kontaktzonen, Reibung, MoS₂ und die sechs Komponenten der Formel, mit Messwerten
- [Anleitung](${BASE}/anleitung): Kette wachsen, Re-Waxen, 3-Ketten-Rotation — Schritt für Schritt
- [Häufige Fragen](${BASE}/faq): ${DE.faq.items.length} Fragen und Antworten
- [Kontakt](${BASE}/kontakt): E-Mail, WhatsApp, Antwortzeiten
- [Blog-Übersicht](${BASE}/blog): ${articles.length} Ratgeber und Anleitungen
- [Rechner](${BASE}/rechner): ${TOOLS.length} kostenlose Rechner rund um Kette und Kettenpflege
- [Starter-Set](${BASE}/starter-set): Wachs, Quick-Link-Zange und Aufhängedraht in einem Set, ${starterSet.discountPct}% unter der Summe der Einzelteile

## Rechner — kostenlos, ohne Anmeldung

${TOOLS.map(t => `- [${t.cover}](${BASE}/rechner/${t.slug}): ${t.hint}`).join('\n')}

Kernzahlen, mit denen die Rechner arbeiten:

- Rewax-Intervall (km je Wachsung), nach Wetter × Gelände:
  - Trocken: Straße ${waxIntervals.trocken.strasse}, Gravel ${waxIntervals.trocken.gravel}, MTB ${waxIntervals.trocken.mtb}
  - Gemischt: Straße ${waxIntervals.gemischt.strasse}, Gravel ${waxIntervals.gemischt.gravel}, MTB ${waxIntervals.gemischt.mtb}
  - Nass: Straße ${waxIntervals.nass.strasse}, Gravel ${waxIntervals.nass.gravel}, MTB ${waxIntervals.nass.mtb}
  - Wochen-Intervall = km je Wachsung ÷ Wochenkilometer.
- Kettenverschleiß, Tauschgrenze der Längung über 12 Glieder (Neulänge 304,8 mm = 12 Zoll): 0,5 % bei 11-/12-fach, 0,75 % bei 9-/10-fach, 1,0 % bei 5- bis 8-fach.
- Kettenlänge in Gliedern = 0,157 × Kettenstrebe(mm) + größtes Kettenblatt ÷ 2 + größtes Ritzel ÷ 2 + 2, aufgerundet auf eine gerade Zahl (Park-Tool-Formel).

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

**Messbarer Unterschied** (Grenzreibungskoeffizient μ, Quelle: unabhängige Labortests von Zero Friction Cycling):
${(() => {
  const mu = n => n.toFixed(2).replace('.', ',');
  const r = id => frictionRanges.find(x => x.id === id);
  return `- Waxcelerate Pro (MoS₂): ${mu(r('pro').muLo)}–${mu(r('pro').muHi)}
- Waxcelerate Classic: ${mu(r('classic').muLo)}–${mu(r('classic').muHi)}
- Flüssigwachs (z.B. Squirt, Silca Drip): 0,09–0,12
- Kettenöl (nass): ${mu(r('oil').muLo)}–${mu(r('oil').muHi)}`;
})()}

---

## Produkte — Wachs

${wax.map(waxBlock).join('\n\n')}

## Produkte — Vorgewachste Ketten

Alle Ketten wurden vor dem Versand vollständig entfettet (Ultraschallbad) und mit dem Waxcelerate Pro MoS₂ Heißwachs behandelt. Kettenschloss / Quick-Link liegt bei. Sofort einsatzbereit.

${chains.map(chainBlock).join('\n\n')}

---

## Starter-Set

URL: ${BASE}/starter-set

Wachs, Quick-Link-Zange und Aufhängedraht in einem Set, vorgewachste Kette optional dazu. Der Set-Preis liegt ${starterSet.discountPct}% unter der Summe der Einzelteile. Zubehör auch einzeln erhältlich: ${accessories.map(a => `${a.title} (${a.price.toFixed(2).replace('.', ',')} €)`).join(', ')}.

Feste Kombinationen:
${starterSetOptions.map(o => `- ${o.taglineDe}`).join('\n')}

---

## Wissenschaft — Messwerte

URL: ${BASE}/wissenschaft

Kontaktzonen, Reibung, MoS₂ und die sechs Komponenten der Formel — gemessen statt behauptet, entwickelt und produziert in Stuttgart. Reibungs- und Wattwerte stammen aus unabhängigen Labortests von Zero Friction Cycling, nicht aus eigenen Messungen von Waxcelerate; Laborbedingungen bilden die Straße nicht eins zu eins ab, die Größenordnung der Unterschiede bleibt davon unberührt.

${(() => {
  const mu = n => n.toFixed(2).replace('.', ',');
  const r = id => frictionRanges.find(x => x.id === id);
  return `**Reibung (Grenzreibungskoeffizient μ):** Waxcelerate Pro ${mu(r('pro').muLo)}–${mu(r('pro').muHi)}, Classic ${mu(r('classic').muLo)}–${mu(r('classic').muHi)}, Kettenöl ${mu(r('oil').muLo)}–${mu(r('oil').muHi)}.`;
})()}

**Antriebsverlust** bei ${waxVsOil.watts.inputW[0]}–${waxVsOil.watts.inputW[1]} W Tretleistung: Wachs ${waxVsOil.watts.wax[0]}–${waxVsOil.watts.wax[1]} W, Kettenöl ${waxVsOil.watts.oil[0]}–${waxVsOil.watts.oil[1]} W.

**Kettenlaufzeit:** ${waxVsOil.life.waxLo} bis ${waxVsOil.life.wax}× länger als mit Kettenöl. **Kosten:** rund ${waxVsOil.cost.pctLess}% geringere Antriebskosten über ${waxVsOil.cost.km.toLocaleString('de-DE')} km (${waxVsOil.cost.oilEur} € Öl gegen ${waxVsOil.cost.waxEur} € Wachs, eine Kette, trockene Straße).

**Temperaturfenster:** Classic +5 bis rund 35 °C (enthält PTFE), Pro (MoS₂) −8 bis über 45 °C (PFAS- und PTFE-frei).

**Die sechs Komponenten der Formel:**
${COMPONENTS.slice().sort((a, b) => a.node - b.node).map(c => `- ${c.nameDe}: ${c.sumDe}`).join('\n')}

---

## Rechner — ${TOOLS.length} Werkzeuge

${TOOLS_HUB.lead}

${TOOLS.map(t => `### ${t.h1}

URL: ${BASE}/rechner/${t.slug}
Beantwortet: ${t.cover}
Eingaben: ${t.hint}

${t.lead}

${t.answer.join('\n\n')}
${t.faq ? `\n**Häufige Fragen:**\n\n${t.faq.map(f => `**${f.q}**\n${f.a}`).join('\n\n')}` : ''}`).join('\n\n---\n\n')}

---

## Ratgeber — alle ${articles.length} Artikel

${articles.map(articleBlock).join('\n\n---\n\n')}

---

## Über Waxcelerate

URL: ${BASE}/ueber-uns

${DE.about.bio1}

${DE.about.bio3}

${DE.about.bio4}

## Kontakt

URL: ${BASE}/kontakt

- E-Mail: waxcelerate@gmail.com (Antwort in der Regel am selben Tag)
- WhatsApp: +49 157 51957470 (meist sofort)
- Sitz: Stuttgart, Deutschland

## Anleitung — Kette wachsen, Schritt für Schritt

URL: ${BASE}/anleitung

### ${DE.guides.newChain.title}
${DE.guides.newChain.note}
${DE.guides.newChain.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### ${DE.guides.rewax.title}
${DE.guides.rewax.note}
${DE.guides.rewax.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### ${DE.guides.rotation.title}
${DE.guides.rotation.note}
${DE.guides.rotation.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Häufige Fragen — alle ${DE.faq.items.length}

URL: ${BASE}/faq

${DE.faq.items.map(f => `**${f.q}**\n${f.a}`).join('\n\n')}
`;

writeFileSync(resolve(__dirname, '../public/llms.txt'), llmsTxt);
writeFileSync(resolve(__dirname, '../public/llms-full.txt'), llmsFullTxt);
console.log(`llms.txt + llms-full.txt written — ${wax.length + chains.length} products, ${articles.length} articles, ${TOOLS.length} calculators.`);
