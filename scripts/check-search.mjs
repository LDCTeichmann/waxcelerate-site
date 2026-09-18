// Abnahmetest der Ratgeber-Suche.
//
// Ohne diese Datei weiss niemand, ob die Suche wirklich funktioniert: dass sie
// keinen Fehler wirft, heisst nur, dass sie irgendetwas zurueckgibt. Hier steht
// schwarz auf weiss, welche Anfrage bei welchem Artikel landen muss.
//
// Die Anfragen sind bewusst so formuliert, wie jemand tippt, der den
// Fachbegriff NICHT kennt — genau der Fall, an dem die alte Substring-Suche
// gescheitert ist. Mehrere davon teilen mit ihrem Zielartikel kein einziges
// Wort; sie koennen nur ueber die Alias-Flaechen (articleAliases.ts) oder das
// Synonym-Woerterbuch (src/lib/search/synonyms.ts) gefunden werden.
//
// Wer einen Artikel ergaenzt: hier zwei, drei Zeilen mit ergaenzen.
//
// Aufruf:
//   npx tsx scripts/check-search.mjs
//   npx tsx scripts/check-search.mjs --verbose   (zeigt auch die Top-3)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createIndex, search, SITE_FAQ_DOC_ID } from '../src/lib/search/engine.ts';
import { articles } from '../src/pages/blog/articles.ts';
import { headingId } from '../src/pages/blog/headingId.ts';
import { symptoms, learningPath } from '../src/pages/blog/hubContent.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--verbose');

/** [Anfrage, erwarteter Slug] */
const CASES = [
  // Sauberkeit / Entfetten
  ['meine hose wird schwarz', 'fahrradkette-entfetten'],
  ['schwarze finger nach jeder fahrt', 'fahrradkette-entfetten'],
  ['womit entfette ich die kette', 'fahrradkette-entfetten'],
  ['reicht desinfektionsmittel zum reinigen', 'fahrradkette-entfetten'],

  // Intervall / Kosten
  ['wie oft muss ich neu wachsen', 'kettenlaufzeit-heisswachs'],
  ['nach wie vielen kilometern wieder', 'kettenlaufzeit-heisswachs'],
  ['lohnt sich das finanziell', 'kettenlaufzeit-heisswachs'],
  ['was spare ich damit', 'kettenlaufzeit-heisswachs'],

  // Problemloesung
  ['kette quietscht schon wieder', 'wachs-haelt-nicht-haeufige-fehler'],
  ['wachs blaettert ab', 'wachs-haelt-nicht-haeufige-fehler'],
  ['bei mir haelt das wachs einfach nicht', 'wachs-haelt-nicht-haeufige-fehler'],
  ['was habe ich falsch gemacht', 'wachs-haelt-nicht-haeufige-fehler'],

  // Erste Fahrt
  ['kette ist steif nach dem wachsen', 'erste-fahrt-nach-wachsen'],
  ['weisses pulver rieselt ab ist das normal', 'erste-fahrt-nach-wachsen'],

  // Ausruestung
  ['kann ich einen reiskocher nehmen', 'topf-zum-kette-wachsen'],
  ['brauche ich ein teures spezialgeraet', 'topf-zum-kette-wachsen'],
  ['slow cooker', 'topf-zum-kette-wachsen'],

  // Anleitung / Umstieg
  ['wie fange ich an', 'von-oel-auf-wachs-umsteigen'],
  ['ich komme von oel und will wechseln', 'von-oel-auf-wachs-umsteigen'],
  ['schritt fuer schritt anleitung wachsen', 'heisswachs-anleitung'],
  ['welche temperatur braucht das wachsbad', 'heisswachs-anleitung'],

  // Technik
  ['ist meine kette durch', 'kettenverschleiss-messen'],
  ['wann muss ich die kette tauschen', 'kettenverschleiss-messen'],
  ['was ist molybdaendisulfid', 'mos2-kettenwachs'],
  ['warum ist das wachs schwarz', 'mos2-kettenwachs'],

  // Saison
  ['schnee und streusalz', 'kettenwachs-winter'],
  ['funktioniert das bei kaelte', 'kettenwachs-winter'],

  // Entsorgung
  ['altes wachs wegwerfen', 'wachs-entsorgen-topf-pflegen'],
  ['wohin mit dem dreckigen wachs', 'wachs-entsorgen-topf-pflegen'],

  // Kaufberatung
  ['kette schon fertig gewachst kaufen', 'vorgewachste-kette'],
  ['keine lust das selbst zu machen', 'vorgewachste-kette'],
  ['lohnt sich das am rennrad', 'kettenwachs-rennrad-gravelbike'],
  ['wachs fuer pedelec mit motor', 'ebike-kette-wachsen'],

  // Zubehoer
  ['welches kettenschloss passt', 'schnellverschluss-quicklink'],
  ['kette ohne werkzeug oeffnen', 'schnellverschluss-quicklink'],

  // Vergleich / Hybrid
  ['wachs aus der flasche statt topf', 'heisswachs-vs-fluessigwachs'],
  ['bringt mir das ueberhaupt watt', 'heisswachs-vs-fluessigwachs'],
  ['zwischendurch auffrischen ohne kette abnehmen', 'tropfwachs-hybrid-methode'],

  // Woertliche Treffer, die weiter funktionieren muessen
  ['winter', 'kettenwachs-winter'],
  ['mos2', 'mos2-kettenwachs'],
  ['quicklink', 'schnellverschluss-quicklink'],
  ['kettenverschleiss messen', 'kettenverschleiss-messen'],

  // Tippfehler: so, wie es auf dem Handy wirklich ankommt
  ['quietscht die kette', 'wachs-haelt-nicht-haeufige-fehler'],
  ['quitscht die kette', 'wachs-haelt-nicht-haeufige-fehler'],
  ['kete entfetten', 'fahrradkette-entfetten'],
  ['reisskocher', 'topf-zum-kette-wachsen'],
  ['kettenverschleis', 'kettenverschleiss-messen'],

  // Die Beispielfragen im Platzhalter der Suche. Wer sie dort zeigt,
  // verspricht, dass sie funktionieren.
  ['meine Hose wird schwarz', 'fahrradkette-entfetten'],
  ['wie oft muss ich nachwachsen?', 'kettenlaufzeit-heisswachs'],
  ['Kette quietscht nach 50 km', 'wachs-haelt-nicht-haeufige-fehler'],
  ['kann ich einen Reiskocher nehmen?', 'topf-zum-kette-wachsen'],
  ['weißes Pulver, ist das normal?', 'erste-fahrt-nach-wachsen'],
  ['funktioniert Wachs im Winter?', 'kettenwachs-winter'],
];

