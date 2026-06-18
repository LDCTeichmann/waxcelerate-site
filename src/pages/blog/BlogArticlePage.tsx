import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  getArticleBySlug,
  getArticleImage,
  articles,
  categoryColors,
  author,
} from './articles';
import type { ArticleSection } from './articles';

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
          {section.text}
        </p>
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
              <span>{item}</span>
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
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div
          key={idx}
          className="rounded-xl px-5 py-4 mb-6 mt-2"
          style={{ background: 'rgba(var(--accent-rgb),0.08)', borderLeft: '3px solid var(--accent)' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--accent)' }}>
            Tipp
          </p>
          <p className="text-[15px] leading-[1.7] text-wx-tx2">{section.text}</p>
        </div>
      );
    case 'note':
      return (
        <div
          key={idx}
          className="rounded-xl px-5 py-4 mb-6 mt-2"
          style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5 text-wx-txf">
            Hinweis
          </p>
          <p className="text-[15px] leading-[1.7] text-wx-tx2">{section.text}</p>
        </div>
      );
    default:
      return null;
  }
}

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px]" style={{ background: 'transparent' }}>
      <div className="h-full transition-[width] duration-150" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
    </div>
  );
}

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
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

  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: { '@type': 'Person', name: 'Luca Teichmann' },
    publisher: { '@type': 'Organization', name: 'Waxcelerate', url: 'https://waxcelerate.de' },
    datePublished: article.publishDate,
    image: `https://waxcelerate.de${hero.src}`,
    url: `https://waxcelerate.de/blog/${article.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://waxcelerate.de/blog/${article.slug}` },
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
        <script type="application/ld+json">{articleSchema}</script>
        {howToSchema && <script type="application/ld+json">{howToSchema}</script>}
        {faqSchema && <script type="application/ld+json">{faqSchema}</script>}
      </Helmet>

      <ReadingProgress />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b" style={{ borderColor: 'var(--bd)', background: 'var(--pg)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg tracking-tight text-wx-tx1">
            WAX<span style={{ color: 'var(--accent)' }}>CELERATE</span>
          </Link>
          <Link to="/blog" className="text-sm text-wx-txm hover:text-wx-tx1 transition-colors flex items-center gap-1">
            ← Alle Artikel
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--bd)' }}>
        <img src={hero.src} alt={hero.alt} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.88) 100%)' }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-10 sm:pt-36 sm:pb-12">
          <p
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
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
          <div className="flex items-center gap-3 font-mono text-[12px]" style={{ color: '#C9C9D2' }}>
            <span>von {author.name}</span>
            <span style={{ color: '#7A7A86' }}>·</span>
            <span>{article.readingTime}</span>
            <span style={{ color: '#7A7A86' }}>·</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <main className="max-w-[680px] mx-auto px-4 sm:px-6 py-12">
        <article>
          {/* Intro lead with drop cap */}
          <p className="text-[19px] leading-[1.75] text-wx-tx1 mb-8 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-bold first-letter:float-left first-letter:leading-[0.82] first-letter:mr-3 first-letter:mt-1">
            {article.intro}
          </p>

          {/* Das Wichtigste in Kürze */}
          {article.takeaways && (
            <div className="rounded-2xl p-6 mb-10" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-wx-txf mb-4">
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

          {/* Sections */}
          {article.sections.map((section, idx) => renderSection(section, idx))}

          {/* CTA */}
          <div
            className="mt-14 rounded-2xl overflow-hidden flex items-center gap-5 p-6"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          >
            <div className="flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-wx-txf mb-1.5">
                Bereit anzufangen?
              </p>
              <Link
                to={`/produkt/${article.ctaSlug}`}
                className="font-display text-[18px] font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {article.ctaText}
              </Link>
            </div>
          </div>

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
              <p className="font-mono text-[11px] uppercase tracking-wider text-wx-txf mb-2">{author.role}</p>
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
                      className="group block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden" style={{ background: 'var(--sf2)' }}>
                        <img
                          src={rImg.src}
                          alt={rImg.alt}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p
                          className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] mb-1.5"
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
    </div>
  );
}
