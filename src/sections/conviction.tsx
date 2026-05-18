import { useLanguage } from '@/hooks/useLanguage';

const facts = [
  {
    stat: '−46%',
    labelDe: 'Kosten gegenüber Kettenöl',
    labelEn: 'Cost vs. chain oil',
    subDe: 'über 12.000 km gerechnet',
    subEn: 'calculated over 12,000 km',
  },
  {
    stat: '3×',
    labelDe: 'längere Kettenlaufzeit',
    labelEn: 'longer chain life',
    subDe: 'gegenüber konventionellem Öl',
    subEn: 'vs. conventional oil',
  },
  {
    stat: '154',
    labelDe: 'eBay-Bewertungen',
    labelEn: 'eBay reviews',
    subDe: '100% positiv',
    subEn: '100% positive',
  },
];

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
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {facts.map((fact, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center py-10 px-6"
              style={{
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                borderBottom: undefined,
              }}
            >
              <span
                className="font-display font-bold tracking-tight text-white tabular-nums"
                style={{ fontSize: 'clamp(2.6rem, 5vw, 4rem)', lineHeight: 1 }}
              >
                {fact.stat}
              </span>
              <p className="text-[13px] font-medium mt-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {de ? fact.labelDe : fact.labelEn}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {de ? fact.subDe : fact.subEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
