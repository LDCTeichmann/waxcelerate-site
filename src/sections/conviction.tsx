import { useLanguage } from '@/hooks/useLanguage';
import { AnimatedNumber } from '@/components/AnimatedNumber';

export function Conviction() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const stats = [
    {
      numValue: 171, prefix: '', suffix: '',
      label: de ? 'Bewertungen' : 'Reviews',
      sub: 'eBay verifiziert',
    },
    {
      numValue: 100, prefix: '', suffix: '%',
      label: de ? 'positiv' : 'positive',
      sub: de ? 'seit Gründung 2024' : 'since founding 2024',
    },
    {
      numValue: 46, prefix: '−', suffix: '%',
      label: de ? 'günstiger' : 'lower cost',
      sub: de ? 'vs. Öl · 12 Tkm *' : 'vs. oil · 12k km *',
    },
    {
      numValue: 3, prefix: '', suffix: '×',
      label: de ? 'Kettenlaufzeit' : 'chain life',
      sub: de ? 'vs. Öl †' : 'vs. oil †',
    },
  ];

  return (
    <section className="py-8 sm:py-10" style={{ background: 'var(--sf3)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto">
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden"
            style={{ background: 'var(--bd)' }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="text-center px-4 py-5"
                style={{ background: 'var(--sf3)' }}
              >
                <p
                  className="font-display font-bold text-wx-tx1 tabular-nums leading-none"
                  style={{ fontSize: 'clamp(1.4rem, 4vw, 2.25rem)' }}
                >
                  <AnimatedNumber value={s.numValue} prefix={s.prefix} suffix={s.suffix} duration={1.6} />
                </p>
                <p className="text-[12px] font-medium mt-1.5" style={{ color: 'var(--tx2)' }}>
                  {s.label}
                </p>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--txf)' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3 text-center px-2 leading-relaxed" style={{ color: 'var(--txf)' }}>
            {de
              ? '* Basis: Kettenpreis €30, Rewax alle 400 km vs. Ölwechsel alle 300 km, 12.000 km. † Kette 6.000–12.000 km mit Wachs vs. 2.000–3.000 km mit Öl (Kettendehnung 0,75%).'
              : '* Based on: chain price €30, re-wax every 400 km vs. oil every 300 km, 12,000 km total. † Chain 6,000–12,000 km with wax vs. 2,000–3,000 km with oil (chain stretch 0.75%).'}
          </p>
        </div>
      </div>
    </section>
  );
}
