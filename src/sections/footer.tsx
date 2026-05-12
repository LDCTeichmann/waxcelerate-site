import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function Footer() {
  const { t } = useLanguage();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#090909] border-t border-[#22222E]/30 py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/images/logo.jpg"
                  alt="Waxcelerate"
                  className="h-8 w-auto rounded-sm"
                />
                <span className="font-display text-sm font-semibold text-white">
                  WAX<span className="text-[#4A6AEE]">C</span>ELERATE
                </span>
              </div>
              <p className="text-[#8896B0] text-sm">
                {t.footer.tagline}
              </p>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">{t.footer.shop}</h4>
              <ul className="space-y-2">
                {[
                  { href: '#produkte', label: t.nav.products },
                  { href: '#produkte', label: t.products.tabs.wax },
                  { href: '#produkte', label: t.products.tabs.chains },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                      className="text-[#8896B0] hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Links */}
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">{t.footer.info}</h4>
              <ul className="space-y-2">
                {[
                  { href: '#anleitungen', label: t.nav.guides },
                  { href: '#faq', label: t.nav.faq },
                  { href: '#ueber-mich', label: t.nav.about },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                      className="text-[#8896B0] hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">{t.footer.legal}</h4>
              <ul className="space-y-2">
                {['Impressum', 'Datenschutz', 'AGB'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#8896B0] hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#22222E]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#52576A] text-sm">
              {t.footer.copyright.replace('{year}', currentYear.toString())}
            </p>

            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#8896B0] hover:text-white text-sm transition-colors"
            >
              {t.nav.ebayShop}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Easter egg: Stuttgart ❤️ Cape Town Wax */}
          <div className="mt-6 text-center">
            <p className="text-zinc-700 text-xs">
              Stuttgart ❤️ Cape Town Wax
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
