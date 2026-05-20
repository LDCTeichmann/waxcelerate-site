import { useLanguage } from '@/hooks/useLanguage';

interface StatProps {
  value: React.ReactNode;
  label: string;
  sub: string;
}

function Stat({ value, label, sub }: StatProps) {
  return (
    <div className="flex-1 flex flex-col items-center text-center px-4 py-1">
      <div className="text-[22px] sm:text-[24px] font-bold tracking-tight tabular-nums" style={{ color: 'var(--tx1)' }}>
        {value}
      </div>
      <p className="text-[11px] uppercase tracking-[0.14em] font-medium mt-1" style={{ color: 'var(--tx2)' }}>
        {label}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: 'var(--txf)' }}>
        {sub}
      </p>
    </div>
  );
}

export function SocialProof() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <div
      className="border-b"
      style={{ background: 'var(--sf)', borderColor: 'var(--bd)' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-lg mx-auto flex items-stretch py-5">

          <Stat
            value={164}
            label={de ? 'Bewertungen' : 'Reviews'}
            sub="5,0 · eBay"
          />

          <div className="w-px self-stretch" style={{ background: 'var(--bd)' }} />

          <Stat
            value="100%"
            label={de ? 'Positiv' : 'Positive'}
            sub={de ? 'Feedback-Score' : 'Feedback score'}
          />

          <div className="w-px self-stretch" style={{ background: 'var(--bd)' }} />

          <Stat
            value="500+"
            label={de ? 'Verkauft' : 'Sold'}
            sub={de ? 'seit 2023' : 'since 2023'}
          />

        </div>
      </div>
    </div>
  );
}
