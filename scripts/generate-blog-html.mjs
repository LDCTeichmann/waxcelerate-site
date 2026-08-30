// Prerendert die Blog-Seiten als statisches HTML nach dist/.
//
// Warum: waxcelerate.de ist eine reine Client-Side-SPA. Jede URL liefert im
// rohen HTML nur <body><div id="root"></div></body> plus den Startseiten-Titel.
// Googlebot rendert JS verzögert nach, die KI-Crawler (GPTBot, ClaudeBot,
// PerplexityBot, CCBot, Applebot) überwiegend gar nicht. Damit sind 18 Artikel,
// alle Meta-Tags und das komplette JSON-LD für sie unsichtbar.
//
// Ansatz: Der Blog-Inhalt liegt bereits als Datenstruktur in articles.ts vor,
// also braucht es keinen Headless-Browser. Dieses Skript nimmt die gebaute
// dist/index.html als Hülle (damit die gehashten Asset-Tags erhalten bleiben
// und die SPA im Browser normal startet), ersetzt die Head-Tags pro Artikel
// und füllt #root mit echtem, semantischem HTML.
//
// Auf Vercel greift die SPA-Rewrite-Regel aus vercel.json nicht mehr, sobald
// dist/blog/<slug>/index.html existiert: Vercel prüft das Dateisystem VOR den
// Rewrites. Es ist also keine Config-Änderung nötig.
//
// React ersetzt beim Start via createRoot().render() das DOM komplett, es gibt
// daher keine Hydration-Mismatch-Fehler.
//
// Läuft am Ende des Builds:
//   npx tsx scripts/generate-blog-html.mjs
// (in package.json: "build": "tsc -b && vite build && npx tsx scripts/generate-blog-html.mjs")

import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { articles, getArticleImage, author, categoryOrder, blogHero } from '../src/pages/blog/articles.ts';
// Die Bausteine liegen seit August 2026 in scripts/lib/prerender.mjs, weil sie
// sich Blog-, Produkt- und Rechtstextseiten teilen. Verhalten unveraendert.
import {
  BASE, esc, ld, ldClientManaged, metaTags, loadShell, buildPage as buildPageWithShell, write as writeToDist,
  imagePreload, mimeOf,
} from './lib/prerender.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

const shell = loadShell(DIST);

// Duenne Adapter, damit die Aufrufstellen weiter unten unveraendert bleiben.
const buildPage = (parts) => buildPageWithShell(shell, parts);
const write = (relDir, html) => writeToDist(DIST, relDir, html);

// ─── Sections rendern ─────────────────────────────────────────────────────

// Server-side mirror of renderInlineText() in BlogArticlePage.tsx: [[Text|/pfad]]
// becomes a real <a href>, everything else is HTML-escaped as normal. Without
// this, crawlers would see the literal "[[...]]" marker syntax as plain text —
// worse than not having the feature at all.
const INLINE_LINK = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
function escWithLinks(text = '') {
  let out = '';
  let lastIndex = 0;
  let match;
  INLINE_LINK.lastIndex = 0;
  while ((match = INLINE_LINK.exec(text))) {
    out += esc(text.slice(lastIndex, match.index));
    out += `<a href="${esc(match[2])}">${esc(match[1])}</a>`;
    lastIndex = match.index + match[0].length;
  }
  out += esc(text.slice(lastIndex));
  return out;
}

