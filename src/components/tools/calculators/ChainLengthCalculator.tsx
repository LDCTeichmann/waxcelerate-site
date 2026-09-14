// ── Wie viele Glieder braucht meine Kette? ──────────────────────────────────
//
// Zwei Wege zur selben Antwort, als Umschalter oben:
//
//  - Messen: Kettenstrebe, groesstes Kettenblatt, groesstes Ritzel. Die Skizze
//    darunter rechnet mit — Zahnraeder und Strebe haben die eingegebene
//    Groesse — und die Rechnung steht Zeile fuer Zeile daneben, in denselben
//    Markierungen wie die Skizze. Vorher stand nur das Ergebnis da; wer nicht
//    wusste, was eine Kettenstrebe ist, kam nicht weiter, und wer es wusste,
//    konnte die Zahl nicht nachvollziehen.
//  - Zaehlen: die alte Kette zaehlen ist genauer als jede Formel. Die Skizze
//    zeigt, was gezaehlt wird.
//
// Die Heldenzahl bleibt die Handlung: welche Kette kaufen, wie viele Glieder
// abnehmen — jetzt zusaetzlich als Kettenstueck mit markierten Gliedern.
//
// Seit 09/2026: Eingabe links, Skizze rechts, der Rechenweg in einem Popover
// statt fuenf Zeilen auf der Karte — die Karte war mit Feldern, Skizze,
// Rechnung, Kettenstueck und zwei Kennzahlen die dichteste der Reihe.

import { useState } from 'react';
import { HelpCircle, Ruler } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { chainLengthBreakdown } from '@/lib/waxMath';
import { products } from '@/lib/data';
import { shareUrl } from '@/lib/toolState';
import { SegmentedToggle } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, NumberInput, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';
import {
  DrivetrainSketch, ChainCountSketch, ChainTrimBar, SketchFrame, type DrivetrainPart,
} from '@/components/tools/sketches';

/** Eine Eingabezeile: Label mit Fragezeichen links, Zahlenfeld rechts. Zeilen
 *  statt drei Spalten: in der halben Kartenbreite waren drei Felder nebeneinander
 *  so schmal, dass der Wert hinter „mm" verschwand. */
function CompactField({ label, ariaLabel, help, children }: {
  label: string; ariaLabel: string; help: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="text-meta uppercase tracking-[0.1em] font-semibold truncate" style={{ color: 'var(--tx2)' }}>
          {label}
        </span>
        <InfoPopover
          ariaLabel={`${ariaLabel}: Erklärung`}
          trigger={open => <HelpCircle className="h-3.5 w-3.5" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
        >
          <p className="text-[12px] leading-snug" style={{ color: 'var(--txm)' }}>{help}</p>
        </InfoPopover>
      </span>
      <span className="sr-only">{ariaLabel}</span>
      <div className="w-[7.5rem] flex-shrink-0">{children}</div>
    </div>
  );
}

/** Eine Zeile der Rechnung. `mark` ist dieselbe Strichart wie in der Skizze. */
function CalcRow({ mark, label, value }: {
  mark: 'stay' | 'wrap' | 'plain'; label: React.ReactNode; value: string;
}) {
  const color = mark === 'stay' ? 'var(--brand)' : mark === 'wrap' ? 'var(--tx1)' : 'var(--txff)';
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-5 flex-shrink-0 h-[3px]" style={{
        background: mark === 'plain' ? 'transparent' : `repeating-linear-gradient(90deg, ${color} 0 3.4px, transparent 3.4px 5px)`,
      }} />
      <span className="text-[12px] flex-1 min-w-0" style={{ color: 'var(--txm)' }}>{label}</span>
      <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{value}</span>
    </div>
  );
}

