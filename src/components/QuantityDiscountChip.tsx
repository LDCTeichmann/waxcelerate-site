import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { waxTierBreakdown, type Product } from '@/lib/data';
import type { TranslationType } from '@/lib/i18n';

const fmtEur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

/**
 * Aufklappbarer Mengenrabatt-Chip statt einer stillen Fliesstext-Zeile
 * (Produktkarten-Plan K6): geschlossen nennt er nur die guenstigste
 * Einstiegsstufe, aufgeklappt zeigt er alle Stufen mit Stueckpreis und
 * Euro-Ersparnis vor Prozent (nie Prozent allein), dazu einmal den
 * Mechanismus — ohne den ist die Staffel eine Behauptung, die man beim
 * Klick auf "Bei eBay kaufen" nicht wiederfindet.
 */
export function QuantityDiscountChip({ product, de, t }: {
  product: Pick<Product, 'price' | 'category'>;
  de: boolean;
  t: TranslationType;
}) {
  const [open, setOpen] = useState(false);
  const tiers = waxTierBreakdown(product);
  if (tiers.length === 0) return null;
  const p = t.products;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[10.5px] font-medium py-1 -my-1"
        style={{ color: 'var(--accent)' }}
      >
        {p.quantityDiscountChip}
        <span style={{ color: 'var(--txf)' }}>· {p.quantityDiscountFrom.replace('{qty}', String(tiers[0].qty))}</span>
        <ChevronDown className="h-3 w-3 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden />
      </button>
      {open && (
        <div className="mt-1.5 space-y-1">
          {tiers.map(tier => (
            <div key={tier.qty} className="flex items-center justify-between gap-2 text-[10.5px]" style={{ color: 'var(--txm)' }}>
              <span className="num">
                {p.quantityDiscountUnit.replace('{qty}', String(tier.qty))} · {fmtEur(tier.unitPrice, de)}/{de ? 'Stk.' : 'pc.'}
              </span>
              <span className="num" style={{ color: 'var(--accent)' }}>
                {p.quantityDiscountSavings.replace('{savings}', fmtEur(tier.savings, de)).replace('{pct}', String(tier.pct))}
              </span>
            </div>
          ))}
          <p className="text-[10.5px] pt-0.5" style={{ color: 'var(--txff)' }}>{p.quantityDiscountMechanism}</p>
        </div>
      )}
    </div>
  );
}
