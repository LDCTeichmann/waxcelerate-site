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
          src={img.card}
          alt={img.alt}
          loading="lazy"
          width={800}
          height={500}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(var(--scrim-rgb),0) 55%, rgba(var(--scrim-rgb),0.45) 100%)' }}
        />
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full backdrop-blur"
          style={{ background: 'var(--chip-bg)', color: categoryColors[article.category] }}
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
        <div className="flex items-center justify-between mb-3">
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
        {article.keyStat && (
          <div className="flex items-baseline gap-1.5 pt-3" style={{ borderTop: '1px solid var(--bd)' }}>
            <span className="font-mono text-[13px] font-semibold text-wx-tx1">
              {article.keyStat.value}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-wx-txf">
              {article.keyStat.label}
            </span>
          </div>
        )}
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
          width={1600}
          height={1100}
          fetchPriority="high"
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

const INTENTS: { label: string; slug: string }[] = [
  { label: 'Ich will anfangen', slug: 'von-oel-auf-wachs-umsteigen' },
  { label: 'Es klappt nicht', slug: 'wachs-haelt-nicht-haeufige-fehler' },
  { label: 'Ich will es genau wissen', slug: 'kettenlaufzeit-heisswachs' },
  { label: 'Ich will kaufen', slug: 'vorgewachste-kette' },
];

export function BlogIndexPage() {
  const [filter, setFilter] = useState<Filter>('Alle');
  const [query, setQuery] = useState('');

  const featured = articles.find((a) => a.featured);
  const usedCategories = categoryOrder.filter((c) =>
    articles.some((a) => a.category === c),
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const matchesQuery = (a: Article) =>
    !isSearching ||
    a.title.toLowerCase().includes(normalizedQuery) ||
    a.description.toLowerCase().includes(normalizedQuery) ||
    (a.takeaways ?? []).some((t) => t.toLowerCase().includes(normalizedQuery));

  const showLead = filter === 'Alle' && !isSearching && featured;
  const grid = (
    filter === 'Alle'
      ? articles.filter((a) => !a.featured || isSearching)
      : articles.filter((a) => a.category === filter)
  ).filter(matchesQuery);

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate</title>
        <meta
          name="description"
          content="Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs – aus Stuttgart."
        />
        <link rel="canonical" href="https://waxcelerate.de/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content="Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate" />
        <meta
          property="og:description"
          content="Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs – aus Stuttgart."
        />
        <meta property="og:url" content="https://waxcelerate.de/blog" />
        <meta property="og:image" content="https://waxcelerate.de/images/blog/ride-road-golden.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate" />
        <meta
          name="twitter:description"
          content="Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs – aus Stuttgart."
        />
        <meta name="twitter:image" content="https://waxcelerate.de/images/blog/ride-road-golden.jpg" />
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
              'linear-gradient(0deg, rgba(var(--scrim-rgb),0.97) 0%, rgba(var(--scrim-rgb),0.88) 28%, rgba(var(--scrim-rgb),0.62) 52%, rgba(var(--scrim-rgb),0.40) 100%)',
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
            Messwerte, Anleitungen und ehrliche Antworten, von jemandem, der jede
            Woche selbst am Wachstopf steht.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest mt-6" style={{ color: '#B4B4BE' }}>
            {articles.length} Artikel · Stuttgart
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Suche */}
        <div className="relative mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Artikel durchsuchen, z. B. „Winter" oder „Watt"'
            className="w-full text-[14px] px-4 py-2.5 rounded-full outline-none"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
          />
        </div>

        {/* Einstieg nach Absicht. Bewusst anders gestaltet als die Kategorie-Pills
            darunter: das hier sind Sprungziele in einen Artikel, keine Filter.
            Gleiche Optik für zwei verschiedene Verhalten wäre eine Falle. */}
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-wx-txf mb-2.5">
            Schnelleinstieg
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {INTENTS.map((intent) => (
              <Link
                key={intent.slug}
                to={`/blog/${intent.slug}`}
                className="group text-[13px] inline-flex items-center gap-1.5 transition-colors hover:text-wx-tx1"
                style={{ color: 'var(--txm)' }}
              >
                <span style={{ color: 'var(--accent)' }}>→</span>
                <span className="border-b border-transparent group-hover:border-current">
                  {intent.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Kategorie-Filter (filtert das Raster, verlässt die Seite nicht) */}
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

        {/* Der Vergleichsblock. Beide Bilder stammen aus Lucas Alltag, keine
            Stockfotografie: links das Bein nach einer Fahrt mit geölter Kette,
            rechts eine frisch gewachste Kette im Makro. Das ist die These des
            gesamten Blogs in einem Blick, und es ist das einzige Element auf der
            Seite, das ohne einen einzigen Satz Marketing auskommt. */}
        {showLead && (
          <section className="mb-12">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
              <figure className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden" style={{ background: 'var(--sf2)' }}>
                <img
                  src="/images/blog/oil-tattoo-leg-800.webp"
                  alt="Schwarze Ölspuren an Wade und weißer Socke nach einer Fahrt mit geölter Kette"
                  loading="lazy"
                  width={800}
                  height={500}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <figcaption
                  className="absolute bottom-0 left-0 right-0 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))', color: '#F2F2F5' }}
                >
                  Geölt · 80 km
                </figcaption>
              </figure>
              <figure className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden" style={{ background: 'var(--sf2)' }}>
                <img
                  src="/images/blog/chain-waxed-macro-800.webp"
                  alt="Frisch gewachste Fahrradkette in Nahaufnahme auf dunklem Schiefer"
                  loading="lazy"
                  width={800}
                  height={500}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <figcaption
                  className="absolute bottom-0 left-0 right-0 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))', color: '#F2F2F5' }}
                >
                  Gewachst · 400 km
                </figcaption>
              </figure>
            </div>
            <p className="text-[14px] leading-[1.7] text-wx-txm mt-4 max-w-2xl">
              Der Unterschied ist kein Marketingversprechen, sondern das, was nach der Fahrt an
              Wade und Socke hängen bleibt. Alles Weitere auf dieser Seite erklärt nur, warum
              das so ist und wie du dahin kommst.
            </p>
          </section>
        )}

        {/* Featured lead */}
        {showLead && featured && <FeaturedArticle article={featured} />}

        {/* Section label */}
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] text-wx-txf">
            {isSearching
              ? 'Suchergebnisse'
              : filter === 'Alle'
                ? (showLead ? 'Weitere Artikel' : 'Alle Artikel')
                : filter}
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
          className="relative overflow-hidden rounded-2xl px-7 py-9 flex items-center justify-between gap-4 flex-wrap"
          style={{ border: '1px solid var(--bd)' }}
        >
          <img
            src="/images/blog/ride-road-golden-800.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.35) 100%)' }}
          />
          <div className="relative">
            <p className="font-display text-lg font-semibold mb-1" style={{ color: '#FFFFFF' }}>
              Noch eine Frage offen?
            </p>
            <p className="text-[14px]" style={{ color: '#D8D8DE' }}>
              Schreib mir direkt, ich antworte selbst.
            </p>
          </div>
          <Link
            to="/#kontakt"
            className="relative text-[14px] font-semibold px-5 py-2.5 rounded-full shrink-0 transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--pg)' }}
          >
            Zum Kontakt →
          </Link>
        </div>
      </main>
    </div>
  );
}
