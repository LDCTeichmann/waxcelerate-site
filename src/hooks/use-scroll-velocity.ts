import { useState, useEffect, useRef } from 'react';

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;
      
      rafId.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const timeDelta = currentTime - lastTime.current;
        
        if (timeDelta > 0) {
          const scrollDelta = currentScrollY - lastScrollY.current;
          const newVelocity = Math.abs(scrollDelta / timeDelta) * 100;
          
          setVelocity(Math.min(newVelocity, 10));
          setDirection(scrollDelta > 0 ? 'down' : 'up');
          
          lastScrollY.current = currentScrollY;
          lastTime.current = currentTime;
        }
        
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { velocity, direction };
}
