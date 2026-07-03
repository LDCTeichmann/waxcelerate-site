import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion, DUR, EASE } from '@/hooks/useAnimation';
import { InstrumentFrame, CountUp } from '@/components/viz';

// ─── Signature lab visualizations ─────────────────────────────────────────────
// Recovered from the pre-rebuild science page (the animated "forced-dark lab
// panels"): the MoS₂ layer-shear and the Fe–S transfer-film deposition. They run
// inside InstrumentFrame variant="lab" and fall back static under reduced motion.

const HEX_S_X  = [20, 70, 120, 170, 220, 270, 320];
const HEX_MO_X = [45, 95, 145, 195, 245, 295];

const TF_DOTS = [
  { x: 30, y: 27 }, { x: 90, y: 24 }, { x: 155, y: 27 }, { x: 220, y: 25 },
  { x: 285, y: 26 }, { x: 350, y: 24 }, { x: 415, y: 27 }, { x: 470, y: 25 },
  { x: 55, y: 65 }, { x: 120, y: 63 }, { x: 190, y: 66 }, { x: 260, y: 64 },
  { x: 325, y: 63 }, { x: 390, y: 66 }, { x: 450, y: 64 },
] as const;

// ─── MoS₂ — S–Mo–S layers shearing (hover on desktop, scroll-scrub on mobile) ─
export function HexMoS2({ de }: { de: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef  = useRef<SVGGElement>(null);
  const botRef  = useRef<SVGGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const TOP_S1 = 20, TOP_MO = 44, TOP_S2 = 68;
  const GAP_Y  = 88;
  const BOT_S1 = 108, BOT_MO = 132, BOT_S2 = 156;

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
          tl.fromTo(top, { x: 0 }, { x: 20, ease: 'none' }, 0);
          tl.fromTo(bot, { x: 0 }, { x: -20, ease: 'none' }, 0);
          if (lbl) {
            tl.fromTo(lbl, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.3);
            tl.to(lbl, { opacity: 0, ease: 'none' }, 0.7);
          }
        },
        '(min-width: 640px)': () => {
          const onEnter = () => {
            gsap.to(top, { x: 20, duration: DUR.standard, ease: EASE.enter });
            gsap.to(bot, { x: -20, duration: DUR.standard, ease: EASE.enter });
            if (lbl) gsap.to(lbl, { opacity: 1, duration: DUR.short, delay: 0.15 });
          };
          const onLeave = () => {
            gsap.to(top, { x: 0, duration: DUR.standard, ease: EASE.ui });
            gsap.to(bot, { x: 0, duration: DUR.standard, ease: EASE.ui });
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
    <InstrumentFrame
      eyebrow={de ? 'MoS₂ — S–Mo–S Schichtstruktur' : 'MoS₂ — S–Mo–S layer structure'}
      chip="< 5 µm"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <div className="w-[14px] h-[14px] rounded-full" style={{ background: 'rgba(var(--accent-rgb),0.45)' }} />
              <span className="text-[10px] font-mono" style={{ color: 'var(--txf)' }}>S</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-[20px] h-[20px] rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(var(--accent-rgb),0.35)' }} />
              <span className="text-[10px] font-mono" style={{ color: 'var(--txf)' }}>Mo</span>
            </div>
          </div>
          <div className="text-right">
            <CountUp value="μ 0.03" className="font-display italic text-[22px] font-bold leading-none" style={{ color: 'var(--accent)' }} />
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>{de ? 'Grenzschmierung' : 'Boundary lubrication'}</p>
          </div>
        </div>
      }
      innerRef={containerRef}
    >
      <div className="relative select-none cursor-default">
        <svg viewBox="0 0 360 176" className="w-full" style={{ overflow: 'visible' }}>
          <g ref={topRef}>
            {bonds(TOP_MO, TOP_S1, TOP_S2).map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(var(--accent-rgb),0.18)" strokeWidth="1.6" />
            ))}
            {HEX_S_X.map((x, i) => <circle key={`ts1${i}`} cx={x} cy={TOP_S1} r="7" fill="rgba(var(--accent-rgb),0.45)" />)}
            {HEX_MO_X.map((x, i) => <circle key={`tmo${i}`} cx={x} cy={TOP_MO} r="11" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 5px rgba(var(--accent-rgb),0.35))' }} />)}
            {HEX_S_X.map((x, i) => <circle key={`ts2${i}`} cx={x} cy={TOP_S2} r="7" fill="rgba(var(--accent-rgb),0.45)" />)}
          </g>
          <line x1="15" y1={GAP_Y} x2="310" y2={GAP_Y} stroke="rgba(var(--accent-rgb),0.22)" strokeWidth="1" strokeDasharray="6 5" />
          <text x="318" y={GAP_Y + 4} fontSize="10" fill="var(--txf)" fontFamily="monospace">vdW</text>
          <g ref={botRef}>
            {bonds(BOT_MO, BOT_S1, BOT_S2).map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(var(--accent-rgb),0.18)" strokeWidth="1.6" />
            ))}
            {HEX_S_X.map((x, i) => <circle key={`bs1${i}`} cx={x} cy={BOT_S1} r="7" fill="rgba(var(--accent-rgb),0.45)" />)}
            {HEX_MO_X.map((x, i) => <circle key={`bmo${i}`} cx={x} cy={BOT_MO} r="11" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 5px rgba(var(--accent-rgb),0.35))' }} />)}
            {HEX_S_X.map((x, i) => <circle key={`bs2${i}`} cx={x} cy={BOT_S2} r="7" fill="rgba(var(--accent-rgb),0.45)" />)}
          </g>
          <text x="5" y={TOP_S1 + 3} fontSize="10" fill="var(--txf)" fontFamily="monospace">S</text>
          <text x="5" y={TOP_MO + 4} fontSize="12" fill="var(--accent)" fontFamily="monospace" fontWeight="600">Mo</text>
          <text x="5" y={TOP_S2 + 3} fontSize="10" fill="var(--txf)" fontFamily="monospace">S</text>
          <text x="5" y={BOT_S1 + 3} fontSize="10" fill="var(--txf)" fontFamily="monospace">S</text>
          <text x="5" y={BOT_MO + 4} fontSize="12" fill="var(--accent)" fontFamily="monospace" fontWeight="600">Mo</text>
          <text x="5" y={BOT_S2 + 3} fontSize="10" fill="var(--txf)" fontFamily="monospace">S</text>
        </svg>
        <div ref={labelRef} className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: '46%', opacity: 0 }}>
          <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-md"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)', color: 'var(--accent)' }}>
            {de ? '← Schicht gleitet →' : '← layer slides →'}
          </span>
        </div>
      </div>
    </InstrumentFrame>
  );
}

