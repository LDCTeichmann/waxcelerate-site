import { useLanguage } from '@/hooks/useLanguage';

export function Conviction() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <section
      className="relative py-12 sm:py-16"
      style={{ background: '#06060f' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-3">

          {/* Card 1 — Reviews */}
          <div
            className="relative rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(251,191,36,0.07) 0%, rgba(255,255,255,0.025) 60%, transparent 100%)',
              border: '1px solid rgba(251,191,36,0.15)',
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)' }}
            />
            <span
              className="text-[11px] sm:text-[14px] mb-3 block leading-none"
              style={{ color: '#FBBF24' }}
              aria-label={de ? '5 von 5 Sternen' : '5 out of 5 stars'}
            >
              ★★★★★
            </span>
            <span
              className="font-display font-bold text-white tabular-nums leading-none block"
              style={{ fontSize: 'clamp(1.7rem, 5vw, 3rem)' }}
            >
              154
            </span>
            <p
              className="text-[10px] sm:text-[13px] font-medium mt-2.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {de ? 'Bewertungen' : 'Reviews'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              100% {de ? 'positiv' : 'positive'}
            </p>
          </div>

          {/* Card 2 — Cost */}
          <div
            className="relative rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(74,106,238,0.10) 0%, rgba(138,170,255,0.03) 60%, transparent 100%)',
              border: '1px solid rgba(74,106,238,0.20)',
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(74,106,238,0.28) 0%, transparent 70%)' }}
            />
            <span
              className="font-display font-bold tabular-nums leading-none block"
              style={{ fontSize: 'clamp(1.7rem, 5vw, 3rem)', color: '#8AAAFF', marginTop: 'calc(11px + 0.75rem)' }}
            >
              −46%
            </span>
            <p
              className="text-[10px] sm:text-[13px] font-medium mt-2.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {de ? 'günstigere Kosten' : 'lower cost'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {de ? 'vs. Kettenöl' : 'vs. chain oil'}
            </p>
          </div>

          {/* Card 3 — Chain life */}
          <div
            className="relative rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(74,106,238,0.10) 0%, rgba(138,170,255,0.03) 60%, transparent 100%)',
              border: '1px solid rgba(74,106,238,0.20)',
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(74,106,238,0.28) 0%, transparent 70%)' }}
            />
            <span
              className="font-display font-bold tabular-nums leading-none block"
              style={{ fontSize: 'clamp(1.7rem, 5vw, 3rem)', color: '#8AAAFF', marginTop: 'calc(11px + 0.75rem)' }}
            >
              3×
            </span>
            <p
              className="text-[10px] sm:text-[13px] font-medium mt-2.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {de ? 'längere Kette' : 'longer chain'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {de ? 'vs. Öl' : 'vs. oil'}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
