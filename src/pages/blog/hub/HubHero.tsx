import { useEffect, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { blogHero } from '../articles';
import { suggestedQuestions, typewriterQuestions } from '../hubContent';
import { loadRecentSearches, prefersReducedMotion } from './searchHelpers';

/**
 * Tippt die Beispielfragen nacheinander in den Platzhalter.
 * Laeuft nur, solange das Feld leer und nicht fokussiert ist: sobald jemand
 * hineinklickt, muss der Platzhalter stillhalten, sonst liest er sich wie
 * Text, den man erst loeschen muesste.
 */
function useTypewriter(phrases: string[], enabled: boolean) {
  const [state, setState] = useState({ i: 0, n: 0, deleting: false });

  useEffect(() => {
    if (!enabled) return;
    const phrase = phrases[state.i % phrases.length];
    let delay = state.deleting ? 26 : 58;
    let next = { ...state, n: state.n + (state.deleting ? -1 : 1) };
    if (!state.deleting && state.n === phrase.length) {
      delay = 1900;
      next = { ...state, deleting: true };
    } else if (state.deleting && state.n === 0) {
      delay = 350;
      next = { i: state.i + 1, n: 0, deleting: false };
    }
    const id = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(id);
  }, [state, enabled, phrases]);

  return phrases[state.i % phrases.length].slice(0, state.n);
}

const STATIC_PLACEHOLDER = 'Frag in eigenen Worten, z. B. „meine Hose wird schwarz“';

/**
 * Kopf der Ratgeber-Seite. Frueher Titel plus Unterzeile, die Suche stand
 * darunter als schmales Feld zwischen den Filtern. Jetzt IST die Suche der
 * Kopf: gross, mit Beispielfragen, die sich selbst tippen, und mit ⌘K von
 * ueberall auf der Seite erreichbar. Das Vorbild sind Hilfeseiten wie die von
 * Linear oder Stripe: wer mit einer Frage kommt, soll nicht erst ein Raster
 * aus 18 Kacheln lesen muessen.
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
  const [reducedMotion] = useState(prefersReducedMotion);
  const [recent, setRecent] = useState<string[]>(loadRecentSearches);
  const typed = useTypewriter(typewriterQuestions, !reducedMotion && !focused && query === '');
  const placeholder = reducedMotion || focused ? STATIC_PLACEHOLDER : typed || ' ';

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
    <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--bd)' }}>
      <img src={blogHero.src} alt={blogHero.alt} className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(var(--scrim-rgb),0.97) 0%, rgba(var(--scrim-rgb),0.86) 40%, rgba(var(--scrim-rgb),0.55) 100%)',
        }}
      />
      <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 pt-32 sm:pt-40 pb-12 sm:pb-16">
        <p className="font-mono text-small uppercase tracking-[0.18em] mb-4" style={{ color: '#D2D2DA' }}>
          Die Werkstatt · {articleCount} Artikel · Stuttgart
        </p>
        <h1
          className="font-sans font-black leading-[1.02] tracking-tight mb-4 max-w-3xl"
          style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', textShadow: '0 2px 30px rgba(0,0,0,0.85)' }}
        >
          Frag die Werkstatt.
        </h1>
        <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mb-8" style={{ color: '#D8D8DE', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
          Messwerte, Anleitungen und ehrliche Antworten von jemandem, der jede Woche
          selbst am Wachstopf steht. Frag so, wie du es einem Freund erzählen würdest.
        </p>

        <div className="relative max-w-3xl">
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
            placeholder={placeholder}
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
                ? '0 0 0 3px rgba(var(--accent-rgb),0.45), 0 20px 50px rgba(0,0,0,0.45)'
                : '0 20px 50px rgba(0,0,0,0.45)',
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

        <div className="mt-5 flex flex-wrap items-center gap-2 max-w-3xl">
          <span className="font-mono text-small uppercase tracking-[0.16em] mr-1" style={{ color: '#B4B4BE' }}>
            {recent.length ? 'Zuletzt gesucht' : 'Oft gefragt'}
          </span>
          {chips.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => pick(q)}
              className="text-[13px] px-3.5 py-2 rounded-full transition-colors backdrop-blur hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
