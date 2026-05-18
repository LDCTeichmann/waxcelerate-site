import { useLanguage } from '@/hooks/useLanguage';

export function Conviction() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <section
      className="relative"
      style={{
        background: '#06060f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-3 max-w-5xl mx-auto">

          {/* Col 1 — Reviews (amber) */}
          <div
            className="flex flex-col items-center text-center py-6 sm:py-8 px-3 sm:px-8"
            style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span
              className="text-[11px] sm:text-[13px] leading-none mb-2 tracking-[0.04em]"
              style={{ color: '#FBBF24' }}
              aria-label="5 von 5 Sternen"
            >
              ★★★★★
            </span>
            <span
              className="font-display font-bold text-white tabular-nums leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)' }}
            >
              154
            </span>
            <p
              className="text-[10px] sm:text-[12px] font-medium mt-2 leading-snug"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {de ? 'Bewertungen' : 'Reviews'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              100% {de ? 'positiv' : 'positive'}
            </p>
          </div>

          {/* Col 2 — Cost saving (brand blue) */}
          <div
            className="flex flex-col items-center text-center py-6 sm:py-8 px-3 sm:px-8"
            style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span
              className="text-[11px] sm:text-[13px] leading-none mb-2 invisible"
              aria-hidden="true"
            >
              &nbsp;
            </span>
            <span
              className="font-display font-bold tabular-nums leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', color: '#8AAAFF' }}
            >
              −46%
            </span>
            <p
              className="text-[10px] sm:text-[12px] font-medium mt-2 leading-snug"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {de ? 'günstigere Kosten' : 'lower cost'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              {de ? 'vs. Kettenöl' : 'vs. chain oil'}
            </p>
          </div>

          {/* Col 3 — Chain life (brand blue) */}
          <div
            className="flex flex-col items-center text-center py-6 sm:py-8 px-3 sm:px-8"
          >
            <span
              className="text-[11px] sm:text-[13px] leading-none mb-2 invisible"
              aria-hidden="true"
            >
              &nbsp;
            </span>
            <span
              className="font-display font-bold tabular-nums leading-none"
              style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', color: '#8AAAFF' }}
            >
              3×
            </span>
            <p
              className="text-[10px] sm:text-[12px] font-medium mt-2 leading-snug"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {de ? 'längere Kette' : 'longer chain'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              {de ? 'vs. Öl' : 'vs. oil'}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
