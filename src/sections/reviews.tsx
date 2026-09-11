import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Stars } from '@/components/Stars';
import { Section } from '@/components/Section';
import { trustStats } from '@/lib/data';

// ── Data ─────────────────────────────────────────────────────────────────────
// Every entry is a REAL review (eBay feedback + verified-buyer reviews).
// Nothing here is invented — that is the whole point of this section. An
// earlier revision of this file carried extra "community" cards whose own
// comment admitted the text was only "sinngemäß" (paraphrased); those are
// deliberately not here. If more reviews are added, they come from actual
// eBay feedback, not from filling the row out.
export type Review = {
  textDe: string; textEn: string;
  name: string;
  dateDe: string; dateEn: string;
  rating?: number;                 // default 5
  source?: 'ebay' | 'web';         // verified badge label
  productDe?: string; productEn?: string;
  productIds?: string[];           // real product/bundle ids this review is genuinely about
  fallback?: boolean;              // may stand in on a product page with no tagged review
  photo?: string;                  // real customer photo (.jpg path; .webp sibling served first)
  photoPos?: string;               // object-position, only if the pre-crop still needs a nudge
};

// Reihenfolge bewusst gesetzt: die Fotos ride-1 und ride-2 zeigen DASSELBE
// maroon S-Works — sie dürfen nicht nebeneinander stehen (fällt auf). Ebenso
// die zwei dunklen Räder ride-3/ride-4. Foto-Karten liegen daher auf Position
// 1 / 4 / 6 / 9 / 11 mit je mindestens einer Textkarte dazwischen; die zwei
// S-Works trennt ride-3, die zwei dunklen Räder trennt ride-2, und die letzte
// Foto-Karte (ride-5, türkis) grenzt beim Marquee-Loop an die erste (ride-1).
export const REVIEWS: Review[] = [
  {
    textDe: 'Bin jahrelang Öl gefahren und eher skeptisch rangegangen. Erster Eindruck nach dem Wechsel: Die Kette bleibt einfach sauber — kein schwarzer Rand mehr an der Wade, Finger bleiben sauber beim Rad einladen. Dazu läuft der Antrieb spürbar leiser. Eine Wachsung hält bei mir gut 300 km. Kein Zurück mehr zum Öl.',
    textEn: 'Ran oil for years and went in pretty skeptical. First impression after switching: the chain just stays clean — no more black mark on my calf, clean fingers loading the bike. And the drivetrain runs noticeably quieter. One wax lasts me a good 300 km. No going back to oil.',
    name: 'tom_rennrad', dateDe: 'März 2026', dateEn: 'March 2026', source: 'ebay', fallback: true, photo: '/images/reviews/ride-1-card.jpg',
  },
  {
    textDe: 'Großes Lob an den Verkäufer, die Kette wurde schnell und ordnungsgemäß geliefert. Die Kette ist einwandfrei gewachst und ich werde die nächste Kette wieder bei ihm bestellen. Ich fahre schon viele Jahre jetzt mit gewachster Kette, seither hab ich das Wachsen immer selbst gemacht. Ich wollte mir einfach die Arbeit sparen, da das mit dem Ölfrei-Machen der Kette ziemlich zeitaufwändig ist. Ich bin sehr zufrieden, kann den Verkäufer nur weiterempfehlen.',
    textEn: "Big praise for the seller — the chain arrived quickly and properly. It's impeccably waxed and I'll be ordering my next chain from him again. I've ridden waxed chains for many years now and always did the waxing myself; I just wanted to save the effort, since getting the chain oil-free is quite time-consuming. Very satisfied, can only recommend the seller.",
    name: 'diemojakob', dateDe: 'Aug 2026', dateEn: 'Aug 2026', source: 'ebay',
    productDe: 'Gewachste Kette · Shimano XT/Ultegra', productEn: 'Waxed chain · Shimano XT/Ultegra',
    productIds: ['chain-m8100'],
  },
  {
    textDe: 'Als kompletter Neuling bei der Fahrradpflege hat mir das Starter-Kit den Einstieg super leicht gemacht. Ich konnte den Antrieb wunderbar und schnell reinigen.',
    textEn: 'As a total newbie to maintaining my bike, the starter kit made it so easy to dive in. I was able to clean the drivetrain beautifully and quickly.',
    name: 'Maximilian M.', dateDe: 'Dez 2025', dateEn: 'Dec 2025', source: 'web',
    productDe: 'Original Starter-Kit', productEn: 'Original Starter Kit',
    productIds: ['starter-classic', 'starter-pro'],
  },
  {
    textDe: 'Jetzt drei Wochen als „Cyclowaxee". Toller Service! Das Starter-Kit enthält mehr als erwartet und macht den Umstieg auf Heißwachs sehr einfach — gerade fürs Reinigen des Antriebs.',
    textEn: 'Now three weeks in as a “Cyclowaxee”. Great service! The starter kit contains more than expected and makes converting to hot wax very easy — especially for cleaning the drivetrain.',
    name: 'Philippe V.', dateDe: 'Okt 2025', dateEn: 'Oct 2025', source: 'web',
    productDe: 'Original Starter-Kit', productEn: 'Original Starter Kit',
    productIds: ['starter-classic', 'starter-pro'],
    photo: '/images/reviews/ride-3-card.jpg',
  },
  {
    textDe: 'Top Ware, einfach und gut portioniert. Lieferzeit sehr schnell vom Verkäufer — es wurde am gleichen Tag noch versendet, aber leider hat die Post einfach länger gebraucht (Verkäufer trifft keine Schuld). Habe dann mal den Verkäufer angeschrieben und auch sehr schnell eine freundliche Antwort bekommen. Als Entschuldigung gab’s einen großzügigen Gutschein, obwohl die Schuld nicht beim Verkäufer lag — das fand ich sehr aufmerksam. Werde auf jeden Fall wieder bestellen bzw. kann es weiterempfehlen.',
    textEn: "Great product, simple and well portioned. Very fast dispatch from the seller — sent the same day, though the post just took longer (not the seller's fault). I messaged the seller and got a quick, friendly reply. As an apology there was even a generous voucher, even though it wasn't the seller's fault — I thought that was very considerate. Will definitely order again and can recommend it.",
    name: 'than_889', dateDe: 'Mai 2025', dateEn: 'May 2025', source: 'ebay',
    productDe: 'Kettenwachs 500 g', productEn: 'Chain wax 500 g',
    productIds: ['wax-500'],
  },
  {
    textDe: 'Erst eine Ausfahrt, aber die Kette war leise UND kein Ketten-Tattoo an Wade oder weißen Socken. Perfekt. Hätte ich einen YouTube-Kanal für 65+ Fahrer, würde ich allen das Wachsen empfehlen.',
    textEn: 'Only one ride but the chain was quiet AND no chain tattoo on my calf or white socks. Perfect. If I had a YouTube channel for 65+ riders, I’d tell them all to wax.',
    name: 'Michael W.', dateDe: 'Okt 2025', dateEn: 'Oct 2025', source: 'web',
    productDe: 'Original Starter-Kit', productEn: 'Original Starter Kit',
    productIds: ['starter-classic', 'starter-pro'],
    photo: '/images/reviews/ride-2-card.jpg',
  },
  {
    textDe: 'Positiver als positiv kann leider niemand bewerten – wäre hier aber angebracht, 1+ mit ★.',
    textEn: "Can't rate higher than positive — but this would deserve a 1+ with ★.",
    name: 'volvo210b', dateDe: 'Jan 2026', dateEn: 'Jan 2026', source: 'ebay',
  },
  {
    textDe: 'Ich habe schon mehrere unterschiedliche vorgewachste Ketten von verschiedenen Anbietern ausprobiert. Luca bietet hier mit Waxcelerate meiner Meinung nach die besten Ketten an, die man so kriegen kann. Der Preis stimmt auch. 👍',
    textEn: "I've already tried several different pre-waxed chains from various sellers. In my opinion Luca and Waxcelerate offer the best chains you can get. The price is right, too. 👍",
    name: 'thewuschi', dateDe: 'Aug 2026', dateEn: 'Aug 2026', source: 'ebay',
    productDe: 'Gewachste Kette · Shimano Dura-Ace/XTR', productEn: 'Waxed chain · Shimano Dura-Ace/XTR',
    productIds: ['chain-m9100'],
  },
  {
    textDe: 'Wachse meine Ketten seit Jahren selbst und hatte vorher verschiedene fertige Wachse ausprobiert. Für mich im Alltag läuft die Kette genauso ruhig und lange wie gewohnt — den Unterschied merke ich vor allem beim Preis. Bin komplett umgestiegen und empfehle es im Verein regelmäßig weiter. Bestes Preis-Leistungs-Verhältnis, das ich kenne.',
    textEn: "I've waxed my own chains for years and had tried various off-the-shelf waxes before. For me, day to day, the chain runs just as smoothly and lasts just as long as I'm used to — the difference I notice is mainly the price. Switched over completely and recommend it at my club regularly. Best value for money I know of.",
    name: 'm.gerber', dateDe: 'Mai 2026', dateEn: 'May 2026', source: 'ebay', fallback: true, photo: '/images/reviews/ride-4-card.jpg',
  },
  {
    textDe: 'Alles bestens, 1a. Sehr netter Kontakt, sehr ausführliche Beratung bei Fragen. Immer wieder gern.',
    textEn: 'All perfect, top marks. Very friendly contact, thorough advice when I had questions. Happy to order again anytime.',
    name: 'daliduc848', dateDe: 'Apr 2026', dateEn: 'Apr 2026', source: 'ebay',
    productDe: 'Gewachste Kette · Shimano SLX/105', productEn: 'Waxed chain · Shimano SLX/105',
    productIds: ['chain-m7100'],
  },
  {
    textDe: 'Schnelle Lieferung, einwandfrei gewachste Kette die sehr gut läuft, gerne wieder.',
    textEn: 'Fast delivery, impeccably waxed chain that runs very well — will order again.',
    name: 'seyrane', dateDe: 'März 2026', dateEn: 'March 2026', source: 'ebay', photo: '/images/reviews/ride-5-card.jpg',
  },
  {
    textDe: 'Alles bestens, läuft wie gewachst !!',
    textEn: 'All good — runs like a dream !!',
    name: 'maienbuehl', dateDe: 'Feb 2026', dateEn: 'Feb 2026', source: 'ebay',
  },
];

