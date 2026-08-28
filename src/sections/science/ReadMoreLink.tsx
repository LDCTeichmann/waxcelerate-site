import { Link } from 'react-router-dom';

// Shared "weiterlesen" arrow-link used to cross-link from the science page's
// individual sections into matching /blog articles (and back). Ratgeber
// content is German-only (see src/pages/blog/articles.ts — no titleEn/
// descriptionEn fields), so callers only render this when de is true.
export function ReadMoreLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium mt-3 transition-opacity hover:opacity-75"
      style={{ color: 'var(--accent)' }}
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}
