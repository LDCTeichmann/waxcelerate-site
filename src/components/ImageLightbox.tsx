import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function ImageLightbox({ images, activeIndex, onClose, onChange }: ImageLightboxProps) {
  const savedOverflow = useRef<string>('');
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    savedOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = savedOverflow.current;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChange((activeIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onChange((activeIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, images.length, onClose, onChange]);

  const onPrev = () => onChange((activeIndex - 1 + images.length) % images.length);
  const onNext = () => onChange((activeIndex + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) delta < 0 ? onNext() : onPrev();
      }}
    >
      {/* Content — stop propagation so clicking image doesn't close */}
      <div
        className="relative flex flex-col items-center gap-4"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[activeIndex]}
          alt=""
          style={{
            maxHeight: '85vh',
            maxWidth: '90vw',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />

        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onChange(i)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: i === activeIndex ? '2px solid white' : '2px solid rgba(255,255,255,0.2)',
                  opacity: i === activeIndex ? 1 : 0.5,
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onPrev(); }}
            style={{
              position: 'fixed',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNext(); }}
            style={{
              position: 'fixed',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
