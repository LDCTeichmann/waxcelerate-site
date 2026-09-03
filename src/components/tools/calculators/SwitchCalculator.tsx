// ── Was kostet der Umstieg auf Wachs? ───────────────────────────────────────
//
// Ersetzt den frueheren „Wie viel Wachs brauche ich?"-Rechner, der keine
// einzige eigene Eingabe hatte und damit keiner war.
//
// Zwei Fehler der ersten Fassung sind hier ausgeraeumt:
//
// 1. Der erste Wachsblock stand sowohl in den Startkosten als auch anteilig in
//    den laufenden Kosten — doppelt bezahlt, Amortisation dadurch von fuenf auf
//    achtzehn Monate verlaengert. Gerechnet wird jetzt in waxMath.switchEconomics
//    ueber den echten Mehraufwand: das Werkzeug. Schmierstoff kauft man beim
//    Oelen genauso.
// 2. Die Kernaussage lautete sinngemaess „danach 17 € statt 8 € Schmierstoff im
//    Jahr" — also ein Nachteil, direkt unter der Ueberschrift. Der Gewinn liegt
//    nicht beim Schmierstoff, sondern bei Kette und Kassette, und genau das
//    sagt das Ergebnis jetzt.

import { ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { switchEconomics, applicationsPerBlock, referenceWax } from '@/lib/waxMath';
import { products } from '@/lib/data';
import { accessories } from '@/lib/data';
import { shareUrl } from '@/lib/toolState';
import { AnimatedNumber } from '@/components/viz';
import {
  ToolCard, ToolHeader, StepList, ToolFooter, ToolCTA, StepNote,
} from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { ResultActions } from '@/components/tools/ResultActions';

export function SwitchCalculator({ profile }: { profile: ToolProfileState }) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';
  const eur = (n: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-US', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

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
  const e = switchEconomics({ kmPerYear, rewaxKm: profile.interval, toolingCost });
  const apps = applicationsPerBlock(referenceWax) ?? 0;
  const smallWax = products.find(p => p.id === 'wax-300');

  const startItems = [
    { label: `${referenceWax.weight} ${de ? 'Kettenwachs' : 'chain wax'}`, price: referenceWax.price, extra: false },
    ...tooling.map(i => ({ ...i, extra: true })),
  ];
  const startTotal = startItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <ToolCard>
      <ToolHeader
        icon={<ArrowRightLeft className="h-4 w-4" style={{ color: 'var(--txm)' }} />}
        title={t.tools.switch.title}
        subtitle={t.tools.switch.subtitle}
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
          <ul className="flex flex-col gap-1.5">
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
          {/* Die haeufigste Stolperfalle beim Umstieg, und die einzige, die
              nicht in Euro steht: Fabrikfett und Altoel blockieren das Wachs
              vollstaendig. Wer das erst am Wachsabend merkt, hoert wieder auf. */}
          <StepNote>
            {t.tools.switch.degreaseNote}{' '}
            <a href="/rechner/passende-kette" className="font-medium" style={{ color: 'var(--brand)' }}>
              {t.tools.switch.degreaseAlt}
            </a>
          </StepNote>
        </StepField>

        <StepField
          step={2}
          label={de ? 'Laufend im Jahr' : 'Running per year'}
          value={`${kmPerYear.toLocaleString(de ? 'de-DE' : 'en-US')} km`}
          help={de
            ? 'Ergibt sich aus deinem Fahrprofil oben. Mehr Kilometer und härtere Bedingungen heißen öfter wachsen — und gleichzeitig größere Ersparnis, weil geölte Ketten dort am schnellsten verschleißen.'
            : 'Comes from your riding profile above. More kilometres and harsher conditions mean waxing more often — and a bigger saving, because oiled chains wear fastest there.'}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px]" style={{ color: 'var(--txf)' }}>
                {de ? 'Wachs' : 'Wax'} · {Math.round(e.applicationsPerYear)}× {de ? 'im Jahr' : 'per year'}
              </span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(e.waxPerYear)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px]" style={{ color: 'var(--txf)' }}>
                {de ? 'Kettenöl zum Vergleich' : 'Chain oil for comparison'}
              </span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--tx2)' }}>{eur(e.oilPerYear)}</span>
            </div>
          </div>
          <StepNote>
            {de
              ? 'Schmierstoff allein ist beim Wachsen teurer. Der Vorteil steckt in Kette und Kassette — die halten deutlich länger.'
              : 'Lubricant alone costs more with wax. The advantage is in the chain and cassette, which last far longer.'}
          </StepNote>
          {/* Zwei Grenzfaelle, die eine reine Hochrechnung sonst verschweigt:
              ein Vorrat, der aelter wird als er haelt, und ein Intervall, das
              oefter als woechentlich waxen bedeuten wuerde. Beides waere eine
              Empfehlung, der in der Praxis niemand folgt. */}
          {e.outlastsShelfLife && smallWax && (
            <StepNote>
              {t.tools.switch.shelfLifeHint}
            </StepNote>
          )}
          {e.needsHybridHint && (
            <StepNote>
              {t.tools.switch.hybridHint}{' '}
              <a href="/blog/tropfwachs-hybrid-methode" className="font-medium" style={{ color: 'var(--brand)' }}>
                {t.tools.switch.hybridLink}
              </a>
            </StepNote>
          )}
        </StepField>
      </StepList>

      <ResultPanel
        value={e.breakEvenMonths ? <AnimatedNumber value={e.breakEvenMonths} /> : '—'}
        unit={e.breakEvenMonths === 1 ? t.tools.switch.oneMonth : t.tools.switch.months}
        verdict={e.breakEvenMonths
          ? (de
            ? `So lange dauert es, bis ${eur(toolingCost)} Werkzeug wieder drin sind — danach sparst du rund ${eur(e.savingsPerYear)} im Jahr an Kette, Kassette und Schmierstoff zusammen.`
            : `That is how long it takes to recover ${eur(toolingCost)} of tooling — after that you save around ${eur(e.savingsPerYear)} a year across chain, cassette and lubricant.`)
          : t.tools.switch.neverNote}
        tone="good"
        facts={[
          { label: t.tools.switch.savesPerYear, value: `${eur(e.savingsPerYear)}${de ? '/Jahr' : '/yr'}` },
          { label: t.tools.switch.blockLasts, value: `${apps} ${t.tools.switch.applications} · ${de ? `ca. ${e.monthsPerBlock} Mon.` : `~${e.monthsPerBlock} mo.`}` },
        ]}
        actions={<ResultActions shareUrl={shareUrl('/rechner/umstieg', profile.snapshot)} />}
      />

      <ToolFooter>
        <ToolCTA href="/starter-set">{t.tools.switch.cta}</ToolCTA>
      </ToolFooter>
    </ToolCard>
  );
}
