// Einmal-Skript: rendert die Rechner-Skizzen (diagrams.tsx) zu einer
// statischen HTML-Vorschau, hell + dunkel, alle Zustaende — damit man die
// Skizzen ohne laufenden Dev-Server pruefen kann. Nicht Teil des Builds.
//
//   npx tsx scripts/preview-diagrams.mjs && open scripts/.diagrams-preview.html

import { writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import * as React from 'react';
import { createElement as h } from 'react';
globalThis.React = React; // diagrams.tsx wird klassisch transpiliert (React.createElement)
import {
  ChainMeasureDiagram, ChainGaugeDiagram, SprocketCountDiagram,
  ChainstayDiagram, CassetteWearDiagram,
} from '../src/components/tools/diagrams.tsx';

const cases = [
  ['Messstrecke (Verschleiß · Lineal)', h(ChainMeasureDiagram)],
  ['Kettenlehre · Kette in Ordnung', h(ChainGaugeDiagram, { state: 'ok' })],
  ['Kettenlehre · Kette raus', h(ChainGaugeDiagram, { state: 'worn' })],
  ['Ritzel zählen (Verschleiß / Passende Kette)', h(SprocketCountDiagram)],
  ['Rad · Kettenstrebe', h(ChainstayDiagram, { highlight: 'stay' })],
  ['Rad · Kettenblatt', h(ChainstayDiagram, { highlight: 'ring' })],
  ['Rad · größtes Ritzel', h(ChainstayDiagram, { highlight: 'sprocket' })],
  ['Kassettenverschleiß (Ersparnis)', h(CassetteWearDiagram, { de: true })],
];

const card = ([title, el]) => `
  <figure>
    <figcaption>${title}</figcaption>
    <div class="pair">
      <div class="frame light">${renderToStaticMarkup(el)}</div>
      <div class="frame dark">${renderToStaticMarkup(el)}</div>
    </div>
  </figure>`;

const tokens = `
  --tx2:#454545; --bd2:#d9d9d9; --brand:#2B52B0; --sf2:#ffffff; --txm:#5b5b5b;
  --card-bg:#ffffff;`;
const tokensDark = `
  --tx2:#a1a1a1; --bd2:#3a3a3a; --brand:#6f95e6; --sf2:#17171b; --txm:#8a8a8a;
  --card-bg:#121216;`;

const html = `<!doctype html><meta charset="utf-8">
<title>Rechner-Skizzen — Vorschau</title>
<style>
  body{margin:0;font:14px/1.5 -apple-system,system-ui,sans-serif;background:#8a8a8a;padding:28px}
  h1{font-size:16px;margin:0 0 20px;color:#fff}
  figure{margin:0 0 30px}
  figcaption{font-size:13px;color:#fff;margin-bottom:8px;font-weight:600}
  .pair{display:flex;gap:18px}
  .frame{border-radius:16px;padding:16px 18px;width:320px}
  .frame.light{background:#ffffff;border:1px solid #d9d9d9;${tokens}}
  .frame.dark{background:#121216;border:1px solid #3a3a3a;${tokensDark}}
  svg{display:block;width:100%}
</style>
<h1>diagrams.tsx — je 360&nbsp;px (echte Kartenbreite im Deck)</h1>
${cases.map(card).join('')}`;

// In public/, damit der Dev-Server es live rendert (nicht als Snapshot).
// Vor dem Commit wieder loeschen.
const out = new URL('../public/_diagrams-preview.html', import.meta.url);
writeFileSync(out, html);
console.log('written', decodeURIComponent(out.pathname), '→ http://localhost:5177/_diagrams-preview.html');
