import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { useLanguage } from '@/hooks/useLanguage';

// Every unmatched URL used to render the full homepage at status 200 — a
// wrong link looked like it worked, and search engines saw the same content
// under an unlimited number of URLs. This is the only thing "*" now matches.
export function NotFoundPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const navigate = useNavigate();

  // #produkte and #faq only exist on the homepage, which isn't mounted at
  // this URL — a plain <Link to="/#produkte"> would land on "/" without
  // scrolling. Route home with state instead, same as Navigation/Footer;
  // PendingAnchorScroll (rendered on the homepage) picks it up from there.
  const anchorLinks: { href: string; label: string }[] = [
    { href: '#produkte', label: de ? 'Produkte' : 'Products' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <>
      <Helmet>
        <title>{de ? 'Seite nicht gefunden' : 'Page not found'} | Waxcelerate</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="min-h-[70vh] flex items-center" style={{ background: 'var(--pg)' }}>
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-28">
          <div className="max-w-xl">
            <p className="eyebrow mb-3">404</p>
            <h1 className="section-title mb-4">
              {de ? 'Diese Seite gibt es nicht.' : "This page doesn't exist."}
            </h1>
            <p className="text-wx-txm mb-8 text-[15px] leading-relaxed">
              {de
                ? 'Der Link ist falsch oder die Seite wurde verschoben. Hier geht es weiter:'
                : "The link is wrong or the page has moved. Here's where to go instead:"}
            </p>
            <div className="flex flex-wrap gap-3">
              {anchorLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => navigate('/', { state: { scrollTo: l.href } })}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
                  style={{ border: '1px solid var(--bd)', background: 'var(--sf2)', color: 'var(--tx2)' }}
                >
                  {l.label} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ))}
              <Link to="/blog"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
                style={{ border: '1px solid var(--bd)', background: 'var(--sf2)', color: 'var(--tx2)' }}>
                {de ? 'Blog' : 'Blog'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}>
                {de ? 'Zur Startseite' : 'Back home'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
