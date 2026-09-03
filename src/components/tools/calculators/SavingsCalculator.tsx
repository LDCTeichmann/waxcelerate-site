// ── Rotation & Ersparnis ────────────────────────────────────────────────────
//
// Der bisherige Rechner, mit drei Korrekturen:
//  1. Die zehn fest verdrahteten Preise und Laufleistungen liegen jetzt in
//     waxMath und stehen unter „Womit gerechnet wird" offen da. Ein
//     Spar-Rechner auf der Seite des Verkaeufers ist sonst nur eine Behauptung.
//  2. Der eigene km/Jahr-Slider ist weg. Er schrieb dieselbe Zahl wie der
//     km/Woche-Slider im Intervall-Rechner, nur in anderer Einheit — zwei
//     Regler fuer dieselbe Groesse, an zwei Stellen. Die Kilometer kommen jetzt
//     einmal aus der Profilleiste, hier steht nur noch die Umrechnung.
//  3. Die Kettenlaufleistungen kommen aus dem echten Medianpreis der eigenen
//     Ketten statt aus einem gerundeten 45-€-Platzhalter.

import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { drivetrainCosts } from '@/lib/waxMath';
import { dueDate, shareUrl } from '@/lib/toolState';
import { MAX_REWAX_WEEKS } from '@/hooks/useToolProfile';
import { AnimatedNumber } from '@/components/viz';
import { ToolCard, ToolHeader, FieldLabel, ToolCTA, ToolSeparator } from '@/components/tools/primitives';
import { ToolResult, ResultMeta, ResultDot } from '@/components/tools/ToolResult';
import { ResultActions } from '@/components/tools/ResultActions';
import { AssumptionsDisclosure } from '@/components/tools/AssumptionsDisclosure';

const CHAIN_COUNTS = [1, 2, 3] as const;
/** Mengenrabatt auf Ketten-Kits, wie auf der Produktseite ausgewiesen. */
const KIT_DISCOUNT: Record<1 | 2 | 3, number> = { 1: 0, 2: 5, 3: 10 };

