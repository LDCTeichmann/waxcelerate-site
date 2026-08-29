import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { products } from '@/lib/data';
import { removeStaticJsonLd } from '@/lib/utils';
import {
  getArticleBySlug,
  getArticleImage,
  articles,
  categoryColors,
  author,
} from './articles';
import type { ArticleSection } from './articles';

// Minimal inline-link syntax for body text: [[Link-Text|/ziel-pfad]]. Kept as
// a marker syntax rather than a new section field so it can sit inline
// mid-sentence in 'p'/list items/'tip'/'note' without restructuring how
// those are authored. Internal paths only — this renders react-router
// <Link>s, not <a href>, so an external URL would silently become a broken
// client-side route. Mirrored server-side in scripts/generate-blog-html.mjs
// for the prerendered/crawler-facing HTML (which must emit real <a> tags,
// not leave the literal [[...]] markers in escaped text).
const INLINE_LINK = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;

function renderInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  INLINE_LINK.lastIndex = 0;
  while ((match = INLINE_LINK.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Link
        key={key++}
        to={match[2]}
        className="underline underline-offset-2 hover:opacity-80"
        style={{ color: 'var(--accent)' }}
      >
        {match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderSection(section: ArticleSection, idx: number): React.ReactNode {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={idx} className="font-display text-[24px] font-bold text-wx-tx1 leading-tight mt-12 mb-4">
          {section.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={idx} className="font-display text-[18px] font-semibold text-wx-tx1 mt-8 mb-2">
          {section.text}
        </h3>
      );
    case 'p':
      return (
        <p key={idx} className="text-[17px] leading-[1.85] text-wx-tx2 mb-5">
          {renderInlineText(section.text ?? '')}
        </p>
      );
    case 'image':
      return (
        <figure key={idx} className="mb-6 mt-2">
          <img
            src={section.src}
            alt={section.alt ?? ''}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
            style={{ border: '1px solid var(--bd)' }}
          />
          {section.caption && (
            <figcaption className="text-[13px] mt-2 text-wx-txf">{section.caption}</figcaption>
          )}
        </figure>
      );
    case 'ul':
      return (
        <ul key={idx} className="space-y-2.5 mb-6 mt-1">
          {section.items?.map((item, i) => (
            <li key={i} className="text-[16px] leading-[1.7] text-wx-tx2 flex gap-3">
              <span
                className="select-none mt-[9px] shrink-0 h-[5px] w-[5px] rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              <span>{renderInlineText(item)}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className="space-y-3 mb-6 mt-1">
          {section.items?.map((item, i) => (
            <li key={i} className="text-[16px] leading-[1.7] text-wx-tx2 flex gap-3.5">
              <span
                className="font-mono text-[13px] shrink-0 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--sf2)', color: 'var(--accent)', border: '1px solid var(--bd)' }}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{renderInlineText(item)}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div
          key={idx}
          className="rounded-xl px-5 py-4 mb-6 mt-2"
          style={{ background: 'var(--accent-wash)', borderLeft: '3px solid var(--accent)' }}
        >
          <p className="font-mono text-small uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--accent)' }}>
            Tipp
          </p>
          <p className="text-[15px] leading-[1.7] text-wx-tx2">{renderInlineText(section.text ?? '')}</p>
        </div>
      );
    case 'note':
      return (
        <div
          key={idx}
          className="rounded-xl px-5 py-4 mb-6 mt-2"
          style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
        >
          <p className="font-mono text-small uppercase tracking-[0.18em] mb-1.5 text-wx-txf">
            Hinweis
          </p>
          <p className="text-[15px] leading-[1.7] text-wx-tx2">{renderInlineText(section.text ?? '')}</p>
        </div>
      );
    default:
      return null;
  }
}

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Prerendered HTML for this route already ships this same schema; without
  // this, Helmet's copy below just piles on top of it (see removeStaticJsonLd
  // in src/lib/utils.ts).
  useEffect(() => {
    removeStaticJsonLd();
  }, [slug]);

  if (!article) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--pg)' }}
      >
        <p className="text-wx-txm">Artikel nicht gefunden.</p>
        <Link to="/blog" className="text-sm flex items-center gap-1 hover:underline" style={{ color: 'var(--accent)' }}>
          ← Zurück zum Blog
        </Link>
      </div>
    );
  }

  const hero = getArticleImage(article.slug);
  const ctaProduct = products.find((p) => p.id === article.ctaSlug);
  const dateModified = article.dateModified ?? article.publishDate;
  const articleUrl = `https://waxcelerate.de/blog/${article.slug}`;

  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    articleSection: article.category,
    inLanguage: 'de-DE',
    author: { '@type': 'Person', name: 'Luca Teichmann', url: 'https://waxcelerate.de/#ueber-mich' },
    // @id verweist auf den Organization-Knoten aus index.html, damit alle Artikel
    // auf dieselbe Marken-Entität einzahlen statt auf 18 gleichnamige Einzelknoten.
    publisher: {
      '@id': 'https://waxcelerate.de/#organization',
      '@type': 'Organization',
      name: 'Waxcelerate',
      url: 'https://waxcelerate.de',
      logo: { '@type': 'ImageObject', url: 'https://waxcelerate.de/images/logo.jpg' },
    },
    datePublished: article.publishDate,
    dateModified,
    image: `https://waxcelerate.de${hero.src}`,
    url: articleUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  });

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://waxcelerate.de' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://waxcelerate.de/blog' },
      { '@type': 'ListItem', position: 3, name: article.titleShort, item: articleUrl },
    ],
  });

  const howToSchema = article.howTo
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: article.howTo.name,
        description: article.description,
        totalTime: article.howTo.totalTime,
        step: article.howTo.steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      })
    : null;

  const faqSchema = article.faq
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      })
    : null;

  const sameCategory = articles.filter(
    (a) => a.slug !== article.slug && a.category === article.category,
  );
  const otherArticles = articles.filter(
    (a) => a.slug !== article.slug && a.category !== article.category,
  );
  const related = [...sameCategory, ...otherArticles].slice(0, 3);

  const dateStr = new Date(article.publishDate).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>{article.title} | Waxcelerate</title>
        <meta name="description" content={article.description} />
        <link rel="canonical" href={`https://waxcelerate.de/blog/${article.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:url" content={`https://waxcelerate.de/blog/${article.slug}`} />
        <meta property="og:image" content={`https://waxcelerate.de${hero.src}`} />
        <meta property="article:published_time" content={article.publishDate} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={`https://waxcelerate.de${hero.src}`} />
        <script type="application/ld+json">{articleSchema}</script>
        <script type="application/ld+json">{breadcrumbSchema}</script>
        {howToSchema && <script type="application/ld+json">{howToSchema}</script>}
        {faqSchema && <script type="application/ld+json">{faqSchema}</script>}
      </Helmet>

      <Navigation />

      {/* Back-to-index link — kept here since it's article-specific context,
          distinct from the shared site nav above it. */}
      <div className="border-b pt-20 lg:pt-24" style={{ borderColor: 'var(--bd)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <Link to="/blog" className="text-sm text-wx-txm hover:text-wx-tx1 transition-colors inline-flex items-center gap-1">
            ← Alle Artikel
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--bd)' }}>
        <img src={hero.src} alt={hero.alt} fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(var(--scrim-rgb),0.45) 0%, rgba(var(--scrim-rgb),0.30) 35%, rgba(var(--scrim-rgb),0.88) 100%)' }}
        />
        <div className="relative max-w-[740px] mx-auto px-4 sm:px-6 pt-28 pb-10 sm:pt-36 sm:pb-12">
          <p
            className="font-mono text-small font-semibold uppercase tracking-[0.2em] mb-4"
            style={{ color: categoryColors[article.category] }}
          >
            {article.category}
          </p>
          <h1
            className="font-display font-bold leading-[1.1] mb-5"
            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', fontSize: 'clamp(1.9rem, 4.2vw, 2.9rem)', textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
          >
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px]" style={{ color: '#C9C9D2' }}>
            <span>von {author.name}</span>
            <span style={{ color: '#7A7A86' }}>·</span>
            <span>{article.readingTime}</span>
            <span style={{ color: '#7A7A86' }}>·</span>
            <span>{dateStr}</span>
            {article.dateModified && article.dateModified !== article.publishDate && (
              <>
                <span style={{ color: '#7A7A86' }}>·</span>
                <span>
                  Zuletzt geprüft am{' '}
                  {new Date(article.dateModified).toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Article body */}
      <main className="max-w-[740px] mx-auto px-4 sm:px-6 py-12">
        <article>
          {/* Intro lead with drop cap */}
          <p className="text-[19px] leading-[1.75] text-wx-tx1 mb-8 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-bold first-letter:float-left first-letter:leading-[0.82] first-letter:mr-3 first-letter:mt-1">
            {article.intro}
          </p>

          {/* Kennzahl-Leiste: dieselbe Mono-Behandlung wie auf den Karten und im
              Leitartikel. Sie zieht die belastbare Zahl des Artikels nach oben,
              wo sie sowohl ein Leser als auch ein extrahierender Crawler zuerst
              sieht, statt sie in Absatz sieben zu vergraben. */}
          {article.keyStat && (
            <div
              className="flex items-baseline gap-3 mb-10 pb-5"
              style={{ borderBottom: '1px solid var(--bd)' }}
            >
              <span className="font-mono text-[26px] leading-none text-wx-tx1">
                {article.keyStat.value}
              </span>
              <span className="font-mono text-small uppercase tracking-[0.18em] text-wx-txf">
                {article.keyStat.label}
              </span>
            </div>
          )}

          {/* Das Wichtigste in Kürze */}
          {article.takeaways && (
            <div className="rounded-2xl p-6 mb-10" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
              <p className="font-mono text-small font-semibold uppercase tracking-[0.18em] text-wx-txf mb-4">
                Das Wichtigste in Kürze
              </p>
              <ul className="space-y-3">
                {article.takeaways.map((t, i) => (
                  <li key={i} className="text-[15px] leading-[1.6] text-wx-tx2 flex gap-3">
                    <span className="font-mono text-[12px] shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rechner-Verweis — nur bei Artikeln, bei denen das eigene Intervall
              inhaltlich relevant ist (article.linksToCalculator, articles.ts).
              Eigene Farbgebung (voller Akzent-Hintergrund) statt tip/note-Optik,
              damit er als Link zu einem anderen Tool erkennbar bleibt und nicht
              mit einem Inhalts-Tipp verwechselt wird. */}
          {article.linksToCalculator && (
            <a
              href="/#tools"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-6 py-4 mb-10 transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--pg)' }}
            >
              <span className="font-semibold text-[15px]">Willst du dein eigenes Intervall wissen?</span>
              <span className="font-mono text-[13px] font-semibold whitespace-nowrap">Rechner öffnen →</span>
            </a>
          )}

          {/* Wissenschaftsseite: nur bei Artikeln mit echter fachlicher
              Entsprechung dort (siehe scienceLink auf dem jeweiligen Artikel),
              kein pauschaler Link auf jedem Artikel. */}
          {article.scienceLink && (
            <div className="flex items-baseline gap-3 mb-10 pb-5" style={{ borderBottom: '1px solid var(--bd)' }}>
              <span className="font-mono text-small uppercase tracking-[0.18em] shrink-0" style={{ color: 'var(--accent)' }}>
                Wissenschaft
              </span>
              <Link
                to={`/wissenschaft${article.scienceLink.anchor ? `#${article.scienceLink.anchor}` : ''}`}
                className="text-[14px] leading-[1.5] hover:underline"
                style={{ color: 'var(--tx2)' }}
              >
                {article.scienceLink.label} →
              </Link>
            </div>
          )}

          {/* Sections */}
          {article.sections.map((section, idx) => renderSection(section, idx))}

          {/* Produktkarte statt bloßem Textlink: wer bis hierhin gelesen hat, ist
              die interessierteste Person auf der Seite. Bild, Preis und ein Satz
              zum Bezug auf genau diesen Artikel, statt ihn zurück auf die
              Startseite zu schicken und selbst suchen zu lassen. */}
          {ctaProduct && (
            <div
              className="mt-14 rounded-2xl overflow-hidden grid sm:grid-cols-[190px_1fr]"
              style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
            >
              <Link
                to={`/produkt/${ctaProduct.id}`}
                className="relative block aspect-[4/3] sm:aspect-auto sm:min-h-[190px] overflow-hidden"
                style={{ background: 'var(--sf2)' }}
              >
                <img
                  src={ctaProduct.image}
                  alt={ctaProduct.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: ctaProduct.imagePosition ?? 'center' }}
                />
              </Link>
              <div className="p-6 flex flex-col justify-center">
                <p className="font-mono text-small font-semibold uppercase tracking-[0.18em] text-wx-txf mb-2">
                  Passend zu diesem Artikel
                </p>
                <Link
                  to={`/produkt/${ctaProduct.id}`}
                  className="font-display text-[19px] font-semibold text-wx-tx1 leading-snug hover:underline"
                >
                  {ctaProduct.title}
                </Link>
                <p className="text-[13px] leading-[1.6] text-wx-txm mt-2 mb-4 line-clamp-2">
                  {ctaProduct.description}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    to={`/produkt/${ctaProduct.id}`}
                    className="text-[14px] font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)', color: 'var(--pg)' }}
                  >
                    {ctaProduct.price.toFixed(2).replace('.', ',')} € · Ansehen
                  </Link>
                  <Link to="/blog" className="text-[13px] text-wx-txm hover:text-wx-tx1 transition-colors">
                    oder weiterlesen
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Author box */}
          <div
            className="mt-8 rounded-2xl p-6 flex gap-5 items-start"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
          >
            <img
              src={author.avatar}
              alt={author.name}
              className="w-14 h-14 rounded-full object-cover shrink-0"
              style={{ border: '1px solid var(--bd)' }}
            />
            <div>
              <p className="font-display text-[16px] font-semibold text-wx-tx1">{author.name}</p>
              <p className="font-mono text-meta uppercase tracking-wider text-wx-txf mb-2">{author.role}</p>
              <p className="text-[14px] leading-[1.65] text-wx-txm">{author.bio}</p>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-14 pt-10" style={{ borderTop: '1px solid var(--bd)' }}>
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-wx-txf mb-5">
                Weiterlesen
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => {
                  const rImg = getArticleImage(r.slug);
                  return (
                    <Link
                      key={r.slug}
                      to={`/blog/${r.slug}`}
                      className="group block rounded-xl transition-all duration-300 hover:-translate-y-1"
                      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
                    >
                      {/* overflow-hidden + rounding live here, not on the Link with the
                          hover transform — see BlogIndexPage's ArticleCard for why. */}
                      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl" style={{ background: 'var(--sf2)', transform: 'translateZ(0)' }}>
                        <img
                          src={rImg.card}
                          alt={rImg.alt}
                          loading="lazy"
                          width={800}
                          height={500}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p
                          className="font-mono text-small font-semibold uppercase tracking-[0.16em] mb-1.5"
                          style={{ color: categoryColors[r.category] }}
                        >
                          {r.category}
                        </p>
                        <p className="font-display text-[14px] font-semibold text-wx-tx1 leading-snug group-hover:text-white transition-colors">
                          {r.titleShort}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
