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

/** Eine schmale Spalte der Eingabe-Reihe: kurzes Label, Fragezeichen, Zahl. */
function CompactField({ label, ariaLabel, help, children }: {
  label: string; ariaLabel: string; help: string; children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <span className="flex items-center gap-1 mb-1.5">
        <span className="text-meta uppercase tracking-[0.06em] font-medium truncate" style={{ color: 'var(--txf)' }}>
          {label}
        </span>
        <InfoPopover
          ariaLabel={`${ariaLabel}: Erklärung`}
          trigger={open => <HelpCircle className="h-3 w-3" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
        >
          <p className="text-[12px] leading-snug" style={{ color: 'var(--txm)' }}>{help}</p>
        </InfoPopover>
      </span>
      <span className="sr-only">{ariaLabel}</span>
      {children}
    </div>
  );
}

/** Eine Zeile der Rechnung. `mark` ist dieselbe Strichart wie in der Skizze. */
function CalcRow({ mark, label, value, active }: {
  mark: 'stay' | 'wrap' | 'plain'; label: React.ReactNode; value: string; active?: boolean;
}) {
  const color = mark === 'stay' ? 'var(--brand)' : mark === 'wrap' ? 'var(--tx1)' : 'var(--txff)';
  return (
    <div className="flex items-center gap-2.5 transition-opacity" style={{ opacity: active === false ? 0.45 : 1 }}>
      <span className="w-5 flex-shrink-0 h-[3px]" style={{
        background: mark === 'plain' ? 'transparent' : `repeating-linear-gradient(90deg, ${color} 0 3.4px, transparent 3.4px 5px)`,
      }} />
      <span className="text-[12.5px] flex-1 min-w-0" style={{ color: 'var(--txf)' }}>{label}</span>
      <span className="text-[12.5px] font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{value}</span>
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

  return (
    <ToolCard>
      <ToolHeader
        icon={<Ruler className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.length.title}
        subtitle={t.tools.length.subtitle}
        info={(
          <InfoPopover
            ariaLabel={de ? 'Details zur Kettenlänge' : 'Details on chain length'}
            trigger={open => <HelpCircle className="h-4 w-4" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            <StepNote>{t.tools.length.onlyDerailleur}</StepNote>
            <StepNote>
              {links && !fitting
                ? t.tools.length.tooShort
                : t.tools.length.shortenNote.replace('{lengths}', stockLengths.join(', '))}
            </StepNote>
            <StepNote>{t.tools.length.crossCheck}</StepNote>
          </InfoPopover>
        )}
      />

      <StepList>
        <SegmentedToggle
          ariaLabel={de ? 'Wie ermitteln?' : 'How to work it out?'}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'measure', label: de ? 'Am Rad messen' : 'Measure the bike' },
            { value: 'count', label: de ? 'Alte Kette zählen' : 'Count the old chain' },
          ]}
        />

        {mode === 'measure' ? (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <CompactField label={de ? 'Strebe' : 'Stay'} ariaLabel={t.tools.length.chainstay} help={t.tools.length.helpChainstay}>
                <NumberInput
                  value={chainstay} onChange={setChainstay} min={350} max={550}
                  ariaLabel={t.tools.length.chainstay} theme={theme} suffix="mm"
                  onFocus={() => setFocus('stay')}
                />
              </CompactField>
              <CompactField label={de ? 'Kettenblatt' : 'Chainring'} ariaLabel={t.tools.length.bigChainring} help={t.tools.length.helpChainring}>
                <NumberInput
                  value={chainring} onChange={setChainring} min={20} max={60}
                  ariaLabel={t.tools.length.bigChainring} theme={theme} suffix={de ? 'Z' : 'T'}
                  onFocus={() => setFocus('ring')}
                />
              </CompactField>
              <CompactField label={de ? 'Ritzel' : 'Sprocket'} ariaLabel={t.tools.length.bigSprocket} help={t.tools.length.helpSprocket}>
                <NumberInput
                  value={sprocket} onChange={setSprocket} min={9} max={60}
                  ariaLabel={t.tools.length.bigSprocket} theme={theme} suffix={de ? 'Z' : 'T'}
                  onFocus={() => setFocus('sprocket')}
                />
              </CompactField>
            </div>

            {!measureValid && (
              <StepNote>
                {de
                  ? 'Kettenstrebe 350–550 mm, Kettenblatt 20–60 Zähne, Ritzel 9–60 Zähne.'
                  : 'Chainstay 350–550 mm, chainring 20–60 teeth, sprocket 9–60 teeth.'}
              </StepNote>
            )}

            <div onMouseLeave={() => setFocus(null)}>
              <SketchFrame maxWidth={420} split>
                <DrivetrainSketch
                  chainstayMm={measureValid ? n.chainstayMm : 425}
                  chainring={measureValid ? n.bigChainring : 50}
                  sprocket={measureValid ? n.bigSprocket : 34}
                  focus={focus}
                  de={de}
                />
                {calc && (
                  <div className="flex flex-col gap-1 pt-2 mt-1 self-center">
                    <CalcRow mark="stay" active={focus === null || focus === 'stay'}
                      label={de ? `2 × Strebe ${n.chainstayMm} ÷ 12,7` : `2 × stay ${n.chainstayMm} ÷ 12.7`}
                      value={dec(calc.stay)} />
                    <CalcRow mark="wrap" active={focus === null || focus === 'ring'}
                      label={de ? `+ Kettenblatt ${n.bigChainring} ÷ 2` : `+ chainring ${n.bigChainring} ÷ 2`}
                      value={dec(calc.ring)} />
                    <CalcRow mark="wrap" active={focus === null || focus === 'sprocket'}
                      label={de ? `+ Ritzel ${n.bigSprocket} ÷ 2` : `+ sprocket ${n.bigSprocket} ÷ 2`}
                      value={dec(calc.sprocket)} />
                    <CalcRow mark="plain"
                      label={de ? '+ Reserve fürs Schaltwerk' : '+ slack for the derailleur'}
                      value={dec(calc.reserve)} />
                    <div className="flex items-center gap-2.5 pt-1 mt-0.5" style={{ borderTop: '1px dashed var(--inset-bd)' }}>
                      <span className="w-5 flex-shrink-0" />
                      <span className="text-[12.5px] flex-1" style={{ color: 'var(--tx2)' }}>
                        = {dec(calc.raw)} → {de ? 'gerade aufgerundet' : 'rounded up, even'}
                      </span>
                      <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--brand)' }}>{calc.links}</span>
                    </div>
                  </div>
                )}
              </SketchFrame>
            </div>
          </>
        ) : (
          <>
            <SketchFrame caption={de
              ? 'Kette abnehmen oder am Rad Bolzen für Bolzen zählen. Die neue Kette bekommt dieselbe Länge — wenn die alte gut geschaltet hat.'
              : 'Take the chain off or count pin by pin on the bike. The new chain gets the same length — if the old one shifted well.'}>
              <ChainCountSketch de={de} />
            </SketchFrame>
            <div className="max-w-[200px]">
              <NumberInput
                value={counted} onChange={setCounted} min={90} max={140}
                ariaLabel={de ? 'Gezählte Glieder' : 'Links counted'} theme={theme}
                suffix={de ? 'Glieder' : 'links'} placeholder={de ? 'z. B. 112' : 'e.g. 112'}
              />
            </div>
            {counted.trim() !== '' && !countValid && (
              <StepNote>{de ? 'Rennrad- und MTB-Ketten liegen zwischen 90 und 140 Gliedern.' : 'Road and MTB chains are between 90 and 140 links.'}</StepNote>
            )}
            {countValid && countedN % 2 === 1 && (
              <StepNote>{de ? `Ungerade — vermutlich verzählt. Wir rechnen mit ${countedLinks}.` : `Odd — probably miscounted. We use ${countedLinks}.`}</StepNote>
            )}
          </>
        )}
      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : 'kettenlaenge'}
        compact={compact}
        value={fitting ?? links ?? '—'}
        unit={fitting ? t.tools.length.buyLinks : t.tools.length.links}
        hero={toRemove ? <ChainTrimBar remove={toRemove} de={de} /> : undefined}
        verdict={links && fitting
          ? t.tools.length.resultVerdict
            .replace('{links}', String(links))
            .replace('{from}', String(fitting))
            .replace('{n}', String(toRemove))
          : links
            ? t.tools.length.tooShort
            : mode === 'count'
              ? (de ? 'Gezählte Glieder eintragen.' : 'Enter the links you counted.')
              : undefined}
        tone={links ? 'good' : 'neutral'}
        facts={links
          ? [
              { label: t.tools.length.factCalculated, value: `${links} ${t.tools.length.links}` },
              ...(toRemove !== null && fitting
                ? [{ label: t.tools.length.factRemove, value: `${toRemove} ${t.tools.length.links}` }]
                : []),
            ]
          : []}
        actions={<ResultActions compact={compact} shareUrl={shareUrl('/rechner/kettenlaenge', profile.snapshot)} />}
        cta={(
          <ToolCTA href="/rechner/passende-kette">{t.tools.length.cta}</ToolCTA>
        )}
      />

    </ToolCard>
  );
}
