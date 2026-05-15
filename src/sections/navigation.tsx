import { useState, useEffect } from 'react';
import { Menu, X, ExternalLink, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme, type Theme } from '@/hooks/useTheme';

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
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light',  icon: <Sun className="h-3.5 w-3.5" /> },
    { value: 'dark',  label: 'Dusk',   icon: <Moon className="h-3.5 w-3.5" /> },
    { value: 'noir',  label: 'Noir',   icon: <span className="h-3.5 w-3.5 flex items-center justify-center"><span className="block w-2.5 h-2.5 rounded-full bg-current" /></span> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

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
        isScrolled ? 'py-2 backdrop-blur-xl border-b border-wx-bd/30' : 'py-3 bg-transparent'
      }`}
      style={isScrolled ? { background: 'var(--nav-bg)' } : undefined}
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
            className="flex items-center gap-2.5"
          >
            <img
              src="/images/logo.jpg"
              alt="Waxcelerate"
              className="w-auto rounded-sm"
              style={{ height: isScrolled ? '32px' : '40px', transition: 'height 0.3s ease', width: 'auto' }}
            />
            <span className={`hidden sm:block font-roboto font-medium tracking-wide text-wx-tx1 transition-all duration-300 ${isScrolled ? 'text-[13px]' : 'text-[15px]'}`}>
              waxcelerate
            </span>
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
                className="relative px-4 py-2 text-sm text-wx-tx2 hover:text-wx-tx1 transition-colors"
              >
                {t.nav[item.key as keyof typeof t.nav]}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* 3-way theme toggle */}
            <div
              className="flex items-center p-0.5 rounded-lg border border-wx-bd/50 gap-0.5"
              style={{ background: 'var(--sf2)' }}
            >
              {themes.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  aria-label={label}
                  title={label}
                  className={`p-1.5 rounded-md transition-all ${
                    theme === value
                      ? 'text-wx-tx1 shadow-sm'
                      : 'text-wx-txf hover:text-wx-tx2'
                  }`}
                  style={theme === value ? { background: 'var(--sf)' } : undefined}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 text-xs font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#4A6AEE] rounded transition-colors"
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
              className="lg:hidden p-2 text-wx-tx2 hover:text-wx-tx1"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — full-screen on phone, right sidebar on tablet */}
      <>
        {/* Backdrop (tablet only — sidebar leaves background visible) */}
        <div
          className={`lg:hidden fixed inset-0 z-40 hidden sm:block transition-opacity duration-[250ms] ease-in-out ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`lg:hidden fixed inset-0 sm:inset-y-0 sm:left-auto sm:w-80 z-50 flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ background: 'var(--pg)' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-wx-bd/20 flex-shrink-0">
            <img src="/images/logo.jpg" alt="Waxcelerate" className="h-9 w-auto rounded-sm" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-wx-tx2 hover:text-wx-tx1 transition-colors"
              aria-label="Menü schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col flex-1 overflow-y-auto px-5 py-4">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                className="py-4 text-[17px] font-medium text-wx-tx2 hover:text-wx-tx1 border-b border-wx-bd/15 transition-colors last:border-0"
                style={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(12px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  transitionDelay: isMobileMenuOpen ? `${0.12 + index * 0.04}s` : '0s',
                }}
              >
                {t.nav[item.key as keyof typeof t.nav]}
              </a>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-5 pb-8 pt-4 flex-shrink-0 space-y-3 border-t border-wx-bd/20">
            <a
              href="https://www.ebay.de/usr/waxcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-[14px] font-semibold"
              style={{ background: 'linear-gradient(135deg, #4A6AEE, #6080F8)' }}
            >
              {t.nav.ebayShop}
              <ExternalLink className="h-4 w-4" />
            </a>
            <div className="flex items-center justify-between pt-1">
              <div
                className="flex items-center p-0.5 rounded-lg border border-wx-bd/50 gap-0.5"
                style={{ background: 'var(--sf2)' }}
              >
                {themes.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-label={label}
                    title={label}
                    className={`p-1.5 rounded-md transition-all ${theme === value ? 'text-wx-tx1 shadow-sm' : 'text-wx-txf hover:text-wx-tx2'}`}
                    style={theme === value ? { background: 'var(--sf)' } : undefined}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleLang}
                className="px-4 py-2 text-sm font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#4A6AEE] rounded transition-colors"
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </>
    </header>
  );
}
