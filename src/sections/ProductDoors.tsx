// ─── ProductDoors — the three ways in ────────────────────────────────────────
// Not three products. Three intents: "I want to try it", "I already wax",
// "I want it done for me". The same three paths the merchandising concept
// names, and the reason a card grid like this converts better than a filtered
// list: the visitor self-selects before they ever see a price.
//
// No prices here on purpose. A price on an overview card invites comparison
// shopping between your own SKUs; the job of this row is only to route.
//
// The set door goes to its own page (/starter-set); the other two swap the
// product list in underneath. SETS_LIVE can be flipped back to false if the set
// is ever pulled, and the row falls back to two panels without further edits.

import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const SETS_LIVE = true;

type Door = {
  slug: string;
  tab?: 'wax' | 'chain';
  href?: string;
  chipDe: string; chipEn: string;
  titleDe: string; titleEn: string;
  altDe: string; altEn: string;
};

const DOORS: Door[] = [
  ...(SETS_LIVE ? [{
    slug: 'starter-set', href: '/starter-set',
    chipDe: 'Alles für den Anfang', chipEn: 'Everything to start',
    titleDe: 'Starter-Sets', titleEn: 'Starter sets',
    altDe: 'Waxcelerate Starter-Set mit Wachsblock, Quick-Link-Zange und Kette',
    altEn: 'Waxcelerate starter set with wax block, quick-link pliers and chain',
  } as Door] : []),
  {
    slug: 'kettenwachs', tab: 'wax',
    chipDe: 'Hergestellt in Stuttgart', chipEn: 'Made in Stuttgart',
    titleDe: 'Kettenwachs', titleEn: 'Chain wax',
    altDe: 'Block Waxcelerate Kettenwachs auf Schiefer',
    altEn: 'Block of Waxcelerate chain wax on slate',
  },
  {
    slug: 'ketten', tab: 'chain',
    chipDe: 'Ab morgen fahrbereit', chipEn: 'Ready to ride tomorrow',
    titleDe: 'Vorgewachste Ketten', titleEn: 'Pre-waxed chains',
    altDe: 'Handgewachste Fahrradkette mit trockenem Wachsfilm',
    altEn: 'Hand-waxed bicycle chain with a dry wax film',
  },
];

export function ProductDoors({ de }: { de: boolean }) {
  // Scroll to the list, not to #produkte: these cards already sit inside that
  // section, so scrolling to its top would move the reader backwards past the
  // very thing they just asked to see.
  const go = (d: Door) => {
    if (d.tab) window.dispatchEvent(new CustomEvent('wax:selectTab', { detail: d.tab }));
    document.getElementById('produkt-liste')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // A door is either a route or an in-place list swap, so it is either a Link
  // or a button. Rendering that as one polymorphic component means spreading a
  // union of prop objects, which the build-mode compiler rightly rejects: there
  // is no single element type those props are all valid for. Two explicit
  // branches around shared children cost four lines and type-check honestly.
  const face = (d: Door) => (
    <>
          <picture>
            <source srcSet={`/images/doors/${d.slug}-800.webp 800w, /images/doors/${d.slug}.webp 1200w`}
              sizes="(max-width: 640px) 92vw, 33vw" type="image/webp" />
            <img src={`/images/doors/${d.slug}.webp`} alt={de ? d.altDe : d.altEn} loading="lazy" decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
          </picture>

          {/* Legibility scrim. Solid page-independent black, not a token: this
              sits on a photo, so it is about reading white text on an image,
              not about theme. */}
          <span aria-hidden className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0.22) 100%)' }} />

          <span className="absolute left-4 right-4 top-4 flex justify-center">
            <span className="text-[11px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-full backdrop-blur-sm"
              style={{ color: 'rgba(255,255,255,0.94)', border: '1px solid rgba(255,255,255,0.34)', background: 'rgba(0,0,0,0.20)' }}>
              {de ? d.chipDe : d.chipEn}
            </span>
          </span>

          <span className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-4">
            <span className="font-display font-bold leading-[1.08] tracking-[-0.02em]"
              style={{ color: '#fff', fontSize: 'clamp(1.35rem, 2.6vw, 1.9rem)', textShadow: '0 1px 18px rgba(0,0,0,0.35)' }}>
              {de ? d.titleDe : d.titleEn}
            </span>
            <ArrowUpRight aria-hidden
              className="h-6 w-6 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: 'rgba(255,255,255,0.92)' }} />
          </span>
    </>
  );

  const CARD_CLASS = 'group relative block w-full overflow-hidden rounded-2xl text-left';
  const CARD_STYLE = { aspectRatio: '4 / 5', background: 'var(--hero-stage)' } as const;

  return (
    <div className={`grid gap-3 sm:gap-4 ${DOORS.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {DOORS.map(d => (
        d.href ? (
          <Link key={d.slug} to={d.href} className={CARD_CLASS} style={CARD_STYLE}>
            {face(d)}
          </Link>
        ) : (
          <button key={d.slug} type="button" onClick={() => go(d)} className={CARD_CLASS} style={CARD_STYLE}>
            {face(d)}
          </button>
        )
      ))}
    </div>
  );
}
