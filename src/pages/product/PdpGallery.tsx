import { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// PDP v6, Schritt 2 — ein Bild zur Zeit, durchklickbar, ohne Text im Bild
// ══════════════════════════════════════════════════════════════
// Ersetzt den bisherigen 2x2-Bildraster (`.wxp-gallery`) auf Wachs- und
// Kettenseiten. Eine Buehne, ein Bild sichtbar, Pfeile/Thumbnails/Punkte/
// Tastatur wechseln. `.wxp-gallery`/`.wxp-gcount` bleiben unveraendert fuer
// Starter-Set und Zubehoerseiten (SetHero/AccessoryHero nutzen sie weiter).
export function PdpGallery({ images, de, onOpen }: {
  images: { src: string; alt: string }[];
  de: boolean;
  onOpen: (i: number) => void;
}) {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const goTo = useCallback((i: number) => {
    const el = stageRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: i * w, behavior: 'smooth' });
    setActive(i);
  }, []);

  const onScroll = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    setActive(Math.round(el.scrollLeft / w));
  }, []);

  const prev = () => goTo((active - 1 + total) % total);
  const next = () => goTo((active + 1) % total);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (total <= 1) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  };

  if (total === 0) return null;

  return (
    <div className="wxp-pg">
      <div className="wxp-pg-stage" ref={stageRef} onScroll={onScroll} onKeyDown={onKeyDown}
        role="group" aria-roledescription="carousel" aria-label={de ? 'Bilder' : 'Images'} tabIndex={0}>
        {images.map((img, i) => (
          <button key={img.src + i} type="button" className="wxp-pg-slide" onClick={() => onOpen(i)}
            aria-label={`${de ? 'Bild' : 'Image'} ${i + 1} ${de ? 'von' : 'of'} ${total} — ${de ? 'vergrößern' : 'enlarge'}`}>
            <img src={img.src} alt={img.alt}
              loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined}
              decoding="async" draggable={false} className={i === 0 ? undefined : 'photo-neutral'} />
          </button>
        ))}
      </div>

      {total > 1 && (
        <>
          <button type="button" onClick={prev} aria-label={de ? 'Vorheriges Bild' : 'Previous image'}
            className="wxp-pg-arrow left">
            <ChevronLeft className="wxp-ico" />
          </button>
          <button type="button" onClick={next} aria-label={de ? 'Nächstes Bild' : 'Next image'}
            className="wxp-pg-arrow right">
            <ChevronRight className="wxp-ico" />
          </button>
        </>
      )}

      {total > 1 && (
        <div className="wxp-pg-thumbs">
          {images.map((img, i) => (
            <button key={img.src + i} type="button" className="wxp-pg-thumb" aria-current={i === active}
              onClick={() => goTo(i)} aria-label={`${de ? 'Bild' : 'Image'} ${i + 1}`}>
              <img src={img.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {total > 1 && (
        <div className="wxp-pg-dots" aria-hidden>
          {images.map((_, i) => <span key={i} className={i === active ? 'on' : undefined} />)}
        </div>
      )}
    </div>
  );
}
