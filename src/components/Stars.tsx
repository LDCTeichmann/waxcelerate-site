// `color`/`emptyColor` optional: die Voreinstellung (--accent-soft auf --bd)
// ist fuer helle Kartenflaechen gebaut und dort ueberall unveraendert. Der
// Mobile-Hero legt die Sterne aber auf ein dunkles Foto, wo #3A66A0 als
// dunkles Blaugrau absaeuft — er reicht deshalb Weiss herein, statt die
// Voreinstellung fuer alle Aufrufer zu verschieben.
const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

// Anteilige Fuellung statt hartem i < rating-Vergleich (Stufe 0, K-Korrektur):
// eine 4,8 war vorher nicht darstellbar, jeder Stern war entweder ganz voll
// oder ganz leer. clip-path: inset() auf einer <g> schneidet den Vollton von
// rechts ab, das ist die uebliche Methode fuer Teilsterne ohne zweite
// Icon-Variante pro Bruchteil.
export function Stars({ rating = 5, color = 'var(--accent-soft)', emptyColor = 'var(--bd)' }:
  { rating?: number; color?: string; emptyColor?: string }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPct = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" aria-hidden>
            <path fill={emptyColor} d={STAR_PATH} />
            {fillPct > 0 && (
              <g style={{ clipPath: `inset(0 ${100 - fillPct}% 0 0)` }}>
                <path fill={color} d={STAR_PATH} />
              </g>
            )}
          </svg>
        );
      })}
    </div>
  );
}
