// ── Das Ergebnis mitnehmen ──────────────────────────────────────────────────
//
// Bisher endete jeder Rechner mit einer Zahl, die beim Verlassen der Seite
// verschwand. Das Rewax-Datum ist aber genau die Art Ergebnis, mit der man
// ausserhalb der Seite etwas anfangen kann.
//
// Bewusst ohne Anmeldung: Google nimmt einen fertigen Template-Link entgegen,
// .ics ist ein Text-Blob im Browser. Es gibt nichts einzuwilligen, nichts zu
// speichern, und kein Datum verlaesst das Geraet.

import { useState } from 'react';
import { CalendarPlus, Download, Link2, Check } from 'lucide-react';
import { googleCalendarUrl, downloadIcs, type ReminderEvent } from '@/lib/calendarLinks';
import { useLanguage } from '@/hooks/useLanguage';
import { InfoPopover } from '@/components/tools/primitives';

function ActionButton({ onClick, href, icon, children }: {
  onClick?: () => void; href?: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  const className = 'flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-[12px] font-medium transition-opacity hover:opacity-70 active:opacity-50 cursor-pointer flex-1 min-w-[7.5rem]';
  const style: React.CSSProperties = { background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)', color: 'var(--tx2)' };
  const inner = <>{icon}<span className="whitespace-nowrap">{children}</span></>;
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{inner}</a>;
  }
  return <button type="button" onClick={onClick} className={className} style={style}>{inner}</button>;
}

export function ResultActions({ event, shareUrl: url }: { event?: ReminderEvent; shareUrl?: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Zwischenablage verweigert (kein sicherer Kontext, Berechtigung
      // abgelehnt) — dann bleibt der Knopf einfach unveraendert stehen, statt
      // einen Erfolg zu behaupten, den es nicht gab.
    }
  };

  // Nur Intervall hat ein echtes Kalender-Ereignis. Zwei eigene Buttons dafuer
  // liessen genau diese eine Karte (sonst die kuerzeste) auf schmalen
  // Breiten in eine zweite Zeile umbrechen — mit fester Kartenhoehe darf kein
  // Rechner mehr eine andere Aktionszeilen-Hoehe haben als die anderen fuenf.
  // Beide Optionen stecken deshalb hinter einem einzelnen, gleich grossen
  // Popover-Button.
  return (
    <div className="flex flex-wrap gap-2">
      {event && (
        <InfoPopover
          ariaLabel={t.tools.shared.remind}
          trigger={() => (
            <span
              className="flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-[12px] font-medium flex-1 min-w-[7.5rem]"
              style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)', color: 'var(--tx2)' }}
            >
              <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{t.tools.shared.remind}</span>
            </span>
          )}
        >
          <div className="flex flex-col gap-1.5">
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--tx2)' }}
            >
              <CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />{t.tools.shared.addGoogle}
            </a>
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer"
              style={{ color: 'var(--tx2)' }}
            >
              <Download className="h-3.5 w-3.5 flex-shrink-0" />{t.tools.shared.addIcs}
            </button>
          </div>
        </InfoPopover>
      )}
      {url && (
        <ActionButton
          onClick={copy}
          icon={copied ? <Check className="h-3.5 w-3.5 flex-shrink-0" /> : <Link2 className="h-3.5 w-3.5 flex-shrink-0" />}
        >
          {copied ? t.tools.shared.copied : t.tools.shared.copyLink}
        </ActionButton>
      )}
    </div>
  );
}
