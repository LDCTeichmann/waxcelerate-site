import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Stars } from '@/components/Stars';
import { Section } from '@/components/Section';

// ── Data ─────────────────────────────────────────────────────────────────────
// Every entry is a REAL review (eBay feedback + verified-buyer reviews). Nothing
// here is invented — that's the whole point of the section. `photo` cards pull a
// user image from /images/reviews; if the file is missing the card falls back to
// the text-only layout automatically.
type Review = {
  textDe: string; textEn: string;
  name: string;
  dateDe: string; dateEn: string;
  rating?: number;                 // default 5
  source?: 'ebay' | 'web';         // verified badge label
  productDe?: string; productEn?: string;
  photo?: string;
  photoPos?: string;                // object-position, tuned per photo so the bike stays clear of the frame
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
      style={{ width: 30, height: 30, background: 'var(--accent-wash)', color: 'var(--accent)' }}>
      {initials(name)}
    </span>
  );
}

// Photo, when present, is now its own block above the quote rather than a
// background behind it — the previous text-on-photo layout put white text
// over light bike photos on two of the five photo cards, which was
// borderline unreadable. This also unifies the photo and no-photo cards onto
// one shared shape: same background, same footer, same quote treatment.
function ReviewCard({ r, de }: { r: Review; de: boolean }) {
  const [imgOk, setImgOk] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const text = de ? r.textDe : r.textEn;
  const date = de ? r.dateDe : r.dateEn;
  const product = de ? r.productDe : r.productEn;
  const isLong = text.length > 160;
  const showPhoto = r.photo && imgOk;

  return (
    <figure className="h-full flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      {showPhoto && (
        <div className="h-36 sm:h-40 flex-shrink-0">
          <img src={r.photo} alt={de ? `Fahrrad von ${r.name}` : `${r.name}'s bike`} loading="lazy" onError={() => setImgOk(false)}
            className="w-full h-full object-cover" style={{ objectPosition: r.photoPos ?? '50% 50%' }} />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <Stars rating={r.rating ?? 5} />
          <span className="text-[10.5px]" style={{ color: 'var(--txf)' }}>{date}</span>
        </div>
        <blockquote className={`text-[13px] leading-relaxed flex-1 ${!expanded && isLong ? 'line-clamp-4' : ''}`} style={{ color: 'var(--tx2)' }}>
          „{text}“
        </blockquote>
        {isLong && (
          <button onClick={() => setExpanded(v => !v)}
            className="text-[11.5px] font-medium mt-1.5 self-start hover:underline"
            style={{ color: 'var(--accent-soft)' }}>
            {expanded ? (de ? 'Weniger anzeigen' : 'Show less') : (de ? 'Mehr lesen' : 'Read more')}
          </button>
        )}
        <figcaption className="flex items-center gap-2.5 mt-3.5 pt-3.5" style={{ borderTop: '1px solid var(--bd2)' }}>
          <Avatar name={r.name} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--tx1)' }}>{r.name}</p>
            <Verified source={r.source} de={de} />
          </div>
          {product && (
            <span className="ml-auto flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-medium whitespace-nowrap"
              style={{ background: 'var(--accent-wash)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb),0.16)' }}>
              {product}
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

  return (
    <Section id="bewertungen" style={{ background: 'var(--pg)' }}>
      {/* ── Header ── */}
      <div className="mb-9">
        <p className="eyebrow mb-4" style={{ color: 'var(--txf)' }}>
          {de ? 'eBay verifiziert' : 'eBay verified'}
          <span className="hidden sm:inline">{de ? ' · alle Bewertungen echt' : ' · all reviews genuine'}</span>
        </p>
        <h2 className="section-title mb-3">{de ? 'Was Fahrer berichten.' : 'What riders report.'}</h2>
        <p className="text-[15px] max-w-2xl" style={{ color: 'var(--txm)' }}>
          {de
            ? '200+ Bewertungen seit dem Start 2024 — kein einziges Negatives. Eine Auswahl echter Rückmeldungen, mit Fotos aus der Community.'
            : '200+ reviews since launch in 2024 — not a single negative one. A selection of genuine feedback, with photos from the community.'}
        </p>
      </div>

      {/* ── Desktop/tablet: static grid, no motion — nothing here rotates or hides itself ── */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {REVIEWS.map((r, i) => <ReviewCard key={i} r={r} de={de} />)}
      </div>

      {/* ── Mobile: swipeable, one card per screen ── */}
      <div className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-1 edge-fade" style={{ scrollbarWidth: 'none' }}>
        {REVIEWS.map((r, i) => (
          <div key={i} className="snap-center flex-shrink-0 w-full">
            <ReviewCard r={r} de={de} />
          </div>
        ))}
      </div>

      {/* ── Proof strip + source link ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-10 pt-6"
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
