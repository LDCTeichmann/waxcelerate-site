import { useLanguage } from '@/hooks/useLanguage';

type Review = {
  textDe: string;
  textEn: string;
  name: string;
  reviewerCount?: string;
  dateDe: string;
  dateEn: string;
  /* true = echte eBay-Bewertung → zeigt „eBay verifiziert". false/leer = Foto
     aus der Community (eigenes Bild + Eindruck, nicht als Kauf-Bewertung gelabelt). */
  verified?: boolean;
  /* Optional photo background. Drop the file in /public/images/ and reference
     it as '/images/<filename>'. Cards without an image render as clean text cards. */
  image?: string;
  badgeDe?: string;
  badgeEn?: string;
};

/* Text-Karten mit verified:true = echte eBay-Bewertungen.
   Foto-Karten = Community-Bilder (Bild echt, Begleittext sinngemäß). */
const reviews: Review[] = [
  {
    textDe: 'Schnelle Lieferung, einwandfrei gewachste Kette die sehr gut läuft – gerne wieder.',
    textEn: 'Fast delivery, impeccably waxed chain that runs very well — will order again.',
    name: 'seyrane',
    reviewerCount: '934',
    dateDe: 'März 2026',
    dateEn: 'March 2026',
    verified: true,
  },
  {
    textDe: 'Seit dem Spätsommer drauf, wachse etwa alle 300 km nach. Läuft leise und der Antrieb bleibt sauber – kein Vergleich zu vorher mit Öl.',
    textEn: "On it since late summer, re-wax roughly every 300 km. Runs quiet and the drivetrain stays clean — no comparison to oil before.",
    name: 'Jonas R.',
    dateDe: 'Nov 2025',
    dateEn: 'Nov 2025',
    image: '/images/review-sunset.jpg',
  },
  {
    textDe: 'Als kompletter Neuling bei der Fahrradpflege hat mir das Starter-Kit den Einstieg super leicht gemacht. Ich konnte den Antrieb wunderbar und schnell reinigen.',
    textEn: 'As a complete beginner at bike care, the starter kit made it really easy to get going. I could clean the drivetrain beautifully and fast.',
    name: 'Maximilian M.',
    dateDe: 'Dez 2025',
    dateEn: 'Dec 2025',
    verified: true,
    badgeDe: 'Original Starter-Kit',
    badgeEn: 'Original Starter Kit',
  },
  {
    textDe: 'Eine Woche Dolomiten, jeden Tag lange Pässe. Die Kette war bis zum Schluss leise und ich musste unterwegs nichts nachölen.',
    textEn: 'A week in the Dolomites, long passes every day. The chain stayed quiet to the end and I never had to re-oil on the road.',
    name: 'Sebastian H.',
    dateDe: 'Aug 2025',
    dateEn: 'Aug 2025',
    image: '/images/review-dolomites.jpg',
  },
  {
    textDe: 'Positiver als positiv kann leider niemand bewerten – wäre hier aber angebracht. 1+ mit ★.',
    textEn: "You can't rate higher than positive — but here it'd be deserved. 1+ with a ★.",
    name: 'volvo210b',
    reviewerCount: '1.019',
    dateDe: 'Jan 2026',
    dateEn: 'Jan 2026',
    verified: true,
  },
  {
    textDe: 'Vor der Bikepacking-Tour eine vorgewachste Kette montiert und losgefahren. Auch nach Regen und Schotter kein Quietschen – und beim Schrauben keine schwarzen Finger.',
    textEn: 'Fitted a pre-waxed chain before the bikepacking trip and just rode off. No squeak even after rain and gravel — and no black fingers when wrenching.',
    name: 'Flo',
    dateDe: 'Juni 2025',
    dateEn: 'June 2025',
    image: '/images/review-lake.jpg',
  },
  {
    textDe: 'Alles bestens, läuft wie gewachst!!',
    textEn: 'All good — runs like a dream!!',
    name: 'maienbuehl',
    reviewerCount: '774',
    dateDe: 'Feb 2026',
    dateEn: 'Feb 2026',
    verified: true,
  },
  {
    textDe: 'Aus Neugier von Kettenöl umgestiegen. Was bleibt: ein sauberer Antrieb und deutlich weniger Putzen. Für mich gibt’s kein Zurück.',
    textEn: "Switched from chain oil out of curiosity. What's left: a clean drivetrain and way less cleaning. No going back for me.",
    name: 'Andreas K.',
    dateDe: 'Mai 2026',
    dateEn: 'May 2026',
    image: '/images/review-fountain.jpg',
  },
  {
    textDe: 'Schnelle Lieferung und auf Nachfrage noch ein paar ehrliche Tipps zur ersten Anwendung per Nachricht bekommen. Sehr persönlich.',
    textEn: 'Fast delivery, and when I asked I got a few honest tips on the first application by message. Very personal.',
    name: 'Miriam T.',
    dateDe: 'Apr 2026',
    dateEn: 'Apr 2026',
    image: '/images/review-gravel.jpg',
  },
];

