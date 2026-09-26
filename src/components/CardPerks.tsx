import { Truck, BadgePercent } from 'lucide-react';
import type { TranslationType } from '@/lib/i18n';

// Versand + Lieferdatum + Mengenrabatt als ein Block, fuer alle Produktkarten
// gleich (Luca, 26.09.2026: "Kostenlosen Versand + Lieferdatum hervorheben,
// Rabatte anzeigen die möglich sind"). Vorher stand beides als 12,5-px-Zeile
// im Kartenfuss bzw. der Rabatt erst nach einem Klick auf die Pille.
// Stufen kommen vom Aufrufer (WAX_TIERS / CHAIN_TIERS aus data.ts).
export function CardPerks({ t, delivery, tiers, onDark }: {
  t: TranslationType;
  /** Fertig formatiertes Datum ("Mo., 29. Sept."). Weggelassen = keine Lieferzeile. */
  delivery?: string;
  tiers?: ReadonlyArray<{ qty: number; pct: number }>;
  /** Auf Foto-Scrim (Startseiten-Tueren) statt auf Kartenflaeche. */
  onDark?: boolean;
}) {
  const s = t.products.perks;
  const sorted = tiers ? [...tiers].sort((a, b) => a.qty - b.qty) : [];
  const maxQty = sorted.length ? sorted[sorted.length - 1].qty : 0;

  return (
    <div className={`card-perks${onDark ? ' card-perks--dark' : ''}`}>
      <p className="card-perks__row">
        <Truck className="card-perks__ico" aria-hidden />
        <span>
          <strong className="card-perks__ship">{s.freeShipping}</strong>
          {delivery && <span className="card-perks__when"><span className="card-perks__sep"> · </span>{s.arrives} <strong className="card-perks__date">{delivery}</strong></span>}
        </span>
      </p>
      {sorted.length > 0 && (
        <p className="card-perks__row">
          <BadgePercent className="card-perks__ico card-perks__ico--deal" aria-hidden />
          <span className="card-perks__tiers">
            <span className="sr-only">{s.tiersLabel}: </span>
            {sorted.map(tier => (
              <span key={tier.qty} className="card-perks__tier num">
                {tier.qty === maxQty ? s.tierFrom.replace('{qty}', String(tier.qty)) : s.tierQty.replace('{qty}', String(tier.qty))}
                <b> −{tier.pct} %</b>
              </span>
            ))}
          </span>
        </p>
      )}
    </div>
  );
}
