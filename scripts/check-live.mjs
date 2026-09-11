// Automatisierter Nach-Deploy-Check: HTTP 200, Canonical, robots.txt,
// Sitemap und fehlende noindex-Tags — genau die Klasse Fehler, die bisher
// nur auffiel, wenn jemand von Hand curlte.
//
// Läuft NICHT als Teil von `npm run build` (der baut nur lokal, ohne
// Netzwerk) — sondern gezielt gegen eine Basis-URL, lokal gegen den
// `vite preview`-Server oder nach einem Deploy gegen die Live-Domain.
// Gleiches Prinzip wie scripts/ping-indexnow.mjs: ein Netzwerk-Skript bleibt
// bewusst außerhalb der Build-Kette.
//
// Aufruf:
//   node scripts/check-live.mjs                          # gegen https://waxcelerate.de
//   node scripts/check-live.mjs --base=http://localhost:4319
//
// Exit-Code 0 nur, wenn jede Prüfung besteht — geeignet für CI oder als
// Gate vor einem Deploy-Announcement.
//
// Lokal gegen `vite preview` erwartbare falsche Fehlschläge (kein Bug im
// Skript, sondern eine Grenze von `vite preview` selbst — gegen eine echte
// Vercel-Deployment-URL treten beide nicht auf):
//   1. Canonical-Mismatch auf jeder Unterseite ohne Trailing-Slash: sirv
//      (der Server hinter `vite preview`) löst "/faq" nicht auf
//      "dist/faq/index.html" auf, nur "/faq/" tut das — Vercel prüft dagegen
//      das Dateisystem vor jedem Rewrite und braucht keinen Trailing-Slash.
//   2. Fehlendes noindex auf /admin, /bestellung-erfolgreich, /produkt/:id/stage
//      und ein 200 statt 404 auf unbekannten URLs: beides kommt aus den
//      `headers`/`rewrites` in vercel.json, die `vite preview` nicht kennt.
// Verifiziert am 11.09.2026 gegen https://waxcelerate.de: 330 von 330
// Prüfungen bestanden.

const arg = process.argv.find((a) => a.startsWith('--base='));
const BASE = (arg ? arg.slice('--base='.length) : 'https://waxcelerate.de').replace(/\/$/, '');
const baseHost = new URL(BASE).hostname;
const isLocal = baseHost === 'localhost' || baseHost === '127.0.0.1';

// Seiten, die bewusst NICHT indexierbar sind (App-Routen ohne Prerender,
// siehe vercel.json rewrites + headers). Werden separat geprüft, nicht über
// die Sitemap — sie stehen dort korrekterweise nicht drin.
const NOINDEX_PATHS = ['/admin', '/bestellung-erfolgreich', '/produkt/wax-500/stage'];

let failures = 0;
let passed = 0;
const results = [];

function report(ok, label, detail = '') {
  if (ok) passed++; else failures++;
  results.push({ ok, label, detail });
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
}

// Folgt Redirects manuell (statt fetch redirect:'follow'), damit die Zahl
// der Hops zählbar ist und jede Zwischenstation geprüft werden kann.
async function followRedirects(url, maxHops = 5) {
  const chain = [{ url, status: null }];
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(current, { redirect: 'manual' });
    chain[chain.length - 1].status = res.status;
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) break;
      current = new URL(loc, current).toString();
      chain.push({ url: current, status: null });
    } else {
      break;
    }
  }
  return chain;
}

function extractAll(re, text) {
  return [...text.matchAll(re)].map((m) => m[1]);
}

function countTag(tagRe, html) {
  return (html.match(tagRe) ?? []).length;
}

async function checkPage(pathname, { expectNoindex = false } = {}) {
  const url = `${BASE}${pathname}`;
  let res;
  try {
    res = await fetch(url, { redirect: 'manual' });
  } catch (e) {
    report(false, `GET ${pathname}`, `Netzwerkfehler: ${e.message}`);
    return;
  }

  if (expectNoindex) {
    // Diese Routen dürfen 200 (App-Rewrite) sein, müssen aber noindex tragen.
    report(res.status === 200, `${pathname} → HTTP 200`, `Status ${res.status}`);
    const html = await res.text();
    const robotsHeader = res.headers.get('x-robots-tag') ?? '';
    const robotsMeta = /<meta\s+name="robots"[^>]*content="([^"]*)"/i.exec(html)?.[1] ?? '';
    const noindexed = /noindex/i.test(robotsHeader) || /noindex/i.test(robotsMeta);
    report(noindexed, `${pathname} trägt noindex`, noindexed ? '' : `weder X-Robots-Tag noch robots-Meta enthalten noindex (Header: "${robotsHeader}", Meta: "${robotsMeta}")`);
    return;
  }

  report(res.status === 200, `${pathname} → HTTP 200`, `Status ${res.status}`);
  if (res.status !== 200) return;

  const html = await res.text();

  const titleCount = countTag(/<title[^>]*>/gi, html);
  report(titleCount === 1, `${pathname}: genau ein <title>`, `gefunden: ${titleCount}`);

  const h1Count = countTag(/<h1[\s>]/gi, html);
  report(h1Count === 1, `${pathname}: genau ein <h1>`, `gefunden: ${h1Count}`);

  const canonicals = extractAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi, html);
  report(canonicals.length === 1, `${pathname}: genau ein Canonical`, `gefunden: ${canonicals.length}`);
  if (canonicals.length === 1) {
    const canon = canonicals[0];
    const isAbsolute = /^https?:\/\//.test(canon);
    report(isAbsolute, `${pathname}: Canonical ist absolut`, canon);
    if (isAbsolute) {
      const canonPath = new URL(canon).pathname.replace(/\/$/, '') || '/';
      const reqPath = pathname.replace(/\/$/, '') || '/';
      report(canonPath === reqPath, `${pathname}: Canonical zeigt auf sich selbst`, `Canonical-Pfad: ${canonPath}`);
    }
  }

  const robotsHeader = res.headers.get('x-robots-tag') ?? '';
  const robotsMeta = /<meta\s+name="robots"[^>]*content="([^"]*)"/i.exec(html)?.[1] ?? '';
  const noindexed = /noindex/i.test(robotsHeader) || /noindex/i.test(robotsMeta);
  report(!noindexed, `${pathname}: kein noindex`, noindexed ? `Header: "${robotsHeader}", Meta: "${robotsMeta}"` : '');
}

