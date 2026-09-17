import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BadgeCheck, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Stars } from '@/components/Stars';
import { Section } from '@/components/Section';
import { trustStats, CONTACT } from '@/lib/data';
import { trackShopClick } from '@/lib/analytics';

// ── Data ─────────────────────────────────────────────────────────────────────
// Every entry is a REAL review (eBay feedback + verified-buyer reviews).
// Nothing here is invented — that is the whole point of this section. An
// earlier revision of this file carried extra "community" cards whose own
// comment admitted the text was only "sinngemäß" (paraphrased); those are
// deliberately not here. If more reviews are added, they come from actual
// eBay feedback, not from filling the row out.
export type Review = {
  id: string;                      // stabiler Schluessel fuer Seiten, die ein bestimmtes Zitat zeigen
  textDe: string; textEn: string;
  name: string;                    // so maskiert, wie eBay ihn oeffentlich zeigt (Luca, 16.09.2026)
  dateDe: string; dateEn: string;  // eBay-Zeitraum, wie im Profil angezeigt
  rating?: number;                 // default 5
  source?: 'ebay';                 // verified badge label
  productDe?: string; productEn?: string;
  productIds?: string[];           // real product/bundle ids this review is genuinely about
  fallback?: boolean;              // may stand in on a product page with no tagged review
  chainGeneral?: boolean;          // about a waxed chain, model unknown: may stand in on any chain page
};

// ── Nur echte eBay-Bewertungen (16.09.2026) ─────────────────────────────────
// Jeder Text steht wortgleich im oeffentlichen Profil
// ebay.de/fdbk/feedback_profile/waxcelerate; Tippfehler bleiben stehen,
// gekuerzt wird nur mit "…". Namen und Zeitraeume genau so, wie eBay sie
// oeffentlich zeigt. Die frueheren "Web"-Bewertungen (Maximilian M.,
// Philippe V., Michael W.) sowie tom_rennrad und m.gerber waren nicht echt und
// sind entfernt (Luca). Fotos haengen NICHT an Personen, siehe REVIEW_PHOTOS.
const LAST_MONTH = { dateDe: 'letzter Monat', dateEn: 'last month' };
const HALF_YEAR = { dateDe: 'letzte 6 Monate', dateEn: 'past 6 months' };
const LAST_YEAR = { dateDe: 'letztes Jahr', dateEn: 'last year' };
const OVER_YEAR = { dateDe: 'vor über einem Jahr', dateEn: 'over a year ago' };
const M8100 = { productDe: 'Gewachste Kette · Shimano CN-M8100', productEn: 'Waxed chain · Shimano CN-M8100', productIds: ['chain-m8100'] };
const WAX500 = { productDe: 'Kettenwachs 500 g', productEn: 'Chain wax 500 g', productIds: ['wax-500'] };

