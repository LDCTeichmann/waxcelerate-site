// ── Das Ergebnis mitnehmen ──────────────────────────────────────────────────
//
// Bisher endete jeder Rechner mit einer Zahl, die beim Verlassen der Seite
// verschwand. Das Rewax-Datum ist aber genau die Art Ergebnis, mit der man
// ausserhalb der Seite etwas anfangen kann.
//
// Bewusst ohne Anmeldung: Google und Outlook nehmen einen fertigen
// Template-Link entgegen, .ics ist ein Text-Blob im Browser. Es gibt nichts
// einzuwilligen, nichts zu speichern, und kein Datum verlaesst das Geraet.
//
// Ein Tap fuer den Normalfall: der Haupt-Button legt den Termin direkt in
// Google Calendar an. Apple/Outlook und der Rhythmus-Schalter stecken hinter
// dem kleinen Aufklapp-Pfeil daneben — sichtbar, aber nicht im Weg. Die
// Aktionszeile bleibt einzeilig (feste Kartenhoehe im Deck, ToolTrack.tsx).

import { useState } from 'react';
import { CalendarPlus, ChevronDown, Download, Link2, Check, Share2 } from 'lucide-react';
import { googleCalendarUrl, outlookCalendarUrl, downloadIcs, type ReminderEvent } from '@/lib/calendarLinks';
import { useLanguage } from '@/hooks/useLanguage';
import { InfoPopover } from '@/components/tools/primitives';

const ACTION_CLASS =
  'flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-[12px] font-medium transition-opacity hover:opacity-70 active:opacity-50 cursor-pointer';
const ACTION_STYLE: React.CSSProperties = {
  background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)', color: 'var(--tx2)',
};

export function ResultActions({ event, shareUrl: url }: { event?: ReminderEvent; shareUrl?: string }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const [copied, setCopied] = useState(false);
  // Rewax ist zyklisch, also standardmaessig eine Serie. Wer nur einen Termin
  // will, schaltet hier auf einmalig.
  const [repeat, setRepeat] = useState(true);

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const share = async () => {
    if (!url) return;
    if (canShare) {
      try {
        await navigator.share({ title: 'Waxcelerate', url });
      } catch {
        // Abbruch durch die Nutzerin ist kein Fehler — still bleiben.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Zwischenablage verweigert (kein sicherer Kontext, Berechtigung
      // abgelehnt) — dann bleibt der Knopf einfach unveraendert stehen.
    }
  };

  const evt: ReminderEvent | undefined = event
    ? (repeat ? event : { ...event, repeatWeeks: 0 })
    : undefined;

  return (
    <div className="flex flex-wrap gap-2">
      {evt && (
        <div className="flex flex-1 min-w-[8.5rem]">
          {/* Haupt-Tap: direkt in Google Calendar */}
          <a
            href={googleCalendarUrl(evt)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ACTION_CLASS} flex-1 rounded-r-none`}
            style={{ ...ACTION_STYLE, borderRight: 'none' }}
          >
            <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{t.tools.shared.addGoogle}</span>
          </a>
          {/* Aufklapp: Apple/Outlook + Rhythmus */}
          <InfoPopover
            ariaLabel={de ? 'Weitere Kalender-Optionen' : 'More calendar options'}
            align="right"
            trigger={open => (
              <span
                className="flex items-center justify-center rounded-r-xl px-2 h-full"
                style={{
                  ...ACTION_STYLE,
                  color: open ? 'var(--brand)' : 'var(--tx2)',
                }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            )}
          >
            <label className="flex items-center justify-between gap-2 text-[12px]" style={{ color: 'var(--txm)' }}>
              <span>{de ? `Wiederholen (alle ${event!.repeatWeeks ?? 0} Wochen)` : `Repeat (every ${event!.repeatWeeks ?? 0} weeks)`}</span>
              <input
                type="checkbox"
                checked={repeat}
                onChange={e => setRepeat(e.target.checked)}
                className="h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--accent)]"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => downloadIcs(evt)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: 'var(--tx2)' }}
              >
                <Download className="h-3.5 w-3.5 flex-shrink-0" />{t.tools.shared.addIcs}
              </button>
              <a
                href={outlookCalendarUrl(evt)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--tx2)' }}
              >
                <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />{t.tools.shared.addOutlook}
              </a>
            </div>
          </InfoPopover>
        </div>
      )}
      {url && (
        <button
          type="button"
          onClick={share}
          className={`${ACTION_CLASS} flex-1 min-w-[7.5rem]`}
          style={ACTION_STYLE}
        >
          {copied
            ? <Check className="h-3.5 w-3.5 flex-shrink-0" />
            : canShare
              ? <Share2 className="h-3.5 w-3.5 flex-shrink-0" />
              : <Link2 className="h-3.5 w-3.5 flex-shrink-0" />}
          <span className="whitespace-nowrap">
            {copied ? t.tools.shared.copied : canShare ? t.tools.shared.share : t.tools.shared.copyLink}
          </span>
        </button>
      )}
    </div>
  );
}