// Picks 1-2 real reviews for a product detail page. Tagged reviews win: the
// Starter-Kit bundles and, since 08/2026, the Shimano chains (chain-m7100/
// m8100/m9100) and the 500 g wax each carry a genuine eBay review. Everything
// else has no reliable per-SKU review, so it falls back to the entries
// explicitly marked `fallback: true` — tom_rennrad and m.gerber, the two most
// substantive untagged quotes. Decoupled from array order on purpose: the row
// order above is tuned for photo variety, not for which review leads.
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
  if (len > 240) return 380;
  if (len > 110) return 320;
  return 250;
}

// Das Foto steht als schmaler Streifen an der linken Kante der Karte, ueber die
// volle Kartenhoehe.
//
// Zwei Vorgaengerversionen sind an derselben Stelle gescheitert. Als 38-Pixel-
// Avatar neben dem Namen war nicht zu erkennen, dass es echte Kundenfotos sind;
// als 16:9-Band oben in der Karte war es zwar gross genug, machte aber genau
// die Karten mit Foto rund 120 Pixel hoeher als die ohne. In einer Reihe, in
// der nur ein Teil der Karten ein Foto hat, ergibt das den ausgefransten,
// unruhigen Eindruck, den Luca beschrieben hat — und zieht die ganze Sektion
// unnoetig in die Hoehe.
//
// Als linker Streifen traegt das Foto die volle Hoehe der Karte, egal wie hoch
// die ist: Karten mit und ohne Foto sind gleich hoch, das Bild ist gross genug,
// um als echtes Rad lesbar zu sein, und der Text liegt weiter auf der
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
function ReviewCard({ r, de }: { r: Review; de: boolean }) {
  const text = de ? r.textDe : r.textEn;
  const date = de ? r.dateDe : r.dateEn;
  const product = de ? r.productDe : r.productEn;
  const verified = r.source === 'web'
    ? (de ? 'Verifizierter Käufer' : 'Verified buyer')
    : (de ? 'eBay verifiziert' : 'eBay verified');
  const [photoOk, setPhotoOk] = useState(true);
  const showPhoto = Boolean(r.photo) && photoOk;
  // 116 statt 100: die Bilder sind jetzt vorgeschnittenes 4:5-Hochformat, ein
  // paar Pixel mehr Streifenbreite zeigen Rahmen und Antrieb klarer, ohne der
  // Textspalte auf dem Handy (Karte gegen calc(100vw - 72px) gedeckelt)
  // spürbar Platz zu nehmen.
  const PHOTO_W = 112;
  const photoWebp = r.photo?.replace(/\.jpg$/, '.webp');

  return (
    <figure
      className="review-card flex-shrink-0 flex items-stretch rounded-2xl overflow-hidden mr-4 whitespace-normal"
      style={{
        // Gegen den Viewport gedeckelt, damit eine Karte mit langem Zitat auf
        // dem Handy nie breiter als der Bildschirm wird — dort waere sie im
        // Vorbeilaufen nicht vollstaendig lesbar.
        width: `min(${textColWidth(text.length) + (showPhoto ? PHOTO_W : 0)}px, calc(100vw - 72px))`,
        // Kartensprache der Seite (--card-*), nicht mehr die flache --sf2-
        // Fläche: leichter Verlauf, weiche Kante, ein Hauch Schatten. Die Reihe
        // liest sich damit als Sammlung erhabener Karten statt als Tabelle.
        background: 'var(--card-bg)',
        border: '1px solid var(--bd2)',
        boxShadow: 'var(--card-shad)',
      }}
    >
      {showPhoto && (
        <picture
          className="flex-shrink-0 self-stretch flex"
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
          <img src={r.photo} alt={de ? `Rad von ${r.name}` : `${r.name}'s bike`}
            loading="lazy" decoding="async"
            onError={() => setPhotoOk(false)}
            className="w-full object-cover"
            style={{ objectPosition: r.photoPos ?? '50% 50%' }} />
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
          <span className="text-meta whitespace-nowrap" style={{ color: 'var(--txf)' }}>{date}</span>
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

  const cards = REVIEWS.map((r, i) => <ReviewCard key={i} r={r} de={de} />);

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
                className="marquee-track inline-flex items-stretch"
                style={{ '--dur': '96s', animationPlayState: inView ? 'running' : 'paused' } as CSSProperties}
              >
                {cards}
                {/* Second set makes the loop seamless; hidden from AT so the
                    quotes aren't announced twice. */}
                <div className="inline-flex items-stretch" aria-hidden="true">{cards}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-7">
        <a href="https://www.ebay.de/usr/waxcelerate" target="_blank" rel="noopener noreferrer"
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
          ? 'eBay-Bewertungen stammen aus bestätigten Käufen und sind dort öffentlich einsehbar. Weitere Rückmeldungen stammen aus direktem Kundenkontakt nach dem Kauf.'
          : 'eBay reviews come from confirmed purchases and are publicly visible there. Further feedback comes from direct customer contact after purchase.'}
      </p>
    </Section>
  );
}
