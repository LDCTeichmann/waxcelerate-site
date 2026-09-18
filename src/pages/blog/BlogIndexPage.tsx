import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { getProductById } from '@/lib/data';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { trackSearchNoResult } from '@/lib/analytics';
import { useArticleSearch } from '@/lib/search/useArticleSearch';
import { SITE_FAQ_DOC_ID } from '@/lib/search/engine';
import type { SearchHit } from '@/lib/search/engine';
import { articles, categoryOrder, categoryProductSlug } from './articles';
import type { ArticleCategory } from './articles';
import { useReadArticles } from './readState';
import { HubHero } from './hub/HubHero';
import { SearchResults } from './hub/SearchResults';
import { LearningPath } from './hub/LearningPath';
import { SymptomFinder } from './hub/SymptomFinder';
import { FaqSection } from './hub/FaqSection';
import { ArchiveGrid } from './hub/ArchiveGrid';
import type { Filter } from './hub/ArchiveGrid';
import { hitUrl, saveRecentSearch } from './hub/searchHelpers';
import { useLanguage } from '@/hooks/useLanguage';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);

const RESULTS_ID = 'ratgeber-treffer';

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
  const { t } = useLanguage();

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
  // Antwortkarte aus der Seiten-FAQ (src/pages/product/faqTopics.ts-Themen,
  // t.faq.items) hat keine eigene Artikelseite — sie zeigt auf den
  // Akkordeon-Anker hier auf /blog selbst, siehe SITE_FAQ_DOC_ID in
  // src/lib/search/engine.ts und die FaqSection weiter unten.
  const answerUrl = answer && `/blog${answer.slug === SITE_FAQ_DOC_ID ? '' : `/${answer.slug}`}#${answer.anchor}`;
  const urls = [...(answerUrl ? [answerUrl] : []), ...hits.map(hitUrl)];

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
      const index = activeIndex >= 0 ? activeIndex : 0;
      const target = urls[index];
      if (!target) return;
      e.preventDefault();
      saveRecentSearch(query);
      // Die Antwort der Seiten-FAQ zeigt auf einen Anker auf /blog selbst
      // (kein Routenwechsel) — ohne die Anfrage zu leeren bliebe die Seite
      // im Suchmodus und FaqSection (die den Anker oeffnet) wuerde nie
      // gerendert. Siehe derselbe Fall in SearchResults.tsx (AnswerCard).
      if (index === 0 && answer?.slug === SITE_FAQ_DOC_ID) setQuery('');
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
  // removeStaticHeadMeta in src/lib/utils.ts). Seit Chat 4 traegt /blog auch
  // ein FAQPage-Schema (vorher /faq) — genau wie bei den Blogartikeln muss
  // die statisch vorgerenderte Fassung (generate-blog-html.mjs) hier weichen,
  // bevor Helmet ihre eigene setzt (removeStaticJsonLd).
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  const description = `Messwerte, Anleitungen und ehrliche Antworten rund um Kettenpflege und Heißwachs aus Stuttgart. ${articles.length} Artikel.`;

  const faqGraph = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: t.pages.faq.metaTitle,
    description: t.pages.faq.metaDescription,
    url: 'https://waxcelerate.de/blog#fragen',
    mainEntity: t.faq.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

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
        <script type="application/ld+json">{JSON.stringify(faqGraph)}</script>
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
            <FaqSection />
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
              to="/kontakt"
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
