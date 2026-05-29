import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArticleBySlug } from './articles';
import type { ArticleSection } from './articles';

function renderSection(section: ArticleSection, idx: number): React.ReactNode {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={idx} className="text-xl font-bold text-wx-tx1 mt-10 mb-4">
          {section.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={idx} className="text-base font-semibold text-wx-tx1 mt-6 mb-2">
          {section.text}
        </h3>
      );
    case 'p':
      return (
        <p key={idx} className="text-[15px] leading-[1.8] text-wx-txm mb-4">
          {section.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={idx} className="space-y-1.5 mb-4 pl-4">
          {section.items?.map((item, i) => (
            <li
              key={i}
              className="text-[15px] leading-[1.8] text-wx-txm flex gap-2"
            >
              <span className="text-wx-tx2 select-none mt-0.5 shrink-0">–</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className="space-y-1.5 mb-4 pl-4 list-decimal list-outside">
          {section.items?.map((item, i) => (
            <li key={i} className="text-[15px] leading-[1.8] text-wx-txm ml-4">
              {item}
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div
          key={idx}
          className="rounded-lg px-4 py-3 mb-4 text-[14px] leading-[1.75] text-wx-txm"
          style={{
            background: 'rgba(26,60,110,0.08)',
            borderLeft: '3px solid #1A3C6E',
          }}
        >
          <span className="font-semibold" style={{ color: '#264E8C' }}>
            💡 Tipp:{' '}
          </span>
          {section.text}
        </div>
      );
    case 'note':
      return (
        <div
          key={idx}
          className="rounded-lg px-4 py-3 mb-4 text-[14px] leading-[1.75] text-wx-txm"
          style={{
            background: 'var(--sf2)',
            border: '1px solid var(--bd)',
          }}
        >
          <span className="font-semibold text-wx-tx2">Hinweis: </span>
          {section.text}
        </div>
      );
    default:
      return null;
  }
}

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--pg)' }}
      >
        <p className="text-wx-txm">Artikel nicht gefunden.</p>
        <Link
          to="/blog"
          className="text-sm flex items-center gap-1 hover:underline"
          style={{ color: '#264E8C' }}
        >
          ← Zurück zum Blog
        </Link>
      </div>
    );
  }

  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: 'Luca Teichmann',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Waxcelerate',
      url: 'https://waxcelerate.de',
    },
    datePublished: article.publishDate,
    image: 'https://waxcelerate.de/images/wax-hero.jpg',
    url: `https://waxcelerate.de/blog/${article.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://waxcelerate.de/blog/${article.slug}`,
    },
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>{article.title} | Waxcelerate</title>
        <meta name="description" content={article.description} />
        <link
          rel="canonical"
          href={`https://waxcelerate.de/blog/${article.slug}`}
        />
        <script type="application/ld+json">{articleSchema}</script>
      </Helmet>

      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: 'var(--bd)', background: 'var(--pg)' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg tracking-tight text-wx-tx1">
            WAX<span style={{ color: '#1A3C6E' }}>CELERATE</span>
          </Link>
          <Link
            to="/blog"
            className="text-sm text-wx-txm hover:text-wx-tx1 transition-colors flex items-center gap-1"
          >
            ← Alle Artikel
          </Link>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <article>
          {/* Category label */}
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#1A3C6E' }}
          >
            Kettenpflege
          </p>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-wx-tx1 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <p className="text-[13px] text-wx-txf mb-8">
            {article.readingTime} Lesezeit &nbsp;·&nbsp;{' '}
            {new Date(article.publishDate).toLocaleDateString('de-DE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          {/* Intro */}
          <p
            className="text-[16px] leading-[1.8] text-wx-tx2 mb-8 pb-8"
            style={{ borderBottom: '1px solid var(--bd)' }}
          >
            {article.intro}
          </p>

          {/* Sections */}
          {article.sections.map((section, idx) => renderSection(section, idx))}

          {/* CTA */}
          <div
            className="mt-12 rounded-xl p-6"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          >
            <p className="text-[13px] font-semibold uppercase tracking-widest text-wx-txf mb-1">
              Bereit anzufangen?
            </p>
            <Link
              to={`/produkt/${article.ctaSlug}`}
              className="text-[15px] font-semibold hover:underline"
              style={{ color: '#264E8C' }}
            >
              {article.ctaText}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
