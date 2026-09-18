import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import type { SearchAnswer, SearchHit, SnippetPart } from '@/lib/search/engine';
import { SITE_FAQ_DOC_ID } from '@/lib/search/engine';
import { articles, categoryColors, getArticleImage } from '../articles';
import { suggestedQuestions } from '../hubContent';
import { hitUrl, saveRecentSearch } from './searchHelpers';

const bySlug = new Map(articles.map((a) => [a.slug, a]));

/** Fundstelle im Artikeltext, Treffer hervorgehoben. Ersetzt waehrend einer
 *  Suche die Kurzbeschreibung: die erklaert, worum es geht, beantwortet aber
 *  nicht die Frage "steht meine Antwort da drin?". */
function Snippet({ parts }: { parts: SnippetPart[] }) {
  return (
    <p className="text-[14px] leading-[1.6] text-wx-txm line-clamp-2">
      {parts.map((part, i) =>
        part.hit ? (
          <mark
            key={i}
            className="rounded px-0.5"
            style={{ background: 'rgba(var(--accent-rgb),0.18)', color: 'var(--tx1)' }}
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

/**
 * Antwort zuerst, dann die Artikel. Die Karte zeigt Lucas eigene FAQ-Antwort
 * aus dem Artikel, der ganz oben rankt, wortgleich. Das Vorbild ist die
 * Antwortbox bei Wirecutter oder Google: wer "wie oft nachwachsen" fragt, will
 * eine Zahl, keinen Link auf sieben Minuten Lesezeit.
 */
function AnswerCard({ answer, id, active, query, onQuery }: { answer: SearchAnswer; id: string; active: boolean; query: string; onQuery: (q: string) => void }) {
  const isSiteFaq = answer.slug === SITE_FAQ_DOC_ID;
  const article = isSiteFaq ? undefined : bySlug.get(answer.slug);
  const href = isSiteFaq ? `/blog#${answer.anchor}` : `/blog/${answer.slug}#${answer.anchor}`;
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      className="rounded-2xl p-6 sm:p-7 mb-6 transition-shadow"
      style={{
        background: 'var(--sf)',
        border: '1px solid var(--bd)',
        borderLeft: '4px solid var(--accent)',
        boxShadow: active ? '0 0 0 2px rgba(var(--accent-rgb),0.5)' : 'var(--card-shadow, none)',
      }}
    >
      <p className="font-mono text-small uppercase tracking-[0.18em] mb-3 inline-flex items-center gap-2" style={{ color: 'var(--accent)' }}>
        <MessageSquareText className="h-4 w-4" aria-hidden />
        Kurz beantwortet
      </p>
      <h2 className="font-display text-[21px] sm:text-[24px] font-bold text-wx-tx1 leading-snug mb-3">
        {answer.question}
      </h2>
      <p className="text-[16px] leading-[1.7] text-wx-tx2 mb-5 max-w-3xl">{answer.answer}</p>
      <Link
        to={href}
        onClick={() => {
          saveRecentSearch(query);
          // Die Antwort zeigt auf einen Anker AUF /blog selbst (kein
          // Routenwechsel wie bei einer Artikel-Antwort) — ohne die Anfrage
          // zu leeren bliebe die Seite im Suchmodus und FaqSection (die den
          // Anker oeffnet) wuerde nie gerendert.
          if (isSiteFaq) onQuery('');
        }}
        className="inline-flex items-center gap-2 text-[14px] font-semibold"
        style={{ color: 'var(--accent)' }}
      >
        {isSiteFaq ? 'Mehr dazu bei den häufigen Fragen' : `Mehr dazu in „${article?.titleShort ?? 'dem Artikel'}“`}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

function HitRow({ hit, id, active, query }: { hit: SearchHit; id: string; active: boolean; query: string }) {
  const article = bySlug.get(hit.slug);
  if (!article) return null;
  const img = getArticleImage(article.slug);
  return (
    <li id={id} role="option" aria-selected={active}>
      <Link
        to={hitUrl(hit)}
        onClick={() => saveRecentSearch(query)}
        className="group grid grid-cols-[72px_1fr] sm:grid-cols-[112px_1fr_auto] gap-4 sm:gap-5 items-start sm:items-center rounded-2xl p-3 sm:p-4 transition-colors"
        style={{
          background: active ? 'var(--sf)' : 'transparent',
          border: `1px solid ${active ? 'rgba(var(--accent-rgb),0.5)' : 'transparent'}`,
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl" style={{ background: 'var(--sf2)' }}>
          <img src={img.card} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-small uppercase tracking-[0.14em] mb-1 truncate">
            <span style={{ color: categoryColors[article.category] }}>{article.category}</span>
            {hit.section?.heading && (
              <span className="text-wx-txf normal-case tracking-normal"> · {hit.section.heading}</span>
            )}
          </p>
          <h3 className="font-display text-[17px] sm:text-[19px] font-semibold text-wx-tx1 leading-snug mb-1 transition-colors group-hover:text-[color:var(--accent)]">
            {article.titleShort}
          </h3>
          {hit.snippet?.length ? (
            <Snippet parts={hit.snippet} />
          ) : (
            <p className="text-[14px] leading-[1.6] text-wx-txm line-clamp-2">{article.description}</p>
          )}
        </div>
        <ArrowRight
          className="hidden sm:block h-5 w-5 transition-transform group-hover:translate-x-1"
          style={{ color: 'var(--accent)' }}
          aria-hidden
        />
      </Link>
    </li>
  );
}

function NoResults({ query, suggestion, onQuery }: { query: string; suggestion: string | null; onQuery: (q: string) => void }) {
  return (
    <div className="rounded-2xl px-6 py-10 sm:px-10 sm:py-12" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
      <p className="font-mono text-small uppercase tracking-[0.18em] text-wx-txf mb-3">Kein Treffer</p>
      <h2 className="font-display text-2xl font-bold text-wx-tx1 mb-4">
        Zu „{query}“ habe ich nichts gefunden.
      </h2>
      {suggestion && (
        <p className="text-[15px] text-wx-txm mb-6">
          Meintest du{' '}
          <button
            type="button"
            onClick={() => onQuery(suggestion)}
            className="font-semibold underline underline-offset-4"
            style={{ color: 'var(--accent)' }}
          >
            „{suggestion}“
          </button>
          ?
        </p>
      )}
      <p className="text-[14px] leading-[1.7] text-wx-txm mb-3">
        Die Suche versteht ganze Fragen. Probier zum Beispiel:
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onQuery(q)}
            className="text-[13px] px-3.5 py-2 rounded-full transition-colors hover:bg-[color:var(--sf2)]"
            style={{ border: '1px solid var(--bd)', color: 'var(--tx1)' }}
          >
            {q}
          </button>
        ))}
      </div>
      <p className="text-[14px] leading-[1.7] text-wx-txf">
        Steht deine Frage nirgends?{' '}
        <Link to="/kontakt" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
          Schreib mir direkt
        </Link>
        . Ich beantworte sie dir, und sie landet danach hier.
      </p>
    </div>
  );
}

/**
 * Ergebnisliste unter dem Suchkopf. Bewusst eine Liste statt des
 * Kachelrasters: bei einer Suche zaehlt, WO die Antwort steht (Abschnitt und
 * Fundstelle), nicht das Foto. Jede Zeile springt direkt in den Abschnitt.
 * Pfeiltasten und Enter bedienen die Liste aus dem Suchfeld heraus
 * (aria-activedescendant, siehe HubHero).
 */
export function SearchResults({
  query,
  corrected,
  answer,
  hits,
  suggestion,
  noResults,
  activeIndex,
  resultsId,
  onQuery,
}: {
  query: string;
  corrected: string | null;
  answer: SearchAnswer | null;
  hits: SearchHit[];
  suggestion: string | null;
  noResults: boolean;
  activeIndex: number;
  resultsId: string;
  onQuery: (q: string) => void;
}) {
  const offset = answer ? 1 : 0;
  return (
    <section aria-label="Suchergebnisse" className="mb-20">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] text-wx-txf">
          {noResults ? 'Suche' : `${hits.length} Artikel zu „${query.trim()}“`}
        </h2>
        {corrected && !noResults && (
          <p className="text-[13px] text-wx-txm">
            Gesucht nach <span className="font-semibold text-wx-tx1">„{corrected}“</span>
          </p>
        )}
        <p className="hidden md:block font-mono text-[12px] text-wx-txff">↑ ↓ wählen · Enter öffnen · Esc leeren</p>
      </div>

      <div id={resultsId} role="listbox" aria-label="Treffer">
        {answer && <AnswerCard answer={answer} id={`${resultsId}-0`} active={activeIndex === 0} query={query} onQuery={onQuery} />}
        {noResults ? (
          <NoResults query={query.trim()} suggestion={suggestion} onQuery={onQuery} />
        ) : (
          <ul className="space-y-1">
            {hits.map((hit, i) => (
              <HitRow
                key={hit.slug}
                hit={hit}
                id={`${resultsId}-${i + offset}`}
                active={activeIndex === i + offset}
                query={query}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
