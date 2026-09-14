// ── Muss meine Kette raus? ──────────────────────────────────────────────────
//
// Die Frage, die am haeufigsten gestellt wird, und die einzige hier, die auch
// jemand stellt, der Waxcelerate nicht kennt. Sie beantwortet sich nicht mit
// einer Zahl allein: entscheidend ist, ob die Kassette schon mitgelaufen ist,
// denn das ist der Unterschied zwischen einem 45- und einem 130-Euro-Problem.
//
// Standardmethode ist jetzt die Lehre, nicht das Lineal: eine Kettenlehre
// haben die meisten oder koennen sie sich fuer wenig Geld besorgen, waehrend
// das Lineal ein Stahlmass und Ablesen auf 0,5 mm verlangt.
//
// Seit 09/2026: die Antwort ist ein Wort („Kette tauschen"), nicht mehr eine
// Prozentzahl. Die Lehre auf „keine Marke" zeigte vorher „0,00 %" — eine
// Genauigkeit, die niemand gemessen hat. Der Wert steht jetzt als Kennzahl und
// als Marker auf der Verschleissskala (WearScale), deren Grenze der Gangzahl
// folgt. Handlungsbedarf ist Bernstein (`warn`), nicht mehr Blau.

import { useState } from 'react';
import { Gauge, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import {
  elongationFrom12Links, wearVerdict, wearLimit, NOMINAL_12_LINKS_MM,
  medianChainPrice, CASSETTE_PRICE, type ChainSpeed,
} from '@/lib/waxMath';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, TogButton, ChipRow, NumberInput, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { SegmentedToggle } from '@/components/viz';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';
import { WearScale, GaugeSketch, SketchFrame } from '@/components/tools/sketches';

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

export function WearCalculator({ profile, compact }: { profile: ToolProfileState; compact?: boolean }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const dec = (n: number, digits = 2) => n.toFixed(digits).replace('.', de ? ',' : '.');
  const eur = (n: number) =>
    new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const speed = profile.speed ?? 12;
  const [method, setMethod] = useState<'ruler' | 'gauge'>('gauge');
  // Leer statt 304,8 vorbelegt: eine unangetastete Karte zeigte sonst „0,00 % —
  // Alles gut", also ein Urteil auf einer Messung, die niemand gemacht hat.
  const [measuredMm, setMeasuredMm] = useState('');
  const [gauge, setGauge] = useState<GaugeMark>('none');

  const parsedMm = Number(measuredMm.replace(',', '.'));
  const mmValid = Number.isFinite(parsedMm) && parsedMm >= 300 && parsedMm <= 315;
  // Lineal-Methode ohne gueltige Eingabe: kein Urteil, sondern die Aufforderung
  // zu messen.
  const awaitingInput = method === 'ruler' && !mmValid;
  const overshootMm = mmValid ? parsedMm - NOMINAL_12_LINKS_MM : 0;
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

  // Ohne Messwert steht dort ein Strich, kein Wort: „Messen" in
  // Ergebnisgroesse las sich wie ein Urteil (09/2026).
  const verdictWord = awaitingInput ? '—' : {
    ok: t.tools.wear.verdictOk,
    soon: t.tools.wear.verdictSoon,
    replace: t.tools.wear.verdictReplace,
    checkCass: t.tools.wear.verdictCheckCass,
    cassette: t.tools.wear.verdictCassette,
  }[verdict.status];
  // Die Lehre ohne greifende Marke sagt nur „unter der kleinsten Marke" —
  // die Skala zeigt dann eine Spanne bis 0,5 % statt eines Punkts.
  const gaugeBelow = method === 'gauge' && gauge === 'none';
  const scalePercent = awaitingInput ? null : gaugeBelow ? 0.5 : percent;
  const tone = awaitingInput ? 'neutral' : needsAction ? 'warn' : verdict.status === 'ok' ? 'good' : 'neutral';
  const limitLabel = de ? MARK_LABEL[wearLimit(speed)].de : MARK_LABEL[wearLimit(speed)].en;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Gauge className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.wear.title}
        subtitle={t.tools.wear.subtitle}
        info={(
          <InfoPopover
            ariaLabel={t.tools.wear.infoLabel}
            trigger={open => <HelpCircle className="h-4 w-4" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            <StepNote>
              {gauge === 'none' ? t.tools.wear.gaugeNoneNote : t.tools.wear.gaugeWarning}
            </StepNote>
          </InfoPopover>
        )}
      />

      <StepList>
        <div className="cq-split">
          {/* min-h wie bei der Kettenlaenge: „Lineal" braucht ein Zahlenfeld
              mit Hinweis, „Lehre" nur Chips. Gemessen 215 px im hoeheren
              Modus bei 390 px Bildschirmbreite; im Zweispalter faengt die
              feste Koerperhoehe das ohnehin ab. */}
          <div className="flex flex-col gap-3 min-h-[216px] sm:min-h-0">
            <StepField step={1} label={t.tools.wear.speed} help={t.tools.wear.helpSpeed}>
              <ChipRow>
                {SPEEDS.map(s => (
                  <TogButton key={s} active={speed === s} onClick={() => profile.setSpeed(s)}>
                    {s}
                  </TogButton>
                ))}
              </ChipRow>
            </StepField>

            {/* Segment statt zweier Chips: „Kettenlehre" und „Lineal, 12
                Glieder" brauchten bei 1024 px zwei Zeilen, und mit Schritt 3
                lief die Spalte 30 px ueber die Koerperhoehe. */}
            <StepField step={2} label={t.tools.wear.method} help={t.tools.wear.helpMethod}>
              <SegmentedToggle
                ariaLabel={t.tools.wear.method}
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'gauge' as const, label: t.tools.wear.methodGaugeShort },
                  { value: 'ruler' as const, label: t.tools.wear.methodRulerShort },
                ]}
              />
            </StepField>

            {method === 'ruler' ? (
              <StepField
                step={3}
                label={t.tools.wear.measured}
                value={`${t.tools.wear.newLength}: ${dec(NOMINAL_12_LINKS_MM, 1)} mm`}
                help={t.tools.wear.helpMeasured}
              >
                <NumberInput
                  value={measuredMm} onChange={setMeasuredMm}
                  min={300} max={315} step={0.1}
                  ariaLabel={t.tools.wear.measured} theme={theme} suffix="mm"
                  placeholder={t.tools.wear.measurePlaceholder}
                />
                {measuredMm.trim() !== '' && !mmValid && (
                  <StepNote>{t.tools.wear.measureRange}</StepNote>
                )}
                {mmValid && overshootMm > 0.05 && (
                  <StepNote>{t.tools.wear.overshoot.replace('{mm}', dec(overshootMm, 1))}</StepNote>
                )}
              </StepField>
            ) : (
              // Einheit in der Beschriftung, nicht auf jedem Chip: so passen
              // die vier Marken in eine Zeile.
              <StepField step={3} label={t.tools.wear.gaugeValueUnit}>
                <ChipRow>
                  {GAUGE_MARKS.map(v => (
                    <TogButton key={String(v)} active={gauge === v} onClick={() => setGauge(v)}>
                      {v === 'none' ? t.tools.wear.gaugeNone : (de ? MARK_LABEL[v].de : MARK_LABEL[v].en)}
                    </TogButton>
                  ))}
                </ChipRow>
              </StepField>
            )}
          </div>

          <SketchFrame>
            {method === 'gauge' ? (
              <GaugeSketch
                dropped={gauge !== 'none'}
                markLabel={MARK_LABEL[gauge === 'none' ? 0.5 : gauge][de ? 'de' : 'en']}
                tone={needsAction ? 'warn' : verdict.status === 'ok' ? 'ok' : 'soon'}
                de={de}
              />
            ) : (
            <WearScale
              percent={scalePercent}
              limit={wearLimit(speed)}
              bound={gaugeBelow ? 'below' : isLowerBound ? 'atLeast' : undefined}
              empty={t.tools.wear.scaleEmpty}
              labels={{
                ok: t.tools.wear.scaleOk, replace: t.tools.wear.scaleReplace, cassette: t.tools.wear.scaleCassette,
                limit: t.tools.wear.scaleLimit, you: t.tools.wear.scaleYou,
              }}
              fmt={n => dec(n, n === 0 ? 0 : n * 100 % 10 === 0 ? 1 : 2)}
            />
            )}
          </SketchFrame>
        </div>
      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : 'verschleiss'}
        hasResult={!awaitingInput}
        compact={compact}
        value={verdictWord}
        verdict={awaitingInput ? t.tools.wear.enterValue : statusText}
        tone={tone}
        facts={[
          needsAction
            ? { label: t.tools.wear.costNow, value: dueText }
            : { label: t.tools.wear.limit, value: `${limitLabel} % · ${speed}${t.tools.shared.speedSuffix}` },
          {
            label: t.tools.wear.elongationFact,
            value: awaitingInput ? '—'
              : gaugeBelow ? (de ? `unter ${MARK_LABEL[0.5].de} %` : `below ${MARK_LABEL[0.5].en} %`)
              : `${isLowerBound ? '≥ ' : ''}${dec(percent)} %`,
          },
        ]}
        actions={<ResultActions compact={compact} shareUrl={shareUrl('/rechner/verschleiss', profile.snapshot)} />}
        cta={(
          <ToolCTA href="/rechner/passende-kette">{t.tools.wear.cta}</ToolCTA>
        )}
      />

    </ToolCard>
  );
}
