import { useEffect, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { blogHero } from '../articles';
import { suggestedQuestions } from '../hubContent';
import { loadRecentSearches, prefersReducedMotion } from './searchHelpers';

const STATIC_PLACEHOLDER = 'Frag in eigenen Worten, z. B. „meine Hose wird schwarz“';

/**
 * Kopf der Ratgeber-Seite. Frueher Titel plus Unterzeile, die Suche stand
 * darunter als schmales Feld zwischen den Filtern. Jetzt IST die Suche der
 * Kopf: gross, mit Beispielfragen als Chips, und mit ⌘K von ueberall auf der
 * Seite erreichbar. Das Vorbild sind Hilfeseiten wie die von Linear oder
 * Stripe: wer mit einer Frage kommt, soll nicht erst ein Raster aus 18
 * Kacheln lesen muessen.
 *
 * Seitenordnung Chat 4 (09/2026): der Platzhalter tippte sich vorher selbst
 * durch sechs Beispielfragen (typewriterQuestions) — eine Autoplay-Animation,
 * die "Gemeinsame Regeln" im Plan ausdruecklich ausschliesst ("keine neue
 * Autoplay-Animation"). Der Platzhalter steht jetzt still, die Chips bleiben.
 */
export function HubHero({
  query,
  onQueryChange,
  onPrefetch,
  onKeyDown,
  inputRef,
  resultsId,
  activeDescendant,
  articleCount,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onPrefetch: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  resultsId: string;
  activeDescendant?: string;
  articleCount: number;
}) {
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>(loadRecentSearches);

  // ⌘K / Strg+K und "/" springen von ueberall ins Suchfeld. "/" nur, wenn
  // gerade nicht in ein anderes Feld getippt wird.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (!combo && !(e.key === '/' && !typing)) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputRef]);

  const pick = (q: string) => {
    onQueryChange(q);
    onPrefetch();
    inputRef.current?.focus();
  };

  const chips = recent.length ? recent : suggestedQuestions;

  return (
    // Hell statt dunkel (09/2026): vorher lag die Kettentextur unter einem fast
    // deckenden Scrim. Jetzt wie der Rewax-Kopf: Seitengrund, das Foto
    // (Kette ueber dem Wachstopf vor den Stuttgarter Huegeln) fuellt ab lg die
    // rechte Haelfte und laeuft per Maske in den Grund aus, mobil steht es oben.
    <section id="hub-hero" className="relative overflow-hidden border-b" style={{ background: 'var(--pg)', borderColor: 'var(--bd2)' }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-[300px] sm:h-[380px] lg:inset-x-auto lg:right-0 lg:h-full lg:w-[56%]"
        style={{ WebkitMaskImage: 'var(--hub-hero-mask)', maskImage: 'var(--hub-hero-mask)' }}>
        <img
          src={blogHero.src}
          srcSet={`${blogHero.srcSmall} 800w, ${blogHero.src} 1600w`}
          sizes="(max-width: 1024px) 100vw, 56vw"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover"
          style={{ objectPosition: '42% 45%' }}
        />
      </div>
      <style>{`
        #hub-hero { --hub-hero-mask: linear-gradient(to bottom, rgba(0,0,0,.95) 0%, rgba(0,0,0,.6) 55%, transparent 100%); }
        @media (min-width: 1024px) {
          #hub-hero { --hub-hero-mask: linear-gradient(to right, transparent 0%, rgba(0,0,0,.85) 30%, #000 60%); }
        }
      `}</style>
      <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 pt-[220px] sm:pt-[290px] lg:pt-36 pb-12 sm:pb-16">
        <p className="eyebrow mb-4" style={{ color: 'var(--accent-soft)' }}>
          Die Werkstatt · {articleCount} Artikel · Stuttgart
        </p>
        <h1
          className="font-display font-bold leading-[1.02] mb-4 max-w-xl"
          style={{ color: 'var(--tx1)', fontSize: 'clamp(2.3rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}
        >
          Blog &amp; FAQ
        </h1>
        <p className="text-[16px] sm:text-[17px] leading-relaxed max-w-[520px] mb-8" style={{ color: 'var(--txm)' }}>
          Messwerte, Anleitungen und ehrliche Antworten von jemandem, der jede Woche
          selbst am Wachstopf steht. Frag so, wie du es einem Freund erzählen würdest.
        </p>

        <div className="relative max-w-[600px]">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
            style={{ color: 'var(--txf)' }}
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={query.trim().length >= 2}
            aria-controls={resultsId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            aria-label="Ratgeber durchsuchen, auch mit ganzen Fragen"
            value={query}
            placeholder={STATIC_PLACEHOLDER}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => { setFocused(true); setRecent(loadRecentSearches()); onPrefetch(); }}
            onBlur={() => setFocused(false)}
            onPointerEnter={onPrefetch}
            enterKeyHint="search"
            autoComplete="off"
            className="w-full h-14 sm:h-16 text-[16px] sm:text-[17px] pl-14 pr-24 rounded-2xl outline-none transition-shadow [&::-webkit-search-cancel-button]:hidden"
            style={{
              background: 'var(--sf)',
              color: 'var(--tx1)',
              border: '1px solid var(--bd)',
              boxShadow: focused
                ? '0 0 0 3px rgba(var(--accent-rgb),0.35), 0 14px 36px rgba(0,0,0,0.12)'
                : '0 14px 36px rgba(0,0,0,0.10)',
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query ? (
              <button
                type="button"
                onClick={() => { onQueryChange(''); inputRef.current?.focus(); }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors hover:bg-[color:var(--sf2)]"
                aria-label="Suche leeren"
              >
                <X className="h-4 w-4" style={{ color: 'var(--txm)' }} />
              </button>
            ) : (
              <kbd
                className="hidden md:inline-flex items-center font-mono text-[12px] px-2 py-1 rounded-md"
                style={{ background: 'var(--sf2)', color: 'var(--txf)', border: '1px solid var(--bd)' }}
                aria-hidden
              >
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 max-w-[600px]">
          <span className="eyebrow mr-1">
            {recent.length ? 'Zuletzt gesucht' : 'Zum Beispiel'}
          </span>
          {chips.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => pick(q)}
              className="text-[13px] px-3.5 py-2 rounded-full transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              style={{ background: 'color-mix(in srgb, var(--sf) 85%, transparent)', color: 'var(--tx2)', border: '1px solid var(--bd2)', backdropFilter: 'blur(6px)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
