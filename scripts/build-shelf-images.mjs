// Erzeugt die Bilder fuer die Produkt-Regal-Sektion (src/sections/ProductShelf.tsx)
// aus raw-image-library/. Einmal laufen lassen, wenn sich ein Motiv aendert:
//
//   node scripts/build-shelf-images.mjs
//
// Warum eigene Zuschnitte statt public/images/doors/: die Tueren waren 4:5
// Kategoriebilder ohne Produktbezug. Das Regal zeigt zwei konkrete Produkte
// nebeneinander, und dafuer muessen Classic und Pro aus derselben Session,
// im selben Winkel und im selben Licht stehen — sonst vergleicht der Betrachter
// Fotografie statt Wachs. DSC05242 (blau) und DSC04096 (schwarz) sind dieses
// Paar: Block hochkant auf Schiefer, gruenes Bokeh dahinter.

import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = resolve(__dirname, '../raw-image-library');
const OUT = resolve(__dirname, '../public/images/shelf');

mkdirSync(OUT, { recursive: true });

// focusX/focusY: Bildanteil, auf den der Zuschnitt zentriert wird. Kein
// 'center'-Gravity, weil beide Bloecke ausserhalb der Bildmitte stehen — der
// blaue rechts davon, der schwarze fast mittig. Zentriert zugeschnitten wird
// der blaue Block am rechten Rand angeschnitten.
const JOBS = [
  {
    src: 'products/classic/DSC05242.png',
    out: 'wax-classic',
    ratio: 4 / 5,
    focusX: 0.59,
    focusY: 0.5,
    widths: [1000, 800],
  },
  {
    src: 'products/pro/DSC04096.JPG',
    out: 'wax-pro',
    ratio: 4 / 5,
    focusX: 0.5,
    focusY: 0.56,
    widths: [1000, 800],
  },
  {
    src: 'products/chains/11 Chain.jpeg',
    out: 'chains-flat',
    ratio: 3 / 2,
    focusX: 0.5,
    focusY: 0.5,
    widths: [1400, 800],
  },
  {
    src: 'products/pro/DSC03845.JPG',
    out: 'starter-box',
    ratio: 16 / 9,
    focusX: 0.5,
    focusY: 0.52,
    widths: [1200, 800],
  },
];

for (const job of JOBS) {
  const input = resolve(RAW, job.src);
  const img = sharp(input);
  const { width, height } = await img.metadata();

  // Groesstmoegliches Rechteck im Zielverhaeltnis, an focusY aufgehaengt.
  let cw = width;
  let ch = Math.round(width / job.ratio);
  if (ch > height) {
    ch = height;
    cw = Math.round(height * job.ratio);
  }
  const left = Math.max(0, Math.min(width - cw, Math.round(width * job.focusX - cw / 2)));
  const top = Math.max(0, Math.min(height - ch, Math.round(height * job.focusY - ch / 2)));

  for (const w of job.widths) {
    const suffix = w === job.widths[0] ? '' : `-${w}`;
    const file = resolve(OUT, `${job.out}${suffix}.webp`);
    await sharp(input)
      .extract({ left, top, width: cw, height: ch })
      .resize({ width: w })
      .webp({ quality: 78 })
      .toFile(file);
    console.log(`${job.out}${suffix}.webp  ${w}x${Math.round(w / job.ratio)}`);
  }
}
