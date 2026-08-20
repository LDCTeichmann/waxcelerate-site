// ─── StarterSetOptions — three cards instead of one config screen ────────────
//
// The old page opened straight into a two-question configurator (wax, then
// chain, from 4+8 choices) with a running-total sidebar — correct information,
// but it made everyone do the work of a decision most people don't want to
// make. Most people ride one drivetrain and want one obvious answer. This
// puts that answer in front of them as a single click: Classic for most
// bikes, Pro for winter/e-bike, and the original configurator kept as a third
// "I know exactly what I want" option for the rest.

import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Sparkles, Snowflake, SlidersHorizontal } from 'lucide-react';
import {
  products, accessories, starterSet,
  starterSetOptions, starterSetBundleProducts, canCheckout,
} from '@/lib/data';
import { AddToCartButton } from '@/components/AddToCartButton';
import { StarterSetBuilder } from '@/sections/StarterSetBuilder';

const fmt = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

function FixedCard({ optionId, de, icon: Icon, badgeDe, badgeEn }: {
  optionId: string; de: boolean;
  icon: typeof Sparkles; badgeDe: string; badgeEn: string;
}) {
  const opt = starterSetOptions.find((o) => o.id === optionId)!;
  const wax = products.find((p) => p.id === opt.waxId)!;
  const chain = products.find((p) => p.id === opt.chainId)!;
  const extras = accessories.filter((a) =>
    (starterSet.includedAccessoryIds as readonly string[]).includes(a.id));
  const bundleProduct = starterSetBundleProducts.find((p) => p.id === optionId)!;
  const partsSum = wax.price + chain.price + extras.reduce((s, a) => s + a.price, 0);
  const saved = Math.round((partsSum - bundleProduct.price) * 100) / 100;

  const contents = [
    de ? wax.title : wax.titleEn,
    de ? chain.title : chain.titleEn,
    ...extras.map((a) => (de ? a.title : a.titleEn)),
  ];

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
      <div className="aspect-[4/3] relative">
        <img src={wax.image} alt={de ? wax.title : wax.titleEn} className="w-full h-full object-cover" loading="lazy" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-meta font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(10,10,10,0.72)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <Icon className="h-3 w-3" aria-hidden />
          {de ? badgeDe : badgeEn}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-[13px]" style={{ color: 'var(--txm)' }}>{de ? opt.taglineDe : opt.taglineEn}</p>

        <ul className="mt-4 space-y-2 flex-1">
          {contents.map((c) => (
            <li key={c} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--tx2)' }}>
              <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} aria-hidden />
              {c}
            </li>
          ))}
        </ul>

        <div className="flex items-baseline gap-2.5 mt-5 pt-4" style={{ borderTop: '1px solid var(--bd2)' }}>
          <p className="font-display font-bold text-wx-tx1 leading-none" style={{ fontSize: '1.9rem', letterSpacing: '-0.02em' }}>
            {fmt(bundleProduct.price, de)}
          </p>
          <p className="num-data text-[12.5px] line-through" style={{ color: 'var(--txff)' }}>
            {fmt(partsSum, de)}
          </p>
        </div>
        <p className="text-meta mb-4" style={{ color: 'var(--accent)' }}>
          {de ? `Du sparst ${fmt(saved, de)}` : `You save ${fmt(saved, de)}`}
        </p>

        {canCheckout(bundleProduct) ? (
          <AddToCartButton product={bundleProduct} fullWidth />
        ) : (
          <a
            href={`https://wa.me/4915751957470?text=${encodeURIComponent(
              de
                ? `Hi Luca, ich möchte das ${de ? (optionId === 'starter-classic' ? 'Starter Classic' : 'Starter Pro') : ''}-Set bestellen.`
                : `Hi Luca, I would like to order the ${optionId === 'starter-classic' ? 'Starter Classic' : 'Starter Pro'} set.`,
            )}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {de ? 'Set anfragen' : 'Request this set'}
          </a>
        )}
      </div>
    </div>
  );
}

export function StarterSetOptions({ de }: { de: boolean }) {
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        <FixedCard optionId="starter-classic" de={de} icon={Sparkles}
          badgeDe="Für die meisten Räder" badgeEn="For most bikes" />
        <FixedCard optionId="starter-pro" de={de} icon={Snowflake}
          badgeDe="Winter & E-Bike" badgeEn="Winter & e-bike" />

        {/* Third card is a toggle, not a product — clicking it reveals the
            original free configurator below instead of a card of its own
            contents, since "custom" has none until you choose. */}
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          aria-expanded={customOpen}
          className="rounded-2xl flex flex-col items-center justify-center text-center p-8 min-h-[280px] transition-colors"
          style={{
            background: customOpen ? 'var(--accent-wash-sm)' : 'var(--sf)',
            border: customOpen ? '1px solid rgba(var(--accent-rgb),0.35)' : '1px dashed var(--bd)',
          }}
        >
          <span className="flex items-center justify-center rounded-full mb-4"
            style={{ width: 44, height: 44, background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
            <SlidersHorizontal className="h-5 w-5" style={{ color: 'var(--accent)' }} aria-hidden />
          </span>
          <p className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--tx1)' }}>
            {de ? 'Ich weiß genau, was ich will' : 'I know exactly what I want'}
          </p>
          <p className="text-[13px] max-w-[26ch]" style={{ color: 'var(--txm)' }}>
            {de ? 'Eigene Wachs- und Kettenkombination zusammenstellen' : 'Build your own wax and chain combination'}
          </p>
          <span className="inline-flex items-center gap-1 mt-4 text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
            {customOpen ? (de ? 'Ausblenden' : 'Hide') : (de ? 'Konfigurieren' : 'Configure')}
            <ChevronRight className="h-3.5 w-3.5 transition-transform" style={{ transform: customOpen ? 'rotate(90deg)' : 'none' }} />
          </span>
        </button>
      </div>

      {customOpen && (
        <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--bd2)' }}>
          <StarterSetBuilder de={de} />
        </div>
      )}
    </div>
  );
}
