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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { articles, getArticleImage, author, categoryOrder } from '../src/pages/blog/articles.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const BASE = 'https://waxcelerate.de';

const SHELL_PATH = join(DIST, 'index.html');
if (!existsSync(SHELL_PATH)) {
  console.error('✗ dist/index.html fehlt. Erst "vite build" laufen lassen.');
  process.exit(1);
}
const shell = readFileSync(SHELL_PATH, 'utf8');

// ─── Helpers ──────────────────────────────────────────────────────────────

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** JSON-LD-Typen aus index.html, die nur die Startseite beschreiben. */
const PAGE_SPECIFIC_SCHEMA = new Set(['Product', 'FAQPage', 'HowTo', 'ItemList']);

/** Entfernt die globalen Head-Tags aus der Hülle, die wir pro Seite ersetzen. */
function stripHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (full, json) => {
      // index.html trägt die JSON-LD-Blöcke der STARTSEITE. Als Hülle würden sie
      // sonst auf jeder Blog-URL mitlaufen, d. h. jeder Artikel behauptete, ein
      // Product mit AggregateRating/AggregateOffer zu sein und die 23 Startseiten-
      // FAQs zu beantworten. Das ist irreführendes Markup (Google-Spam-Policy) und
      // überschreibt die artikeleigenen FAQPage-/HowTo-Angaben.
      // Organization, WebSite und Person beschreiben die Site als Ganzes und bleiben.
      try {
        const type = JSON.parse(json)['@type'];
        return PAGE_SPECIFIC_SCHEMA.has(type) ? '' : full;
      } catch {
        return full;
      }
    });
}

/** Baut eine vollständige Seite aus Hülle + Head-Tags + Body-Inhalt. */
function buildPage({ head, body }) {
  let html = stripHead(shell);
  html = html.replace('</head>', `${head}\n</head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${body}</div>`,
  );
  return html;
}

function metaTags({ title, description, canonical, image, type = 'website', published, modified }) {
  const abs = image?.startsWith('http') ? image : `${BASE}${image ?? '/images/hero-chain-texture.jpg'}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="Waxcelerate">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${abs}">`,
    published ? `<meta property="article:published_time" content="${published}">` : '',
    modified ? `<meta property="article:modified_time" content="${modified}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${abs}">`,
  ].filter(Boolean).join('\n  ');
}

const ld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

// ─── Sections rendern ─────────────────────────────────────────────────────

function renderSection(s) {
  switch (s.type) {
    case 'h2': return `<h2>${esc(s.text)}</h2>`;
    case 'h3': return `<h3>${esc(s.text)}</h3>`;
    case 'p': return `<p>${esc(s.text)}</p>`;
    case 'ul': return `<ul>${(s.items ?? []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol>${(s.items ?? []).map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'tip': return `<aside><strong>Tipp:</strong> ${esc(s.text)}</aside>`;
    case 'note': return `<aside><strong>Hinweis:</strong> ${esc(s.text)}</aside>`;
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
    ld({
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
      publisher: {
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
    ld({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: a.titleShort, item: url },
      ],
    }),
    a.howTo && ld({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: a.howTo.name,
      description: a.description,
      totalTime: a.howTo.totalTime,
      step: a.howTo.steps.map((s, i) => ({
        '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text,
      })),
    }),
    a.faq && ld({
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
    <p>von ${esc(author.name)} · ${esc(a.readingTime)} · <time datetime="${a.publishDate}">${a.publishDate}</time></p>
    <img src="${img.src}" alt="${esc(img.alt)}" width="1600" height="900">
  </header>
  <p>${esc(a.intro)}</p>
  ${a.takeaways ? `<section><h2>Das Wichtigste in Kürze</h2><ul>${a.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
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

// ─── Schreiben ────────────────────────────────────────────────────────────

function write(relDir, html) {
  const dir = join(DIST, relDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

write('blog', renderIndex());
for (const a of articles) write(join('blog', a.slug), renderArticle(a));

console.log(`✓ ${articles.length + 1} Blog-Seiten vorgerendert nach dist/blog/`);
