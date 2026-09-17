import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { getProductById } from '@/lib/data';
import { removeStaticHeadMeta } from '@/lib/utils';
import { trackSearchNoResult } from '@/lib/analytics';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { useArticleSearch } from '@/lib/search/useArticleSearch';
import type { SearchHit } from '@/lib/search/engine';
import { articles, categoryOrder, categoryProductSlug, blogFeature } from './articles';
import type { Article, ArticleCategory } from './articles';
import { useReadArticles } from './readState';
import { HubHero } from './hub/HubHero';
import { SearchResults } from './hub/SearchResults';
import { LearningPath } from './hub/LearningPath';
import { SymptomFinder } from './hub/SymptomFinder';
import { NumbersStrip } from './hub/NumbersStrip';
import { ArchiveGrid } from './hub/ArchiveGrid';
import type { Filter } from './hub/ArchiveGrid';
import { hitUrl, saveRecentSearch } from './hub/searchHelpers';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);

const RESULTS_ID = 'ratgeber-treffer';

/**
 * Die Kachel mit dem empfohlenen Artikel, plus der Beleg fuer seine These.
 *
 * Vorher standen hier zwei Fotos nebeneinander, ein grosses "gewachst" und ein
 * kleines, ueberlappendes "geoelt" (eine verschmutzte Wade). Zwei getrennte
 * Aufnahmen muessen dem Betrachter aber immer erst erklaeren, dass sie
 * ueberhaupt vergleichbar sind. Jetzt steht dort derselbe Vergleichsslider wie
 * auf der Startseite: eine Kette, zwei Zustaende, der Leser zieht selbst.
 *
 * Dafuer ist die Kachel KEIN einziger <Link> mehr. Ein ziehbarer Slider
 * innerhalb eines Links waere unbedienbar, weil jeder Zug als Klick endet und
 * die Seite wechselt. Verlinkt sind Ueberschrift und Fusszeile, und
 * `has-[a:hover]` hebt trotzdem die ganze Karte.
 */
