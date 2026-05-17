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
      const duration = 1100;
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

const Divider = () => (
  <div className="block w-px h-4 self-center" style={{ background: 'var(--bd)' }} />
);

export function SocialProof() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <section
      className="border-b py-4"
      style={{ background: 'var(--sf3)', borderColor: 'var(--bd2)' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5">

          {/* Stars + count */}
          <div className="flex items-center gap-2">
            <span
              className="text-[15px] leading-none"
              style={{ color: '#FBBF24', letterSpacing: '0.05em' }}
              role="img"
              aria-label={de ? '5 von 5 Sternen' : '5 out of 5 stars'}
            >
              ★★★★★
            </span>
            <span className="text-sm font-bold text-wx-tx1 tabular-nums">
              <AnimatedCount end={154} />
            </span>
            <span className="text-sm text-wx-tx2">
              {de ? 'Bewertungen' : 'Reviews'}
            </span>
          </div>

          <Divider />

          {/* 100% positive */}
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: '#22c55e' }}
            />
            <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>100%</span>
            <span className="text-sm text-wx-tx2">{de ? 'positiv' : 'positive'}</span>
          </div>

          <Divider />

          {/* Sold */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-wx-tx1 tabular-nums">
              <AnimatedCount end={500} />+
            </span>
            <span className="text-sm text-wx-tx2">
              {de ? 'Artikel verkauft' : 'items sold'}
            </span>
          </div>

          <Divider />

          {/* Location */}
          <div className="flex items-center gap-2">
            <span className="text-wx-txf text-sm">📦</span>
            <span className="text-sm text-wx-tx2">
              {de ? 'Versand aus Stuttgart' : 'Ships from Stuttgart'}
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
