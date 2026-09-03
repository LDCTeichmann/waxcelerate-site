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

  return (
    <div className="flex flex-wrap gap-2">
      {event && (
        <ActionButton href={googleCalendarUrl(event)} icon={<CalendarPlus className="h-3.5 w-3.5 flex-shrink-0" />}>
          {t.tools.shared.addGoogle}
        </ActionButton>
      )}
      {event && (
        <ActionButton onClick={() => downloadIcs(event)} icon={<Download className="h-3.5 w-3.5 flex-shrink-0" />}>
          {t.tools.shared.addIcs}
        </ActionButton>
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
