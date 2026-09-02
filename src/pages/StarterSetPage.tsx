// ─── /starter-set — the set, and the two parts nobody thinks about ───────────
//
// The set exists because the first waxing is where people give up: they order
// wax, then discover they also need a way to open the chain and something to
// hang it on, and the evening ends with a chain in a pot and no hook.
//
// So the page is built around completeness rather than saving. The discount is
// shown as a derivation from real single prices, never as a headline number.
// A permanent percentage badge on a premium product reads as a price with a
// guilty conscience; the same ten percent, shown as arithmetic, reads as
// sensible bundling.
//
// Prices per Luca 2026-07-28: set is ten percent below the sum of its parts.
// Accessories sold separately: three hanging wires 5 € plus 1,80 € shipping,
// quick-link pliers 5 €.

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { BackLink } from '@/components/BackLink';
import { accessories, starterSet } from '@/lib/data';
import { StarterSetOptions } from '@/sections/StarterSetOptions';
import { removeStaticHeadMeta } from '@/lib/utils';

const W = 'mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-14';

const SHIPPING = 1.80;

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const accPriceOf = (id: string) => accessories.find(a => a.id === id)?.price ?? 0;

export function StarterSetPage() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const title = de
    ? 'Starter-Set Kettenwachs | Waxcelerate'
    : 'Chain wax starter set | Waxcelerate';
  const description = de
    ? `Wachs, vorgewachste Kette, Quick-Link-Zange und Aufhängedraht in einem Set, ${starterSet.discountPct} Prozent unter der Summe der Einzelteile. Alles, was für das erste Wachsen nötig ist.`
    : `Wax, pre-waxed chain, quick-link pliers and hanging wire in one set, ${starterSet.discountPct} percent below the sum of the parts. Everything the first waxing needs.`;

  // Die vorgerenderte Huelle (scripts/generate-blog-html.mjs, STATIC_PAGES)
  // setzt title/description/canonical bereits statisch, markiert mit
  // data-prerendered — ohne diesen Aufruf bleiben nach der Hydration zwei
  // Versionen jedes Tags im DOM (siehe removeStaticHeadMeta in src/lib/utils.ts).
  useEffect(() => { removeStaticHeadMeta(); }, []);

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/starter-set" />
      </Helmet>

      <Navigation />

      {/* ── Kit-Bild als Kopf, kein eigener Hero ──
          Vorher standen hier zwei Elemente untereinander: eine Ueberschrift in
          Hero-Groesse und darunter das Kit-Foto — zusammen rund ein
          Bildschirm, bevor die erste Karte sichtbar wurde. Die Ueberschrift
          allein sagt aber nichts, was das Foto nicht schon zeigt.
          Jetzt traegt das Foto die Ueberschrift (DESIGN.md §3, Behaelter 3:
          ganzflaechiges Foto mit Scrim von unten), und die Karten stehen
          direkt darunter. Ein H1 muss bleiben — fuer Suchmaschinen und die
          Ueberschriften-Struktur —, aber er kostet jetzt keine eigene
          Bildschirmhoehe mehr. */}
      <section className="relative pt-24 sm:pt-28 pb-8" style={{ background: 'var(--pg)' }}>
        <div className={W}>
          <BackLink de={de} className="mb-5 sm:mb-6" />
          {/* pdp-dark: Im Hellmodus zwingt eine globale Regel in index.css
              (`:root:not(.noir) h1 { color: var(--tx1) !important }`) jede
              Ueberschrift auf Fast-Schwarz — mit !important, also schlaegt sie
              auch ein inline gesetztes color:#fff. Auf einem dunklen Foto
              ergibt das eine praktisch unlesbare Ueberschrift. `.pdp-dark` ist
              die dafuer vorgesehene Ausnahme (direkt darunter in derselben
              Datei definiert) und faerbt Ueberschriften darin wieder weiss. */}
          {/* aspect-[4/3] sm:aspect-[21/9]: previously a fixed style aspectRatio
              21/9 plus minHeight:210 fought each other on narrow phones — at
              ~360px width, 21:9 computes to ~154px, so minHeight silently won
              and produced an unplanned ~360x210 (1.71) box that matched
              neither ratio, with object-cover then cropping the tall
              (1200x1500) source photo unpredictably depending on exact
              viewport width. A deliberate 4:3 mobile ratio gives the
              block/pliers/wire enough height to read clearly; the wide 21:9
              banner returns at sm: where there is width to spare. No
              minHeight needed once the ratio itself is viewport-aware. */}
          <div className="pdp-dark relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[21/9]"
            style={{ background: 'var(--hero-stage)' }}>
            <img src="/images/doors/starter-set.webp"
              srcSet="/images/doors/starter-set-800.webp 800w, /images/doors/starter-set.webp 1200w"
              sizes="(max-width: 1024px) 92vw, 1000px"
              alt={de ? 'Wachsblock mit Quick-Link-Zange und Kette' : 'Wax block with quick-link pliers and chain'}
              className="absolute inset-0 w-full h-full object-cover" />
            <div aria-hidden className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(var(--scrim-rgb),0.80) 0%, rgba(var(--scrim-rgb),0.34) 46%, rgba(var(--scrim-rgb),0.04) 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <h1 className="font-display font-bold leading-[1.05]"
                style={{ color: '#fff', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', letterSpacing: '-0.02em' }}>
                {de ? 'Alles da, beim ersten Mal.' : 'Everything there, first time.'}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cards — wax + chain + tools, one click. Everything the page
          needs to say is on the cards themselves now. */}
      <section id="sets" className="pb-14 sm:pb-20">
        <div className={W}>
          <StarterSetOptions de={de} />
        </div>
      </section>

      {/* ── Zubehoer einzeln ──
          Von zwei gepolsterten Karten mit je einem Absatz auf zwei
          Haarlinien-Zeilen heruntergezogen. Wer hier unten ankommt, wachst
          schon und sucht Nachschub — der braucht Name, Preis und einen
          Halbsatz, keine Produktbeschreibung. Haarlinie statt Kachel ist
          ausserdem der Standardbehaelter nach DESIGN.md §3. */}
      <section className="py-12 sm:py-16" style={{ borderTop: '1px solid var(--bd2)' }}>
        <div className={W}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Einzeln' : 'Separately'}
          </p>
          <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-6"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Nur das fehlende Teil.' : 'Just the missing piece.'}
          </h2>

          <div style={{ borderTop: '1px solid var(--bd2)' }}>
            {[
              {
                key: 'wire',
                slug: 'aufhaengedraht',
                nameDe: 'Aufhängedraht, 3 Stück', nameEn: 'Hanging wire, 3 pieces',
                price: accPriceOf('acc-wire'),
                bodyDe: 'Steif genug, dass die Kette im Bad nicht kippt.',
                bodyEn: 'Stiff enough that the chain does not tip in the bath.',
                shipping: true,
              },
              {
                key: 'pliers',
                slug: 'quick-link-zange',
                nameDe: 'Quick-Link-Zange', nameEn: 'Quick-link pliers',
                price: accPriceOf('acc-pliers'),
                bodyDe: 'Öffnet und schließt den Verschluss.',
                bodyEn: 'Opens and closes the link.',
                shipping: false,
              },
              {
                key: 'rewax',
                href: '/kette-wachsen-lassen',
                nameDe: 'Kette wachsen lassen', nameEn: 'Get your chain rewaxed',
                price: 13.95,
                bodyDe: 'Kein Bock aufs Selberwachsen? Wir übernehmen das, ab 9,95 € pro Kette.',
                bodyEn: 'Would rather not do it yourself? We take care of it, from 9.95 € per chain.',
                shipping: false,
              },
            ].map(a => (
              <Link key={a.key} to={a.href ?? `/zubehoer/${a.slug}`}
                className="flex items-baseline justify-between gap-5 py-4 transition-opacity hover:opacity-80"
                style={{ borderBottom: '1px solid var(--bd2)' }}>
                <div className="min-w-0">
                  <p className="text-[15px] text-wx-tx1 underline decoration-transparent hover:decoration-inherit">{de ? a.nameDe : a.nameEn}</p>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--txm)' }}>
                    {de ? a.bodyDe : a.bodyEn}
                    {a.shipping && (
                      <span style={{ color: 'var(--txff)' }}>
                        {de ? ` · zuzüglich ${eur(SHIPPING, de)} Versand` : ` · plus ${eur(SHIPPING, de)} shipping`}
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-display font-bold text-wx-tx1 flex-shrink-0" style={{ fontSize: '1.3rem' }}>
                  {eur(a.price, de)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>

      <Footer />
    </div>
  );
}
