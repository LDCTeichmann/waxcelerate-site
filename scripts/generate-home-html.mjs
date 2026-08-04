// Fuellt dist/index.html mit echtem Inhalt in #root.
//
// Sonderfall gegenueber allen anderen Prerender-Skripten: Der <head> der
// Startseite bleibt vollstaendig unangetastet. Er ist von Hand gepflegt und
// traegt die Knoten, auf die alle anderen Seiten per @id verweisen
// (Organization, WebSite, Person), dazu Geo-Meta, Font-Preloads und den
// Theme-Flash-Schutz. Hier wird ausschliesslich <div id="root"></div> gefuellt.
//
// Warum ueberhaupt: Bis August 2026 lieferte die Startseite im Roh-HTML einen
// leeren #root aus. Fuer Google war das eine Seite ohne Inhalt, was den Status
// "gecrawlt, zurzeit nicht indexiert" erklaert. Der Rumpf hier muss die Seite
// nicht ersetzen, sondern nur beschreiben, worum es geht, und in die App
// verlinken. Sobald React startet, ersetzt die echte Startseite ihn komplett.
//
// Laeuft nach vite build und nach generate-blog-html.mjs (das dist/index.html
// als Huelle liest und dabei einen leeren #root erwartet):
//   npx tsx scripts/generate-home-html.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { products } from '../src/lib/data.ts';
import { esc } from './lib/prerender.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const INDEX = join(DIST, 'index.html');

const html = readFileSync(INDEX, 'utf8');

if (!html.includes('<div id="root"></div>')) {
  // Entweder ist der Build kaputt, oder ein anderes Skript hat #root schon
  // gefuellt. Beides ist ein Fehler, der still zu falschem HTML fuehren wuerde.
  console.error('✗ dist/index.html enthaelt kein leeres <div id="root"></div>.');
  console.error('  Reihenfolge pruefen: vite build → generate-blog-html → generate-product-html → generate-home-html.');
  process.exit(1);
}

const eur = (n) => `${n.toFixed(2).replace('.', ',')} €`;

const wax = products.filter(p => p.category === 'wax');
const chains = products.filter(p => p.category === 'chain');

const list = (items) =>
  `<ul>${items
    .map(p => `<li><a href="/produkt/${p.id}">${esc(p.title)}</a> — ${eur(p.price)}</li>`)
    .join('')}</ul>`;

// Genau ein <h1>, und es traegt den Hauptsuchbegriff statt nur den Markennamen.
// "Waxcelerate" allein wuerde nur fuer die Markensuche helfen, und genau die
// funktioniert ohnehin, sobald die Seite indexiert ist.
const body = `
<h1>Heißwachs für Fahrradketten aus Stuttgart</h1>
<p>Waxcelerate stellt Kettenwachs in kleinen Chargen selbst her. Zwei Formeln: Classic für Frühjahr bis Herbst, MoS₂ Pro für Winter und Nässe. Dazu vorgewachste Ketten, die sofort fahrbereit sind.</p>

<section>
  <h2>Kettenwachs</h2>
  ${list(wax)}
</section>

<section>
  <h2>Vorgewachste Ketten</h2>
  ${list(chains)}
</section>

<section>
  <h2>Mehr</h2>
  <ul>
    <li><a href="/rewax">Rewax-Service</a> — gewachste Kette einschicken, fahrbereit zurückbekommen</li>
    <li><a href="/starter-set">Starter-Set</a> — Wachs, Kette, Zange und Draht in einem</li>
    <li><a href="/wissenschaft">Die Wissenschaft dahinter</a> — Kontaktzonen, Reibung, Messwerte</li>
    <li><a href="/blog">Ratgeber</a> — Anleitungen, Intervalle und ehrliche Antworten</li>
  </ul>
</section>

<p>Versandkostenfrei ab 50 €. Hergestellt in Stuttgart, Ketten handgewachst.</p>`.trim();

writeFileSync(INDEX, html.replace('<div id="root"></div>', `<div id="root">${body}</div>`), 'utf8');

console.log('✓ Startseite mit Inhalt gefuellt (dist/index.html)');
