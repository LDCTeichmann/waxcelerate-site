import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Globe, Mail, MessageCircle, Moon, RotateCw, ShoppingBag, Sun, Truck, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { CONTACT } from '@/lib/data';

// Schwarze Leiste ueber der Navigation, nach dem Vorbild von yoeleo.com:
// links Kontaktwege, Mitte wechselnde Meldungen mit Pfeilen, rechts Sprache
// und Hell/Dunkel. Sie sitzt im fixen Header und faehrt beim ersten
// Scrollen mit ihm nach oben weg (navigation.tsx), damit der Hero wieder
// ruhig ist. Hoehe = --topbar-h (index.css), body traegt dieselbe Hoehe als
// padding-top, also verdeckt sie oben nie Inhalt.

const AUTOPLAY_MS = 5000;

function InstagramIcon({ className }: { className?: string }) {
  // Inline statt lucide: Marken-Icons sind dort veraltet und koennen
  // verschwinden.
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Topbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const de = lang === 'de';
  const h = t.header;
  const dispatch = useDispatchLine(de);

  const messages: { icon: LucideIcon; body: ReactNode; to?: string }[] = [
    { icon: Truck, body: h.freeShipping },
    { icon: Clock, body: dispatch },
    { icon: MessageCircle, body: <>{h.question} <span className="underline underline-offset-2">{h.questionCta}</span></>, to: '/kontakt' },
    { icon: RotateCw, body: <>{h.rewax} · {t.products.shelf.rewaxFrom}</>, to: '/kette-wachsen-lassen' },
  ];
  const count = messages.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Screenreader sollen nur hoeren, was jemand selbst angeklickt hat, nicht
  // alle fuenf Sekunden eine neue Meldung.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex(i => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const step = (d: number) => { setManual(true); setIndex(i => (i + d + count) % count); };

  const socials = [
    { href: `mailto:${CONTACT.email}`, label: h.email, icon: <Mail className="h-3.5 w-3.5" aria-hidden /> },
    { href: CONTACT.whatsapp, label: h.whatsapp, icon: <MessageCircle className="h-3.5 w-3.5" aria-hidden /> },
    { href: CONTACT.ebay, label: h.ebay, icon: <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> },
    ...(CONTACT.instagram ? [{ href: CONTACT.instagram, label: h.instagram, icon: <InstagramIcon className="h-3.5 w-3.5" /> }] : []),
  ];

  const iconBtn = 'topbar-btn flex h-7 w-7 items-center justify-center rounded-full';

  // Farben ueber --topbar-* (index.css): hell ein dunkler Streifen, im
  // Dunkelmodus ein heller — der Streifen ist immer der Kontrast zur Leiste
  // darunter, gleiche Logik wie --cta-bg.
  return (
    <div className="wx-topbar">
      <div className="grid h-full w-full grid-cols-1 items-center px-4 text-[12px] sm:px-6 lg:grid-cols-[1fr_minmax(0,1.6fr)_1fr] lg:px-8 xl:px-12">
        <ul className="hidden items-center gap-0.5 lg:flex">
          {socials.map(s => (
            <li key={s.href}>
              <a href={s.href} aria-label={s.label} title={s.label} className={iconBtn}
                {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {s.icon}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex h-full min-w-0 items-center justify-center gap-2"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <button type="button" onClick={() => step(-1)} aria-label={h.prev} className={`${iconBtn} hidden sm:flex`}>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </button>
          <div className="relative h-full min-w-0 flex-1 sm:max-w-[460px]" aria-live={manual ? 'polite' : 'off'}>
            {messages.map((m, k) => {
              const active = k === index;
              const inner = (
                <>
                  <m.icon className="h-3.5 w-3.5 flex-shrink-0 opacity-80" aria-hidden />
                  <span className="truncate [&_b]:font-semibold [&_b]:text-[color:var(--topbar-fg)]">{m.body}</span>
                </>
              );
              const cls = 'absolute inset-0 flex items-center justify-center gap-2 transition-[opacity,transform] duration-500 ease-out';
              const style = { opacity: active ? 1 : 0, transform: active ? 'none' : 'translateY(4px)', pointerEvents: active ? 'auto' as const : 'none' as const };
              return m.to ? (
                <Link key={k} to={m.to} className={`${cls} topbar-link`} style={style} aria-hidden={!active} inert={!active}>{inner}</Link>
              ) : (
                <p key={k} className={cls} style={style} aria-hidden={!active}>{inner}</p>
              );
            })}
          </div>
          <button type="button" onClick={() => step(1)} aria-label={h.next} className={`${iconBtn} hidden sm:flex`}>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <div className="hidden items-center justify-end gap-1 lg:flex">
          <button type="button" onClick={toggleLang}
            className="topbar-btn flex h-7 items-center gap-1.5 rounded-full px-2.5"
            aria-label={de ? 'Switch to English' : 'Zu Deutsch wechseln'}>
            <Globe className="h-3.5 w-3.5" aria-hidden /> {h.switchLang}
          </button>
          <button type="button" onClick={() => setTheme(theme === 'light' ? 'noir' : 'light')}
            className="topbar-btn flex h-7 items-center gap-1.5 rounded-full px-2.5"
            aria-label={de ? (theme === 'light' ? 'Zum Dark Mode wechseln' : 'Zum Light Mode wechseln') : (theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode')}>
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" aria-hidden /> : <Sun className="h-3.5 w-3.5" aria-hidden />}
            {theme === 'light' ? h.themeDark : h.themeLight}
          </button>
        </div>
      </div>
    </div>
  );
}
