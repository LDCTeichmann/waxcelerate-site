// ── Wie viele Glieder braucht meine Kette? ──────────────────────────────────
//
// Drei echte Pflichteingaben — nicht weiter kuerzbar, ohne die Rechnung falsch
// zu machen. Kompakt als eine Reihe statt drei gestapelter Schritte: das ist
// der Rechner mit den meisten Eingaben im Deck, und im Deck haben alle sechs
// Karten dieselbe feste Hoehe (ToolTrack.tsx) — drei volle StepFields
// untereinander sprengten sie zuverlaessig.
//
// „Kettenstrebe", „groesstes Kettenblatt", „groesstes Ritzel" sagen ohne
// Erklaerung nichts. Jedes der drei Felder traegt deshalb sein eigenes
// Fragezeichen mit dem Text, wo man den Wert am Rad abliest (i18n:
// length.helpChainstay/helpChainring/helpSprocket). Die frueher hier
// stehende Skizze ist raus — sie kostete Kartenhoehe, die die Sektion
// nicht hat.
//
// Die Heldenzahl ist nicht mehr die Gliederzahl, sondern die Handlung: welche
// Kette kaufen, wie viele Glieder abnehmen. Die reine Rechenzahl steht als
// Kennzahl daneben — vorher fiel sie komplett unter den Tisch, weil
// ResultPanel nur den ersten von zwei Fakten zeigte (siehe ResultPanel.tsx).

import { useState } from 'react';
import { HelpCircle, Ruler } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { chainLengthLinks } from '@/lib/waxMath';
import { products } from '@/lib/data';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, NumberInput, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

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

export function ChainLengthCalculator({ profile, compact }: { profile: ToolProfileState; compact?: boolean }) {
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
        <div className="grid grid-cols-3 gap-2.5">
          <CompactField label={de ? 'Strebe' : 'Stay'} ariaLabel={t.tools.length.chainstay} help={t.tools.length.helpChainstay}>
            <NumberInput
              value={chainstay} onChange={setChainstay} min={350} max={550}
              ariaLabel={t.tools.length.chainstay} theme={theme} suffix="mm"
            />
          </CompactField>

          <CompactField label={de ? 'Kettenblatt' : 'Chainring'} ariaLabel={t.tools.length.bigChainring} help={t.tools.length.helpChainring}>
            <NumberInput
              value={chainring} onChange={setChainring} min={20} max={60}
              ariaLabel={t.tools.length.bigChainring} theme={theme}
            />
          </CompactField>

          <CompactField label={de ? 'Ritzel' : 'Sprocket'} ariaLabel={t.tools.length.bigSprocket} help={t.tools.length.helpSprocket}>
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

        {/* Sichtbare Abkuerzung statt Popover: fuer alle, die kein Massband
            an die Kettenstrebe halten wollen, aber ihre alte Kette noch
            montiert haben. */}
        <p className="text-[12px] leading-snug" style={{ color: 'var(--txm)' }}>
          {t.tools.length.countOldChain}
        </p>

      </StepList>

      <ResultPanel
        compact={compact}
        value={fitting ?? links ?? '—'}
        unit={fitting ? t.tools.length.buyLinks : t.tools.length.links}
        verdict={links && fitting
          ? t.tools.length.resultVerdict
            .replace('{links}', String(links))
            .replace('{from}', String(fitting))
            .replace('{n}', String(toRemove))
          : links
            ? t.tools.length.tooShort
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