export const REVIEWS: Review[] = [
  {
    id: 'm8100-selbstwachser',
    textDe: 'Großes Lob an den Verkäufer, die Kette wurde schnell und ordnungsgemäß geliefert… Die Kette ist einwandfrei gewachst und ich werde die nächste Kette wieder bei ihm bestellen. Ich fahre schon viele Jahre jetzt mit gewachster Kette, seither hab ich das wachsen immer selbst gemacht. Ich wollte mir einfach die Arbeit sparen, da das mit dem Ölfrei machen der Kette ziemlich zeitaufwändig ist. Ich bin sehr zufrieden, kann den Verkäufer nur weiterempfehlen',
    textEn: "Big praise for the seller, the chain arrived quickly and properly… It's impeccably waxed and I'll order my next chain from him again. I've ridden waxed chains for many years and always did the waxing myself. I just wanted to save the effort, since getting the chain oil-free is quite time-consuming. Very satisfied, can only recommend the seller.",
    name: 'j***k', ...LAST_MONTH, source: 'ebay', fallback: true, ...M8100,
  },
  {
    id: 'm9100-beste-ketten',
    textDe: 'Ich habe schon mehrere unterschiedliche vorgewachste Ketten von verschiedenen Anbietern ausprobiert. Luca bietet hier mit Waxcelerate meiner Meinung nach die besten Ketten an, die man so kriegen kann. Der Preis stimmt auch. 👍',
    textEn: "I've already tried several different pre-waxed chains from various sellers. In my opinion Luca and Waxcelerate offer the best chains you can get. The price is right, too. 👍",
    name: 't***t', ...LAST_MONTH, source: 'ebay', fallback: true,
    productDe: 'Gewachste Kette · Shimano CN-M9100', productEn: 'Waxed chain · Shimano CN-M9100', productIds: ['chain-m9100'],
  },
  {
    id: 'wax500-gutschein',
    textDe: "Top Ware einfach und gut portioniert Lieferzeit sehr schnell vom Verkäufer . Es wurde am gleichen Tag noch versendet aber leider hat die Post einfach länger gebraucht (Verkäufer trifft keine Schuld) Habe dann mal den Verkäufer angeschrieben und auch sehr schnell eine freundliche Antwort bekommen. Als Entschuldigung gab's einen großzügigen Gutschein obwohl die Schuld nicht beim Verkäufer lag das fand ich sehr aufmerksam und werde aufjedenfall wieder bestellen bzw. Kann es weiterempfehlen",
    textEn: "Great product, simple and well portioned, very fast dispatch. It was sent the same day, but the post just took longer (not the seller's fault). I messaged the seller and got a quick, friendly reply. As an apology there was a generous voucher, even though it wasn't the seller's fault. I found that very considerate and will definitely order again and can recommend it.",
    name: 't***h', ...OVER_YEAR, source: 'ebay', ...WAX500,
  },
  {
    id: 'm8100-einwandfrei',
    textDe: 'Schnelle Lieferung, einwandfrei gewachste Kette die sehr gut läuft, gerne wieder',
    textEn: 'Fast delivery, impeccably waxed chain that runs very well, would buy again.',
    name: 'e***n', ...LAST_YEAR, source: 'ebay', ...M8100,
  },
  {
    id: 'wax500-haerter',
    textDe: 'Macht auf mich den Eindruck von eingeschmolzen Kerzen, aber die Kette läuft bis jetzt ganz gut. Auf jeden Fall ist das Wachs härter als mein letztes.',
    textEn: 'Looks a bit like melted-down candles to me, but the chain runs quite well so far. The wax is definitely harder than my last one.',
    name: '2***l', ...LAST_YEAR, source: 'ebay', ...WAX500,
  },
  {
    id: 'm7100-beratung',
    textDe: 'Alles bestens 1a, Sehr netter Kontakt mit ne sehr ausführliche beraten bei Fragen. Immer wieder gern',
    textEn: 'All perfect, top marks. Very friendly contact and very thorough advice with questions. Happy to buy again anytime.',
    name: 'i***4', ...HALF_YEAR, source: 'ebay',
    productDe: 'Gewachste Kette · Shimano CN-M7100', productEn: 'Waxed chain · Shimano CN-M7100', productIds: ['chain-m7100'],
  },
  {
    id: 'wax500-200km',
    textDe: 'Tolles Kettenwachs, nach 200 km noch alles perfekt.',
    textEn: 'Great chain wax, everything still perfect after 200 km.',
    name: 'u***r', ...LAST_YEAR, source: 'ebay', ...WAX500,
  },
  {
    id: 'm8100-zuvorkommend',
    textDe: 'Sehr zuvorkommend, kontaktfreidiger Verkäufer, hier hat alles gestimmt.',
    textEn: 'Very obliging, communicative seller, everything was right here.',
    name: 'r***e', ...LAST_YEAR, source: 'ebay', ...M8100,
  },
  {
    id: 'wax500-plus',
    textDe: 'Positiver als positiv kann leider niemand bewerten - Wäre aber hier angebracht 1+ mit *',
    textEn: "Nobody can rate more positive than positive, but this would deserve a 1+ with a star.",
    name: 'v***v', ...LAST_YEAR, source: 'ebay', ...WAX500,
  },
  {
    id: 'ybn11-klasse',
    textDe: 'Klasse gelaufen gerne wieder 😀👍',
    textEn: 'Went great, happy to buy again 😀👍',
    name: '8***n', ...HALF_YEAR, source: 'ebay',
    productDe: 'Gewachste Kette · YBN 11S', productEn: 'Waxed chain · YBN 11S', productIds: ['chain-ybn11'],
  },
  {
    id: 'wax500-wie-gewachst',
    textDe: 'Alles bestens, läuft wie gewachst !!',
    textEn: 'All good, runs like it’s waxed !!',
    name: 'i***n', ...OVER_YEAR, source: 'ebay', ...WAX500,
  },
  {
    id: 'wax300-super',
    textDe: 'Super Produkt, gerne wieder.',
    textEn: 'Great product, would buy again.',
    name: '9***2', ...HALF_YEAR, source: 'ebay',
    productDe: 'Kettenwachs 300 g', productEn: 'Chain wax 300 g', productIds: ['wax-300'],
  },
];

