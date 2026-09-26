// ─── ProductDoors — drei Türen auf der Startseite ──────────────────────────
//
// Seitenordnung 09/2026, Chat 2: ersetzt das Regal (ProductShelf) auf der
// Startseite. Grund siehe SEITENORDNUNG_PLAN.md "Warum Tür 1 eine eigene
// Seite wird" — drei gleich große Bildkarten, jede führt auf eine eigene
// Seite (Tür 2/3 taten das schon, Tür 1 zieht mit /kettenwachs nach). Das
// volle Regal (Wachs-Tafeln mit Größenschalter, Preisen, Staffel) lebt jetzt
// auf /kettenwachs, nicht mehr hier — bei 14 SKUs auf einen Blick ist die
// Startseite sonst wieder die "zu chaotische Liste", die Luca bemängelt hat.
//
// Hover-Zoom 1.03, kein Autoplay — "wenig Bewegung" (Gemeinsame Regeln).

import { Link } from 'react-router-dom';
import { ArrowRight, RotateCw, BadgePercent } from 'lucide-react';
import { products, WAX_TIERS, CHAIN_TIERS } from '@/lib/data';
import { CardPerks } from '@/components/CardPerks';
import { TURNAROUND, PRICE } from '@/pages/rewax/content';
import type { TranslationType } from '@/lib/i18n';

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const minPrice = (category: 'wax' | 'chain') =>
  Math.min(...products.filter(p => p.category === category).map(p => p.price));

function Door({ to, image, alt, title, body, price, delivery, compact, perks }: {
  to: string; image: string; alt: string; title: string; body: string; price: string; delivery: string;
  compact?: boolean;
  /** Versand/Lieferdatum/Staffel als CardPerks-Block (26.09.2026). Ersetzt
      dann die graue Lieferzeile unter dem Preis. Rewax hat keinen. */
  perks?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      viewTransition
      className={`door-card shelf-card group relative block overflow-hidden rounded-[20px] ${compact ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}
      style={{ background: 'var(--hero-stage)' }}
      aria-label={`${title} — ${price}`}
    >
      <picture>
        <source srcSet={`${image}-800.avif 800w, ${image}.avif 1000w`} sizes="(max-width: 640px) 92vw, 30vw" type="image/avif" />
        <source srcSet={`${image}-800.webp 800w, ${image}.webp 1000w`} sizes="(max-width: 640px) 92vw, 30vw" type="image/webp" />
        <img
          src={`${image}.webp`}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
        />
      </picture>
      <span aria-hidden className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(6,7,10,0.9) 0%, rgba(6,7,10,0.55) 45%, rgba(6,7,10,0.02) 78%)' }} />

      {/* Feste Zeilen, damit die Titel aller drei Tueren auf einer Hoehe
          stehen (Luca, 25.09.2026): der Block haengt unten, also schob ein
          zweizeiliger Text den Titel seiner Karte nach oben. Jetzt reserviert
          der Text immer zwei Zeilen, und der Titel reserviert zwei Zeilen nur
          dort, wo er umbrechen kann (schmale 3er-Reihe unter lg); ab lg
          steht er einzeilig. */}
      <span className={`absolute inset-x-0 bottom-0 flex flex-col gap-1.5 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
        <span className={`font-display font-bold text-white leading-tight tracking-[-0.01em] ${compact ? '' : 'flex items-end sm:min-h-[2.5em] lg:min-h-0 lg:whitespace-nowrap'}`}
          style={{ fontSize: compact ? 'clamp(1rem, 1.6vw, 1.15rem)' : 'clamp(1.15rem, 2vw, 1.4rem)' }}>
          {title}
        </span>
        {!compact && <span className="text-[15px] leading-snug line-clamp-2 min-h-[2.75em]" style={{ color: 'rgba(255,255,255,0.9)' }}>{body}</span>}
        <span className="flex items-center justify-between gap-2 mt-2">
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="num text-[17px] font-bold" style={{ color: '#fff' }}>{price}</span>
            {!compact && !perks && <span className="text-[13px] truncate" style={{ color: 'rgba(255,255,255,0.78)' }}>{delivery}</span>}
          </span>
          <span
            aria-hidden
            className="flex items-center justify-center h-9 w-9 rounded-full flex-shrink-0 transition-all duration-300 group-hover:translate-x-0.5"
            style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.28)' }}
          >
            <ArrowRight className="h-4 w-4" style={{ color: '#fff' }} />
          </span>
        </span>
        {!compact && perks}
      </span>
    </Link>
  );
}

