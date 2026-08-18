import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { CartIcon } from '@/components/CartIcon';
import { checkoutEnabled } from '@/lib/data';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

// Reihenfolge = Scroll-Reihenfolge der Sections auf der Seite.
// `route: true` → eigene Seite (React-Router-Navigation statt Scroll-Anchor).
// „Produkte" entfällt im Desktop-Header — der „Jetzt bestellen"-Button (→ #produkte)
// übernimmt diese Rolle, ohne sich zu doppeln. Mobil bleibt Produkte erhalten.
const navItems = [
  { href: '#warum-wachs', key: 'whyWax'   },
  { href: '#produkte',    key: 'productsServices' },
  { href: '/wissenschaft', key: 'science', route: true },
  { href: '/kette-wachsen-lassen', key: 'rewax',   route: true },
  { href: '#ueber-mich',  key: 'about'    },
  { href: '#tools',       key: 'tools'    },
  { href: '#anleitungen', key: 'guides'   },
  { href: '#faq',         key: 'faq'      },
  { href: '/blog',        key: 'blog',    route: true },
  { href: '#kontakt',     key: 'contact'  },
];

// Mobile keeps the full flat list — a vertical scroll list has room for ten
// items; a single-row desktop bar does not.
const mobileNavItems = navItems;

// Desktop bar: ten items in one row wrapped onto two lines at normal desktop
// widths — the actual "cramped" complaint, not a matter of taste. Standard
// fix (not a guess — this is the common pattern for >6-item bars: Nielsen
// Norman's guidance on primary vs. secondary nav, and what most sites with
// this many sections converge on) is to keep the items people navigate by
// most of the time in the bar, and fold the rest under one "More" menu.
// Split chosen by what's a destination in its own right (why wax, products,
// science, the paid service, about, contact) vs. what's already reachable
// from within the homepage itself one scroll away (tools/guides/faq) or a
// secondary content channel (blog).
const primaryNavItems = [
  { href: '#warum-wachs', key: 'whyWax'   },
  { href: '#produkte',    key: 'products' },
  { href: '/wissenschaft', key: 'science', route: true },
  { href: '/kette-wachsen-lassen', key: 'rewax',   route: true },
  { href: '#ueber-mich',  key: 'about'    },
  { href: '#kontakt',     key: 'contact'  },
] as const;
const moreNavItems = [
  { href: '#tools',       key: 'tools'    },
  { href: '#anleitungen', key: 'guides'   },
  { href: '#faq',         key: 'faq'      },
  { href: '/blog',        key: 'blog',    route: true },
] as const;

