// ── Wann muss ich rewaxen? ──────────────────────────────────────────────────
//
// Wetter, Gelaende und Wochenkilometer fragt die Profilleiste ueber dem Stapel;
// hier bleibt nur, was wirklich nur hierher gehoert: wann zuletzt gewachst
// wurde. Und das Ergebnis endet nicht in einer Zahl, sondern in einem Termin.
//
// „3 Wochen" allein ist zweideutig — alle drei Wochen, oder in drei Wochen?
// Die Einheit sagt es jetzt dazu („Wochen bis zum Waxen"), der Urteilssatz
// nennt zuerst das Datum und danach den Rhythmus, und beide Lesarten stehen
// zusaetzlich als eigene Kennzahl da (vorher verwarf ResultPanel den zweiten
// von zwei Fakten stillschweigend, siehe ResultPanel.tsx).

import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { addWeeks, isoDate, shareUrl, dueDate } from '@/lib/toolState';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

export function IntervalCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const { lastWaxedDate, setLastWaxedDate, interval, weeks, weeksCapped, weather, terrain, kmPerWeek } = profile;

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

  // Die grosse Zahl beantwortet die Frage der Karte — „wann muss ich
  // rewaxen" —, aber „3 Wochen" allein ist zweideutig: alle drei Wochen,
  // oder erst in drei Wochen wieder? Die Einheit sagt es jetzt dazu.
  const remaining: { value: React.ReactNode; unit: string } =
    overdue ? { value: '!', unit: de ? 'überfällig' : 'overdue' }
    : daysLeft < 7
      ? { value: daysLeft, unit: daysLeft === 1 ? (de ? 'Tag bis zum Waxen' : 'day to go') : (de ? 'Tage bis zum Waxen' : 'days to go') }
      : { value: weeksLeft, unit: weeksLeft === 1 ? (de ? 'Woche bis zum Waxen' : 'week to go') : (de ? 'Wochen bis zum Waxen' : 'weeks to go') };
  const dateLabel = nextDate.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long' });
  // Eine Erinnerung in der Vergangenheit ist keine Erinnerung.
  const reminderDate = overdue ? new Date() : nextDate;
  const url = shareUrl('/rechner/intervall', profile.snapshot);

  // Wie die Zahl zustande kommt — sichtbar auf der Karte statt im Popover.
  const weekWord = (n: number) => de ? (n === 1 ? 'Woche' : 'Wochen') : (n === 1 ? 'week' : 'weeks');
  const weatherLabel = { trocken: t.tools.rewax.dry, gemischt: t.tools.rewax.mixed, nass: t.tools.rewax.wet }[weather];
  const terrainLabel = { strasse: t.tools.rewax.road, gravel: t.tools.rewax.gravel, mtb: t.tools.rewax.mtb }[terrain];
  const derivation = t.tools.rewax.derivation
    .replace('{weather}', weatherLabel)
    .replace('{terrain}', terrainLabel)
    .replace('{interval}', interval.toLocaleString(de ? 'de-DE' : 'en-US'))
    .replace('{km}', String(kmPerWeek))
    .replace('{weeks}', `${weeks} ${weekWord(weeks)}`);
  // Fortschritt seit der letzten Wachsung: voll = faellig.
  const totalDays = weeks * 7;
  const progress = overdue ? 1 : Math.min(1, Math.max(0, (totalDays - daysLeft) / totalDays));

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

        {/* Wie die Zahl zustande kommt — sichtbar, nicht im Popover versteckt.
            Erklaert die grosse Zahl und traegt die sonst kurze Karte. */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] leading-snug" style={{ color: 'var(--txm)' }}>{derivation}</p>
          <div className="flex items-center gap-2">
            <span className="text-meta flex-shrink-0" style={{ color: 'var(--txff)' }}>{t.tools.rewax.sinceLabel}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--inset-bd)' }}>
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${progress * 100}%`, background: overdue ? 'var(--accent)' : 'var(--brand)' }}
              />
            </div>
            <span className="text-meta flex-shrink-0" style={{ color: overdue ? 'var(--brand)' : 'var(--txff)' }}>
              {t.tools.rewax.dueLabel}
            </span>
          </div>
        </div>

        {/* Warum 300 km: die Empfehlung ist ein Optimum, keine harte Grenze —
            sonst liest sich „nach 3 Wochen" wie eine Verschleissgrenze. */}
        <InfoPopover
          ariaLabel={de ? 'Warum 300 km' : 'Why 300 km'}
          trigger={() => (
            <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
              {de ? 'Warum 300 km bei trockener Straße?' : 'Why 300 km on dry roads?'}
            </span>
          )}
        >
          <StepNote>
            {de
              ? '300 km bei trockener Straße ist die Empfehlung fürs Optimum, keine Verschleißgrenze. Eine Kette läuft auch mal 400 bis 500 km — nur eben nicht mehr im besten Zustand. Nach Regenfahrten deutlich früher.'
              : '300 km on dry roads is the recommendation for the best result, not a wear limit. A chain will also run 400 to 500 km — just no longer in peak condition. After riding in rain, much sooner.'}
          </StepNote>
        </InfoPopover>
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
            ? `Nächstes Waxen etwa am ${dateLabel}. Danach alle ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'} wieder — das sind ${interval} km bei deinem Profil.`
            : `Next wax around ${dateLabel}. After that, every ${weeks} ${weeks === 1 ? 'week' : 'weeks'} again — that is ${interval} km on your profile.`)}
        tone="good"
        facts={[
          { label: de ? 'Termin' : 'Date', value: overdue ? (de ? 'jetzt' : 'now') : dateLabel },
          {
            label: de ? 'Rhythmus' : 'Rhythm',
            value: `${de ? 'alle' : 'every'} ${weeks} ${weeks === 1 ? (de ? 'Woche' : 'week') : (de ? 'Wochen' : 'weeks')}${weeksCapped ? ' max.' : ''}`,
          },
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
