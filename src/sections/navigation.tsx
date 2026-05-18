import { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { CartIcon } from '@/components/CartIcon';

const navItems = [
  { href: '#produkte',    key: 'products' },
  { href: '#tools',       key: 'tools'    },
  { href: '#anleitungen', key: 'guides'   },
  { href: '#faq',         key: 'faq'      },
  { href: '#ueber-mich',  key: 'about'    },
  { href: '#kontakt',     key: 'contact'  },
];

interface NavigationProps {
  onLogoClick?: () => void;
}

export function Navigation({ onLogoClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const de = lang === 'de';
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'noir' : 'light';
  const ThemeIcon = theme === 'light' ? Moon : theme === 'dark' ? Star : Sun;
  const themeLabel = theme === 'light'
    ? (de ? 'Dunkelmodus' : 'Dark mode')
    : theme === 'dark'
    ? 'Noir'
    : (de ? 'Hellmodus' : 'Light mode');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      // Drive progress bar directly — avoids a React re-render on every scroll tick
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
      if (progressBarRef.current) progressBarRef.current.style.width = `${pct}%`;

      const progress = Math.min(scrollY / 200, 1);
      const blur = progress * 16;
      if (navRef.current) {
        navRef.current.style.backdropFilter = `blur(${blur}px)`;
        (navRef.current.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = `blur(${blur}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const sectionIds = navItems.map(item => item.href.replace('#', ''));
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection('#' + entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-3 bg-transparent'
        }`}
        style={isScrolled ? {
          background: 'var(--nav-bg)',
          boxShadow: 'inset 0 -1px 0 var(--bd)',
        } : { background: 'transparent' }}
      >
        {/* Scroll progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
          <div
            ref={progressBarRef}
            className="h-full"
            style={{
              width: '0%',
              background: 'linear-gradient(90deg, #2B52B0, #4A72D4)',
              transition: 'width 80ms linear',
            }}
          />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
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
                className="w-auto rounded-lg"
                style={{ height: '36px', width: 'auto' }}
              />
              <span className="font-display text-sm font-bold tracking-wide text-wx-tx1">
                WAXCELERATE
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  className={`relative group px-4 py-2 text-sm transition-colors ${
                    activeSection === item.href ? 'text-wx-tx1' : 'text-wx-tx2 hover:text-wx-tx1'
                  }`}
                >
                  {t.nav[item.key as keyof typeof t.nav]}
                  {activeSection === item.href && (
                    <span className="absolute bottom-0 left-4 right-4 h-px" style={{ background: '#2B52B0' }} />
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

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(nextTheme)}
                className="p-2 text-wx-tx2 hover:text-wx-tx1 transition-colors rounded-md hover:bg-white/5"
                aria-label={themeLabel}
              >
                <ThemeIcon className="h-4 w-4" />
              </button>

              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="px-3 py-1.5 text-xs font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#2B52B0] rounded transition-colors"
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

      {/* Backdrop (tablet: sidebar mode) */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] hidden sm:block transition-opacity duration-[250ms] ease-in-out ${
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
        className={`lg:hidden fixed inset-0 sm:inset-y-0 sm:left-auto sm:w-80 z-[70] flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--pg)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-wx-bd/20 flex-shrink-0">
          <img src="/images/logo.jpg" alt="Waxcelerate" className="h-9 w-auto rounded-lg" />
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
            onClick={() => setTheme(nextTheme)}
            className="flex items-center gap-2 text-sm text-wx-tx2 hover:text-wx-tx1 transition-colors"
          >
            <ThemeIcon className="h-4 w-4" />
            {themeLabel}
          </button>
          <button
            onClick={toggleLang}
            className="px-4 py-2 text-sm font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[#2B52B0] rounded transition-colors"
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </div>
    </>
  );
}
