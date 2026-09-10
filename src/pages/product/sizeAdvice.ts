// ── Welche Groesse passt zu diesem Fahrprofil? ──────────────────────────────
//
// EINE Quelle fuer beide Ausgabestellen: das Instrument ("Was das fuer dich
// heisst") und die ruhige Zeile am Groessenschalter im Kaufblock. Zwei
// getrennte Rechnungen waeren genau der Fehlertyp, der auf dieser Seite schon
// Widerrufsrecht und GPSR auseinanderlaufen liess — dort standen zwei
// getippte Fassungen desselben Sachverhalts, und eine wurde vergessen.
//
// Liegt bewusst in einer eigenen Datei und nicht neben der Komponente: eine
// Datei, die sowohl eine Komponente als auch eine Hilfsfunktion exportiert,
// bricht Fast Refresh (react-refresh/only-export-components).
//
// Die Empfehlung geht ausdruecklich auch NACH UNTEN. Unter rund 55 km/Woche
// haelt der 500er laenger als seine eigene Haltbarkeit
// (WAX_SHELF_LIFE_MONTHS = 30 in waxMath.ts); dann ist der kleinere Block die
// ehrliche Antwort, obwohl er je Anwendung teurer ist (1,84 € gegen 1,15 €).

import type { Product } from '@/lib/data';
import { getProductById } from '@/lib/data';
import { switchEconomics } from '@/lib/waxMath';
import type { ToolProfileState } from '@/hooks/useToolProfile';

export interface SizeAdvice {
  /** Der empfohlene Block, oder undefined ausserhalb der Wachsprodukte. */
  recommended: Product | undefined;
  /** Zeigt die Empfehlung auf das gerade angesehene Produkt? */
  matchesCurrent: boolean;
  /** Der grosse Block wuerde laenger reichen, als er haltbar ist. */
  largeOutlastsShelfLife: boolean;
  large: Product | undefined;
}

export function sizeAdviceFor(product: Product, profile: ToolProfileState): SizeAdvice {
  const isPro = product.variant === 'pro';
  const kmPerYear = profile.kmPerWeek * 52;
  const small = getProductById(isPro ? 'wax-300-mos2' : 'wax-300');
  const large = getProductById(isPro ? 'wax-500-mos2' : 'wax-500');
  const largeEcon = large
    ? switchEconomics({ kmPerYear, rewaxKm: profile.interval, toolingCost: 0, waxProduct: large })
    : null;
  const outlasts = !!largeEcon?.outlastsShelfLife;
  const recommended = outlasts ? small : large;
  return {
    recommended,
    matchesCurrent: recommended?.id === product.id,
    largeOutlastsShelfLife: outlasts,
    large,
  };
}
