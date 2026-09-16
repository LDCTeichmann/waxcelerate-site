import type { Product } from '@/lib/data';
import type { RichContent } from '@/lib/productContent';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { useLanguage } from '@/hooks/useLanguage';
import { ProofStrip, ChangeForYou } from '../wax/ProofAndChange';
import { FrictionLens } from '../wax/FrictionLens';
import { WaxCalculator } from '../wax/WaxCalculator';
import { WaxReviews, WaxFaq, pickProofQuote } from '../wax/WaxSections';
import { ChainHero } from './ChainHero';
import { ChainProcess, ChainFit, ChainData, ChainAfter, ChainClosing } from './ChainSections';
import '../wax/wax.css';
import './chain.css';

// ══════════════════════════════════════════════════════════════
// KETTEN-PRODUKTSEITE v1 (15.09.2026)
// ══════════════════════════════════════════════════════════════
// Uebertraegt die Wachsseite v5 auf die vorgewachsten Ketten. Alles, was
// produktneutral ist (Beweis, "Was sich aendert", Reibungs-Lupe mit Zahnflanke,
// Rechner, Stimmen, Fragen), kommt unveraendert von dort. Neu sind die Teile,
// die nur eine Kette hat: was im Karton liegt, was wir mit ihr machen, ob sie
// ans eigene Rad passt, Einbau und was nach dem ersten Film kommt.
//
// Reihenfolge: Kaufbox → Beweis → was sich aendert → warum → was wir machen →
// rechnet es sich → passt sie → Stimmen → Daten und Einbau → danach → Fragen.
//
// Der Rechner faellt bei 9-fach weg: fuer 8–10-fach sind Ketten- und
// Kassettenpreise noch offen (PROJECT.md), eine Ersparnis ohne Kassettenbetrag
// waere geschoent. Die Kapitelnummern zaehlen deshalb mit.
export function ChainProductPage(props: {
  product: Product;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  titleText: string;
  rc: RichContent | undefined;
  gallery: { src: string; title: string; fact: string }[];
  profile: ToolProfileState;
  buyRef: React.RefObject<HTMLDivElement | null>;
  onOpenImage: (i: number) => void;
}) {
  const { product, de, t, titleText, rc, profile } = props;
  const withCalc = product.chainSpeed === '11-fach' || product.chainSpeed === '12-fach';
  let ch = 2;
  const next = () => `${de ? 'Kapitel' : 'Chapter'} ${String(++ch).padStart(2, '0')}`;
  const nProcess = next();
  const nCalc = withCalc ? next() : '';
  const nFit = next();
  const nReviews = next();
  const nData = next();

  return (
    <div className="wxp">
      <ChainHero product={product} de={de} t={t} titleText={titleText} gallery={props.gallery}
        buyRef={props.buyRef} onOpenImage={props.onOpenImage} />
      <ProofStrip de={de} quote={pickProofQuote(product.id, true)} />
      <ChangeForYou product={product} de={de} t={t} rc={rc} />
      <FrictionLens de={de} />
      <ChainProcess de={de} n={nProcess} />
      {withCalc && <WaxCalculator product={product} profile={profile} de={de} mode="chain" chapter={nCalc} />}
      <ChainFit product={product} rc={rc} de={de} n={nFit} />
      <WaxReviews productId={product.id} de={de} chapter={nReviews} chain />
      <ChainData product={product} rc={rc} de={de} n={nData} />
      <ChainAfter de={de} />
      <WaxFaq de={de} t={t} kind="chain" />
      <ChainClosing product={product} de={de} titleText={titleText} />
    </div>
  );
}