function FeatureTile({ article }: { article: Article }) {
  return (
    <div
      className="group grid md:grid-cols-[3fr_2fr] rounded-3xl mb-20 overflow-hidden transition-all duration-300 has-[a:hover]:-translate-y-1"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
    >
      {/* Der Slider bringt sein eigenes festes Seitenverhaeltnis mit (6/5, so
          sind die Bildpaare in public/images/compare/ geschnitten). Mit
          Innenabstand und eigenen Ecken ist er erkennbar ein gerahmtes
          Element, der Ausgleich zur Textspalte liest sich als Absicht. */}
      <div className="self-center p-4 sm:p-5 md:p-6">
        <div className="rounded-2xl overflow-hidden" style={{ transform: 'translateZ(0)' }}>
          <BeforeAfterSlider
            aspect="6/5"
            beforeSrc={blogFeature.before.src}
            afterSrc={blogFeature.after.src}
            beforeAlt={blogFeature.before.alt}
            afterAlt={blogFeature.after.alt}
            beforeLabel={blogFeature.before.label}
            afterLabel={blogFeature.after.label}
          />
        </div>
      </div>

      <div className="px-7 pb-8 sm:px-9 sm:pb-9 md:py-10 md:pr-10 md:pl-3 flex flex-col justify-center">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>
          Empfohlen · {article.category}
        </p>
        <h2 className="font-display text-2xl sm:text-[30px] font-bold leading-[1.15] mb-3">
          <Link to={`/blog/${article.slug}`} className="text-wx-tx1 transition-colors hover:text-[color:var(--accent)]">
            {article.title}
          </Link>
        </h2>
        {/* Keine Stats-Zeile mehr: 400–550 km & Co. stehen direkt darueber im
            Zahlen-Streifen, doppelt wirkte die Kachel wie eine Tabelle. */}
        <p className="text-[15px] leading-[1.7] text-wx-txm mb-6">{article.description}</p>
        <p className="text-[13px] leading-[1.6] text-wx-txf mb-6">
          Zieh den Regler: dieselbe Kette, geölt nach 80 km und gewachst nach 400 km.
        </p>
        <Link
          to={`/blog/${article.slug}`}
          className="mt-auto inline-flex items-center gap-2 py-2 -my-2 text-[14px] font-semibold w-fit"
          style={{ color: 'var(--accent)' }}
        >
          Artikel lesen
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

export function BlogIndexPage() {
  // Filter/Suche liegen in der URL (?kategorie=, ?q=), damit eine gefilterte
  // Ansicht oder eine Suche teilbar ist und einen Reload uebersteht.
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('kategorie');
  const initialFilter: Filter =
    categoryParam && (categoryOrder as string[]).includes(categoryParam) ? (categoryParam as ArticleCategory) : 'Alle';

  const [filter, setFilterState] = useState<Filter>(initialFilter);
  const [query, setQueryState] = useState(searchParams.get('q') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const read = useReadArticles();

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

  // Saisonal: Nov–Feb der Winterartikel als Empfehlung, sonst der mit
  // `featured` markierte.
  const month = new Date().getMonth();
  const isWinterSeason = month === 10 || month === 11 || month === 0 || month === 1;
  const seasonalArticle = isWinterSeason ? articles.find((a) => a.category === 'Saison') : undefined;
  const featured = seasonalArticle ?? articles.find((a) => a.featured);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // Die eigentliche Suche (Volltext, Aliase, Synonyme, Tippfehler, Antwort-
  // karten) liegt in src/lib/search/. Sie laedt ihren Index nach: `result ===
  // null` heisst "noch keine Aussage", nicht "nichts gefunden".
  const { result, state: searchState, prefetch: prefetchSearch, settledQuery } = useArticleSearch(query);

  // Notbehelf fuer genau dieses Zeitfenster (und fuer den Fall, dass der Index
  // gar nicht laedt): die schlichte Substring-Suche. Sie findet weniger, aber
  // sofort, und der Nutzer sieht nie ein falsches "keine Treffer".
  const fallbackHits: SearchHit[] = articles
    .filter((a) =>
      a.title.toLowerCase().includes(normalizedQuery) ||
      a.description.toLowerCase().includes(normalizedQuery) ||
      (a.takeaways ?? []).some((t) => t.toLowerCase().includes(normalizedQuery)))
    .map((a) => ({ slug: a.slug, score: 0, snippet: null, section: null }));

  const hits = result ? result.hits : isSearching ? fallbackHits : [];
  const answer = result?.answer ?? null;
  const noResults = isSearching && hits.length === 0 && (searchState === 'ready' || searchState === 'error');

  // Tastaturauswahl in der Trefferliste. Gehoert zur Anfrage, fuer die sie
  // gewaehlt wurde: tippt man weiter, ist keine Zeile mehr ausgewaehlt, ohne
  // dass dafuer ein Effekt den Zustand zuruecksetzen muss.
  const [nav, setNav] = useState({ query: '', index: -1 });
  const activeIndex = nav.query === query ? nav.index : -1;
  const urls = [...(answer ? [`/blog/${answer.slug}#${answer.anchor}`] : []), ...hits.map(hitUrl)];

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!urls.length) return;
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      const next = activeIndex === -1
        ? (step === 1 ? 0 : urls.length - 1)
        : (activeIndex + step + urls.length) % urls.length;
      setNav({ query, index: next });
      document.getElementById(`${RESULTS_ID}-${next}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const target = urls[activeIndex >= 0 ? activeIndex : 0];
      if (!target) return;
      e.preventDefault();
      saveRecentSearch(query);
      navigate(target);
    } else if (e.key === 'Escape') {
      if (query) { e.preventDefault(); setQuery(''); } else e.currentTarget.blur();
    }
  };

  // Suchen ohne Treffer melden (Vercel Analytics, cookiefrei). Erst wenn die
  // Anfrage 1,5 s stehen bleibt, sonst meldet jeder Zwischenstand beim Tippen.
  const reported = useRef(new Set<string>());
  useEffect(() => {
    const q = settledQuery.trim();
    if (!result || result.hits.length > 0 || q.length < 3) return;
    const id = window.setTimeout(() => {
      if (reported.current.has(q)) return;
      reported.current.add(q);
      trackSearchNoResult(q);
    }, 1500);
    return () => window.clearTimeout(id);
  }, [result, settledQuery]);

  // Wer mit ?kategorie= ankommt (Link aus einem Artikel oder der Navigation),
  // will das Archiv sehen, nicht erst an Lernpfad und Symptomen vorbei.
  useEffect(() => {
    if (initialFilter !== 'Alle') document.getElementById('archiv')?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommendedProduct = getProductById(filter === 'Alle' ? 'wax-500' : categoryProductSlug[filter]);

  // Die vorgerenderte Huelle setzt title/description/canonical/og/twitter
  // bereits statisch, markiert mit data-prerendered — ohne diesen Aufruf
  // bleiben nach der Hydration zwei Versionen jedes Tags im DOM (siehe
  // removeStaticHeadMeta in src/lib/utils.ts).
  useEffect(() => { removeStaticHeadMeta(); }, []);

  const description = `Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs aus Stuttgart. ${articles.length} Artikel.`;

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <Helmet>
        <title>Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Waxcelerate" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content="Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://waxcelerate.de/blog" />
        <meta property="og:image" content="https://waxcelerate.de/images/blog/ride-road-golden.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Die Werkstatt — Heißwachs Tipps &amp; Anleitungen | Waxcelerate" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://waxcelerate.de/images/blog/ride-road-golden.jpg" />
      </Helmet>

      <Navigation />

      <HubHero
        query={query}
        onQueryChange={setQuery}
        onPrefetch={prefetchSearch}
        onKeyDown={onSearchKeyDown}
        inputRef={inputRef}
        resultsId={RESULTS_ID}
        activeDescendant={activeIndex >= 0 ? `${RESULTS_ID}-${activeIndex}` : undefined}
        articleCount={articles.length}
      />

      <main id="main-content" className="wx-frame py-14 sm:py-20">
        {/* Trefferzahl fuer Screenreader, beim Tippen angesagt. */}
        <p className="sr-only" role="status" aria-live="polite">
          {isSearching ? `${hits.length} Treffer${answer ? ' und eine direkte Antwort' : ''}` : ''}
        </p>

        {isSearching ? (
          <SearchResults
            query={query}
            corrected={result?.corrected ?? null}
            answer={answer}
            hits={hits}
            suggestion={result?.suggestion ?? null}
            noResults={noResults}
            activeIndex={activeIndex}
            resultsId={RESULTS_ID}
            onQuery={(q) => { setQuery(q); inputRef.current?.focus(); }}
          />
        ) : (
          <>
            <LearningPath read={read} />
            <SymptomFinder />
            {/* Erst die Zahlen, dann der Slider, der sie am Foto zeigt. */}
            <NumbersStrip />
            {featured && <FeatureTile article={featured} />}
            <ArchiveGrid filter={filter} onFilter={setFilter} read={read} />
          </>
        )}

        {/* Kontakt + passendes Produkt. Das Produkt folgt der aktiven
            Kategorie (categoryProductSlug, articles.ts), sonst wax-500. */}
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

      <footer className="wx-frame py-12 text-center" style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </Link>
      </footer>

      <Footer />
    </div>
  );
}