type DoorKey = 'wax' | 'chains' | 'rewax';

// `only`: /kettenwachs zeigt im Abschnitt "Lieber anders?" dieselben Tueren
// in kleiner Form, aber ohne die eigene (Seitenordnung Chat 2) — Standard
// bleibt alle drei fuer die Startseite.
export function ProductDoors({ de, t, delivery, only, compact }: {
  de: boolean; t: TranslationType; delivery: string; only?: DoorKey[]; compact?: boolean;
}) {
  const d = t.products.doors;
  const priceFor = (n: number) => d.priceFrom.replace('{price}', eur(n, de));
  const shippingLine = t.products.shelf.delivery + ' ' + delivery;
  const rewaxDelivery = de
    ? `${TURNAROUND.short} ab Ankunft`
    : `${TURNAROUND.shortEn} after arrival`;
  const show = (k: DoorKey) => !only || only.includes(k);

  // Statische Klassennamen (kein Template-String) — Tailwinds JIT-Scanner
  // findet nur woertlich im Quelltext stehende Klassen.
  const gridColsClass = (only?.length ?? 3) === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

  return (
    <div className={`grid gap-5 sm:gap-6 ${gridColsClass}`}>
      {show('wax') && (
        <Door
          compact={compact}
          to="/kettenwachs"
          image="/images/shelf/wax-classic"
          alt={de ? 'Waxcelerate Kettenwachs-Block auf Schiefer' : 'Waxcelerate chain wax block on slate'}
          title={d.waxTitle}
          body={d.waxBody}
          price={priceFor(minPrice('wax'))}
          delivery={shippingLine}
          perks={<CardPerks onDark t={t} delivery={delivery} tiers={WAX_TIERS} />}
        />
      )}
      {show('chains') && (
        <Door
          compact={compact}
          to="/ketten"
          image="/images/shelf/shelf-ketten"
          alt={de ? 'Vorgewachste Fahrradkette mit Quick-Link auf Schiefer' : 'Pre-waxed bicycle chain with quick link on slate'}
          title={d.chainsTitle}
          body={d.chainsBody}
          price={priceFor(minPrice('chain'))}
          delivery={shippingLine}
          perks={<CardPerks onDark t={t} delivery={delivery} tiers={CHAIN_TIERS} />}
        />
      )}
      {show('rewax') && (
        <Door
          compact={compact}
          to="/kette-wachsen-lassen"
          image="/images/shelf/shelf-rewax"
          alt={de ? 'Waxcelerate Versandkarton mit gewachster Kette vor Stuttgarter Landschaft' : 'Waxcelerate shipping box with a waxed chain in front of the Stuttgart hills'}
          title={d.rewaxTitle}
          body={d.rewaxBody}
          price={d.rewaxPrice}
          delivery={rewaxDelivery}
          perks={
            // Dieselbe Form wie CardPerks, damit die Titel aller drei Tueren
            // auf einer Hoehe bleiben: Turnaround statt Lieferdatum,
            // Mengenpreis statt Staffel (beides aus rewax/content.ts).
            <div className="card-perks card-perks--dark">
              <p className="card-perks__row">
                <RotateCw className="card-perks__ico" aria-hidden />
                <span><strong className="card-perks__date">{rewaxDelivery}</strong></span>
              </p>
              <p className="card-perks__row">
                <BadgePercent className="card-perks__ico" aria-hidden />
                <span>{d.rewaxBundle.replace('{count}', String(PRICE.bundleCount)).replace('{price}', eur(PRICE.rewax.bundle, de))}</span>
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}