export function ChainLengthCalculator({ profile, compact }: { profile: ToolProfileState; compact?: boolean }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';
  const dec = (n: number, digits = 1) => n.toFixed(digits).replace('.', de ? ',' : '.');

  const [mode, setMode] = useState<'measure' | 'count'>('measure');
  // Vorbelegt mit einem gaengigen Rennrad-Setup, damit die Karte nie leer
  // dasteht und man am Beispiel sieht, was gemeint ist.
  const [chainstay, setChainstay] = useState('425');
  const [chainring, setChainring] = useState('50');
  const [sprocket, setSprocket] = useState('34');
  const [counted, setCounted] = useState('');
  const [focus, setFocus] = useState<DrivetrainPart>(null);

  const n = {
    chainstayMm: Number(chainstay),
    bigChainring: Number(chainring),
    bigSprocket: Number(sprocket),
  };
  const measureValid =
    n.chainstayMm >= 350 && n.chainstayMm <= 550 &&
    n.bigChainring >= 20 && n.bigChainring <= 60 &&
    n.bigSprocket >= 9 && n.bigSprocket <= 60;
  const calc = measureValid ? chainLengthBreakdown(n) : null;

  const countedN = Math.round(Number(counted));
  const countValid = Number.isFinite(countedN) && countedN >= 90 && countedN <= 140;
  // Eine ungerade Zahl heisst: verzaehlt. Ketten haben immer gerade Gliederzahl.
  const countedLinks = countValid ? (countedN % 2 === 0 ? countedN : countedN + 1) : null;

  const links = mode === 'measure' ? calc?.links ?? null : countedLinks;

  // Eine Gliederzahl allein ist noch keine Handlung. Der Schritt, der
  // tatsaechlich ansteht, ist das Kuerzen — und dafuer braucht es die
  // Auslieferungslaenge. Aus den Produktdaten abgeleitet, nicht fest verdrahtet.
  const stockLengths = [...new Set(
    products
      .filter(p => p.category === 'chain')
      .map(p => parseInt(String(p.chainLinks), 10))
      .filter(Number.isFinite),
  )].sort((a, b) => a - b);
  // Die kuerzeste Kette, die noch lang genug ist — von der nimmt man am wenigsten ab.
  const fitting = links ? stockLengths.find(l => l >= links) : undefined;
  const toRemove = links && fitting ? fitting - links : null;

  const tl = t.tools.length;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Ruler className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={tl.title}
        subtitle={tl.subtitle}
        info={(
          <InfoPopover
            ariaLabel={de ? 'Details zur Kettenlänge' : 'Details on chain length'}
            trigger={open => <HelpCircle className="h-4 w-4" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            <StepNote>{tl.onlyDerailleur}</StepNote>
            <StepNote>
              {links && !fitting
                ? tl.tooShort
                : tl.shortenNote.replace('{lengths}', stockLengths.join(', '))}
            </StepNote>
            <StepNote>{tl.crossCheck}</StepNote>
          </InfoPopover>
        )}
      />

      <StepList>
        <div className="cq-split">
          <div className="flex flex-col gap-3">
            <SegmentedToggle
              ariaLabel={de ? 'Wie ermitteln?' : 'How to work it out?'}
              value={mode}
              onChange={setMode}
              options={[
                { value: 'measure', label: tl.modeMeasure },
                { value: 'count', label: tl.modeCount },
              ]}
            />

            {mode === 'measure' ? (
              <>
                <div className="flex flex-col gap-1.5" onMouseLeave={() => setFocus(null)}>
                  <CompactField label={tl.stay} ariaLabel={tl.chainstay} help={tl.helpChainstay}>
                    <NumberInput
                      value={chainstay} onChange={setChainstay} min={350} max={550}
                      ariaLabel={tl.chainstay} theme={theme} suffix="mm"
                      onFocus={() => setFocus('stay')}
                    />
                  </CompactField>
                  <CompactField label={tl.ring} ariaLabel={tl.bigChainring} help={tl.helpChainring}>
                    <NumberInput
                      value={chainring} onChange={setChainring} min={20} max={60}
                      ariaLabel={tl.bigChainring} theme={theme} suffix={de ? 'Z' : 'T'}
                      onFocus={() => setFocus('ring')}
                    />
                  </CompactField>
                  <CompactField label={tl.sprocket} ariaLabel={tl.bigSprocket} help={tl.helpSprocket}>
                    <NumberInput
                      value={sprocket} onChange={setSprocket} min={9} max={60}
                      ariaLabel={tl.bigSprocket} theme={theme} suffix={de ? 'Z' : 'T'}
                      onFocus={() => setFocus('sprocket')}
                    />
                  </CompactField>
                </div>
                {!measureValid && <StepNote>{tl.rangeNote}</StepNote>}
                {calc && (
                  <InfoPopover
                    ariaLabel={tl.calcWay}
                    trigger={open => (
                      <span className="text-[12px] font-medium" style={{ color: open ? 'var(--tx1)' : 'var(--brand)' }}>
                        {tl.calcWay} →
                      </span>
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <CalcRow mark="stay" label={tl.calcStay.replace('{mm}', String(n.chainstayMm))} value={dec(calc.stay)} />
                      <CalcRow mark="wrap" label={`+ ${tl.calcRing.replace('{n}', String(n.bigChainring))}`} value={dec(calc.ring)} />
                      <CalcRow mark="wrap" label={`+ ${tl.calcSprocket.replace('{n}', String(n.bigSprocket))}`} value={dec(calc.sprocket)} />
                      <CalcRow mark="plain" label={`+ ${tl.calcReserve}`} value={dec(calc.reserve)} />
                      <div className="flex items-center gap-2.5 pt-1 mt-0.5" style={{ borderTop: '1px dashed var(--inset-bd)' }}>
                        <span className="w-5 flex-shrink-0" />
                        <span className="text-[12px] flex-1" style={{ color: 'var(--tx2)' }}>
                          {tl.calcTotal.replace('{raw}', dec(calc.raw))}
                        </span>
                        <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--brand)' }}>{calc.links}</span>
                      </div>
                    </div>
                  </InfoPopover>
                )}
              </>
            ) : (
              <>
                <div className="max-w-[200px]">
                  <NumberInput
                    value={counted} onChange={setCounted} min={90} max={140}
                    ariaLabel={tl.countLabel} theme={theme}
                    suffix={tl.links} placeholder={de ? 'z. B. 112' : 'e.g. 112'}
                  />
                </div>
                {counted.trim() !== '' && !countValid && <StepNote>{tl.countRange}</StepNote>}
                {countValid && countedN % 2 === 1 && (
                  <StepNote>{tl.countOdd.replace('{n}', String(countedLinks))}</StepNote>
                )}
              </>
            )}
          </div>

          {mode === 'measure' ? (
            <SketchFrame maxWidth={320}>
              <DrivetrainSketch
                chainstayMm={measureValid ? n.chainstayMm : 425}
                chainring={measureValid ? n.bigChainring : 50}
                sprocket={measureValid ? n.bigSprocket : 34}
                focus={focus}
                de={de}
              />
            </SketchFrame>
          ) : (
            <SketchFrame maxWidth={310} caption={tl.countCaption}>
              <ChainCountSketch de={de} />
            </SketchFrame>
          )}
        </div>
      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : 'kettenlaenge'}
        compact={compact}
        value={fitting ?? links ?? '—'}
        unit={fitting ? tl.buyLinks : tl.links}
        hero={toRemove ? <ChainTrimBar remove={toRemove} de={de} /> : undefined}
        verdict={links && fitting
          ? tl.resultVerdict
            .replace('{links}', String(links))
            .replace('{from}', String(fitting))
            .replace('{n}', String(toRemove))
          : links
            ? tl.tooShort
            : mode === 'count'
              ? tl.countEnter
              : undefined}
        tone={links ? 'good' : 'neutral'}
        // Keine Kennzahlen: „rechnerisch 112" und „2 abnehmen" standen schon
        // im Satz darueber, das Kettenstueck zeigt das Abnehmen als Bild.
        actions={<ResultActions compact={compact} shareUrl={shareUrl('/rechner/kettenlaenge', profile.snapshot)} />}
        cta={(
          <ToolCTA href="/rechner/passende-kette">{tl.cta}</ToolCTA>
        )}
      />

    </ToolCard>
  );
}
