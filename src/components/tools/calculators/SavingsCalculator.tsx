// ── Rotation & Ersparnis ────────────────────────────────────────────────────
//
// Vier Korrekturen gegenueber frueheren Fassungen:
//  1. Der eigene km/Jahr-Slider ist weg. Er schrieb dieselbe Zahl wie der
//     km/Woche-Slider, nur in anderer Einheit — zwei Regler fuer dieselbe
//     Groesse an zwei Stellen. Die Kilometer kommen jetzt einmal aus der
//     Profilleiste.
//  2. Die Annahmen liegen in waxMath und stehen unter der Karte offen. Ein
//     Spar-Rechner auf der Seite des Verkaeufers ist sonst nur eine Behauptung.
//  3. Der Kassettenschutz stand bisher nur als ein Satz im Popover — jetzt
//     zeigt eine Skizze den Unterschied (CassetteWearDiagram), und der
//     Vergleich in Schritt 2 stellt drei Groessen gegen die Ein-Ketten-Basis:
//     Kosten, Sessions, Zeit.
//  4. Der staerkste Rotationsgrund fehlte komplett: eine Wachs-Session dauert
//     rund 20 Minuten, egal ob eine Kette oder drei gleichzeitig im Topf sind
//     (waxMath.WAX_SESSION_MINUTES). Der Zeitgewinn steht jetzt als Balken im
//     Ergebnis — er ist unmittelbarer als jeder Eurobetrag.

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { drivetrainCosts, medianChainPrice, waxHoursPerYear } from '@/lib/waxMath';
import { dueDate, shareUrl } from '@/lib/toolState';
import { MAX_REWAX_WEEKS } from '@/hooks/useToolProfile';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const CHAIN_COUNTS = [1, 2, 3] as const;
/** Mengenrabatt auf Ketten-Kits, wie auf der Produktseite ausgewiesen. */
const KIT_DISCOUNT: Record<1 | 2 | 3, number> = { 1: 0, 2: 5, 3: 10 };

