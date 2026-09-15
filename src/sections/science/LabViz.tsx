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

// ─── Jede Bewegung beginnt bei null — warum ein Gelenk grenzgeschmiert laeuft ─
//
// Loest die Druckskala ab, die bis 15.09.2026 hier stand. Die trug die
// Aussage "ab 50 MPa traegt kein Fluessigfilm mehr, Grenzschmierung", und die
// gibt es nicht: Grenzschmierung folgt aus dem Verhaeltnis Filmdicke zu
// Rauheit, und die Filmdicke haengt an der EINLAUFGESCHWINDIGKEIT, nicht am
// Druck. Unter Druck steigt die Viskositaet sogar, weshalb EHD-Filme in
// Waelzlagern 1 bis 3 GPa tragen, das Zehnfache der eingezeichneten Grenze.
// Die Schwelle und der schiefe Vergleich (Reifenfuelldruck gegen
// Hydraulik-Systemdruck gegen Flaechenpressung) sind in Stufe 0 gefallen; was
// blieb, war eine Druckgrafik unter einer Bildunterschrift, die sagt, dass der
// Druck nicht der Punkt ist. Diese Figur zeigt jetzt den Punkt selbst.
//
// Der richtige Grund ist auch der staerkere und steht schon im
// Losbrech-Absatz von ContactZones: ein Gelenk dreht sich nicht durch, es
// schwenkt auf und wieder zu. Die Gleitgeschwindigkeit geht dabei zweimal je
// Zyklus durch null, und bei null baut sich kein hydrodynamischer Film auf,
// bei keinem Druck. Ein Feststofffilm muss nicht aufgebaut werden, er liegt
// schon in der Oberflaechenrauheit.
//
// Bewusst OHNE y-Achsenwerte: das ist ein Mechanismus, keine Messung. Der
// Chip sagt "schematisch", wie in ContactZones. Die Wachslinie liegt
// absichtlich UNTER den Oelspitzen — zu behaupten, der Wachsfilm sei dicker
// als ein aufgebauter Oelfilm, waere eine Aussage, die wir nicht belegen
// koennen, und die Pointe braucht sie nicht: Oel ist zeitweise dicker und
// zweimal je Zyklus gar nicht da.
//
// Voller Befund: docs/plaene/WISSENSCHAFT_REDESIGN.md, Abschnitt 2.4.

const PX0 = 6, PX1 = 314;                 // Zeichenbreite (viewBox 320)
// Vier feste Baender, damit keine Kurve je durch eine Beschriftung laeuft:
// Label 0-18, Geschwindigkeitsspur 24-64, Label 70-88, Filmspur 96-170.
const VEL_MID = 44, VEL_AMP = 20;         // Spur 1, Gleitgeschwindigkeit
const FILM_BASE = 170, OIL_AMP = 74;      // Spur 2, Filmdicke (Spitze bei y=96)
const WAX_Y = FILM_BASE - 30;             // konstanter Feststofffilm
// Phase 0,25: halbe Abwaertshalbwelle links, ganze Aufwaertshalbwelle in der
// Mitte, halbe rechts, Nulldurchgaenge bei t = 0,25 und 0,75. Damit wechselt
// die Geschwindigkeit sichtbar das Vorzeichen. Mit 0,2 lagen beide negativen
// Abschnitte angeschnitten an den Raendern und die Kurve las sich als
// Huegel statt als Umkehr.
const PHASE = 0.25;
const wave = (t: number) => Math.sin(2 * Math.PI * (t - PHASE));
const xAt = (t: number) => PX0 + t * (PX1 - PX0);
const STILL_T = [0.25, 0.75];

/** Polyline durch N Stuetzstellen, auf zwei Nachkommastellen gerundet. */
function curve(fy: (t: number) => number, n = 120) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return `${xAt(t).toFixed(2)},${fy(t).toFixed(2)}`;
  }).join(' ');
}
const VEL_PTS = curve(t => VEL_MID - VEL_AMP * wave(t));
const OIL_PTS = curve(t => FILM_BASE - OIL_AMP * Math.abs(wave(t)));

