// ── Wie viele Glieder braucht meine Kette? ──────────────────────────────────
//
// Neu. Bergfreunde und Omnicalculator betreiben je einen eigenen Rechner nur
// fuer diese Frage — die Nachfrage ist also belegt. Fuer Waxcelerate ist es
// ausserdem genau die Huerde direkt nach dem Kauf: eine vorgewachste Kette
// kommt mit 116 oder 138 Gliedern und muss gekuerzt werden.

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { chainLengthLinks } from '@/lib/waxMath';
import { shareUrl } from '@/lib/toolState';
import { ToolCard, ToolHeader, FieldLabel, ToolCTA, ToolSeparator } from '@/components/tools/primitives';
import { ToolResult, ResultMeta } from '@/components/tools/ToolResult';
import { ResultActions } from '@/components/tools/ResultActions';

function NumberField({ label, value, onChange, min, max, suffix, theme }: {
  label: string; value: string; onChange: (v: string) => void;
  min: number; max: number; suffix: string; theme: string;
}) {
  return (
    <div>
      <FieldLabel label={label} value={suffix} />
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="w-full px-4 py-3 rounded-xl text-[14px] tabular-nums"
        style={{
          background: 'var(--sf2)', border: '1px solid var(--bd2)', color: 'var(--tx1)',
          colorScheme: theme === 'noir' ? 'dark' : 'light',
        }}
      />
    </div>
  );
}

export function ChainLengthCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const de = lang === 'de';

  // Vorbelegt mit einem gaengigen Rennrad-Setup, damit die Karte nie leer
  // dasteht — wer andere Werte hat, tippt sie ueber.
  const [chainstay, setChainstay] = useState('425');
  const [chainring, setChainring] = useState('50');
  const [sprocket, setSprocket] = useState('34');

  const nums = {
    chainstayMm: Number(chainstay),
    bigChainring: Number(chainring),
    bigSprocket: Number(sprocket),
  };
  const valid =
    nums.chainstayMm >= 350 && nums.chainstayMm <= 550 &&
    nums.bigChainring >= 20 && nums.bigChainring <= 60 &&
    nums.bigSprocket >= 9 && nums.bigSprocket <= 60;

  const links = valid ? chainLengthLinks(nums) : null;

  return (
    <ToolCard>
      <ToolHeader
        icon={<Ruler className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.length.title}
        subtitle={t.tools.length.subtitle}
      />
      <div className="flex flex-col flex-1">
        <ToolResult
          compact
          value={links ?? '—'}
          unit={t.tools.length.links}
          reason={t.tools.length.note}
          meta={<ResultMeta>{t.tools.length.formula}</ResultMeta>}
          actions={<ResultActions shareUrl={shareUrl('/rechner/kettenlaenge', profile.snapshot)} />}
        />

        <ToolSeparator />

        <div className="px-6 pt-3 pb-3 sm:pt-4 sm:pb-4 flex flex-col flex-1 gap-3">
          <NumberField
            label={t.tools.length.chainstay} value={chainstay} onChange={setChainstay}
            min={350} max={550} suffix="mm" theme={theme}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t.tools.length.bigChainring} value={chainring} onChange={setChainring}
              min={20} max={60} suffix={t.tools.length.teeth} theme={theme}
            />
            <NumberField
              label={t.tools.length.bigSprocket} value={sprocket} onChange={setSprocket}
              min={9} max={60} suffix={t.tools.length.teeth} theme={theme}
            />
          </div>
          {!valid && (
            <p className="text-[11px] leading-snug" style={{ color: 'var(--txff)' }}>
              {de
                ? 'Kettenstrebe 350–550 mm, Kettenblatt 20–60 Zähne, Ritzel 9–60 Zähne.'
                : 'Chainstay 350–550 mm, chainring 20–60 teeth, sprocket 9–60 teeth.'}
            </p>
          )}
        </div>

        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA href="/rechner/passende-kette">{t.tools.length.cta}</ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}
