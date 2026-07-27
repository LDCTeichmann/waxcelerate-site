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

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, '../public/images/blog');
const RAW_EXT = new Set(['.jpg', '.jpeg', '.png']);
// Nur WebP. Ein JPEG-Fallback wäre 2026 toter Ballast: WebP wird von jedem
// Browser unterstützt, der diese Seite überhaupt rendern kann (seit 2020), und
// die Fallbacks haben die Dateizahl im Ordner ohne Nutzen verdoppelt.
const OUT_SIZES = [
  { suffix: '1600', width: 1600, webpQuality: 78 },
  { suffix: '800', width: 800, webpQuality: 76 },
];

function isAlreadyOutput(name) {
  return /-(1600|800)\.(webp|jpg)$/.test(name);
}

// public/images/blog ist ein Arbeitsordner: dort landen auch private Fotos und
// Altbestand, die nichts mit dem Blog zu tun haben. Verarbeitet wird deshalb
// ausschließlich, was in manifest.json kuratiert ist — sonst erzeugt das Skript
// Ableitungen für Bilder, die nie eine Seite sieht.
const manifest = JSON.parse(readFileSync(join(DIR, 'manifest.json'), 'utf8'));
const curated = new Set(manifest.images.map((i) => i.file));

const entries = readdirSync(DIR).filter((f) => {
  if (isAlreadyOutput(f) || !curated.has(f)) return false;
  const ext = extname(f).toLowerCase();
  return RAW_EXT.has(ext) && statSync(join(DIR, f)).isFile();
});

const missing = [...curated].filter((f) => !existsSync(join(DIR, f)));
if (missing.length) {
  console.log('Im Manifest gelistet, aber nicht im Ordner:', missing.join(', '), '\n');
}

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

    // Alle Blog-Bildflächen sind 16:10 (Karte wie Artikel-Hero). Hochformat-
    // Aufnahmen würden sonst per object-cover hart beschnitten, ohne dass wir
    // steuern, welcher Bildteil überlebt. sharp schneidet mit "attention" auf
    // den kontrastreichsten Bereich, das trifft bei diesen Motiven Kette bzw.
    // Wachsblock statt Himmel oder Asphalt.
    await sharp(srcPath)
      .resize({
        width: size.width,
        height: Math.round(size.width * 0.625),
        fit: 'cover',
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
      .webp({ quality: size.webpQuality })
      .toFile(webpPath);

    const kb = Math.round(statSync(webpPath).size / 1024);
    const flag = kb > 180 ? '  ⚠ über 180 KB' : '';
    console.log(`${name}-${size.suffix}.webp  ${kb} KB${flag}`);
  }
  done++;
}

console.log(`\n✓ ${done} Bild(er) verarbeitet, je 2 WebP-Größen (1600 Hero, 800 Karte), 16:10 beschnitten.`);
console.log('Die Rohdateien bleiben liegen, sind aber gitignored und werden nie ausgeliefert.');
