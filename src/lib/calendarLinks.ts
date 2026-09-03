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
  /** Link, der im Termin hinterlegt wird — der teilbare Ergebnis-Link. */
  url?: string;
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
  if (ev.repeatWeeks && ev.repeatWeeks > 0) {
    // Nicht ueber URLSearchParams: Google erwartet den RRULE-Wert mit
    // unkodiertem Doppelpunkt nach "RRULE".
    return `https://calendar.google.com/calendar/render?${params.toString()}&recur=${encodeURIComponent(
      `RRULE:FREQ=WEEKLY;INTERVAL=${ev.repeatWeeks}`,
    )}`;
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
    ...(ev.repeatWeeks && ev.repeatWeeks > 0
      ? [`RRULE:FREQ=WEEKLY;INTERVAL=${ev.repeatWeeks}`]
      : []),
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