export function SavingsCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const kmPerYear = profile.kmPerWeek * 52;

  const options = CHAIN_COUNTS.map(n => {
    const costs = drivetrainCosts({ kmPerYear, rewaxKm: profile.interval, chains: n });
    const weeks = Math.min((n * profile.interval) / profile.kmPerWeek, MAX_REWAX_WEEKS);
    const origin = profile.lastWaxedDate ?? new Date();
    const { date: next, overdue } = dueDate(profile.lastWaxedDate, Math.round(weeks));
    return {
      n,
      ...costs,
      dateStr: overdue
        ? (de ? 'überfällig' : 'overdue')
        : next.toLocaleDateString(de ? 'de-DE' : 'en-GB', {
            day: 'numeric', month: 'short',
            ...(next.getFullYear() !== origin.getFullYear() ? { year: 'numeric' as const } : {}),
          }),
    };
  });

  // Empfehlung nach tatsaechlicher Jahresleistung.
  const rec: 1 | 2 | 3 = kmPerYear < 2500 ? 1 : kmPerYear >= 8000 ? 3 : 2;
  const recData = options[rec - 1];

  const goToChains = () => {
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: 'chain' }));
  };

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={de ? 'Rotation & Ersparnis' : 'Rotation & savings'}
        subtitle={de
          ? 'Ketten im Wechsel: seltener waxen, Kassette schonen, Geld sparen.'
          : 'Rotate chains: wax less often, protect the cassette, save money.'}
      />
      <div className="flex flex-col flex-1">
        <ToolResult
          compact
          value={<AnimatedNumber value={recData.savingsPerYear} prefix="~€" />}
          unit={de ? 'gespart/Jahr' : 'saved/yr'}
          reason={de
            ? `mit ${rec} ${rec === 1 ? 'Kette' : 'Ketten'} · gegenüber Kettenöl (~€${recData.oilPerYear}/Jahr) bei ${kmPerYear.toLocaleString('de-DE')} km`
            : `with ${rec} ${rec === 1 ? 'chain' : 'chains'} · vs. chain oil (~€${recData.oilPerYear}/yr) at ${kmPerYear.toLocaleString('en-US')} km`}
          tone="good"
          meta={<>
            <ResultMeta>{recData.waxSessionsPerYear}× {de ? 'Waxen/Jahr' : 'wax/yr'}</ResultMeta>
            <ResultDot />
            <ResultMeta>−{recData.savingsPct} %</ResultMeta>
          </>}
          actions={<ResultActions shareUrl={shareUrl('/rechner/ersparnis', profile.snapshot)} />}
        />

        <ToolSeparator />

        <div className="px-4 pt-3 pb-2 sm:px-5 sm:pt-4 sm:pb-3 flex-1">
          {/* items-start, nicht h-full: der Grid-Standard stretch hat die beiden
              nicht empfohlenen Karten frueher auf die Hoehe der empfohlenen
              gezogen und sichtbar leeren Raum in ihnen hinterlassen. */}
          <div className="grid grid-cols-3 gap-2 items-start">
            {options.map(o => {
              const isRec = o.n === rec;
              if (!isRec) {
                return (
                  <div
                    key={o.n}
                    className="rounded-2xl flex flex-col items-center justify-center text-center"
                    style={{ background: 'var(--sf)', border: '1px solid var(--bd2)', padding: '12px 10px' }}
                  >
                    <p className="text-meta font-semibold leading-none mb-2" style={{ color: 'var(--tx2)' }}>
                      {o.n} {de ? (o.n === 1 ? 'Kette' : 'Ketten') : (o.n === 1 ? 'chain' : 'chains')}
                    </p>
                    <p className="text-[18px] font-bold tabular-nums leading-none" style={{ color: o.savingsPerYear > 0 ? 'var(--txm)' : 'var(--txff)' }}>
                      {o.savingsPerYear > 0 ? `~€${o.savingsPerYear}` : '—'}
                    </p>
                    <p className="text-meta mt-0.5" style={{ color: 'var(--txff)' }}>{t.tools.shared.perYear}</p>
                  </div>
                );
              }
              return (
                <div
                  key={o.n}
                  className="rounded-2xl flex flex-col"
                  style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1.5px solid var(--brand)', padding: '12px 10px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-meta font-semibold leading-none" style={{ color: 'var(--brand)' }}>
                      {o.n} {de ? (o.n === 1 ? 'Kette' : 'Ketten') : (o.n === 1 ? 'chain' : 'chains')}
                    </p>
                    {KIT_DISCOUNT[o.n] > 0 && (
                      <span className="rounded px-1 py-0.5 text-meta font-semibold leading-none" style={{ background: 'var(--accent-wash)', color: 'var(--brand)' }}>
                        −{KIT_DISCOUNT[o.n]}%
                      </span>
                    )}
                  </div>
                  <p className="text-[22px] font-bold tabular-nums leading-none" style={{ color: 'var(--brand)' }}>
                    {o.savingsPerYear > 0 ? `~€${o.savingsPerYear}` : '—'}
                  </p>
                  <p className="text-meta mt-0.5 mb-3" style={{ color: 'var(--txff)' }}>
                    {o.savingsPct > 0 ? `${t.tools.shared.perYear} · −${o.savingsPct}%` : (de ? '/Jahr vs. Öl' : '/yr vs. oil')}
                  </p>
                  <p className="text-[16px] font-bold tabular-nums leading-none mb-0.5" style={{ color: 'var(--txm)' }}>
                    {o.waxSessionsPerYear}×
                  </p>
                  <p className="text-meta" style={{ color: 'var(--txff)' }}>{de ? 'Waxen/Jahr' : 'wax/yr'}</p>
                  <div className="mt-auto pt-3">
                    <p className="text-meta" style={{ color: 'var(--txff)' }}>{de ? 'Nächstes Waxen' : 'Next wax'}</p>
                    <p className="text-meta font-medium mt-0.5" style={{ color: 'var(--brand)' }}>{o.dateStr}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <FieldLabel label={t.tools.rotation.kmPerYear} value={`${kmPerYear.toLocaleString(de ? 'de-DE' : 'en-US')} km`} />
            <AssumptionsDisclosure />
          </div>
        </div>

        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA onClick={goToChains}>
            {de
              ? rec === 1 ? 'Einzelkette ansehen →' : `${rec}-Ketten-Kit ansehen · ${KIT_DISCOUNT[rec]}% Rabatt →`
              : rec === 1 ? 'View single chain →' : `View ${rec}-chain kit · ${KIT_DISCOUNT[rec]}% off →`}
          </ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}
