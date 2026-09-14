// ── Welche Kette passt zu meinem Rad? ───────────────────────────────────────
//
// Ohne neue Daten: `compatibilityMatrix` liegt seit langem in data.ts und wurde
// nirgends ausgespielt. Der kuerzeste Weg vom Problem zum Produkt — und der
// einzige Rechner hier, dessen Antwort ausschliesslich aus gepflegten
// Produktdaten kommt und nie aus einer Annahme.
//
// Die Trefferliste steht als Produktkarten in jeder Darstellung, im
// Kartenstapel der Startseite genauso wie auf der Einzelseite.
//
// Seit 09/2026: die Antwort ist der Preis, ab dem es losgeht, nicht mehr
// „4 Ketten passen" — die Zahl sagte nichts, die Antwort sind die Ketten
// selbst. Das Raster hat immer 2×2 Plaetze (leere als ruhige Platzhalter),
// damit die Karte bei Campagnolo (1 Treffer) nicht anders aussieht als bei
// Shimano (4). Bei einer Gangzahl, die wir nicht fuehren, endet die Karte nicht
// mehr in einer Sackgasse, sondern verweist auf den Umstieg-Service.
//
// `compact` steuert nur, wohin der Fussknopf fuehrt: im Deck auf die
// gefilterte Produktliste (derselbe `compatibilityMatrix`, damit dort
// garantiert dieselben Ketten stehen wie hier), auf der Einzelseite weiter
// zum naechsten Rechner.

import { Link2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { compatibilityMatrix, getProductById, isSoldOut } from '@/lib/data';
import type { DriveSystem } from '@/lib/ridingProfile';
import { shareUrl } from '@/lib/toolState';
import { PRICE, UMSTIEG_LIVE } from '@/pages/rewax/content';
import { SketchFrame } from '@/components/tools/sketches';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, TogButton, ChipRow,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const SYSTEM_LABELS: Record<DriveSystem, string> = {
  shimano: 'Shimano', sram: 'SRAM', campagnolo: 'Campagnolo',
};

// Vorgewachst gibt es nur 11- und 12-fach.
const SPEED_OPTIONS = ['11', '12'] as const;

/** „Shimano, SRAM und YBN" / „Shimano, SRAM and YBN" — ohne Bibliothek, weil
    nur zwei Sprachen und maximal vier Eintraege vorkommen. */
function joinList(items: string[], de: boolean): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const head = items.slice(0, -1).join(', ');
  return `${head} ${de ? 'und' : 'and'} ${items[items.length - 1]}`;
}

