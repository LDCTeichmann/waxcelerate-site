import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[55] pointer-events-none h-[2px]">
      <div
        style={{
          transform: `scaleX(${progress})`,
          transformOrigin: 'left',
          willChange: 'transform',
          background: '#1A3C6E',
          height: '100%',
        }}
      />
    </div>
  );
}
