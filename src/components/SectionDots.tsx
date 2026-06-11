import { useLocation } from 'react-router-dom';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useLanguage } from '@/hooks/useLanguage';

const NAV_ITEMS = [
  { href: '#home',        labelDe: 'Start',       labelEn: 'Home'     },
  { href: '#produkte',    labelDe: 'Produkte',     labelEn: 'Products' },
  { href: '#anleitungen', labelDe: 'Anleitungen',  labelEn: 'Guides'   },
  { href: '#tools',       labelDe: 'Tools',        labelEn: 'Tools'    },
  { href: '#faq',         labelDe: 'FAQ',          labelEn: 'FAQ'      },
  { href: '#ueber-mich',  labelDe: 'Über mich',    labelEn: 'About'    },
  { href: '#kontakt',     labelDe: 'Kontakt',      labelEn: 'Contact'  },
];

export function SectionDots() {
  const location = useLocation();
  const { lang } = useLanguage();
  const de = lang === 'de';
  const activeSection = useActiveSection(NAV_ITEMS.map(i => i.href));

  // Only show on main page
  if (location.pathname !== '/') return null;

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hidden lg:flex fixed right-4 xl:right-5 top-1/2 -translate-y-1/2 z-40 flex-col gap-2.5">
      {NAV_ITEMS.map(item => {
        const isActive = activeSection === item.href;
        return (
          <div key={item.href} className="relative group flex items-center justify-end">
            {/* Label tooltip — appears to the left on hover */}
            <span
              className="absolute right-full mr-2.5 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{ background: 'var(--sf2)', color: 'var(--tx2)', border: '1px solid var(--bd)' }}
            >
              {de ? item.labelDe : item.labelEn}
            </span>
            {/* Dot */}
            <button
              onClick={() => scrollTo(item.href)}
              aria-label={de ? item.labelDe : item.labelEn}
              className="transition-all duration-300"
              style={{
                width: '6px',
                height: isActive ? '18px' : '6px',
                borderRadius: isActive ? '3px' : '50%',
                background: isActive ? 'var(--accent)' : 'var(--bd2)',
                opacity: isActive ? 1 : 0.6,
                display: 'block',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