function renderSection(s) {
  switch (s.type) {
    case 'h2': return `<h2>${esc(s.text)}</h2>`;
    case 'h3': return `<h3>${esc(s.text)}</h3>`;
    case 'p': return `<p>${escWithLinks(s.text)}</p>`;
    case 'image': return `<figure><img src="${esc(s.src)}" alt="${esc(s.alt ?? '')}" loading="lazy">${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}</figure>`;
    case 'ul': return `<ul>${(s.items ?? []).map(i => `<li>${escWithLinks(i)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol>${(s.items ?? []).map(i => `<li>${escWithLinks(i)}</li>`).join('')}</ol>`;
    case 'tip': return `<aside><strong>Tipp:</strong> ${escWithLinks(s.text)}</aside>`;
    case 'note': return `<aside><strong>Hinweis:</strong> ${escWithLinks(s.text)}</aside>`;
    default: return '';
  }
}

// ─── Artikelseiten ────────────────────────────────────────────────────────

function renderArticle(a) {
  const url = `${BASE}/blog/${a.slug}`;
  const img = getArticleImage(a.slug);
  const modified = a.dateModified ?? a.publishDate;

  const head = [
    metaTags({
      title: `${a.title} | Waxcelerate`,
      description: a.description,
      canonical: url,
      image: img.src,
      type: 'article',
      published: a.publishDate,
      modified,
    }),
    imagePreload(img.src, mimeOf(img.src)),
    ldClientManaged({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.description,
      articleSection: a.category,
      author: {
        '@type': 'Person',
        name: author.name,
        url: `${BASE}/#ueber-mich`,
      },
      // Per @id auf den Organization-Knoten aus index.html verweisen, statt einen
      // zweiten, unverbundenen Waxcelerate-Knoten aufzumachen. So sammelt sich
      // jede Aussage aus jedem Artikel auf EINER Marken-Entität (die auch sameAs
      // auf den eBay-Shop trägt), statt auf 18 gleichnamige Einzelknoten.
      publisher: {
        '@id': `${BASE}/#organization`,
        '@type': 'Organization',
        name: 'Waxcelerate',
        url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/images/logo.jpg` },
      },
      datePublished: a.publishDate,
      dateModified: modified,
      image: `${BASE}${img.src}`,
      url,
      inLanguage: 'de-DE',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    }),
    ldClientManaged({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: a.titleShort, item: url },
      ],
    }),
    a.howTo && ldClientManaged({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: a.howTo.name,
      description: a.description,
      totalTime: a.howTo.totalTime,
      step: a.howTo.steps.map((s, i) => ({
        '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text,
      })),
    }),
    a.faq && ldClientManaged({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: a.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }),
  ].filter(Boolean).join('\n  ');

  const others = articles.filter(r => r.slug !== a.slug);
  const related = [
    ...others.filter(r => r.category === a.category),
    ...others.filter(r => r.category !== a.category),
  ].slice(0, 3);

  const body = `
<nav aria-label="Brotkrumen"><a href="/">Startseite</a> › <a href="/blog">Blog</a> › <span>${esc(a.titleShort)}</span></nav>
<article>
  <header>
    <p>${esc(a.category)}</p>
    <h1>${esc(a.title)}</h1>
    <p>von ${esc(author.name)} · ${esc(a.readingTime)} · <time datetime="${a.publishDate}">${a.publishDate}</time>${
      modified !== a.publishDate
        ? ` · Zuletzt geprüft am <time datetime="${modified}">${modified}</time>`
        : ''
    }</p>
    <img src="${img.src}" alt="${esc(img.alt)}" width="1600" height="900">
  </header>
  ${a.keyStat ? `<p><strong>${esc(a.keyStat.value)}</strong> ${esc(a.keyStat.label)}</p>` : ''}
  <p>${esc(a.intro)}</p>
  ${a.takeaways ? `<section><h2>Das Wichtigste in Kürze</h2><ul>${a.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
  ${a.linksToCalculator ? `<p><a href="/#tools">Willst du dein eigenes Intervall wissen? Rechner öffnen →</a></p>` : ''}
  ${a.scienceLink ? `<p><a href="/wissenschaft${a.scienceLink.anchor ? `#${a.scienceLink.anchor}` : ''}">${esc(a.scienceLink.label)}</a></p>` : ''}
  ${a.sections.map(renderSection).join('\n  ')}
  ${a.faq ? `<section><h2>Häufige Fragen</h2>${a.faq.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>` : ''}
  <p><a href="/produkt/${a.ctaSlug}">${esc(a.ctaText)}</a></p>
  <footer>
    <p><strong>${esc(author.name)}</strong> — ${esc(author.role)}. ${esc(author.bio)}</p>
  </footer>
</article>
<nav aria-label="Weiterlesen">
  <h2>Weiterlesen</h2>
  <ul>${related.map(r => `<li><a href="/blog/${r.slug}">${esc(r.titleShort)}</a></li>`).join('')}</ul>
</nav>`.trim();

  return buildPage({ head, body });
}

// ─── Blog-Übersicht ───────────────────────────────────────────────────────

function renderIndex() {
  const url = `${BASE}/blog`;
  const head = [
    metaTags({
      title: 'Die Werkstatt — Heißwachs Tipps & Anleitungen | Waxcelerate',
      description: `Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs aus Stuttgart. ${articles.length} Artikel.`,
      canonical: url,
      image: '/images/blog/ride-road-golden.jpg',
    }),
    // blogHero, nicht ride-road-golden: Das ist das og:image (soziale
    // Vorschau), aber BlogIndexPage.tsx rendert tatsaechlich blogHero.src als
    // Full-Bleed-Masthead-Bild — das ist das echte LCP-Element dieser Seite.
    imagePreload(blogHero.src, mimeOf(blogHero.src)),
    ld({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Die Werkstatt',
      description: 'Ratgeber rund um Kettenwachs und Heißwachs für Fahrradketten.',
      url,
      inLanguage: 'de-DE',
      publisher: { '@type': 'Organization', name: 'Waxcelerate', url: BASE },
      blogPost: articles.map(a => ({
        '@type': 'BlogPosting',
        headline: a.title,
        url: `${BASE}/blog/${a.slug}`,
        datePublished: a.publishDate,
      })),
    }),
  ].join('\n  ');

  const byCat = categoryOrder
    .map(cat => {
      const inCat = articles.filter(a => a.category === cat);
      if (!inCat.length) return '';
      return `<section><h2>${esc(cat)}</h2><ul>${inCat
        .map(a => `<li><a href="/blog/${a.slug}">${esc(a.title)}</a> — ${esc(a.description)}</li>`)
        .join('')}</ul></section>`;
    })
    .filter(Boolean)
    .join('\n  ');

  const body = `
<nav aria-label="Brotkrumen"><a href="/">Startseite</a> › <span>Blog</span></nav>
<header>
  <p>Die Werkstatt</p>
  <h1>Wissen rund um Kette &amp; Wachs</h1>
  <p>Messwerte, Anleitungen und ehrliche Antworten von jemandem, der jede Woche selbst am Wachstopf steht.</p>
  <p>${articles.length} Artikel · Stuttgart</p>
</header>
${byCat}`.trim();

  return buildPage({ head, body });
}

// ─── Feste Seiten ────────────────────────────────────────────────────────────
// Ohne diesen Block liefern /rewax, /starter-set und /wissenschaft Crawlern die
// Startseiten-Huelle samt Startseiten-Titel: react-helmet setzt den Titel erst
// im Browser. Fuer zwei Verkaufsseiten ist das teuer. Der Rumpf hier ist
// bewusst schlank — er muss nur beschreiben, worum es geht, und in die App
// verlinken; sobald React uebernimmt, ersetzt die echte Seite ihn.
const STATIC_PAGES = [
  {
    // Adresse und Titel folgen der tatsaechlichen Suchsprache. "Rewax" ist ein
    // Anglizismus, der in deutschen Suchergebnissen praktisch nicht vorkommt;
    // Wettbewerber ranken mit "Kette wachsen lassen". /rewax leitet per 301
    // hierher (vercel.json).
    // Mobile-Plan B8: Titel hier musste mit dem client-seitigen <title> in
    // RewaxPage.tsx uebereinstimmen (Zeile ~232) — sonst sehen Crawler, die
    // nur die vorgerenderte Huelle lesen, einen anderen Titel als der, der
    // nach der Hydration im Browser steht. Der alte Titel hatte ausserdem
    // dieselbe "ab 9,95 €"-Ungenauigkeit wie die Preiskarte auf der
    // Startseite (products.tsx) — 9,95 € gilt erst ab drei Ketten, eine
    // einzelne kostet 13,95 €.
    dir: 'kette-wachsen-lassen',
    title: 'Fahrradkette wachsen lassen — Kettenwachs-Service aus Stuttgart | Waxcelerate',
    description: 'Fahrradkette einschicken, frisch heißgewachst zurückbekommen. 13,95 € je Kette, 9,95 € ab drei Ketten, zuzüglich 1,80 € Rückversand. Handgewachst in Stuttgart.',
    image: '/images/rewax/hero.webp', // deckt sich mit RewaxPage.tsx Zeile 309
    h1: 'Fahrradkette wachsen lassen',
    lead: 'Wachsen ist einfach, kostet aber einen Abend, einen Topf und Platz. Wenn du das nicht selbst machen willst, schick die Kette ein. Du bekommst sie fahrbereit zurück.',
    points: [
      'Nur bereits gewachste Ketten, eigene oder fremde. Geölte Ketten entfetten wir nicht, weil Öl ein ganzes Wachsbad unbrauchbar macht.',
      'Preise: 13,95 € für eine Kette, 9,95 € je Kette ab drei Ketten, jeweils zuzüglich 1,80 € Rückversand.',
      'Zehnerkarte: zehn Vorgänge im Voraus, zehn Prozent unter dem Dreierpreis, übertragbar und ohne Ablaufdatum.',
      'Alle gängigen 9 bis 12 fach Ketten. Handgewachst in Stuttgart.',
    ],
  },
  {
    dir: 'starter-set',
    title: 'Starter-Set Kettenwachs | Waxcelerate',
    description: 'Wachs, vorgewachste Kette, Quick-Link-Zange und Aufhängedraht in einem Set. Alles, was für das erste Wachsen nötig ist, zum Set-Preis.',
    image: '/images/doors/starter-set.webp', // deckt sich mit StarterSetPage.tsx Zeile 103
    h1: 'Alles da, beim ersten Mal.',
    lead: 'Am ersten Wachsabend scheitert es selten am Wachs. Es scheitert daran, dass die Kette nicht aufgeht oder nichts da ist, woran sie hängen kann. Im Set liegt beides bei.',
    points: [
      'Enthalten: ein Kettenwachs nach Wahl, eine vorgewachste Kette nach Wahl, eine Quick-Link-Zange und drei Aufhängedrähte.',
      'Wachslinie, Größe und Kette frei kombinierbar. Der Set-Preis liegt immer unter der Summe der Einzelteile.',
      'Zubehör auch einzeln: Aufhängedraht im Dreierpack und Quick-Link-Zange je 4,95 €.',
      'Hergestellt in Stuttgart, Ketten handgewachst.',
    ],
  },
  {
    dir: 'wissenschaft',
    title: 'Die Wissenschaft hinter Heißwachs | Waxcelerate',
    description: 'Kontaktzonen, Reibung, MoS₂ und die sechs Komponenten der Formel. Gemessen statt behauptet, entwickelt und produziert in Stuttgart.',
    // Mobile-Plan B6 (05.08.2026): cassette-wear-full.* enthielt Ueberschrift,
    // Fliesstext und beide Kassetten-Labels als Pixel im Bild — ersetzt durch
    // cassette-wear-diagram.* (gleiches Foto, Text-/Label-Bereich mit der
    // Hintergrundfarbe uebermalt) plus echtes HTML in SciencePage.tsx
    // (WearDiagramFigure). Muss mit deren erstem <source> uebereinstimmen,
    // sonst laedt der Preload ein anderes Bild als tatsaechlich gerendert wird.
    image: '/images/science/cassette-wear-diagram.jpg', // og:image — Social-Vorschauen bevorzugen JPEG
    preloadImage: '/images/science/cassette-wear-diagram.webp',
    h1: 'Ein messbarer Unterschied.',
    lead: 'Derselbe Antrieb, zwei Schmierstoffe, Seite an Seite gemessen.',
    points: [
      'Reibung entsteht an genau drei Flächen je Kettenglied: Bolzen gegen Laschenschulter, Rolle gegen Laschenschulter, Innenlasche gegen Außenlasche.',
      'Moderne 9 bis 12 fach Ketten sind buchsenlos, die Schulter der Innenlasche übernimmt die Funktion der früheren Buchse.',
      'Die Formel besteht aus sechs Komponenten, weil keine einzelne Substanz in allen drei Zonen stark ist.',
      'Originalaufnahmen unter dem Mikroskop, jede Gegenüberstellung bei identischer Vergrößerung.',
    ],
  },
];

function renderStatic(p) {
  const canonical = `${BASE}/${p.dir}`;
  const preloadSrc = p.preloadImage ?? p.image;
  const head = [
    metaTags({ title: p.title, description: p.description, canonical, image: p.image }),
    imagePreload(preloadSrc, mimeOf(preloadSrc)),
    // ldClientManaged (not ld): /wissenschaft supplies its own, more specific
    // TechArticle schema client-side (SciencePage.tsx) once React mounts, and
    // calls removeStaticJsonLd() to retire this one — same pattern as the
    // product/blog prerenders, so the live DOM never carries two schemas for
    // one URL. /kette-wachsen-lassen and /starter-set have no client-side
    // schema of their own, so ldClientManaged() has nothing to remove for
    // them either way — harmless, keeps this loop uniform.
    ldClientManaged({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: p.title,
      description: p.description,
      url: canonical,
      inLanguage: 'de-DE',
      publisher: { '@type': 'Organization', name: 'Waxcelerate', url: BASE },
    }),
  ].join('\n');
  const body = [
    `<h1>${esc(p.h1)}</h1>`,
    `<p>${esc(p.lead)}</p>`,
    `<ul>${p.points.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`,
    `<p><a href="/">Zur Startseite</a> · <a href="/wissenschaft">Wissenschaft</a> · <a href="/kette-wachsen-lassen">Kette wachsen lassen</a> · <a href="/starter-set">Starter-Set</a> · <a href="/blog">Blog</a></p>`,
  ].join('\n');
  return buildPage({ head, body });
}

// ─── Rechtstexte ─────────────────────────────────────────────────────────────
// Auch diese Seiten lieferten Crawlern bisher den Startseiten-Titel und das
// Startseiten-Canonical. Bei Pflichtseiten ist das doppelt unschoen: Sie muessen
// auffindbar sein, und ein falsches Canonical zeigt Google, dass es sie gar
// nicht als eigene Seiten gibt.
//
// Bewusst ohne Schema und ohne Inhaltsdopplung. Der eigentliche Rechtstext lebt
// in der React-Seite und ist dort rechtsverbindlich gepflegt; hier steht nur so
// viel, dass die Seite eindeutig identifizierbar ist. Doppelt gepflegte
// Rechtstexte waeren ein Haftungsrisiko, sobald die beiden Fassungen
// auseinanderlaufen.
const LEGAL_PAGES = [
  { dir: 'impressum', title: 'Impressum', description: 'Anbieterkennzeichnung nach § 5 TMG für Waxcelerate, Luca Teichmann, Stuttgart.' },
  // noindex: true — die React-Seite setzt per Helmet client-seitig noindex
  // (DatenschutzPage.tsx), aber die Huelle (index.html) traegt sitewide
  // robots "index, follow" und stripHead() entfernt robots-Meta nicht, also
  // stand die vorgerenderte Fassung bisher trotzdem auf "index, follow" —
  // fuer jeden Crawler, der kein JS ausfuehrt, war sie indexierbar.
  { dir: 'datenschutz', title: 'Datenschutzerklärung', description: 'Wie Waxcelerate personenbezogene Daten verarbeitet, welche Rechte du hast und an wen du dich wenden kannst.', noindex: true },
  { dir: 'agb', title: 'Allgemeine Geschäftsbedingungen', description: 'Vertragsbedingungen für Bestellungen bei Waxcelerate: Vertragsschluss, Preise, Lieferung und Zahlung.' },
  { dir: 'widerruf', title: 'Vertrag widerrufen', description: 'Formular und Ablauf, um eine Bestellung bei Waxcelerate innerhalb der Frist zu widerrufen.' },
  { dir: 'widerrufsbelehrung', title: 'Widerrufsbelehrung', description: 'Widerrufsrecht, Fristen und Folgen des Widerrufs für Bestellungen bei Waxcelerate.' },
  { dir: 'versand-und-zahlung', title: 'Versand und Zahlung', description: 'Versandkosten, Lieferzeiten und Zahlungsarten bei Waxcelerate. Versandkostenfrei ab 50 €.' },
];

function renderLegal(p) {
  const canonical = `${BASE}/${p.dir}`;
  const head = metaTags({
    title: `${p.title} | Waxcelerate`,
    description: p.description,
    canonical,
  });
  const body = [
    `<h1>${esc(p.title)}</h1>`,
    `<p>${esc(p.description)}</p>`,
    `<p><a href="/">Zur Startseite</a> · <a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a> · <a href="/agb">AGB</a> · <a href="/widerrufsbelehrung">Widerrufsbelehrung</a> · <a href="/versand-und-zahlung">Versand und Zahlung</a></p>`,
  ].join('\n');
  let html = buildPage({ head, body });
  if (p.noindex) html = html.replace(/<meta name="robots"[^>]*>/i, '<meta name="robots" content="noindex">');
  return html;
}

for (const p of STATIC_PAGES) write(p.dir, renderStatic(p));
for (const p of LEGAL_PAGES) write(p.dir, renderLegal(p));

write('blog', renderIndex());
for (const a of articles) write(join('blog', a.slug), renderArticle(a));

console.log(`✓ ${articles.length + 1} Blog-Seiten, ${STATIC_PAGES.length} feste Seiten und ${LEGAL_PAGES.length} Rechtstextseiten vorgerendert nach dist/`);
