import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { CartIcon } from '@/components/CartIcon';
import { WaxcelerateMark } from '@/components/WaxcelerateMark';
import { Topbar } from '@/components/nav/Topbar';
import { NavItem, type NavMenuEntry } from '@/components/nav/NavMenu';
import { checkoutEnabled } from '@/lib/data';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

// Reihenfolge = Menuordnung aus docs/plaene/SEITENORDNUNG_PLAN.md (09/2026):
// Warum Wachs -> Produkte -> Kette wachsen lassen -> Anleitungen & Rechner ->
// Blog & FAQ -> Wissenschaft -> Kontakt. `route: true` -> eigene Seite
// (React-Router-Navigation statt Scroll-Anchor). „Über mich" und die
// vorherige "Ratgeber"-Klappengruppe (Tools/Anleitungen/FAQ/Blog einzeln)
// entfallen als eigene Menuepunkte: Anleitungen+Tools leben jetzt auf
// /anleitung, FAQ+Blog auf /blog, Über mich auf /kontakt#ueber-mich.
// Mobile nutzt dieselbe flache Liste, Desktop dieselbe Reihenfolge als Pillen.
const navItems = [
  { href: '#warum-wachs', key: 'whyWax'   },
  { href: '#produkte',    key: 'productsServices' },
  { href: '/kette-wachsen-lassen', key: 'rewax',   route: true },
  { href: '/anleitung',   key: 'guidesTools', route: true },
  { href: '/blog',        key: 'blogFaq', route: true },
  { href: '/wissenschaft', key: 'science', route: true },
  { href: '/kontakt',     key: 'contact', route: true },
];

const mobileNavItems = navItems;

const primaryNavItems = [
  { href: '#warum-wachs', key: 'whyWax'   },
  { href: '#produkte',    key: 'products' },
  { href: '/kette-wachsen-lassen', key: 'rewax',   route: true },
  { href: '/anleitung',   key: 'guidesTools', route: true },
  { href: '/blog',        key: 'blogFaq', route: true },
  { href: '/wissenschaft', key: 'science', route: true },
  { href: '/kontakt',     key: 'contact', route: true },
] as const;

