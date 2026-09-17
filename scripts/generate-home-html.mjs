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
import { minWaxPrice, products } from '../src/lib/data.ts';

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
const minChainPrice = Math.min(...products.filter(p => p.category === 'chain').map(p => p.price));

// Genau ein <h1>, und es traegt den Hauptsuchbegriff statt nur den Markennamen.
// "Waxcelerate" allein wuerde nur fuer die Markensuche helfen, und genau die
// funktioniert ohnehin, sobald die Seite indexiert ist.
//
// WORTGLEICH mit t.hero.a11yHeading in src/lib/i18n.ts: das ist die sr-only
// <h1>, die die React-Startseite rendert. Liefen die beiden auseinander,
// saehe ein Crawler ohne JavaScript eine andere Ueberschrift als einer mit.
//
// Seitenordnung Chat 2: die noscript-Gliederung folgt jetzt der schlanken
// Startseite (Hero → drei Türen → Was sich ändert → Bewertungen) statt der
// frueheren Produktlisten und des Rechner-Abschnitts — beide sind auf eigene,
// selbst vorgerenderte Seiten umgezogen (/kettenwachs, /ketten, /anleitung).
const body = `
<h1>Waxcelerate — Heißwachs für Fahrradketten aus Stuttgart</h1>
<p>Waxcelerate stellt Kettenwachs in kleinen Chargen selbst her. Zwei Formeln: Classic für Frühjahr bis Herbst, MoS₂ Pro für Winter und Nässe. Dazu vorgewachste Ketten, die sofort fahrbereit sind.</p>

<section>
  <h2>Kettenwachs, gewachste Ketten oder wachsen lassen</h2>
  <ul>
    <li><a href="/kettenwachs">Kettenwachs</a> — ab ${eur(minWaxPrice)}, Classic, Pro oder als Set</li>
    <li><a href="/ketten">Vorgewachste Ketten</a> — ab ${eur(minChainPrice)}, fertig gewachst, direkt montieren</li>
    <li><a href="/kette-wachsen-lassen">Kette wachsen lassen</a> — eigene Kette einschicken, gewachst zurück</li>
  </ul>
</section>

<section>
  <h2>Mehr</h2>
  <ul>
    <li><a href="/starter-set">Starter-Set</a> — Wachs, Kette, Zange und Draht in einem</li>
    <li><a href="/wissenschaft">Die Wissenschaft dahinter</a> — Kontaktzonen, Reibung, Messwerte</li>
    <li><a href="/anleitung">Anleitungen &amp; Rechner</a> — Kette wachsen, Re-Waxen, Rotation und Kostenrechner</li>
    <li><a href="/blog">Blog &amp; FAQ</a> — Anleitungen, Intervalle und häufige Fragen</li>
    <li><a href="/kontakt">Kontakt</a> — E-Mail, WhatsApp, Antwortzeiten, über mich</li>
  </ul>
</section>

<p>Versand kostenlos. Hergestellt in Stuttgart, Ketten handgewachst.</p>`.trim();

// In <noscript>, nicht direkt in #root: siehe buildPage() in
// scripts/lib/prerender.mjs fuer die volle Begruendung (Flash-of-unstyled-
// content-Fix — Browser mit JS rendern <noscript>-Inhalt nie, Crawler ohne
// JS lesen ihn weiterhin im Roh-HTML).
writeFileSync(INDEX, html.replace('<div id="root"></div>', `<div id="root"><noscript>${body}</noscript></div>`), 'utf8');

console.log('✓ Startseite mit Inhalt gefuellt (dist/index.html)');
