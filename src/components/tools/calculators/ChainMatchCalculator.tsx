// ── Welche Kette passt zu meinem Rad? ───────────────────────────────────────
//
// Neu, aber ohne neue Daten: `compatibilityMatrix` liegt seit langem in
// data.ts und wurde nirgends auf der Seite ausgespielt. Von allen Rechnern hier
// ist das der mit dem kuerzesten Weg zum Kauf — und der einzige, dessen Antwort
// ausschliesslich aus gepflegten Produktdaten kommt, nie aus einer Annahme.

import { Link2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { compatibilityMatrix, getProductById, isSoldOut } from '@/lib/data';
import type { DriveSystem } from '@/lib/ridingProfile';
import { shareUrl } from '@/lib/toolState';
import { ToolCard, ToolHeader, FieldLabel, TogButton, ToolSeparator } from '@/components/tools/primitives';
import { ToolResult, ResultMeta } from '@/components/tools/ToolResult';
import { ResultActions } from '@/components/tools/ResultActions';

const SYSTEM_LABELS: Record<DriveSystem, string> = {
  shimano: 'Shimano',
  sram: 'SRAM',
  campagnolo: 'Campagnolo',
};

// Nur die Gangzahlen anbieten, fuer die es tatsaechlich Eintraege gibt. Eine
// 10-fach-Auswahl, die immer „nichts gefunden" sagt, ist kein Rechner, sondern
// eine Sackgasse.
const SPEED_OPTIONS = ['11', '12'] as const;

export function ChainMatchCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const system = profile.system ?? 'shimano';
  // Der Verschleiss-Rechner erlaubt 8 bis 12; hier gibt es nur 11 und 12, also
  // wird alles Kleinere auf 12 abgebildet statt eine leere Auswahl zu zeigen.
  const speedKey: '11' | '12' = profile.speed === 11 ? '11' : '12';

  const matches = (compatibilityMatrix[system]?.[speedKey] ?? [])
    .map(getProductById)
    .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => Boolean(p));

  const available = matches.filter(p => !isSoldOut(p));
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <ToolCard>
      <ToolHeader
        icon={<Link2 className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.match.title}
        subtitle={t.tools.match.subtitle}
      />
      <div className="flex flex-col flex-1 min-h-0">
        <ToolResult
          compact
          value={matches.length}
          unit={matches.length === 1 ? (de ? 'Kette' : 'chain') : (de ? 'Ketten' : 'chains')}
          reason={matches.length ? t.tools.match.note : t.tools.match.none}
          meta={matches.length
            ? <ResultMeta>{SYSTEM_LABELS[system]} · {speedKey}{de ? '-fach' : '-speed'} · {available.length} {de ? 'lieferbar' : 'in stock'}</ResultMeta>
            : undefined}
          tone={matches.length ? 'good' : 'neutral'}
          actions={<ResultActions shareUrl={shareUrl('/rechner/passende-kette', profile.snapshot)} />}
        />

        <ToolSeparator />

        <div className="px-6 pt-3 pb-2 sm:pt-4 sm:pb-3 grid grid-cols-2 gap-3">
          <div>
            <FieldLabel label={t.tools.match.system} />
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SYSTEM_LABELS) as DriveSystem[]).map(s => (
                <TogButton key={s} active={system === s} onClick={() => profile.setSystem(s)}>
                  {SYSTEM_LABELS[s]}
                </TogButton>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label={t.tools.match.speed} />
            <div className="flex flex-wrap gap-2">
              {SPEED_OPTIONS.map(s => (
                <TogButton key={s} active={speedKey === s} onClick={() => profile.setSpeed(Number(s) as 11 | 12)}>
                  {s}{de ? '-fach' : 'sp'}
                </TogButton>
              ))}
            </div>
          </div>
        </div>

        {/* min-h-0 + overflow-y-auto statt fester Hoehe: im Deck der Startseite
            hat die Karte eine feste Hoehe, und Shimano 12-fach liefert vier
            Treffer — ohne das hier wird der vierte unsichtbar abgeschnitten.
            Auf der eigenen Seite unter /rechner ist die Karte nicht
            hoehenbegrenzt, dort waechst die Liste einfach mit und es gibt
            keinen Scrollbalken. */}
        <div className="px-4 pb-3 sm:px-5 sm:pb-4 flex-1 min-h-0 flex flex-col">
          <FieldLabel label={t.tools.match.results} />
          <div className="flex flex-col gap-2 overflow-y-auto min-h-0">
            {matches.map(p => (
              <a
                key={p.id}
                href={`/produkt/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-opacity hover:opacity-85"
                style={{ background: 'var(--sf)', border: '1px solid var(--bd2)' }}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--tx2)' }}>
                    {de ? p.title : p.titleEn}
                  </span>
                  <span className="block text-meta mt-0.5" style={{ color: 'var(--txff)' }}>
                    {p.chainLinks}{isSoldOut(p) ? ` · ${t.tools.match.soldOut}` : ''}
                  </span>
                </span>
                <span className="text-[13px] font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--brand)' }}>
                  {eur(p.price)}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </ToolCard>
  );
}
