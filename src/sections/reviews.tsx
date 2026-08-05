import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Stars } from '@/components/Stars';
import { Section } from '@/components/Section';

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

function initials(name: string) {
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

// Card width follows quote length instead of being uniform. A one-line quote
// in a 460px card is mostly empty space; a 300-word quote in a 300px card is a
// wall. Sizing to the text keeps every card roughly the same HEIGHT — which is
// what actually matters in a single row — and the varied widths give the row a
// natural rhythm rather than a metronome of identical blocks.
function cardWidth(len: number) {
  if (len > 240) return 460;
  if (len > 110) return 380;
  return 300;
}

function Avatar({ name, photo, photoPos, de }: { name: string; photo?: string; photoPos?: string; de: boolean }) {
  const [ok, setOk] = useState(true);
  if (photo && ok) {
    return (
      <img
        src={photo}
        alt={de ? `Rad von ${name}` : `${name}'s bike`}
        loading="lazy"
        onError={() => setOk(false)}
        className="flex-shrink-0 rounded-lg object-cover"
        style={{ width: 38, height: 38, objectPosition: photoPos ?? '50% 50%' }}
      />
    );
  }
  return (
    <span className="flex-shrink-0 grid place-items-center rounded-lg text-[11px] font-bold"
      style={{ width: 38, height: 38, background: 'var(--accent-wash)', color: 'var(--accent)' }}>
      {initials(name)}
    </span>
  );
}

// Das Foto sitzt jetzt als Band oben in der Karte, nicht mehr nur als 38 Pixel
// grosses Avatar und ausdruecklich nicht als Hintergrund.
//
// Beides war vorher schon einmal falsch: weisser Text ueber dem Foto war auf den
// helleren Radaufnahmen kaum lesbar, und das Daumenkino neben dem Namen war so
// klein, dass man nicht erkennen konnte, dass es echte Kundenfotos sind. Ein
// Band loest beides, weil der Text danach wieder auf der Kartenflaeche liegt:
// die Lesbarkeit haengt nicht mehr davon ab, wie hell das jeweilige Motiv ist.
//
// Karten ohne Foto bekommen kein Platzhalterbild. Eine Reihe, in der manche
// Karten ein Bild haben und manche nicht, liest sich als echte Sammlung.
// Gleichmacherei mit Stockbildern waere hier genau der falsche Reflex.
function ReviewCard({ r, de }: { r: Review; de: boolean }) {
  const text = de ? r.textDe : r.textEn;
  const date = de ? r.dateDe : r.dateEn;
  const product = de ? r.productDe : r.productEn;
  const verified = r.source === 'web'
    ? (de ? 'Verifizierter Käufer' : 'Verified buyer')
    : (de ? 'eBay verifiziert' : 'eBay verified');

  return (
    <figure
      className="flex-shrink-0 flex flex-col rounded-2xl px-5 py-4 mr-4 whitespace-normal"
      style={{
        // Capped against the viewport so a long-quote card can never end up
        // wider than the screen on mobile — there it would be impossible to
        // read a card in full as it passes.
        width: `min(${cardWidth(text.length)}px, calc(100vw - 72px))`,
        background: 'var(--sf2)',
        border: '1px solid var(--bd)',
      }}
    >
      {r.photo && (
        <div className="rounded-xl overflow-hidden mb-3.5 -mx-1"
          style={{ aspectRatio: '16 / 9', background: 'var(--sf3)' }}>
          <img src={r.photo} alt={de ? `Rad von ${r.name}` : `${r.name}'s bike`}
            loading="lazy" decoding="async"
            className="w-full h-full object-cover"
            style={{ objectPosition: r.photoPos ?? '50% 50%' }} />
        </div>
      )}

      <div className="flex items-center justify-between mb-2.5">
        <Stars rating={r.rating ?? 5} />
        <span className="text-[11.5px]" style={{ color: 'var(--txf)' }}>{date}</span>
      </div>

      <blockquote className="text-[13px] leading-[1.6] flex-1" style={{ color: 'var(--tx2)' }}>
        „{text}“
      </blockquote>

      <figcaption className="flex items-center gap-2.5 mt-3.5 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
        {/* Immer die Initialen, nie das Foto: das steckt jetzt oben im Band, und
            dasselbe Bild zweimal in einer Karte ist Redundanz, nicht Beweis. */}
        <Avatar name={r.name} de={de} />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--tx1)' }}>{r.name}</p>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium" style={{ color: 'var(--accent-soft)' }}>
            <BadgeCheck className="h-3.5 w-3.5" /> {verified}
          </span>
        </div>
        {product && (
          <span className="ml-auto flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-medium whitespace-nowrap"
            style={{ background: 'var(--accent-wash)', color: 'var(--accent)' }}>
            {product}
          </span>
        )}
      </figcaption>
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
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
          {de ? 'eBay verifiziert' : 'eBay verified'}
          <span className="hidden sm:inline">{de ? ' · alle Bewertungen echt' : ' · all reviews genuine'}</span>
        </p>
        <h2 className="section-title mb-3">{de ? 'Was Fahrer berichten.' : 'What riders report.'}</h2>
        <p className="text-[15px] max-w-2xl" style={{ color: 'var(--txm)' }}>
          {de
            ? '200+ Bewertungen seit dem Start 2024 — kein einziges Negatives. Eine Auswahl echter Rückmeldungen.'
            : '200+ reviews since launch in 2024 — not a single negative one. A selection of genuine feedback.'}
        </p>
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
        <div className="sm:hidden flex overflow-x-auto edge-fade px-6 pb-2" style={{ scrollbarWidth: 'none' }}>
          {cards}
        </div>
        <div className="hidden sm:block">
          {reduced ? (
            <div className="flex overflow-x-auto edge-fade px-10 lg:px-14 xl:px-20 pb-2" style={{ scrollbarWidth: 'none' }}>
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

      {/* ── Proof strip + actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-9 pt-6"
        style={{ borderTop: '1px solid var(--bd)' }}>
        <div className="flex items-stretch">
          {[
            { v: '200+', l: de ? 'Bewertungen' : 'reviews' },
            { v: '346', l: de ? 'verkauft' : 'sold' },
            { v: '0', l: de ? 'negativ' : 'negative' },
          ].map((s, i, arr) => (
            <div key={i} className="pr-5 sm:pr-7 mr-5 sm:mr-7 last:pr-0 last:mr-0"
              style={{ borderRight: i < arr.length - 1 ? '1px solid var(--bd)' : 'none' }}>
              <p className="font-display font-bold tabular-nums leading-none" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--tx1)' }}>{s.v}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--txf)' }}>{s.l}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-auto">
          <a href="https://www.ebay.de/usr/waxcelerate" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf2)', color: 'var(--tx2)' }}>
            {de ? 'Alle 200+ Bewertungen auf eBay ansehen →' : 'See all 200+ reviews on eBay →'}
          </a>
          <button
            onClick={() => document.querySelector('#produkte')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {de ? 'Jetzt Wachs kaufen →' : 'Buy wax now →'}
          </button>
        </div>
      </div>
    </Section>
  );
}