// ─── Transfer film — compact cross-section schematic ─────────────────────────
export function TransferFilm({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.querySelectorAll('.tf-film').forEach(f => gsap.set(f, { scaleX: 1, opacity: 1 }));
      el.querySelectorAll('.tf-p').forEach(p => gsap.set(p, { opacity: 1 }));
      const lbl = el.querySelector('.tf-label');
      if (lbl) gsap.set(lbl, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const films = el.querySelectorAll('.tf-film');
      const dots = el.querySelectorAll('.tf-p');
      const lbl = el.querySelector('.tf-label');

      gsap.set(films, { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set(dots, { opacity: 0 });
      if (lbl) gsap.set(lbl, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
      tl.to(dots, { opacity: 1, duration: 0.5, stagger: 0.03 }, 0);
      tl.to(films, { scaleX: 1, opacity: 1, duration: 0.7, stagger: 0.08, ease: EASE.enter }, 0.25);
      if (lbl) tl.to(lbl, { opacity: 1, duration: 0.5 }, 0.6);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <InstrumentFrame
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
              <CountUp value={s.val} className="font-mono text-[13px] font-semibold" style={{ color: 'var(--tx1)' }} />
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      }
      innerRef={ref}
    >
      <svg viewBox="0 0 500 88" className="w-full h-auto">
        <defs>
          <pattern id="tf-ht" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--txm)" strokeWidth="0.4" opacity="0.07" />
          </pattern>
          <linearGradient id="tf-gt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id="tf-gb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--txm)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--txm)" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* Top steel */}
        <rect x="0" y="0" width="500" height="16" fill="url(#tf-gt)" />
        <rect x="0" y="0" width="500" height="16" fill="url(#tf-ht)" />
        <line x1="0" y1="16" x2="500" y2="16" stroke="var(--txm)" strokeWidth="0.8" opacity="0.25" />

        {/* Film top */}
        <rect className="tf-film" x="0" y="16" width="500" height="2.5"
          fill="var(--accent)" opacity="0.32" />

        {/* MoS₂ particles near top film — each tied to the film with a short
            bond line, so the "Fe–S" chemical bond in the label reads as an
            actual connection rather than just floating dots. */}
        {TF_DOTS.filter(d => d.y < 44).map((d, i) => (
          <g key={`t${i}`} className="tf-p" opacity="0.45">
            <line x1={d.x} y1={18.5} x2={d.x} y2={d.y - 2.5} stroke="var(--accent)" strokeWidth="0.8" opacity="0.5" />
            <circle cx={d.x} cy={d.y} r={3 + (i % 3) * 0.7} fill="var(--tx2)" />
          </g>
        ))}

        {/* Center label */}
        <text className="tf-label" x="250" y="47" textAnchor="middle"
          fontSize="9" fontWeight={600} fill="var(--tx2)" fontFamily="monospace" letterSpacing="1.4" opacity="0">
          Fe–S
        </text>

        {/* MoS₂ particles near bottom film */}
        {TF_DOTS.filter(d => d.y >= 44).map((d, i) => (
          <g key={`b${i}`} className="tf-p" opacity="0.45">
            <line x1={d.x} y1={69.5} x2={d.x} y2={d.y + 2.5} stroke="var(--accent)" strokeWidth="0.8" opacity="0.5" />
            <circle cx={d.x} cy={d.y} r={3 + (i % 3) * 0.7} fill="var(--tx2)" />
          </g>
        ))}

        {/* Film bottom */}
        <rect className="tf-film" x="0" y="69.5" width="500" height="2.5"
          fill="var(--accent)" opacity="0.32" />

        {/* Bottom steel */}
        <line x1="0" y1="72" x2="500" y2="72" stroke="var(--txm)" strokeWidth="0.8" opacity="0.25" />
        <rect x="0" y="72" width="500" height="16" fill="url(#tf-gb)" />
        <rect x="0" y="72" width="500" height="16" fill="url(#tf-ht)" />
      </svg>
    </InstrumentFrame>
  );
}
