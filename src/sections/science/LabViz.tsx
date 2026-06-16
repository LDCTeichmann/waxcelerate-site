import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion, DUR, EASE } from '@/hooks/useAnimation';
import { InstrumentFrame, CountUp } from '@/components/viz';

// ─── Signature lab visualizations ─────────────────────────────────────────────
// Recovered from the pre-rebuild science page (the animated "forced-dark lab
// panels"): the MoS₂ layer-shear and the Fe–S transfer-film deposition. They run
// inside InstrumentFrame variant="lab" and fall back static under reduced motion.

const HEX_S_X  = [20, 70, 120, 170, 220, 270, 320];
const HEX_MO_X = [45, 95, 145, 195, 245, 295];

const TF_PARTICLES = [
  { x: 30,  y: 100, r: 7, top: true  },
  { x: 75,  y: 140, r: 6, top: false },
  { x: 120, y: 85,  r: 8, top: true  },
  { x: 165, y: 155, r: 9, top: false },
  { x: 210, y: 110, r: 7, top: true  },
  { x: 255, y: 90,  r: 8, top: false },
  { x: 300, y: 160, r: 6, top: true  },
  { x: 345, y: 120, r: 7, top: false },
  { x: 60,  y: 165, r: 6, top: false },
  { x: 140, y: 75,  r: 7, top: true  },
  { x: 280, y: 130, r: 8, top: true  },
  { x: 370, y: 95,  r: 6, top: false },
] as const;

