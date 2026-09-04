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
    ratio: 16 / 10,
    focusX: 0.588,
    focusY: 0.47,
    zoom: 0.85,
    widths: [1000, 800],
  },
  {
    src: 'products/pro/DSC04096.JPG',
    out: 'wax-pro',
    ratio: 16 / 10,
    focusX: 0.518,
    focusY: 0.63,
    zoom: 0.66,
    widths: [1000, 800],
  },
  // Runde 2 (09/2026): Set/Ketten/Rewax nicht mehr aus raw-image-library,
  // sondern aus Lucas eigener Auswahl in image-drop/ (siehe dortige
  // LIESMICH.txt) — der Ordner liegt neben raw-image-library, `../` reicht.
  // Alle drei jetzt im Kartenformat 16:10 zugeschnitten (vorher 3:2 bzw.
  // 16:9), damit object-cover in SecondaryTile den Ausschnitt nicht ein
  // zweites Mal beschneidet — dieselbe Lehre wie bei den Wachsfotos in
  // Runde 1.
  {
    src: '../image-drop/starter-set/DSC04465.JPG',
    out: 'shelf-set',
    ratio: 16 / 10,
    focusX: 0.52,
    focusY: 0.5,
    zoom: 0.85,
    widths: [1000, 800],
  },
  {
    src: '../image-drop/ketten/0D504821-7271-43E5-B211-88B94AB38019_1_201_a.jpeg',
    out: 'shelf-ketten',
    ratio: 16 / 10,
    focusX: 0.5,
    focusY: 0.52,
    zoom: 0.92,
    widths: [1000, 800],
  },
  {
    src: '../image-drop/rewax/F7DE469F-8134-421C-8375-A80001552464_1_201_a.jpeg',
    out: 'shelf-rewax',
    ratio: 16 / 10,
    focusX: 0.56,
    focusY: 0.56,
    zoom: 0.92,
    widths: [1000, 800],
  },
];

for (const job of JOBS) {
  const input = resolve(RAW, job.src);
  const img = sharp(input);
  const { width, height } = await img.metadata();

  // Groesstmoegliches Rechteck im Zielverhaeltnis, an focusY aufgehaengt.
  // `zoom` < 1 schneidet enger: der Block soll die Karte fuellen, nicht als
  // Briefmarke in der Bildmitte stehen. Beide Wachsmotive teilen denselben
  // Wert, damit Classic und Pro exakt gleich gross im Bild stehen.
  let cw = Math.round(width * (job.zoom ?? 1));
  let ch = Math.round(cw / job.ratio);
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
