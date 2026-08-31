import { Info } from 'lucide-react';

/**
 * GPSR (EU 2023/988) Art. 9(5)/19: manufacturer contact info must be shown
 * directly on the product offer itself — a link or a PDF doesn't satisfy
 * this, it has to render on the page. Same block on every product/accessory
 * detail page rather than duplicated markup per page.
 */
export function GpsrInfo({ de, dark = false }: { de: boolean; dark?: boolean }) {
  return (
    <div
      className="flex items-start gap-2 mb-8 text-meta rounded-lg px-3 py-2.5"
      style={dark
        ? { color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)' }
        : { color: 'var(--txff)', background: 'var(--sf2)', border: '1px solid var(--bd2)' }}
    >
      <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden />
      <span>
        {de ? 'Hersteller: ' : 'Manufacturer: '}
        Luca Teichmann (Waxcelerate), Florentinerstraße 17, 70619 Stuttgart, Deutschland,
        waxcelerate@gmail.com
      </span>
    </div>
  );
}
