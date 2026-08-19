// ─── ProductShelf — das Regal, das die drei Tueren ersetzt ───────────────────
//
// Die Tueren zeigten drei gleich grosse Fotokacheln und *kein einziges*
// Produkt: wer auf „Produkte" klickte, sah eine zweite Auswahl statt einer
// Ware. Bei 14 Artikeln ist das eine Zwischenseite ohne Aufgabe — NN/G fasst
// Kategorie- und Listenseite fuer kleine Sortimente ausdruecklich zusammen,
// Unterkategorien oben, Produkte direkt darunter.
//
// Die Ordnung hier folgt dem Katalog, nicht der Symmetrie:
//
//   Wachs   4 SKUs = 2 Entscheidungen (Formel, dann Menge). Passt vollstaendig
//           auf den Schirm, also steht es dort — zwei Tafeln, Groesse als
//           Schalter darin. Kein Tab, keine Liste, kein Klick davor.
//   Set     kein eigener Eingang, sondern der naechste Schritt nach der
//           Wachsentscheidung.
//   Ketten  8 SKUs mit Kompatibilitaetsfilter — das passt nicht auf den Schirm
//           und behaelt deshalb seine Liste.
//   Rewax   Retention, dort platziert wo sie relevant wird: wer sich gerade
//           mit Wachs und Ketten beschaeftigt hat, ist genau die Person, die
//           das in vierhundert Kilometern braucht.
//
// Fruehere Fassung: jedes der vier Elemente in einem eigenen Layout — Wachs
// als Fotokachel mit eingeblendetem Text, Set als 16:9-Foto neben Text,
// Ketten als 3:2-Foto neben Text mit eigenen Filter-Chips, Rewax als
// ganzflaechiges dunkles Banner. Vier Bildseitenverhaeltnisse, vier
// Kartenformen, vier Abstandsrhythmen auf einem einzigen Bildschirm — genau
// das war Lucas Ruecklmeldung ("all over the place"), und es ist kein
// Geschmacksurteil: ein A/B-Test mit 25.000 Besuchern zeigte 17,1 % mehr
// Umsatz pro Besucher allein durch einheitliche statt gemischte Kartengroessen
// (siehe SecondaryTile-Kommentar unten fuer die Quelle).
//
// Jetzt zwei Ebenen, zwei Kartensprachen, nicht vier:
//   Ebene 1 (Wachs)              — 4:5 Hochformat, volle Kaufwerkzeuge darunter.
//   Ebene 2 (Set / Ketten / Rewax) — eine gemeinsame SecondaryTile-Komponente,
//           4:3 Querformat, gleiche Bildunterschrift-Grammatik wie Wachs, drei
//           gleich grosse Kacheln in einer Reihe statt drei verschiedener
//           Module untereinander.
//
// Behaelter nach DESIGN.md §3: ganzflaechiges Foto und Haarlinie. Keine
// gefuellten Kacheln mit Rahmen und Schatten.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { products, accessories, starterSetPrice, canCheckout } from '@/lib/data';
import type { TranslationType } from '@/lib/i18n';
import { AddToCartButton } from '@/components/AddToCartButton';
import { trackEbayClick } from '@/lib/analytics';
import { getEstimatedDelivery } from '@/lib/utils';

type Size = '300' | '500';
type Variant = 'classic' | 'pro';

const eur = (n: number, de: boolean) =>
  n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const waxOf = (variant: Variant, size: Size) =>
  products.find(p => p.category === 'wax' && p.variant === variant && p.weight === `${size}g`)!;

const minPrice = (category: 'wax' | 'chain') =>
  Math.min(...products.filter(p => p.category === category).map(p => p.price));

// Billigste echte Kombination durch dieselbe starterSetPrice(), die auch der
// Konfigurator nutzt — nie eine getippte Zahl, die davon abdriften kann.
const minSetPrice = starterSetPrice(
  minPrice('wax') + minPrice('chain') + accessories.reduce((sum, a) => sum + a.price, 0),
);

const HAIR = { borderTop: '1px solid var(--bd)' } as const;

