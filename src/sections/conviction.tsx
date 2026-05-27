import { useLanguage } from '@/hooks/useLanguage';

export function Conviction() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  const stats = [
    {
      number: '171',
      label: de ? 'Bewertungen' : 'Reviews',
      sub: 'eBay verifiziert',
    },
    {
      number: '100%',
      label: de ? 'positiv' : 'positive',
      sub: de ? 'seit 2023' : 'since 2023',
    },
    {
      number: '−46%',
      label: de ? 'günstiger' : 'lower cost',
      sub: de ? 'über 12.000 km' : 'over 12,000 km',
    },
    {
      number: '3×',
      label: de ? 'Kettenlaufzeit' : 'chain life',
      sub: 'vs. Öl',
    },
  ];

  return (
    <section className="py-8 sm:py-10" style={{ background: 'var(--sf3)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex-1 text-center px-4 py-2"
                style={i > 0 ? { borderLeft: '1px solid var(--bd)' } : {}}
              >
                <p
                  className="font-display font-bold text-wx-tx1 tabular-nums leading-none"
                  style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
                >
                  {s.number}
                </p>
                <p className="text-[12px] font-medium mt-1.5" style={{ color: 'var(--tx2)' }}>
                  {s.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
