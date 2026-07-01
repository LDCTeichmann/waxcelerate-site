import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

// ── Data ─────────────────────────────────────────────────────────────────────
// Every entry is a REAL review (eBay feedback + verified-buyer reviews). Nothing
// here is invented — that's the whole point of the section. `photo` cards pull a
// user image from /images/reviews; if the file is missing the card falls back to
// the text layout automatically.
type Review = {
  textDe: string; textEn: string;
  name: string;
  dateDe: string; dateEn: string;
  rating?: number;                 // default 5
  source?: 'ebay' | 'web';         // verified badge label
  productDe?: string; productEn?: string;
  photo?: string;
  photoPos?: string;                // object-position, tuned per photo so the bike stays clear of the text scrim
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

const CARD_W = 'w-[260px] sm:w-[348px]';
const CARD = 'flex-shrink-0 mr-3 sm:mr-5 h-[180px] sm:h-[212px] rounded-2xl overflow-hidden';

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" aria-hidden
          style={{ fill: i < rating ? 'var(--accent-soft)' : 'var(--bd)' }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function initials(name: string) {
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

function Verified({ source, de }: { source?: Review['source']; de: boolean }) {
  const label = source === 'web'
    ? (de ? 'Verifizierter Käufer' : 'Verified buyer')
    : (de ? 'eBay verifiziert' : 'eBay verified');
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: 'var(--accent-soft)' }}>
      <BadgeCheck className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex-shrink-0 grid place-items-center rounded-full text-[11px] font-bold"
      style={{ width: 30, height: 30, background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)' }}>
      {initials(name)}
    </span>
  );
}

function ReviewCard({ r, de }: { r: Review; de: boolean }) {
  const [imgOk, setImgOk] = useState(true);
  const text = de ? r.textDe : r.textEn;
  const date = de ? r.dateDe : r.dateEn;
  const product = de ? r.productDe : r.productEn;

  // ── Photo card ──
  if (r.photo && imgOk) {
    return (
      <figure className={`${CARD} ${CARD_W} relative`}>
        <img src={r.photo} alt="" loading="lazy" onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: r.photoPos ?? '50% 50%' }} />
        {/* Scrim only tall enough for the quote + name — leaves the bike itself untinted */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,7,9,0.90) 0%, rgba(6,7,9,0.62) 22%, rgba(6,7,9,0) 58%)' }} />
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3"><Stars rating={r.rating ?? 5} /></div>
        <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
          <blockquote className="text-[12px] sm:text-[13px] leading-snug font-medium line-clamp-2" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            „{text}“
          </blockquote>
          <div className="flex items-center gap-2 mt-2.5 text-[11px]">
            <span className="font-semibold">{r.name}</span>
            <span className="opacity-70">·</span>
            <span className="inline-flex items-center gap-1 opacity-90"><BadgeCheck className="h-3.5 w-3.5" />{date}</span>
          </div>
        </figcaption>
      </figure>
    );
  }

  // ── Text card ──
  return (
    <figure className={`${CARD} ${CARD_W} flex flex-col p-3.5 sm:p-5`}
      style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <div className="flex items-center justify-between">
        <Stars rating={r.rating ?? 5} />
        <span className="text-[10.5px]" style={{ color: 'var(--txf)' }}>{date}</span>
      </div>
      <blockquote className="text-[12px] sm:text-[13px] leading-relaxed mt-2 sm:mt-2.5 flex-1 line-clamp-3 sm:line-clamp-4" style={{ color: 'var(--tx2)' }}>
        „{text}“
      </blockquote>
      <figcaption className="flex items-center gap-2.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
        <Avatar name={r.name} />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--tx1)' }}>{r.name}</p>
          <Verified source={r.source} de={de} />
        </div>
        {product && (
          <span className="ml-auto flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-medium whitespace-nowrap"
            style={{ background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb),0.16)' }}>
            {product}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

// Seamless marquee row: cards rendered twice, the track slides one set width.
// `paused` halts the animation when the section is off-screen so it isn't
// compositing a wide track no one can see.
function Marquee({ items, dur, reduced, paused }: { items: Review[]; dur: number; reduced: boolean; paused: boolean }) {
  const { lang } = useLanguage();
  const de = lang === 'de';
  if (reduced) {
    return (
      <div className="flex overflow-x-auto edge-fade pb-2" style={{ scrollbarWidth: 'none' }}>
        {items.map((r, i) => <ReviewCard key={i} r={r} de={de} />)}
      </div>
    );
  }
  return (
    <div className="marquee overflow-hidden edge-fade">
      <div className="marquee-track inline-flex"
        style={{ '--dur': `${dur}s`, animationPlayState: paused ? 'paused' : 'running' } as CSSProperties}>
        {[...items, ...items].map((r, i) => <ReviewCard key={i} r={r} de={de} />)}
      </div>
    </div>
  );
}

export function Reviews() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [reduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Pause the marquee animations while the section is off-screen so it isn't
  // compositing a wide track no one can see.
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 overflow-hidden" style={{ background: 'var(--pg)' }}>
      {/* ── Header ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto mb-9">
          <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
            {de ? 'eBay verifiziert' : 'eBay verified'}
            <span className="hidden sm:inline">{de ? ' · alle Bewertungen echt' : ' · all reviews genuine'}</span>
          </p>
          <h2 className="section-title mb-3">{de ? 'Was Fahrer berichten.' : 'What riders report.'}</h2>
          <p className="text-[15px] max-w-2xl" style={{ color: 'var(--txm)' }}>
            {de
              ? '189 Bewertungen seit dem Start 2024 — kein einziges Negatives. Eine Auswahl echter Rückmeldungen, mit Fotos aus der Community.'
              : '189 reviews since launch in 2024 — not a single negative one. A selection of genuine feedback, with photos from the community.'}
          </p>
        </div>
      </div>

      {/* ── Single self-scrolling row, contained so cards fade in before the edge ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Marquee items={REVIEWS} dur={64} reduced={reduced} paused={!inView} />
      </div>

      {/* ── Proof strip + source link ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-10 pt-6"
          style={{ borderTop: '1px solid var(--bd)' }}>
          <div className="flex items-stretch">
            {[
              { v: '189', l: de ? 'Bewertungen' : 'reviews' },
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
          <a href="https://www.ebay.de/usr/waxcelerate" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all hover:opacity-85 self-start sm:self-auto"
            style={{ border: '1px solid var(--bd)', background: 'var(--sf2)', color: 'var(--tx2)' }}>
            {de ? 'Alle 189 Bewertungen auf eBay ansehen →' : 'See all 189 reviews on eBay →'}
          </a>
        </div>
      </div>
    </section>
  );
}
