/**
 * React-Anbindung der Ratgeber-Suche.
 *
 * Zwei Dinge loest dieser Hook, die sonst in der Seite verteilt landen wuerden:
 *
 * 1. NACHLADEN. Der Suchindex ist rund 120 kB (unkomprimiert) und wird von den
 *    allermeisten Besuchern nie gebraucht — die klicken eine Kachel an. Er
 *    wird deshalb erst geholt, wenn jemand das Suchfeld beruehrt oder mit einem
 *    ?q= in der URL ankommt. Bis dahin kostet die Suche null Bytes.
 * 2. UEBERGANG. Zwischen erstem Tastendruck und fertigem Index vergehen ein
 *    paar hundert Millisekunden. In dieser Zeit gibt der Hook `null` zurueck
 *    und die Seite faellt auf ihre einfache Substring-Suche zurueck, statt
 *    "keine Treffer" zu behaupten. Der Nutzer merkt vom Umschalten nichts.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createIndex, search } from './engine';
import type { SearchEngine, SearchHit, SearchIndexPayload } from './engine';

/** Aufbereitung nur einmal pro Seitenaufruf, nicht pro Komponente. */
let enginePromise: Promise<SearchEngine> | null = null;

function loadEngine(): Promise<SearchEngine> {
  if (!enginePromise) {
    enginePromise = fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`search-index.json: HTTP ${res.status}`);
        return res.json() as Promise<SearchIndexPayload>;
      })
      .then(createIndex)
      .catch((err) => {
        // Zuruecksetzen, damit ein spaeterer Versuch es noch einmal probiert
        // (typischer Fall: kurzer Netzaussetzer auf dem Handy).
        enginePromise = null;
        throw err;
      });
  }
  return enginePromise;
}

export type ArticleSearchState = 'idle' | 'loading' | 'ready' | 'error';

/** Wartezeit nach dem letzten Tastendruck. 120 ms ist der Bereich, in dem es
 *  sich noch unmittelbar anfuehlt, aber beim fluessigen Tippen nicht nach
 *  jedem Buchstaben neu gerankt wird. */
const DEBOUNCE_MS = 120;

export function useArticleSearch(query: string) {
  const [engine, setEngine] = useState<SearchEngine | null>(null);
  const [state, setState] = useState<ArticleSearchState>('idle');
  const [debounced, setDebounced] = useState(query);
  const wanted = useRef(false);

  /** Index anfordern. Mehrfach aufrufbar, laedt trotzdem nur einmal. */
  const prefetch = useCallback(() => {
    if (wanted.current) return;
    wanted.current = true;
    setState((s) => (s === 'ready' ? s : 'loading'));
    loadEngine().then(
      (loaded) => { setEngine(loaded); setState('ready'); },
      () => setState('error'),
    );
  }, []);

  // Wer mit ?q=... in der URL ankommt (geteilter Link, Lesezeichen), will
  // sofort Ergebnisse sehen und hat nie ins Feld getippt.
  useEffect(() => { if (query.trim().length >= 2) prefetch(); }, [query, prefetch]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  /** `null` heisst: noch keine Aussage moeglich, bitte Fallback benutzen.
   *  Ein leeres Array heisst dagegen: gesucht, nichts gefunden. */
  const hits = useMemo<SearchHit[] | null>(() => {
    if (!engine) return null;
    const q = debounced.trim();
    if (q.length < 2) return null;
    return search(engine, q);
  }, [engine, debounced]);

  return { hits, state, prefetch };
}
