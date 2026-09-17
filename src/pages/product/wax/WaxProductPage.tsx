import { useState } from 'react';
import type { Product } from '@/lib/data';
import type { RichContent } from '@/lib/productContent';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { useLanguage } from '@/hooks/useLanguage';
import { WaxHero } from './WaxHero';
import { ProofStrip, ChangeForYou } from './ProofAndChange';
import { FrictionLens } from './FrictionLens';
import { WaxCalculator } from './WaxCalculator';
import { ProcessWatch } from '@/components/process/ProcessWatch';
import { WhichWax, WaxReviews, DataFitLimits, WhenEmpty, WaxFaq, WaxClosing, pickProofQuote } from './WaxSections';
import { DeepDive, type DeepDiveItem } from '../DeepDive';
import './wax.css';

// ══════════════════════════════════════════════════════════════
// WACHS-PRODUKTSEITE v6 (17.09.2026) — "kaufen statt verlieren"
// ══════════════════════════════════════════════════════════════
// Luca: die Seite trug zu viel Information, Kaeufer verlieren sich. Oben
// kaufen, direkt danach nur das, was die Kaufentscheidung noch braucht
// (Daten/Passung/Grenzen, welches Wachs, Stimmen); Hintergrund-Kapitel
// (Reibung, Rechner, Ablauf, Nachkauf) sind erreichbar, aber zugeklappt im
// "Mehr wissen"-Deck (DeepDive). Kopf, Meta, Schema, Lightbox und Kaufleiste
// bleiben in ProductDetailPage.
export function WaxProductPage(props: {
  product: Product;
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  titleText: string;
  rc: RichContent | undefined;
  specs: { l: string; v: string }[];
  gallery: { src: string; alt: string }[];
  sizeSibling: Product | undefined;
  recommendedId: string | undefined;
  profile: ToolProfileState;
  buyRef: React.RefObject<HTMLDivElement | null>;
  backFallback: { to: string; label: string };
  onBack: (e: React.MouseEvent) => void;
  onOpenImage: (i: number) => void;
  onSizeSelect: (p: Product) => void;
}) {
  const { product, de, t, titleText, rc, specs, profile } = props;
  const [personalized, setPersonalized] = useState(false);
  const toChooser = () => document.getElementById('welches')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const deepDiveItems: DeepDiveItem[] = [
    {
      id: 'friction', icon: 'gear',
      title: de ? 'Wo die Reibung sitzt' : 'Where the friction sits',
      teaser: de ? 'Warum ein fester Film besser schützt als Öl.' : 'Why a solid film protects better than oil.',
      render: () => <FrictionLens de={de} />,
    },
    {
      id: 'calc', icon: 'road',
      title: de ? 'Rechnet sich das?' : 'Does it pay off?',
      teaser: de ? 'Deine Ersparnis mit deinem Fahrprofil.' : 'Your savings with your riding profile.',
      render: () => <WaxCalculator product={product} profile={profile} de={de} onTouch={() => setPersonalized(true)} />,
    },
    {
      id: 'process', icon: 'drop',
      title: de ? 'So läuft’s ab' : 'How it works',
      teaser: de ? 'Ein Wachsgang, Schritt für Schritt.' : 'One waxing, step by step.',
      render: () => <ProcessWatch de={de} product={product} />,
    },
    {
      id: 'empty', icon: 'truck',
      title: de ? 'Wenn der Block leer ist' : 'When the block runs out',
      teaser: de ? 'Nachbestellen oder einschicken.' : 'Reorder or send it in.',
      render: () => <WhenEmpty product={product} de={de} />,
    },
  ];

  return (
    <div className="wxp">
      <WaxHero product={product} de={de} t={t} titleText={titleText} gallery={props.gallery}
        sizeSibling={props.sizeSibling} recommendedId={props.recommendedId} personalized={personalized} rewaxKm={profile.interval}
        buyRef={props.buyRef} backFallback={props.backFallback} onBack={props.onBack}
        onOpenImage={props.onOpenImage} onSizeSelect={props.onSizeSelect} onProHint={toChooser} />
      <ProofStrip de={de} quote={pickProofQuote(product.id)} />
      <ChangeForYou product={product} de={de} t={t} rc={rc} />
      <DataFitLimits product={product} rc={rc} specs={specs} de={de} n={de ? 'Kapitel 02' : 'Chapter 02'} />
      <WhichWax product={product} de={de} n={de ? 'Kapitel 03' : 'Chapter 03'} />
      <WaxReviews productId={product.id} de={de} chapter={de ? 'Kapitel 04' : 'Chapter 04'} compact />
      <DeepDive de={de} items={deepDiveItems} />
      <WaxFaq de={de} t={t} />
      <WaxClosing product={product} de={de} titleText={titleText} />
    </div>
  );
}
