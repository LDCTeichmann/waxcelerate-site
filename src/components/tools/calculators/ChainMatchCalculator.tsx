// ── Welche Kette passt zu meinem Rad? ───────────────────────────────────────
//
// Ohne neue Daten: `compatibilityMatrix` liegt seit langem in data.ts und wurde
// nirgends ausgespielt. Der kuerzeste Weg vom Problem zum Produkt — und der
// einzige Rechner hier, dessen Antwort ausschliesslich aus gepflegten
// Produktdaten kommt und nie aus einer Annahme.

import { Link2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { compatibilityMatrix, getProductById, isSoldOut } from '@/lib/data';
import type { DriveSystem } from '@/lib/ridingProfile';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, TogButton, ChipRow, StepNote,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const SYSTEM_LABELS: Record<DriveSystem, string> = {
  shimano: 'Shimano', sram: 'SRAM', campagnolo: 'Campagnolo',
};

// Nur die Gangzahlen anbieten, fuer die es Eintraege gibt. Eine
// 10-fach-Auswahl, die immer „nichts gefunden" sagt, ist kein Rechner,
// sondern eine Sackgasse.
const SPEED_OPTIONS = ['11', '12'] as const;

export function ChainMatchCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n);

  const system = profile.system ?? 'shimano';
  const speedKey: '11' | '12' = profile.speed === 11 ? '11' : '12';

  const matches = (compatibilityMatrix[system]?.[speedKey] ?? [])
    .map(getProductById)
    .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => Boolean(p));
  const available = matches.filter(p => !isSoldOut(p));
  const cheapest = available.length ? Math.min(...available.map(p => p.price)) : null;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Link2 className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.match.title}
        subtitle={t.tools.match.subtitle}
      />

      <StepList>
        <StepField step={1} label={t.tools.match.system} help={t.tools.match.helpSystem}>
          <ChipRow>
            {(Object.keys(SYSTEM_LABELS) as DriveSystem[]).map(s => (
              <TogButton key={s} active={system === s} onClick={() => profile.setSystem(s)}>
                {SYSTEM_LABELS[s]}
              </TogButton>
            ))}
          </ChipRow>
        </StepField>

        <StepField step={2} label={t.tools.match.speed} help={t.tools.match.helpSpeed}>
          <ChipRow>
            {SPEED_OPTIONS.map(s => (
              <TogButton key={s} active={speedKey === s} onClick={() => profile.setSpeed(Number(s) as 11 | 12)}>
                {s}{de ? '-fach' : 'sp'}
              </TogButton>
            ))}
          </ChipRow>
          <StepNote>{t.tools.match.note}</StepNote>
        </StepField>

      </StepList>

      <ResultPanel
        value={matches.length}
        unit={matches.length === 1 ? (de ? 'Kette passt' : 'chain fits') : (de ? 'Ketten passen' : 'chains fit')}
        verdict={matches.length
          ? (de
            ? `Für ${SYSTEM_LABELS[system]} mit ${speedKey} Ritzeln. Alle sind vorgewachst und sofort fahrbereit.`
            : `For ${SYSTEM_LABELS[system]} with ${speedKey} sprockets. All pre-waxed and ready to ride.`)
          : t.tools.match.none}
        tone={available.length ? 'good' : 'neutral'}
        facts={cheapest !== null
          ? [{ label: de ? 'Lieferbar ab' : 'In stock from', value: eur(cheapest) }]
          : []}
        actions={<ResultActions shareUrl={shareUrl('/rechner/passende-kette', profile.snapshot)} />}
      >
        {matches.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {matches.map(p => (
              <a
                key={p.id}
                href={`/produkt/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-opacity hover:opacity-85"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--bd2)' }}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium truncate" style={{ color: 'var(--tx2)' }}>
                    {p.chainModel ?? (de ? p.title : p.titleEn)}
                  </span>
                  <span className="block text-meta mt-0.5" style={{ color: 'var(--txff)' }}>
                    {p.chainBrand} · {p.chainLinks}{isSoldOut(p) ? ` · ${t.tools.match.soldOut}` : ''}
                  </span>
                </span>
                <span className="text-[13px] font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--brand)' }}>
                  {eur(p.price)}
                </span>
              </a>
            ))}
          </div>
        )}
      </ResultPanel>

      <ToolFooter>
        <ToolCTA href="/rechner/kettenlaenge">
          {de ? 'Passende Länge berechnen →' : 'Work out the right length →'}
        </ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
