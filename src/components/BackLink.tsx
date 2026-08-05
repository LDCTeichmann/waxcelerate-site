// ─── BackLink — the way out ───────────────────────────────────────────────
// Rewax, Starter-Set and Wissenschaft are standalone pages people land on
// directly (search, a shared link, a bookmark), not only by scrolling from
// the homepage. Until now the only way back was a link in the footer, after
// the full page. This sits at the top instead, same visual language as the
// existing footer back-link (muted, opacity fade on hover, no box).
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ de, className = '' }: { de: boolean; className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-wx-txm transition-opacity hover:opacity-70 ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {de ? 'Start' : 'Home'}
    </Link>
  );
}
