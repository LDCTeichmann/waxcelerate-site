import { useLanguage } from '@/hooks/useLanguage';

const reviews = [
  {
    textDe: 'Kette läuft seit 600 km sauber durch. Schaltwerk makellos. Hätte nicht gedacht, dass der Unterschied so spürbar ist.',
    textEn: 'Chain has been running cleanly for 600 km. Derailleur spotless. Didn\'t expect the difference to be this noticeable.',
    name: 'M. H.',
    date: 'Feb 2025',
  },
  {
    textDe: 'Einfache Anwendung, sehr gutes Ergebnis. Wachs hält deutlich länger als erwartet. Klare Kaufempfehlung.',
    textEn: 'Easy to use, great results. Wax lasts noticeably longer than expected. Clear recommendation.',
    name: 'T. R.',
    date: 'März 2025',
  },
  {
    textDe: 'Schnelle Lieferung, top Qualität. Antrieb ist jetzt leise und sauber. Genau das, was ich gesucht habe.',
    textEn: 'Fast delivery, top quality. Drivetrain is now quiet and clean. Exactly what I was looking for.',
    name: 'S. K.',
    date: 'Apr 2025',
  },
];

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" style={{ fill: '#F59E0B' }}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function Reviews() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <section className="relative py-14 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <span className="section-eyebrow">
              {de ? 'Käuferstimmen · eBay verifiziert' : 'Buyer reviews · eBay verified'}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col gap-3"
                style={{
                  background: 'var(--sf3)',
                  border: '1px solid var(--bd2)',
                }}
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-[13px] leading-relaxed flex-1"
                  style={{ color: 'var(--tx2)' }}
                >
                  &ldquo;{de ? r.textDe : r.textEn}&rdquo;
                </p>

                {/* Footer */}
                <div
                  className="flex items-center justify-between text-[11px] pt-2"
                  style={{
                    borderTop: '1px solid var(--bd2)',
                    color: 'var(--txf)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--tx2)' }}>{r.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: '#4A6AEE' }}
                    />
                    eBay · {r.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
