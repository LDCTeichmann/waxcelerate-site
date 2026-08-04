// Meldet alle URLs der Sitemap per IndexNow an Bing (und damit an ChatGPT
// Search, das den Bing-Index nutzt) sowie an Yandex und Seznam.
//
// Warum das hier steht: Google entscheidet selbst, wann es eine neue Domain
// crawlt, und bei waxcelerate.de dauert das erkennbar lange. IndexNow ist der
// einzige Weg, eine Indexierung aktiv anzustossen statt darauf zu warten.
// Bing nimmt neue URLs damit typischerweise innerhalb von Minuten bis Stunden
// auf. Das ersetzt Google nicht, verschafft aber sofort Sichtbarkeit in Bing,
// DuckDuckGo (nutzt Bing) und ChatGPT Search.
//
// Der Schluessel liegt als Datei im public/-Ordner und muss unter
// https://waxcelerate.de/<key>.txt erreichbar sein, sonst lehnt IndexNow ab.
// Beides wird unten geprueft, bevor gesendet wird.
//
// Aufruf, nach jedem Deploy auf Produktion:
//   npx tsx scripts/ping-indexnow.mjs
//
// Kein Teil von "npm run build": Der Build laeuft auch fuer Preview-Deployments,
// und Preview-URLs duerfen nicht an Suchmaschinen gemeldet werden.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HOST = 'waxcelerate.de';
const KEY = '74ee22c75cc92464f6fc7d87ee40a1848108c9411d03f5173e05ba74a23fe01f';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

// URLs aus der gebauten Sitemap ziehen, damit die Liste nicht doppelt
// gepflegt werden muss und nie veraltet.
function urlsFromSitemap() {
  const xml = readFileSync(resolve(__dirname, '../public/sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

async function main() {
  const urlList = urlsFromSitemap();

  if (urlList.length === 0) {
    console.error('✗ Keine URLs in public/sitemap.xml gefunden. Erst generate-sitemap.mjs laufen lassen.');
    process.exit(1);
  }

  // Vorabpruefung: Liegt die Schluesseldatei wirklich oeffentlich? Ohne sie
  // quittiert IndexNow mit 403, und zwar stillschweigend fuer alle URLs.
  const keyCheck = await fetch(KEY_LOCATION);
  if (!keyCheck.ok) {
    console.error(`✗ Schluesseldatei nicht erreichbar: ${KEY_LOCATION} (HTTP ${keyCheck.status})`);
    console.error('  Erst deployen, dann dieses Skript erneut ausfuehren.');
    process.exit(1);
  }
  const keyBody = (await keyCheck.text()).trim();
  if (keyBody !== KEY) {
    console.error('✗ Inhalt der Schluesseldatei stimmt nicht mit dem Schluessel ueberein.');
    process.exit(1);
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });

  // IndexNow antwortet 200 oder 202 bei Erfolg. 422 heisst meist: URL gehoert
  // nicht zum angegebenen host. 403: Schluessel nicht gefunden oder falsch.
  if (res.ok) {
    console.log(`✓ ${urlList.length} URLs an IndexNow gemeldet (HTTP ${res.status}).`);
  } else {
    console.error(`✗ IndexNow antwortete mit HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('✗ Unerwarteter Fehler:', err.message);
  process.exit(1);
});
