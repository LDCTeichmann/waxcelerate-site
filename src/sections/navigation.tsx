import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { CartIcon } from '@/components/CartIcon';
import { WaxcelerateMark } from '@/components/WaxcelerateMark';
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

// Desktop-Leiste: sechs Punkte, davon einer eine benannte Gruppe.
//
// Dritter Anlauf, die beiden vorherigen sind aus gegenteiligen Gruenden
// gescheitert und beide Gruende sind derselbe Fehler:
//   1. Zehn Punkte flach in einer Reihe -> Umbruch auf zwei Zeilen.
//   2. Sechs Punkte + "Mehr"-Klappe -> sah aus wie ein leeres Abwurfmenue:
//      vier duenne Textzeilen in einer sonst leeren weissen Box.
//   3. Sechs Punkte, Rest nur im Footer -> nicht mehr auffindbar; man stiess
//      nur zufaellig beim Scrollen darauf (Lucas Rueckmeldung).
// Der Fehler in 2 und 3 war nicht die Klappe an sich, sondern das Label:
// "Mehr" ist ein Sammelbegriff ohne Bedeutung — er koennte alles enthalten
// und gibt keinen Hinweis, was dahinter liegt. Nielsen Norman zu genau
// diesem Fall: benennende Labels schlagen generische Sammelbegriffe, und die
// Unterpunkte brauchen eigenen Kontext, statt sich auf den Elternpunkt zu
// verlassen (auch fuer Screenreader, die nur den Linktext vorlesen).
// Deshalb jetzt "Ratgeber" statt "Mehr", und jeder Eintrag mit einer Zeile,
// die sagt, was er ist. Das ist ein Ziel mit Inhaltsversprechen, kein
// Restehaufen — und Tools/Anleitungen/FAQ/Blog sind wieder ueber die
// Navigation erreichbar, ohne die Leiste zu sprengen.
const primaryNavItems = [
  { href: '#warum-wachs', key: 'whyWax'   },
  { href: '#produkte',    key: 'products' },
  { href: '/wissenschaft', key: 'science', route: true },
  { href: '/kette-wachsen-lassen', key: 'rewax',   route: true },
  { href: '#ueber-mich',  key: 'about'    },
  { href: '#kontakt',     key: 'contact'  },
] as const;

// Inhalt der "Ratgeber"-Gruppe. `desc` ist Pflicht, nicht Deko — ohne die
// Zeile ist die Klappe wieder die Liste aus Anlauf 2.
const resourceNavItems = [
  { href: '#tools',       key: 'tools',  desc: 'toolsDesc'  },
  { href: '#anleitungen', key: 'guides', desc: 'guidesDesc' },
  { href: '#faq',         key: 'faq',    desc: 'faqDesc'    },
  { href: '/blog',        key: 'blog',   desc: 'blogDesc', route: true },
] as const;

