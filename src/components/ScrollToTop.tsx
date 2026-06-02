import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Nach oben"
      className={`fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        background: 'var(--sf2)',
        border: '1px solid var(--bd)',
        color: 'var(--tx2)',
      }}
    >
      <ChevronUp size={18} />
    </button>
  );
}
