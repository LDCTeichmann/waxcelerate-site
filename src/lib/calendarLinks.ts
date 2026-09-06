// ── Termin mitnehmen, ohne Anmeldung ────────────────────────────────────────
//
// Das Rewax-Datum ist das einzige Ergebnis der Rechner, mit dem man ausserhalb
// der Seite etwas anfangen kann. Bisher verschwand es beim Verlassen der Seite.
//
// Bewusst ohne OAuth und ohne Backend: Google nimmt einen fertigen
// Template-Link entgegen, und .ics ist ein reiner Text-Blob. Damit verlaesst
// kein Datum den Browser, es gibt nichts einzuwilligen und nichts zu speichern.

function stampUTC(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`
  );
}

/** Ganztaegig, also YYYYMMDD ohne Zeitanteil. */
function stampDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

export interface ReminderEvent {
  /** Tag des Termins. Der Eintrag wird ganztaegig angelegt. */
  date: Date;
  title: string;
  description: string;
  /** Wiederholung alle n Wochen. 0 oder undefiniert = einmaliger Termin. */
  repeatWeeks?: number;
  /**
   * Wie oft die Wiederholung laeuft. Ohne Angabe: 8 Termine. Eine
   * Rewax-Erinnerung ohne Ende steht sonst fuer immer im Kalender, obwohl das
   * Intervall sich mit Fahrprofil und Jahreszeit ohnehin aendert.
   */
  repeatCount?: number;
  /** Link, der im Termin hinterlegt wird — der teilbare Ergebnis-Link. */
  url?: string;
}

/** RRULE-Wert (ohne "RRULE:"-Praefix) fuer eine woechentliche Wiederholung. */
function rrule(ev: ReminderEvent): string | null {
  if (!ev.repeatWeeks || ev.repeatWeeks <= 0) return null;
  const count = ev.repeatCount && ev.repeatCount > 0 ? ev.repeatCount : 8;
  return `FREQ=WEEKLY;INTERVAL=${ev.repeatWeeks};COUNT=${count}`;
}

/**
 * Google-Calendar-Template-URL. `dates` ist bei ganztaegigen Terminen
 * Start/Ende als reine Daten, wobei das Ende exklusiv ist — deshalb +1 Tag.
 */
export function googleCalendarUrl(ev: ReminderEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${stampDate(ev.date)}/${stampDate(addDays(ev.date, 1))}`,
    details: ev.url ? `${ev.description}\n\n${ev.url}` : ev.description,
  });
  const rule = rrule(ev);
  if (rule) {
    // Nicht ueber URLSearchParams: Google erwartet den RRULE-Wert mit
    // unkodiertem Doppelpunkt nach "RRULE".
    return `https://calendar.google.com/calendar/render?${params.toString()}&recur=${encodeURIComponent(
      `RRULE:${rule}`,
    )}`;
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Outlook (Web) — Compose-Deeplink. Deckt Microsoft-365- und Outlook.com-Konten
 * ab; ohne Konto landet man auf der Anmeldung und danach im vorbefuellten Termin.
 * Keine Wiederholung: der Compose-Deeplink nimmt kein RRULE entgegen, die .ics
 * ist dafuer der Weg.
 */
export function outlookCalendarUrl(ev: ReminderEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: ev.title,
    body: ev.url ? `${ev.description}\n\n${ev.url}` : ev.description,
    startdt: isoDay(ev.date),
    enddt: isoDay(addDays(ev.date, 1)),
    allday: 'true',
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/** YYYY-MM-DD in lokaler Zeit. */
function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Zeilen nach RFC 5545 falten und Sonderzeichen maskieren. */
function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * .ics fuer Apple Kalender, Outlook und alles andere. Mit VALARM einen Tag
 * vorher, weil ein Rewax-Termin ohne Vorlauf nichts nuetzt.
 */
export function icsContent(ev: ReminderEvent): string {
  const uid = `${stampDate(ev.date)}-${Math.random().toString(36).slice(2, 10)}@waxcelerate.de`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Waxcelerate//Rechner//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampUTC(new Date())}`,
    `DTSTART;VALUE=DATE:${stampDate(ev.date)}`,
    `DTEND;VALUE=DATE:${stampDate(addDays(ev.date, 1))}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    `DESCRIPTION:${icsEscape(ev.description)}`,
    ...(ev.url ? [`URL:${ev.url}`] : []),
    ...(rrule(ev) ? [`RRULE:${rrule(ev)}`] : []),
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(ev.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/** Loest den Download aus. Nur im Browser aufrufen. */
export function downloadIcs(ev: ReminderEvent, filename = 'waxcelerate-rewax.ics'): void {
  const blob = new Blob([icsContent(ev)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