/** [Anfrage, Teilstring der erwarteten FAQ-Frage] fuer die Antwortkarte.
 *  `null` heisst: hier darf KEINE Karte erscheinen. */
const ANSWER_CASES = [
  ['wie oft muss ich nachwachsen', 'nachwachsen'],
  ['kette quietscht nach 50 km', 'quietscht'],
  ['welche temperatur braucht das wachsbad', 'Temperatur'],
  ['kann ich einen reiskocher nehmen', 'Reiskocher'],
  ['weisses pulver ist das normal', 'Pulver'],
  ['wie oft darf ich den quicklink wiederverwenden', 'wiederverwenden'],
  ['altes wachs entsorgen', 'entsorge'],
  ['xylophon', null],
];

/** Seit Chat 4 (09/2026) traegt auch die Seiten-FAQ (t.faq.items, vorher
 *  /faq) Antwortkarten, ueber SITE_FAQ_DOC_ID (src/lib/search/engine.ts).
 *  [Anfrage, Teilstring der erwarteten Frage] — hier zusaetzlich geprueft,
 *  dass die Karte wirklich aus der Seiten-FAQ stammt, nicht aus einem Artikel. */
const SITE_FAQ_ANSWER_CASES = [
  ['ist ptfe im kettenwachs gesundheitlich bedenklich', 'PTFE'],
  ['was ist eine ketten rotation und warum drei ketten', 'Ketten-Rotation'],
];

const payload = JSON.parse(readFileSync(resolve(root, 'public/search-index.json'), 'utf8'));
const engine = createIndex(payload);

let top1 = 0;
let top3 = 0;
const failures = [];

