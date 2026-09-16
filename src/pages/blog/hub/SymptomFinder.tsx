import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { sprocketPath } from '@/components/tools/sketches';
import { symptoms } from '../hubContent';
import type { DrivePart, Symptom, SymptomId } from '../hubContent';
import { headingId } from '../headingId';
import { prefersReducedMotion } from './searchHelpers';

// ── Geometrie ───────────────────────────────────────────────────────────────
//
// Antriebsseite, das Rad faehrt nach rechts: Kettenblatt rechts, Kassette und
// Schaltwerk links. Bis 09/2026 stand die Grafik spiegelverkehrt, die Kette
// lief ohne S-Schleife senkrecht durchs Schaltwerk.
//
// Die Kettenlinie ist aus echten Kreistangenten gerechnet. Laufrichtung: der
// Zugtrum oben zieht zum Kettenblatt, die Kette verlaesst es unten, laeuft
// zurueck zur unteren Schaltrolle, umschlingt sie hinten, legt sich vorn um die
// obere Rolle (die S-Schleife) und hinten um das Ritzel. Radien aus der
// Zaehnezahl im selben Massstab wie die Teilung, deshalb sitzen die Bolzen in
// den Zahnluecken.

/** Ausschnitt der Zeichnung: eng um den Antrieb, damit er die Karte fuellt. */
const VX = 84;
const VY = 6;
const VW = 432;
const VH = 300;
/** Teilung (12,7 mm) in Zeicheneinheiten. */
const P = 7.6;
/** Kettengeschwindigkeit in Einheiten/s: ruhig, das Ritzel dreht in ~6 s einmal. */
const SPEED = 22;

type Pt = { x: number; y: number };
/** dir 1 = im Uhrzeigersinn (Bildschirm, y nach unten), -1 = dagegen. */
type Wheel = { x: number; y: number; n: number; r: number; dir: 1 | -1 };

const wheel = (x: number, y: number, n: number, dir: 1 | -1): Wheel => ({ x, y, n, r: (n * P) / (2 * Math.PI), dir });

const COG = wheel(150, 146, 17, 1);
const RING = wheel(412, 188, 50, 1);
// Die Rollen haengen knapp hinter der Achse, wie am echten Schaltwerk. Weiter
// vorn gesetzt lief die Kette schraeg unter dem Ritzel durch nach hinten.
const LOWER = wheel(126, 258, 11, 1);
const UPPER = wheel(142, 196, 11, -1);
/** In Laufrichtung der Kette. */
const LOOP = [COG, RING, LOWER, UPPER];

/**
 * Tangente von Rad a nach Rad b, passend zu beiden Drehrichtungen: gleiche
 * Richtung ergibt die aeussere, entgegengesetzte die gekreuzte Tangente.
 * Mit vorzeichenbehafteten Radien gilt (B − A)·n = ra − rb; von den zwei
 * Loesungen passt die, bei der die Kette an a in Laufrichtung abgeht.
 */
function tangent(a: Wheel, b: Wheel): [Pt, Pt] {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
  const ra = a.dir * a.r, rb = b.dir * b.r;
  let best: [Pt, Pt] = [a, b];
  for (const sgn of [1, -1]) {
    const phi = th + sgn * Math.acos((ra - rb) / d);
    const nx = Math.cos(phi), ny = Math.sin(phi);
    const pa = { x: a.x + ra * nx, y: a.y + ra * ny };
    const pb = { x: b.x + rb * nx, y: b.y + rb * ny };
    const ux = (pa.x - a.x) / a.r, uy = (pa.y - a.y) / a.r;
    if (a.dir * (-uy * (pb.x - pa.x) + ux * (pb.y - pa.y)) > 0) best = [pa, pb];
  }
  return best;
}

type Seg =
  | { kind: 'line'; from: Pt; to: Pt; len: number; start: number }
  | { kind: 'arc'; w: Wheel; a0: number; sweep: number; len: number; start: number; to: Pt };

