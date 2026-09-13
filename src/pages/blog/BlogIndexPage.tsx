import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { getProductById } from '@/lib/data';
import { removeStaticHeadMeta } from '@/lib/utils';
import { useArticleSearch } from '@/lib/search/useArticleSearch';
import type { SnippetPart } from '@/lib/search/engine';
import {
  articles,
  categoryColors,
  categoryOrder,
  categoryProductSlug,
  getArticleImage,
  blogHero,
  blogFeature,
} from './articles';
import type { Article, ArticleCategory } from './articles';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);

type Filter = 'Alle' | ArticleCategory;

/** Fundstelle im Artikeltext, Treffer hervorgehoben.
 *  Ersetzt waehrend einer Suche die Kurzbeschreibung: die erklaert, worum es
 *  geht, beantwortet aber nicht die Frage "steht meine Antwort da drin?".
 *  Genau das zeigt der Schnipsel. */
function Snippet({ parts }: { parts: SnippetPart[] }) {
  return (
    <p className="text-[13px] leading-[1.6] text-wx-txm mb-4 line-clamp-3">
      {parts.map((part, i) =>
        part.hit ? (
          <mark
            key={i}
            className="rounded px-0.5"
            style={{ background: 'color-mix(in srgb, var(--accent) 24%, transparent)', color: 'var(--tx1)' }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function ArticleCard({ article, snippet }: { article: Article; snippet?: SnippetPart[] | null }) {
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
          className="absolute top-3 left-3 text-small font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full backdrop-blur"
          style={{ background: 'var(--chip-bg)', color: categoryColors[article.category] }}
        >
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h2 className="font-display text-[18px] font-semibold text-wx-tx1 leading-snug mb-2 group-hover:text-white transition-colors">
          {article.titleShort}
        </h2>
        {snippet?.length ? (
          <Snippet parts={snippet} />
        ) : (
          <p className="text-[13px] leading-[1.6] text-wx-txm mb-4 line-clamp-2">
            {article.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-meta text-wx-txf">
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
            <span className="font-mono text-meta uppercase tracking-wider text-wx-txf">
              {article.keyStat.label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Ersetzt die frühere Kombination aus separatem Vergleichsblock + eigener
 * FeaturedArticle-Kachel (zwei gleich große Blöcke übereinander) durch eine
 * einzige asymmetrische Kachel: ein großes Hauptbild plus ein kleineres,
 * überlappendes Kontrastbild, das die "geölt vs. gewachst"-These weiterträgt
 * statt sie als eigenen Block zu wiederholen.
 */
function FeatureTile({ article }: { article: Article }) {
  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group grid md:grid-cols-[3fr_2fr] rounded-2xl mb-12 transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
    >
      {/* Bildspalte: Hauptbild + überlappendes Insetbild. `self-start` ist
          hier absichtlich: ohne das würde die Spalte sich in der Desktop-Grid
          auf die Höhe der Textspalte strecken (die je nach Titellänge stark
          variiert), und dann würde das Inset-Bild — das relativ zu dieser
          Spalte positioniert ist — bei einem langen Titel weit unter die
          Kachel hinausragen. Mit `self-start` behält die Bildspalte immer
          ihre eigene, bildbasierte Höhe, unabhängig vom Text daneben. Das
          Inset sitzt bewusst außerhalb des Hauptbild-Containers (der sein
          eigenes overflow-hidden trägt), damit es über die Kante hinausragen
          kann, ohne vom äußeren rounded-2xl beschnitten zu werden. */}
      <div className="relative self-start mb-12 sm:mb-14 md:mb-16 md:pr-10">
        <div
          className="relative aspect-[16/11] sm:aspect-[4/3] md:aspect-[5/4] overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"
          style={{ background: 'var(--sf2)', transform: 'translateZ(0)' }}
        >
          <img
            src={blogFeature.main.src}
            alt={blogFeature.main.alt}
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
          />
          <span
            className="absolute top-3 left-3 text-small font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full backdrop-blur"
            style={{ background: 'var(--chip-bg)', color: '#F2F2F5' }}
          >
            {blogFeature.main.caption}
          </span>
        </div>
        <figure
          className="absolute left-5 -bottom-10 sm:-bottom-12 md:-bottom-14 w-[46%] sm:w-[38%] md:w-[52%] md:left-6 aspect-[4/5] rounded-xl overflow-hidden shadow-2xl"
          style={{ border: '3px solid var(--pg)', background: 'var(--sf2)' }}
        >
          <img
            src={blogFeature.inset.src}
            alt={blogFeature.inset.alt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <figcaption
            className="absolute bottom-0 left-0 right-0 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ background: 'linear-gradient(0deg, rgba(var(--scrim-rgb),0.85), rgba(var(--scrim-rgb),0))', color: '#F2F2F5' }}
          >
            {blogFeature.inset.caption}
          </figcaption>
        </figure>
      </div>

      {/* Textspalte: bewusst oben ausgerichtet statt vertikal zentriert, damit
          die Kachel nicht als gespiegeltes 50/50-Layout wirkt. */}
      <div className="p-7 sm:p-9 md:pt-9 flex flex-col justify-start">
        <p className="font-mono text-small uppercase tracking-[0.18em] text-wx-txf mb-3">
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
                <div className="font-mono text-meta uppercase tracking-wider text-wx-txf">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-[13px] leading-[1.6] text-wx-txf mb-6">
          Der Unterschied ist kein Marketingversprechen, sondern das, was nach
          der Fahrt an Wade und Socke hängen bleibt.
        </p>
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
          Artikel lesen
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Leerzustand. Vorher rendete die Seite bei null Treffern einfach ein leeres
 * Raster: der Nutzer sah, dass etwas fehlt, bekam aber weder eine Erklaerung
 * noch einen Ausweg. Hier steht beides, und zwar in dieser Reihenfolge:
 * zuerst der wahrscheinlichste Grund (ein aktiver Kategoriefilter, den man
 * leicht vergisst), dann die vier Einstiege, dann der direkte Draht zu Luca.
 */
function NoResults({
  query,
  activeFilter,
  onClearFilter,
  onClearQuery,
}: {
  query: string;
  activeFilter: Filter;
  onClearFilter: () => void;
  onClearQuery: () => void;
}) {
  return (
    <div className="mb-16 rounded-2xl px-6 py-10 sm:px-10 sm:py-12"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
      <p className="font-mono text-small uppercase tracking-[0.18em] text-wx-txf mb-3">
        Kein Treffer
      </p>
      <h2 className="font-display text-2xl font-bold text-wx-tx1 mb-3">
        Zu „{query}" habe ich nichts gefunden.
      </h2>

      {activeFilter !== 'Alle' ? (
        <p className="text-[14px] leading-[1.7] text-wx-txm mb-6">
          Gesucht wurde nur in der Kategorie{' '}
          <span style={{ color: 'var(--tx1)' }}>{activeFilter}</span>.{' '}
          <button
            type="button"
            onClick={onClearFilter}
            className="underline underline-offset-2"
            style={{ color: 'var(--accent)' }}
          >
            In allen Artikeln suchen
          </button>
        </p>
      ) : (
        <p className="text-[14px] leading-[1.7] text-wx-txm mb-6">
          Versuch es ruhig mit eigenen Worten, ganze Fragen versteht die Suche
          auch. Oder steig hier ein:
        </p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7">
        {INTENTS.map((intent) => (
          <Link
            key={intent.slug}
            to={`/blog/${intent.slug}`}
            onClick={onClearQuery}
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

      <p className="text-[13px] leading-[1.7] text-wx-txf">
        Steht deine Frage nirgends?{' '}
        <Link to="/kontakt" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
          Schreib mir direkt
        </Link>
        , dann beantworte ich sie dir und sie landet danach hier.
      </p>
    </div>
  );
}

const INTENTS: { label: string; slug: string }[] = [
  { label: 'Ich will anfangen', slug: 'von-oel-auf-wachs-umsteigen' },
  { label: 'Es klappt nicht', slug: 'wachs-haelt-nicht-haeufige-fehler' },
  { label: 'Ich will es genau wissen', slug: 'kettenlaufzeit-heisswachs' },
  { label: 'Ich will kaufen', slug: 'vorgewachste-kette' },
];

export function BlogIndexPage() {
  // Filter/search sync to the URL (?kategorie=, ?q=) so a filtered view can
  // be bookmarked, shared, or survive a refresh — it used to be plain
  // useState and was lost the moment the page reloaded.
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('kategorie');
  const initialFilter: Filter =
    categoryParam && (categoryOrder as string[]).includes(categoryParam) ? (categoryParam as ArticleCategory) : 'Alle';

  const [filter, setFilterState] = useState<Filter>(initialFilter);
  const [query, setQueryState] = useState(searchParams.get('q') ?? '');

  const setFilter = (next: Filter) => {
    setFilterState(next);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next === 'Alle') params.delete('kategorie');
      else params.set('kategorie', next);
      return params;
    }, { replace: true });
  };

  const setQuery = (next: string) => {
    setQueryState(next);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next.trim() === '') params.delete('q');
      else params.set('q', next);
      return params;
    }, { replace: true });
  };

  // Seasonally prefer the winter article as the lead in Nov–Feb, otherwise
  // fall back to the explicit `featured` flag (only ever set on one article
  // today — this doesn't fix that on its own, it just stops the same lead
  // from showing year-round when a seasonally-relevant one exists).
  const month = new Date().getMonth();
  const isWinterSeason = month === 10 || month === 11 || month === 0 || month === 1;
  const seasonalArticle = isWinterSeason ? articles.find((a) => a.category === 'Saison') : undefined;
  const featured = seasonalArticle ?? articles.find((a) => a.featured);
  const usedCategories = categoryOrder.filter((c) =>
    articles.some((a) => a.category === c),
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // Die eigentliche Suche (Volltext, Aliase, Synonyme, Tippfehlertoleranz)
  // liegt in src/lib/search/. Sie laedt ihren Index nach und ist deshalb in
  // den ersten Millisekunden noch nicht da: `hits === null` heisst "noch keine
  // Aussage", nicht "nichts gefunden".
  const { hits, state: searchState, prefetch: prefetchSearch } = useArticleSearch(query);

  // Notbehelf fuer genau dieses Zeitfenster (und fuer den Fall, dass der Index
  // gar nicht laedt): die alte, schlichte Substring-Suche. Sie findet weniger,
  // aber sie findet sofort, und der Nutzer sieht nie ein falsches
  // "keine Treffer".
  const fallbackMatches = (a: Article) =>
    a.title.toLowerCase().includes(normalizedQuery) ||
    a.titleShort.toLowerCase().includes(normalizedQuery) ||
    a.description.toLowerCase().includes(normalizedQuery) ||
    (a.takeaways ?? []).some((t) => t.toLowerCase().includes(normalizedQuery));

  const bySlug = new Map(articles.map((a) => [a.slug, a]));

  // Bei aktiver Suche bestimmt die Relevanz die Reihenfolge, nicht mehr die
  // Reihenfolge im Datenarray. Der Kategoriefilter bleibt dabei bewusst
  // wirksam: die Pills stehen sichtbar aktiv da, ein Suchergebnis ausserhalb
  // der gewaehlten Kategorie waere ein Widerspruch zur Anzeige. Der
  // Leerzustand bietet dafuer an, den Filter mit einem Klick aufzuheben.
  const inFilter = (a: Article) => filter === 'Alle' || a.category === filter;

  const ranked: { article: Article; snippet: SnippetPart[] | null }[] = !isSearching
    ? []
    : hits
      ? hits
          .map((h) => ({ article: bySlug.get(h.slug), snippet: h.snippet }))
          .filter((r): r is { article: Article; snippet: SnippetPart[] | null } => Boolean(r.article))
          .filter((r) => inFilter(r.article))
      : articles.filter(fallbackMatches).filter(inFilter).map((a) => ({ article: a, snippet: null }));

  const snippetFor = new Map(ranked.map((r) => [r.article.slug, r.snippet]));

  const showLead = filter === 'Alle' && !isSearching && featured;
  const grid = isSearching
    ? ranked.map((r) => r.article)
    : filter === 'Alle'
      // Excludes whichever article is actually shown as the lead right now —
      // compares against `featured`'s slug, not the raw `.featured` flag,
      // since the seasonal override above can promote an article to lead
      // that doesn't have that flag set at all.
      ? articles.filter((a) => a.slug !== featured?.slug)
      : articles.filter((a) => a.category === filter);

  // "Wirklich nichts gefunden" nur, wenn der Index fertig ist und trotzdem
  // nichts uebrig bleibt. Waehrend des Ladens zeigt die Seite lieber die
  // Fallback-Treffer.
  const noResults = isSearching && grid.length === 0 && (searchState === 'ready' || searchState === 'error');

  const recommendedProduct = getProductById(
    filter === 'Alle' ? 'wax-500' : categoryProductSlug[filter],
  );

  // Die vorgerenderte Huelle setzt title/description/canonical/og/twitter
  // bereits statisch, markiert mit data-prerendered — ohne diesen Aufruf
  // bleiben nach der Hydration zwei Versionen jedes Tags im DOM (siehe
  // removeStaticHeadMeta in src/lib/utils.ts).
  useEffect(() => { removeStaticHeadMeta(); }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate</title>
        <meta
          name="description"
          content={`Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs aus Stuttgart. ${articles.length} Artikel.`}
        />
        <link rel="canonical" href="https://waxcelerate.de/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content="Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate" />
        <meta
          property="og:description"
          content={`Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs aus Stuttgart. ${articles.length} Artikel.`}
        />
        <meta property="og:url" content="https://waxcelerate.de/blog" />
        <meta property="og:image" content="https://waxcelerate.de/images/blog/ride-road-golden.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate" />
        <meta
          name="twitter:description"
          content={`Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs aus Stuttgart. ${articles.length} Artikel.`}
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
          <p className="font-mono text-small uppercase tracking-[0.14em] mb-4" style={{ color: '#E6E6EA' }}>
            Die Werkstatt
          </p>
          <h1
            className="font-sans font-black leading-[1.02] tracking-tight mb-5 max-w-2xl"
            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', textShadow: '0 2px 30px rgba(0,0,0,0.85)' }}
          >
            Wissen rund um Kette &amp; Wachs
          </h1>
          <p className="text-[16px] sm:text-[17px] leading-relaxed max-w-xl" style={{ color: '#D8D8DE', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
            Messwerte, Anleitungen und ehrliche Antworten, von jemandem, der jede
            Woche selbst am Wachstopf steht.
          </p>
          <p className="font-mono text-small uppercase tracking-widest mt-6" style={{ color: '#B4B4BE' }}>
            {articles.length} Artikel · Stuttgart
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Suche. Der Platzhalter nennt bewusst eine ganze Frage statt zweier
            Stichwoerter: die Suche versteht jetzt Umgangssprache, und niemand
            probiert das aus, wenn das Feld nach Schlagwortsuche aussieht. */}
        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: 'var(--txf)' }}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // Der Index wird nachgeladen. Beim Fokus ist er dadurch meist schon
            // da, bevor der erste Buchstabe getippt ist.
            onFocus={prefetchSearch}
            onPointerEnter={prefetchSearch}
            aria-label="Artikel durchsuchen"
            placeholder='Frag einfach: „meine Hose wird schwarz“'
            className="w-full text-[14px] pl-11 pr-4 py-2.5 rounded-full outline-none transition-colors focus:border-[color:var(--accent)]"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)', color: 'var(--tx1)' }}
          />
        </div>
        {/* Trefferzahl fuer Screenreader. Sichtbar steht sie an der
            Abschnittsueberschrift, aber die liegt im Lesefluss weit unter dem
            Feld und wird ohne diese Meldung beim Tippen nicht angesagt. */}
        <p className="sr-only" role="status" aria-live="polite">
          {isSearching ? `${grid.length} Treffer für ${query}` : ''}
        </p>

        {/* Einstieg nach Absicht. Bewusst anders gestaltet als die Kategorie-Pills
            darunter: das hier sind Sprungziele in einen Artikel, keine Filter.
            Gleiche Optik für zwei verschiedene Verhalten wäre eine Falle. */}
        <div className="mb-8">
          <p className="font-mono text-small uppercase tracking-[0.2em] text-wx-txf mb-2.5">
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

        {/* Featured lead — eine asymmetrische Kachel statt zwei gleich
            großer Blöcke übereinander, siehe FeatureTile oben. */}
        {showLead && featured && <FeatureTile article={featured} />}

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
        {noResults ? (
          <NoResults
            query={query}
            activeFilter={filter}
            onClearFilter={() => setFilter('Alle')}
            onClearQuery={() => setQuery('')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {grid.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                snippet={snippetFor.get(article.slug)}
              />
            ))}
          </div>
        )}

        {/* CTA banner + product cross-sell — the blog previously had zero
            product links anywhere except each article's own bottom CTA card.
            Product follows the active category (categoryProductSlug,
            articles.ts); falls back to the flagship wax-500 for 'Alle'. */}
        <div className="grid sm:grid-cols-2 gap-5">
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
              style={{ background: 'linear-gradient(90deg, rgba(var(--scrim-rgb),0.82) 0%, rgba(var(--scrim-rgb),0.6) 55%, rgba(var(--scrim-rgb),0.35) 100%)' }}
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

          {recommendedProduct && (
            <Link
              to={`/produkt/${recommendedProduct.id}`}
              className="flex items-center gap-4 rounded-2xl p-6 transition-colors hover:opacity-90"
              style={{ border: '1px solid var(--bd)', background: 'var(--sf)' }}
            >
              <img
                src={recommendedProduct.image}
                alt=""
                loading="lazy"
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                style={{ objectPosition: recommendedProduct.imagePosition ?? 'center' }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-small uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--txff)' }}>
                  Passend dazu
                </p>
                <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--tx1)' }}>
                  {recommendedProduct.title}
                </p>
                <p className="text-[13px] font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>
                  {formatPrice(recommendedProduct.price)}
                </p>
              </div>
            </Link>
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center" style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </Link>
      </footer>

      <Footer />
    </div>
  );
}
