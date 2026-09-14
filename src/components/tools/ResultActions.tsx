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
// Auf den /rechner-Seiten stehen die drei Kalender beschriftet nebeneinander,
// dazu der Serien-Schalter mit Terminzahl und Rhythmus — vorher steckten Apple
// und Outlook hinter einem unbeschrifteten Pfeil. Im Kartenstapel (`compact`,
// feste Kartenhoehe) bleibt es beim Symbol fuer Google plus Menue.

import { useState } from 'react';
import { CalendarPlus, ChevronDown, Download, Link2, Check, Share2 } from 'lucide-react';
import {
  googleCalendarUrl, outlookCalendarUrl, downloadIcs, reminderCount, type ReminderEvent,
} from '@/lib/calendarLinks';
import { useLanguage } from '@/hooks/useLanguage';
import { InfoPopover } from '@/components/tools/primitives';

const ACTION_CLASS =
  'flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-[12px] font-medium transition-opacity hover:opacity-70 active:opacity-50 cursor-pointer';
const ACTION_STYLE: React.CSSProperties = {
  background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)', color: 'var(--tx2)',
};
const MENU_ITEM = 'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer';

export function ResultActions({ event, shareUrl: url, compact, repeatLabel }: {
  event?: ReminderEvent; shareUrl?: string; compact?: boolean;
  /** Rhythmus in Worten („alle 5 Tage") fuer den Serien-Schalter. */
  repeatLabel?: string;
}) {
  const { t } = useLanguage();
  const s = t.tools.shared;
  const [copied, setCopied] = useState(false);
  // Rewax ist zyklisch, also standardmaessig eine Serie.
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
      // Zwischenablage verweigert — dann bleibt der Knopf unveraendert stehen.
    }
  };

  const evt: ReminderEvent | undefined = event
    ? (repeat ? event : { ...event, repeatDays: 0 })
    : undefined;

  const seriesToggle = event?.repeatDays ? (
    <label className="flex items-center justify-between gap-2 text-[12px] cursor-pointer" style={{ color: 'var(--txm)' }}>
      <span>{s.calSeries.replace('{n}', String(reminderCount(event.repeatDays))).replace('{rhythm}', repeatLabel ?? '')}</span>
      <input
        type="checkbox"
        checked={repeat}
        onChange={e => setRepeat(e.target.checked)}
        className="h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--accent)]"
      />
    </label>
  ) : null;

  const shareButton = url && (
    <button
      type="button"
      onClick={share}
      className={`${ACTION_CLASS} ${compact ? 'px-2.5 flex-shrink-0' : 'flex-1 min-w-[7.5rem]'}`}
      style={ACTION_STYLE}
      aria-label={compact ? (canShare ? s.share : s.copyLink) : undefined}
      title={compact ? (canShare ? s.share : s.copyLink) : undefined}
    >
      {copied
        ? <Check className="h-3.5 w-3.5 flex-shrink-0" />
        : canShare
          ? <Share2 className="h-3.5 w-3.5 flex-shrink-0" />
          : <Link2 className="h-3.5 w-3.5 flex-shrink-0" />}
      {!compact && (
        <span className="whitespace-nowrap">
          {copied ? s.copied : canShare ? s.share : s.copyLink}
        </span>
      )}
    </button>
  );

  if (!compact) {
    return (
      <div className="flex flex-col gap-2">
        {evt && (
          <div className="flex flex-col gap-2 rounded-xl p-2.5" style={{ border: '1px solid var(--inset-bd)' }}>
            <span className="text-meta uppercase tracking-[0.1em] font-semibold flex items-center gap-1.5" style={{ color: 'var(--tx2)' }}>
              <CalendarPlus className="h-3.5 w-3.5" />{s.calHead}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <a href={googleCalendarUrl(evt)} target="_blank" rel="noopener noreferrer" className={ACTION_CLASS} style={ACTION_STYLE}>
                {s.calGoogle}
              </a>
              <button type="button" onClick={() => downloadIcs(evt)} className={ACTION_CLASS} style={ACTION_STYLE}>
                <Download className="h-3.5 w-3.5 flex-shrink-0" />{s.calApple}
              </button>
              <a href={outlookCalendarUrl(evt)} target="_blank" rel="noopener noreferrer" className={ACTION_CLASS} style={ACTION_STYLE}
                title={repeat ? s.calOutlookNote : undefined}>
                {s.calOutlook}
              </a>
            </div>
            {seriesToggle}
          </div>
        )}
        {shareButton && <div className="flex">{shareButton}</div>}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      {evt && (
        <div className="flex flex-shrink-0">
          {/* Haupt-Tap: direkt in Google Calendar */}
          <a
            href={googleCalendarUrl(evt)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ACTION_CLASS} rounded-r-none px-2.5`}
            style={{ ...ACTION_STYLE, borderRight: 'none' }}
            aria-label={s.addGoogle}
            title={s.addGoogle}
          >
            <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />
          </a>
          <InfoPopover
            ariaLabel={s.calMore}
            align="right"
            trigger={open => (
              <span
                className="flex items-center justify-center rounded-r-xl px-2 h-full"
                style={{ ...ACTION_STYLE, color: open ? 'var(--brand)' : 'var(--tx2)' }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            )}
          >
            <span className="text-meta uppercase tracking-[0.1em] font-semibold" style={{ color: 'var(--tx2)' }}>{s.calHead}</span>
            <div className="flex flex-col gap-0.5">
              <a href={googleCalendarUrl(evt)} target="_blank" rel="noopener noreferrer" className={MENU_ITEM} style={{ color: 'var(--tx2)' }}>
                <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />{s.addGoogle}
              </a>
              <button type="button" onClick={() => downloadIcs(evt)} className={MENU_ITEM} style={{ color: 'var(--tx2)' }}>
                <Download className="h-3.5 w-3.5 flex-shrink-0" />{s.addIcs}
              </button>
              <a href={outlookCalendarUrl(evt)} target="_blank" rel="noopener noreferrer" className={MENU_ITEM} style={{ color: 'var(--tx2)' }}>
                <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />{s.addOutlook}
              </a>
            </div>
            {seriesToggle}
            {repeat && <span className="text-[11px]" style={{ color: 'var(--txf)' }}>{s.calOutlookNote}</span>}
          </InfoPopover>
        </div>
      )}
      {shareButton}
    </div>
  );
}
