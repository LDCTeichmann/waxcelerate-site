/**
 * Welche Ratgeber-Artikel dieser Besucher schon geoeffnet hat.
 *
 * Nur im eigenen Browser (localStorage), nie an einen Server. Traegt den
 * Lernpfad auf der Uebersicht ("2 von 5 gelesen") und das kleine "Gelesen" auf
 * den Karten. Jeder Zugriff steht in try/catch: im privaten Modus, bei
 * blockierten Websitedaten oder in Vorschau-Umgebungen wirft schon der Zugriff
 * auf localStorage. Die Seite muss dann einfach so aussehen wie fuer einen
 * Erstbesucher, nicht abstuerzen.
 */
import { useSyncExternalStore } from 'react';

const KEY = 'wx-blog-read';
const listeners = new Set<() => void>();
let cache: string | null | undefined;

function readRaw(): string | null {
  if (cache !== undefined) return cache;
  try {
    cache = window.localStorage.getItem(KEY);
  } catch {
    cache = null;
  }
  return cache;
}

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/** Beim Oeffnen eines Artikels aufrufen. */
export function markArticleRead(slug: string) {
  const list = parse(readRaw());
  if (list.includes(slug)) return;
  const next = JSON.stringify([...list, slug]);
  cache = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Nicht speicherbar: gilt dann nur fuer diesen Seitenaufruf.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Rohwert als Snapshot, damit useSyncExternalStore einen stabilen String
 *  vergleicht statt bei jedem Render ein neues Array zu bekommen. */
export function useReadArticles(): Set<string> {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return new Set(parse(raw));
}
