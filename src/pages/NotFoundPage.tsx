import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function NotFoundPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ background: 'var(--pg)' }}
    >
      <p
        className="text-[96px] font-bold leading-none tabular-nums"
        style={{ color: 'rgba(43,82,176,0.15)', fontVariantNumeric: 'tabular-nums' }}
        aria-hidden="true"
      >
        404
      </p>
      <div className="-mt-4">
        <h1 className="text-xl font-bold text-wx-tx1 mb-2">
          {de ? 'Diese Seite gibt es nicht.' : "This page doesn't exist."}
        </h1>
        <p className="text-[14px]" style={{ color: 'var(--txm)' }}>
          {de
            ? 'Vielleicht wurde die URL geändert oder der Link ist veraltet.'
            : 'The URL may have changed or the link is outdated.'}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#1A3C6E', color: '#fff' }}
        >
          {de ? '← Zur Startseite' : '← Back home'}
        </Link>
        <Link
          to="/#produkte"
          className="px-5 py-2.5 rounded-full text-[14px] font-medium transition-opacity hover:opacity-80"
          style={{ border: '1px solid var(--bd)', color: 'var(--tx2)' }}
        >
          {de ? 'Produkte ansehen' : 'View products'}
        </Link>
      </div>
    </div>
  );
}