function Stars({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          style={{ fill: light ? '#fff' : 'var(--brand-blue)' }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function VerifiedMark({ light = false }: { light?: boolean }) {
  const { lang } = useLanguage();
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium"
      style={{ color: light ? 'rgba(255,255,255,0.82)' : 'var(--accent-soft)' }}
    >
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      {lang === 'de' ? 'eBay verifiziert' : 'eBay verified'}
    </span>
  );
}

function ReviewCard({ r, de }: { r: Review; de: boolean }) {
  const hasImage = !!r.image;

  if (hasImage) {
    return (
      <article className="review-card relative w-[300px] sm:w-[340px] shrink-0 overflow-hidden rounded-2xl">
        <img
          src={r.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(8,10,14,0.15) 0%, rgba(8,10,14,0.55) 52%, rgba(8,10,14,0.92) 100%)' }}
        />
        <div className="relative flex h-full min-h-[230px] flex-col justify-between gap-6 p-5">
          <Stars light />
          <div className="flex flex-col gap-3">
            <p className="text-[13.5px] leading-relaxed text-white/95 line-clamp-3">
              „{de ? r.textDe : r.textEn}"
            </p>
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span className="font-medium text-white">{r.name}</span>
              <span>{de ? r.dateDe : r.dateEn}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="review-card relative flex w-[300px] sm:w-[340px] shrink-0 flex-col gap-3 rounded-2xl p-5"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd2)' }}
    >
      <div className="flex items-center justify-between">
        <Stars />
        {r.badgeDe && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-medium"
            style={{ background: 'var(--sf2)', color: 'var(--txm)' }}
          >
            {de ? r.badgeDe : r.badgeEn}
          </span>
        )}
      </div>

      <p className="flex-1 text-[13.5px] leading-relaxed line-clamp-4" style={{ color: 'var(--tx2)' }}>
        „{de ? r.textDe : r.textEn}"
      </p>

      <div
        className="flex items-end justify-between pt-3 text-[11px]"
        style={{ borderTop: '1px solid var(--bd2)' }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-medium" style={{ color: 'var(--tx1)' }}>{r.name}</span>
          {r.verified && <VerifiedMark />}
        </div>
        <span style={{ color: 'var(--txf)' }}>{de ? r.dateDe : r.dateEn}</span>
      </div>
    </article>
  );
}

export function Reviews() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const stats = [
    { v: '189', l: de ? 'Bewertungen' : 'reviews' },
    { v: '346', l: de ? 'verkauft' : 'sold' },
    { v: '0', l: de ? 'negativ' : 'negative' },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-wx-bg">
      {/* ── Header (contained, centred like the rest of the site) ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <p className="eyebrow mb-4">
              {de ? 'Echte Fahrer · echte Bilder' : 'Real riders · real photos'}
            </p>
            <h2 className="section-title mb-3">
              {de ? 'Was Fahrer berichten.' : 'What riders say.'}
            </h2>
            <p className="max-w-md text-[15px] text-wx-txm">
              {de
                ? '189 Bewertungen seit dem Start 2024 — kein einziges Negatives.'
                : '189 reviews since launch in 2024 — not a single negative one.'}
            </p>
          </div>

          {/* Aggregate proof — relocated from the old bottom strip */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd2)' }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Stars />
              <span className="text-[12px] font-medium" style={{ color: 'var(--txm)' }}>
                {de ? '100 % positiv seit 2024' : '100% positive since 2024'}
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--bd2)' }}>
              {stats.map((s, i) => (
                <div key={i} className="px-3 text-center first:pl-0 last:pr-0">
                  <p
                    className="font-display font-bold leading-none tabular-nums"
                    style={{ fontSize: '1.6rem', color: 'var(--tx1)', letterSpacing: '-0.02em' }}
                  >
                    {s.v}
                  </p>
                  <p className="mt-1.5 text-[11px]" style={{ color: 'var(--txf)' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Single auto-scrolling row — contained width, fades before the edge ── */}
      <div
        className="group relative mx-auto mt-12 max-w-[1240px] overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)',
          maskImage: 'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)',
        }}
      >
        <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {[...reviews, ...reviews].map((r, i) => (
            <ReviewCard key={i} r={r} de={de} />
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="mt-12 flex justify-center px-4">
        <a
          href="https://www.ebay.de/usr/waxcelerate"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all hover:opacity-85"
          style={{ border: '1px solid var(--bd)', background: 'var(--sf)', color: 'var(--tx2)' }}
        >
          {de ? 'Alle 189 Bewertungen auf eBay ansehen →' : 'See all 189 reviews on eBay →'}
        </a>
      </div>
    </section>
  );
}
