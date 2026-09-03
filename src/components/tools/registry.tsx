// ── Slug → Komponente ───────────────────────────────────────────────────────
//
// Getrennt von lib/toolRegistry.ts, weil diese Datei React und Icons zieht und
// die Prerender-Skripte unter scripts/ die reinen Daten von dort ohne Browser
// lesen muessen.
//
// Nach aussen gibt es hier ausschliesslich Komponenten, keine Funktionen, die
// Komponenten oder Nodes zurueckgeben: eine aufgerufene Funktion, die eine
// Komponente liefert, sieht fuer react-hooks/static-components aus wie eine
// waehrend des Renderns erzeugte Komponente, und gemischte Exporte brechen
// Fast Refresh (react-refresh/only-export-components).

import { Calculator, Gauge, Ruler, Link2, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { TOOLS } from '@/lib/toolRegistry';
import { IntervalCalculator } from '@/components/tools/calculators/IntervalCalculator';
import { WearCalculator } from '@/components/tools/calculators/WearCalculator';
import { ChainLengthCalculator } from '@/components/tools/calculators/ChainLengthCalculator';
import { ChainMatchCalculator } from '@/components/tools/calculators/ChainMatchCalculator';
import { SwitchCalculator } from '@/components/tools/calculators/SwitchCalculator';
import { SavingsCalculator } from '@/components/tools/calculators/SavingsCalculator';
import { ToolTrack } from '@/components/tools/ToolTrack';

type CalcComponent = (props: { profile: ToolProfileState }) => React.ReactElement;
type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const IMPLEMENTATIONS: Record<string, { Comp: CalcComponent; Icon: IconComponent }> = {
  intervall:        { Comp: IntervalCalculator,    Icon: Calculator },
  verschleiss:      { Comp: WearCalculator,        Icon: Gauge },
  kettenlaenge:     { Comp: ChainLengthCalculator, Icon: Ruler },
  'passende-kette': { Comp: ChainMatchCalculator,  Icon: Link2 },
  umstieg:          { Comp: SwitchCalculator,      Icon: ArrowRightLeft },
  ersparnis:        { Comp: SavingsCalculator,     Icon: RotateCcw },
};

export function ToolIcon({ slug, className, style }: {
  slug: string; className?: string; style?: React.CSSProperties;
}) {
  const Icon = IMPLEMENTATIONS[slug]?.Icon;
  return Icon ? <Icon className={className} style={style} /> : null;
}

/** Ein einzelner Rechner — fuer die eigenen Seiten unter /rechner. */
export function ToolCalculator({ slug, profile }: { slug: string; profile: ToolProfileState }) {
  const Comp = IMPLEMENTATIONS[slug]?.Comp;
  return Comp ? <Comp profile={profile} /> : null;
}

/** Alle Rechner als Stapel — fuer die Sektion auf der Startseite. */
export function ToolDeck({ profile }: { profile: ToolProfileState }) {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const items = TOOLS.flatMap(entry => {
    const impl = IMPLEMENTATIONS[entry.slug];
    if (!impl) return [];
    return [{
      key: entry.slug,
      label: de ? entry.label : entry.labelEn,
      cover: de ? entry.cover : entry.coverEn,
      hint: de ? entry.hint : entry.hintEn,
      Icon: impl.Icon,
      node: <impl.Comp profile={profile} />,
    }];
  });
  return <ToolTrack items={items} />;
}
