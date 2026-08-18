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
type Review = {
  textDe: string; textEn: string;
  name: string;
  dateDe: string; dateEn: string;
  rating?: number;                 // default 5
  source?: 'ebay' | 'web';         // verified badge label
  productDe?: string; productEn?: string;
  photo?: string;                  // real customer photo, shown as a small thumbnail
  photoPos?: string;               // object-position, tuned per photo
};

const REVIEWS: Review[] = [
  {
    textDe: 'Bin jahrelang Öl gefahren und eher skeptisch rangegangen. Erster Eindruck nach dem Wechsel: Die Kette bleibt einfach sauber — kein schwarzer Rand mehr an der Wade, Finger bleiben sauber beim Rad einladen. Dazu läuft der Antrieb spürbar leiser. Eine Wachsung hält bei mir gut 300 km. Kein Zurück mehr zum Öl.',
    textEn: 'Ran oil for years and went in pretty skeptical. First impression after switching: the chain just stays clean — no more black mark on my calf, clean fingers loading the bike. And the drivetrain runs noticeably quieter. One wax lasts me a good 300 km. No going back to oil.',
    name: 'tom_rennrad', dateDe: 'März 2026', dateEn: 'March 2026', source: 'ebay', photo: '/images/reviews/ride-1.jpg', photoPos: '50% 68%',
  },
  {
    textDe: 'Erst eine Ausfahrt, aber die Kette war leise UND kein Ketten-Tattoo an Wade oder weißen Socken. Perfekt. Hätte ich einen YouTube-Kanal für 65+ Fahrer, würde ich allen das Wachsen empfehlen.',
    textEn: 'Only one ride but the chain was quiet AND no chain tattoo on my calf or white socks. Perfect. If I had a YouTube channel for 65+ riders, I’d tell them all to wax.',
    name: 'Michael W.', dateDe: 'Okt 2025', dateEn: 'Oct 2025', source: 'web',
    productDe: 'Original Starter-Kit', productEn: 'Original Starter Kit', photo: '/images/reviews/ride-2.jpg', photoPos: '50% 62%',
  },
  {
    textDe: 'Wachse meine Ketten seit Jahren selbst und hatte vorher Silca und CycloWax in der Schublade. Im Alltag merke ich ehrlich keinen Unterschied bei Laufruhe oder Standzeit — nur beim Preis. Bin komplett umgestiegen und empfehle es im Verein regelmäßig weiter. Bestes Preis-Leistungs-Verhältnis, das ich kenne.',
    textEn: "I've waxed my own chains for years and used to keep Silca and CycloWax in the drawer. Day to day I honestly notice no difference in smoothness or longevity — only in the price. Switched over completely and recommend it at my club all the time. Best value I know of.",
    name: 'm.gerber', dateDe: 'Mai 2026', dateEn: 'May 2026', source: 'ebay', photo: '/images/reviews/ride-4.jpg', photoPos: '58% 52%',
  },
  {
    textDe: 'Jetzt drei Wochen als „Cyclowaxee". Toller Service! Das Starter-Kit enthält mehr als erwartet und macht den Umstieg auf Heißwachs sehr einfach — gerade fürs Reinigen des Antriebs.',
    textEn: 'Now three weeks in as a “Cyclowaxee”. Great service! The starter kit contains more than expected and makes converting to hot wax very easy — especially for cleaning the drivetrain.',
    name: 'Philippe V.', dateDe: 'Okt 2025', dateEn: 'Oct 2025', source: 'web',
    productDe: 'Original Starter-Kit', productEn: 'Original Starter Kit', photo: '/images/reviews/ride-3.jpg',
  },
  {
    textDe: 'Als kompletter Neuling bei der Fahrradpflege hat mir das Starter-Kit den Einstieg super leicht gemacht. Ich konnte den Antrieb wunderbar und schnell reinigen.',
    textEn: 'As a total newbie to maintaining my bike, the starter kit made it so easy to dive in. I was able to clean the drivetrain beautifully and quickly.',
    name: 'Maximilian M.', dateDe: 'Dez 2025', dateEn: 'Dec 2025', source: 'web',
    productDe: 'Original Starter-Kit', productEn: 'Original Starter Kit',
  },
  {
    textDe: 'Schnelle Lieferung, einwandfrei gewachste Kette die sehr gut läuft, gerne wieder.',
    textEn: 'Fast delivery, impeccably waxed chain that runs very well — will order again.',
    name: 'seyrane', dateDe: 'März 2026', dateEn: 'March 2026', source: 'ebay', photo: '/images/reviews/ride-5.jpg',
  },
  {
    textDe: 'Positiver als positiv kann leider niemand bewerten – wäre hier aber angebracht, 1+ mit ★.',
    textEn: "Can't rate higher than positive — but this would deserve a 1+ with ★.",
    name: 'volvo210b', dateDe: 'Jan 2026', dateEn: 'Jan 2026', source: 'ebay',
  },
  {
    textDe: 'Alles bestens, läuft wie gewachst !!',
    textEn: 'All good — runs like a dream !!',
    name: 'maienbuehl', dateDe: 'Feb 2026', dateEn: 'Feb 2026', source: 'ebay',
  },
];

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
// der nur fuenf von acht Karten ein Foto haben, ergibt das den ausgefransten,
// unruhigen Eindruck, den Luca beschrieben hat — und zieht die ganze Sektion
// unnoetig in die Hoehe.
//
// Als linker Streifen traegt das Foto die volle Hoehe der Karte, egal wie hoch
// die ist: Karten mit und ohne Foto sind gleich hoch, das Bild ist gross genug,
// um als echtes Rad lesbar zu sein, und der Text liegt weiter auf der
// Kartenflaeche statt auf dem Bild — die Lesbarkeit haengt also nicht davon ab,
// wie hell das jeweilige Motiv ist.
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
  // 100 statt 84: bei einer Kartenhöhe von rund 215px ergaben 84px einen
  // Streifen von etwa 1:2,5 — als Band noch lesbar, aber für ein Querformat
  // (Rad vor Landschaft) ein sehr schmaler Ausschnitt. 100px bringt das
  // Verhältnis auf etwa 1:2, ohne der Textspalte spürbar Breite zu nehmen.
  const PHOTO_W = 100;

  return (
    <figure
      className="flex-shrink-0 flex items-stretch rounded-2xl overflow-hidden mr-4 whitespace-normal"
      style={{
        // Gegen den Viewport gedeckelt, damit eine Karte mit langem Zitat auf
        // dem Handy nie breiter als der Bildschirm wird — dort waere sie im
        // Vorbeilaufen nicht vollstaendig lesbar.
        width: `min(${textColWidth(text.length) + (showPhoto ? PHOTO_W : 0)}px, calc(100vw - 72px))`,
        background: 'var(--sf2)',
        border: '1px solid var(--bd)',
      }}
    >
      {showPhoto && (
        <img src={r.photo} alt={de ? `Rad von ${r.name}` : `${r.name}'s bike`}
          loading="lazy" decoding="async"
          onError={() => setPhotoOk(false)}
          className="flex-shrink-0 object-cover self-stretch"
          style={{ width: PHOTO_W, background: 'var(--sf3)', objectPosition: r.photoPos ?? '50% 50%' }} />
      )}

      <div className="flex flex-col flex-1 min-w-0 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <Stars rating={r.rating ?? 5} />
          <span className="text-meta" style={{ color: 'var(--txf)' }}>{date}</span>
        </div>

        <blockquote className="text-[13px] leading-[1.6] flex-1" style={{ color: 'var(--tx2)' }}>
          „{text}“
        </blockquote>

        {/* Name, Verifizierung und Produkt in einer Zeile statt in einem
            eigenen Block mit Trennlinie darueber — spart pro Karte rund
            30 Pixel und liest sich als Signatur, nicht als zweite Sektion. */}
        <figcaption className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[12.5px] font-semibold" style={{ color: 'var(--tx1)' }}>{r.name}</span>
          <span className="inline-flex items-center gap-1 text-meta font-medium" style={{ color: 'var(--accent-soft)' }}>
            <BadgeCheck className="h-3.5 w-3.5" /> {verified}
          </span>
          {product && (
            <span className="text-meta font-medium" style={{ color: 'var(--txf)' }}>
              · {product}
            </span>
          )}
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
            <span key={i} className="inline-flex items-baseline gap-2">
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
            card mid-scroll. */}
        {/* Mobile-Plan B7g: eine overflow-x-auto <div> ohne tabIndex ist per
            Maus/Touch wischbar, aber ohne implizites tabindex nie ein
            Tab-Stopp — Tastaturnutzer sprangen direkt von der Ueberschrift
            zum "Alle Bewertungen"-Link darunter und konnten die Karten nie
            per Pfeiltasten durchscrollen. tabIndex={0} macht den Container
            fokussierbar, role="region" + aria-label geben ihm einen Namen,
            den ein Screenreader beim Betreten ansagt. */}
        <div className="sm:hidden flex overflow-x-auto edge-fade px-6 pb-2" style={{ scrollbarWidth: 'none' }}
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
                style={{ '--dur': '70s', animationPlayState: inView ? 'running' : 'paused' } as CSSProperties}
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
          {de ? 'Alle 200+ Bewertungen auf eBay ansehen →' : 'See all 200+ reviews on eBay →'}
        </a>
        <button
          onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {de ? 'Jetzt Wachs kaufen →' : 'Buy wax now →'}
        </button>
      </div>
    </Section>
  );
}