function buildLoop() {
  const tans = LOOP.map((w, i) => tangent(w, LOOP[(i + 1) % LOOP.length]));
  const segs: Seg[] = [];
  let s = 0;
  tans.forEach(([from, to], i) => {
    const line = Math.hypot(to.x - from.x, to.y - from.y);
    segs.push({ kind: 'line', from, to, len: line, start: s });
    s += line;
    const w = LOOP[(i + 1) % LOOP.length];
    const out = tans[(i + 1) % LOOP.length][0];
    const a0 = Math.atan2(to.y - w.y, to.x - w.x);
    const a1 = Math.atan2(out.y - w.y, out.x - w.x);
    let sweep = w.dir * (a1 - a0);
    sweep = ((sweep % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    segs.push({ kind: 'arc', w, a0, sweep, len: sweep * w.r, start: s, to: out });
    s += sweep * w.r;
  });
  return { segs, L: s };
}

const { segs: SEGS, L } = buildLoop();

/** Punkt auf der Kettenbahn nach Bogenlaenge. */
function at(s0: number): Pt {
  const s = ((s0 % L) + L) % L;
  for (const g of SEGS) {
    if (s > g.start + g.len) continue;
    const k = s - g.start;
    if (g.kind === 'line') {
      const f = g.len ? k / g.len : 0;
      return { x: g.from.x + (g.to.x - g.from.x) * f, y: g.from.y + (g.to.y - g.from.y) * f };
    }
    const a = g.a0 + g.w.dir * (k / g.w.r);
    return { x: g.w.x + g.w.r * Math.cos(a), y: g.w.y + g.w.r * Math.sin(a) };
  }
  return (SEGS[0] as Extract<Seg, { kind: 'line' }>).from;
}

const f2 = (n: number) => n.toFixed(2);

/** Die ganze Kettenbahn als ein Pfad, fuer den Leuchtstreifen unter der Kette. */
const LOOP_PATH = SEGS.map((g, i) => {
  if (g.kind === 'line') return `${i ? 'L' : 'M'}${f2(g.from.x)},${f2(g.from.y)} L${f2(g.to.x)},${f2(g.to.y)}`;
  return `A${f2(g.w.r)},${f2(g.w.r)} 0 ${g.sweep > Math.PI ? 1 : 0} ${g.w.dir === 1 ? 1 : 0} ${f2(g.to.x)},${f2(g.to.y)}`;
}).join(' ') + ' Z';

/** Anfang des Bogens auf Rad w, fuer die Zahnphase. */
const arcOf = (w: Wheel) => SEGS.find((g): g is Extract<Seg, { kind: 'arc' }> => g.kind === 'arc' && g.w === w)!;
const lineNo = (i: number) => SEGS.filter((g) => g.kind === 'line')[i];
const onLine = (i: number, k: number) => at(lineNo(i).start + lineNo(i).len * k);
const onArc = (w: Wheel, k: number) => at(arcOf(w).start + arcOf(w).len * k);

/** Markierung je Symptom: dort, wo man es am Rad bemerkt. */
const SPOTS: Record<SymptomId, Pt> = {
  quietscht: onLine(0, 0.42),
  blaettert: onArc(RING, 0.5),
  pulver: onLine(1, 0.6),
  rost: onLine(1, 0.24),
  schaltung: { x: (UPPER.x + LOWER.x) / 2 + 20, y: (UPPER.y + LOWER.y) / 2 },
  verschleiss: onArc(COG, 0.62),
};

// Glieder: gerade Anzahl, gleichmaessig auf die Bahn verteilt.
const N = 2 * Math.round(L / (2 * P));
const PP = L / N;

function useChainOffset(ref: React.RefObject<Element | null>) {
  const [o, setO] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    let raf = 0, last = 0, visible = false;
    const tick = (now: number) => {
      if (last) setO((v) => (v + ((now - last) / 1000) * SPEED) % (L * 1000));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) { visible = true; last = 0; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [ref]);
  return o;
}

/** Zahnphase: dieselbe Bogenlaenge, die die Bolzen auf diesem Rad zurueckgelegt haben. */
const phaseOf = (w: Wheel, o: number) => arcOf(w).a0 + (w.dir * (o - arcOf(w).start)) / w.r;

/**
 * Seitenansicht des Antriebs als technische Zeichnung, im Material der
 * Rechner-Grafiken (--metal-*, --chain-*, sprocketPath aus sketches.tsx).
 * `focus` hebt die Bauteile hervor, an denen die Ursache sitzt, der Rest tritt
 * zurueck.
 */
function Drivetrain({ focus }: { focus: DrivePart[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const o = useChainOffset(ref);
  const on = (p: DrivePart) => focus.includes(p);
  const dim = (p: DrivePart): React.CSSProperties => ({ opacity: on(p) ? 1 : 0.4, transition: 'opacity 300ms ease' });
  const glow = (w: Wheel, extra = 0) => (
    <circle cx={w.x} cy={w.y} r={w.r + 0.32 * P + extra} fill="none" stroke="var(--accent)" strokeOpacity={0.28} strokeWidth={P * 1.6} />
  );

  // Glieder als Sehnen zwischen den Bolzen, Innen- und Aussenglieder im Wechsel.
  let inner = '', outer = '', pins = '';
  const pr = 0.17 * P;
  const pts = Array.from({ length: N }, (_, k) => at(o + k * PP));
  pts.forEach((a, k) => {
    const b = pts[(k + 1) % N];
    const seg = `M${f2(a.x)},${f2(a.y)} L${f2(b.x)},${f2(b.y)} `;
    if (k % 2) outer += seg; else inner += seg;
    pins += `M${f2(a.x - pr)},${f2(a.y)} a${f2(pr)},${f2(pr)} 0 1 0 ${f2(2 * pr)},0 a${f2(pr)},${f2(pr)} 0 1 0 ${f2(-2 * pr)},0 `;
  });

  const ringPhase = phaseOf(RING, o);
  const cogPhase = phaseOf(COG, o);
  const inR = RING.r - 0.9 * P - 5; // Fenster im Kettenblatt
  const spider = [0, 1, 2, 3].map((j) => {
    const a = ringPhase + (j * Math.PI) / 2;
    return `M${RING.x},${RING.y} L${f2(RING.x + (inR + 1) * Math.cos(a))},${f2(RING.y + (inR + 1) * Math.sin(a))}`;
  }).join(' ');
  const ringWindow = `M${RING.x + inR},${RING.y} A${inR},${inR} 0 1 0 ${RING.x - inR},${RING.y} A${inR},${inR} 0 1 0 ${RING.x + inR},${RING.y} Z`;
  // Kurbel: faehrt mit dem Kettenblatt, Pedal bleibt waagerecht.
  const crankA = ringPhase + 2.1;
  const pedal = { x: RING.x + 82 * Math.cos(crankA), y: RING.y + 82 * Math.sin(crankA) };
  const tube = (d: string, w: number) => (
    <>
      <path d={d} stroke="var(--metal-edge)" strokeOpacity={0.25} strokeWidth={w + 1.4} strokeLinecap="round" />
      <path d={d} stroke="var(--metal-lo)" strokeWidth={w} strokeLinecap="round" />
    </>
  );

  return (
    <svg ref={ref} viewBox={`${VX} ${VY} ${VW} ${VH}`} className="w-full h-auto block" role="img"
      aria-label="Seitenansicht eines Fahrradantriebs: Kassette und Schaltwerk links, Kettenblatt mit Kurbel rechts, die Kette läuft oben zum Kettenblatt.">
      <defs>
        <linearGradient id="sf-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--metal-hi)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--metal-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--metal-lo)' }} />
        </linearGradient>
      </defs>

      {/* Rahmen, zurueckgenommen: Sitzstrebe, Sitzrohr, Unterrohr, Kettenstrebe */}
      <g opacity={0.55}>
        {tube(`M${COG.x},${COG.y} L352,14`, 9)}
        {tube(`M${RING.x},${RING.y} L356,0`, 15)}
        {tube(`M${RING.x},${RING.y} L${VX + VW + 10},52`, 17)}
        {tube(`M${COG.x},${COG.y} L${RING.x},${RING.y}`, 11)}
      </g>

      {/* Kassette: groessere Ritzel dahinter, das 17er mit der Kette davor */}
      <g style={dim('cassette')}>
        {on('cassette') && glow(wheel(COG.x, COG.y, 32, 1), 2)}
        {[32, 28, 24, 21].map((n) => (
          <path key={n} d={sprocketPath(COG.x, COG.y, n, (n * P) / (2 * Math.PI), P, cogPhase)}
            fill="var(--metal-lo)" stroke="var(--metal-edge)" strokeOpacity={0.45} strokeWidth={0.7} strokeLinejoin="round" />
        ))}
        <path d={sprocketPath(COG.x, COG.y, COG.n, COG.r, P, cogPhase)} fill="url(#sf-steel)" stroke="var(--metal-edge)" strokeWidth={0.8} strokeLinejoin="round" />
        <circle cx={COG.x} cy={COG.y} r={8} fill="url(#sf-steel)" stroke="var(--metal-edge)" strokeWidth={0.8} />
        <circle cx={COG.x} cy={COG.y} r={2} fill="var(--metal-edge)" />
      </g>

      {/* Kettenblatt mit Fenster und Spider, dreht mit */}
      <g style={dim('ring')}>
        {on('ring') && glow(RING)}
        <path d={`${sprocketPath(RING.x, RING.y, RING.n, RING.r, P, ringPhase)} ${ringWindow}`} fillRule="evenodd"
          fill="url(#sf-steel)" stroke="var(--metal-edge)" strokeWidth={0.8} strokeLinejoin="round" />
        <path d={spider} stroke="var(--metal-edge)" strokeOpacity={0.5} strokeWidth={9.5} strokeLinecap="round" />
        <path d={spider} stroke="var(--metal-mid)" strokeWidth={8} strokeLinecap="round" />
      </g>

      {/* Schaltwerk: Aufhaengung am Ausfallende, Parallelogramm, innere Kaefigplatte */}
      <g style={dim('derailleur')}>
        {tube(`M${COG.x + 2},${COG.y + 10} L${COG.x + 26},${COG.y + 26} L${UPPER.x + 4},${UPPER.y - 2}`, 11)}
        <path d={`M${UPPER.x},${UPPER.y} L${LOWER.x},${LOWER.y}`} stroke="var(--metal-deep)" strokeOpacity={0.5} strokeWidth={UPPER.r * 2 + 8} strokeLinecap="round" />
      </g>

      {/* Kette */}
      <g style={dim('chain')}>
        {on('chain') && <path d={LOOP_PATH} fill="none" stroke="var(--accent)" strokeOpacity={0.22} strokeWidth={P * 2.2} strokeLinejoin="round" />}
        <path d={inner} stroke="var(--chain-inner)" strokeWidth={P * 0.62} fill="none" />
        <path d={outer} stroke="var(--chain-outer)" strokeWidth={P * 0.8} strokeLinecap="round" fill="none" />
        <path d={pins} fill="var(--chain-pin)" />
      </g>

      {/* Schaltrollen und aeussere Kaefigplatte liegen vor der Kette */}
      <g style={dim('derailleur')}>
        {on('derailleur') && <path d={`M${UPPER.x},${UPPER.y} L${LOWER.x},${LOWER.y}`} stroke="var(--accent)" strokeOpacity={0.28} strokeWidth={UPPER.r * 2 + 18} strokeLinecap="round" />}
        {[UPPER, LOWER].map((w, i) => (
          <g key={i}>
            <path d={sprocketPath(w.x, w.y, w.n, w.r, P, phaseOf(w, o))} fill="url(#sf-steel)" fillOpacity={0.6} stroke="var(--metal-edge)" strokeOpacity={0.6} strokeWidth={0.7} />
            <circle cx={w.x} cy={w.y} r={3.2} fill="var(--metal-mid)" stroke="var(--metal-edge)" strokeWidth={0.8} />
          </g>
        ))}
        <path d={`M${UPPER.x},${UPPER.y} L${LOWER.x},${LOWER.y}`} stroke="var(--metal-edge)" strokeOpacity={0.35} strokeWidth={UPPER.r * 2 - 6} strokeLinecap="round" fill="none" />
        <path d={`M${UPPER.x},${UPPER.y} L${LOWER.x},${LOWER.y}`} stroke="var(--metal-mid)" strokeOpacity={0.55} strokeWidth={UPPER.r * 2 - 8} strokeLinecap="round" fill="none" />
        {[UPPER, LOWER].map((w, i) => <circle key={i} cx={w.x} cy={w.y} r={2.4} fill="var(--metal-edge)" />)}
      </g>

      {/* Kurbel und Pedal vor allem, sie sitzen aussen */}
      <g style={dim('ring')}>
        {tube(`M${RING.x},${RING.y} L${f2(pedal.x)},${f2(pedal.y)}`, 12)}
        <rect x={pedal.x - 22} y={pedal.y - 5} width={44} height={10} rx={4} fill="var(--metal-mid)" stroke="var(--metal-edge)" strokeOpacity={0.6} strokeWidth={0.8} />
        <circle cx={RING.x} cy={RING.y} r={11} fill="url(#sf-steel)" stroke="var(--metal-edge)" strokeWidth={0.9} />
        <circle cx={RING.x} cy={RING.y} r={2.4} fill="var(--metal-edge)" />
      </g>
    </svg>
  );
}

function Hotspot({ symptom, index, active, pulse, onSelect }: {
  symptom: Symptom; index: number; active: boolean; pulse: boolean; onSelect: () => void;
}) {
  const spot = SPOTS[symptom.id];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${symptom.label} (${symptom.where})`}
      className="absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center rounded-full"
      style={{ left: `${((spot.x - VX) / VW) * 100}%`, top: `${((spot.y - VY) / VH) * 100}%` }}
    >
      {pulse && !active && (
        <span
          className="absolute inset-1.5 rounded-full animate-ping motion-reduce:hidden"
          style={{ background: 'rgba(var(--accent-rgb),0.3)', animationDuration: '2.4s', animationDelay: `${index * 0.4}s` }}
          aria-hidden
        />
      )}
      <span
        className="relative h-7 w-7 rounded-full inline-flex items-center justify-center font-mono text-[12px] font-semibold transition-transform duration-200"
        style={
          active
            ? { background: 'var(--accent)', color: 'var(--pg)', transform: 'scale(1.15)', boxShadow: '0 0 0 5px rgba(var(--accent-rgb),0.22)' }
            : { background: 'var(--sf)', color: 'var(--accent)', border: '2px solid var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }
        }
      >
        {index + 1}
      </span>
    </button>
  );
}

/**
 * Symptom-Wegweiser: "Was ist los mit deiner Kette?"
 *
 * Wer mit einem Problem kommt, kennt das Symptom, nicht den Fachbegriff und
 * schon gar nicht den Artikeltitel. Deshalb, wie bei iFixit und der Park-Tool-
 * Reparaturhilfe, der Einstieg ueber das, was man am Rad sieht oder hoert. Die
 * Markierung sitzt dort, wo man es merkt; aufleuchten die Bauteile, an denen
 * die Ursache sitzt. Das ist nicht immer dieselbe Stelle (Schaltung).
 */
export function SymptomFinder() {
  const [activeId, setActiveId] = useState<SymptomId>(symptoms[0].id);
  const [touched, setTouched] = useState(false);
  const active = symptoms.find((s) => s.id === activeId) ?? symptoms[0];
  const select = (id: SymptomId) => { setActiveId(id); setTouched(true); };

  return (
    <section aria-labelledby="symptome-titel" className="mb-20">
      <div className="max-w-xl mb-8">
        <p className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>Etwas stimmt nicht?</p>
        <h2 id="symptome-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1] mb-3">
          Was ist los mit deiner Kette?
        </h2>
        <p className="text-[15px] leading-[1.7] text-wx-txm">
          Tipp auf die Stelle, an der es hakt. Du bekommst die wahrscheinlichste
          Ursache, die schnelle Lösung und den Abschnitt, der es genau erklärt.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] items-stretch">
        {/* min-w-0: sonst dehnt die einzeilige Chip-Zeile die Grid-Spalte
            auf ihre volle Breite, und die Grafik waechst mit. */}
        <div className="min-w-0 rounded-3xl p-4 sm:p-7 flex flex-col" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
          <div className="relative">
            <Drivetrain focus={active.focus} />
            {symptoms.map((s, i) => (
              <Hotspot key={s.id} symptom={s} index={i} active={s.id === activeId} pulse={!touched} onSelect={() => select(s.id)} />
            ))}
          </div>
          {/* Mobil eine wischbare Zeile statt vier umbrochener Zeilen. */}
          <div className="mt-4 sm:mt-5 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {symptoms.map((s, i) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => select(s.id)}
                  aria-pressed={isActive}
                  className="shrink-0 whitespace-nowrap text-[13px] px-3 py-2 rounded-full transition-colors inline-flex items-center gap-2"
                  style={
                    isActive
                      ? { background: 'var(--accent)', color: 'var(--pg)' }
                      : { border: '1px solid var(--bd)', color: 'var(--txm)' }
                  }
                >
                  <span className="font-mono text-[12px] opacity-80">{i + 1}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={active.id}
          className="rounded-3xl p-7 sm:p-9 flex flex-col"
          style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
          aria-live="polite"
        >
          <h3 className="font-display text-[26px] font-bold text-wx-tx1 leading-tight mb-5">{active.label}</h3>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px] leading-snug pb-5 mb-5" style={{ borderBottom: '1px solid var(--bd2)' }}>
            <dt className="text-wx-txf">Wo du es merkst</dt>
            <dd className="text-wx-tx1 font-medium">{active.where}</dd>
            <dt className="text-wx-txf">Wo die Ursache sitzt</dt>
            <dd className="font-medium" style={{ color: 'var(--accent)' }}>{active.causeAt}</dd>
          </dl>

          <p className="eyebrow mb-2" style={{ color: 'var(--accent)' }}>Wahrscheinliche Ursache</p>
          <p className="text-[15px] leading-[1.7] text-wx-tx2 mb-6">{active.cause}</p>

          <div className="rounded-2xl px-5 py-4 mb-7" style={{ background: 'var(--accent-wash)', borderLeft: '3px solid var(--accent)' }}>
            <p className="eyebrow mb-1.5" style={{ color: 'var(--accent)' }}>Schnelle Lösung</p>
            <p className="text-[15px] leading-[1.65] text-wx-tx1">{active.fix}</p>
          </div>

          <Link
            to={`/blog/${active.slug}#${headingId(active.heading)}`}
            className="mt-auto inline-flex items-center gap-2 py-2 -my-2 text-[14px] font-semibold w-fit"
            style={{ color: 'var(--accent)' }}
          >
            Im Artikel genau nachlesen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