export function Navigation() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const de = lang === 'de';
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';
  const activeSection = useActiveSection(navItems.filter(i => !i.route).map(i => i.href));

  // heroTransparent: nur auf der Startseite und nur ganz oben. Der v3-
  // Mobile-Hero (hero-light.tsx) ist jetzt randlos und beginnt bei y=0, die
  // fixe Leiste schwebt also direkt ueber dessen dunklem Foto — dafuer wird
  // sie hier transparent und faerbt sich beim Runterscrollen ein. `scrolled`
  // startet als `false` (= Leiste opak), das ist zugleich exakt der Zustand
  // des vorgerenderten statischen HTML (kein Scroll passiert vor React) und
  // bei einem echten Ladevorgang oben auf der Seite ohnehin korrekt — kein
  // Hydration-Flackern moeglich. Nur die eine `useEffect`-Grenze steuert den
  // Wechsel, ausschliesslich per CSS-Klasse mit `!important` in index.css
  // (Grund siehe Kommentar dort): der `<header>` setzt background/box-shadow
  // sonst inline, und Inline-Styles gewinnen normalerweise gegen jede externe
  // Regel — ausser `!important`.
  const [scrolled, setScrolled] = useState(false);
  // Topbar faehrt schon beim ersten Scrollen weg (yoeleo-Muster), frueher
  // als der Hero-Transparenzwechsel bei 24 px.
  const [pastTop, setPastTop] = useState(false);
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 24); setPastTop(window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const heroTransparent = onHome && !scrolled;
  const isActive = (item: { href: string; route?: boolean }) =>
    item.route ? location.pathname === item.href : activeSection === item.href;
  const productsActive = isActive({ href: '#produkte' }) || /^\/(ketten|starter-set|produkt\/|zubehoer\/)/.test(location.pathname);
  // /rechner/:slug bleiben eigene Seiten (siehe SEITENORDNUNG_PLAN.md, Chat 3),
  // sollen aber weiter unter "Anleitungen & Rechner" aktiv erscheinen.
  const guidesToolsActive = isActive({ href: '/anleitung', route: true }) || location.pathname.startsWith('/rechner');

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

  // Klappen-Inhalte. Nur Punkte mit echten Unterzielen bekommen eine Klappe;
  // Kette wachsen lassen, Anleitungen & Rechner, Blog & FAQ, Wissenschaft und
  // Kontakt sind je eine Seite, eine Klappe dort waere Deko.
  const h = t.header;
  const entry = (key: string, label: string, desc: string | undefined, item: { href: string; route?: boolean }): NavMenuEntry => ({
    key, label, desc, href: hrefFor(item), active: isActive(item),
    onSelect: (e) => { e.preventDefault(); handleNav(item); },
  });
  const menus: Partial<Record<(typeof primaryNavItems)[number]['key'], NavMenuEntry[]>> = {
    whyWax: [
      entry('why', h.menuWhy, h.menuWhyDesc, { href: '#warum-wachs' }),
      entry('reviews', h.menuReviews, h.menuReviewsDesc, { href: '#bewertungen' }),
    ],
    products: [
      // "Kettenwachs" zeigt vorerst auf #produkte; Chat 2 stellt den Link
      // auf die neue Seite /kettenwachs um, sobald sie existiert.
      entry('wax', h.menuWaxCategory, h.menuWaxCategoryDesc, { href: '#produkte' }),
      entry('classic', h.menuClassic, h.menuClassicDesc, { href: '/produkt/wax-500', route: true }),
      entry('pro', h.menuPro, h.menuProDesc, { href: '/produkt/wax-500-mos2', route: true }),
      entry('set', h.menuSet, h.menuSetDesc, { href: '/starter-set', route: true }),
      entry('chains', h.menuChains, h.menuChainsDesc, { href: '/ketten', route: true }),
    ],
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
        className={`wx-header fixed top-0 left-0 right-0 z-50 transition-all duration-300${pastTop ? ' topbar-hidden' : ''}${heroTransparent ? ' nav-on-hero' : ''}`}
        style={{
          background: 'var(--nav-bg)',
          boxShadow: 'inset 0 -1px 0 var(--bd)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <Topbar />
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo — Zeichen plus Wortmarke, auf ALLEN Breiten. Die Wortmarke
                war bis 09/2026 `hidden sm:block`, weil sie gross im Hero
                stand; seit dem v4-Mobile-Hero steht sie dort nicht mehr, und
                ohne sie fehlte der Markenname auf dem Handy komplett. Platz
                reicht: Zeichen 56px + Abstand 10px + Wortmarke ~103px +
                Hamburger 44px + Padding 32px = ~245px von 375px. */}
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
                className="wx-logo-wordmark relative text-[15px] sm:text-[17px] font-semibold tracking-[0.01em] transition-colors duration-300"
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

            {/* Desktop Navigation — Pillen nach yoeleo-Muster (NavMenu.tsx).
                Die <nav> streckt sich ueber die volle Leistenhoehe, damit
                jedes <li> oben bis unten Trefferflaeche ist. Sprache und
                Hell/Dunkel stehen jetzt in der Topbar darueber. */}
            <nav className="hidden lg:flex flex-1 self-stretch justify-center" aria-label={de ? 'Hauptnavigation' : 'Main navigation'}>
              <ul className="flex h-full items-stretch">
                {primaryNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    id={`nav-${item.key}`}
                    label={t.nav[item.key]}
                    href={hrefFor(item)}
                    active={item.key === 'products' ? productsActive : item.key === 'guidesTools' ? guidesToolsActive : isActive(item)}
                    onNavigate={(e) => { e.preventDefault(); handleNav(item); }}
                    entries={menus[item.key]}
                  />
                ))}
              </ul>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
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
