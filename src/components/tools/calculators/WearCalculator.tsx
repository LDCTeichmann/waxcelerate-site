// ── Muss meine Kette raus? ──────────────────────────────────────────────────
//
// Die Frage, die am haeufigsten gestellt wird, und die einzige hier, die auch
// jemand stellt, der Waxcelerate nicht kennt. Sie beantwortet sich nicht mit
// einer Zahl allein: entscheidend ist, ob die Kassette schon mitgelaufen ist,
// denn das ist der Unterschied zwischen einem 45- und einem 130-Euro-Problem.
//
// Standardmethode ist die Lehre, nicht das Lineal: eine Kettenlehre haben die
// meisten oder koennen sie sich fuer wenig Geld besorgen. Fuer das Lineal wird
// nicht mehr ein Absolutwert um 304,8 mm abgefragt (den liest niemand von Hand
// auf 0,1 mm ab), sondern der Ueberstand des zwoelften Bolzens ueber die
// 12-Zoll-Marke — in mm oder in Zoll-Bruchteilen.

import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import {
  elongationFromOvershoot, wearVerdict, wearLimit,
  medianChainPrice, CASSETTE_PRICE, type ChainSpeed,
} from '@/lib/waxMath';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, NumberInput, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const SPEEDS: ChainSpeed[] = [8, 9, 10, 11, 12];
// „keine" ist eine eigene Antwort, nicht das Fehlen einer. Wer mit einer
// gesunden Kette misst, bei der keine Marke greift, soll nicht 0,5 % anklicken
// muessen und „Kette tauschen" bekommen.
const GAUGE_MARKS = ['none', 0.5, 0.75, 1.0] as const;
type GaugeMark = (typeof GAUGE_MARKS)[number];
/** Die drei Lehrenmarken als feste Beschriftung — keine Format-Akrobatik. */
const MARK_LABEL: Record<number, { de: string; en: string }> = {
  0.5: { de: '0,5', en: '0.5' },
  0.75: { de: '0,75', en: '0.75' },
  1: { de: '1,0', en: '1.0' },
};

// Zoll-Bruchteile am Lineal → Laengung in Prozent. Ein 1/16-Zoll-Ueberstand
// ist in der Praxis der 0,5-%-Punkt, 1/8 Zoll der 1,0-%-Punkt.
const INCH_MARKS = [
  { key: 'flush', de: 'bündig', en: 'flush', pct: 0 },
  { key: '1/16', de: '1/16″', en: '1/16″', pct: 0.5 },
  { key: '1/8', de: '1/8″', en: '1/8″', pct: 1.0 },
  { key: '3/16', de: '3/16″', en: '3/16″', pct: 1.5 },
] as const;
type InchKey = (typeof INCH_MARKS)[number]['key'];

