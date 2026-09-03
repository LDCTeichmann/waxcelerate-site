// ── Rechner-Zustand: URL zuerst, dann localStorage ──────────────────────────
//
// Zwei Gruende fuer die URL-Schicht:
//  1. Ein Ergebnis soll teilbar sein — im Forum, in einer Mail, in einer
//     KI-Antwort. Ein Rechner, dessen Ergebnis man nicht verlinken kann, wird
//     nicht zitiert.
//  2. Der Beileger im Paket traegt einen QR-Code auf
//     /rechner/intervall?w=JJJJMMTT. Dieses Format gab es schon in tools.tsx,
//     lag dort aber als private Funktion und war nur auf der Startseite nutzbar.
//
// Rangfolge: was in der URL steht, gewinnt. Sonst das gespeicherte Profil.
// Sonst die Vorgabewerte. Nie geraten — ein unbekannter Wert wird verworfen,
// nicht interpretiert.

import { loadRidingProfile, type PersistedRidingProfile, type Weather, type Terrain, type DriveSystem } from '@/lib/ridingProfile';
import type { ChainSpeed } from '@/lib/waxMath';

export const DEFAULT_PROFILE: PersistedRidingProfile = {
  weather: 'trocken',
  terrain: 'strasse',
  kmPerWeek: 100,
};

// ── Datumshilfen ────────────────────────────────────────────────────────────

export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addWeeks(base: Date, weeks: number): Date {
  const x = new Date(base.getTime());
  x.setDate(x.getDate() + weeks * 7);
  return x;
}

/** Akzeptiert JJJJMMTT und JJJJ-MM-TT, verwirft alles Unplausible. */
export function parseWaxedStamp(raw: string | null): Date | null {
  const s = (raw || '').trim();
  if (!s) return null;
  let y = 0, mo = 0, day = 0;
  if (/^\d{8}$/.test(s)) {
    y = Number(s.slice(0, 4)); mo = Number(s.slice(4, 6)); day = Number(s.slice(6, 8));
  } else {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    y = Number(m[1]); mo = Number(m[2]); day = Number(m[3]);
  }
  const dt = new Date(y, mo - 1, day);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== day) return null;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dt < new Date(2020, 0, 1) || dt > today) return null;
  return dt;
}

/**
 * Der naechste Wachstermin und ob er schon verstrichen ist.
 *
 * Ohne die Ueberfaelligkeitspruefung zeigt ein per QR oder Link gesetztes
 * Wachsdatum von vor sechs Wochen unter der Ueberschrift „Naechstes Waxen"
 * seelenruhig ein Datum in der Vergangenheit an — die Antwort lautet dann aber
 * nicht „am 22. August", sondern „ueberfaellig".
 */
export function dueDate(lastWaxed: Date | null, weeks: number): {
  date: Date;
  overdue: boolean;
  /** Volle Wochen bis zum Termin. Negativ, wenn er verstrichen ist. */
  weeksLeft: number;
  /** Tage bis zum Termin, fuer die Feinausgabe unter einer Woche. */
  daysLeft: number;
} {
  const date = addWeeks(lastWaxed ?? new Date(), weeks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysLeft = Math.round((start.getTime() - today.getTime()) / 86400000);
  return { date, overdue: daysLeft < 0, weeksLeft: Math.floor(daysLeft / 7), daysLeft };
}

// ── URL-Schicht ─────────────────────────────────────────────────────────────

export interface ToolProfile extends PersistedRidingProfile {
  lastWaxedDate: Date | null;
}

const WEATHERS: Weather[] = ['trocken', 'gemischt', 'nass'];
const TERRAINS: Terrain[] = ['strasse', 'gravel', 'mtb'];
const SYSTEMS: DriveSystem[] = ['shimano', 'sram', 'campagnolo'];
const SPEEDS: ChainSpeed[] = [8, 9, 10, 11, 12];

function pick<T>(allowed: readonly T[], raw: string | null): T | undefined {
  return allowed.find(v => String(v) === raw);
}

/**
 * Liest das Profil aus einer Query. Fehlende oder unbekannte Werte fallen auf
 * `fallback` zurueck, damit ein halb ausgefuellter Link trotzdem funktioniert.
 */
export function profileFromQuery(search: string, fallback: PersistedRidingProfile): ToolProfile {
  const q = new URLSearchParams(search);
  const km = Number(q.get('km'));
  return {
    weather: pick(WEATHERS, q.get('wt')) ?? fallback.weather,
    terrain: pick(TERRAINS, q.get('tr')) ?? fallback.terrain,
    kmPerWeek: Number.isFinite(km) && km > 0 && km <= 1000 ? Math.round(km) : fallback.kmPerWeek,
    system: pick(SYSTEMS, q.get('sys')) ?? fallback.system,
    speed: pick(SPEEDS, q.get('sp')) ?? fallback.speed,
    // 'w' und 'waxed' sind beide erlaubt, weil der bestehende QR-Link 'w' nutzt.
    lastWaxedDate: parseWaxedStamp(q.get('w') || q.get('waxed')),
  };
}

/** Umgekehrter Weg: Profil in eine Query, fuer den teilbaren Link. */
export function queryFromProfile(p: ToolProfile): string {
  const q = new URLSearchParams();
  q.set('wt', p.weather);
  q.set('tr', p.terrain);
  q.set('km', String(p.kmPerWeek));
  if (p.system) q.set('sys', p.system);
  if (p.speed) q.set('sp', String(p.speed));
  if (p.lastWaxedDate) q.set('w', isoDate(p.lastWaxedDate).replace(/-/g, ''));
  return q.toString();
}

/** Startwerte: URL schlaegt localStorage schlaegt Vorgabe. */
export function initialProfile(): ToolProfile {
  const stored = (typeof window !== 'undefined' && loadRidingProfile()) || DEFAULT_PROFILE;
  if (typeof window === 'undefined') return { ...stored, lastWaxedDate: null };
  const hashQuery = (window.location.hash || '').replace(/^#[^?]*\??/, '');
  return profileFromQuery(window.location.search || `?${hashQuery}`, stored);
}

export function shareUrl(path: string, p: ToolProfile): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://waxcelerate.de';
  return `${origin}${path}?${queryFromProfile(p)}`;
}
