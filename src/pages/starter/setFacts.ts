// ─── Set-Kennzahlen und Anfrage-Link ────────────────────────────────────────
// Rechnet jede Kombination aus Wachs und (optional) Kette. Alle Zahlen aus
// data.ts; der Set-Preis über starterSetPriceFor, damit feste Preise (500 g
// Basis = eBay-Preis) und die Rabattregel an einer Stelle entschieden werden.

import {
  products, accessories, starterSet, starterSetBundleProducts, starterSetOptions,
  starterSetPriceFor, type Product,
} from '@/lib/data';
import { shortChainName, type SetCombo } from '@/pages/starter/content';

const WA_NUMBER = '4915751957470';

export const extras = accessories.filter((a) =>
  (starterSet.includedAccessoryIds as readonly string[]).includes(a.id));

export function comboFacts({ waxId, chainId }: SetCombo) {
  const wax = products.find((p) => p.id === waxId)!;
  const chain = chainId ? products.find((p) => p.id === chainId) ?? null : null;
  const partsSum = Math.round((wax.price + (chain?.price ?? 0) + extras.reduce((s, a) => s + a.price, 0)) * 100) / 100;
  const price = starterSetPriceFor(wax.id, chain?.id);
  const saved = Math.round((partsSum - price) * 100) / 100;
  // Aus den echten Preisen gerundet, nicht pauschal: 500 g Basis = −12 %.
  const pct = Math.round((saved / partsSum) * 100);
  const option = starterSetOptions.find((o) => o.waxId === wax.id && (o.chainId ?? null) === (chain?.id ?? null));

  // Der Warenkorb braucht ein Product. Feste Sets haben eins, freie
  // Kombinationen bekommen dasselbe Muster wie früher im Konfigurator.
  const bundle: Product = (option && starterSetBundleProducts.find((p) => p.id === option.id)) || {
    id: chain ? `custom-${wax.id}-${chain.id}` : `custom-${wax.id}`,
    category: 'bundle',
    title: `Starter-Set — ${wax.title}${chain ? ` + ${chain.title}` : ''}`,
    titleEn: `Starter set — ${wax.titleEn}${chain ? ` + ${chain.titleEn}` : ''}`,
    description: 'Individuell zusammengestelltes Starter-Set',
    descriptionEn: 'Custom-built starter set',
    price,
    image: wax.image,
    ebayUrl: wax.ebayUrl,
    weightGrams: wax.weightGrams + (chain?.weightGrams ?? 0) + extras.reduce((s, a) => s + a.weightGrams, 0),
    shippingClass: 'maxibrief',
  };

  return { wax, chain, extras, partsSum, price, saved, pct, bundle, optionId: option?.id ?? null };
}

/** Kurzer Name der Kombination, z. B. „Classic 300 g + YBN S11 / 11S". */
export function comboLabel(combo: SetCombo, de: boolean) {
  const { wax, chain } = comboFacts(combo);
  const w = `${wax.variant === 'pro' ? 'Pro' : 'Classic'} ${wax.weight?.replace('g', ' g')}`;
  return chain ? `${w} + ${shortChainName(chain)}` : `${de ? 'Basis' : 'Basic'} · ${w}`;
}

export function setRequestHref(combo: SetCombo, de: boolean, gift = false) {
  const { wax, chain } = comboFacts(combo);
  const parts = [de ? wax.title : wax.titleEn, ...(chain ? [de ? chain.title : chain.titleEn] : [])].join(' + ');
  const text = gift
    ? (de ? `Hi Luca, ich möchte ein Starter-Set verschenken (${parts}). Es soll an: `
      : `Hi Luca, I would like to give a starter set as a gift (${parts}). It should go to: `)
    : (de ? `Hi Luca, ich möchte dieses Starter-Set bestellen: ${parts}, dazu Zange und Draht.`
      : `Hi Luca, I would like to order this starter set: ${parts}, plus pliers and wire.`);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Günstigstes Set überhaupt — für „ab"-Preise. */
export const SET_FROM = Math.min(...starterSetBundleProducts.map((p) => p.price));