export function WearCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const dec = (n: number, digits = 2) => n.toFixed(digits).replace('.', de ? ',' : '.');
  const eur = (n: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const speed = profile.speed ?? 12;
  const [method, setMethod] = useState<'gauge' | 'ruler'>('gauge');
  const [gauge, setGauge] = useState<GaugeMark>('none');
  const [rulerUnit, setRulerUnit] = useState<'mm' | 'inch'>('mm');
  const [overshoot, setOvershoot] = useState('');           // mm-Modus: Textfeld
  const [inchMark, setInchMark] = useState<InchKey>('flush'); // Zoll-Modus: Chips

  const overshootMm = Number(overshoot.replace(',', '.'));
  const overshootValid = Number.isFinite(overshootMm) && overshootMm >= 0 && overshootMm <= 6;
  const inchPct = INCH_MARKS.find(m => m.key === inchMark)!.pct;

  // Lineal + mm-Modus ohne gueltige Eingabe: kein Urteil, sondern die
  // Aufforderung zu messen. Zoll-Chips und Lehre haben immer eine Auswahl.
  const awaitingInput = method === 'ruler' && rulerUnit === 'mm' && !overshootValid;

  const percent = method === 'gauge'
    ? (gauge === 'none' ? 0 : gauge)
    : rulerUnit === 'inch'
      ? inchPct
      : overshootValid ? elongationFromOvershoot(overshootMm) : 0;

  // Lehre und Zoll-Marke beantworten eine Ja/Nein-Frage je Schwelle — „die
  // 0,5er faellt rein" heisst mindestens 0,5 %, nicht genau. Das mm-Feld gibt
  // dagegen einen echten Messwert.
  const isLowerBound =
    (method === 'gauge' && gauge !== 'none') ||
    (method === 'ruler' && rulerUnit === 'inch' && inchPct > 0);

  const verdict = wearVerdict(percent, speed);
  const statusText = {
    ok: t.tools.wear.statusOk,
    soon: t.tools.wear.statusSoon,
    replace: t.tools.wear.statusReplace,
    checkCass: t.tools.wear.statusCheckCass,
    cassette: t.tools.wear.statusCassette,
  }[verdict.status];

  // Die Kostenfolge ist der Grund, warum diese Frage wichtig ist. Sie folgt den
  // drei Handlungsstufen des Urteils.
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
            <TogButton active={method === 'gauge'} onClick={() => setMethod('gauge')}>{t.tools.wear.methodGauge}</TogButton>
            <TogButton active={method === 'ruler'} onClick={() => setMethod('ruler')}>{t.tools.wear.methodRuler}</TogButton>
          </ChipRow>
        </StepField>

        {method === 'gauge' ? (
          <StepField step={3} label={t.tools.wear.gaugeValue}>
            <ChipRow>
              {GAUGE_MARKS.map(v => (
                <TogButton key={String(v)} active={gauge === v} onClick={() => setGauge(v)}>
                  {v === 'none' ? t.tools.wear.gaugeNone : `${de ? MARK_LABEL[v].de : MARK_LABEL[v].en} %`}
                </TogButton>
              ))}
            </ChipRow>
          </StepField>
        ) : (
          <StepField
            step={3}
            label={t.tools.wear.measured}
            value={de ? 'Überstand über 12″' : 'over the 12″ mark'}
            help={t.tools.wear.helpMeasured}
          >
            {/* Einheit: mm-Feld oder Zoll-Bruchteile am Lineal. */}
            <ChipRow>
              <TogButton active={rulerUnit === 'mm'} onClick={() => setRulerUnit('mm')}>mm</TogButton>
              <TogButton active={rulerUnit === 'inch'} onClick={() => setRulerUnit('inch')}>{de ? 'Zoll' : 'inch'}</TogButton>
            </ChipRow>

            {rulerUnit === 'mm' ? (
              <>
                <NumberInput
                  value={overshoot} onChange={setOvershoot}
                  min={0} max={6} step={0.1}
                  ariaLabel={t.tools.wear.measured} theme={theme} suffix="mm"
                  placeholder={de ? 'z. B. 1,5' : 'e.g. 1.5'}
                />
                {overshoot.trim() !== '' && !overshootValid && (
                  <StepNote>{de ? '0 bis 6 mm.' : '0 to 6 mm.'}</StepNote>
                )}
              </>
            ) : (
              <ChipRow>
                {INCH_MARKS.map(m => (
                  <TogButton key={m.key} active={inchMark === m.key} onClick={() => setInchMark(m.key)}>
                    {de ? m.de : m.en}
                  </TogButton>
                ))}
              </ChipRow>
            )}
          </StepField>
        )}

        <InfoPopover
          ariaLabel={de ? 'Details zum Verschleiß' : 'Details on wear'}
          trigger={() => (
            <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
              {de ? 'Details zum Verschleiß' : 'Details on wear'}
            </span>
          )}
        >
          <StepNote>
            {method === 'ruler'
              ? t.tools.wear.rulerNote
              : gauge === 'none'
                ? t.tools.wear.gaugeNoneNote
                : t.tools.wear.gaugeWarning}
          </StepNote>
        </InfoPopover>
      </StepList>

      <ResultPanel
        value={awaitingInput ? '—' : isLowerBound ? `≥ ${dec(percent)}` : dec(percent)}
        unit={awaitingInput ? undefined : '%'}
        verdict={awaitingInput ? t.tools.wear.enterValue : statusText}
        tone={!awaitingInput && needsAction ? 'good' : 'neutral'}
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
