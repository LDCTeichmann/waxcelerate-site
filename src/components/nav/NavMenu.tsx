import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// Ein Punkt der Desktop-Navigation nach dem Vorbild von yoeleo.com: Hover
// laesst eine dunkle Pille von unten einfahren (CSS .nav-pill in index.css),
// die Trefferflaeche ist das ganze <li> ueber die volle Leistenhoehe, und
// Punkte mit Unterseiten klappen eine Tafel aus, die buendig an der
// Headerunterkante haengt. Oeffnen/Schliessen mit kurzer Verzoegerung, damit
// leichtes Danebenfahren nichts zuklappt.

export interface NavMenuEntry {
  key: string;
  label: string;
  desc?: string;
  href: string;
  active?: boolean;
  onSelect: (e: MouseEvent<HTMLAnchorElement>) => void;
}

const OPEN_DELAY = 60;
const CLOSE_DELAY = 180;
const MAGNET = 0.12;
const MAGNET_MAX = 4;

const canMagnet = () =>
  window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function NavItem({ id, label, href, active, onNavigate, entries }: {
  id: string;
  label: string;
  /** Ohne href ist der Punkt nur Klappe (Ratgeber) und wird ein Button. */
  href?: string;
  active?: boolean;
  onNavigate?: (e: MouseEvent<HTMLAnchorElement>) => void;
  entries?: NavMenuEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(8);
  const liRef = useRef<HTMLLIElement>(null);
  const pillRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const location = useLocation();
  const hasMenu = !!entries?.length;
  const menuId = `${id}-menu`;

  const schedule = (next: boolean, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  // Die Tafel soll exakt an der Headerunterkante haengen, egal wie viel
  // Innenabstand zwischen <li> und Header liegt.
  useLayoutEffect(() => {
    if (!open || !liRef.current) return;
    const header = liRef.current.closest('header');
    if (header) setOffset(header.getBoundingClientRect().bottom - liRef.current.getBoundingClientRect().bottom);
  }, [open]);

  const onMove = (e: MouseEvent<HTMLLIElement>) => {
    const pill = pillRef.current;
    if (!pill || !canMagnet()) return;
    const r = pill.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, v * MAGNET));
    pill.style.transform = `translate(${clamp(e.clientX - (r.left + r.width / 2))}px, ${clamp(e.clientY - (r.top + r.height / 2))}px)`;
  };
  const onLeave = () => {
    if (pillRef.current) pillRef.current.style.transform = '';
    if (hasMenu) schedule(false, CLOSE_DELAY);
  };
  const onBlur = (e: FocusEvent<HTMLLIElement>) => {
    if (!liRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'Escape' && open) { setOpen(false); pillRef.current?.focus(); }
  };

  const chevron = hasMenu && <ChevronDown className="nav-pill__chev h-3.5 w-3.5" aria-hidden />;
  const inner = (
    <>
      <span className="nav-pill__text">{label}{chevron}</span>
      <span className="nav-pill__dup" aria-hidden>{label}{chevron}</span>
    </>
  );
  const pillProps = {
    ref: pillRef,
    className: 'nav-pill',
    'data-active': active || undefined,
    'aria-expanded': hasMenu ? open : undefined,
    'aria-controls': hasMenu ? menuId : undefined,
  };

  return (
    <li
      ref={liRef}
      className="nav-item relative flex h-full items-center px-0.5"
      data-open={open}
      onMouseEnter={() => hasMenu && schedule(true, OPEN_DELAY)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onFocus={() => hasMenu && setOpen(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {href ? (
        <a href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined} {...pillProps}>{inner}</a>
      ) : (
        <button type="button" onClick={() => setOpen(v => !v)} {...pillProps}>{inner}</button>
      )}

      {hasMenu && (
        <div id={menuId} className="nav-drop" data-open={open} inert={!open}
          style={{ top: `calc(100% + ${offset - 1}px)` }}>
          <span className="nav-drop__corner nav-drop__corner--l" aria-hidden>
            <svg viewBox="0 0 18 18"><path d="M0 0H18V18A18 18 0 0 0 0 0Z" /></svg>
          </span>
          <span className="nav-drop__corner nav-drop__corner--r" aria-hidden>
            <svg viewBox="0 0 18 18"><path d="M18 0H0V18A18 18 0 0 1 18 0Z" /></svg>
          </span>
          <ul className="nav-drop__list">
            {entries!.map(entry => (
              <li key={entry.key}>
                <a href={entry.href} className="nav-drop__link" data-active={entry.active || undefined}
                  onClick={(e) => { setOpen(false); entry.onSelect(e); }}>
                  <span className="nav-drop__title">{entry.label}</span>
                  {entry.desc && <span className="nav-drop__desc">{entry.desc}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
