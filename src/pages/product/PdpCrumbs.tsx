import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

// Brotkruemel + Mobil-Zurueck-Pille, 1:1 aus dem alten Fix-Header von
// ProductDetailPage.tsx uebernommen (PDP v6, Schritt 1): der Header ist jetzt
// die echte <Navigation/>, diese Zeile zieht als erstes Kind in jeden Hero
// (WaxHero, ChainHero, der Accessory-Zweig) ein, ohne Logo.
export function PdpCrumbs({ de, titleText, backFallback, onBack }: {
  de: boolean;
  titleText: string;
  backFallback: { to: string; label: string };
  onBack: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="mb-4 sm:mb-6">
      <nav aria-label={de ? 'Brotkrümelnavigation' : 'Breadcrumb'}
        className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0">
        <Link to="/" className="flex-shrink-0 hover:underline transition-colors"
          style={{ color: 'var(--txf)' }}>
          {de ? 'Start' : 'Home'}
        </Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50"
          style={{ color: 'var(--txf)' }} />
        <Link to={backFallback.to} className="flex-shrink-0 hover:underline transition-colors"
          style={{ color: 'var(--txf)' }}>
          {backFallback.label}
        </Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50"
          style={{ color: 'var(--txf)' }} />
        <span className="truncate font-medium" style={{ color: 'var(--tx1)' }}>
          {titleText}
        </span>
      </nav>
      <Link to={backFallback.to} onClick={onBack}
        className="sm:hidden inline-flex items-center gap-1.5 min-h-11 pl-1 pr-3 -ml-1 rounded-full text-[13px] font-medium transition-colors"
        style={{ color: 'var(--txm)' }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> {backFallback.label}
      </Link>
    </div>
  );
}
