import { forwardRef, type ReactNode } from 'react';

interface SectionProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

// One outer column for every section on the page. Sections may narrow their
// own content for readability (max-w-2xl, max-w-3xl, ...) but must never
// re-center that narrower content with its own mx-auto — that's what made
// the left edge of every section heading land at a different x position
// while scrolling past section boundaries. Nest narrower content directly;
// it stays left-aligned by default since block elements start at the flow
// start of their parent.
export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section({ id, className = '', style, children }, ref) {
    // py-14 on mobile, not py-20: 80px of padding top and bottom is a desktop
    // rhythm value. Across ~10 homepage sections it adds up to roughly 1600px
    // of empty scrolling on a phone. 56px still reads as a clear section break
    // at that width.
    return (
      <section id={id} ref={ref} className={`relative py-14 sm:py-28 ${className}`} style={style}>
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-20">
          {children}
        </div>
      </section>
    );
  },
);

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}

// Eyebrow + h2 + optional lead paragraph, always left-aligned — the same
// header shape everywhere so scrolling past a section boundary doesn't also
// shift where the reader's eye has to land.
export function SectionHeader({ eyebrow, title, lead, className = '' }: SectionHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="section-title mb-4">{title}</h2>
      {lead && <p className="text-wx-txm max-w-xl text-[15px] leading-relaxed">{lead}</p>}
    </div>
  );
}
