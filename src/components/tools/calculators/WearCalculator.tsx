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
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, NumberInput, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ChainMeasureDiagram, SprocketCountDiagram } from '@/components/tools/diagrams';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const SPEEDS: ChainSpeed[] = [8, 9, 10, 11, 12];
// „keine" ist eine eigene Antwort, nicht das Fehlen einer. Vorher gab es nur
// die drei Marken: wer mit einer gesunden Kette misst, bei der keine Marke
// greift, musste 0,5 % anklicken — und bekam „Kette tauschen" fuer eine Kette,
// die noch lange laeuft. Der haeufigste Messausgang war der einzige, den das
// Werkzeug nicht darstellen konnte.
const GAUGE_MARKS = ['none', 0.5, 0.75, 1.0] as const;
type GaugeMark = (typeof GAUGE_MARKS)[number];
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
  const [gauge, setGauge] = useState<GaugeMark>('none');

  const parsedMm = Number(measuredMm.replace(',', '.'));
  const mmValid = Number.isFinite(parsedMm) && parsedMm >= 300 && parsedMm <= 315;
  // Eine Lehre misst keinen Wert, sie beantwortet eine Ja/Nein-Frage je Marke.
  // „Die 0,5er faellt rein" heisst mindestens 0,5 %, nicht genau 0,5 %. Fuer
  // das Urteil genuegt die Untergrenze; die Anzeige sagt „mindestens" dazu,
  // damit die Zahl nicht als Messwert missverstanden wird.
  const percent = method === 'gauge'
    ? (gauge === 'none' ? 0 : gauge)
    : mmValid ? elongationFrom12Links(parsedMm) : 0;
  const isLowerBound = method === 'gauge' && gauge !== 'none';
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
        <StepField step={1} label={t.tools.wear.speed} help={t.tools.wear.helpSpeed} figure={<SprocketCountDiagram />}>
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
            figure={<ChainMeasureDiagram />}
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
                <TogButton key={String(v)} active={gauge === v} onClick={() => setGauge(v)}>
                  {v === 'none'
                    ? t.tools.wear.gaugeNone
                    : `${de ? MARK_LABEL[v].de : MARK_LABEL[v].en} %`}
                </TogButton>
              ))}
            </ChipRow>
          </StepField>
        )}

        {/* Lehre-Hinweis + Kostenfolge an einer Stelle statt bedingt inline —
            sonst aendert allein das Umschalten zwischen Lineal und Lehre, oder
            ob schon gehandelt werden muss, die Kartenhoehe. */}
        <InfoPopover
          ariaLabel={de ? 'Details zum Verschleiß' : 'Details on wear'}
          trigger={() => (
            <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
              {de ? 'Details zum Verschleiß' : 'Details on wear'}
            </span>
          )}
        >
          {method === 'gauge' && (
            <StepNote>
              {gauge === 'none' ? t.tools.wear.gaugeNoneNote : t.tools.wear.gaugeWarning}
            </StepNote>
          )}
          {needsAction && <StepNote>{t.tools.wear.costNow}: {dueText}.</StepNote>}
        </InfoPopover>
      </StepList>

      <ResultPanel
        value={isLowerBound ? `≥ ${dec(percent)}` : dec(percent)}
        unit="%"
        verdict={statusText}
        tone={needsAction ? 'good' : 'neutral'}
        facts={[
          { label: t.tools.wear.limit, value: `${de ? MARK_LABEL[wearLimit(speed)].de : MARK_LABEL[wearLimit(speed)].en} % · ${speed}${de ? '-fach' : 'sp'}` },
        ]}
        actions={<ResultActions shareUrl={shareUrl('/rechner/verschleiss', profile.snapshot)} />}
      />

      <ToolFooter>
        <ToolCTA href="/rechner/passende-kette">{t.tools.wear.cta}</ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
