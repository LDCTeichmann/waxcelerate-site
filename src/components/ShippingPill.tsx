import { Truck } from 'lucide-react';

// Gruene Versand-Pille, aus .wxp-ship der Wachsseite herausgeloest, damit
// Kettenkarten, "Passt dazu" und Kettenseite dieselbe Aussage gleich zeigen.
// Der Text kommt vom Aufrufer (an checkoutEnabled gekoppelt, K8).
export function ShippingPill({ label, small }: { label: string; small?: boolean }) {
  return (
    <span className={`ship-pill${small ? ' ship-pill--sm' : ''}`}>
      <Truck className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {label}
    </span>
  );
}
