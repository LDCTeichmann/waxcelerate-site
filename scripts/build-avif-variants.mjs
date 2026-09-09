// Erzeugt AVIF-Varianten (und einen kleinen Logo-Satz) aus den bereits im
// Repo liegenden Bildern unter public/images/.
//
//   node scripts/build-avif-variants.mjs
//
// Warum: Lighthouse-Mobil-Messung vom 10.09.2026 auf der Startseite
// (Perf 87, LCP 3,7 s) nennt drei konkrete Posten:
//   - hero/wax-cutout.webp — 135 KB, davon 103 KB Ueberhang. Das ist das
//     LCP-Element auf Mobil (der antippbare Wachsblock).
//   - logo-dark.png — 320x320 PNG, 65 KB, angezeigt mit h-10 (40 px). Laeuft
//     im Footer JEDER Seite mit, also 64 KB Ueberhang site-weit.
//   - shelf/*-800.webp — je 10-14 KB Ueberhang.
//
// Bewusst KEIN zusaetzliches srcset fuer den Wachsblock: der Block wird auf
// Mobil ueber --hero-block-w und auf Desktop ueber einen anderen Anteil
// skaliert, ein `sizes`-Attribut muesste beide Faelle treffen und waere die
// wahrscheinlichste Fehlerquelle. AVIF bei gleicher Pixelbreite bringt hier
// den Grossteil derselben Ersparnis ohne dieses Risiko.
//
// Quellen sind absichtlich die vorhandenen public/-Dateien (nicht
// raw-image-library/), damit das Skript ohne die grossen Rohordner laeuft und
// reproduzierbar bleibt. Der Wachsblock kommt aus dem PNG, nicht aus dem WebP:
// er traegt Alpha, und eine zweite verlustbehaftete Runde auf ein bereits
// komprimiertes WebP frisst genau die Kante, die bei diesem Freisteller
// mehrfach muehsam hergestellt wurde.

import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG = resolve(__dirname, '../public/images');

// quality 58 liegt bei diesen Motiven etwa auf der Wahrnehmungshoehe von
// WebP 78 (dem Wert, den build-shelf-images.mjs nutzt), bei rund halber Groesse.
const AVIF = { quality: 58, effort: 6 };

/** AVIF-Geschwister neben einer bestehenden Datei, gleiche Pixelbreite. */
const AVIF_JOBS = [
  // Hero — alle drei stehen in index.html als preload mit fetchpriority=high
  // und liegen damit direkt auf dem LCP-Pfad.
  { src: 'hero/wax-cutout.png', out: 'hero/wax-cutout.avif' },
  { src: 'hero/chain-bg.webp', out: 'hero/chain-bg.avif' },
  { src: 'hero/chain-weave-mobile.webp', out: 'hero/chain-weave-mobile.avif' },
  // Regal-Sektion — zwei Breiten je Motiv, passend zum vorhandenen srcset
  // in src/sections/ProductShelf.tsx.
  ...['wax-classic', 'wax-pro', 'shelf-set', 'shelf-ketten', 'shelf-rewax'].flatMap(n => [
    { src: `shelf/${n}.webp`, out: `shelf/${n}.avif` },
    { src: `shelf/${n}-800.webp`, out: `shelf/${n}-800.avif` },
  ]),
];

/** Verkleinerte Neuausgaben: Quelle ist viel groesser als die Anzeige. */
const RESIZE_JOBS = [
  // Footer-Logo: angezeigt mit h-10 (40 px), auf Produktseiten h-8 (32 px).
  // 160 px deckt auch ein 3x-Display mit Reserve ab.
  { src: 'logo-dark.png', out: 'logo-dark-160.webp', width: 160, format: 'webp', opts: { quality: 82 } },
  { src: 'logo-dark.png', out: 'logo-dark-160.avif', width: 160, format: 'avif', opts: AVIF },
];

const kb = n => `${(n / 1024).toFixed(1)} KB`;

async function sizeOf(p) {
  try { return (await stat(p)).size; } catch { return 0; }
}

let savedTotal = 0;

for (const job of RESIZE_JOBS) {
  const input = join(IMG, job.src);
  if (!existsSync(input)) { console.warn(`  ! fehlt, uebersprungen: ${job.src}`); continue; }
  const output = join(IMG, job.out);
  await sharp(input).resize({ width: job.width })[job.format](job.opts).toFile(output);
  const [a, b] = [await sizeOf(input), await sizeOf(output)];
  console.log(`  ${job.out.padEnd(34)} ${kb(b).padStart(9)}  (Quelle ${job.src}: ${kb(a)})`);
}

for (const job of AVIF_JOBS) {
  const input = join(IMG, job.src);
  if (!existsSync(input)) { console.warn(`  ! fehlt, uebersprungen: ${job.src}`); continue; }
  const output = join(IMG, job.out);
  const meta = await sharp(input).metadata();
  await sharp(input).avif(AVIF).toFile(output);
  const [a, b] = [await sizeOf(input), await sizeOf(output)];
  savedTotal += Math.max(0, a - b);
  const pct = a ? `${Math.round((1 - b / a) * 100)}%` : '';
  console.log(`  ${job.out.padEnd(34)} ${kb(b).padStart(9)}  ${String(meta.width)}x${meta.height}  (${job.src}: ${kb(a)}, -${pct})`);
}

console.log(`\n  AVIF spart gegenueber der jeweiligen Vorlage zusammen ${kb(savedTotal)}.`);
console.log('  Hinweis: die alten .webp/.png bleiben als Fallback liegen und muessen es auch.');