export const reviewById = (id: string) => REVIEWS.find(r => r.id === id);

// ── Fotos zu den Bewertungen ────────────────────────────────────────────────
// Eigene Bilder (Luca, Freunde, Kunden mit Freigabe): gewachste Antriebe am
// Rad. Sie stehen NEBEN den Zitaten, nicht fuer die Person — deshalb traegt
// jedes Bild sichtbar "Foto: Waxcelerate" (klein, weiss, unten im Bild) und
// einen neutralen Alt-Text (Luca, 16.09.2026).
export const REVIEW_PHOTOS: { src: string; pos?: string }[] = [
  { src: '/images/reviews/ride-1-card.jpg' },
  { src: '/images/reviews/ride-3-card.jpg' },
  { src: '/images/reviews/ride-5-card.jpg' },
  { src: '/images/reviews/ride-2-card.jpg' },
  { src: '/images/reviews/ride-4-card.jpg' },
];
export const photoCredit = (de: boolean) => (de ? 'Foto: Waxcelerate' : 'Photo: Waxcelerate');
export const photoAlt = (de: boolean) => (de ? 'Rad mit gewachstem Antrieb' : 'Bike with a waxed drivetrain');

// Picks 1-2 real reviews for a product detail page. Tagged reviews win: the
// Starter-Kit bundles and, since 08/2026, the Shimano chains (chain-m7100/
// m8100/m9100) and the 500 g wax each carry a genuine eBay review. Everything
// else has no reliable per-SKU review, so it falls back to the entries
// explicitly marked `fallback: true` — t***t and j***k, the two most
// substantive quotes from riders who already knew waxed chains. Decoupled
// from array order on purpose.
// Never claim a fallback quote is "about" the exact product it's shown on —
// see the neutral heading used wherever this is called.
const GENERIC_FALLBACK_COUNT = 2;
const genericReviews = REVIEWS.filter(r => r.fallback);

export function reviewsForProduct(productId: string): Review[] {
  const tagged = REVIEWS.filter(r => r.productIds?.includes(productId));
  return tagged.length > 0 ? tagged : genericReviews.slice(0, GENERIC_FALLBACK_COUNT);
}

// Textspaltenbreite folgt der Zitatlaenge. Ein Einzeiler in einer 460er Karte
// ist ueberwiegend Leerflaeche, ein langes Zitat in einer 300er Karte eine
// Wand. Nach der Textlaenge zu bemessen haelt alle Karten auf ungefaehr
// derselben HOEHE — das ist in einer einzelnen Reihe das, was zaehlt — und die
// unterschiedlichen Breiten geben der Reihe Rhythmus statt Metronom.
function textColWidth(len: number) {
  if (len > 260) return 460;
  if (len > 140) return 380;
  if (len > 60) return 300;
  return 220;
}

