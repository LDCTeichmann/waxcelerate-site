import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function Footer() {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const linkClass = 'text-wx-txf hover:text-wx-tx1 text-[13px] transition-colors duration-150 leading-relaxed';
  const headingClass = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-wx-txf mb-4 block';

  return (
    <footer style={{ background: 'var(--sf3)', borderTop: '1px solid var(--bd)' }}>

      {/* Main grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-14 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-x-8 gap-y-10">

            {/* Brand — full width on mobile, 2/5 on desktop */}
            <div className="col-span-2 lg:col-span-1 max-w-xs">
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/images/logo.jpg" alt="Waxcelerate" className="h-8 w-8 rounded-lg object-cover" />
                <span className="font-display text-sm font-bold tracking-wide text-wx-tx1">
                  WAXCELERATE
                </span>
              </div>
              <p className="text-[13px] text-wx-txf leading-[1.7] mb-5">
                {t.footer.tagline}
              </p>
              <a
                href="https://www.ebay.de/usr/waxcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-wx-tx2 hover:text-wx-tx1 transition-colors duration-150"
              >
                {de ? 'Zum eBay Shop' : 'Visit eBay Shop'}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Shop */}
            <div>
              <span className={headingClass}>{t.footer.shop}</span>
              <ul className="space-y-2.5">
                {[
                  { href: '#produkte', label: t.nav.products },
                  { href: '#tools',    label: t.nav.tools },
                  { href: 'https://www.ebay.de/usr/waxcelerate', label: 'eBay', external: true },
                ].map((item, i) => (
                  <li key={i}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{item.label}</a>
                    ) : (
                      <a href={item.href} onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }} className={linkClass}>{item.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <span className={headingClass}>{t.footer.info}</span>
              <ul className="space-y-2.5">
                {[
                  { href: '#anleitungen', label: t.nav.guides },
                  { href: '#faq',        label: t.nav.faq    },
                  { href: '#ueber-mich', label: t.nav.about  },
                  { href: '#kontakt',    label: t.nav.contact },
                ].map((item, i) => (
                  <li key={i}>
                    <a href={item.href} onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }} className={linkClass}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <span className={headingClass}>{t.footer.legal}</span>
              <ul className="space-y-2.5">
                {[
                  { label: 'Impressum',  to: '/impressum'  },
                  { label: 'Datenschutz', to: '/datenschutz' },
                  { label: 'AGB',        to: '/agb'        },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className={linkClass}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--bd)' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[11px] tabular-nums" style={{ color: 'var(--txff)' }}>
              © {currentYear} Waxcelerate · Stuttgart, DE
            </p>
            <div className="flex items-center gap-5">
              <span className="text-[11px]" style={{ color: 'var(--txff)' }}>
                {de ? 'Heißwachs für Fahrradketten' : 'Hot wax for bicycle chains'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
