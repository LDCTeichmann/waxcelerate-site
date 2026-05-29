import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from './articles';

export function BlogIndexPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>Heißwachs Tipps &amp; Anleitungen | Waxcelerate Blog</title>
        <meta
          name="description"
          content="Ratgeber rund um Kettenpflege, Heißwachs und Fahrradketten aus Stuttgart."
        />
        <link rel="canonical" href="https://waxcelerate.de/blog" />
      </Helmet>

      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: 'var(--bd)', background: 'var(--pg)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg tracking-tight text-wx-tx1">
            WAX<span style={{ color: '#1A3C6E' }}>CELERATE</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-wx-txm hover:text-wx-tx1 transition-colors flex items-center gap-1"
          >
            ← Startseite
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-wx-tx1 mb-2">
            Anleitungen &amp; Ratgeber
          </h1>
          <p className="text-[15px] text-wx-txm">
            Alles rund um Kettenpflege und Heißwachs
          </p>
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group block rounded-xl p-5 transition-colors"
              style={{
                background: 'var(--sf)',
                border: '1px solid var(--bd)',
              }}
            >
              {/* Category */}
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#1A3C6E' }}
              >
                Kettenpflege
              </p>

              {/* Title */}
              <h2 className="text-[15px] font-semibold text-wx-tx1 leading-snug mb-2 group-hover:text-white transition-colors">
                {article.titleShort}
              </h2>

              {/* Description */}
              <p className="text-[13px] leading-[1.6] text-wx-txm mb-4">
                {article.description.length > 100
                  ? article.description.slice(0, 100) + '…'
                  : article.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-wx-txf">
                  {article.readingTime} Lesezeit
                </span>
                <span
                  className="text-[12px] font-medium group-hover:underline"
                  style={{ color: '#264E8C' }}
                >
                  Lesen →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA banner */}
        <div
          className="rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
        >
          <p className="text-[15px] text-wx-txm">
            Fragen? Schreib mir direkt.
          </p>
          <Link
            to="/#kontakt"
            className="text-[14px] font-semibold hover:underline shrink-0"
            style={{ color: '#264E8C' }}
          >
            Zum Kontakt →
          </Link>
        </div>
      </main>
    </div>
  );
}
