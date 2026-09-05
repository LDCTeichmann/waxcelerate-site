// ── Wie viele Glieder braucht meine Kette? ──────────────────────────────────
//
// Drei echte Pflichteingaben — nicht weiter kuerzbar, ohne die Rechnung falsch
// zu machen. Kompakt als eine Reihe statt drei gestapelter Schritte: das ist
// der Rechner mit den meisten Eingaben im Deck, und im Deck haben alle sechs
// Karten dieselbe feste Hoehe (ToolTrack.tsx) — drei volle StepFields
// untereinander sprengten sie zuverlaessig.
//
// „Kettenstrebe", „groesstes Kettenblatt", „groesstes Ritzel" sagen ohne
// Erklaerung nichts — der Fragezeichen-Knopf pro Feld oeffnet ein Popover mit
// Skizze, ohne die Karte zu verlaengern (InfoPopover, primitives.tsx).

import { useState } from 'react';
import { Ruler, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { chainLengthLinks } from '@/lib/waxMath';
import { products } from '@/lib/data';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, NumberInput, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { ChainstayDiagram } from '@/components/tools/diagrams';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

/** Eine schmale Spalte der Eingabe-Reihe: kurzes Label + Popover + Zahl. */
function CompactField({ label, ariaLabel, help, figure, children }: {
  label: string; ariaLabel: string; help?: string; figure?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-meta uppercase tracking-[0.06em] font-medium truncate" style={{ color: 'var(--txf)' }}>
          {label}
        </span>
        {(help || figure) && (
          <InfoPopover
            ariaLabel={`${ariaLabel}: Erklärung`}
            trigger={open => <HelpCircle className="h-3 w-3" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            {help && <p className="text-[12px] leading-snug" style={{ color: 'var(--txm)' }}>{help}</p>}
            {figure && <div className={help ? 'mt-1' : ''}>{figure}</div>}
          </InfoPopover>
        )}
      </div>
      {children}
    </div>
  );
}

export function ChainLengthCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';

  // Vorbelegt mit einem gaengigen Rennrad-Setup, damit die Karte nie leer
  // dasteht und man am Beispiel sieht, was gemeint ist.
  const [chainstay, setChainstay] = useState('425');
  const [chainring, setChainring] = useState('50');
  const [sprocket, setSprocket] = useState('34');

  const n = {
    chainstayMm: Number(chainstay),
    bigChainring: Number(chainring),
    bigSprocket: Number(sprocket),
  };
  const valid =
    n.chainstayMm >= 350 && n.chainstayMm <= 550 &&
    n.bigChainring >= 20 && n.bigChainring <= 60 &&
    n.bigSprocket >= 9 && n.bigSprocket <= 60;
  const links = valid ? chainLengthLinks(n) : null;

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
      />

      <StepList>
        <div className="grid grid-cols-3 gap-2.5">
          <CompactField
            label={de ? 'Strebe' : 'Stay'}
            ariaLabel={t.tools.length.chainstay}
            help={t.tools.length.helpChainstay}
            figure={<ChainstayDiagram />}
          >
            <NumberInput
              value={chainstay} onChange={setChainstay} min={350} max={550}
              ariaLabel={t.tools.length.chainstay} theme={theme} suffix="mm"
            />
          </CompactField>

          <CompactField
            label={de ? 'Kettenblatt' : 'Chainring'}
            ariaLabel={t.tools.length.bigChainring}
            help={t.tools.length.helpChainring}
          >
            <NumberInput
              value={chainring} onChange={setChainring} min={20} max={60}
              ariaLabel={t.tools.length.bigChainring} theme={theme}
            />
          </CompactField>

          <CompactField
            label={de ? 'Ritzel' : 'Sprocket'}
            ariaLabel={t.tools.length.bigSprocket}
            help={t.tools.length.helpSprocket}
          >
            <NumberInput
              value={sprocket} onChange={setSprocket} min={9} max={60}
              ariaLabel={t.tools.length.bigSprocket} theme={theme}
            />
          </CompactField>
        </div>

        {!valid && (
          <StepNote>
            {de
              ? 'Kettenstrebe 350–550 mm, Kettenblatt 20–60 Zähne, Ritzel 9–60 Zähne.'
              : 'Chainstay 350–550 mm, chainring 20–60 teeth, sprocket 9–60 teeth.'}
          </StepNote>
        )}

        <InfoPopover
          ariaLabel={de ? 'Details zur Kettenlänge' : 'Details on chain length'}
          trigger={() => (
            <span className="text-[12px] font-medium" style={{ color: 'var(--brand)' }}>
              {de ? 'Details zur Kettenlänge' : 'Details on chain length'}
            </span>
          )}
        >
          <StepNote>{t.tools.length.onlyDerailleur}</StepNote>
          <StepNote>
            {links && !fitting
              ? t.tools.length.tooShort
              : t.tools.length.shortenNote.replace('{lengths}', stockLengths.join(', '))}
          </StepNote>
          <StepNote>{t.tools.length.crossCheck}</StepNote>
        </InfoPopover>
      </StepList>

      <ResultPanel
        value={links ?? '—'}
        unit={t.tools.length.links}
        verdict={de
          ? 'Startwert nach der Park-Tool-Formel — immer auf eine gerade Zahl aufgerundet.'
          : 'Starting figure from the Park Tool formula — always rounded up to an even number.'}
        tone={links ? 'good' : 'neutral'}
        facts={toRemove !== null && fitting
          ? [{
              label: t.tools.length.shorten,
              value: t.tools.length.shortenValue
                .replace('{n}', String(toRemove))
                .replace('{from}', String(fitting)),
            }]
          : []}
        actions={<ResultActions shareUrl={shareUrl('/rechner/kettenlaenge', profile.snapshot)} />}
      />

      <ToolFooter>
        <ToolCTA href="/rechner/passende-kette">{t.tools.length.cta}</ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
