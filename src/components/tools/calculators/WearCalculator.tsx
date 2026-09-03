// ── Muss meine Kette raus? ──────────────────────────────────────────────────
//
// Neu. Die mit Abstand meistgestellte Frage rund um Fahrradketten, und die
// einzige in dieser Sektion, die jemand stellt, der Waxcelerate noch gar nicht
// kennt. Sie beantwortet sich nicht mit einer Zahl allein: entscheidend ist,
// ob die Kassette schon mitgelaufen ist, denn das ist der Unterschied zwischen
// einem 40-€- und einem 130-€-Problem.

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
import { ToolCard, ToolHeader, FieldLabel, TogButton, ToolCTA, ToolSeparator } from '@/components/tools/primitives';
import { ToolResult, ResultMeta, ResultDot } from '@/components/tools/ToolResult';
import { ResultActions } from '@/components/tools/ResultActions';

const SPEEDS: ChainSpeed[] = [8, 9, 10, 11, 12];
const eur = (n: number, de: boolean) =>
  new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export function WearCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const speed = profile.speed ?? 12;

  const [method, setMethod] = useState<'ruler' | 'gauge'>('ruler');
  const [measuredMm, setMeasuredMm] = useState('152.4');
  const [gaugePct, setGaugePct] = useState<0.5 | 0.75 | 1.0>(0.5);

  const parsedMm = Number(measuredMm.replace(',', '.'));
  const mmValid = Number.isFinite(parsedMm) && parsedMm >= 150 && parsedMm <= 160;
  const percent = method === 'gauge'
    ? gaugePct
    : mmValid ? elongationFrom12Links(parsedMm) : 0;

  const verdict = wearVerdict(percent, speed);
  const statusText = {
    ok: t.tools.wear.statusOk,
    soon: t.tools.wear.statusSoon,
    replace: t.tools.wear.statusReplace,
    cassette: t.tools.wear.statusCassette,
  }[verdict.status];

  // Die Kostenfolge ist der eigentliche Grund, warum diese Frage wichtig ist.
  const cost = verdict.cassetteAtRisk
    ? { label: t.tools.wear.chainAndCassette, value: medianChainPrice + CASSETTE_PRICE }
    : { label: t.tools.wear.chainOnly, value: medianChainPrice };

  const url = shareUrl('/rechner/verschleiss', profile.snapshot);

  return (
    <ToolCard>
      <ToolHeader
        icon={<Gauge className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.wear.title}
        subtitle={t.tools.wear.subtitle}
      />
      <div className="flex flex-col flex-1">
        <ToolResult
          compact
          value={`${percent.toFixed(2).replace('.', de ? ',' : '.')}`}
          unit="%"
          reason={statusText}
          meta={<>
            <ResultMeta>{t.tools.wear.limit}: {wearLimit(speed).toString().replace('.', de ? ',' : '.')} % ({speed}-{de ? 'fach' : 'sp'})</ResultMeta>
            <ResultDot />
            <ResultMeta>{t.tools.wear.costHint} {eur(cost.value, de)} ({cost.label})</ResultMeta>
          </>}
          tone={verdict.status === 'ok' ? 'neutral' : 'good'}
          actions={<ResultActions shareUrl={url} />}
        />

        <ToolSeparator />

        <div className="px-6 pt-3 pb-3 sm:pt-4 sm:pb-4 flex flex-col flex-1 gap-3 sm:gap-4">
          <div>
            <FieldLabel label={t.tools.wear.speed} />
            <div className="flex flex-wrap gap-2">
              {SPEEDS.map(s => (
                <TogButton key={s} active={speed === s} onClick={() => profile.setSpeed(s)}>
                  {s}{de ? '-fach' : 'sp'}
                </TogButton>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel label={t.tools.wear.method} />
            <div className="flex flex-wrap gap-2">
              <TogButton active={method === 'ruler'} onClick={() => setMethod('ruler')}>{t.tools.wear.methodRuler}</TogButton>
              <TogButton active={method === 'gauge'} onClick={() => setMethod('gauge')}>{t.tools.wear.methodGauge}</TogButton>
            </div>
          </div>

          {method === 'ruler' ? (
            <div>
              <FieldLabel label={t.tools.wear.measured} value={`${NOMINAL_12_LINKS_MM.toString().replace('.', de ? ',' : '.')} mm ${de ? 'neu' : 'new'}`} />
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="150"
                max="160"
                value={measuredMm}
                onChange={e => setMeasuredMm(e.target.value)}
                aria-label={t.tools.wear.measured}
                className="w-full px-4 py-3 rounded-xl text-[14px] tabular-nums"
                style={{
                  background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)',
                  colorScheme: theme === 'noir' ? 'dark' : 'light',
                }}
              />
              <p className="text-[11px] leading-snug mt-2" style={{ color: 'var(--txff)' }}>
                {t.tools.wear.howTo}
              </p>
            </div>
          ) : (
            <div>
              <FieldLabel label={t.tools.wear.gaugeValue} />
              <div className="flex flex-wrap gap-2">
                {([0.5, 0.75, 1.0] as const).map(v => (
                  <TogButton key={v} active={gaugePct === v} onClick={() => setGaugePct(v)}>
                    {v.toString().replace('.', de ? ',' : '.')} %
                  </TogButton>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA href="/rechner/passende-kette">{t.tools.wear.cta}</ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}