export function ChainMatchCalculator({ profile, compact }: { profile: ToolProfileState; compact?: boolean }) {
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
  // Verfuegbare zuerst, dann guenstigste zuerst.
  const sortedMatches = [...matches].sort((a, b) => {
    const aSoldOut = isSoldOut(a), bSoldOut = isSoldOut(b);
    if (aSoldOut !== bSoldOut) return aSoldOut ? 1 : -1;
    return a.price - b.price;
  });
  const brandNames = [...new Set(matches.map(p => p.chainBrand).filter((b): b is string => Boolean(b)))];

  // Stufe 3: die Kettenliste ist die eigene Route /ketten statt eines
  // Aufklapp-Zustands auf der Startseite, Filter jetzt als Query-Parameter.
  const deepLink = `/ketten?marke=${system}&gang=${speedKey}`;

  const tm = t.tools.match;
  const slots = [...sortedMatches.slice(0, 4), ...Array(Math.max(0, 4 - sortedMatches.length)).fill(null)] as (typeof sortedMatches[number] | null)[];
  const serviceExit = UMSTIEG_LIVE && (!stocked || matches.length === 0);

  return (
    <ToolCard>
      <ToolHeader
        icon={<Link2 className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={tm.title}
        subtitle={tm.subtitle}
      />

      <StepList>
        <div className="cq-split cq-chart">
          <div className="flex flex-col gap-3">
            <StepField step={1} label={tm.system} help={tm.helpSystem}>
              <ChipRow>
                {(Object.keys(SYSTEM_LABELS) as DriveSystem[]).map(s => (
                  <TogButton key={s} active={system === s} onClick={() => profile.setSystem(s)}>
                    {SYSTEM_LABELS[s]}
                  </TogButton>
                ))}
              </ChipRow>
            </StepField>

            <StepField step={2} label={tm.speed} help={tm.helpSpeed}>
              <ChipRow>
                {SPEED_OPTIONS.map(s => (
                  <TogButton key={s} active={stocked && speedKey === s} onClick={() => profile.setSpeed(Number(s) as 11 | 12)}>
                    {s}{de ? '-fach' : 'sp'}
                  </TogButton>
                ))}
                {!stocked && (
                  <span
                    className="px-3.5 py-1.5 rounded-xl text-[13px]"
                    style={{ border: '1px dashed var(--bd2)', color: 'var(--txm)' }}
                  >
                    {tm.otherSpeedShort.replace('{speed}', String(speed))}
                  </span>
                )}
              </ChipRow>
            </StepField>
          </div>

          {/* Die Treffer als Produktliste — die Grafik dieser Karte. Immer
              vier Zeilen, leere als ruhige Platzhalter. Liste statt 2×2-Raster:
              Modellnamen wie „XT / Ultegra CN-M8100" passten in keine Kachel. */}
          <SketchFrame>
            <ul className="flex flex-col gap-1.5">
              {slots.map((p, i) => {
                if (!p) {
                  return (
                    <li key={`empty-${i}`} aria-hidden className="h-[40px] rounded-lg"
                      style={{ border: '1px dashed var(--inset-bd)' }} />
                  );
                }
                const soldOut = isSoldOut(p);
                return (
                  <li key={p.id}>
                    <a
                      href={`/produkt/${p.id}`}
                      className="group flex items-center gap-2.5 h-[40px] rounded-lg pl-1 pr-2.5 transition-colors min-w-0 hover:bg-[var(--sf)]"
                      style={{ opacity: soldOut ? 0.55 : 1 }}
                    >
                      <span className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0" style={{ background: 'var(--sf2)' }}>
                        <img
                          src={p.image}
                          alt=""
                          loading="lazy"
                          className="photo-neutral absolute inset-0 w-full h-full object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-[12.5px] font-semibold truncate" style={{ color: 'var(--tx1)' }}>{p.chainModel}</span>
                        <span className="block text-meta truncate" style={{ color: 'var(--txf)' }}>
                          {p.chainBrand}{p.chainLinks ? ` · ${p.chainLinks}` : ''}
                        </span>
                      </span>
                      <span className="text-[12.5px] font-semibold tabular-nums flex-shrink-0" style={{ color: soldOut ? 'var(--txff)' : 'var(--brand)' }}>
                        {soldOut ? tm.soldOut : eur(p.price)}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </SketchFrame>
        </div>
      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : 'passende-kette'}
        compact={compact}
        value={cheapest !== null ? tm.fromPrice.replace('{price}', eur(cheapest)) : '—'}
        verdict={!stocked
          ? tm.otherSpeed.replace('{speed}', String(speed))
          : matches.length
            ? tm.verdictFits
              .replace('{brands}', joinList(brandNames, de))
              .replace('{system}', SYSTEM_LABELS[system])
              .replace('{speed}', speedKey)
            : tm.none}
        tone={available.length ? 'good' : 'neutral'}
        facts={matches.length
          ? [{ label: tm.choice, value: matches.length === 1 ? tm.fitsOne : tm.fits.replace('{n}', String(matches.length)) }]
          : []}
        actions={<ResultActions compact={compact} shareUrl={shareUrl('/rechner/passende-kette', profile.snapshot)} />}
        cta={
          serviceExit ? (
            <ToolCTA href="/kette-wachsen-lassen">
              {tm.exitService.replace('{price}', eur(PRICE.umstieg.single))}
            </ToolCTA>
          ) : compact ? (
            <ToolCTA href={deepLink}>{tm.ctaChains}</ToolCTA>
          ) : (
            <ToolCTA href="/rechner/kettenlaenge">
              {de ? 'Passende Länge berechnen →' : 'Work out the right length →'}
            </ToolCTA>
          )
        }
      />

    </ToolCard>
  );
}
