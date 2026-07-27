// Erzeugt aus jeder Rohdatei in public/images/blog/ zwei WebP-Größen plus
// einen JPEG-Fallback: 1600px breit für Artikel-Hero, 800px für Kartenbilder
// in der Übersicht. Ziel unter 180 KB je Datei.
//
// Warum: getArticleImage() lieferte bisher eine einzige Datei, die sowohl als
// volle Hero-Breite als auch als ~380px-Vorschaukachel diente — die
// Blog-Übersicht lud also 17 Hero-Auflösungen für Vorschaukacheln, ohne
// width/height, mit springendem Layout beim Laden.
//
// Läuft manuell nach dem Ablegen neuer Fotos:
//   npx tsx scripts/optimize-blog-images.mjs

import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, '../public/images/blog');
const RAW_EXT = new Set(['.jpg', '.jpeg', '.png']);
const OUT_SIZES = [
  { suffix: '1600', width: 1600, webpQuality: 78, jpegQuality: 80 },
  { suffix: '800', width: 800, webpQuality: 76, jpegQuality: 78 },
];

function isAlreadyOutput(name) {
  return /-(1600|800)\.(webp|jpg)$/.test(name);
}

const entries = readdirSync(DIR).filter((f) => {
  if (isAlreadyOutput(f)) return false;
  const ext = extname(f).toLowerCase();
  return RAW_EXT.has(ext) && statSync(join(DIR, f)).isFile();
});

if (entries.length === 0) {
  console.log('Keine Rohbilder in public/images/blog/ gefunden — nichts zu tun.');
  process.exit(0);
}

let done = 0;

for (const file of entries) {
  const name = basename(file, extname(file));
  const srcPath = join(DIR, file);

  for (const size of OUT_SIZES) {
    const webpPath = join(DIR, `${name}-${size.suffix}.webp`);
    const jpegPath = join(DIR, `${name}-${size.suffix}.jpg`);

    await sharp(srcPath)
      .resize({ width: size.width, withoutEnlargement: true })
      .webp({ quality: size.webpQuality })
      .toFile(webpPath);

    await sharp(srcPath)
      .resize({ width: size.width, withoutEnlargement: true })
      .jpeg({ quality: size.jpegQuality, mozjpeg: true })
      .toFile(jpegPath);

    const kb = Math.round(statSync(webpPath).size / 1024);
    const flag = kb > 180 ? '  ⚠ über 180 KB' : '';
    console.log(`${name}-${size.suffix}.webp  ${kb} KB${flag}`);
  }
  done++;
}

console.log(`\n✓ ${done} Bild(er) verarbeitet, je 2 Größen × (WebP + JPEG-Fallback).`);
console.log('Rohdateien (JPG/PNG) bleiben unverändert liegen — nicht Teil des Deploys referenzieren.');