export function SavingsCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const kmPerYear = profile.kmPerWeek * 52;

  // Empfehlung nach tatsaechlicher Jahresleistung — zugleich die Vorauswahl.
  const recommended: 1 | 2 | 3 = kmPerYear < 2500 ? 1 : kmPerYear >= 8000 ? 3 : 2;
  const [chains, setChains] = useState<1 | 2 | 3>(recommended);

  const costs = drivetrainCosts({ kmPerYear, rewaxKm: profile.interval, chains });
  const base = drivetrainCosts({ kmPerYear, rewaxKm: profile.interval, chains: 1 });
  const hoursN = waxHoursPerYear(costs.waxSessionsPerYear, chains);
  const hours1 = waxHoursPerYear(base.waxSessionsPerYear, 1);

  const weeksBetween = Math.min((chains * profile.interval) / profile.kmPerWeek, MAX_REWAX_WEEKS);
  const { date: next, overdue } = dueDate(profile.lastWaxedDate, Math.round(weeksBetween));
  const nextLabel = overdue
    ? (de ? 'überfällig' : 'overdue')
    : next.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' });

  const eur = (n: number) => `€${n.toLocaleString(de ? 'de-DE' : 'en-US')}`;
  const chainWord = (n: number) => de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains');

  // Die laufenden Kosten je Kilometer enthalten die Ketten bereits korrekt.
  // Was bisher fehlte, war die Ansage, dass zwei Zusatzketten erst einmal
  // bezahlt werden wollen. Beim Umstiegsrechner steht der Einmalbetrag da, hier
  // fehlte er — und „du sparst 85 € im Jahr" liest sich sonst, als koste die
  // Rotation nichts. Ehrlich ist: es ist kein Mehraufwand, sondern eine
  // vorgezogene Ausgabe, denn Ketten braucht man ohnehin.
  const extraChains = chains - 1;
  const upfront = Math.round(extraChains * medianChainPrice * (1 - KIT_DISCOUNT[chains] / 100));

  // Deep-Link auf die zum Fahrprofil passenden Ketten — dieselbe Matrix wie
  // der „Welche Kette passt?"-Rechner (ChainMatchCalculator), statt des
  // frueheren Events ohne Nutzlast.
  const system = profile.system ?? 'shimano';
  const speed = profile.speed ?? 12;
  const speedKey: '11' | '12' = speed === 11 ? '11' : '12';
  const deepLink = `/?ketten=${system}-${speedKey}#produkt-liste`;

  const rotationWeeks = Math.max(1, Math.round(weeksBetween));
  const shareLink = shareUrl('/rechner/ersparnis', profile.snapshot);
  const reminder = {
    date: overdue ? new Date() : next,
    title: de ? 'Ketten-Set rewaxen' : 'Re-wax chain set',
    description: de
      ? `Waxcelerate: ${chains} Ketten im Wechsel, alle ${rotationWeeks} Wochen gemeinsam wachsen.`
      : `Waxcelerate: ${chains} chains in rotation, wax them together every ${rotationWeeks} weeks.`,
    repeatWeeks: rotationWeeks,
    url: shareLink,
  };

  const hourFmt = (h: number) => h.toLocaleString(de ? 'de-DE' : 'en-US', { maximumFractionDigits: 1, minimumFractionDigits: h < 10 ? 1 : 0 });

  return (
    <ToolCard>
      <ToolHeader
        icon={<RotateCcw className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={de ? 'Rotation & Ersparnis' : 'Rotation & savings'}
        subtitle={de
          ? 'Ketten im Wechsel: seltener waxen, Kassette schonen, Geld sparen.'
          : 'Rotate chains: wax less often, protect the cassette, save money.'}
      />

      <StepList>
        <StepField
          step={1}
          label={de ? 'Wie viele Ketten im Wechsel' : 'Chains in rotation'}
          value={chains === recommended ? t.tools.shared.recommended : undefined}
          help={de
            ? 'Beim Rotieren fährst du mehrere Ketten abwechselnd und wachst sie gemeinsam. Jede läuft dadurch weniger Kilometer zwischen zwei Wachsungen, und die Kassette sieht nie eine stark gelängte Kette.'
            : 'Rotating means riding several chains in turn and waxing them together. Each covers fewer kilometres between waxes, and the cassette never sees a badly worn chain.'}
        >
          <ChipRow>
            {CHAIN_COUNTS.map(n => (
              <TogButton key={n} active={chains === n} onClick={() => setChains(n)}>
                {n} {chainWord(n)}
                {KIT_DISCOUNT[n] > 0 && ` · −${KIT_DISCOUNT[n]}%`}
              </TogButton>
            ))}
          </ChipRow>
        </StepField>

        <StepField
          step={2}
          label={de ? 'Gegenüber einer Kette' : 'Versus a single chain'}
        >
          {chains === 1 ? (
            <StepNote>{t.tools.rotation.basisNote}</StepNote>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{t.tools.rotation.costPerYear}</span>
                <span className="text-[13px] tabular-nums" style={{ color: 'var(--tx2)' }}>
                  {eur(base.waxPerYear)} → <span className="font-medium" style={{ color: 'var(--brand)' }}>{eur(costs.waxPerYear)}</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{t.tools.rotation.sessionsLabel}</span>
                <span className="text-[13px] tabular-nums" style={{ color: 'var(--tx2)' }}>
                  {base.waxSessionsPerYear}× → <span className="font-medium" style={{ color: 'var(--brand)' }}>{costs.waxSessionsPerYear}×</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{t.tools.rotation.timeLabel}</span>
                <span className="text-[13px] tabular-nums" style={{ color: 'var(--tx2)' }}>
                  {hourFmt(hours1)} h → <span className="font-medium" style={{ color: 'var(--brand)' }}>{hourFmt(hoursN)} h</span>
                </span>
              </div>
            </div>
          )}
        </StepField>

        {/* Empfehlungs-Begruendung und Termin an einer Stelle — der
            Aufpreis-Hinweis steht jetzt als Kennzahl im Ergebnis (Vorab). */}
        <InfoPopover
          ariaLabel={de ? 'Details zur Rotation' : 'Details on rotation'}
          trigger={() => (
            <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
              {de ? 'Details zur Rotation' : 'Details on rotation'}
            </span>
          )}
        >
          <StepNote>
            {de
              ? `Bei ${kmPerYear.toLocaleString('de-DE')} km im Jahr empfehlen wir ${recommended} ${chainWord(recommended)}.`
              : `At ${kmPerYear.toLocaleString('en-US')} km a year we suggest ${recommended} ${chainWord(recommended)}.`}
          </StepNote>
          <StepNote>
            {de
              ? 'Kette, Kassette und Schmierstoff zusammen, auf ein Jahr gerechnet.'
              : 'Chain, cassette and lubricant together, over one year.'}
          </StepNote>
          <StepNote>
            {de ? `Nächstes Waxen: ${nextLabel}.` : `Next wax: ${nextLabel}.`}
          </StepNote>
        </InfoPopover>
      </StepList>

      <ResultPanel
        value={<AnimatedNumber value={costs.savingsPerYear} prefix="€" />}
        unit={de ? 'gespart/Jahr' : 'saved/yr'}
        verdict={chains > 1
          ? t.tools.rotation.resultVerdict
            .replace('{chains}', `${chains} ${chainWord(chains)}`)
            .replace('{sessionsN}', String(costs.waxSessionsPerYear))
            .replace('{sessions1}', String(base.waxSessionsPerYear))
          : (de
            ? `Mit 1 Kette bei ${kmPerYear.toLocaleString('de-DE')} km im Jahr — ${costs.savingsPct} % weniger als mit Kettenöl.`
            : `With 1 chain at ${kmPerYear.toLocaleString('en-US')} km a year — ${costs.savingsPct} % less than chain oil.`)}
        tone="good"
        facts={[
          ...(chains > 1 ? [{ label: t.tools.rotation.upfront, value: eur(upfront) }] : []),
          { label: t.tools.rotation.vsOil, value: `−${costs.savingsPct}%` },
        ]}
        actions={<ResultActions shareUrl={shareLink} event={reminder} />}
      />

      <ToolFooter>
        <ToolCTA href={deepLink}>
          {de
            ? chains === 1 ? 'Einzelkette ansehen →' : `${chains}-Ketten-Kit ansehen · ${KIT_DISCOUNT[chains]}% Rabatt →`
            : chains === 1 ? 'View single chain →' : `View ${chains}-chain kit · ${KIT_DISCOUNT[chains]}% off →`}
        </ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
