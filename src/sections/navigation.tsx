import { useState, useEffect } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const navItems = [
  { href: '#home', key: 'start' },
  { href: '#produkte', key: 'products' },
  { href: '#tools', key: 'tools' },
  { href: '#anleitungen', key: 'guides' },
  { href: '#faq', key: 'faq' },
  { href: '#kontakt', key: 'contact' },
];

interface NavigationProps {
  onLogoClick?: () => void;
}

export function Navigation({ onLogoClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, lang, toggleLang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#090909]/90 backdrop-blur-xl border-b border-[#22222E]/30'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - image only */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onLogoClick?.();
              scrollToSection('#home');
            }}
            className="flex items-center"
          >
            <img
              src="/images/logo.jpg"
              alt="Waxcelerate"
              className="h-10 w-auto rounded-sm"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="relative px-4 py-2 text-sm text-[#8896B0] hover:text-white transition-colors"
              >
                {t.nav[item.key as keyof typeof t.nav]}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 text-xs font-medium text-[#8896B0] hover:text-white border border-[#22222E]/50 hover:border-[#4A6AEE] rounded transition-colors"
            >
              {lang.toUpperCase()}
            </button>

            {/* eBay Shop Link */}
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#4A6AEE] hover:bg-[#6478F5] text-white text-sm font-medium rounded transition-colors"
            >
              {t.nav.ebayShop}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#8896B0] hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#090909]/98 backdrop-blur-xl border-t border-[#22222E]/30">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="py-3 text-[#8896B0] hover:text-white border-b border-[#22222E]/20 transition-colors"
              >
                {t.nav[item.key as keyof typeof t.nav]}
              </a>
            ))}
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-3 text-[#4A6AEE] hover:text-[#6478F5]"
            >
              {t.nav.ebayShop}
              <ExternalLink className="h-4 w-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
