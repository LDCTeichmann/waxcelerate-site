import type { Product } from '@/lib/data';
import type { RichContent } from '@/lib/productContent';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { useLanguage } from '@/hooks/useLanguage';
import { ProofStrip, ChangeForYou } from '../wax/ProofAndChange';
import { FrictionLens } from '../wax/FrictionLens';
import { WaxCalculator } from '../wax/WaxCalculator';
import { WaxReviews, WaxFaq, pickProofQuote } from '../wax/WaxSections';
import { DeepDive, type DeepDiveItem } from '../DeepDive';
import { FrictionPreview, SavingsPreview, BathPreview, RefillPreview } from '../DeepDivePreviews';
import { ChainHero } from './ChainHero';
import { ChainProcess, ChainFit, ChainData, ChainAfter } from './ChainSections';
import '../wax/wax.css';
import './chain.css';

// ══════════════════════════════════════════════════════════════
// KETTEN-PRODUKTSEITE v6 (17.09.2026)
// ══════════════════════════════════════════════════════════════
// Uebertraegt die Wachsseite v6 auf die vorgewachsten Ketten: Kaufbox →
// Beweis → was sich aendert → passt sie → Daten/Einbau → Stimmen, dann
// zugeklappt im "Mehr wissen"-Deck (Reibung, was wir machen, Rechner falls
// vorhanden, nach dem ersten Film) → Fragen → Abschluss.
//
// Der Rechner faellt bei 9-fach weg: fuer 8–10-fach sind Ketten- und
// Kassettenpreise noch offen (PROJECT.md), eine Ersparnis ohne Kassettenbetrag
// waere geschoent.
export function ChainProductPage(props: {
  product: Product;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  titleText: string;
  rc: RichContent | undefined;
  gallery: { src: string; alt: string }[];
  profile: ToolProfileState;
  buyRef: React.RefObject<HTMLDivElement | null>;
  backFallback: { to: string; label: string };
  onBack: (e: React.MouseEvent) => void;
  onOpenImage: (i: number) => void;
}) {
  const { product, de, t, titleText, rc, profile } = props;
  const withCalc = product.chainSpeed === '11-fach' || product.chainSpeed === '12-fach';

  const deepDiveItems: DeepDiveItem[] = [
    {
      id: 'friction', icon: 'gear',
      title: de ? 'Wo die Reibung sitzt' : 'Where the friction sits',
      teaser: de ? 'Warum ein fester Film besser schützt als Öl.' : 'Why a solid film protects better than oil.',
      preview: <FrictionPreview />,
      photo: '/images/blog/chain-links-macro-800.webp',
      render: () => <FrictionLens de={de} />,
    },
    {
      id: 'process', icon: 'drop',
      title: de ? 'Was wir damit machen' : 'What we do with it',
      teaser: de ? 'Ein Wachsbad, Schritt für Schritt.' : 'A wax bath, step by step.',
      preview: <BathPreview de={de} />,
      photo: '/images/blog/wax-bath-hanging-800.webp',
      render: () => <ChainProcess de={de} n="" />,
    },
    ...(withCalc ? [{
      id: 'calc', icon: 'road' as const,
      title: de ? 'Rechnet sich das?' : 'Does it pay off?',
      teaser: de ? 'Deine Ersparnis mit deinem Fahrprofil.' : 'Your savings with your riding profile.',
      preview: <SavingsPreview de={de} />,
      photo: '/images/blog/ride-road-golden-800.webp',
      render: () => <WaxCalculator product={product} profile={profile} de={de} mode="chain" chapter="" />,
    }] : []),
    {
      id: 'after', icon: 'chain',
      title: de ? 'Nach dem ersten Film' : 'After the first film',
      teaser: de ? 'Wie es weitergeht, wenn das Wachs nachlässt.' : 'What happens once the wax wears off.',
      preview: <RefillPreview de={de} />,
      photo: '/images/blog/chain-waxed-macro-800.webp',
      render: () => <ChainAfter de={de} />,
    },
  ];

  return (
    <div className="wxp">
      <ChainHero product={product} de={de} t={t} titleText={titleText} gallery={props.gallery}
        buyRef={props.buyRef} backFallback={props.backFallback} onBack={props.onBack} onOpenImage={props.onOpenImage} />
      <ProofStrip de={de} quote={pickProofQuote(product.id, true)} />
      <ChangeForYou product={product} de={de} t={t} rc={rc} />
      <ChainFit product={product} rc={rc} de={de} n={de ? 'Kapitel 02' : 'Chapter 02'} />
      <ChainData product={product} rc={rc} de={de} n={de ? 'Kapitel 03' : 'Chapter 03'} />
      <WaxReviews productId={product.id} de={de} chapter={de ? 'Kapitel 04' : 'Chapter 04'} chain compact />
      <DeepDive de={de} items={deepDiveItems} />
      <WaxFaq de={de} t={t} kind="chain" />
    </div>
  );
}