// Das Foto steht als schmaler Streifen an der linken Kante der Karte, ueber die
// volle Kartenhoehe.
//
// Zwei Vorgaengerversionen sind an derselben Stelle gescheitert. Als 38-Pixel-
// Avatar neben dem Namen war nicht zu erkennen, dass es echte Fotos sind;
// als 16:9-Band oben in der Karte war es zwar gross genug, machte aber genau
// die Karten mit Foto rund 120 Pixel hoeher als die ohne. In einer Reihe, in
// der nur ein Teil der Karten ein Foto hat, ergibt das den ausgefransten,
// unruhigen Eindruck, den Luca beschrieben hat — und zieht die ganze Sektion
// unnoetig in die Hoehe.
//
// Als linker Streifen traegt das Foto die volle Hoehe der Karte, egal wie hoch
// die ist: Karten mit und ohne Foto sind gleich hoch, das Bild ist gross genug,
// um als echtes Rad lesbar zu sein (Stimmungsbild, nicht das Rad der
// zitierten Person — Alt-Text behauptet das bewusst nicht), und der Text liegt weiter auf der
// Kartenflaeche statt auf dem Bild — die Lesbarkeit haengt also nicht davon ab,
// wie hell das jeweilige Motiv ist.
//
// Die Bilder werden von scripts/build-review-images.mjs einmal bikezentriert
// auf 4:5 Hochformat geschnitten und klein gerechnet (ride-*-card.webp/.jpg).
// Deshalb reicht der Streifen schmal und object-position bleibt fast immer in
// der Mitte — object-cover greift nur noch minimal in ein bereits passendes
// Bild ein, statt gegen ein 1400er Querformat zu kaempfen.
//
// Karten ohne Foto bekommen kein Platzhalterbild. Eine Reihe, in der manche
// Karten ein Bild haben und manche nicht, liest sich als echte Sammlung.
function ReviewCard({ r, de, photo }: { r: Review; de: boolean; photo?: { src: string; pos?: string } }) {
  const text = de ? r.textDe : r.textEn;
  const date = de ? r.dateDe : r.dateEn;
  const product = de ? r.productDe : r.productEn;
  const verified = de ? 'eBay verifiziert' : 'eBay verified';
  const [photoOk, setPhotoOk] = useState(true);
  const showPhoto = Boolean(photo) && photoOk;
  // 116 statt 100: die Bilder sind jetzt vorgeschnittenes 4:5-Hochformat, ein
  // paar Pixel mehr Streifenbreite zeigen Rahmen und Antrieb klarer, ohne der
  // Textspalte auf dem Handy (Karte gegen calc(100vw - 72px) gedeckelt)
  // spürbar Platz zu nehmen.
  const PHOTO_W = 112;
  const photoWebp = photo?.src.replace(/\.jpg$/, '.webp');

  // Ganze Karte klickbar zum eBay-Feedback-Profil statt reiner Deko
  // (Seitenordnung Chat 2). <figure> bleibt der aussenliegende Flex-Item
  // fuer Groesse/Abstand in der Laufschrift, <a> darin ist die eigentliche
  // Klickflaeche — so bleiben figure/figcaption semantisch korrekt.
  return (
    <figure
      className="review-card flex-shrink-0 mr-4 whitespace-normal"
      style={{
        // Gegen den Viewport gedeckelt, damit eine Karte mit langem Zitat auf
        // dem Handy nie breiter als der Bildschirm wird — dort waere sie im
        // Vorbeilaufen nicht vollstaendig lesbar.
        width: `min(${textColWidth(text.length) + (showPhoto ? PHOTO_W : 0)}px, calc(100vw - 72px))`,
      }}
    >
      <a
        href={CONTACT.ebayFeedback}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={de ? 'Bewertung auf eBay ansehen' : 'View review on eBay'}
        className="group flex items-stretch h-full rounded-2xl overflow-hidden"
        style={{
          // Kartensprache der Seite (--card-*), nicht mehr die flache --sf2-
          // Fläche: leichter Verlauf, weiche Kante, ein Hauch Schatten. Die Reihe
          // liest sich damit als Sammlung erhabener Karten statt als Tabelle.
          background: 'var(--card-bg)',
          border: '1px solid var(--bd2)',
          boxShadow: 'var(--card-shad)',
        }}
      >
      {showPhoto && photo && (
        <picture
          className="relative flex-shrink-0 self-stretch flex"
          style={{
            width: PHOTO_W,
            background: 'var(--sf3)',
            // Foto sitzt in der Karte, nicht davor: Haarlinie plus ein nach
            // innen auslaufender Schatten an der rechten Kante.
            borderRight: '1px solid var(--bd2)',
            boxShadow: 'inset -12px 0 16px -12px rgba(0,0,0,0.28)',
          }}
        >
          <source srcSet={photoWebp} type="image/webp" />
          <img src={photo.src} alt={photoAlt(de)}
            loading="lazy" decoding="async"
            onError={() => setPhotoOk(false)}
            className="w-full object-cover"
            style={{ objectPosition: photo.pos ?? '50% 50%' }} />
          {/* Herkunft dezent im Bild: das Foto ist unseres, nicht das Rad
              der zitierten Person. */}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 px-2 pt-6 pb-1.5 text-[10px] font-medium leading-none pointer-events-none"
            style={{ color: 'rgba(255,255,255,.82)', background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.55))', letterSpacing: '.01em' }}>
            {photoCredit(de)}
          </span>
        </picture>
      )}

      <div className="relative flex flex-col flex-1 min-w-0 px-4 py-4">
        {/* Redaktionelles Anführungszeichen — faint, oben links als Eckzier,
            gibt der Karte den Zeitschriften-Charakter ohne Platz zu kosten. */}
        <span aria-hidden="true" className="absolute font-display leading-none select-none pointer-events-none"
          style={{ top: 4, left: 8, fontSize: 46, color: 'color-mix(in oklab, var(--tx1) 10%, transparent)' }}>
          &ldquo;
        </span>

        <div className="relative flex items-center justify-between gap-2 mb-2">
          <Stars rating={r.rating ?? 5} />
          <span className="flex items-center gap-1 text-meta whitespace-nowrap" style={{ color: 'var(--txf)' }}>
            {date}
            <ArrowUpRight aria-hidden className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
          </span>
        </div>

        <blockquote className="relative text-[13px] leading-[1.62] flex-1" style={{ color: 'var(--tx2)' }}>
          „{text}“
        </blockquote>

        {/* Signatur zweizeilig: Name kräftig, darunter leise Verifizierung +
            Produkt. Liest sich als Unterschrift, nicht als umbrechende Zeile. */}
        <figcaption className="relative mt-3.5">
          <div className="text-[12.5px] font-semibold" style={{ color: 'var(--tx1)' }}>{r.name}</div>
          <div className="flex items-center gap-x-1.5 gap-y-0.5 mt-1 flex-wrap text-meta">
            <span className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--accent-soft)' }}>
              <BadgeCheck className="h-3.5 w-3.5" /> {verified}
            </span>
            {product && (
              <span className="font-medium" style={{ color: 'var(--txf)' }}>· {product}</span>
            )}
          </div>
        </figcaption>
      </div>
      </a>
    </figure>
  );
}

