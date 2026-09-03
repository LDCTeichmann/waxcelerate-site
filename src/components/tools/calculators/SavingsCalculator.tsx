// ── Rotation & Ersparnis ────────────────────────────────────────────────────
//
// Drei Korrekturen gegenueber der ersten Fassung:
//  1. Der eigene km/Jahr-Slider ist weg. Er schrieb dieselbe Zahl wie der
//     km/Woche-Slider, nur in anderer Einheit — zwei Regler fuer dieselbe
//     Groesse an zwei Stellen. Die Kilometer kommen jetzt einmal aus der
//     Profilleiste.
//  2. Die Annahmen liegen in waxMath und stehen unter der Karte offen. Ein
//     Spar-Rechner auf der Seite des Verkaeufers ist sonst nur eine Behauptung.
//  3. Statt drei Karten mit bis zu fuenfzehn Zahlen gleichzeitig gibt es eine
//     Auswahl aus drei Knoepfen und darunter EIN Ergebnis. Man vergleicht durch
//     Umschalten, nicht durch Danebenlegen — das war die Beanstandung „zu viele
//     Zahlen, unklar was welche bedeutet".

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { drivetrainCosts } from '@/lib/waxMath';
import { dueDate, shareUrl } from '@/lib/toolState';
import { MAX_REWAX_WEEKS } from '@/hooks/useToolProfile';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, StepNote,
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
  const weeksBetween = Math.min((chains * profile.interval) / profile.kmPerWeek, MAX_REWAX_WEEKS);
  const { date: next, overdue } = dueDate(profile.lastWaxedDate, Math.round(weeksBetween));
  const nextLabel = overdue
    ? (de ? 'überfällig' : 'overdue')
    : next.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' });

  const eur = (n: number) => `€${n.toLocaleString(de ? 'de-DE' : 'en-US')}`;

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
                {n} {de ? (n === 1 ? 'Kette' : 'Ketten') : (n === 1 ? 'chain' : 'chains')}
                {KIT_DISCOUNT[n] > 0 && ` · −${KIT_DISCOUNT[n]}%`}
              </TogButton>
            ))}
          </ChipRow>
          <StepNote>
            {de
              ? `Bei ${kmPerYear.toLocaleString('de-DE')} km im Jahr empfehlen wir ${recommended} ${recommended === 1 ? 'Kette' : 'Ketten'}.`
              : `At ${kmPerYear.toLocaleString('en-US')} km a year we suggest ${recommended} ${recommended === 1 ? 'chain' : 'chains'}.`}
          </StepNote>
        </StepField>

        <StepField
          step={2}
          label={de ? 'Was es dich im Jahr kostet' : 'What it costs you per year'}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px]" style={{ color: 'var(--txf)' }}>
                {de ? 'Mit Wachs' : 'With wax'}
              </span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--brand)' }}>{eur(costs.waxPerYear)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px]" style={{ color: 'var(--txf)' }}>
                {de ? 'Mit Kettenöl' : 'With chain oil'}
              </span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(costs.oilPerYear)}</span>
            </div>
          </div>
          <StepNote>
            {de
              ? 'Kette, Kassette und Schmierstoff zusammen, auf ein Jahr gerechnet.'
              : 'Chain, cassette and lubricant together, over one year.'}
          </StepNote>
        </StepField>
      </StepList>

      <ResultPanel
        value={<AnimatedNumber value={costs.savingsPerYear} prefix="€" />}
        unit={de ? 'gespart/Jahr' : 'saved/yr'}
        verdict={de
          ? `Mit ${chains} ${chains === 1 ? 'Kette' : 'Ketten'} bei ${kmPerYear.toLocaleString('de-DE')} km im Jahr — ${costs.savingsPct} % weniger als mit Kettenöl.`
          : `With ${chains} ${chains === 1 ? 'chain' : 'chains'} at ${kmPerYear.toLocaleString('en-US')} km a year — ${costs.savingsPct} % less than chain oil.`}
        tone="good"
        facts={[
          { label: de ? 'Waxen' : 'Waxing', value: `${costs.waxSessionsPerYear}× ${de ? 'im Jahr' : 'a year'}` },
          { label: de ? 'Nächstes Mal' : 'Next time', value: nextLabel },
        ]}
        actions={<ResultActions shareUrl={shareUrl('/rechner/ersparnis', profile.snapshot)} />}
      />

      <ToolFooter>
        <ToolCTA onClick={goToChains}>
          {de
            ? chains === 1 ? 'Einzelkette ansehen →' : `${chains}-Ketten-Kit ansehen · ${KIT_DISCOUNT[chains]}% Rabatt →`
            : chains === 1 ? 'View single chain →' : `View ${chains}-chain kit · ${KIT_DISCOUNT[chains]}% off →`}
        </ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
