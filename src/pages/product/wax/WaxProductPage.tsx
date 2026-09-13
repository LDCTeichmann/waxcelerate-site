import type { Product } from '@/lib/data';
import type { RichContent } from '@/lib/productContent';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { useLanguage } from '@/hooks/useLanguage';
import { WaxHero } from './WaxHero';
import { ProofStrip, ChangeForYou } from './ProofAndChange';
import { FrictionLens } from './FrictionLens';
import { WaxCalculator } from './WaxCalculator';
import { ProcessWatch } from './ProcessWatch';
import { WhichWax, WaxReviews, DataFitLimits, WhenEmpty, WaxFaq, WaxClosing, pickProofQuote } from './WaxSections';
import './wax.css';

// ══════════════════════════════════════════════════════════════
// WACHS-PRODUKTSEITE v4 (14.09.2026)
// ══════════════════════════════════════════════════════════════
// Freigegeben von Luca als Mockup v4. Die Reihenfolge folgt der Frage, die
// ein Kaeufer als naechstes hat, und Hormozis Wertgleichung (Traumergebnis
// und Wahrscheinlichkeit rauf, Zeit und Aufwand runter):
//   Kaufbox → Beweis (Stimmen, Zahlen) → was sich aendert → warum es
//   funktioniert → rechnet es sich → ist es aufwendig → welches Wachs →
//   Stimmen → Daten und Grenzen → wie geht es weiter → Fragen → Abschluss.
// Kopf, Meta, Schema, Lightbox und Kaufleiste bleiben in ProductDetailPage.
export function WaxProductPage(props: {
  product: Product;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  titleText: string;
  rc: RichContent | undefined;
  specs: { l: string; v: string }[];
  gallery: { src: string; title: string; fact: string }[];
  sizeSibling: Product | undefined;
  recommendedId: string | undefined;
  profile: ToolProfileState;
  buyRef: React.RefObject<HTMLDivElement | null>;
  onOpenImage: (i: number) => void;
  onSizeSelect: (p: Product) => void;
}) {
  const { product, de, t, titleText, rc, specs, profile } = props;
  const toChooser = () => document.getElementById('welches')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="wxp">
      <WaxHero product={product} de={de} t={t} titleText={titleText} gallery={props.gallery}
        sizeSibling={props.sizeSibling} recommendedId={props.recommendedId} rewaxKm={profile.interval}
        buyRef={props.buyRef} onOpenImage={props.onOpenImage} onSizeSelect={props.onSizeSelect} onProHint={toChooser} />
      <ProofStrip de={de} quote={pickProofQuote(product.id)} />
      <ChangeForYou de={de} t={t} rc={rc} />
      <FrictionLens de={de} />
      <WaxCalculator product={product} profile={profile} de={de} />
      <ProcessWatch de={de} product={product} />
      <WhichWax product={product} de={de} />
      <WaxReviews productId={product.id} de={de} />
      <DataFitLimits product={product} rc={rc} specs={specs} de={de} />
      <WhenEmpty product={product} de={de} />
      <WaxFaq de={de} t={t} />
      <WaxClosing product={product} de={de} titleText={titleText} />
    </div>
  );
}
