import { useLanguage } from '@/hooks/useLanguage';

export function Conviction() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <section
      className="relative py-12 sm:py-16"
      style={{ background: 'var(--sf3)' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-3">

          {/* Card 1 — Reviews */}
          <div
            className="relative rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(43,82,176,0.10) 0%, rgba(138,170,255,0.03) 60%, transparent 100%)',
              border: '1px solid rgba(43,82,176,0.20)',
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(43,82,176,0.28) 0%, transparent 70%)' }}
            />
            <span
              className="font-display font-bold tabular-nums leading-none block"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#4A72D4', marginTop: 'calc(11px + 0.75rem)' }}
            >
              100%
            </span>
            <p
              className="text-[10px] sm:text-[13px] font-medium mt-2.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {de ? 'positiv' : 'positive'}
            </p>
            <p
              className="text-[9px] sm:text-[11px] mt-0.5 leading-snug"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {de ? 'eBay verifiziert' : 'eBay verified'}
            </p>
          </div>

          {/* Card 2 — Cost */}
          <div
            className="relative rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(43,82,176,0.10) 0%, rgba(138,170,255,0.03) 60%, transparent 100%)',
              border: '1px solid rgba(43,82,176,0.20)',
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(43,82,176,0.28) 0%, transparent 70%)' }}
            />
            <span
              className="font-display font-bold tabular-nums leading-none block"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#4A72D4', marginTop: 'calc(11px + 0.75rem)' }}
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
              background: 'linear-gradient(145deg, rgba(43,82,176,0.10) 0%, rgba(138,170,255,0.03) 60%, transparent 100%)',
              border: '1px solid rgba(43,82,176,0.20)',
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(43,82,176,0.28) 0%, transparent 70%)' }}
            />
            <span
              className="font-display font-bold tabular-nums leading-none block"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#4A72D4', marginTop: 'calc(11px + 0.75rem)' }}
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
