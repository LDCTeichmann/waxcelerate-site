// Erzeugt dist/404.html — die Seite, die Vercel fuer jede nicht gematchte
// Route mit HTTP-Status 404 ausliefert.
//
// Warum es das braucht: Bis September 2026 fing der Catch-all-Rewrite in
// vercel.json ("/(.*)" -> "/index.html") jede unbekannte URL ab und lieferte
// die App-Huelle mit Status 200. Die React-Route "*" rendert zwar
// NotFoundPage, aber der Statuscode blieb 200 — fuer Google ein "soft 404",
// der beliebig viele Fantasie-URLs indexierbar macht. Jetzt gibt es keinen
// Catch-all mehr: vorgerenderte Seiten kommen direkt aus dem Dateisystem,
// alles andere faellt auf diese Datei und damit auf einen echten 404.
//
// Diese Datei bootet dieselbe App wie index.html (gleiche gehashte Asset-Tags
// aus der Vite-Huelle). React-Router matcht "*" und zeigt NotFoundPage —
// Inhalt unveraendert, nur der HTTP-Status stimmt jetzt. Fuer Crawler ohne
// JavaScript steht der Hinweis plus Navigationslinks im <noscript>.
//
// REIHENFOLGE: laeuft in gen:html VOR generate-home-html.mjs, weil es (wie
// generate-blog-html/-product) das leere <div id="root"></div> der Huelle
// braucht. generate-home-html fuellt danach nur dist/index.html, nicht diese
// Datei.
//
// Manuell:  npx tsx scripts/generate-404-html.mjs   (nach "vite build")

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { BASE, loadShell, buildPage } from './lib/prerender.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

const shell = loadShell(DIST);

// stripHead() (in buildPage) raeumt Titel, Description, Canonical, og/twitter
// und die startseitenspezifischen JSON-LD-Bloecke aus der Huelle. Hier kommt
// ein bewusst minimaler Kopf zurueck: noindex, ein sprechender Titel, kein
// Canonical (eine 404 hat keine kanonische Entsprechung).
const head = [
  '<title>Seite nicht gefunden | Waxcelerate</title>',
  '<meta name="robots" content="noindex, follow">',
  `<meta property="og:title" content="Seite nicht gefunden | Waxcelerate">`,
  `<meta property="og:url" content="${BASE}/404">`,
  '<meta property="og:type" content="website">',
].join('\n  ');

const body = `
<h1>Diese Seite gibt es nicht.</h1>
<p>Der Link ist falsch oder die Seite wurde verschoben. Hier geht es weiter:</p>
<ul>
  <li><a href="/">Startseite</a> — Kettenwachs und vorgewachste Ketten</li>
  <li><a href="/blog">Ratgeber</a> — Anleitungen, Intervalle, ehrliche Antworten</li>
  <li><a href="/rechner">Rechner</a> — Verschleiß, Kettenlänge, Rewax-Intervall, Kosten</li>
  <li><a href="/kette-wachsen-lassen">Kette wachsen lassen</a></li>
  <li><a href="/wissenschaft">Die Wissenschaft dahinter</a></li>
</ul>`.trim();

// stripHead() laesst die feste Zeile <meta name="robots" content="index, follow">
// aus der Huelle stehen (sie ist fuer jede normale Seite richtig). Auf der 404
// muss sie weg, sonst stehen zwei widerspruechliche robots-Direktiven im Kopf.
const html = buildPage(shell, { head, body }).replace(
  /\s*<meta\s+name="robots"\s+content="index,\s*follow"\s*\/?>/i,
  '',
);

const outPath = join(DIST, '404.html');
writeFileSync(outPath, html, 'utf8');

console.log('✓ dist/404.html erzeugt (noindex, HTTP 404 via Vercel)');