export function StandstillFilm({ de }: { de: boolean }) {
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
      eyebrow={de ? 'Jede Bewegung beginnt bei null' : 'Every movement starts from zero'}
      chip={de ? 'schematisch' : 'schematic'}
      footer={
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { val: '2–5 nm',     sub: de ? 'Filmdicke MoS₂'    : 'MoS₂ film thickness' },
            { val: 'Fe–S',       sub: de ? 'tribochem. Bindung' : 'tribochem. bond' },
            { val: '50–300 MPa', sub: de ? 'Pressung im Gelenk'  : 'Pressure in the joint' },
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
      <div className="pt-1">
        <svg viewBox="0 0 320 190" className="w-full" role="img"
          aria-label={de
            ? 'Zwei Spuren über eine Gelenkbewegung. Oben die Gleitgeschwindigkeit, die zweimal durch null geht. Unten die Filmdicke: der Ölfilm fällt an beiden Nullstellen auf null, der Wachsfilm bleibt konstant.'
            : 'Two tracks across one joint movement. Top, the sliding speed passing through zero twice. Bottom, film thickness: the oil film drops to zero at both zero crossings, the wax film stays constant.'}>
          <defs>
            {/* Oszilloskop-Sweep von links nach rechts statt Pfadlaengen-
                Animation: braucht keine gemessene Pfadlaenge und wirkt in
                einem Messgeraete-Rahmen richtiger als ein Einblenden. */}
            <clipPath id="wx-sweep">
              <rect x={PX0} y="0" width={PX1 - PX0} height="190"
                style={{
                  transform: run ? 'scaleX(1)' : 'scaleX(0)',
                  transformBox: 'fill-box', transformOrigin: 'left center',
                  transition: 'transform 1.2s cubic-bezier(0.22,1,0.36,1)',
                }} />
            </clipPath>
          </defs>

          <text x={PX0} y="13" fontSize="12" fontFamily="monospace" fill="var(--txf)">
            {de ? 'Gleitgeschwindigkeit' : 'Sliding speed'}
          </text>
          <text x={PX0} y="85" fontSize="12" fontFamily="monospace" fill="var(--txf)">
            {de ? 'Tragender Schmierfilm' : 'Load-carrying film'}
          </text>

          {/* Nulllinie der Geschwindigkeit und Grundlinie der Filmspur */}
          <line x1={PX0} y1={VEL_MID} x2={PX1} y2={VEL_MID}
            stroke="var(--bd)" strokeWidth="var(--dw-hair)" strokeDasharray="4 4" />
          <line x1={PX0} y1={FILM_BASE} x2={PX1} y2={FILM_BASE}
            stroke="var(--bd)" strokeWidth="var(--dw-hair)" />

          {/* Die beiden Stillstaende: die Aussage der Figur */}
          {STILL_T.map(t => (
            <g key={t}>
              <line x1={xAt(t)} y1={VEL_MID - VEL_AMP - 6} x2={xAt(t)} y2={FILM_BASE}
                stroke="var(--accent)" strokeWidth="var(--dw-hair)" strokeDasharray="3 3" opacity="0.55" />
              <circle cx={xAt(t)} cy={VEL_MID} r="2.6" fill="var(--accent)" />
              <text x={xAt(t)} y="186" fontSize="12" fontFamily="monospace" textAnchor="middle" fill="var(--accent-soft)">
                {de ? 'Stillstand' : 'standstill'}
              </text>
            </g>
          ))}

          <g clipPath="url(#wx-sweep)">
            <polyline points={VEL_PTS} fill="none" stroke="var(--txm)" strokeWidth="var(--dw-line)" strokeLinejoin="round" />
            {/* Oel gestrichelt und grau, wie in FrictionBars: Referenz, kein
                Produkt. Faellt an jeder Nullstelle mit auf die Grundlinie. */}
            <polyline points={OIL_PTS} fill="none" stroke="var(--txf)" strokeWidth="var(--dw-line)"
              strokeDasharray="5 4" strokeLinejoin="round" />
            <line x1={PX0} y1={WAX_Y} x2={PX1} y2={WAX_Y}
              stroke="var(--accent)" strokeWidth="var(--dw-bold)" strokeLinecap="round" />
          </g>
        </svg>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2">
          <span className="inline-flex items-center gap-2 text-meta" style={{ color: 'var(--txm)' }}>
            <svg width="20" height="4" aria-hidden><line x1="0" y1="2" x2="20" y2="2"
              stroke="var(--txf)" strokeWidth="2" strokeDasharray="5 4" /></svg>
            {de ? 'Kettenöl' : 'Chain oil'}
          </span>
          <span className="inline-flex items-center gap-2 text-meta" style={{ color: 'var(--txm)' }}>
            <svg width="20" height="4" aria-hidden><line x1="0" y1="2" x2="20" y2="2"
              stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" /></svg>
            {de ? 'Wachs mit MoS₂' : 'Wax with MoS₂'}
          </span>
          <span className="text-meta" style={{ color: 'var(--txff)' }}>
            {de ? 'eine Gelenkbewegung: auf und wieder zu' : 'one joint movement: open and shut again'}
          </span>
        </div>

        <p className="text-[12px] leading-relaxed mt-3" style={{ color: 'var(--accent-soft)', opacity: run ? 1 : 0, transition: 'opacity 0.6s ease 0.9s' }}>
          {de
            ? 'Nicht der Druck entscheidet, sondern die Bewegung. Ein Flüssigfilm entsteht erst durch Geschwindigkeit, und die geht hier zweimal je Zyklus durch null. Ein Feststofffilm muss nicht erst aufgebaut werden.'
            : 'It is the movement that decides, not the pressure. A liquid film is only generated by speed, and here speed passes through zero twice per cycle. A solid film does not have to be built up first.'}
        </p>

        <div className="pt-2 mt-4 space-y-2.5" style={{ borderTop: '1px solid var(--bd2)' }}>
          <div className="flex gap-3 pt-3">
            <span className="text-small uppercase tracking-[0.13em] flex-shrink-0 w-12" style={{ color: 'var(--txf)' }}>
              {de ? 'Öl' : 'Oil'}
            </span>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Braucht Geschwindigkeit, um einen Film aufzubauen. Am Umkehrpunkt hat er sie nicht, dort trifft Metall auf Metall.'
                : 'Needs speed to build a film. At the reversal point it has none, and there metal meets metal.'}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-small uppercase tracking-[0.13em] flex-shrink-0 w-12" style={{ color: 'var(--accent-soft)' }}>
              MoS₂
            </span>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Ist auch im Stillstand da. Die Schichten scheren ab, ein 2 bis 5 nm dünner Film bleibt und bindet chemisch (Fe–S) am Stahl.'
                : 'Is there even at a standstill. The layers shear off, a film of 2 to 5 nm remains and bonds chemically (Fe–S) to the steel.'}
            </p>
          </div>
        </div>
      </div>
    </InstrumentFrame>
  );
}