export function Navigation() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const de = lang === 'de';
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';
  const activeSection = useActiveSection(navItems.filter(i => !i.route).map(i => i.href));
  const isActive = (item: { href: string; route?: boolean }) =>
    item.route ? location.pathname === item.href : activeSection === item.href;
  const moreActive = moreNavItems.some(isActive);

  // Close the "More" dropdown on an outside click or Escape — the same
  // pattern the cart drawer and mobile menu already use elsewhere.
  useEffect(() => {
    if (!isMoreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMoreOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isMoreOpen]);


  useBodyScrollLock(isMobileMenuOpen);

  useEffect(() => {
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
  }, [isMobileMenuOpen]);

  const scrollToSection = (href: string) => {
    // Anchor targets only exist on the homepage. From any other route, go
    // home first and let PendingAnchorScroll (rendered there) finish the job
    // once the (possibly lazy-loaded) section actually exists in the DOM.
    if (!onHome) {
      navigate('/', { state: { scrollTo: href } });
      setIsMobileMenuOpen(false);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Anchor-Items scrollen innerhalb der Startseite; Route-Items (Wissenschaft,
  // Blog) wechseln die Seite über den Router.
  const handleNav = (item: { href: string; route?: boolean }) => {
    if (item.route) {
      navigate(item.href);
      setIsMobileMenuOpen(false);
      return;
    }
    scrollToSection(item.href);
  };

  return (
    <>
      {/* ── Header bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 py-2 transition-all duration-300"
        style={{
          background: 'var(--nav-bg)',
          boxShadow: 'inset 0 -1px 0 var(--bd)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo — Wortmarke steht groß im Hero, daher hier nur das Zeichen */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="flex items-center gap-2.5 shrink-0"
              aria-label="Waxcelerate"
            >
              <img
                src="/images/logo-dark.png"
                alt=""
                className="w-auto h-14 lg:h-[4.2rem]"
              />
              <span
                className="hidden sm:block text-[15px] font-semibold tracking-[0.01em]"
                style={{ color: 'var(--tx1)', fontFamily: "'Libre Franklin', ui-sans-serif, system-ui, sans-serif" }}
              >
                Waxcelerate
              </span>
            </a>

            {/* Desktop Navigation — zentriert, ruhige Editorial-Typo.
                Six primary items + one "Mehr" dropdown, not all ten items
                flat: at normal desktop widths ten items in one row wrapped
                onto two lines (the actual cramped complaint), because there
                simply isn't room. This is the standard fix for a >6-item bar
                — keep the items people navigate by most of the time in the
                row, fold the rest under one grouped menu. */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
              {primaryNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNav(item); }}
                  className="relative group text-[13.5px] tracking-[0.01em] transition-colors duration-300 whitespace-nowrap"
                  style={{
                    color: isActive(item) ? 'var(--tx1)' : 'var(--tx2)',
                  }}
                >
                  {t.nav[item.key as keyof typeof t.nav]}
                  <span
                    className={`absolute -bottom-1.5 left-0 right-0 h-px origin-left transition-transform duration-200 ${
                      isActive(item) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    style={{ background: isActive(item) ? 'var(--accent)' : 'var(--bd)' }}
                  />
                </a>
              ))}

              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(v => !v)}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                  className="relative flex items-center gap-1 text-[13.5px] tracking-[0.01em] transition-colors duration-300 whitespace-nowrap"
                  style={{ color: moreActive || isMoreOpen ? 'var(--tx1)' : 'var(--tx2)' }}
                >
                  {t.nav.more}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" style={{ transform: isMoreOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {isMoreOpen && (
                  <div
                    role="menu"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 py-2 rounded-xl min-w-[180px]"
                    style={{ background: 'var(--sf)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}
                  >
                    {moreNavItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={(e) => { e.preventDefault(); setIsMoreOpen(false); handleNav(item); }}
                        className="block px-4 py-2.5 text-[13.5px] whitespace-nowrap transition-colors"
                        style={{ color: isActive(item) ? 'var(--accent)' : 'var(--tx2)' }}
                      >
                        {t.nav[item.key as keyof typeof t.nav]}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
              {/* Language toggle — desktop only */}
              <button
                onClick={toggleLang}
                className="hidden lg:block text-[12px] font-medium tracking-wide transition-colors"
                style={{ color: 'var(--tx2)' }}
                aria-label={lang === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
              >
                {lang === 'de' ? 'EN' : 'DE'}
              </button>

              {/* Theme toggle — desktop only */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'noir' : 'light')}
                className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                style={{ color: 'var(--tx2)' }}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              {checkoutEnabled && <CartIcon light={false} />}

              {/* Primär-CTA — immer sichtbar, ersetzt den „Produkte"-Link */}
              <a
                href="#produkte"
                onClick={(e) => { e.preventDefault(); scrollToSection('#produkte'); }}
                className="hidden lg:inline-flex items-center px-5 py-2.5 text-[13px] font-semibold rounded-full transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {de ? 'Jetzt bestellen' : 'Buy now'}
              </a>

              {/* Mobile menu button */}
              <button
                id="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 -m-1 transition-colors"
                style={{ color: 'var(--tx2)' }}
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
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-[250ms] ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
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
          <img src="/images/logo-dark.png" alt="Waxcelerate" className="h-11 w-auto" />
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
          {mobileNavItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => { e.preventDefault(); handleNav(item); }}
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[var(--accent)] rounded transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'light' ? (de ? 'Dark Mode' : 'Dark mode') : (de ? 'Light Mode' : 'Light mode')}
          </button>
          <button
            onClick={toggleLang}
            className="px-4 py-2 text-sm font-medium text-wx-tx2 hover:text-wx-tx1 border border-wx-bd/50 hover:border-[var(--accent)] rounded transition-colors"
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </div>
    </>
  );
}
