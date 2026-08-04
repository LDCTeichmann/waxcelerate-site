// Holt die acht Kettenbilder von der eBay-CDN auf die eigene Domain.
//
// Warum das noetig ist: Die acht chain-Produkte in data.ts verweisen auf
// https://i.ebayimg.com/... Diese URLs landen dadurch in drei Systemen
// gleichzeitig: im Product-Schema der Produktseiten, in der Image-Sitemap und
// im Google-Merchant-Feed. Das hat drei Nachteile:
//
//   1. Bildranking laeuft auf ebayimg.com, nicht auf waxcelerate.de.
//      Die Google-Bildersuche fuehrt Treffer damit nicht zur eigenen Seite.
//   2. Endet ein eBay-Listing, verschwindet das Bild. Dann zeigt die
//      Produktseite eine Luecke, und der Merchant-Feed wird abgelehnt.
//   3. Fremdes Hotlinking ist auch ohne Ausfall unsauber gegenueber eBay.
//
// Nebeneffekt: eBay liefert unter s-l1600 groessere Fassungen derselben Datei.
// Google empfiehlt fuer Produkt-Rich-Results mindestens 1200 px Breite, die
// bisher genutzte s-l500-Variante liegt darunter. Das Skript versucht daher
// zuerst die grosse Fassung und faellt auf die vorhandene zurueck.
//
// WARUM DIESES SKRIPT AUF LUCAS MAC LAUFEN MUSS:
// Die Cowork-Sandbox erreicht i.ebayimg.com nicht (Proxy-Allowlist, HTTP 403),
// und sharp liegt dort als darwin-Binaerdatei. Beides ist auf dem Mac gegeben.
//
// Aufruf:
//   npx tsx scripts/migrate-chain-images.mjs          → nur pruefen, nichts schreiben
//   npx tsx scripts/migrate-chain-images.mjs --apply  → Bilder speichern und data.ts umstellen

import { writeFileSync, readFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import sharp from 'sharp';
import { products } from '../src/lib/data.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'public/images/products/chains');
const DATA_TS = join(ROOT, 'src/lib/data.ts');
const APPLY = process.argv.includes('--apply');

/** Sprechender Dateiname statt eBay-Hash: hilft der Bildersuche und dem Menschen. */
const slugOf = (p) =>
  [p.chainBrand, p.chainModel, p.chainSpeed, 'vorgewachst']
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function fetchFirst(urls) {
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length > 1000) return { url: u, buf };
      }
    } catch { /* naechste Variante */ }
  }
  return null;
}

const chains = products.filter(p => p.category === 'chain' && p.image.startsWith('http'));

if (chains.length === 0) {
  console.log('✓ Keine Ketten mit externen Bildern gefunden. Migration bereits erledigt.');
  process.exit(0);
}

console.log(`${chains.length} Kettenbilder zu migrieren.${APPLY ? '' : '  (Probelauf, --apply zum Schreiben)'}\n`);

if (APPLY) mkdirSync(OUT_DIR, { recursive: true });

const mapping = [];
let failed = 0;

for (const p of chains) {
  const slug = slugOf(p);
  const target = `/images/products/chains/${slug}.webp`;
  // s-l1600 zuerst, dann die Originalangabe aus data.ts als Rueckfallebene.
  const candidates = [p.image.replace(/s-l\d+\.webp$/, 's-l1600.webp'), p.image];

  const got = await fetchFirst(candidates);
  if (!got) {
    console.log(`✗ ${p.id.padEnd(14)} kein Bild erreichbar`);
    failed++;
    continue;
  }

  const meta = await sharp(got.buf).metadata();

  if (APPLY) {
    await sharp(got.buf).webp({ quality: 82 }).toFile(join(OUT_DIR, `${slug}.webp`));
  }

  console.log(`  ${p.id.padEnd(14)} ${String(meta.width).padStart(4)}px → ${target}`);
  mapping.push({ id: p.id, from: p.image, to: target });
}

if (failed) {
  console.error(`\n✗ ${failed} Bild(er) nicht erreichbar. Abbruch, data.ts bleibt unveraendert.`);
  process.exit(1);
}

if (!APPLY) {
  console.log('\nProbelauf beendet. Mit --apply werden Bilder gespeichert und data.ts umgestellt.');
  process.exit(0);
}

// ─── data.ts umstellen ──────────────────────────────────────────────────────
// Sicherungskopie zuerst, dann exakte String-Ersetzung. Kein Regex ueber die
// ganze Datei, sondern ein Treffer je bekannter URL, damit nichts anderes
// veraendert werden kann.
copyFileSync(DATA_TS, `${DATA_TS}.bak`);
let src = readFileSync(DATA_TS, 'utf8');
let replaced = 0;

for (const m of mapping) {
  const needle = `'${m.from}'`;
  if (!src.includes(needle)) {
    console.error(`✗ URL nicht in data.ts gefunden: ${m.from}`);
    continue;
  }
  src = src.replace(needle, `'${m.to}'`);
  replaced++;
}

if (replaced !== mapping.length) {
  console.error(`\n✗ Nur ${replaced} von ${mapping.length} Eintraegen ersetzt. data.ts NICHT geschrieben.`);
  console.error('  Sicherungskopie liegt unter src/lib/data.ts.bak');
  process.exit(1);
}

writeFileSync(DATA_TS, src, 'utf8');

console.log(`\n✓ ${replaced} Bilder gespeichert und in data.ts umgestellt.`);
console.log('  Sicherungskopie: src/lib/data.ts.bak');
console.log('\nNaechste Schritte:');
console.log('  npx tsc --noEmit');
console.log('  npm run build');
console.log('  → danach zeigen Sitemap, Merchant-Feed und Product-Schema auf die eigene Domain.');
