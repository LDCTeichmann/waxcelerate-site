import { useRef, useCallback } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
}

export function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    el.style.setProperty('--pos', `${pct}%`);
  }, []);

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp   = () => { isDragging.current = false; };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) updatePosition(e.clientX);
  }, [updatePosition]);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden cursor-ew-resize select-none"
      style={{ ['--pos' as string]: '50%' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      {/* After image (full) */}
      <div className="absolute inset-0">
        <img src={afterImage} alt="After" className="w-full h-full object-cover" draggable={false} />
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/70 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">
          <span className="text-white text-xs sm:text-sm font-medium">{afterLabel}</span>
        </div>
      </div>

      {/* Before image (clipped via CSS var) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}
      >
        <img src={beforeImage} alt="Before" className="w-full h-full object-cover" draggable={false} />
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/70 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">
          <span className="text-white text-xs sm:text-sm font-medium">{beforeLabel}</span>
        </div>
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white"
        style={{ left: 'var(--pos)', transform: 'translateX(-50%)' }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      </div>

      {/* Instruction label */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:top-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
        <span className="text-white text-[11px] sm:text-xs whitespace-nowrap">Ziehen zum Vergleichen</span>
      </div>
    </div>
  );
}
