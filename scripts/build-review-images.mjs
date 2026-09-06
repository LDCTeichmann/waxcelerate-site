// Erzeugt die Karten-Zuschnitte fuer die Bewertungs-Sektion
// (src/sections/reviews.tsx) aus den echten Kundenfotos in
// public/images/reviews/ride-*.jpg. Einmal laufen lassen, wenn sich ein
// Motiv oder ein Zuschnitt aendert:
//
//   node scripts/build-review-images.mjs
//
// Warum ein eigener Zuschnitt: In der Reihe steht das Foto als schmaler
// Streifen (~128 px) links auf der Karte, ueber die volle Kartenhoehe. Die
// Rohbilder sind teils Querformat (ride-3/4/5) — in den Streifen gefaltet
// blieb davon nur ein Splitter uebrig, und mit object-position dagegen zu
// steuern hiess, gegen ein 1400er Bild bei 128 px Anzeige zu kaempfen. Hier
// wird jedes Motiv einmal bikezentriert auf 4:5 Hochformat geschnitten und
// klein gerechnet (~480 px, WebP + JPG-Fallback). Der Streifen zeigt danach
// erkennbar das Rad, nicht einen vertikalen Ausschnitt davon, und die
// Sektion laedt statt ~1,4 MB Roh-JPEG nur noch gut 100 KB.
//
// Die Originale ride-*.jpg bleiben unangetastet — ride-5.jpg dient
// zusaetzlich als Blog-Hero (src/pages/blog/articles.ts) und muss Querformat
// bleiben.

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, '../public/images/reviews');

const RATIO = 4 / 5; // Hochformat-Streifen
const OUT_W = 400; // ~3x fuer ~128-140 px Anzeige

// focusX/focusY: Bildanteil, auf den zentriert wird. zoom < 1 schneidet
// enger ans Rad. Werte visuell im Browser-Pane abgestimmt.
const JOBS = [
  // Maroon S-Works, Sonnenuntergang ueberm Feld — ganzes Rad, schmaler
  // Himmelstreifen oben. Volle Bildbreite, nach unten aufgehaengt.
  { src: 'ride-1.jpg', focusX: 0.5, focusY: 0.66, zoom: 1 },
  // Dasselbe S-Works am Dorfbrunnen — Rad mittig, auf Rahmen/Flaschen.
  { src: 'ride-2.jpg', focusX: 0.5, focusY: 0.62, zoom: 1 },
  // Schwarzes Allroad am See — Querformat, mittiger Ausschnitt auf Kurbel;
  // Laufraeder duerfen seitlich anschneiden.
  { src: 'ride-3.jpg', focusX: 0.5, focusY: 0.52, zoom: 1 },
  // Fahrer von hinten, Dolomiten-Passstrasse — auf Fahrer + Strasse + Gipfel.
  { src: 'ride-4.jpg', focusX: 0.49, focusY: 0.52, zoom: 1 },
  // Tuerkises Bianchi-Gravel vorm Biergarten — auf Rahmen/Sattelrohr.
  { src: 'ride-5.jpg', focusX: 0.47, focusY: 0.54, zoom: 1 },
];

for (const job of JOBS) {
  const input = resolve(DIR, job.src);
  const meta = await sharp(input).metadata();
  // ride-3.jpg traegt EXIF-Orientation 3 (180°). .rotate() ohne Argument
  // richtet nach EXIF aus; bei 90°-Faellen (5-8) tauschen Breite/Hoehe.
  const swap = (meta.orientation ?? 1) >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;

  // Groesstmoegliches 4:5-Rechteck, an focusX/focusY aufgehaengt.
  let cw = Math.round(width * job.zoom);
  let ch = Math.round(cw / RATIO);
  if (ch > height) {
    ch = height;
    cw = Math.round(height * RATIO);
  }
  const left = Math.max(0, Math.min(width - cw, Math.round(width * job.focusX - cw / 2)));
  const top = Math.max(0, Math.min(height - ch, Math.round(height * job.focusY - ch / 2)));

  const base = job.src.replace(/\.jpe?g$/i, '-card');
  const region = { left, top, width: cw, height: ch };

  await sharp(input).rotate().extract(region).resize({ width: OUT_W })
    .webp({ quality: 68 }).toFile(resolve(DIR, `${base}.webp`));
  await sharp(input).rotate().extract(region).resize({ width: OUT_W })
    .jpeg({ quality: 74, mozjpeg: true }).toFile(resolve(DIR, `${base}.jpg`));

  console.log(`${base}.{webp,jpg}  ${OUT_W}x${Math.round(OUT_W / RATIO)}  (crop ${cw}x${ch} @ ${left},${top})`);
}
