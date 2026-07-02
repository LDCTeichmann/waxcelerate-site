import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/sections/navigation';
import {
  articles,
  categoryColors,
  categoryOrder,
  getArticleImage,
  blogHero,
} from './articles';
import type { Article, ArticleCategory } from './articles';

type Filter = 'Alle' | ArticleCategory;

function ArticleCard({ article }: { article: Article }) {
  const img = getArticleImage(article.slug);
  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
    >
      {/* overflow-hidden + rounded corners live here, not on the Link that also
          carries the hover transform — combining both on one element risks
          Chromium flashing the corner clip square right as hover promotes a
          new layer (same bug as the product cards; see products.tsx). */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl" style={{ background: 'var(--sf2)', transform: 'translateZ(0)' }}>
        <img
          src={img.src}
          alt={img.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }}
        />
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full backdrop-blur"
          style={{ background: 'rgba(0,0,0,0.55)', color: categoryColors[article.category] }}
        >
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h2 className="font-display text-[18px] font-semibold text-wx-tx1 leading-snug mb-2 group-hover:text-white transition-colors">
          {article.titleShort}
        </h2>
        <p className="text-[13px] leading-[1.6] text-wx-txm mb-4 line-clamp-2">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-wx-txf">
            von Luca · {article.readingTime}
          </span>
          <span
            className="text-[12px] font-medium transition-transform group-hover:translate-x-0.5"
            style={{ color: 'var(--accent)' }}
          >
            Lesen →
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  const img = getArticleImage(article.slug);
  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group grid md:grid-cols-2 rounded-2xl mb-12 transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
    >
      {/* overflow-hidden + rounding live here, not on the Link with the hover
          transform — see ArticleCard above for why. */}
      <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[340px] overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl" style={{ background: 'var(--sf2)', transform: 'translateZ(0)' }}>
        <img
          src={img.src}
          alt={img.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-7 sm:p-9 flex flex-col justify-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-wx-txf mb-3">
          Empfohlen · {article.category}
        </p>
        <h2 className="font-display text-2xl sm:text-[28px] font-bold text-wx-tx1 leading-[1.15] mb-3 group-hover:text-white transition-colors">
          {article.title}
        </h2>
        <p className="text-[14px] leading-[1.7] text-wx-txm mb-6">
          {article.description}
        </p>
        {article.stats && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {article.stats.map((s) => (
              <div key={s.label}>
                <div className="font-mono text-lg text-wx-tx1">{s.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-wx-txf">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
          Artikel lesen
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogIndexPage() {
  const [filter, setFilter] = useState<Filter>('Alle');

  const featured = articles.find((a) => a.featured);
  const usedCategories = categoryOrder.filter((c) =>
    articles.some((a) => a.category === c),
  );

  const showLead = filter === 'Alle' && featured;
  const grid =
    filter === 'Alle'
      ? articles.filter((a) => !a.featured)
      : articles.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate</title>
        <meta
          name="description"
          content="Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs – aus Stuttgart."
        />
        <link rel="canonical" href="https://waxcelerate.de/blog" />
      </Helmet>

      <Navigation />

      {/* Full-bleed hero masthead */}
      <section
        className="relative overflow-hidden border-b flex items-end min-h-[440px] sm:min-h-[520px]"
        style={{ borderColor: 'var(--bd)' }}
      >
        <img
          src={blogHero.src}
          alt={blogHero.alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 28%, rgba(0,0,0,0.62) 52%, rgba(0,0,0,0.40) 100%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto w-full px-4 sm:px-6 pb-12 pt-32">
          <p className="font-mono text-[12px] uppercase tracking-[0.28em] mb-4" style={{ color: '#E6E6EA' }}>
            Die Werkstatt
          </p>
          <h1
            className="font-display font-bold leading-[1.05] mb-5 max-w-2xl"
            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', textShadow: '0 2px 30px rgba(0,0,0,0.85)' }}
          >
            Wissen rund um Kette &amp; Wachs
          </h1>
          <p className="text-[16px] sm:text-[17px] leading-relaxed max-w-xl" style={{ color: '#D8D8DE', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
            Messwerte, Anleitungen und ehrliche Antworten — von jemandem, der jede
            Woche selbst am Wachstopf steht.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest mt-6" style={{ color: '#B4B4BE' }}>
            {articles.length} Artikel · Stuttgart
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(['Alle', ...usedCategories] as Filter[]).map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="text-[12px] px-3.5 py-1.5 rounded-full transition-colors"
                style={
                  active
                    ? { background: 'var(--accent)', color: 'var(--pg)', fontWeight: 500 }
                    : { border: '1px solid var(--bd)', color: 'var(--txm)' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured lead */}
        {showLead && featured && <FeaturedArticle article={featured} />}

        {/* Section label */}
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] text-wx-txf">
            {filter === 'Alle' ? 'Alle Artikel' : filter}
          </h2>
          <span className="font-mono text-[12px] text-wx-txff">{grid.length}</span>
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {grid.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {/* CTA banner */}
        <div
          className="rounded-2xl px-7 py-7 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
        >
          <div>
            <p className="font-display text-lg font-semibold text-wx-tx1 mb-1">
              Noch eine Frage offen?
            </p>
            <p className="text-[14px] text-wx-txm">
              Schreib mir direkt — ich antworte selbst.
            </p>
          </div>
          <Link
            to="/#kontakt"
            className="text-[14px] font-semibold px-5 py-2.5 rounded-full shrink-0 transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--pg)' }}
          >
            Zum Kontakt →
          </Link>
        </div>
      </main>
    </div>
  );
}
