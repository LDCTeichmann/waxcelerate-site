// ─── Rückgabe-Fenster: „Heute eingeworfen → zurück ca. Di 23.–Do 25.9." ─────
// Rechnet aus dem Einwurftag das Fenster, in dem die Kette wieder im
// Briefkasten liegt: Post zu uns 1–2 Werktage, Bearbeitung TURNAROUND.days
// (Ankunftstag zählt nicht mit), Post zurück 1–2 Werktage → 5–7 Werktage.
//
// Werktage hier bewusst Mo–Fr, obwohl die Post samstags zustellt: lieber
// einen Tag früher da als versprochen. Feiertage lokal berechnet (keine API):
// Hinweg und Bearbeitung zählen nach Baden-Württemberg (wir sitzen in
// Stuttgart), Einwurf und Rückweg nach dem Bundesland des Kunden.
//
// REINE FUNKTIONEN — kein React, auch im Prerender nutzbar.

import { TURNAROUND } from './content';

export type State =
  | 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH' | 'HE' | 'MV'
  | 'NI' | 'NW' | 'RP' | 'SL' | 'SN' | 'ST' | 'SH' | 'TH';

export const HOME_STATE: State = 'BW';
/** Nach dieser Stunde zählt der Einwurf erst ab dem nächsten Werktag. */
const CUTOFF_HOUR = 17;

// Ostersonntag (Gauß/Anonymous Gregorian).
function easter(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const plus = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const cache = new Map<string, Set<string>>();
function holidays(y: number, s: State): Set<string> {
  const ck = `${y}${s}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const E = easter(y);
  const on = (...states: State[]) => states.includes(s);
  const days: Date[] = [
    new Date(y, 0, 1), plus(E, -2), plus(E, 1), new Date(y, 4, 1), plus(E, 39), plus(E, 50),
    new Date(y, 9, 3), new Date(y, 11, 25), new Date(y, 11, 26),
  ];
  if (on('BW', 'BY', 'ST')) days.push(new Date(y, 0, 6));
  if (on('BE', 'MV')) days.push(new Date(y, 2, 8));
  if (on('BW', 'BY', 'HE', 'NW', 'RP', 'SL')) days.push(plus(E, 60));
  // Mariä Himmelfahrt: in Bayern nur in katholisch geprägten Gemeinden —
  // hier nur fürs Saarland, wo sie landesweit gilt.
  if (on('SL')) days.push(new Date(y, 7, 15));
  if (on('TH')) days.push(new Date(y, 8, 20));
  if (on('BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH')) days.push(new Date(y, 9, 31));
  if (on('BW', 'BY', 'NW', 'RP', 'SL')) days.push(new Date(y, 10, 1));
  if (on('SN')) {
    // Buß- und Bettag: Mittwoch vor dem 23. November.
    let d = new Date(y, 10, 22);
    while (d.getDay() !== 3) d = plus(d, -1);
    days.push(d);
  }
  const set = new Set(days.map(key));
  cache.set(ck, set);
  return set;
}

export function isWorkday(d: Date, s: State): boolean {
  const wd = d.getDay();
  return wd !== 0 && wd !== 6 && !holidays(d.getFullYear(), s).has(key(d));
}

/** n Werktage nach d (d selbst zählt nicht). */
export function addWorkdays(d: Date, n: number, s: State): Date {
  let out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let left = n;
  while (left > 0) {
    out = plus(out, 1);
    if (isWorkday(out, s)) left--;
  }
  return out;
}

/** Früheste und späteste Rückkehr für eine Kette, die `now` eingeworfen wird. */
export function returnWindow(now: Date, customer: State = HOME_STATE) {
  // Einwurftag: heute, wenn Werktag und vor der Leerung, sonst der nächste.
  let posted = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!isWorkday(posted, customer) || now.getHours() >= CUTOFF_HOUR) posted = addWorkdays(posted, 1, customer);

  const leg = (arrive: number, back: number) => {
    const atUs = addWorkdays(posted, arrive, HOME_STATE);
    const shipped = addWorkdays(atUs, TURNAROUND.days, HOME_STATE);
    return addWorkdays(shipped, back, customer);
  };
  return { posted, earliest: leg(1, 1), latest: leg(2, 2) };
}

/** „Di 23.–Do 25.9." bzw. „Tue 23 – Thu 25 Sep". */
export function formatWindow(w: { earliest: Date; latest: Date }, de: boolean): string {
  const loc = de ? 'de-DE' : 'en-GB';
  const wd = (d: Date) => d.toLocaleDateString(loc, { weekday: 'short' }).replace('.', '');
  const sameMonth = w.earliest.getMonth() === w.latest.getMonth();
  if (de) {
    const a = `${wd(w.earliest)} ${w.earliest.getDate()}.${sameMonth ? '' : `${w.earliest.getMonth() + 1}.`}`;
    return `${a}–${wd(w.latest)} ${w.latest.getDate()}.${w.latest.getMonth() + 1}.`;
  }
  // en-US, weil en-GB „Sept" schreibt.
  const mon = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  return `${wd(w.earliest)} ${w.earliest.getDate()}${sameMonth ? '' : ` ${mon(w.earliest)}`} – ${wd(w.latest)} ${w.latest.getDate()} ${mon(w.latest)}`;
}
