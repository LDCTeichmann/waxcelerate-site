import { Link } from 'react-router-dom';
import type { useLanguage } from '@/hooks/useLanguage';
import { checkoutEnabled } from '@/lib/data';

/* PAngV: Steuer- und Versandhinweis gehören an jede Stelle, an der ein Preis
   steht, nicht nur auf die Produktdetailseite. Ursprünglich inline in
   ProductDetailPage.tsx (dort seit Etappe 1, siehe PriceNote-Kommentar dort);
   extrahiert, weil StarterSetPage/AccessoryDetailPage/die Startseiten-
   Produktsektion/ProductShelf denselben, wortgleichen Hinweis brauchen —
   zwei getippte Fassungen sind genau der Fehlertyp, der hier schon beim
   Widerrufsrecht und beim GPSR-Block zu einer vergessenen Kopie geführt hat.

   `tone`: eine fest weisse Kaufkarte (Desktop-Produktseite) arbeitet mit
   rgba-Werten statt mit den Theme-Variablen. */
export function PriceNote({ de, t, tone = 'page' }: {
  de: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  tone?: 'page' | 'card';
}) {
  const muted = tone === 'card' ? 'rgba(0,0,0,0.48)' : 'var(--txff)';
  const linkCol = tone === 'card' ? 'rgba(0,0,0,0.68)' : 'var(--txm)';
  const p = t.products;
  return (
    <p className="text-meta leading-[1.5]" style={{ color: muted }}>
      {p.priceNoteTax}{' '}
      {checkoutEnabled ? (
        <>
          {p.priceNoteShippingPre}{' '}
          <Link
            to="/versand-und-zahlung"
            className="underline underline-offset-2 hover:no-underline"
            style={{ color: linkCol }}
          >
            {p.priceNoteShippingLink}
          </Link>
          {de ? ', ' : ', '}{p.priceNoteShippingPost}.
        </>
      ) : (
        <>{p.priceNoteShippingIncluded}.</>
      )}
    </p>
  );
}
