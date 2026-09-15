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
//
// Seit 09/2026: die Karte hatte nur ein Feld und sonst Leere. Dazu kommt der
// Zeitstrahl (RewaxTimeline) — zuletzt, heute, faellig, die Folgetermine — und
// die Herleitung als eine Zeile, die das „warum so oft?" beantwortet. Die
// Heldenzahl ist jetzt ein Abstand in Worten („in 6 Tagen", „heute faellig")
// statt „1 Woche bis zum Waxen" bzw. eines nackten „!" bei Ueberfaelligkeit.

import { useMemo, useState } from 'react';
import { HelpCircle, Calculator } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { addWeeks, isoDate, shareUrl, dueDate } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, TogButton, ChipRow, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';
import { RewaxTimeline, SketchFrame } from '@/components/tools/sketches';
import { CalcTrace, CalcTraceDisclosure, CalcTraceHeading, type TraceRow } from '@/components/tools/CalcTrace';

export function IntervalCalculator({ profile, compact }: { profile: ToolProfileState; compact?: boolean }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const { lastWaxedDate, setLastWaxedDate, interval, days, weeks, weeksCapped } = profile;

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

  const { date: nextDate, overdue, daysLeft } = useMemo(
    () => dueDate(lastWaxedDate, days), [days, lastWaxedDate],
  );

  const r = t.tools.rewax;
  const fmtDate = (d: Date) => d.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' });
  // Volle Wochen als Wochen, alles andere in Tagen — „alle 2 Wochen" statt
  // „alle 14 Tage", aber „alle 5 Tage" statt einer falsch gerundeten Woche.
  const rhythmWord = days % 7 === 0 ? `${weeks} ${weeks === 1 ? r.week : r.weeks}` : `${days} ${r.days}`;
  const rhythm = r.every.replace('{n}', rhythmWord);
  // Die Antwort als Abstand in Worten. Die Zahl allein („1") war zweideutig —
  // alle eine Woche, oder in einer Woche?
  const answer =
    overdue ? r.overdueBy.replace('{n}', String(-daysLeft))
    : daysLeft === 0 ? r.dueToday
    : daysLeft === 1 ? r.inOneDay
    : r.inDays.replace('{n}', String(daysLeft));
  const dateLabel = nextDate.toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
  // Eine Erinnerung in der Vergangenheit ist keine Erinnerung.
  const reminderDate = overdue ? new Date() : nextDate;
  const url = shareUrl('/rechner/intervall', profile.snapshot);
  const weatherLabel = { trocken: r.dry, gemischt: r.mixed, nass: r.wet }[profile.weather];
  const terrainLabel = { strasse: r.road, gravel: r.gravel, mtb: r.mtb }[profile.terrain];
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const waxesPerYear = Math.round((profile.kmPerWeek * 52) / interval);
  const s = t.tools.shared;
  const trace: TraceRow[] = [
    { label: s.traceInterval, detail: `${weatherLabel} · ${terrainLabel}`, value: `${interval} km` },
    { label: s.traceRhythm, detail: `${interval} km ÷ ${profile.kmPerWeek} km × 7`, value: `${days} ${r.days}` },
    { label: s.traceDue, detail: `${fmtDate(lastWaxedDate ?? today0)} + ${days} ${r.days}`, value: fmtDate(nextDate), total: true },
  ];

  // Auf der Startseite zum Regal scrollen; auf /rechner/intervall gibt es
  // #produkte nicht — dort war der Knopf bis 09/2026 tot und tat nichts.
  const goToWax = () => {
    const shelf = document.querySelector('#produkte');
    if (!shelf) { window.location.href = '/#produkte'; return; }
    shelf.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'wax' }));
  };

  return (
    <ToolCard>
      <ToolHeader
        icon={<Calculator className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.rewax.title}
        subtitle={t.tools.rewax.subtitle}
        info={(
          <InfoPopover
            ariaLabel={t.tools.rewax.infoLabel}
            trigger={open => <HelpCircle className="h-4 w-4" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            <StepNote>
              {de
                ? '300 km bei trockener Straße ist die Empfehlung fürs Optimum, keine Verschleißgrenze. Eine Kette läuft auch mal 400 bis 500 km — nur eben nicht mehr im besten Zustand. Nach Regenfahrten deutlich früher.'
                : '300 km on dry roads is the recommendation for the best result, not a wear limit. A chain will also run 400 to 500 km — just no longer in peak condition. After riding in rain, much sooner.'}
            </StepNote>
            <CalcTraceHeading />
            <CalcTrace rows={trace} />
          </InfoPopover>
        )}
      />

      <StepList>
        <div className="cq-split cq-chart">
        <StepField
          step={1}
          label={t.tools.rewax.lastWaxed}
          help={t.tools.rewax.lastWaxedHelp}
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
                className="w-full px-3.5 py-2.5 rounded-xl text-[16px] sm:text-[14px]"
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

        <SketchFrame
          caption={r.derivation
            .replace('{weather}', weatherLabel)
            .replace('{terrain}', terrainLabel)
            .replace('{km}', String(interval))
            .replace('{kmWeek}', String(profile.kmPerWeek))}
        >
          <RewaxTimeline
            last={lastWaxedDate ?? today0}
            today={today0}
            due={nextDate}
            days={days}
            overdue={overdue}
            labels={{ last: r.tlLast, today: r.tlToday, due: r.tlDue }}
            fmtDate={fmtDate}
          />
        </SketchFrame>
        </div>

        {waxesPerYear > 52 && (
          <StepNote>
            {t.tools.switch.hybridHint}{' '}
            <a href="/blog/tropfwachs-hybrid-methode" className="font-medium" style={{ color: 'var(--brand)' }}>
              {t.tools.switch.hybridLink}
            </a>
          </StepNote>
        )}
      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : 'intervall'}
        compact={compact}
        value={answer}
        verdict={overdue
          ? r.verdictOverdue.replace('{date}', dateLabel)
          : r.verdictNext.replace('{date}', dateLabel).replace('{weeks}', rhythmWord)}
        tone={overdue || daysLeft === 0 ? 'warn' : 'good'}
        facts={[
          { label: r.rhythm, value: `${rhythm}${weeksCapped ? ' max.' : ''} · ${interval} km` },
          { label: r.perYearFact, value: r.perYear.replace('{n}', String(waxesPerYear)) },
        ]}
        actions={<ResultActions compact={compact}
          shareUrl={url}
          repeatLabel={rhythm}
          event={{
            date: reminderDate,
            title: t.tools.rewax.reminderTitle,
            description: t.tools.rewax.reminderDesc
              .replace('{rhythm}', rhythm)
              .replace('{km}', String(interval)),
            repeatDays: days,
            url,
          }}
        />}
        cta={(
          <ToolCTA onClick={goToWax}>{t.tools.shared.buyWax}</ToolCTA>
        )}
      />
      {!compact && <CalcTraceDisclosure rows={trace} />}
    </ToolCard>
  );
}
