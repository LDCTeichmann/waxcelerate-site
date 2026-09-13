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
import { createIndex, search } from '../src/lib/search/engine.ts';

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
];

const payload = JSON.parse(readFileSync(resolve(root, 'public/search-index.json'), 'utf8'));
const engine = createIndex(payload);

let top1 = 0;
let top3 = 0;
const failures = [];

for (const [query, expected] of CASES) {
  const hits = search(engine, query, 5);
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

const n = CASES.length;
const pct = (x) => `${((x / n) * 100).toFixed(0)} %`;
console.log('');
console.log(`Top-1: ${top1}/${n} (${pct(top1)})   Top-3: ${top3}/${n} (${pct(top3)})`);

// Zielwerte aus dem Umbauplan. Unterschreitet die Suche sie, ist das ein
// echter Fehlschlag und kein "ist halt unscharf" — dann fehlen Aliase.
const TARGET_TOP1 = 0.9;
const TARGET_TOP3 = 1;
if (top1 / n < TARGET_TOP1 || top3 / n < TARGET_TOP3) {
  console.error(`\nFEHLGESCHLAGEN: Ziel ist Top-1 >= ${TARGET_TOP1 * 100} % und Top-3 = 100 %.`);
  console.error('Fehlende Bruecken ergaenzen in src/pages/blog/articleAliases.ts oder src/lib/search/synonyms.ts.');
  process.exit(1);
}
console.log('Abnahme bestanden.');
