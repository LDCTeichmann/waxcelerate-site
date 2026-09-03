// ── Wie viele Glieder braucht meine Kette? ──────────────────────────────────
//
// Die drei abgefragten Masse sind genau die Stelle, an der ein Rechner jemanden
// verliert, der kein Schrauber-Vokabular hat: „Kettenstrebe", „groesstes
// Kettenblatt", „groesstes Ritzel" sagen ohne Erklaerung nichts. Jeder Schritt
// traegt deshalb eine aufklappbare Zeile, die sagt, wo man das am Rad abliest.

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { chainLengthLinks } from '@/lib/waxMath';
import { shareUrl } from '@/lib/toolState';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, NumberInput, StepNote,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

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

  return (
    <ToolCard>
      <ToolHeader
        icon={<Ruler className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.length.title}
        subtitle={t.tools.length.subtitle}
      />

      <StepList>
        <StepField step={1} label={t.tools.length.chainstay} help={t.tools.length.helpChainstay}>
          <NumberInput
            value={chainstay} onChange={setChainstay} min={350} max={550}
            ariaLabel={t.tools.length.chainstay} theme={theme} suffix="mm"
          />
        </StepField>

        <StepField step={2} label={t.tools.length.bigChainring} help={t.tools.length.helpChainring}>
          <NumberInput
            value={chainring} onChange={setChainring} min={20} max={60}
            ariaLabel={t.tools.length.bigChainring} theme={theme} suffix={t.tools.length.teeth}
          />
        </StepField>

        <StepField step={3} label={t.tools.length.bigSprocket} help={t.tools.length.helpSprocket}>
          <NumberInput
            value={sprocket} onChange={setSprocket} min={9} max={60}
            ariaLabel={t.tools.length.bigSprocket} theme={theme} suffix={t.tools.length.teeth}
          />
        </StepField>

        {!valid && (
          <StepNote>
            {de
              ? 'Kettenstrebe 350–550 mm, Kettenblatt 20–60 Zähne, Ritzel 9–60 Zähne.'
              : 'Chainstay 350–550 mm, chainring 20–60 teeth, sprocket 9–60 teeth.'}
          </StepNote>
        )}
        <StepNote>{t.tools.length.onlyDerailleur}</StepNote>
      </StepList>

      <ResultPanel
        value={links ?? '—'}
        unit={t.tools.length.links}
        verdict={t.tools.length.note}
        tone={links ? 'good' : 'neutral'}
        actions={<ResultActions shareUrl={shareUrl('/rechner/kettenlaenge', profile.snapshot)} />}
      />

      <ToolFooter>
        <ToolCTA href="/rechner/passende-kette">{t.tools.length.cta}</ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
