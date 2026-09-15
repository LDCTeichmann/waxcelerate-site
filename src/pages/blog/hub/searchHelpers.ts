/**
 * Kleine, geteilte Helfer der Ratgeber-Suche, die keine Komponenten sind.
 * Eigene Datei, damit die Komponentendateien nur Komponenten exportieren
 * (sonst verliert Vite beim Bearbeiten den Hot-Reload-Zustand).
 */
import type { SearchHit } from '@/lib/search/engine';

/** Ziel eines Treffers: direkt in den Abschnitt, wenn es einen gibt. */
export function hitUrl(hit: Pick<SearchHit, 'slug' | 'section'>): string {
  return `/blog/${hit.slug}${hit.section?.id ? `#${hit.section.id}` : ''}`;
}

const RECENT_KEY = 'wx-blog-recent';

/** Letzte Suchen, nur in diesem Browser. Jeder Zugriff in try/catch: im
 *  privaten Modus oder bei blockierten Websitedaten wirft schon der Zugriff. */
export function loadRecentSearches(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').slice(0, 4) : [];
  } catch {
    return [];
  }
}

/** Nur Suchen merken, die zu einem Klick gefuehrt haben: halb getippte
 *  Zwischenstaende ("kett") waeren als Vorschlag nutzlos. */
export function saveRecentSearch(query: string) {
  const q = query.trim();
  if (q.length < 3) return;
  try {
    const next = [q, ...loadRecentSearches().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 4);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Nicht speicherbar: dann eben ohne Verlauf.
  }
}

/** Beobachtet, ob der Nutzer reduzierte Bewegung wuenscht. */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
