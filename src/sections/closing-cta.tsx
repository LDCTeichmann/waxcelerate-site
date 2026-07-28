import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { waxVsOil } from '@/lib/data';

// The page used to end at the Kontakt form — the reader who made it that far
// is the most informed person on the site, and got a contact form instead of
// a purchase prompt. Reuses the same proven numbers and trust line already
// on the page (hero stats, Reviews proof strip) instead of inventing new
// copy or a new visual pattern.
export function ClosingCTA() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const scrollToProducts = () =>
    document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative py-14 sm:py-16" style={{ background: 'var(--sf3)', borderTop: '1px solid var(--bd)' }}>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-[19px] sm:text-[22px] font-bold tracking-[-0.02em] mb-1.5" style={{ color: 'var(--tx1)' }}>
              {de
                ? `${waxVsOil.life.wax}× Kettenlaufzeit · ~€${waxVsOil.cost.savedEur} gespart über ${waxVsOil.cost.km.toLocaleString('de-DE')} km`
                : `${waxVsOil.life.wax}× chain life · ~€${waxVsOil.cost.savedEur} saved over ${waxVsOil.cost.km.toLocaleString('en-US')} km`}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--txm)' }}>
              {de ? '200+ Bewertungen · Versand aus Stuttgart · eBay-Käuferschutz' : '200+ reviews · Ships from Stuttgart · eBay buyer protection'}
            </p>
          </div>
          <button
            onClick={scrollToProducts}
            className="btn-primary group inline-flex items-center gap-2 px-7 py-3.5 text-[14px] flex-shrink-0"
          >
            {de ? 'Jetzt bestellen' : 'Order now'}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
