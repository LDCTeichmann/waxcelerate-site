// ── Was kostet der Umstieg auf Wachs? ───────────────────────────────────────
//
// Ersetzt den bisherigen „Wie viel Wachs brauche ich?"-Rechner. Der hatte keine
// einzige eigene Eingabe und war damit kein Rechner, sondern eine
// Produktempfehlung im Rechner-Kostuem — und er beantwortete eine Frage, die
// nur jemand stellt, der ohnehin schon wachst.
//
// Die Frage, die Umsteiger tatsaechlich stellen, ist die nach dem Einstieg:
// was brauche ich einmalig, was kostet es laufend, und ab wann rechnet es sich
// gegen Kettenoel. Die Wachsmenge steckt als Teilantwort weiter darin.

import { ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import {
  applicationsPerBlock, costPerApplication, referenceWax, drivetrainCosts,
  OIL_PRICE_PER_APP, OIL_APP_INTERVAL_KM,
} from '@/lib/waxMath';
import { accessories } from '@/lib/data';
import { shareUrl } from '@/lib/toolState';
import { AnimatedNumber } from '@/components/viz';
import { ToolCard, ToolHeader, FieldLabel, ToolCTA, ToolSeparator } from '@/components/tools/primitives';
import { ToolResult, ResultMeta, ResultDot } from '@/components/tools/ToolResult';
import { AssumptionsDisclosure } from '@/components/tools/AssumptionsDisclosure';
import { ResultActions } from '@/components/tools/ResultActions';

export function SwitchCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n);

  const kmPerYear = profile.kmPerWeek * 52;
  const apps = applicationsPerBlock(referenceWax) ?? 0;
  const perApp = costPerApplication(referenceWax) ?? 0;

  // Wie oft im Jahr gewachst wird, ergibt sich aus dem gemeinsamen Fahrprofil —
  // bewusst ungedeckelt, anders als die Wochenanzeige im Intervall-Rechner.
  // Deren 26-Wochen-Deckel existiert nur, damit dort keine absurde Zahl steht;
  // hier wuerde er die Vorratsdauer eines Wenigfahrers kuenstlich verkuerzen.
  const appsPerYear = kmPerYear / profile.interval;
  const monthsPerBlock = appsPerYear > 0 ? Math.round((apps / appsPerYear) * 12) : 0;

  // Einmalig: Wachsblock, Zange und Draht. Ein Topf steht bewusst nicht in der
  // Liste — fast jeder hat einen alten Reiskocher oder Slow Cooker, und ein
  // erfundener Topfpreis wuerde den Einstieg teurer aussehen lassen, als er ist.
  const pliers = accessories.find(a => a.slug === 'quick-link-zange');
  const wire = accessories.find(a => a.slug === 'aufhaengedraht');
  const startItems = [
    { label: `${referenceWax.weight} ${de ? 'Kettenwachs' : 'chain wax'}`, price: referenceWax.price },
    ...(pliers ? [{ label: de ? pliers.title : pliers.titleEn, price: pliers.price }] : []),
    ...(wire ? [{ label: de ? wire.title : wire.titleEn, price: wire.price }] : []),
  ];
  const startCost = startItems.reduce((sum, i) => sum + i.price, 0);

  const waxRunning = Math.round(appsPerYear * perApp);
  const oilRunning = Math.round((kmPerYear / OIL_APP_INTERVAL_KM) * OIL_PRICE_PER_APP);

  // Amortisation ueber die vollen Antriebskosten, nicht nur ueber den
  // Schmierstoff: der eigentliche Gewinn liegt bei Kette und Kassette.
  const costs = drivetrainCosts({ kmPerYear, rewaxKm: profile.interval, chains: 1 });
  const breakEvenMonths = costs.savingsPerYear > 0
    ? Math.ceil((startCost / costs.savingsPerYear) * 12)
    : null;

  return (
    <ToolCard>
      <ToolHeader
        icon={<ArrowRightLeft className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.switch.title}
        subtitle={t.tools.switch.subtitle}
      />
      <div className="flex flex-col flex-1">
        <ToolResult
          compact
          value={<AnimatedNumber value={breakEvenMonths ?? 0} />}
          unit={t.tools.switch.months}
          reason={breakEvenMonths
            ? (de
              ? `${eur(startCost)} einmalig, danach ${eur(waxRunning)} statt ${eur(oilRunning)} Schmierstoff im Jahr — dazu deutlich länger haltende Kette und Kassette.`
              : `${eur(startCost)} one-off, then ${eur(waxRunning)} instead of ${eur(oilRunning)} of lubricant per year — plus a chain and cassette that last far longer.`)
            : t.tools.switch.neverNote}
          tone="good"
          meta={<>
            <ResultMeta>{t.tools.switch.blockLasts} {apps} {t.tools.switch.applications}</ResultMeta>
            <ResultDot />
            <ResultMeta>{de ? `ca. ${monthsPerBlock} Monate` : `~${monthsPerBlock} months`}</ResultMeta>
          </>}
          actions={<ResultActions shareUrl={shareUrl('/rechner/umstieg', profile.snapshot)} />}
        />

        <ToolSeparator />

        <div className="px-6 pt-3 pb-3 sm:pt-4 sm:pb-4 flex flex-col flex-1">
          <FieldLabel label={t.tools.switch.needList} value={eur(startCost)} />
          <ul className="flex flex-col gap-1.5">
            {startItems.map(i => (
              <li key={i.label} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{i.label}</span>
                <span className="text-[13px] font-medium tabular-nums flex-shrink-0" style={{ color: 'var(--tx2)' }}>
                  {eur(i.price)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] leading-snug mt-2" style={{ color: 'var(--txff)' }}>
            {de
              ? 'Ohne Topf: ein alter Reiskocher oder Slow Cooker tut es, und den haben die meisten schon.'
              : 'No pot listed: an old rice cooker or slow cooker does the job, and most people already own one.'}
          </p>
          <div className="mt-auto pt-3">
            <AssumptionsDisclosure />
          </div>
        </div>

        <div className="px-6 pb-3 pt-1 sm:pb-5 sm:pt-2">
          <ToolCTA href="/starter-set">{t.tools.switch.cta}</ToolCTA>
        </div>
      </div>
    </ToolCard>
  );
}
