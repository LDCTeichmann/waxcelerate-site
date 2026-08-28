// ── Riding profile persistence ──────────────────────────────────────────────
// Lets the rewax calculator's inputs (tools.tsx) survive across page loads,
// and lets the product detail page read them (read-only) to show a
// personalized "this block lasts you ~X weeks" line. This is the first
// JSON-serialized localStorage value in the codebase (wx-theme/wx-lang are
// bare strings) — the parse/shape guard below is deliberately conservative:
// anything unexpected is treated as "no profile", never as a guess.

export type Weather = 'trocken' | 'gemischt' | 'nass';
export type Terrain = 'strasse' | 'gravel' | 'mtb';

export interface PersistedRidingProfile {
  weather: Weather;
  terrain: Terrain;
  kmPerWeek: number;
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
      return { weather: parsed.weather, terrain: parsed.terrain, kmPerWeek: parsed.kmPerWeek };
    }
    return null; // malformed/outdated shape — never guess
  } catch {
    return null; // localStorage unavailable (Safari private mode, quota, ...) or corrupt JSON
  }
}

export function saveRidingProfile(profile: PersistedRidingProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* best-effort only */ }
}

// Independent of tools.tsx's own two calculators (WaxStockCalculator's
// WAX_PER_REWAX, RotationAndSavings' APPS_PER_BLOCK) by design — those are
// mutually inconsistent hardcoded constants that don't read real per-product
// data. This uses each product's actual `applications` range (data.ts, e.g.
// '20–32') directly instead, so the result may not exactly match either
// calculator's own numbers for the same inputs — an accepted tradeoff of
// keeping this independent rather than reconciling three calculations at
// once.
export function weeksRemainingForProduct(
  applications: string | undefined,
  waxIntervals: Record<string, Record<string, number>>,
  profile: PersistedRidingProfile,
): number | null {
  if (!applications || profile.kmPerWeek <= 0) return null;
  const [lo, hi] = applications.split(/[–-]/).map(n => parseInt(n.trim(), 10));
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  const totalApplications = (lo + hi) / 2;
  const kmPerRewax = waxIntervals[profile.weather][profile.terrain];
  const weeks = Math.round((totalApplications * kmPerRewax) / profile.kmPerWeek);
  return Number.isFinite(weeks) && weeks > 0 ? weeks : null;
}