export function Navigation() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const de = lang === 'de';
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';
  const activeSection = useActiveSection(navItems.filter(i => !i.route).map(i => i.href));
  const isActive = (item: { href: string; route?: boolean }) =>
    item.route ? location.pathname === item.href : activeSection === item.href;
  const resourcesActive = resourceNavItems.some(isActive);

  // Klappe schliesst bei Klick nach aussen oder Escape — dasselbe Muster,
  // das Cart-Drawer und Mobilmenue hier ohnehin schon verwenden.
  useEffect(() => {
    if (!isResourcesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) setIsResourcesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsResourcesOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isResourcesOpen]);

  // Routenwechsel schliesst die Klappe. Ohne das bleibt sie beim Sprung auf
  // /blog offen ueber der neuen Seite stehen.
  useEffect(() => { setIsResourcesOpen(false); }, [location.pathname]);

  useBodyScrollLock(isMobileMenuOpen);

  // Ohne den mountedRef-Wächter lief der else-Zweig auch beim allerersten
  // Render (isMobileMenuOpen startet als false), also bei JEDEM Seitenaufruf
  // unter dem lg-Breakpoint — der Hamburger-Button bekam den Fokus, bevor
  // die Seite ueberhaupt etwas getan hatte. Jetzt nur noch bei einem echten
  // true→false-Uebergang (Menue wurde tatsaechlich geschlossen).
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
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

  // Anker-Ziele existieren nur auf der Startseite. Auf einer Unterseite muss
  // das href deshalb "/#anker" lauten und nicht "#anker": Der onClick-Handler
  // unten faengt den gewoehnlichen Klick ohnehin ab und navigiert korrekt,
  // aber alles, was am Handler vorbeigeht, benutzt das rohe href — Cmd-/
  // Mittelklick ("in neuem Tab oeffnen"), "Link kopieren", die Vorschau in
  // der Statuszeile und Bots. Die landeten von /wissenschaft aus bisher alle
  // auf /wissenschaft#produkte, einer Adresse, die es nicht gibt.
  const hrefFor = (item: { href: string; route?: boolean }) =>
    item.route || onHome ? item.href : `/${item.href}`;

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
      {/* Skip-Link: bisher gab es sitewide keine Moeglichkeit, per Tastatur
          direkt zum Seiteninhalt zu springen — jede Seite mit Tab starten
          hiess, sich erst durch Logo, sechs Nav-Punkte, Sprach-/Theme-Toggle
          und CTA zu tabben. Nur sichtbar bei Fokus (die uebliche
          Skip-Link-Konvention), zeigt auf `#main-content`, das jetzt jede
          Seite mit einem echten `<main>`-Landmark traegt. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-full focus:text-[13px] focus:font-semibold"
        style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
      >
        {de ? 'Zum Inhalt springen' : 'Skip to content'}
      </a>
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
            {/* Auf der Startseite ein Anker nach oben, auf jeder Unterseite
                die Startseite selbst — sonst zeigt das Logo dort auf
                "/wissenschaft#home". Gleiche Begruendung wie bei hrefFor(). */}
            <a
              href={onHome ? '#home' : '/'}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="wx-logo-link group flex items-center gap-2.5 shrink-0"
              aria-label={de ? 'Waxcelerate — zur Startseite' : 'Waxcelerate — back to homepage'}
            >
              <WaxcelerateMark className="w-auto h-14 lg:h-[4.2rem]" />
              <span
                className="hidden sm:block relative text-[17px] font-semibold tracking-[0.01em] transition-colors duration-300"
                style={{ color: 'var(--tx1)', fontFamily: "'Libre Franklin', ui-sans-serif, system-ui, sans-serif" }}
              >
                Waxcelerate
                {/* Gleiche Unterstrich-Sprache wie die Nav-Links rechts daneben —
                    das Logo verhält sich sichtbar wie ein Nav-Item, nicht wie ein
                    unklickbares Bild. Kein neues visuelles Vokabular nötig. */}
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px origin-left scale-x-0 transition-transform duration-300 ease-out motion-safe:group-hover:scale-x-100"
                  style={{ background: 'var(--accent)' }}
                  aria-hidden
                />
              </span>
            </a>

            {/* Desktop Navigation — zentriert, ruhige Editorial-Typo.
                Sechs Ziele, eine Reihe, kein Dropdown — siehe Begruendung bei
                primaryNavItems oben. */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-7">
              {primaryNavItems.map((item) => (
                <a
                  key={item.href}
                  href={hrefFor(item)}
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

              {/* Ratgeber-Gruppe. Panel statt Liste: Titel plus je eine Zeile
                  Kontext, damit man vor dem Klick weiss, was einen erwartet.
                  Genau das fehlte der "Mehr"-Fassung. */}
              <div ref={resourcesRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsResourcesOpen(v => !v)}
                  aria-expanded={isResourcesOpen}
                  aria-haspopup="true"
                  aria-controls="resources-menu"
                  className="relative group flex items-center gap-1 text-[13.5px] tracking-[0.01em] transition-colors duration-300 whitespace-nowrap"
                  style={{ color: resourcesActive || isResourcesOpen ? 'var(--tx1)' : 'var(--tx2)' }}
                >
                  {t.nav.resources}
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200"
                    style={{ transform: isResourcesOpen ? 'rotate(180deg)' : 'none' }}
                    aria-hidden
                  />
                  <span
                    className={`absolute -bottom-1.5 left-0 right-0 h-px origin-left transition-transform duration-200 ${
                      resourcesActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    style={{ background: resourcesActive ? 'var(--accent)' : 'var(--bd)' }}
                  />
                </button>

                {isResourcesOpen && (
                  <div
                    id="resources-menu"
                    role="menu"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-2 rounded-2xl w-[330px]"
                    style={{
                      background: 'var(--sf)',
                      border: '1px solid var(--bd)',
                      boxShadow: '0 18px 50px rgba(10,10,16,0.16), 0 3px 12px rgba(10,10,16,0.08)',
                    }}
                  >
                    {resourceNavItems.map((item) => (
                      <a
                        key={item.href}
                        href={hrefFor(item)}
                        role="menuitem"
                        onClick={(e) => { e.preventDefault(); setIsResourcesOpen(false); handleNav(item); }}
                        className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--sf2)]"
                      >
                        <span
                          className="block text-[13.5px] font-semibold"
                          style={{ color: isActive(item) ? 'var(--accent)' : 'var(--tx1)' }}
                        >
                          {t.nav[item.key as keyof typeof t.nav]}
                        </span>
                        <span className="block text-[12px] leading-snug mt-0.5" style={{ color: 'var(--txm)' }}>
                          {t.nav[item.desc as keyof typeof t.nav]}
                        </span>
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
                aria-label={de ? (theme === 'light' ? 'Zum Dark Mode wechseln' : 'Zum Light Mode wechseln') : (theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              {checkoutEnabled && <CartIcon light={false} />}

              {/* Primär-CTA — immer sichtbar, ersetzt den „Produkte"-Link.
                  hrefFor() auch hier: Das ist der wichtigste Link im Header,
                  und auf einer Unterseite zeigte er auf
                  "/wissenschaft#produkte" — also ins Leere fuer jeden, der ihn
                  im neuen Tab oeffnet oder die Adresse kopiert. */}
              <a
                href={hrefFor({ href: '#produkte' })}
                onClick={(e) => { e.preventDefault(); scrollToSection('#produkte'); }}
                className="cta-brand-pulse hidden lg:inline-flex items-center px-5 py-2.5 text-[13px] font-semibold rounded-full transition-transform duration-300 hover:-translate-y-0.5"
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

      {/* Panel — translate-x-full moves it off-screen but does NOT remove it
          from the accessibility tree or tab order (CSS transforms never do).
          Without aria-hidden/inert, a keyboard user tabbing through the page
          lands in ~10 invisible links + two toggles before reaching any real
          content. Same fix as the sticky buy-bar in ProductDetailPage.tsx. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={de ? 'Navigation' : 'Navigation'}
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
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
          <WaxcelerateMark className="h-11 w-auto" ariaLabel="Waxcelerate" />
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
              href={hrefFor(item)}
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
            aria-label={de ? (theme === 'light' ? 'Zum Dark Mode wechseln' : 'Zum Light Mode wechseln') : (theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')}
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