// ── Eine Wachs-Tafel ────────────────────────────────────────────────────────
// Foto traegt den Namen, die Haarlinien darunter tragen die Zahlen. Der
// Groessenschalter tauscht das ganze Produkt aus (Preis, Grundpreis,
// Anwendungen, eBay-Link), damit aus vier Karten zwei Tafeln werden.
function WaxPanel({ variant, de, t, image, alt }: {
  variant: Variant;
  de: boolean;
  t: TranslationType;
  image: string;
  alt: string;
}) {
  const [size, setSize] = useState<Size>('500');
  const product = waxOf(variant, size);
  const s = t.products.shelf;

  const grams = parseInt(product.weight!);
  const per100 = eur(product.price / (grams / 100), de);

  const sizeBtn = (v: Size) => {
    const active = size === v;
    return (
      <button
        key={v}
        type="button"
        onClick={() => setSize(v)}
        aria-pressed={active}
        className={`num-data inline-flex items-center justify-center min-h-11 min-w-11 px-4 rounded-lg text-[12.5px] leading-none border transition-all ${
          active ? 'text-wx-tx1' : 'text-wx-txm hover:text-wx-tx2'
        }`}
        style={{
          borderColor: active ? 'var(--accent-soft)' : 'var(--bd)',
          background: active ? 'var(--accent-wash)' : 'transparent',
        }}
      >
        {v} g
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Foto — ganzflaechig, kein Rahmen. Der Name liegt im Bild, damit er
          nicht darunter ein zweites Mal als Ueberschrift auftaucht. */}
      <Link
        to={`/produkt/${product.id}`}
        className="group relative block overflow-hidden rounded-2xl aspect-[4/5]"
        style={{ background: 'var(--hero-stage)', willChange: 'transform' }}
      >
        <picture>
          <source srcSet={`${image}-800.webp 800w, ${image}.webp 1000w`} sizes="(max-width: 640px) 92vw, 46vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.42) 24%, rgba(0,0,0,0.06) 52%, rgba(0,0,0,0) 72%)' }}
        />
        <div className="absolute left-5 right-5 bottom-5">
          <h3
            className="font-display font-bold leading-[1.05] tracking-[-0.02em]"
            style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', textShadow: '0 1px 18px rgba(0,0,0,0.4)' }}
          >
            {variant === 'classic' ? s.classicName : s.proName}
          </h3>
          <p className="num-data text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.86)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            {variant === 'classic' ? s.classicFor : s.proFor}
          </p>
        </div>
      </Link>

      {/* Zahlen — Haarlinien statt Kartenfond. Wahl links, Folge rechts. */}
      <div className="mt-5 pt-4 flex items-end justify-between gap-4" style={HAIR}>
        <div className="flex gap-1.5">{(['300', '500'] as Size[]).map(sizeBtn)}</div>
        <div className="text-right">
          <span className="num text-[24px] font-bold leading-none tracking-[-0.02em]" style={{ color: 'var(--tx1)' }}>
            {eur(product.price, de)}
          </span>
          <p className="num-data text-meta mt-1" style={{ color: 'var(--txf)' }}>
            {per100} {s.per100}
          </p>
        </div>
      </div>

      <p className="num-data text-meta mt-3 pt-3" style={{ ...HAIR, color: 'var(--txm)' }}>
        {product.intervalDry} {s.dryInterval} · {product.applications} {s.uses} · {variant === 'classic' ? s.classicFormula : s.proFormula}
      </p>

      <div className="mt-4 flex items-center gap-4">
        {canCheckout(product) ? (
          <AddToCartButton product={product} />
        ) : (
          <button
            type="button"
            onClick={() => { trackEbayClick(product.id); window.open(product.ebayUrl, '_blank', 'noopener,noreferrer'); }}
            className="inline-flex items-center gap-1.5 min-h-11 px-5 rounded-full text-[13px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
          >
            {t.products.buyOnEbay}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
        <Link to={`/produkt/${product.id}`} className="inline-flex items-center min-h-11 px-1 text-[13px] transition-opacity hover:opacity-70" style={{ color: 'var(--txm)' }}>
          {s.details} →
        </Link>
      </div>
    </div>
  );
}

// ── Eine Sekundaer-Kachel ────────────────────────────────────────────────────
// Set, Ketten und Rewax teilen sich diese eine Komponente statt je eines
// eigenen Layouts. Gleiche Bildgrammatik wie WaxPanel (Foto traegt Kicker +
// Titel im Scrim), aber 4:3 statt 4:5 — die drei Quellfotos sind Querformate,
// und drei Kacheln nebeneinander brauchen ohnehin weniger Hoehe als zwei
// Kaufentscheidungen mit Groessenschalter und Preis darunter.
//
// `as`: Link fuer Set (echte Route) und Rewax (echte Route), button fuer
// Ketten (oeffnet nur einen Zustand auf derselben Seite — kein Seitenwechsel,
// also kein <a>/<Link>, sonst waere Rechtsklick/"in neuem Tab oeffnen" ein
// Versprechen, das die Seite nicht haelt).
// Exportiert: products.tsx braucht dieselbe Kachel fuer die Rewax-Karte am
// Ende der aufgeklappten Kettenliste — siehe dortiger Kommentar.
export function SecondaryTile({ image, imageW, eyebrow, title, body, cta, alt, dark, ...action }: {
  image: string; imageW: number; eyebrow: string; title: string; body: string; cta: string; alt: string;
  dark?: boolean;
} & ({ to: string } | { onClick: () => void })) {
  const inner = (
    <>
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3]" style={{ background: 'var(--hero-stage)' }}>
        <picture>
          <source srcSet={`${image}-800.webp 800w, ${image}.webp ${imageW}w`} sizes="(max-width: 640px) 92vw, 30vw" type="image/webp" />
          <img
            src={`${image}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </picture>
        <span aria-hidden className="absolute inset-0"
          style={{ background: dark
            ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.1) 62%, rgba(0,0,0,0) 78%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 32%, rgba(0,0,0,0) 62%)' }} />
        <div className="absolute left-4 right-4 bottom-4">
          <p className="text-meta font-semibold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {eyebrow}
          </p>
          <p className="font-display font-bold leading-[1.12] mt-1"
            style={{ color: '#fff', fontSize: 'clamp(1.05rem, 1.9vw, 1.3rem)', textShadow: '0 1px 14px rgba(0,0,0,0.35)' }}>
            {title}
          </p>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed mt-3" style={{ color: 'var(--txm)' }}>{body}</p>
      <span className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-semibold" style={{ color: 'var(--accent-soft)' }}>
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </span>
    </>
  );

  return 'to' in action ? (
    <Link to={action.to} className="group flex flex-col">{inner}</Link>
  ) : (
    <button type="button" onClick={action.onClick} className="group flex flex-col text-left">{inner}</button>
  );
}

export function ProductShelf({ de, t, onOpenChains, onCompare }: {
  de: boolean;
  t: TranslationType;
  /** Setzt den Schaltungsfilter und oeffnet die Kettenliste. */
  onOpenChains: (speed: 'all' | '11' | '12') => void;
  onCompare: () => void;
}) {
  const s = t.products.shelf;
  const delivery = getEstimatedDelivery(de ? 'de' : 'en');

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {/* ── Wachs ── */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-6">
          <p className="eyebrow">{s.waxEyebrow}</p>
          <p className="num-data text-meta" style={{ color: 'var(--txf)' }}>{delivery}</p>
        </div>

        <div className="grid gap-10 sm:gap-8 sm:grid-cols-2">
          <WaxPanel
            variant="classic"
            de={de}
            t={t}
            image="/images/shelf/wax-classic"
            alt={de ? 'Blauer Waxcelerate Classic Wachsblock auf Schiefer' : 'Blue Waxcelerate Classic wax block on slate'}
          />
          <WaxPanel
            variant="pro"
            de={de}
            t={t}
            image="/images/shelf/wax-pro"
            alt={de ? 'Schwarzer Waxcelerate Pro Wachsblock mit MoS₂ auf Schiefer' : 'Black Waxcelerate Pro wax block with MoS₂ on slate'}
          />
        </div>

        {/* War eine volle Balkenzeile mit eigenem Rahmen zwischen den Tafeln
            und dem Regal darunter — ein fuenftes Modul fuer einen einzigen
            Satz. Jetzt ein einfacher Text, zentriert, ohne eigene Flaeche. */}
        <button type="button" onClick={onCompare}
          className="block mx-auto mt-6 min-h-11 px-2 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--tx2)' }}>
          {t.products.decisionAid} <span style={{ color: 'var(--accent-soft)' }}>{t.products.compareBtn} →</span>
        </button>
      </div>

      {/* ── Set / Ketten / Rewax — eine Kachelsprache, eine Reihe ── */}
      <div className="grid gap-8 sm:gap-6 sm:grid-cols-3">
        <SecondaryTile
          to="/starter-set"
          image="/images/shelf/starter-box" imageW={1200}
          eyebrow={s.setEyebrow} title={s.setTitle}
          body={`${s.setBody} ${de ? 'Ab' : 'From'} ${eur(minSetPrice, de)}.`}
          cta={s.setCta}
          alt={de ? 'Offener Versandkarton mit Waxcelerate Wachsblöcken' : 'Open shipping box with Waxcelerate wax blocks'}
        />
        <SecondaryTile
          onClick={() => onOpenChains('all')}
          image="/images/shelf/chains-flat" imageW={1400}
          eyebrow={s.chainsEyebrow} title={s.chainsTitle}
          body={s.chainsBody}
          cta={s.chainsAll}
          alt={de ? 'Vorgewachste Fahrradketten mit Quick-Link auf Schiefer' : 'Pre-waxed bicycle chains with quick link on slate'}
        />
        <SecondaryTile
          to="/kette-wachsen-lassen"
          image="/images/blog/chains-hanging-gold" imageW={1600}
          eyebrow={s.rewaxEyebrow} title={s.rewaxTitle}
          body={s.rewaxBody}
          cta={s.rewaxCta}
          alt={de ? 'Frisch gewachste Ketten hängen zum Aushärten' : 'Freshly waxed chains hanging to cure'}
          dark
        />
      </div>
    </div>
  );
}