for (const [query, expected] of CASES) {
  const { hits } = search(engine, query, 5);
  const rank = hits.findIndex((h) => h.slug === expected);
  if (rank === 0) top1 += 1;
  if (rank >= 0 && rank < 3) top3 += 1;

  const mark = rank === 0 ? 'OK  ' : rank > 0 && rank < 3 ? 'top3' : 'FAIL';
  if (rank !== 0) failures.push({ query, expected, got: hits.slice(0, 3).map((h) => h.slug), rank });
  if (verbose || rank !== 0) {
    console.log(`${mark}  "${query}"`);
    console.log(`      erwartet: ${expected}`);
    console.log(`      bekommen: ${hits.slice(0, 3).map((h, i) => `${i + 1}. ${h.slug} (${h.score.toFixed(2)})`).join('  ') || '— nichts —'}`);
  }
}

// Antwortkarten
let answerFails = 0;
for (const [query, expected] of ANSWER_CASES) {
  const { answer } = search(engine, query, 5);
  const ok = expected === null ? answer === null : Boolean(answer?.question.includes(expected));
  if (!ok) answerFails += 1;
  if (verbose || !ok) {
    console.log(`${ok ? 'OK  ' : 'FAIL'}  Antwort "${query}"`);
    console.log(`      erwartet: ${expected ?? '— keine Karte —'}`);
    console.log(`      bekommen: ${answer ? `${answer.question} (${answer.slug})` : '— keine Karte —'}`);
  }
}

let siteFaqFails = 0;
for (const [query, expected] of SITE_FAQ_ANSWER_CASES) {
  const { answer } = search(engine, query, 5);
  const ok = Boolean(answer?.slug === SITE_FAQ_DOC_ID && answer.question.includes(expected));
  if (!ok) siteFaqFails += 1;
  if (verbose || !ok) {
    console.log(`${ok ? 'OK  ' : 'FAIL'}  Seiten-FAQ "${query}"`);
    console.log(`      erwartet: ${expected} (site-faq)`);
    console.log(`      bekommen: ${answer ? `${answer.question} (${answer.slug})` : '— keine Karte —'}`);
  }
}

// Hub-Inhalte: jeder Sprunganker muss auf eine echte <h2> zeigen, jeder Slug
// auf einen echten Artikel. Sonst springt der Symptom-Wegweiser ins Leere.
const hubErrors = [];
const bySlug = new Map(articles.map((a) => [a.slug, a]));
for (const s of symptoms) {
  const article = bySlug.get(s.slug);
  if (!article) { hubErrors.push(`Symptom ${s.id}: Artikel ${s.slug} fehlt`); continue; }
  const ids = article.sections.filter((x) => x.type === 'h2').map((x) => headingId(x.text));
  if (!ids.includes(headingId(s.heading))) hubErrors.push(`Symptom ${s.id}: keine <h2> "${s.heading}" in ${s.slug}`);
}
for (const step of learningPath) if (!bySlug.has(step.slug)) hubErrors.push(`Lernpfad: Artikel ${step.slug} fehlt`);
for (const e of hubErrors) console.log(`FAIL  ${e}`);

const n = CASES.length;
const pct = (x) => `${((x / n) * 100).toFixed(0)} %`;
console.log('');
console.log(`Top-1: ${top1}/${n} (${pct(top1)})   Top-3: ${top3}/${n} (${pct(top3)})`);
console.log(`Antwortkarten: ${ANSWER_CASES.length - answerFails}/${ANSWER_CASES.length}   Seiten-FAQ-Antworten: ${SITE_FAQ_ANSWER_CASES.length - siteFaqFails}/${SITE_FAQ_ANSWER_CASES.length}   Hub-Verweise: ${hubErrors.length ? `${hubErrors.length} Fehler` : 'ok'}`);

// Zielwerte aus dem Umbauplan. Unterschreitet die Suche sie, ist das ein
// echter Fehlschlag und kein "ist halt unscharf" — dann fehlen Aliase.
const TARGET_TOP1 = 0.9;
const TARGET_TOP3 = 1;
if (answerFails || siteFaqFails || hubErrors.length) {
  console.error('\nFEHLGESCHLAGEN: Antwortkarten oder Hub-Verweise stimmen nicht (siehe FAIL-Zeilen oben).');
  process.exit(1);
}
if (top1 / n < TARGET_TOP1 || top3 / n < TARGET_TOP3) {
  console.error(`\nFEHLGESCHLAGEN: Ziel ist Top-1 >= ${TARGET_TOP1 * 100} % und Top-3 = 100 %.`);
  console.error('Fehlende Bruecken ergaenzen in src/pages/blog/articleAliases.ts oder src/lib/search/synonyms.ts.');
  process.exit(1);
}
console.log('Abnahme bestanden.');
