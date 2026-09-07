import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion, DUR, EASE } from '@/hooks/useAnimation';
import { InstrumentFrame, CountUp } from '@/components/viz';

// ─── Signature lab visualizations ─────────────────────────────────────────────
// Recovered from the pre-rebuild science page (the animated "forced-dark lab
// panels"): the MoS₂ layer-shear and the Fe–S transfer-film deposition. They run
// inside InstrumentFrame variant="lab" and fall back static under reduced motion.

const HEX_S_X  = [20, 70, 120, 170, 220, 270, 320];
const HEX_MO_X = [45, 95, 145, 195, 245, 295];

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
              <span className="text-meta font-mono" style={{ color: 'var(--txf)' }}>S</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-[20px] h-[20px] rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(var(--accent-rgb),0.35)' }} />
              <span className="text-meta font-mono" style={{ color: 'var(--txf)' }}>Mo</span>
            </div>
          </div>
          <div className="text-right">
            <CountUp value="μ 0.03" className="font-display italic text-[22px] font-bold leading-none" style={{ color: 'var(--accent)' }} />
            <p className="text-meta mt-0.5" style={{ color: 'var(--txf)' }}>{de ? 'Grenzschmierung' : 'Boundary lubrication'}</p>
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
          <span className="text-meta font-mono tracking-wider px-2.5 py-1 rounded-md"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)', color: 'var(--accent)' }}>
            {de ? '← Schicht gleitet →' : '← layer slides →'}
          </span>
        </div>
      </div>
    </InstrumentFrame>
  );
}

// ─── Contact-pressure scale — replaces the old cross-section schematic ───────
// The previous version drew two grey steel bands, two accent film lines and a
// scatter of dots labelled "Fe-S" in the middle — without the paragraph next
// to it (which this InstrumentFrame doesn't have; it sits alone in the ACT III
// grid), there was no way to tell what was steel, what was film, what the
// dots were, or why "Fe-S" sat unexplained in the centre. It illustrated the
// mechanism but never stated the one number that actually proves oil can't
// compete here: the pressure itself. This replaces it with that number,
// placed on a log scale against two pressures people already have an
// intuition for.
interface PressureRow {
  labelDe: string; labelEn: string; lo: number; hi: number; valueLabel: string; highlight: boolean;
}
const PRESSURE_ROWS: PressureRow[] = [
  { labelDe: 'Fahrradreifen', labelEn: 'Bicycle tyre', lo: 0.25, hi: 0.25, valueLabel: '0,25 MPa', highlight: false },
  { labelDe: 'Hydraulikpresse', labelEn: 'Hydraulic press', lo: 30, hi: 30, valueLabel: '30 MPa', highlight: false },
  { labelDe: 'Kettengelenk', labelEn: 'Chain joint', lo: 50, hi: 300, valueLabel: '50–300 MPa', highlight: true },
];

// log10 scale, domain 0.1-1000 MPa (4 decades) so the tyre's 0.25 MPa is
// still a visible sliver instead of vanishing next to 300 MPa on a linear
// axis — the entire point is that these are different ORDERS of magnitude.
const LOG_MIN = -1, LOG_MAX = 3;
const toPct = (mpa: number) => ((Math.log10(mpa) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
// Where boundary lubrication starts — the chain joint's own lower bound. The
// dashed threshold line is drawn at exactly this position, not a separately
// invented number, so it reads as "this is where the chain's own range
// begins" rather than an unrelated reference mark.
const THRESHOLD_PCT = toPct(50);

export function TransferFilm({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => setRun(true) });
    return () => trigger.kill();
  }, []);

  return (
    <InstrumentFrame
      eyebrow={de ? 'Warum Öl hier aufgibt' : 'Why oil gives up here'}
      chip="50–300 MPa"
      footer={
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { val: '50–300 MPa', sub: de ? 'Kontaktdruck' : 'Contact pressure' },
            { val: '2–5 nm',     sub: de ? 'Filmdicke'    : 'Film thickness'   },
            { val: 'Fe–S',       sub: de ? 'tribochem. Bindung' : 'tribochem. bond' },
          ].map((s, i) => (
            <div key={i}>
              <CountUp value={s.val} className="font-mono text-[13px] font-semibold" style={{ color: 'var(--tx1)' }} />
              <p className="text-meta mt-0.5" style={{ color: 'var(--txf)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      }
      innerRef={ref}
    >
      <div className="space-y-4 pt-1">
        {PRESSURE_ROWS.map(row => {
          const startPct = toPct(row.lo);
          const endPct = toPct(row.hi);
          return (
            <div key={row.labelDe}>
              <div className="flex justify-between mb-1.5">
                <span className={`text-[13px] font-medium ${row.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>
                  {de ? row.labelDe : row.labelEn}
                </span>
                <span className="num-data text-[12px]" style={{ color: row.highlight ? 'var(--tx2)' : 'var(--txff)' }}>
                  {row.valueLabel}
                </span>
              </div>
              <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                {/* Threshold tick — drawn inside EACH row's own bar track
                    (not spanning all three via one cross-row overlay, which
                    needs fragile pixel math against space-y gaps + variable
                    row heights). Same horizontal position in every track
                    still reads as one continuous line across the group, at
                    far less risk of drifting out of alignment. */}
                <div className="absolute inset-y-0 pointer-events-none" aria-hidden
                  style={{ left: `${THRESHOLD_PCT}%`, borderLeft: '1.5px dashed var(--accent)', opacity: run ? 0.5 : 0, transition: 'opacity 0.6s ease 0.8s' }} />
                <div className="absolute inset-y-0 rounded-full"
                  style={{
                    left: run ? `${startPct}%` : '0%',
                    width: run ? `${Math.max(endPct - startPct, 1.5)}%` : '0%',
                    background: row.highlight
                      ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                      : 'var(--txf)',
                    transition: 'left 1s cubic-bezier(0.22,1,0.36,1), width 1s cubic-bezier(0.22,1,0.36,1)',
                  }} />
              </div>
            </div>
          );
        })}
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--accent-soft)', opacity: run ? 1 : 0, transition: 'opacity 0.6s ease 0.9s' }}>
          {de
            ? 'Gestrichelt: ab 50 MPa trägt kein Flüssigfilm mehr — Grenzschmierung.'
            : 'Dashed: above 50 MPa no liquid film holds up any more — boundary lubrication.'}
        </p>

        {/* The payoff — what actually happens to each lubricant at that
            pressure, in words, instead of leaving the reader to infer it
            from a diagram. */}
        <div className="pt-2 space-y-2.5" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="flex gap-3 pt-3">
            <span className="text-small uppercase tracking-[0.13em] flex-shrink-0 w-12" style={{ color: 'var(--txf)' }}>
              {de ? 'Öl' : 'Oil'}
            </span>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Der Flüssigfilm wird herausgedrückt — Metall trifft auf Metall.'
                : 'The liquid film gets squeezed out — metal meets metal.'}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-small uppercase tracking-[0.13em] flex-shrink-0 w-12" style={{ color: 'var(--accent-soft)' }}>
              MoS₂
            </span>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Die Schichten scheren stattdessen ab — ein 2–5 nm Film bleibt und bindet chemisch (Fe–S) am Stahl.'
                : 'The layers shear instead — a 2–5 nm film remains and chemically bonds (Fe–S) to the steel.'}
            </p>
          </div>
        </div>
      </div>
    </InstrumentFrame>
  );
}
