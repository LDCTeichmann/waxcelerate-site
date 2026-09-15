// ── Lohnt sich Wachs fuer dich? ─────────────────────────────────────────────
//
// Fasst seit 09/2026 den Umstieg- und den Ersparnis-Rechner zusammen. Beide
// beantworteten dieselbe Frage — „was spare ich gegenueber Oel?" — und zeigten
// bei einer Kette sogar dieselbe Zahl. Die Rotation ist jetzt eine Eingabe
// dieser Karte statt einer eigenen.
//
// Was die Vorgaenger falsch machten und hier nicht mehr steht:
//  - Dieselben Zahlen dreifach: Einkaufsliste, Tabelle „Pro Jahr" und eine
//    Kostenkurve. Die Kurve war zudem bei jedem realistischen Profil nutzlos:
//    der Break-even liegt bei ein bis zwei Monaten, auf einer 24-Monats-Achse
//    also in der Ecke unten links. Jetzt eine Grafik (CostDumbbell), die zeigt,
//    WOHER die Ersparnis kommt.
//  - Zwei widerspruechliche Startbetraege (Einkaufsliste 39,85 € gegen
//    „Start: Werkzeug 10 €" in der Kurve). Jetzt ein Einstiegsbetrag als
//    Kennzahl; das Werkzeug als echter Mehraufwand steht im Urteilssatz.
//  - Die Kassettenskizze „eine Kette lange gefahren" gegen „Rotation" war kein
//    fairer Vergleich — eine rechtzeitig getauschte Einzelkette schont die
//    Kassette genauso. Der Rotationsvorteil ist die Zahl der Wachs-Sessions.
//  - Ein fest verdrahteter Ketten-Kit-Rabatt (5/10 %) ohne Grundlage in
//    data.ts (CLAUDE.md Regel 1). Bis Luca einen Ketten-Rabatt bestaetigt,
//    rechnet die Karte ohne.
//
// Gerechnet wird ausschliesslich mit waxMath.drivetrainCosts — dieselbe
// Rechnung wie auf der Produktseite (WaxCalculator), jetzt auch mit derselben
// Antriebsklasse (DRIVETRAIN_CLASSES).

import { useState } from 'react';
import { HelpCircle, Scale } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import {
  drivetrainCosts, DRIVETRAIN_CLASSES, referenceWax, costPerApplication, severityFactor,
  OIL_SEVERITY_EXPONENT, WAX_SEVERITY_EXPONENT, OIL_CHAIN_KM, OIL_CASSETTE_KM, WAX_CHAIN_KM,
  WAX_CASSETTE_KM, OIL_PRICE_PER_APP, OIL_APP_INTERVAL_KM,
} from '@/lib/waxMath';
import { CalcTrace, CalcTraceDisclosure, CalcTraceHeading, type TraceRow } from '@/components/tools/CalcTrace';
import { accessories } from '@/lib/data';
import { shareUrl, toolParam } from '@/lib/toolState';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolCTA, TogButton, ChipRow, StepNote, InfoPopover,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';
import { CostDumbbell, SketchFrame } from '@/components/tools/sketches';

const CHAIN_COUNTS = [1, 2, 3] as const;

/** Empfehlung nach Jahresleistung — unter 2.500 km traegt sich keine zweite
 *  Kette, ab 8.000 km rechnen sich drei (siehe toolRegistry „ersparnis"). */
function recommendedChains(kmPerYear: number): 1 | 2 | 3 {
  return kmPerYear < 2500 ? 1 : kmPerYear >= 8000 ? 3 : 2;
}

