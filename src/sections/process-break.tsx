import { useLanguage } from '@/hooks/useLanguage';

export function ProcessBreak() {
  const { lang } = useLanguage();
  const de = lang === 'de';

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '52vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Background: the wax-dipping process — the actual craft */}
      <img
        src="/images/process-dip.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 40%' }}
      />
      {/* Dark overlay — lets a hint of the image breathe through */}
      <div className="absolute inset-0" style={{ background: 'rgba(5,6,8,0.83)' }} />

      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0" style={{ height: '1px', background: 'var(--bd)' }} />
      {/* Bottom hairline */}
      <div className="absolute bottom-0 inset-x-0" style={{ height: '1px', background: 'var(--bd)' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto py-20">
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.36em',
            color: 'rgba(255,255,255,0.28)',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          {de ? 'Stuttgart · seit 2022' : 'Stuttgart · since 2022'}
        </p>
        <p
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(1.7rem, 4vw, 3rem)',
            color: '#F5F5F5',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {de
            ? 'Nicht jede Charge war sofort richtig.\nAber jede war näher dran.'
            : 'Not every batch was right straight away.\nBut each one was closer.'}
        </p>
      </div>
    </section>
  );
}
