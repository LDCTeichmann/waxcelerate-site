import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { CartIcon } from '@/components/CartIcon';
import { useActiveSection } from '@/hooks/useActiveSection';

const navItems = [
  { href: '#produkte',    key: 'products' },
  { href: '#anleitungen', key: 'guides'   },
  { href: '#tools',       key: 'tools'    },
  { href: '#faq',         key: 'faq'      },
  { href: '#ueber-mich',  key: 'about'    },
  { href: '#kontakt',     key: 'contact'  },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const de = lang === 'de';
  const activeSection = useActiveSection(navItems.map(i => i.href));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    if (isMobileMenuOpen) {
      setTimeout(() => {
        const panel = document.getElementById('mobile-menu');
        const focusable = panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.[0]?.focus();
      }, 100);
    } else {
      document.getElementById('mobile-menu-button')?.focus();
    }

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
    <>
      {/* ── Header bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 py-2 transition-all duration-300"
        style={{
          background: isScrolled ? 'var(--nav-bg)' : 'rgba(6,7,8,0.0)',
          boxShadow: isScrolled ? 'inset 0 -1px 0 var(--bd)' : 'inset 0 -1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="flex items-center gap-2.5"
            >
              <img
                src="/images/No BG No Sign Logo.png"
                alt="Waxcelerate"
                className="w-auto"
                style={{ height: '36px', width: 'auto' }}
              />
              <span
                className="font-sans text-sm font-bold tracking-wide transition-colors duration-300"
                style={{ color: isScrolled ? 'var(--tx1)' : 'rgba(255,255,255,0.9)' }}
              >
                WAXCELERATE
              </span>
              {isScrolled && activeSection !== '' && activeSection !== '#home' && (
                <span
                  className="hidden lg:inline-flex items-center gap-1 text-[10px] ml-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--sf3)', color: 'var(--txf)', border: '1px solid var(--bd)' }}
                >
                  <span style={{ color: '#D4AA30' }}>★★★★★</span>
                  <span>171</span>
                </span>
              )}
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <a
                href="#produkte"
                onClick={(e) => { e.preventDefault(); scrollToSection('#produkte'); }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 mr-2 text-[13px] font-semibold rounded-full transition-all duration-300 hover:opacity-85 ${
                  isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {de ? 'Jetzt bestellen' : 'Buy now'}
              </a>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  className="relative group px-4 py-2 text-sm transition-colors duration-300"
                  style={{
                    color: isScrolled
                      ? (activeSection === item.href ? 'var(--tx1)' : 'var(--tx2)')
                      : (activeSection === item.href ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.82)'),
                  }}
                >
                  {t.nav[item.key as keyof typeof t.nav]}
                  {activeSection === item.href && (
                    <span className="absolute bottom-0 left-4 right-4 h-px" style={{ background: isScrolled ? '#1A3C6E' : 'rgba(255,255,255,0.5)' }} />
                  )}
                  {activeSection !== item.href && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                      style={{ background: 'var(--bd)' }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <CartIcon />

              {/* Theme toggle — desktop only */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'noir' : 'light')}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md border border-wx-bd/50 hover:border-[#1A3C6E] transition-colors text-wx-tx2 hover:text-wx-tx1"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </button>

              {/* Language toggle — desktop only */}
              <button
                onClick={toggleLang}
                className="hidden lg:block px-3 py-1.5 text-xs font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#1A3C6E] rounded transition-colors"
                aria-label={lang === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
              >
                {lang === 'de' ? 'EN' : 'DE'}
              </button>

              {/* Mobile menu button */}
              <button
                id="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-wx-tx2 hover:text-wx-tx1"
                aria-label={de ? 'Menü öffnen' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile menu — rendered as sibling of header, NOT inside it.
           This avoids iOS Safari treating backdrop-filter as a containing
           block and overflow-hidden clipping the slide-in panel. ── */}

      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-250 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Panel */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Navigation' : 'Navigation'}
        className={`lg:hidden fixed inset-0 sm:inset-y-0 sm:left-auto sm:w-80 z-[70] flex flex-col transition-transform duration-350 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--pg)', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
        onKeyDown={(e) => {
          if (!isMobileMenuOpen) return;
          const panel = document.getElementById('mobile-menu');
          const focusable = Array.from(
            panel?.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) ?? []
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
              if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }
          if (e.key === 'Escape') setIsMobileMenuOpen(false);
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-wx-bd/20 flex-shrink-0">
          <img src="/images/No BG No Sign Logo.png" alt="Waxcelerate" className="h-9 w-auto" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-wx-tx2 hover:text-wx-tx1 transition-colors"
            aria-label={de ? 'Menü schließen' : 'Close menu'}
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

        {/* Bottom actions */}
        <div className="px-5 pb-8 pt-4 flex-shrink-0 flex items-center justify-between border-t border-wx-bd/20">
          <button
            onClick={() => setTheme(theme === 'light' ? 'noir' : 'light')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#1A3C6E] rounded transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'light' ? (de ? 'Dark Mode' : 'Dark mode') : (de ? 'Light Mode' : 'Light mode')}
          </button>
          <button
            onClick={toggleLang}
            className="px-4 py-2 text-sm font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#1A3C6E] rounded transition-colors"
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </div>
    </>
  );
}
