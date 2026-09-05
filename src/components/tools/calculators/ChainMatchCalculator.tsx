// ── Welche Kette passt zu meinem Rad? ───────────────────────────────────────
//
// Ohne neue Daten: `compatibilityMatrix` liegt seit langem in data.ts und wurde
// nirgends ausgespielt. Der kuerzeste Weg vom Problem zum Produkt — und der
// einzige Rechner hier, dessen Antwort ausschliesslich aus gepflegten
// Produktdaten kommt und nie aus einer Annahme.

import { useState } from 'react';
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
import { SprocketCountDiagram } from '@/components/tools/diagrams';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const SYSTEM_LABELS: Record<DriveSystem, string> = {
  shimano: 'Shimano', sram: 'SRAM', campagnolo: 'Campagnolo',
};

// Vorgewachst gibt es nur 11- und 12-fach.
const SPEED_OPTIONS = ['11', '12'] as const;
// Bis zu vier Ketten passen (Shimano 12-fach) — ungekuerzt sprengte die Liste
// die Karte deutlich ueber die Hoehe der anderen fuenf Rechner. Zwei Zeilen
// reichen, um zu zeigen, dass etwas passt; der Rest steht einen Klick entfernt.
const VISIBLE_MATCHES = 2;

export function ChainMatchCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n);

  const system = profile.system ?? 'shimano';

  // Das Profil teilt die Gangzahl mit dem Verschleiss-Rechner, der 8 bis 12
  // zulaesst. Hier gibt es nur 11 und 12 im Sortiment. Vorher wurde alles
  // andere still auf 12 abgebildet — wer im Verschleiss-Rechner „9" gewaehlt
  // hatte, bekam hier kommentarlos 12-fach-Ketten empfohlen. Das ist falsche
  // Beratung, und zwar eine, die man erst beim Einbau merkt. Jetzt bleibt die
  // Gangzahl stehen und der Rechner sagt, dass er sie nicht fuehrt.
  const speed = profile.speed ?? 12;
  const stocked = speed === 11 || speed === 12;
  const speedKey: '11' | '12' = speed === 11 ? '11' : '12';

  const matches = (stocked ? compatibilityMatrix[system]?.[speedKey] ?? [] : [])
    .map(getProductById)
    .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => Boolean(p));
  const available = matches.filter(p => !isSoldOut(p));
  const cheapest = available.length ? Math.min(...available.map(p => p.price)) : null;
  // Verfuegbare zuerst, dann guenstigste zuerst — genau die Ketten, die am
  // ehesten gekauft werden, stehen in den zwei standardmaessig sichtbaren Zeilen.
  const sortedMatches = [...matches].sort((a, b) => {
    const aSoldOut = isSoldOut(a), bSoldOut = isSoldOut(b);
    if (aSoldOut !== bSoldOut) return aSoldOut ? 1 : -1;
    return a.price - b.price;
  });
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = sortedMatches.length - VISIBLE_MATCHES;

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

        <StepField step={2} label={t.tools.match.speed} help={t.tools.match.helpSpeed} figure={<SprocketCountDiagram />}>
          <ChipRow>
            {SPEED_OPTIONS.map(s => (
              <TogButton key={s} active={stocked && speedKey === s} onClick={() => profile.setSpeed(Number(s) as 11 | 12)}>
                {s}{de ? '-fach' : 'sp'}
              </TogButton>
            ))}
            {!stocked && (
              <span
                className="px-3.5 py-2 rounded-xl text-[13px]"
                style={{ border: '1px dashed var(--bd2)', color: 'var(--txm)' }}
              >
                {t.tools.match.otherSpeedShort.replace('{speed}', String(speed))}
              </span>
            )}
          </ChipRow>
          <StepNote>{stocked ? t.tools.match.note : t.tools.match.otherSpeed.replace('{speed}', String(speed))}</StepNote>
        </StepField>

      </StepList>

      <ResultPanel
        value={matches.length}
        unit={matches.length === 1 ? (de ? 'Kette passt' : 'chain fits') : (de ? 'Ketten passen' : 'chains fit')}
        verdict={!stocked
          ? t.tools.match.otherSpeed.replace('{speed}', String(speed))
          : matches.length
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
        {sortedMatches.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {(expanded ? sortedMatches : sortedMatches.slice(0, VISIBLE_MATCHES)).map(p => (
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
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
                className="relative self-start text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer after:content-[''] after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:h-11"
                style={{ color: 'var(--brand)' }}
              >
                {expanded
                  ? (de ? 'Weniger anzeigen' : 'Show less')
                  : (de ? `${hiddenCount} weitere ${hiddenCount === 1 ? 'Kette' : 'Ketten'} anzeigen →` : `Show ${hiddenCount} more ${hiddenCount === 1 ? 'chain' : 'chains'} →`)}
              </button>
            )}
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