// ─── MoS₂ — S–Mo–S layers shearing (hover on desktop, scroll-scrub on mobile) ─
export function HexMoS2({ de }: { de: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef  = useRef<SVGGElement>(null);
  const botRef  = useRef<SVGGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const TOP_S1 = 30, TOP_MO = 62, TOP_S2 = 94;
  const GAP_Y  = 125;
  const BOT_S1 = 156, BOT_MO = 188, BOT_S2 = 220;

  const bonds = (moY: number, sUp: number, sDn: number) =>
    HEX_MO_X.flatMap(mx => [
      { x1: mx, y1: moY, x2: mx - 25, y2: sUp },
      { x1: mx, y1: moY, x2: mx + 25, y2: sUp },
      { x1: mx, y1: moY, x2: mx - 25, y2: sDn },
      { x1: mx, y1: moY, x2: mx + 25, y2: sDn },
    ]);

  useEffect(() => {
    const container = containerRef.current;
    const top = topRef.current;
    const bot = botRef.current;
    const lbl = labelRef.current;
    if (!container || !top || !bot) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.matchMedia({
        '(max-width: 639px)': () => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: container, start: 'top 85%', end: 'top 35%', scrub: 0.6 },
          });
          tl.fromTo(top, { x: 0 }, { x: 26, ease: 'none' }, 0);
          tl.fromTo(bot, { x: 0 }, { x: -26, ease: 'none' }, 0);
          if (lbl) {
            tl.fromTo(lbl, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.3);
            tl.to(lbl, { opacity: 0, ease: 'none' }, 0.7);
          }
        },
        '(min-width: 640px)': () => {
          const onEnter = () => {
            gsap.to(top, { x: 26, duration: DUR.standard, ease: EASE.enter });
            gsap.to(bot, { x: -26, duration: DUR.standard, ease: EASE.enter });
            if (lbl) gsap.to(lbl, { opacity: 1, duration: DUR.short, delay: 0.15 });
          };
          const onLeave = () => {
            gsap.to(top, { x: 0, duration: DUR.standard, ease: EASE.enter });
            gsap.to(bot, { x: 0, duration: DUR.standard, ease: EASE.enter });
            if (lbl) gsap.to(lbl, { opacity: 0, duration: DUR.fast });
          };
          container.addEventListener('mouseenter', onEnter);
          container.addEventListener('mouseleave', onLeave);
          return () => {
            container.removeEventListener('mouseenter', onEnter);
            container.removeEventListener('mouseleave', onLeave);
          };
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <InstrumentFrame variant="lab"
      eyebrow={de ? 'MoS₂ — S–Mo–S Schichtstruktur' : 'MoS₂ — S–Mo–S layer structure'}
      chip="< 5 µm"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-[18px] h-[18px] rounded-full" style={{ background: 'var(--accent-soft)', opacity: 0.9 }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(168,192,244,0.65)' }}>S</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[26px] h-[26px] rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(var(--accent-soft-rgb),0.55)' }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(168,192,244,0.65)' }}>Mo</span>
            </div>
          </div>
          <div className="text-right">
            <CountUp value="μ 0.03" className="font-display italic text-[26px] font-bold leading-none" style={{ color: '#6A8AE8', textShadow: '0 0 20px rgba(var(--accent-soft-rgb),0.55)' }} />
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{de ? 'Grenzschmierung' : 'Boundary lubrication'}</p>
          </div>
        </div>
      }
      innerRef={containerRef}
    >
      <div className="relative select-none cursor-default">
        <svg viewBox="0 0 360 250" className="w-full" style={{ overflow: 'visible' }}>
          <g ref={topRef}>
            {bonds(TOP_MO, TOP_S1, TOP_S2).map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(var(--accent-rgb),0.25)" strokeWidth="2" />
            ))}
            {HEX_S_X.map((x, i) => <circle key={`ts1${i}`} cx={x} cy={TOP_S1} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
            {HEX_MO_X.map((x, i) => <circle key={`tmo${i}`} cx={x} cy={TOP_MO} r="13" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 7px rgba(var(--accent-soft-rgb),0.60))' }} />)}
            {HEX_S_X.map((x, i) => <circle key={`ts2${i}`} cx={x} cy={TOP_S2} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
          </g>
          <line x1="15" y1={GAP_Y} x2="310" y2={GAP_Y} stroke="rgba(100,140,220,0.28)" strokeWidth="1" strokeDasharray="6 5" />
          <text x="318" y={GAP_Y + 4} fontSize="11" fill="rgba(168,192,244,0.45)" fontFamily="monospace">vdW</text>
          <g ref={botRef}>
            {bonds(BOT_MO, BOT_S1, BOT_S2).map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(var(--accent-rgb),0.25)" strokeWidth="2" />
            ))}
            {HEX_S_X.map((x, i) => <circle key={`bs1${i}`} cx={x} cy={BOT_S1} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
            {HEX_MO_X.map((x, i) => <circle key={`bmo${i}`} cx={x} cy={BOT_MO} r="13" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 7px rgba(var(--accent-rgb),0.55))' }} />)}
            {HEX_S_X.map((x, i) => <circle key={`bs2${i}`} cx={x} cy={BOT_S2} r="9" fill="var(--accent-soft)" opacity="0.9" />)}
          </g>
          <text x="5" y={TOP_S1 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
          <text x="5" y={TOP_MO + 5} fontSize="13" fill="rgba(130,170,240,0.80)" fontFamily="monospace" fontWeight="600">Mo</text>
          <text x="5" y={TOP_S2 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
          <text x="5" y={BOT_S1 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
          <text x="5" y={BOT_MO + 5} fontSize="13" fill="rgba(130,170,240,0.80)" fontFamily="monospace" fontWeight="600">Mo</text>
          <text x="5" y={BOT_S2 + 4} fontSize="11" fill="rgba(168,192,244,0.55)" fontFamily="monospace">S</text>
        </svg>
        <div ref={labelRef} className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: '46%', opacity: 0 }}>
          <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-md" style={{ background: 'rgba(14,22,38,0.85)', border: '1px solid rgba(100,140,220,0.35)', color: 'rgba(130,170,240,0.80)' }}>
            {de ? '← Schicht gleitet →' : '← layer slides →'}
          </span>
        </div>
      </div>
    </InstrumentFrame>
  );
}

// ─── Transfer film — chain cross-section, 3-beat scroll-triggered timeline ────
export function TransferFilm({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const replay = () => {
    if (!tlRef.current) return;
    const container = ref.current;
    if (!container) return;
    const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
    const films = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
    const label = container.querySelector<SVGTextElement>('.tf-label');
    const arrows = Array.from(container.querySelectorAll<SVGElement>('.tf-arrow'));
    const topPlate = container.querySelector<SVGRectElement>('.tf-plate-t');
    const botPlate = container.querySelector<SVGRectElement>('.tf-plate-b');
    particles.forEach((el, i) => { const p = TF_PARTICLES[i]; gsap.set(el, { attr: { cy: p.y } }); });
    gsap.set(films, { scaleX: 0, opacity: 0 });
    if (label) gsap.set(label, { opacity: 0 });
    gsap.set(arrows, { opacity: 0 });
    if (topPlate) gsap.set(topPlate, { attr: { y: 0 } });
    if (botPlate) gsap.set(botPlate, { attr: { y: 200 } });
    tlRef.current.restart();
  };

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (prefersReducedMotion()) {
      const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
      const films = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
      const label = container.querySelector<SVGTextElement>('.tf-label');
      particles.forEach((el, i) => {
        const p = TF_PARTICLES[i];
        gsap.set(el, { attr: { cy: p.top ? 38 + p.r : 192 - p.r } });
      });
      gsap.set(films, { scaleX: 1, opacity: 0.92 });
      if (label) gsap.set(label, { opacity: 1 });
      setHasPlayed(true);
      return;
    }

    const ctx = gsap.context(() => {
      const particles = Array.from(container.querySelectorAll<SVGCircleElement>('.tf-p'));
      const films     = Array.from(container.querySelectorAll<SVGRectElement>('.tf-film'));
      const label     = container.querySelector<SVGTextElement>('.tf-label');
      const arrows    = Array.from(container.querySelectorAll<SVGElement>('.tf-arrow'));
      const topPlate  = container.querySelector<SVGRectElement>('.tf-plate-t');
      const botPlate  = container.querySelector<SVGRectElement>('.tf-plate-b');

      gsap.set(films, { scaleX: 0, transformOrigin: '50% 50%' });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 88%', once: true },
        onComplete: () => setHasPlayed(true),
      });
      tlRef.current = tl;

      if (topPlate) tl.fromTo(topPlate, { attr: { y: -4 } }, { attr: { y: 0 }, duration: DUR.standard, ease: EASE.enter }, 0);
      if (botPlate) tl.fromTo(botPlate, { attr: { y: 204 } }, { attr: { y: 200 }, duration: DUR.standard, ease: EASE.enter }, 0);
      tl.to(arrows, { opacity: 1, duration: DUR.short, stagger: 0.06, ease: EASE.enter }, 0.15);

      particles.forEach((el, i) => {
        const p = TF_PARTICLES[i];
        tl.to(el, { attr: { cy: p.top ? 38 + p.r : 192 - p.r }, duration: 1.2, ease: 'power3.inOut' }, 0.4 + i * 0.04);
      });

      tl.to(films, { scaleX: 1, opacity: 0.92, duration: DUR.long, stagger: 0.12, ease: EASE.enter }, 1.2);
      if (label) tl.to(label, { opacity: 1, duration: DUR.standard }, 1.8);
      tl.to(arrows, { opacity: 0, duration: DUR.short }, 1.4);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <InstrumentFrame variant="lab"
      eyebrow={de ? 'Transferfilm unter Kontaktdruck' : 'Transfer film under contact pressure'}
      chip="Fe–S"
      footer={
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { val: '50–300 MPa', sub: de ? 'Kontaktdruck' : 'Contact pressure' },
            { val: '2–5 nm',     sub: de ? 'Filmdicke'    : 'Film thickness'   },
            { val: 'Fe–S',       sub: de ? 'tribochem. Bindung' : 'tribochem. bond' },
          ].map((s, i) => (
            <div key={i}>
              <CountUp value={s.val} className="font-mono text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }} />
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      }
      innerRef={ref}
    >
      <div className="relative">
        <svg viewBox="0 0 400 230" className="w-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="tf-steel-t" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2e3e" />
              <stop offset="100%" stopColor="#1c2030" />
            </linearGradient>
            <linearGradient id="tf-steel-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c2030" />
              <stop offset="100%" stopColor="#2a2e3e" />
            </linearGradient>
            <pattern id="tf-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(130,170,240,0.12)" strokeWidth="1" />
            </pattern>
            <filter id="tf-film-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect className="tf-plate-t" x="0" y="0" width="400" height="30" fill="url(#tf-steel-t)" rx="3" />
          <rect x="0" y="0" width="400" height="30" fill="url(#tf-hatch)" rx="3" />
          <text x="12" y="20" fontSize="11" fill="rgba(168,192,244,0.40)" fontFamily="monospace">{de ? 'Stahl' : 'Steel'}</text>
          <rect className="tf-plate-b" x="0" y="200" width="400" height="30" fill="url(#tf-steel-b)" rx="3" />
          <rect x="0" y="200" width="400" height="30" fill="url(#tf-hatch)" rx="3" />
          <text x="12" y="220" fontSize="11" fill="rgba(168,192,244,0.40)" fontFamily="monospace">{de ? 'Stahl' : 'Steel'}</text>
          <g className="tf-arrow" opacity="0">
            <line x1="200" y1="-8" x2="200" y2="8" stroke="rgba(168,192,244,0.50)" strokeWidth="1.5" />
            <text x="200" y="-14" textAnchor="middle" fontSize="10" fill="rgba(168,192,244,0.55)" fontFamily="monospace">50–300 MPa</text>
          </g>
          <g className="tf-arrow" opacity="0">
            <line x1="200" y1="238" x2="200" y2="222" stroke="rgba(168,192,244,0.50)" strokeWidth="1.5" />
          </g>
          <rect className="tf-film" x="0" y="30" width="400" height="8" fill="var(--accent)" opacity="0" rx="2" filter="url(#tf-film-glow)" />
          <rect className="tf-film" x="0" y="192" width="400" height="8" fill="var(--accent)" opacity="0" rx="2" filter="url(#tf-film-glow)" />
          {TF_PARTICLES.map((p, i) => (
            <circle key={i} className="tf-p" cx={p.x} cy={p.y} r={p.r} fill="var(--accent)" opacity="0.85" />
          ))}
          <text className="tf-label" x="200" y="48" textAnchor="middle" fontSize="11" fill="rgba(106,138,232,0.9)" fontFamily="monospace" letterSpacing="1.5" opacity="0">
            {de ? 'Fe-S Transferfilm' : 'Fe-S transfer film'}
          </text>
        </svg>
        {hasPlayed && (
          <button
            onClick={replay}
            aria-label={de ? 'Animation wiederholen' : 'Replay animation'}
            className="absolute top-0 right-0 p-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{
              background: 'rgba(var(--accent-soft-rgb),0.18)',
              border: '1px solid rgba(var(--accent-soft-rgb),0.30)',
              color: 'rgba(168,192,244,0.80)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </InstrumentFrame>
  );
}