export function CostCalculator({ profile, compact, preselectRotation, slug = 'umstieg' }: {
  profile: ToolProfileState; compact?: boolean;
  /** Auf /rechner/ersparnis mit der empfohlenen Kettenzahl starten, sonst mit
   *  einer Kette — dem ehrlichen Einstiegsfall. */
  preselectRotation?: boolean;
  /** Welche Einzelseite geteilt und getrackt wird. */
  slug?: 'umstieg' | 'ersparnis';
}) {
  const { t, lang } = useLanguage();
  const c = t.tools.cost;
  const de = lang === 'de';
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

  const kmPerYear = profile.kmPerWeek * 52;
  const recommended = recommendedChains(kmPerYear);
  // Geteilte Links tragen den Kartenzustand (k = Ketten, at = Antrieb), sonst
  // zeigt der Empfaenger eine andere Rechnung als der Absender.
  const [chains, setChains] = useState<1 | 2 | 3>(() => {
    const k = Number(toolParam('k'));
    return k === 1 || k === 2 || k === 3 ? k : preselectRotation ? recommended : 1;
  });
  // Default XT: dieselbe Vorwahl wie der Rechner auf der Produktseite.
  const [clsIdx, setClsIdx] = useState(() => {
    const i = DRIVETRAIN_CLASSES.findIndex(d => d.id === toolParam('at'));
    return i >= 0 ? i : 1;
  });
  const cls = DRIVETRAIN_CLASSES[clsIdx];

  const costs = drivetrainCosts({
    kmPerYear, rewaxKm: profile.interval, chains,
    chainPrice: cls.chainPrice, cassettePrice: cls.cassettePrice,
  });

  // Werkzeug ist der echte Mehraufwand gegenueber Weiteroelen (Schmierstoff
  // kauft man in beiden Welten). Ein Topf steht bewusst nicht dabei: ein alter
  // Reiskocher reicht, und ein erfundener Topfpreis verteuerte den Einstieg.
  const toolingCost = accessories
    .filter(a => a.slug === 'quick-link-zange' || a.slug === 'aufhaengedraht')
    .reduce((sum, a) => sum + a.price, 0);
  const extraChains = chains - 1;
  const start = referenceWax.price + toolingCost + extraChains * cls.chainPrice;
  const breakEven = costs.savingsPerYear > 0
    ? Math.max(1, Math.ceil((toolingCost / costs.savingsPerYear) * 12))
    : null;

  const rows = [
    { label: t.tools.shared.breakdownChain, ...costs.breakdown.chain },
    { label: t.tools.shared.breakdownCassette, ...costs.breakdown.cassette },
    { label: t.tools.shared.breakdownLube, ...costs.breakdown.lube },
  ];

  // Dieselbe Rechnung wie drivetrainCosts(), Posten fuer Posten mit den
  // eingesetzten Zahlen — der Haertefaktor kommt aus dem Wachsintervall.
  const sev = severityFactor(profile.interval);
  const oilWear = Math.pow(sev, OIL_SEVERITY_EXPONENT);
  const waxWear = Math.pow(sev, WAX_SEVERITY_EXPONENT);
  const num = (n: number, d = 0) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const km = (n: number) => `${num(n)} km`;
  const sh = t.tools.shared;
  const waxPerApp = Math.round((costPerApplication(referenceWax) ?? 0) * 100) / 100;
  const perYear = (price: number, life: number, wear: number) =>
    `${eur(price)} ÷ ${km(life)} × ${num(wear, 2)} × ${km(kmPerYear)}`;
  const trace: TraceRow[] = [
    { label: `${sh.breakdownChain} ${sh.breakdownOil}`, detail: perYear(cls.chainPrice, OIL_CHAIN_KM, oilWear), value: eur(costs.breakdown.chain.oil) },
    { label: `${sh.breakdownChain} ${sh.breakdownWax}`, detail: perYear(cls.chainPrice, WAX_CHAIN_KM[chains - 1], waxWear), value: eur(costs.breakdown.chain.wax) },
    { label: `${sh.breakdownCassette} ${sh.breakdownOil}`, detail: perYear(cls.cassettePrice, OIL_CASSETTE_KM, oilWear), value: eur(costs.breakdown.cassette.oil) },
    { label: `${sh.breakdownCassette} ${sh.breakdownWax}`, detail: perYear(cls.cassettePrice, WAX_CASSETTE_KM[chains - 1], waxWear), value: eur(costs.breakdown.cassette.wax) },
    { label: `${sh.breakdownLube} ${sh.breakdownOil}`, detail: `${eur(OIL_PRICE_PER_APP)} ÷ ${km(OIL_APP_INTERVAL_KM)} × ${km(kmPerYear)}`, value: eur(costs.breakdown.lube.oil) },
    { label: `${sh.breakdownLube} ${sh.breakdownWax}`, detail: `${eur(waxPerApp)} ÷ ${km(profile.interval)} × ${km(kmPerYear)}`, value: eur(costs.breakdown.lube.wax) },
    { label: sh.traceSavings, detail: `${eur(costs.oilPerYear)} − ${eur(costs.waxPerYear)}`, value: eur(costs.savingsPerYear), total: true },
  ];

  const system = profile.system ?? 'shimano';
  const speedKey = profile.speed === 11 ? '11' : '12';

  return (
    <ToolCard>
      <ToolHeader
        icon={<Scale className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={c.title}
        subtitle={c.subtitle}
        info={(
          <InfoPopover
            ariaLabel={c.infoLabel}
            trigger={open => <HelpCircle className="h-4 w-4" style={{ color: open ? 'var(--brand)' : 'var(--txff)' }} />}
          >
            <StepNote>
              {t.tools.switch.degreaseNote}{' '}
              <a href="/rechner/passende-kette" className="font-medium" style={{ color: 'var(--brand)' }}>
                {t.tools.switch.degreaseAlt}
              </a>
            </StepNote>
            <StepNote>{c.blockNote}</StepNote>
            <StepNote>{t.tools.switch.potNote}</StepNote>
            {costs.waxSessionsPerYear > 52 && (
              <StepNote>
                {t.tools.switch.hybridHint}{' '}
                <a href="/blog/tropfwachs-hybrid-methode" className="font-medium" style={{ color: 'var(--brand)' }}>
                  {t.tools.switch.hybridLink}
                </a>
              </StepNote>
            )}
            <CalcTraceHeading />
            <CalcTrace rows={trace} />
          </InfoPopover>
        )}
      />

      <StepList>
        <div className="cq-split cq-chart">
          <div className="flex flex-col gap-3">
            <StepField step={1} label={c.drivetrain} value={cls.model} help={c.helpDrivetrain}>
              <ChipRow>
                {DRIVETRAIN_CLASSES.map((d, i) => (
                  <TogButton key={d.id} active={clsIdx === i} onClick={() => setClsIdx(i)}>
                    {de ? d.de : d.en}
                  </TogButton>
                ))}
              </ChipRow>
            </StepField>
            <StepField
              step={2}
              label={c.chains}
              value={chains === recommended ? t.tools.shared.recommended : undefined}
              help={c.helpChains}
            >
              <ChipRow>
                {CHAIN_COUNTS.map(n => (
                  <TogButton key={n} active={chains === n} onClick={() => setChains(n)}>
                    {n}
                  </TogButton>
                ))}
              </ChipRow>
            </StepField>
          </div>

          <SketchFrame>
            <CostDumbbell rows={rows} oilLabel={c.chartOil} waxLabel={c.chartWax} perYear={c.chartPerYear} eur={eur}
              net={costs.waxPerYear - costs.oilPerYear} />
          </SketchFrame>
        </div>
      </StepList>

      <ResultPanel
        toolSlug={compact ? undefined : slug}
        compact={compact}
        value={<AnimatedNumber value={costs.savingsPerYear} suffix=" €" />}
        unit={costs.savingsPerYear > 0 ? c.unit : undefined}
        verdict={breakEven
          ? c.verdict
            .replace('{tools}', eur(toolingCost))
            .replace('{months}', breakEven === 1 ? c.oneMonth : c.months.replace('{n}', String(breakEven)))
          : t.tools.switch.neverNote}
        tone={costs.savingsPerYear > 0 ? 'good' : 'neutral'}
        facts={[
          {
            label: c.start,
            value: extraChains > 0
              ? c.startWithChains.replace('{sum}', eur(Math.round(start * 100) / 100)).replace('{n}', String(extraChains))
              : eur(Math.round(start * 100) / 100),
          },
          {
            label: c.waxing,
            value: chains > 1
              ? c.sessionsRotation.replace('{n}', String(costs.waxSessionsPerYear)).replace('{chains}', String(chains))
              : c.sessions.replace('{n}', String(costs.waxSessionsPerYear)),
          },
        ]}
        actions={<ResultActions compact={compact} shareUrl={shareUrl(`/rechner/${slug}`, profile.snapshot, { k: chains, at: cls.id })} />}
        cta={chains === 1
          ? <ToolCTA href="/starter-set">{c.ctaStarter}</ToolCTA>
          : <ToolCTA href={`/ketten?marke=${system}&gang=${speedKey}`}>{c.ctaChains}</ToolCTA>}
      />
      {!compact && <CalcTraceDisclosure rows={trace} />}
    </ToolCard>
  );
}
