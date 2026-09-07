// ── Welche Kette passt zu meinem Rad? ───────────────────────────────────────
//
// Ohne neue Daten: `compatibilityMatrix` liegt seit langem in data.ts und wurde
// nirgends ausgespielt. Der kuerzeste Weg vom Problem zum Produkt — und der
// einzige Rechner hier, dessen Antwort ausschliesslich aus gepflegten
// Produktdaten kommt und nie aus einer Annahme.
//
// Die Trefferliste steht jetzt auch im Kartenstapel (ToolDeck) selbst: seit
// ResultPanel `mt-auto` traegt (Phase 0), sammelt sich der freie Raum ueber
// dem Ergebnis, nicht mehr dahinter — bei nur zwei Eingabeschritten reicht er
// fuer bis zu vier Kacheln, mehr liefert die Matrix nicht. Vorher blendete
// `compact` die Liste aus, weil sie die feste Kartenhoehe gesprengt haette;
// das war die Sackgasse „4 Ketten passen" ohne zu zeigen, welche.
//
// `compact` steuert nur noch, wohin der Fussknopf fuehrt: im Deck auf die
// gefilterte Produktliste (derselbe `compatibilityMatrix`, damit dort
// garantiert dieselben Ketten stehen wie hier), auf der Einzelseite weiter
// zum naechsten Rechner.

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

  const deepLink = `/?ketten=${system}-${speedKey}#produkt-liste`;

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
          {!stocked && <StepNote>{t.tools.match.otherSpeed.replace('{speed}', String(speed))}</StepNote>}
        </StepField>
      </StepList>

      {/* Die Trefferliste steht jetzt in beiden Ansichten — der freie Raum
          ueber dem Ergebnis (ResultPanel.tsx, `mt-auto`) traegt sie, ohne die
          feste Kartenhoehe im Deck zu sprengen. Maximal vier Eintraege, das
          Maximum der Matrix.
          Sehr kleine Kacheln im Zweispalten-Raster statt einer Zeile pro
          Treffer: eine volle Zeile je Kette (Bild + zwei Textzeilen + Preis)
          brauchte bei vier Treffern rund 270 px und sprengte die feste
          680-px-Kartenhoehe — genau der Shimano-12-fach-Fall, mit dem die
          Karte startet. Zwei Spalten aus kleinen Bild+Preis-Kacheln passen
          selbst bei vier Treffern in gut 90 px; Modell und Ausverkauft-Status
          bleiben einen Klick entfernt auf der Produktseite. */}
      {sortedMatches.length > 0 && (
        <div className="px-4 sm:px-5 pb-3 grid grid-cols-2 gap-1.5">
          {sortedMatches.map(p => {
            const soldOut = isSoldOut(p);
            return (
              <a
                key={p.id}
                href={`/produkt/${p.id}`}
                className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition-opacity hover:opacity-85"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--bd2)', opacity: soldOut ? 0.6 : 1 }}
              >
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="w-7 h-7 rounded-md object-cover flex-shrink-0"
                  style={{ background: 'var(--sf2)' }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-meta truncate" style={{ color: 'var(--txff)' }}>{p.chainBrand}</span>
                  <span className="block text-meta font-semibold tabular-nums truncate" style={{ color: soldOut ? 'var(--txff)' : 'var(--brand)' }}>
                    {soldOut ? t.tools.match.soldOut : eur(p.price)}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      )}

      <ResultPanel
        value={matches.length}
        unit={matches.length === 1 ? (de ? 'Kette passt' : 'chain fits') : (de ? 'Ketten passen' : 'chains fit')}
        verdict={!stocked
          ? t.tools.match.otherSpeed.replace('{speed}', String(speed))
          : matches.length
            ? (de
              ? `${joinList(brandNames, true)} passen für ${SYSTEM_LABELS[system]} mit ${speedKey} Ritzeln — alle vorgewachst und sofort fahrbereit.`
              : `${joinList(brandNames, false)} fit ${SYSTEM_LABELS[system]} with ${speedKey} sprockets — all pre-waxed, ready to ride.`)
            : t.tools.match.none}
        tone={available.length ? 'good' : 'neutral'}
        facts={cheapest !== null
          ? [{ label: de ? 'Lieferbar ab' : 'In stock from', value: eur(cheapest) }]
          : []}
        actions={<ResultActions shareUrl={shareUrl('/rechner/passende-kette', profile.snapshot)} />}
      />

      <ToolFooter>
        {compact ? (
          matches.length > 0 ? (
            <ToolCTA href={deepLink}>
              {de ? 'Passende Ketten ansehen →' : 'View matching chains →'}
            </ToolCTA>
          ) : (
            <ToolCTA href="/rechner/passende-kette">
              {de ? 'Mehr erfahren →' : 'Find out more →'}
            </ToolCTA>
          )
        ) : (
          <ToolCTA href="/rechner/kettenlaenge">
            {de ? 'Passende Länge berechnen →' : 'Work out the right length →'}
          </ToolCTA>
        )}
      </ToolFooter>
    </ToolCard>
  );
}
