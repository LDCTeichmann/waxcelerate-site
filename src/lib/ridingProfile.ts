// ── Riding profile persistence ──────────────────────────────────────────────
// Lets the rewax calculator's inputs (tools.tsx) survive across page loads,
// and lets the product detail page read them (read-only) to show a
// personalized "this block lasts you ~X weeks" line. This is the first
// JSON-serialized localStorage value in the codebase (wx-theme/wx-lang are
// bare strings) — the parse/shape guard below is deliberately conservative:
// anything unexpected is treated as "no profile", never as a guess.

import type { Product } from '@/lib/data';
import { applicationsPerBlock, waxIntervals, type ChainSpeed } from '@/lib/waxMath';

export type Weather = 'trocken' | 'gemischt' | 'nass';
export type Terrain = 'strasse' | 'gravel' | 'mtb';

export interface PersistedRidingProfile {
  weather: Weather;
  terrain: Terrain;
  kmPerWeek: number;
  /** Antriebshersteller — erst mit den Rechnern /rechner hinzugekommen. */
  system?: DriveSystem;
  /** Gangzahl hinten. Optional aus demselben Grund. */
  speed?: ChainSpeed;
}

export type DriveSystem = 'shimano' | 'sram' | 'campagnolo';

function isSystem(v: unknown): v is DriveSystem {
  return v === 'shimano' || v === 'sram' || v === 'campagnolo';
}

function isSpeed(v: unknown): v is ChainSpeed {
  return v === 8 || v === 9 || v === 10 || v === 11 || v === 12;
}

const STORAGE_KEY = 'wx-riding-profile';

function isWeather(v: unknown): v is Weather {
  return v === 'trocken' || v === 'gemischt' || v === 'nass';
}

function isTerrain(v: unknown): v is Terrain {
  return v === 'strasse' || v === 'gravel' || v === 'mtb';
}

export function loadRidingProfile(): PersistedRidingProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.kmPerWeek === 'number' && isWeather(parsed.weather) && isTerrain(parsed.terrain)) {
      return {
        weather: parsed.weather,
        terrain: parsed.terrain,
        kmPerWeek: parsed.kmPerWeek,
        // Bewusst nicht Teil der Gueltigkeitspruefung: Profile, die vor den
        // Rechnern gespeichert wurden, haben diese Felder nicht und muessen
        // trotzdem weiter geladen werden.
        ...(isSystem(parsed.system) ? { system: parsed.system } : {}),
        ...(isSpeed(parsed.speed) ? { speed: parsed.speed } : {}),
      };
    }
    return null; // malformed/outdated shape — never guess
  } catch {
    return null; // localStorage unavailable (Safari private mode, quota, ...) or corrupt JSON
  }
}

export function saveRidingProfile(profile: PersistedRidingProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* best-effort only */ }
}

// Wie lange ein Block bei diesem Fahrprofil reicht, in Wochen.
//
// Rechnet seit der Rechner-Vereinheitlichung ueber waxMath.applicationsPerBlock
// statt ueber eine eigene Parse-Logik. Vorher stand hier ausdruecklich, dass das
// Ergebnis von den Rechnern in tools.tsx abweichen darf, weil dort zwei weitere,
// untereinander widerspruechliche Konstanten lagen (WAX_PER_REWAX, APPS_PER_BLOCK).
// Diese Konstanten gibt es nicht mehr; alle Stellen rechnen jetzt gleich.
export function weeksRemainingForProduct(
  product: Product,
  profile: PersistedRidingProfile,
): number | null {
  if (profile.kmPerWeek <= 0) return null;
  const apps = applicationsPerBlock(product);
  if (!apps) return null;
  const kmPerRewax = waxIntervals[profile.weather][profile.terrain];
  const weeks = Math.round((apps * kmPerRewax) / profile.kmPerWeek);
  return Number.isFinite(weeks) && weeks > 0 ? weeks : null;
}
