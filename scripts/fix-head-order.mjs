// Vite haengt den Entry-<script type="module"> vor das Stylesheet-<link> ans
// Ende von <head> an. Safari/WebKit beginnt in diesem Fall zu rendern, sobald
// der Script-Tag verarbeitet ist, ohne auf das noch ladende Stylesheet zu
// warten -> kurzer Flash des unstyled, vorgerenderten Inhalts (schwarzer
// Systemfont auf Weiss), bevor das CSS greift. Chrome/Firefox blocken hier
// zuverlaessig, Safari nicht immer - deshalb "manchmal" statt "immer".
//
// Fix: das <link rel="stylesheet"> im <head> vor den ersten <script
// type="module">-Tag ziehen. Laeuft auf dist/index.html, BEVOR gen:html
// laeuft, denn jedes Prerender-Skript nutzt genau diese Datei als Huelle
// (loadShell() in scripts/lib/prerender.mjs) - der Fix greift damit auf
// jeder generierten Seite, nicht nur der Startseite.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = join(resolve(__dirname, '../dist'), 'index.html');

const html = readFileSync(INDEX, 'utf8');

const stylesheetMatch = html.match(/<link rel="stylesheet"[^>]*>\n?/);
const scriptMatch = html.match(/<script type="module"[^>]*><\/script>\n?/);

if (!stylesheetMatch || !scriptMatch) {
  console.error('✗ dist/index.html: Stylesheet- oder Entry-Script-Tag nicht gefunden.');
  process.exit(1);
}

if (stylesheetMatch.index < scriptMatch.index) {
  console.log('✓ Stylesheet steht bereits vor dem Entry-Script, nichts zu tun.');
  process.exit(0);
}

const withoutStylesheet = html.replace(stylesheetMatch[0], '');
const scriptMatchAfterRemoval = withoutStylesheet.match(/<script type="module"[^>]*><\/script>\n?/);
const fixed =
  withoutStylesheet.slice(0, scriptMatchAfterRemoval.index) +
  stylesheetMatch[0] +
  withoutStylesheet.slice(scriptMatchAfterRemoval.index);

writeFileSync(INDEX, fixed, 'utf8');
console.log('✓ Stylesheet-Link vor Entry-Script verschoben (dist/index.html)');
