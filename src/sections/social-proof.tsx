import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

function AnimatedCount({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frameId = 0;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let startTime = 0;
      const duration = 1000;
      const tick = (ts: number) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        setCount(Math.floor(p * end));
        if (p < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(frameId); };
  }, [end]);

  return <span ref={ref}>{count}</span>;
}

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
            value={<><AnimatedCount end={164} /></>}
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
            value={<><AnimatedCount end={500} />+</>}
            label={de ? 'Verkauft' : 'Sold'}
            sub={de ? 'seit 2023' : 'since 2023'}
          />

        </div>
      </div>
    </div>
  );
}
