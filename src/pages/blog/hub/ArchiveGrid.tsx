import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { articles, categoryColors, categoryOrder, getArticleImage } from '../articles';
import type { Article, ArticleCategory } from '../articles';
import { categoryBlurb } from '../hubContent';

export type Filter = 'Alle' | ArticleCategory;

/**
 * Rhythmus statt Raster: in jeder zweiten Dreierreihe nimmt eine Karte zwei
 * Spalten ein, abwechselnd links und rechts. 18 gleich grosse Kacheln lesen
 * sich wie ein Dateimanager; mit wechselnder Groesse wie ein Magazin, und das
 * Auge hat Stellen zum Anhalten. Muster auf zehn Karten: breit an 0 und 6.
 */
const isWide = (i: number) => i % 10 === 0 || i % 10 === 6;

function ArchiveCard({ article, wide, read }: { article: Article; wide: boolean; read: boolean }) {
  const img = getArticleImage(article.slug);
  return (
    <Link
      to={`/blog/${article.slug}`}
      // Mobil eine kompakte Zeile (Vorschaubild links, Titel rechts): 18
      // Bildkarten untereinander waren bei 375 px ueber 8.500 px lang.
      className={`group flex flex-row sm:flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
        wide ? 'sm:col-span-2 lg:grid lg:grid-cols-[1.15fr_1fr]' : ''
      }`}
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
    >
      {/* overflow-hidden + Ecken hier und nicht auf dem Link mit der
          Hover-Verschiebung: beides auf einem Element laesst Chromium beim
          Hover kurz die eckige Maske aufblitzen (siehe products.tsx). */}
      <div
        className={`relative overflow-hidden w-24 min-h-[96px] shrink-0 rounded-l-2xl sm:w-auto sm:min-h-0 sm:rounded-l-none ${
          wide ? 'sm:aspect-[16/9] sm:rounded-t-2xl lg:aspect-auto lg:min-h-[280px] lg:rounded-tr-none lg:rounded-l-2xl' : 'sm:aspect-[16/10] sm:rounded-t-2xl'
        }`}
        style={{ background: 'var(--sf2)', transform: 'translateZ(0)' }}
      >
        <img
          src={wide ? img.src : img.card}
          alt={img.alt}
          loading="lazy"
          width={wide ? 1600 : 800}
          height={wide ? 1000 : 500}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
        />
        <span
          className="hidden sm:block absolute top-3 left-3 text-small font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full backdrop-blur"
          style={{ background: 'var(--chip-bg)', color: categoryColors[article.category] }}
        >
          {article.category}
        </span>
      </div>
      <div className={`flex flex-col flex-1 min-w-0 ${wide ? 'p-4 sm:p-8' : 'p-4 sm:p-5'}`}>
        <span className="sm:hidden text-[12px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: categoryColors[article.category] }}>
          {article.category}
        </span>
        <h3
          className={`font-display font-semibold text-wx-tx1 leading-snug mb-2 transition-colors group-hover:text-[color:var(--accent)] ${
            wide ? 'text-[16px] sm:text-[26px]' : 'text-[16px] sm:text-[18px]'
          }`}
        >
          <span className="sm:hidden">{article.titleShort}</span>
          <span className="hidden sm:inline">{wide ? article.title : article.titleShort}</span>
        </h3>
        <p className={`hidden sm:[display:-webkit-box] leading-[1.6] text-wx-txm mb-4 ${wide ? 'text-[15px] line-clamp-3' : 'text-[13px] line-clamp-2'}`}>
          {article.description}
        </p>
        <div className="mt-auto">
          {article.keyStat && (
            <div className="hidden sm:flex items-baseline gap-2 pt-3 mb-3" style={{ borderTop: '1px solid var(--bd)' }}>
              <span className={`font-mono font-semibold text-wx-tx1 ${wide ? 'text-[20px]' : 'text-[14px]'}`}>
                {article.keyStat.value}
              </span>
              <span className="font-mono text-meta uppercase tracking-wider text-wx-txf">{article.keyStat.label}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-mono text-meta text-wx-txf inline-flex items-center gap-1.5">
              {read && (
                <>
                  <Check className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} strokeWidth={3} aria-hidden />
                  <span style={{ color: 'var(--accent)' }}>Gelesen</span>
                  <span aria-hidden>·</span>
                </>
              )}
              {article.readingTime}
            </span>
            <span className="text-[12px] font-medium transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--accent)' }}>
              Lesen →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Das ganze Archiv mit Kategorie-Filter. Die Filter zeigen die Zahl der
 *  Artikel und in einem Wort, worum es in der Kategorie geht: "Technik" allein
 *  sagt einem Einsteiger nicht, ob er da hin will. */
export function ArchiveGrid({ filter, onFilter, read }: { filter: Filter; onFilter: (f: Filter) => void; read: Set<string> }) {
  const used = categoryOrder.filter((c) => articles.some((a) => a.category === c));
  const list = filter === 'Alle' ? articles : articles.filter((a) => a.category === filter);

  return (
    <section id="archiv" aria-labelledby="archiv-titel" className="mb-20 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>
            Das Archiv
          </p>
          <h2 id="archiv-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1]">
            Alle {articles.length} Artikel.
          </h2>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {(['Alle', ...used] as Filter[]).map((cat) => {
          const active = filter === cat;
          const count = cat === 'Alle' ? articles.length : articles.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onFilter(cat)}
              aria-pressed={active}
              className="shrink-0 text-left rounded-2xl px-4 py-2.5 transition-colors"
              style={
                active
                  ? { background: 'var(--accent)', color: 'var(--pg)' }
                  : { border: '1px solid var(--bd)', color: 'var(--tx1)', background: 'var(--sf)' }
              }
            >
              <span className="block text-[13px] font-semibold">
                {cat} <span className="font-mono font-normal opacity-70">{count}</span>
              </span>
              <span className="block text-[12px] opacity-75">
                {cat === 'Alle' ? 'Die ganze Werkstatt' : categoryBlurb[cat]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {list.map((article, i) => (
          <ArchiveCard key={article.slug} article={article} wide={isWide(i)} read={read.has(article.slug)} />
        ))}
      </div>
    </section>
  );
}