export function Reviews() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [reduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Pause the animation while the section is off-screen — no reason to
  // composite a 7000px-wide track nobody can see.
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Sichtbarer Pause-Knopf (WCAG 2.2.2) — zusaetzlich zur Hover-/Fokus-Pause
  // aus index.css, die weiter unveraendert greift.
  const [userPaused, setUserPaused] = useState(false);

  // Tempo in px/s statt fester Sekunden: die Dauer ergibt sich aus der
  // halben Spurbreite (ein Kartensatz, die Spur enthaelt ihn doppelt fuer
  // den nahtlosen Loop) geteilt durch 18 px/s (Seitenordnung Chat 2 —
  // vorher lief die feste 96s-Dauer je nach Kartenzahl 3-4× so schnell).
  const trackRef = useRef<HTMLDivElement>(null);
  const [durationS, setDurationS] = useState(96);
  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const halfWidth = entry.target.scrollWidth / 2;
      if (halfWidth > 0) setDurationS(halfWidth / 18);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Jede zweite Karte bekommt ein eigenes Foto (reihum aus REVIEW_PHOTOS),
  // die Reihe wechselt so zwischen Bild- und Textkarten.
  const cards = REVIEWS.map((r, i) => (
    <ReviewCard key={r.id} r={r} de={de}
      photo={i % 2 === 0 ? REVIEW_PHOTOS[(i / 2) % REVIEW_PHOTOS.length] : undefined} />
  ));

  return (
    <Section id="bewertungen" ref={sectionRef} className="overflow-hidden" style={{ background: 'var(--pg)' }}>
      {/* ── Header ──
          Die drei Zahlen standen frueher in einem eigenen Band UNTER der
          Kartenreihe, zusammen mit den beiden Knoepfen. Das war ein zweiter
          horizontaler Streifen fuer eine Aussage, die in die Kopfzeile gehoert:
          Wie viele Bewertungen es gibt, entscheidet, ob man die Zitate
          ueberhaupt ernst nimmt — das muss man VOR den Karten wissen, nicht
          danach. Hier oben ersetzen sie ausserdem den Fliesstext, der genau
          dieselben Zahlen noch einmal ausgeschrieben hat. Unter der Reihe
          bleiben nur die beiden Knoepfe stehen. */}
      <div className="mb-7">
        <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
          {de ? 'eBay verifiziert' : 'eBay verified'}
          <span className="hidden sm:inline">{de ? ' · alle Bewertungen echt' : ' · all reviews genuine'}</span>
        </p>
        <h2 className="section-title mb-4">{de ? 'Was Fahrer berichten.' : 'What riders report.'}</h2>
        <div className="flex flex-wrap items-baseline gap-x-6 sm:gap-x-8 gap-y-2">
          {[
            { v: trustStats.reviews, l: de ? 'Bewertungen seit 2024' : 'reviews since 2024' },
            { v: String(trustStats.sold), l: de ? 'verkauft' : 'sold' },
            { v: String(trustStats.negative), l: de ? 'negativ' : 'negative' },
          ].map((s, i) => (
            <span key={i}
              className={`inline-flex items-baseline gap-2 ${i > 0 ? 'sm:border-l sm:pl-6 lg:pl-8' : ''}`}
              style={i > 0 ? { borderColor: 'var(--bd)' } : undefined}>
              <span className="font-display font-bold tabular-nums leading-none"
                style={{ fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>{s.v}</span>
              <span className="text-[13px]" style={{ color: 'var(--txm)' }}>{s.l}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── The row ──
          Full-bleed out of the Section's padded column so cards run to the
          viewport edges and the fade reads as "more beyond", not as a box that
          happens to end. Reduced motion gets the same row as a plain
          swipe/scroll container with no animation at all. */}
      <div className="relative -mx-6 sm:-mx-10 lg:-mx-14 xl:-mx-20">
        {/* Mobile — static, swipeable row, same as prefers-reduced-motion.
            A moving marquee fighting the visitor's own scroll is the kind of
            motion that reads as chaos rather than proof on a small screen,
            and unlike desktop there is no way to pause and actually read a
            card mid-scroll.
            Kein edge-fade hier: die statische Reihe braucht kein "da ist noch
            mehr"-Signal (die halb sichtbare Nachbarkarte macht das schon), und
            der voll deckende Rand des Overlays malte auf dem Handy einen
            weißen Streifen über das erste — dunkle — Foto. */}
        {/* Mobile-Plan B7g: eine overflow-x-auto <div> ohne tabIndex ist per
            Maus/Touch wischbar, aber ohne implizites tabindex nie ein
            Tab-Stopp — Tastaturnutzer sprangen direkt von der Ueberschrift
            zum "Alle Bewertungen"-Link darunter und konnten die Karten nie
            per Pfeiltasten durchscrollen. tabIndex={0} macht den Container
            fokussierbar, role="region" + aria-label geben ihm einen Namen,
            den ein Screenreader beim Betreten ansagt. */}
        <div className="sm:hidden flex overflow-x-auto px-6 pb-2" style={{ scrollbarWidth: 'none' }}
          tabIndex={0} role="region" aria-label={de ? 'Kundenbewertungen' : 'Customer reviews'}>
          {cards}
        </div>
        <div className="hidden sm:block">
          {reduced ? (
            <div className="flex overflow-x-auto edge-fade px-10 lg:px-14 xl:px-20 pb-2" style={{ scrollbarWidth: 'none' }}
              tabIndex={0} role="region" aria-label={de ? 'Kundenbewertungen' : 'Customer reviews'}>
              {cards}
            </div>
          ) : (
            <div className="marquee overflow-hidden edge-fade">
              <div
                ref={trackRef}
                className="marquee-track inline-flex items-stretch"
                style={{ '--dur': `${durationS}s`, animationPlayState: (inView && !userPaused) ? 'running' : 'paused' } as CSSProperties}
              >
                {cards}
                {/* Second set makes the loop seamless; hidden from AT so the
                    quotes aren't announced twice. */}
                <div className="inline-flex items-stretch" aria-hidden="true">{cards}</div>
              </div>
            </div>
          )}
        </div>
        {/* Sichtbarer Pause-Knopf (WCAG 2.2.2) — nur wo ueberhaupt eine
            Laufschrift laeuft (nicht bei reduced-motion oder mobil). */}
        {!reduced && (
          <button
            type="button"
            onClick={() => setUserPaused(p => !p)}
            aria-pressed={userPaused}
            aria-label={userPaused ? (de ? 'Laufschrift fortsetzen' : 'Resume marquee') : (de ? 'Laufschrift anhalten' : 'Pause marquee')}
            className="hidden sm:flex absolute right-2 bottom-2 items-center justify-center h-9 w-9 rounded-full transition-colors hover:opacity-90"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--bd2)', boxShadow: 'var(--card-shad)', color: 'var(--tx1)' }}
          >
            {userPaused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
          </button>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-7">
        <a href={CONTACT.ebayFeedback} target="_blank" rel="noopener noreferrer"
          onClick={() => trackShopClick('reviews')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
          style={{ border: '1px solid var(--bd)', background: 'var(--sf2)', color: 'var(--tx2)' }}>
          {de ? `Alle ${trustStats.reviews} Bewertungen auf eBay ansehen →` : `See all ${trustStats.reviews} reviews on eBay →`}
        </a>
        <button
          onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {de ? 'Jetzt Wachs kaufen →' : 'Buy wax now →'}
        </button>
      </div>

      {/* Herkunfts-Hinweis — § 5b Abs. 3 UWG: bei Werbung mit Bewertungen ist
          anzugeben, ob und wie ihre Echtheit sichergestellt wird. */}
      <p className="text-meta mt-5 max-w-2xl leading-relaxed" style={{ color: 'var(--txff)' }}>
        {de
          ? 'Alle Bewertungen stammen aus bestätigten eBay-Käufen und sind dort wortgleich öffentlich einsehbar. Namen so, wie eBay sie zeigt. Die Fotos sind unsere eigenen.'
          : 'All reviews come from confirmed eBay purchases and are publicly visible there word for word. Names as eBay shows them. The photos are our own.'}
      </p>
    </Section>
  );
}
