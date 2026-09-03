// ── Muss meine Kette raus? ──────────────────────────────────────────────────
//
// Die Frage, die am haeufigsten gestellt wird, und die einzige hier, die auch
// jemand stellt, der Waxcelerate nicht kennt. Sie beantwortet sich nicht mit
// einer Zahl allein: entscheidend ist, ob die Kassette schon mitgelaufen ist,
// denn das ist der Unterschied zwischen einem 45- und einem 130-Euro-Problem.

import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import {
  elongationFrom12Links, wearVerdict, wearLimit, NOMINAL_12_LINKS_MM,
  medianChainPrice, CASSETTE_PRICE, type ChainSpeed,
} from '@/lib/waxMath';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, NumberInput, StepNote,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const SPEEDS: ChainSpeed[] = [8, 9, 10, 11, 12];
const GAUGE_MARKS = [0.5, 0.75, 1.0] as const;
/** Die drei Lehrenmarken als feste Beschriftung — keine Format-Akrobatik. */
const MARK_LABEL: Record<number, { de: string; en: string }> = {
  0.5: { de: '0,5', en: '0.5' },
  0.75: { de: '0,75', en: '0.75' },
  1: { de: '1,0', en: '1.0' },
};

export function WearCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const dec = (n: number, digits = 2) => n.toFixed(digits).replace('.', de ? ',' : '.');
  const eur = (n: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const speed = profile.speed ?? 12;
  const [method, setMethod] = useState<'ruler' | 'gauge'>('ruler');
  const [measuredMm, setMeasuredMm] = useState(String(NOMINAL_12_LINKS_MM));
  const [gaugePct, setGaugePct] = useState<0.5 | 0.75 | 1.0>(0.5);

  const parsedMm = Number(measuredMm.replace(',', '.'));
  const mmValid = Number.isFinite(parsedMm) && parsedMm >= 300 && parsedMm <= 315;
  const percent = method === 'gauge' ? gaugePct : mmValid ? elongationFrom12Links(parsedMm) : 0;
  const verdict = wearVerdict(percent, speed);

  const statusText = {
    ok: t.tools.wear.statusOk,
    soon: t.tools.wear.statusSoon,
    replace: t.tools.wear.statusReplace,
    checkCass: t.tools.wear.statusCheckCass,
    cassette: t.tools.wear.statusCassette,
  }[verdict.status];

  // Die Kostenfolge ist der Grund, warum diese Frage ueberhaupt wichtig ist.
  // Sie folgt genau den drei Handlungsstufen des Urteils — eine feste Zahl zu
  // nennen, waehrend der Text daneben sagt „die Kassette kann mitgelaufen
  // sein", waere ein Widerspruch in derselben Karte.
  const needsAction = verdict.status !== 'ok' && verdict.status !== 'soon';
  const chainOnly = medianChainPrice;
  const both = medianChainPrice + CASSETTE_PRICE;
  const dueText =
    verdict.status === 'cassette' ? `${eur(both)} · ${t.tools.wear.chainAndCassette}`
    : verdict.status === 'checkCass' ? `${eur(chainOnly)}–${eur(both)}`
    : `${eur(chainOnly)} · ${t.tools.wear.chainOnly}`;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Gauge className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.wear.title}
        subtitle={t.tools.wear.subtitle}
      />

      <StepList>
        <StepField step={1} label={t.tools.wear.speed} help={t.tools.wear.helpSpeed}>
          <ChipRow>
            {SPEEDS.map(s => (
              <TogButton key={s} active={speed === s} onClick={() => profile.setSpeed(s)}>
                {s}
              </TogButton>
            ))}
          </ChipRow>
        </StepField>

        <StepField step={2} label={t.tools.wear.method} help={t.tools.wear.helpMethod}>
          <ChipRow>
            <TogButton active={method === 'ruler'} onClick={() => setMethod('ruler')}>{t.tools.wear.methodRuler}</TogButton>
            <TogButton active={method === 'gauge'} onClick={() => setMethod('gauge')}>{t.tools.wear.methodGauge}</TogButton>
          </ChipRow>
        </StepField>

        {method === 'ruler' ? (
          <StepField
            step={3}
            label={t.tools.wear.measured}
            value={`${de ? 'neu' : 'new'}: ${dec(NOMINAL_12_LINKS_MM, 1)} mm`}
            help={t.tools.wear.helpMeasured}
          >
            <NumberInput
              value={measuredMm} onChange={setMeasuredMm}
              min={300} max={315} step={0.1}
              ariaLabel={t.tools.wear.measured} theme={theme} suffix="mm"
            />
            {!mmValid && <StepNote>{de ? '300 bis 315 mm.' : '300 to 315 mm.'}</StepNote>}
          </StepField>
        ) : (
          <StepField step={3} label={t.tools.wear.gaugeValue}>
            <ChipRow>
              {GAUGE_MARKS.map(v => (
                <TogButton key={v} active={gaugePct === v} onClick={() => setGaugePct(v)}>
                  {de ? MARK_LABEL[v].de : MARK_LABEL[v].en} %
                </TogButton>
              ))}
            </ChipRow>
            <StepNote>{t.tools.wear.gaugeWarning}</StepNote>
          </StepField>
        )}
      </StepList>

      <ResultPanel
        value={dec(percent)}
        unit="%"
        verdict={statusText}
        tone={needsAction ? 'good' : 'neutral'}
        facts={[
          { label: t.tools.wear.limit, value: `${de ? MARK_LABEL[wearLimit(speed)].de : MARK_LABEL[wearLimit(speed)].en} % · ${speed}${de ? '-fach' : 'sp'}` },
          ...(needsAction ? [{ label: t.tools.wear.costNow, value: dueText }] : []),
        ]}
        actions={<ResultActions shareUrl={shareUrl('/rechner/verschleiss', profile.snapshot)} />}
      />

      <ToolFooter>
        <ToolCTA href="/rechner/passende-kette">{t.tools.wear.cta}</ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
