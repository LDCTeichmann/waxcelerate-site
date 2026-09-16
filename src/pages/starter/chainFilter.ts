// ─── Kettenfilter für die Set-Kaufbox ───────────────────────────────────────
// Dieselbe Logik wie /ketten (KettenPage.tsx): Gangzahl über chainSpeed,
// Antrieb über compatibilityMatrix. Empfehlung zuerst, dann nach Preis.

import { products, compatibilityMatrix } from '@/lib/data';
import { loadRidingProfile, type DriveSystem } from '@/lib/ridingProfile';
import { DEFAULT_CHAIN } from '@/pages/starter/content';

export type FilterSpeed = 9 | 11 | 12;

const chains = products.filter((p) => p.category === 'chain');

export function chainsFor(system?: DriveSystem, speed?: FilterSpeed) {
  const allowed = system
    ? new Set((speed ? [String(speed)] : ['9', '11', '12']).flatMap((s) => compatibilityMatrix[system]?.[s] ?? []))
    : null;
  return chains
    .filter((p) => !speed || p.chainSpeed === `${speed}-fach`)
    .filter((p) => !allowed || allowed.has(p.id))
    .sort((a, b) => (a.id === DEFAULT_CHAIN ? -1 : b.id === DEFAULT_CHAIN ? 1 : a.price - b.price));
}

export const asFilterSpeed = (v: unknown): FilterSpeed | undefined =>
  v === 9 || v === 11 || v === 12 ? v : undefined;

/** Erste Kette, die zum gespeicherten Fahrprofil passt, sonst die Empfehlung. */
export function preferredChainId(): string {
  if (typeof window === 'undefined') return DEFAULT_CHAIN;
  const p = loadRidingProfile();
  return chainsFor(p?.system, asFilterSpeed(p?.speed))[0]?.id ?? DEFAULT_CHAIN;
}
