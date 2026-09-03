// ── Wann muss ich rewaxen? ──────────────────────────────────────────────────
//
// Wetter, Gelaende und Wochenkilometer fragt die Profilleiste ueber dem Stapel;
// hier bleibt nur, was wirklich nur hierher gehoert: wann zuletzt gewachst
// wurde. Und das Ergebnis endet nicht in einer Zahl, sondern in einem Termin.

import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { addWeeks, isoDate, shareUrl, dueDate } from '@/lib/toolState';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

export function IntervalCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const { lastWaxedDate, setLastWaxedDate, interval, weeks, weeksCapped } = profile;

  const today = new Date();
  const datePresets: { key: string; date: Date | null; label: string }[] = [
    { key: 'today', date: null, label: t.tools.rewax.lastWaxedToday },
    { key: '1w', date: addWeeks(today, -1), label: t.tools.rewax.lastWaxed1Week },
    { key: '2w', date: addWeeks(today, -2), label: t.tools.rewax.lastWaxed2Weeks },
  ];
  const isPresetActive = (d: Date | null) =>
    d === null ? lastWaxedDate === null
      : lastWaxedDate !== null && isoDate(lastWaxedDate) === isoDate(d);

  // Lazy init statt Effekt: einmal beim Mount entscheiden, ob das aktuelle
  // Datum ueberhaupt einem Preset entspricht. Ein Effekt auf lastWaxedDate
  // wuerde bei jeder Aenderung neu laufen und gegen jemanden arbeiten, der das
  // Feld nach eigener Datumswahl wieder zuklappt.
  const [customOpen, setCustomOpen] = useState(() =>
    lastWaxedDate !== null && !datePresets.some(p => p.date !== null && isoDate(p.date) === isoDate(lastWaxedDate)),
  );

  const { date: nextDate, overdue, weeksLeft, daysLeft } = useMemo(
    () => dueDate(lastWaxedDate, weeks), [weeks, lastWaxedDate],
  );

  // Die grosse Zahl beantwortet jetzt die Frage der Karte — „wann muss ich
  // rewaxen" — und nicht mehr die Nebenfrage „wie lang ist mein Intervall".
  // Vorher zeigte sie das Intervall, das sich durch den einzigen Schritt dieser
  // Karte gar nicht aendern kann: wer „vor zwei Wochen" waehlte, sah weiter
  // dieselben drei Wochen stehen. Das Intervall steht jetzt als Kennzahl
  // daneben, wo es hingehoert.
  const remaining: { value: React.ReactNode; unit: string } =
    overdue ? { value: '!', unit: de ? 'überfällig' : 'overdue' }
    : daysLeft < 7
      ? { value: daysLeft, unit: daysLeft === 1 ? (de ? 'Tag' : 'day') : (de ? 'Tage' : 'days') }
      : { value: weeksLeft, unit: weeksLeft === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks') };
  const dateLabel = nextDate.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long' });
  // Eine Erinnerung in der Vergangenheit ist keine Erinnerung.
  const reminderDate = overdue ? new Date() : nextDate;
  const url = shareUrl('/rechner/intervall', profile.snapshot);

  const goToWax = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'wax' }));
  };

  return (
    <ToolCard>
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.rewax.title}
        subtitle={de
          ? 'Aus Wetter, Gelände und Kilometern — mit Termin für den Kalender.'
          : 'From weather, terrain and distance — with a date for your calendar.'}
      />

      <StepList>
        <StepField
          step={1}
          label={t.tools.rewax.lastWaxed}
          help={de
            ? 'Der Tag, an dem die Kette zuletzt im Wachs war. Weißt du ihn nicht mehr, lass „Heute" stehen — dann rechnet der Rechner ab jetzt.'
            : 'The day the chain last went into the wax. If you cannot remember, leave "Today" — the calculation then starts from now.'}
        >
          {!customOpen && (
            <ChipRow>
              {datePresets.map(p => (
                <TogButton key={p.key} active={isPresetActive(p.date)} onClick={() => setLastWaxedDate(p.date)}>
                  {p.label}
                </TogButton>
              ))}
            </ChipRow>
          )}
          <button
            type="button"
            onClick={() => setCustomOpen(v => !v)}
            className="relative mt-2 self-start text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer after:content-[''] after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:h-11"
            style={{ color: 'var(--brand)' }}
          >
            {customOpen ? t.tools.rewax.lastWaxedHideExact : t.tools.rewax.lastWaxedExact}
          </button>
          {customOpen && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={lastWaxedDate ? isoDate(lastWaxedDate) : ''}
                min="2020-01-01"
                max={isoDate(new Date())}
                onChange={e => setLastWaxedDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[14px]"
                style={{
                  background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)',
                  colorScheme: theme === 'noir' ? 'dark' : 'light',
                }}
              />
              {lastWaxedDate && (
                <button
                  type="button"
                  onClick={() => setLastWaxedDate(null)}
                  aria-label={t.tools.rewax.lastWaxedClear}
                  className="flex-shrink-0 w-11 h-11 rounded-xl grid place-items-center transition-colors hover:opacity-80 cursor-pointer"
                  style={{ border: '1px solid var(--bd2)', background: 'var(--tog-bg)', color: 'var(--txf)' }}
                >
                  ×
                </button>
              )}
            </div>
          )}
        </StepField>
      </StepList>

      <ResultPanel
        value={typeof remaining.value === 'number'
          ? <AnimatedNumber value={remaining.value} />
          : remaining.value}
        unit={remaining.unit}
        verdict={overdue
          ? (de
            ? 'Die Kette war rechnerisch schon dran. Der Kalendereintrag setzt deshalb auf heute.'
            : 'By this calculation the chain was already due. The calendar entry is set to today.')
          : (de
            ? `Bis dahin noch fahren — nächstes Waxen etwa am ${dateLabel}.`
            : `Ride until then — next wax around ${dateLabel}.`)}
        tone="good"
        facts={[
          {
            label: de ? 'Dein Intervall' : 'Your interval',
            value: `${weeks} ${weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')}${weeksCapped ? ' max.' : ''} · ${interval} km`,
          },
          { label: de ? 'Termin' : 'Date', value: overdue ? (de ? 'jetzt' : 'now') : dateLabel },
        ]}
        actions={<ResultActions
          shareUrl={url}
          event={{
            date: reminderDate,
            title: de ? 'Kette rewaxen' : 'Re-wax chain',
            description: de
              ? `Waxcelerate: Intervall ${weeks} Wochen (${interval} km je Wachsung).`
              : `Waxcelerate: interval ${weeks} weeks (${interval} km per wax).`,
            repeatWeeks: weeks,
            url,
          }}
        />}
      />

      <ToolFooter>
        <ToolCTA onClick={goToWax}>{t.tools.shared.buyWax}</ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
