// ── Was kostet der Umstieg auf Wachs? ───────────────────────────────────────
//
// Ersetzt den frueheren „Wie viel Wachs brauche ich?"-Rechner, der keine
// einzige eigene Eingabe hatte und damit keiner war.
//
// Drei Fehler der frueheren Fassungen sind hier ausgeraeumt:
//
// 1. Der erste Wachsblock stand sowohl in den Startkosten als auch anteilig in
//    den laufenden Kosten — doppelt bezahlt, Amortisation dadurch von fuenf auf
//    achtzehn Monate verlaengert. Gerechnet wird jetzt in waxMath.switchEconomics
//    ueber den echten Mehraufwand: das Werkzeug. Schmierstoff kauft man beim
//    Oelen genauso.
// 2. Die Kernaussage lautete sinngemaess „danach 20 € statt 6 € Schmierstoff im
//    Jahr" — also ein Nachteil, direkt unter der Ueberschrift, ohne Gegengewicht.
//    Der Gewinn liegt bei Kette und Kassette, nicht beim Schmierstoff. Das
//    Ergebnis zeigt jetzt die volle Aufschluesselung: Kette und Kassette
//    billiger, Schmierstoff teurer, unterm Strich weniger. Der
//    Schmierstoff-Nachteil bleibt sichtbar, dominiert aber nicht mehr.
// 3. Schritt 1 war eine reine Anzeige. Die Blockgroesse (300 g / 500 g) ist
//    jetzt eine echte Wahl — ehrlich mitgesagt, dass der 300er im Einstieg
//    guenstiger, je Wachsung aber teurer ist.