async function main() {
  console.log(`Prüfe ${BASE}${isLocal ? ' (lokal — Domain-Redirects werden übersprungen)' : ''}\n`);

  // ── robots.txt ────────────────────────────────────────────────────────
  const robotsRes = await fetch(`${BASE}/robots.txt`);
  report(robotsRes.status === 200, 'robots.txt → HTTP 200', `Status ${robotsRes.status}`);
  const robotsTxt = robotsRes.status === 200 ? await robotsRes.text() : '';
  report(/Allow:\s*\/\s*$/im.test(robotsTxt), 'robots.txt enthält "Allow: /"');
  report(/Sitemap:\s*https?:\/\//im.test(robotsTxt), 'robots.txt verweist auf eine Sitemap');

  // ── sitemap.xml ───────────────────────────────────────────────────────
  const sitemapRes = await fetch(`${BASE}/sitemap.xml`);
  report(sitemapRes.status === 200, 'sitemap.xml → HTTP 200', `Status ${sitemapRes.status}`);
  let locs = [];
  if (sitemapRes.status === 200) {
    const sitemapXml = await sitemapRes.text();
    report(sitemapXml.startsWith('<?xml'), 'sitemap.xml ist wohlgeformtes XML (Deklaration vorhanden)');
    const strippedAmp = sitemapXml.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);/g, '');
    report(!strippedAmp.includes('&'), 'sitemap.xml ohne unescaptes "&"');
    locs = extractAll(/<loc>([^<]+)<\/loc>/g, sitemapXml);
    report(locs.length > 0, 'sitemap.xml enthält URLs', `${locs.length} gefunden`);
  }

  // ── jede Sitemap-URL: 200, kein Redirect, Canonical, ein Title/H1, kein noindex ──
  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    await checkPage(pathname);
  }

  // ── bewusst nicht-indexierbare App-Routen ────────────────────────────
  for (const p of NOINDEX_PATHS) {
    await checkPage(p, { expectNoindex: true });
  }

  // ── unbekannte URL → echtes 404, kein Soft-404 ───────────────────────
  const fantasyRes = await fetch(`${BASE}/diese-seite-gibt-es-nicht-${Date.now()}`, { redirect: 'manual' });
  report(fantasyRes.status === 404, 'Unbekannte URL → HTTP 404 (kein Soft-404)', `Status ${fantasyRes.status}`);

  // ── Startseite ohne JavaScript: echter Text im Roh-HTML ──────────────
  const homeRes = await fetch(`${BASE}/`);
  if (homeRes.status === 200) {
    const homeHtml = await homeRes.text();
    const withoutScriptStyle = homeHtml
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '');
    const text = withoutScriptStyle.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(' ').filter(Boolean).length;
    report(wordCount > 100, 'Startseite ohne JS: substanzieller Fließtext im Roh-HTML', `${wordCount} Wörter`);
    report(/<h1[^>]*>/i.test(homeHtml.replace(/<script[\s\S]*?<\/script>/gi, '')), 'Startseite ohne JS: enthält <h1>');
  }

  // ── Redirect-Ketten der vier Domain-Varianten (nur gegen echte Domain) ──
  if (!isLocal) {
    const apex = `https://${baseHost}`;
    const variants = [
      `http://${baseHost}/`,
      `http://www.${baseHost}/`,
      `https://www.${baseHost}/`,
    ];
    for (const variant of variants) {
      const chain = await followRedirects(variant);
      const final = chain[chain.length - 1];
      const hops = chain.length - 1;
      const landedCorrectly = final.url.replace(/\/$/, '') === `${apex}` || final.url === `${apex}/`;
      report(landedCorrectly, `${variant} landet auf ${apex}/`, `${hops} Hop(s), Endstation: ${final.url}`);
      report(hops <= 2, `${variant}: höchstens 2 Redirect-Hops`, `${hops} Hop(s)`);
    }
  }

  console.log(`\n${passed} bestanden, ${failures} fehlgeschlagen.`);
  if (failures > 0) {
    console.log('\nFehlgeschlagene Prüfungen:');
    for (const r of results) if (!r.ok) console.log(`  ✗ ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Check abgebrochen:', e);
  process.exit(1);
});