import { HelpCircle, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { switchEconomics, applicationsPerBlock, drivetrainCosts, referenceWax } from '@/lib/waxMath';
import { products } from '@/lib/data';
import { accessories } from '@/lib/data';
import { shareUrl } from '@/lib/toolState';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, TogButton, ChipRow, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

const WAX_SIZE_IDS = ['wax-300', 'wax-500'] as const;

export function SwitchCalculator({ profile, compact }: { profile: ToolProfileState; compact?: boolean }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

  // Blockgroesse ist jetzt eine echte Wahl statt einer festen Anzeige.
  // Vorbelegt mit dem 500er, dem Standardbezugspunkt der Seite.
  const [waxId, setWaxId] = useState<(typeof WAX_SIZE_IDS)[number]>('wax-500');
  const waxProduct = products.find(p => p.id === waxId) ?? referenceWax;

  // Werkzeug ist der echte Mehraufwand gegenueber Weiteroelen. Ein Topf steht
  // bewusst nicht dabei: fast jeder hat einen alten Reiskocher, und ein
  // erfundener Topfpreis liesse den Einstieg teurer aussehen als er ist.
  const pliers = accessories.find(a => a.slug === 'quick-link-zange');
  const wire = accessories.find(a => a.slug === 'aufhaengedraht');
  const tooling = [
    ...(pliers ? [{ label: de ? pliers.title : pliers.titleEn, price: pliers.price }] : []),
    ...(wire ? [{ label: de ? wire.title : wire.titleEn, price: wire.price }] : []),
  ];
  const toolingCost = tooling.reduce((sum, i) => sum + i.price, 0);

  const kmPerYear = profile.kmPerWeek * 52;
  const e = switchEconomics({ kmPerYear, rewaxKm: profile.interval, toolingCost, waxProduct });
  const apps = applicationsPerBlock(waxProduct) ?? 0;
  // Die volle Jahresrechnung — Kette, Kassette und Schmierstoff zusammen,
  // eine Kette, nicht rotiert: der ehrliche Einstiegsfall. Bleibt an
  // referenceWax (500 g) gebunden, unabhaengig von der Blockwahl oben: das
  // ist dieselbe Bezugsgroesse, die auch der Ersparnis-Rechner nutzt.
  const costs = drivetrainCosts({ kmPerYear, rewaxKm: profile.interval, chains: 1 });
  const smallWax = products.find(p => p.id === 'wax-300');

  const startItems = [
    { label: `${waxProduct.weight} ${de ? 'Kettenwachs' : 'chain wax'}`, price: waxProduct.price, extra: false },
    ...tooling.map(i => ({ ...i, extra: true })),
  ];
  const startTotal = startItems.reduce((sum, i) => sum + i.price, 0);

  const maxYearly = Math.max(costs.oilPerYear, costs.waxPerYear, 1);
  const barRow = (label: string, amount: number, color: string) => (
    <div className="flex items-center gap-2">
      <span className="text-meta w-10 flex-shrink-0" style={{ color: 'var(--txff)' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--inset-bd)' }}>
        <div className="h-full rounded-full" style={{ width: `${(amount / maxYearly) * 100}%`, background: color }} />
      </div>
      <span className="text-[12px] font-medium tabular-nums flex-shrink-0" style={{ color: 'var(--tx2)' }}>{eur(amount)}</span>
    </div>
  );

  return (
    <ToolCard>
      <ToolHeader
        icon={<ArrowRightLeft className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.switch.title}
        subtitle={t.tools.switch.subtitle}
        info={(
          <InfoPopover
            ariaLabel={de ? 'Wichtige Hinweise zum Umstieg' : 'Important notes on switching'}
            trigger={open => <HelpCircle className="h-4 w-4" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            <StepNote>
              {t.tools.switch.degreaseNote}{' '}
              <a href="/rechner/passende-kette" className="font-medium" style={{ color: 'var(--brand)' }}>
                {t.tools.switch.degreaseAlt}
              </a>
            </StepNote>
            {e.outlastsShelfLife && smallWax && (
              <StepNote>{t.tools.switch.shelfLifeHint}</StepNote>
            )}
            {e.needsHybridHint && (
              <StepNote>
                {t.tools.switch.hybridHint}{' '}
                <a href="/blog/tropfwachs-hybrid-methode" className="font-medium" style={{ color: 'var(--brand)' }}>
                  {t.tools.switch.hybridLink}
                </a>
              </StepNote>
            )}
          </InfoPopover>
        )}
      />

      <StepList>
        <StepField
          step={1}
          label={t.tools.switch.needList}
          value={eur(startTotal)}
          help={`${de
            ? 'Der Wachsblock ist Schmierstoff — den kaufst du beim Ölen genauso, nur in anderer Form. Als echten Mehraufwand rechnen wir deshalb nur Zange und Draht.'
            : 'The wax block is lubricant — you buy that either way, just in a different form. So only the pliers and wire count as a real extra.'} ${t.tools.switch.potNote}`}
        >
          <ChipRow>
            {WAX_SIZE_IDS.map(id => {
              const p = products.find(pr => pr.id === id);
              if (!p) return null;
              return (
                <TogButton key={id} active={waxId === id} onClick={() => setWaxId(id)}>
                  {p.weight} · {eur(p.price)}
                </TogButton>
              );
            })}
          </ChipRow>
          <StepNote>{t.tools.switch.waxSizeNote}</StepNote>
          {/* Die Einzelposten stehen nur auf der eigenen Rechnerseite. Im Deck
              haengt die Kartenhoehe an der Bildschirmhoehe; dort steht die
              Summe rechts neben der Schrittbeschriftung, die Aufschluesselung
              ist einen Klick entfernt. */}
          {!compact && (
          <ul className="flex flex-col gap-1.5 mt-1">
            {startItems.map(i => (
              <li key={i.label} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] min-w-0 truncate" style={{ color: 'var(--txf)' }}>
                  {i.label}
                  {i.extra && (
                    <span className="text-meta ml-1.5" style={{ color: 'var(--brand)' }}>
                      {de ? 'Mehraufwand' : 'extra'}
                    </span>
                  )}
                </span>
                <span className="text-[13px] font-medium tabular-nums flex-shrink-0" style={{ color: 'var(--tx2)' }}>
                  {eur(i.price)}
                </span>
              </li>
            ))}
          </ul>
          )}
        </StepField>

        {/* Die volle Jahresrechnung statt nur des Schmierstoff-Vergleichs:
            Kette und Kassette sprechen fuer Wachs, der Schmierstoff dagegen —
            vorher stand nur die Schmierstoffzeile hier, und das ist die eine
            Zeile, in der Wachs verliert. */}
        {/* Die volle Jahrestabelle steht nur auf der eigenen Rechnerseite.
            Im Deck zeigt der Ergebnisblock denselben Vergleich als Balken
            (Oel gegen Wachs) — die Tabelle waere dort eine zweite Fassung
            derselben Zahlen und kostet 119 px, die die Sektion nicht hat. */}
        {!compact && (
        <StepField
          step={2}
          label={de ? 'Was es dich im Jahr kostet' : 'What it costs you per year'}
          help={de
            ? 'Ergibt sich aus deinem Fahrprofil oben. Mehr Kilometer und härtere Bedingungen heißen öfter wachsen — und gleichzeitig größere Ersparnis, weil geölte Ketten dort am schnellsten verschleißen.'
            : 'Comes from your riding profile above. More kilometres and harsher conditions mean waxing more often — and a bigger saving, because oiled chains wear fastest there.'}
        >
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1.5 items-baseline">
            <span />
            <span className="text-meta text-right" style={{ color: 'var(--txff)' }}>{de ? 'Öl' : 'Oil'}</span>
            <span className="text-meta text-right" style={{ color: 'var(--brand)' }}>{de ? 'Wachs' : 'Wax'}</span>

            <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{t.tools.switch.breakdownChain}</span>
            <span className="text-[13px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(costs.breakdown.chain.oil)}</span>
            <span className="text-[13px] text-right font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(costs.breakdown.chain.wax)}</span>

            <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{t.tools.switch.breakdownCassette}</span>
            <span className="text-[13px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(costs.breakdown.cassette.oil)}</span>
            <span className="text-[13px] text-right font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(costs.breakdown.cassette.wax)}</span>

            <span className="text-[13px]" style={{ color: 'var(--txf)' }}>{t.tools.switch.breakdownLube}</span>
            <span className="text-[13px] text-right tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(costs.breakdown.lube.oil)}</span>
            <span className="text-[13px] text-right font-medium tabular-nums" style={{ color: 'var(--txm)' }}>+{eur(costs.breakdown.lube.wax)}</span>
          </div>
        </StepField>
        )}

      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : 'umstieg'}
        compact={compact}
        value={<AnimatedNumber value={costs.savingsPerYear} prefix="€" />}
        unit={t.tools.switch.perYearLess}
        hero={(
          <div className="flex flex-col gap-1">
            {barRow(de ? 'Öl' : 'Oil', costs.oilPerYear, 'var(--txf)')}
            {barRow(de ? 'Wachs' : 'Wax', costs.waxPerYear, 'var(--brand)')}
          </div>
        )}
        verdict={costs.savingsPerYear > 0
          ? t.tools.switch.resultVerdict.replace('{savings}', eur(costs.savingsPerYear))
          : t.tools.switch.neverNote}
        tone="good"
        facts={[
          { label: t.tools.switch.toolingPaidOff, value: e.breakEvenMonths ? `${e.breakEvenMonths} ${e.breakEvenMonths === 1 ? t.tools.switch.oneMonth : t.tools.switch.months}` : '—' },
          { label: t.tools.switch.blockLasts, value: `${apps} ${t.tools.switch.applications} · ${de ? `ca. ${e.monthsPerBlock} Mon.` : `~${e.monthsPerBlock} mo.`}` },
        ]}
        actions={<ResultActions compact={compact} shareUrl={shareUrl('/rechner/umstieg', profile.snapshot)} />}
        cta={(
          <ToolCTA href="/starter-set">{t.tools.switch.cta}</ToolCTA>
        )}
      />

    </ToolCard>
  );
}
