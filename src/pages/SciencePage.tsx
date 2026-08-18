import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronsLeftRight, Gauge, Clock, Droplets, Sparkles, Hand } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/sections/navigation';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { InstrumentFrame, CountUp } from '@/components/viz';
import { BackLink } from '@/components/BackLink';
import { waxVsOil, frictionRanges } from '@/lib/data';
import { COMPONENTS, FAILURES, type ScienceComponent } from '@/lib/science';
import { FormulaGraph } from '@/sections/science/FormulaGraph';
import { ContactZones, LineChoice } from '@/sections/science/ContactZones';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { HexMoS2, TransferFilm } from '@/sections/science/LabViz';

const W = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

// ─── WearDiagramFigure — cassette photo + explanation, shared by the mobile
// and desktop hero layouts below. Mobile-Plan B6: the source photo
// (cassette-wear-full.jpg) used to have a heading, a five-line paragraph and
// both "Neue/Abgenutzte Kassette" labels baked into the pixels — at the
// ~358px mobile display width that text rendered around 6px tall: not
// selectable, not resizable with the system font size, invisible to screen
// readers (the desktop image was even marked aria-hidden, so that reader
// audience never got the explanation at all), and not indexable by Google on
// a page built specifically to rank for chain-wax search terms. The three
// photos below (cassette-wear-diagram / cassette-new / cassette-worn) are
// crops of the exact same source with the text-and-label regions painted
// over in the flat page-background colour — nothing about the photography
// changed. The words are real HTML now.
function WearDiagramFigure({ de }: { de: boolean }) {
  return (
    <figure className="m-0">
      <picture>
        <source srcSet="/images/science/cassette-wear-diagram.webp" type="image/webp" />
        <img
          src="/images/science/cassette-wear-diagram.jpg"
          alt={de ? 'Kassette mit Nahaufnahme der Zahnflanke' : 'Cassette with close-up of the tooth flank'}
          className="w-full h-auto"
        />
      </picture>
      <figcaption className="mt-4">
        <p className="text-[15px] font-bold mb-1.5" style={{ color: 'var(--tx1)' }}>
          {de ? 'Verschleißprinzip' : 'Wear principle'}
        </p>
        <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: 'var(--txm)', maxWidth: '36ch' }}>
          {de
            ? 'Durch die Reibung der Kette nutzt sich die Zahnflanke an der Kassettenspeiche ab. Die Speiche wird dünner, die Kette greift schlechter und verschleißt schneller.'
            : 'Chain friction wears down the tooth flank on the cassette sprocket. The tooth gets thinner, the chain grips worse, and it wears out faster.'}
        </p>
        {/* Beide Ausschnitte trugen bis 18.08.2026 noch die Rahmenlinie des
            Panels, aus dem sie geschnitten waren — oben eine waagerechte, rechts
            eine senkrechte Linie, die sich oben rechts zu einer abgerundeten
            Ecke trafen. Das war der "graue Uebergang" und der "Cutoff": kein
            Bildinhalt, sondern ein Rest der Quellgrafik. Die Linien sind
            weggeschnitten (Ausschnitt 326x170 aus dem alten 340x182).
            Zusaetzlich sitzt jedes Bild jetzt in einer gerundeten Platte in
            genau der Hintergrundfarbe des Fotos (gemessen: rgb(245,245,245)
            bzw. rgb(242,242,242)). Dadurch faellt die Bildkante mit einer
            gewollten Kante zusammen, statt als abgeschnittenes Foto zu wirken —
            und das funktioniert unabhaengig davon, wie hell oder dunkel die
            Seite dahinter gerade ist. */}
        <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 360 }}>
          {([
            { src: 'cassette-new', labelDe: 'Neue Kassette', labelEn: 'New cassette' },
            { src: 'cassette-worn', labelDe: 'Abgenutzte Kassette', labelEn: 'Worn cassette' },
          ] as const).map(({ src, labelDe, labelEn }) => (
            <div key={src}>
              <p className="text-[12px] font-semibold mb-1.5" style={{ color: 'var(--tx1)' }}>
                {de ? labelDe : labelEn}
              </p>
              <div className="rounded-lg overflow-hidden"
                style={{ background: '#f4f4f4', border: '1px solid var(--bd2)' }}>
                <picture>
                  <source srcSet={`/images/science/${src}.webp`} type="image/webp" />
                  <img src={`/images/science/${src}.jpg`} alt="" className="w-full h-auto block" />
                </picture>
              </div>
            </div>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

// ─── Opening hero — the page's actual "hero" moment: headline stats + a large
// cassette rendering, dark stage (matches the homepage hero's card treatment)
// so it reads as an entrance, not another instrument panel. All numbers come
// from the same `waxVsOil` source as the homepage's why-wax section — no
// invented stats. ProblemHero below carries on with the sober toggle deep-dive.
function ScienceHero({ de }: { de: boolean }) {
  const w = waxVsOil.watts, l = waxVsOil.life;
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;
  // Number + one plain-language sentence, same fix as the homepage's
  // "Messbar besser" cards — a number, a tiny caps label and an even fainter
  // detail line was three sizes fighting for attention in a tile barely
  // 220px wide. Down to two per card, and the sentence says what the number
  // means instead of just filing it under a category word.
  const cards = [
    {
      icon: Gauge,
      value: `μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)}`,
      sentenceDe: `Reibung im Antrieb — Öl liegt bei μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}.`,
      sentenceEn: `Drivetrain friction — oil sits at μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}.`,
    },
    {
      icon: Droplets,
      value: `${w.wax[0]}–${w.wax[1]} W`,
      sentenceDe: `Antriebsverlust — Öl braucht ${w.oil[0]}–${w.oil[1]} W bei gleicher Leistung.`,
      sentenceEn: `Drivetrain loss — oil needs ${w.oil[0]}–${w.oil[1]} W at the same power.`,
    },
    {
      icon: Clock,
      value: `${l.waxLo}–${l.wax}×`,
      sentenceDe: 'Typische Kettenlebensdauer gegenüber Öl.',
      sentenceEn: 'Typical chain lifespan versus oil.',
    },
    {
      icon: Sparkles,
      value: de ? 'Trocken' : 'Dry',
      sentenceDe: 'Kein Dreck, keine Flecken an Kleidung oder Fingern.',
      sentenceEn: 'No grime, no stains on clothes or fingers.',
    },
  ];

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20" style={{ background: 'var(--pg)' }}>
      {/* Wider than the page's usual max-w-4xl reading column — this is the
          page's actual hero image, it needs room to be the dominant element
          next to the text, not squeezed into what's left of a narrow column. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 lg:flex lg:items-center lg:gap-12 xl:gap-20">
        <div className="max-w-lg lg:flex-shrink-0">
          <BackLink de={de} className="mb-5" />
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
          </p>
          <h2 className="font-display font-bold leading-[1.05] mb-4"
            style={{ color: 'var(--tx1)', fontSize: 'clamp(2rem, 4.2vw, 3rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Ein messbarer Unterschied.' : 'One measurable difference.'}
          </h2>
          <p className="mb-6" style={{ color: 'var(--txm)', fontSize: 15, maxWidth: '38ch' }}>
            {de
              ? 'Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen.'
              : 'Same drivetrain, two lubricants — measured side by side.'}
          </p>

          {/* Mobile/tablet: same figure, just inline above the stats instead
              of floating beside them — no room for that at this width. */}
          <div className="lg:hidden mb-6">
            <WearDiagramFigure de={de} />
          </div>

          {/* Stats — a hairline-divided list, one row per measurement, instead
              of a 2×2 grid: at column width (~500px desktop, ~92vw mobile) a
              row gets roughly double the horizontal room a grid tile did,
              which is what actually lets the sentence sit on one or two
              lines instead of wrapping into a fourth tiny fragment. */}
          <div className="mb-8" style={{ borderTop: '1px solid var(--bd2)' }}>
            {cards.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-3.5"
                style={{ borderBottom: '1px solid var(--bd2)' }}>
                <c.icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--txf)' }} aria-hidden />
                <div className="min-w-0">
                  <p className="num-data font-bold text-[18px] leading-none" style={{ color: 'var(--tx1)' }}>
                    {c.value}
                  </p>
                  <p className="text-[13.5px] leading-snug mt-1.5" style={{ color: 'var(--tx2)' }}>
                    {de ? c.sentenceDe : c.sentenceEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-meta mb-4" style={{ color: 'var(--txff)' }}>
            {de
              ? `Reibung und Watt gemessen bei ${w.inputW[0]}–${w.inputW[1]} W Tretleistung, Laborwerte.`
              : `Friction and watts measured at ${w.inputW[0]}–${w.inputW[1]} W pedalling power, lab values.`}
          </p>

          <a href="#problem" className="inline-flex items-center gap-2 text-[13px] font-semibold transition-opacity hover:opacity-75" style={{ color: 'var(--tx1)' }}>
            {de ? 'Wie das gemessen wurde' : 'How this was measured'}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Desktop: the same figure as a normal flex sibling (not absolutely
            positioned) so it renders at its own natural size and the section
            simply grows to fit it — no fixed height to clip against, no
            letterboxing to create a visible edge. Its background
            (245,245,245) is close enough to var(--pg) that it merges into
            the page with no border or card needed. Previously this whole
            block was aria-hidden because the baked-in text made it
            meaningless to a screen reader anyway — now that the words are
            real HTML (see WearDiagramFigure above), that hid the page's only
            explanation of the wear principle from every screen reader user
            on desktop. Not hidden anymore. */}
        <div className="hidden lg:block lg:flex-1">
          <WearDiagramFigure de={de} />
        </div>
      </div>
    </section>
  );
}

// ─── Insight — accent-bar callout used inside the deep "Die Physik" tier ──────
function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mt-4 pl-1">
      <span className="w-0.5 flex-shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
      <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--tx2)' }}>{children}</p>
    </div>
  );
}

// ─── Disclosure — one collapsible tier (grid-rows 0fr→1fr) ───────────────────
function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium py-1.5 -my-1.5"
        style={{ color: 'var(--accent)' }} aria-expanded={open}>
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── ACT II — component card: editorial split layout (inspired by numbered index) ─
function CompCard({ c, n, de, cardRef }: { c: ScienceComponent; n: number; de: boolean; cardRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={cardRef} id={c.id} className="scroll-mt-24 rounded-2xl border border-wx-bd overflow-hidden"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shad)' }}>
      {/* Header band */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--bd2)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="num-data text-[12px] flex-shrink-0" style={{ color: 'var(--txf)' }}>0{n}</span>
            <div className="h-px flex-1 max-w-[32px]" style={{ background: 'var(--accent-soft)', opacity: 0.4 }} />
            <span className="text-small uppercase tracking-[0.18em] flex-shrink-0" style={{ color: 'var(--accent-soft)' }}>
              {de ? c.roleDe : c.roleEn}
            </span>
          </div>
          <span className="num-data font-semibold text-[17px] flex-shrink-0" style={{ color: 'var(--accent-soft)' }}>
            {c.metric}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <h3 className="font-display font-bold text-wx-tx1 text-[1.35rem] leading-tight tracking-[-0.01em]">
          {de ? c.nameDe : c.nameEn}
        </h3>
        <p className="text-[14px] leading-relaxed text-wx-tx2 mt-3 max-w-prose">
          {de ? c.sumDe : c.sumEn}
        </p>

        {/* Tier 2a — short rationale */}
        <Disclosure label={de ? 'Warum das zählt' : 'Why it matters'}>
          <p className="text-[13px] leading-relaxed pt-3" style={{ color: 'var(--txm)' }}>
            {de ? c.whyDe : c.whyEn}
          </p>
        </Disclosure>

        {/* Tier 2b — deep physics + diagram + insight */}
        <Disclosure label={de ? 'Die Physik' : 'The physics'}>
          <div className="pt-3 space-y-3">
            {(de ? c.physicsDe : c.physicsEn).map((p, i) => (
              <p key={i} className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>{p}</p>
            ))}
          </div>
          <ComponentDiagram which={c.diagram} de={de} />
          <Insight>{de ? c.insightDe : c.insightEn}</Insight>
        </Disclosure>
      </div>
    </div>
  );
}

// ─── ACT II — development-iteration story (compact, collapsible) ──────────────
function FailureTimeline({ de }: { de: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-12">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 font-display font-bold text-wx-tx1"
        style={{ fontSize: '1.15rem' }} aria-expanded={open}>
        {de ? 'Wie die Formel entstand' : 'How the formula evolved'}
        <ChevronDown className="h-4 w-4 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none', color: 'var(--accent)' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.45s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <ol className="mt-5 space-y-4 border-l" style={{ borderColor: 'var(--bd)' }}>
            {FAILURES.map((f, i) => (
              <li key={i} className="relative pl-5">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: f.isCurrent ? 'var(--accent)' : 'var(--bd)',
                    boxShadow: f.isCurrent ? '0 0 0 3px rgba(var(--accent-rgb),0.18)' : 'none' }} />
                <p className="text-[12px] uppercase tracking-[0.14em]"
                  style={{ color: f.isCurrent ? 'var(--accent)' : 'var(--txf)' }}>
                  {de ? f.vDe : f.vEn}
                </p>
                <p className="text-[13px] text-wx-tx2 mt-1">{de ? f.failDe : f.failEn}</p>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--accent)' }}>→ {de ? f.fixDe : f.fixEn}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── ACT II — ambient temperature operating range (Pro vs Classic comparison) ─
const AMB = { min: -10, max: 45 };
const AX = (t: number) => ((t - AMB.min) / (AMB.max - AMB.min)) * 100;
function TempWindow({ de }: { de: boolean }) {
  const ticks = [-5, 0, 10, 20, 30, 40];
  const pro     = { lo: -8, hi: 45 };
  const classic = { lo: 5,  hi: 35 };

  return (
    <InstrumentFrame eyebrow={de ? 'Einsatzbereich' : 'Operating range'}
      chip={de ? 'Außentemperatur' : 'Ambient temp.'} className="h-full">

      <div className="space-y-5">
        {/* Pro bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-meta font-semibold" style={{ color: 'var(--tx1)' }}>Pro</span>
            <span className="num-data text-meta" style={{ color: 'var(--accent-soft)' }}>−8 … 45+ °C</span>
          </div>
          <div className="relative h-3 rounded-full" style={{ background: 'var(--sf2)' }}>
            <div className="absolute inset-y-0 rounded-full"
              style={{ left: `${AX(pro.lo)}%`, right: '0%',
                background: 'linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb),0.55))',
              }} />
            {/* arrow indicating >45°C */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
              style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
                borderLeft: '6px solid var(--accent)', marginRight: -7, opacity: 0.6 }} />
          </div>
        </div>

        {/* Classic bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-meta font-semibold" style={{ color: 'var(--tx1)' }}>Classic</span>
            <span className="num-data text-meta" style={{ color: 'var(--txf)' }}>+5 … ~35 °C</span>
          </div>
          <div className="relative h-3 rounded-full" style={{ background: 'var(--sf2)' }}>
            <div className="absolute inset-y-0 rounded-full"
              style={{ left: `${AX(classic.lo)}%`, width: `${AX(classic.hi) - AX(classic.lo)}%`,
                background: 'var(--txf)',
                opacity: 0.45,
              }} />
          </div>
        </div>

        {/* Shared axis */}
        <div className="relative h-5">
          <div className="absolute left-0 right-0 top-0 h-px" style={{ background: 'var(--bd)' }} />
          {ticks.map(t => (
            <div key={t} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${AX(t)}%` }}>
              <div className="w-px h-1.5 mx-auto" style={{ background: 'var(--bd)' }} />
              <span className="num-data text-meta block mt-0.5" style={{ color: 'var(--txf)' }}>{t > 0 ? `+${t}` : t}°</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[12px] leading-relaxed mt-3" style={{ color: 'var(--txm)' }}>
        {de
          ? 'Pro deckt den gesamten Fahrradbereich ab — von Winterfahrten bei −8 °C bis Sommerhitze über 40 °C. Classic funktioniert zuverlässig von Frühling bis Herbst, stößt aber bei Frost und extremer Hitze an Grenzen.'
          : 'Pro covers the full cycling range — from winter rides at −8 °C to summer heat above 40 °C. Classic works reliably from spring to autumn but hits limits in frost and extreme heat.'}
      </p>
    </InstrumentFrame>
  );
}

// ─── Microscope comparison — real micrograph evidence ────────────────────────
const MICRO = [
  { n: '01', de: 'Kettenglied – Innenfläche', en: 'Chain link – inner surface', mag: '1 000×',
    ref: '/images/microscope/01-chain-link-inner-ref.webp',
    mos2: '/images/microscope/01-chain-link-inner-mos2.webp' },
  { n: '02', de: 'Kassettenspeiche – Verschleißkante', en: 'Cassette spoke – wear edge', mag: '2 000×',
    ref: '/images/microscope/02-sprocket-wear-edge-ref.webp',
    mos2: '/images/microscope/02-sprocket-wear-edge-mos2.webp' },
  { n: '03', de: 'Kassettenspeiche – Zahnflanke', en: 'Cassette spoke – tooth flank', mag: '2 500×',
    ref: '/images/microscope/03-sprocket-tooth-flank-ref.webp',
    mos2: '/images/microscope/03-sprocket-tooth-flank-mos2.webp' },
  { n: '04', de: 'Kettenglied – Innenfläche', en: 'Chain link – inner surface', mag: '1 000×',
    ref: '/images/microscope/04-chain-link-inner-2-ref.webp',
    mos2: '/images/microscope/04-chain-link-inner-2-mos2.webp' },
];

// Drag-to-reveal before/after — replaces a static side-by-side pair with an
// interactive one. Pointer position controls a clip-path on the "before"
// layer, so dragging left reveals more of the treated surface underneath.
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt, beforeLabel, afterLabel }: {
  beforeSrc: string; afterSrc: string; beforeAlt: string; afterAlt: string;
  beforeLabel: string; afterLabel: string;
}) {
  const [pct, setPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  // Feedback (real users, not a guess): (1) the first version of this demo
  // moved in three ~450ms hops with a 500ms transition on each — each new
  // hop interrupted the previous one before it finished, which read as a
  // rushed stutter, not a drag. (2) It also only ever played once per visit,
  // so anyone not looking at that exact card in that exact second missed it
  // for good. Fixed here: one slow, smooth two-second there-and-back sweep,
  // repeating every 6s, forever — not just once — until the first real
  // drag/tap/arrow-key, which stops it for good (once you know, the motion
  // is just noise). A drifting hand-cursor icon rides along with the handle
  // during the sweep as a second, more literal "you can grab this" signal
  // alongside the pulse on the handle itself.
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inView, setInView] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(100, Math.max(0, raw)));
  };

  // Only sweep while the card is actually on screen — no point animating a
  // hint nobody can see, and it wastes the "still going" budget before
  // someone scrolls to it.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sweepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (!inView || hasInteracted) return;
    let cancelled = false;
    const runSweep = () => {
      if (cancelled || draggingRef.current || hasInteracted) return;
      setSweeping(true);
      sweepTimersRef.current.push(setTimeout(() => { if (!draggingRef.current && !hasInteracted) setPct(28); }, 50));
      sweepTimersRef.current.push(setTimeout(() => { if (!draggingRef.current && !hasInteracted) setPct(72); }, 1050));
      sweepTimersRef.current.push(setTimeout(() => { if (!draggingRef.current && !hasInteracted) setPct(50); }, 2050));
      sweepTimersRef.current.push(setTimeout(() => setSweeping(false), 3050));
    };
    const initialDelay = setTimeout(runSweep, 800);
    // 20s, not 6s — "shouldn't move all the time" (real feedback). Frequent
    // enough that most people scrolling past will catch it once, rare enough
    // that it reads as an occasional hint, not a distraction competing with
    // reading the actual comparison.
    const iv = setInterval(runSweep, 20000);
    return () => {
      cancelled = true;
      clearTimeout(initialDelay);
      clearInterval(iv);
      sweepTimersRef.current.forEach(clearTimeout);
      sweepTimersRef.current = [];
    };
  }, [inView, hasInteracted]);

  const markInteracted = () => {
    if (!hasInteracted) setHasInteracted(true);
    setSweeping(false);
    sweepTimersRef.current.forEach(clearTimeout);
    sweepTimersRef.current = [];
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      if (clientX != null) updateFromClientX(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label={`${beforeLabel} / ${afterLabel}`}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className="relative select-none rounded-xl overflow-hidden aspect-[4/3] mx-3 mb-3"
      style={{ background: 'var(--hero-stage)', cursor: 'ew-resize', touchAction: 'none' }}
      onMouseDown={(e) => { draggingRef.current = true; markInteracted(); updateFromClientX(e.clientX); }}
      onTouchStart={(e) => { draggingRef.current = true; markInteracted(); updateFromClientX(e.touches[0].clientX); }}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        markInteracted();
        if (e.key === 'ArrowLeft') setPct(p => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setPct(p => Math.min(100, p + 5));
      }}
    >
      <img src={afterSrc} alt={afterAlt} className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)`, transition: sweeping ? 'clip-path 1s ease-in-out' : 'none' }}
      >
        <img src={beforeSrc} alt={beforeAlt} className="absolute inset-0 w-full h-full object-contain" draggable={false} />
      </div>

      {/* Hand cursor — rides along with the handle only during the automatic
          sweep, as a second and more literal "you can grab this" signal next
          to the pulsing handle. Own transition (slightly slower + a small
          vertical bob) so it visibly trails the handle instead of feeling
          welded to it, closer to how a real drag looks. */}
      <div
        aria-hidden
        className="absolute top-1/2 pointer-events-none"
        style={{
          left: `${pct}%`,
          transform: 'translate(-30%, -20%)',
          opacity: sweeping ? 1 : 0,
          transition: sweeping ? 'left 1.15s ease-in-out, opacity 0.3s ease' : 'opacity 0.3s ease',
        }}
      >
        {/* Dark backdrop circle, not just a drop-shadow on the icon — a white
            hand only reads on white against the darker half of the
            comparison. A drop-shadow alone still let it wash out over light
            micrograph areas (real feedback: "hard to see them"). Same
            any-background-contrast fix already used for the gallery's own
            page-number rail a few components up. */}
        <div className="flex items-center justify-center rounded-full"
          style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(3px)' }}>
          <Hand className="h-[18px] w-[18px]" style={{ color: '#fff' }} strokeWidth={2} />
        </div>
      </div>

      {/* Handle — idle pulse until the first real drag/tap/arrow-key,
          then it stops for good; see the comment on hasInteracted above. */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{ left: `${pct}%`, transition: sweeping ? 'left 1s ease-in-out' : 'none' }}
      >
        <div className="absolute inset-y-0" style={{ width: 1.5, left: 0, transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)' }} />
        <div
          className="absolute top-1/2 left-0 flex items-center justify-center rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-[1.15]"
          style={{
            width: 32, height: 32, background: '#fff', pointerEvents: 'auto',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            animation: hasInteracted ? 'none' : 'wx-slider-pulse 1.8s ease-in-out infinite',
          }}>
          <ChevronsLeftRight className="h-4 w-4" style={{ color: '#101013' }} strokeWidth={2.25} />
        </div>
      </div>

      {/* Labels — fade with proximity so they don't fight the handle */}
      <span className="absolute top-2 left-2 text-meta uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
        style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.35)' }}>
        {beforeLabel}
      </span>
      <span className="absolute top-2 right-2 text-meta uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
        style={{ color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.35)' }}>
        {afterLabel}
      </span>
    </div>
  );
}

function Microscope({ de }: { de: boolean }) {
  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
        {de ? 'Oberflächenanalyse' : 'Surface analysis'}
      </p>
      <h2 className="font-display font-bold text-wx-tx1 leading-tight mb-2"
        style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
        {de ? 'Unter dem Mikroskop.' : 'Under the microscope.'}
      </h2>
      <p className="text-[15px] max-w-xl mb-8" style={{ color: 'var(--txm)' }}>
        {de
          ? 'Originalaufnahmen von Antriebskomponenten — jede Gegenüberstellung bei identischer Vergrößerung und identischen Aufnahmebedingungen.'
          : 'Original micrographs of drivetrain components — each pair shot at identical magnification and conditions.'}
      </p>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--txm)', opacity: 0.35 }} />
          <span className="text-meta" style={{ color: 'var(--txm)' }}>
            {de ? 'Referenz (ohne MoS₂)' : 'Reference (no MoS₂)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-meta" style={{ color: 'var(--txm)' }}>Waxcelerate + MoS₂</span>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {MICRO.map((row) => (
          <div key={row.n} className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--bd)', boxShadow: 'var(--card-shad)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-baseline gap-2">
                <span className="num-data text-[14px] font-bold" style={{ color: 'var(--tx2)' }}>{row.n}</span>
                <span className="text-[12px]" style={{ color: 'var(--txm)' }}>{de ? row.de : row.en}</span>
              </div>
              <span className="num-data text-meta px-1.5 py-0.5 rounded-md"
                style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.10)',
                  color: 'var(--txf)' }}>
                {row.mag}
              </span>
            </div>
            {/* Drag-to-reveal — pull the handle to compare reference vs. treated surface directly */}
            <BeforeAfterSlider
              beforeSrc={row.ref}
              afterSrc={row.mos2}
              beforeAlt={`${de ? row.de : row.en} – ${de ? 'Referenz' : 'Reference'}`}
              afterAlt={`${de ? row.de : row.en} – Waxcelerate + MoS₂`}
              beforeLabel={de ? 'Referenz' : 'Reference'}
              afterLabel="Waxcelerate"
            />
          </div>
        ))}
      </div>

      {/* Methodology note */}
      <p className="text-meta leading-relaxed mt-5" style={{ color: 'var(--txff)' }}>
        {de
          ? 'Reale Oberflächenstrukturen, keine Simulationen. Referenz und Waxcelerate-Probe je Gegenüberstellung bei identischer Vergrößerung und unter identischen Bedingungen aufgenommen.'
          : 'Real surface structures, not simulations. Reference and Waxcelerate sample shot at identical magnification and conditions within each pair.'}
      </p>
    </div>
  );
}

// ─── ACT III — friction proof bars (higher bar = better; never invert) ───────
function FrictionBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(prefersReducedMotion());
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => setRun(true) });
    return () => trigger.kill();
  }, []);
  const labels: Record<string, string> = {
    pro: 'Pro', classic: 'Classic', oil: de ? 'Kettenöl' : 'Chain oil',
  };
  return (
    <div ref={ref} id="reibung" className="scroll-mt-24 space-y-4">
      {frictionRanges.map(r => (
        <div key={r.id}>
          <div className="flex justify-between mb-1.5">
            <span className={`text-[13px] font-medium ${r.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{labels[r.id]}</span>
            <span className="num-data text-[12px]" style={{ color: r.highlight ? 'var(--tx2)' : 'var(--txff)' }}>
              μ {r.muLo.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}–{r.muHi.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
            <div className="h-full rounded-full"
              style={{
                width: run ? `${r.pct}%` : '0%',
                background: r.highlight
                  ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                  : 'var(--txf)',
                transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
              }} />
          </div>
        </div>
      ))}
      <p className="text-[12px] pt-1" style={{ color: 'var(--txf)' }}>
        {de ? 'Höherer Balken = weniger Reibung (Performance-Index).' : 'Higher bar = less friction (performance index).'}
      </p>
    </div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function ActHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mb-10">
      <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>{eyebrow}</p>
      <h2 className="font-display font-bold text-wx-tx1 leading-tight"
        style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>{title}</h2>
      {lede && <p className="text-wx-txm text-lead max-w-2xl mt-4">{lede}</p>}
    </div>
  );
}

// ─── Scroll-driven formula storytelling (desktop only) ──────────────────────
function FormulaStory({ de }: { de: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // Coalesce raw scroll events (can fire many times per frame) down to one
    // layout read + state update per animation frame, and skip the setState
    // entirely when the computed index hasn't actually changed.
    let rafId: number | null = null;
    const compute = () => {
      rafId = null;
      const rect = section.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = section.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const p = Math.min(1, scrolled / maxScroll);
      const next = Math.min(COMPONENTS.length - 1, Math.floor(p * COMPONENTS.length));
      setActiveIdx(prev => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToComponent = (id: string) => {
    const idx = COMPONENTS.findIndex(c => c.id === id);
    if (idx < 0 || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const maxScroll = sectionRef.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: sectionTop + ((idx + 0.5) / COMPONENTS.length) * maxScroll, behavior: 'smooth' });
  };

  const comp = COMPONENTS[activeIdx];

  return (
    <div ref={sectionRef} className="relative" style={{ height: `${COMPONENTS.length * 60}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Ambient instrument-panel texture behind the whole scroll-story
            viewport — same dot-grid language as every other diagram on this
            page, so six long scroll-steps of mostly-empty space read as one
            deliberate "lab" surface instead of plain white void. */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{
            backgroundImage: 'radial-gradient(rgba(var(--accent-rgb),0.10) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'radial-gradient(ellipse 70% 65% at 68% 50%, black 0%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 68% 50%, black 0%, transparent 75%)',
          }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
          <div className="grid lg:grid-cols-[minmax(320px,440px)_1fr] gap-10 xl:gap-14 items-center">
            {/* LEFT — component info (crossfading) */}
            <div className="relative" style={{ minHeight: 400 }}>
              {COMPONENTS.map((c, i) => (
                <div
                  key={c.id}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{
                    opacity: i === activeIdx ? 1 : 0,
                    transform: `translateY(${i === activeIdx ? 0 : i < activeIdx ? -20 : 20}px)`,
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    pointerEvents: i === activeIdx ? 'auto' : 'none',
                  }}
                >
                  {/* Step counter */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="num-data text-[28px] font-bold leading-none" style={{ color: 'rgba(var(--accent-rgb),0.18)' }}>
                      0{i + 1}
                    </span>
                    <span className="text-small uppercase tracking-[0.18em]" style={{ color: 'var(--accent-soft)' }}>
                      {de ? c.roleDe : c.roleEn}
                    </span>
                  </div>
                  {/* Title */}
                  <h3 className="font-display font-bold text-wx-tx1 leading-[1.05] tracking-[-0.025em]"
                    style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)' }}>
                    {de ? c.nameDe : c.nameEn}
                  </h3>
                  {/* Accent line + metric */}
                  <div className="flex items-center gap-4 mt-3 mb-5">
                    <div className="h-[2px] w-10 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span className="num-data font-semibold text-[14px]" style={{ color: 'var(--accent-soft)' }}>
                      {c.metric}
                    </span>
                  </div>
                  {/* Summary */}
                  <p className="text-[15px] leading-relaxed text-wx-tx2 max-w-[38ch]">
                    {de ? c.sumDe : c.sumEn}
                  </p>
                  {/* Expandable details */}
                  <div className="mt-2">
                    <Disclosure label={de ? 'Warum das zählt' : 'Why it matters'}>
                      <p className="text-[13px] leading-relaxed pt-3" style={{ color: 'var(--txm)' }}>
                        {de ? c.whyDe : c.whyEn}
                      </p>
                    </Disclosure>
                    <Disclosure label={de ? 'Die Physik' : 'The physics'}>
                      {/* This step is pinned to a single h-screen viewport while
                          scrolling through the formula, with overflow-hidden on
                          the ancestor — unlike "Warum das zählt", the physics
                          text plus diagram plus insight routinely add up to more
                          than the space left in that viewport, and were getting
                          silently clipped at the bottom instead of shown. Scoped
                          scroll on just this panel instead of fighting the pin. */}
                      <div className="pt-3 pr-2 space-y-3 overflow-y-auto" style={{ maxHeight: '38vh' }}
                        tabIndex={0} role="region" aria-label={de ? 'Physik-Details' : 'Physics details'}>
                        {(de ? c.physicsDe : c.physicsEn).map((p, j) => (
                          <p key={j} className="text-[13px] leading-relaxed" style={{ color: 'var(--txm)' }}>{p}</p>
                        ))}
                        <ComponentDiagram which={c.diagram} de={de} />
                        <Insight>{de ? c.insightDe : c.insightEn}</Insight>
                      </div>
                    </Disclosure>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — FormulaGraph */}
            <div className="relative">
              <div className="absolute inset-0 -m-8 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 50% 45%, var(--accent-wash-sm) 0%, transparent 70%)',
                  filter: 'blur(24px)',
                }} />
              <FormulaGraph de={de} onSelect={scrollToComponent} scrollFocus={comp.node} compact />
            </div>
          </div>
        </div>

        {/* Bottom navigation — sibling of the max-w-7xl content wrapper (not
            nested inside it), so "absolute bottom-8" anchors to the sticky
            viewport's fixed h-screen height instead of the grid's own height.
            Nested inside the grid, this nav's position tracked whichever
            column was tallest — when FormulaGraph rendered taller than the
            left panel's 400px minHeight, bottom-8 landed mid-graph instead
            of below it, overlapping node labels near the bottom of the
            viewBox (e.g. Dispersant/Antioxidant). */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            {COMPONENTS.map((c, i) => (
              <button key={c.id} onClick={() => scrollToComponent(c.id)}
                aria-label={de ? c.nameDe : c.nameEn}
                className="group flex flex-col items-center gap-1.5"
              >
                <span className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? 24 : 8,
                    height: 8,
                    background: i === activeIdx ? 'var(--accent)' : i < activeIdx ? 'rgba(var(--accent-rgb),0.35)' : 'var(--bd)',
                  }}
                />
                <span className="text-meta uppercase tracking-[0.14em] transition-opacity duration-300"
                  style={{ color: 'var(--txf)', opacity: i === activeIdx ? 1 : 0 }}>
                  {de ? c.graphLabelDe : c.graphLabelEn}
                </span>
              </button>
            ))}
          </div>
          <span className="text-meta tracking-[0.12em] uppercase transition-opacity duration-700"
            style={{ color: 'var(--txf)', opacity: activeIdx === 0 ? 0.7 : 0 }}>
            {de ? 'Scrollen zum Erkunden' : 'Scroll to explore'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SciencePage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [hash]);

  const scrollToAnchor = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Mobile formula section: tapping a node used to scroll down to a full
  // stack of all 6 detail cards, always fully expanded below the graph —
  // cramped, and nothing like the desktop version's one-at-a-time scroll
  // story (FormulaStory below). This keeps the same graph and the same
  // CompCard detail, just shows exactly the one that was tapped, in place,
  // right under the animation. Defaults to the first component so the panel
  // is never empty before anyone has tapped anything.
  const [mobileCompId, setMobileCompId] = useState(COMPONENTS[0]?.id ?? null);
  const mobileComp = COMPONENTS.find(c => c.id === mobileCompId) ?? null;

  const title = de
    ? 'Die Wissenschaft hinter Heißwachs — MoS₂, Reibung & Formel | Waxcelerate'
    : 'The Science Behind Hot Wax — MoS₂, Friction & Formula | Waxcelerate';
  const description = de
    ? 'Reibungskoeffizient, MoS₂-Additiv, Kontaktdruck, Kristallstruktur: die sechs Komponenten hinter Waxcelerate Kettenwachs, gemessen statt behauptet. Entwickelt und produziert in Stuttgart.'
    : 'Friction coefficient, MoS₂ additive, contact pressure, crystal structure: the six components behind Waxcelerate chain wax, measured not claimed. Developed and made in Stuttgart, Germany.';
  const pageSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url: 'https://waxcelerate.de/wissenschaft',
    inLanguage: de ? 'de-DE' : 'en',
    about: ['Molybdändisulfid', 'MoS2', 'Kettenwachs', 'Reibungskoeffizient', 'Tribologie'],
    publisher: { '@type': 'Organization', name: 'Waxcelerate', url: 'https://waxcelerate.de' },
  });

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/wissenschaft" />
        <script type="application/ld+json">{pageSchema}</script>
      </Helmet>

      <Navigation />

      {/* Mobile-Plan B7d: kein <main>-Landmark auf dieser Seite — "zum
          Inhalt springen" hatte nichts zum Ansteuern. */}
      <main>
      <ScienceHero de={de} />

      {/* ── ACT I — THE PROBLEM ──
          Owns the #problem anchor that the hero's "Wie das gemessen wurde" link
          has always pointed at. Establishes where friction physically happens
          before ACT II explains what is in the wax, so the formula reads as an
          answer to something rather than an ingredient list. */}
      <section className={`${W} pt-20 pb-16`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <ContactZones de={de} onToFormula={() => scrollToAnchor('formel')} />
      </section>

      {/* ── ACT II — FORMULA (scroll-driven storytelling) ── */}
      <section id="formel" className="scroll-mt-24" style={{ borderTop: '1px solid var(--bd2)' }}>
        {/* Section heading */}
        <div className={`${W} pt-20 pb-8`}>
          <ActHead
            eyebrow={de ? 'Die Formel' : 'The Formula'}
            title={de ? 'Sechs Komponenten, ein System.' : 'Six components, one system.'}
            lede={de
              ? 'Jede Zutat löst ein konkretes Versagensszenario. Zusammen ergeben sie einen Film, der sauber bleibt, unter Last hält und im Winter nicht bricht.'
              : "Each ingredient solves a specific failure mode. Together they make a film that stays clean, holds under load, and doesn't crack in winter."}
          />
        </div>

        {/* Desktop: scroll-driven storytelling */}
        <div className="hidden lg:block">
          <FormulaStory de={de} />
        </div>

        {/* Mobile: stacked cards */}
        <div className="lg:hidden">
          {/* Mobile-Plan B7f: InstrumentFrame startet vor dem Scroll-Trigger
              per gsap.set() in einem rotateX(9deg)/perspective(700px)-Zustand
              (siehe InstrumentFrame.tsx) — der Karte selbst hilft ihr eigenes
              overflow-hidden dabei nichts, weil sie ihre eigene
              Rendering-Kante nicht gegen sich selbst clippen kann. Das
              erzeugt schon vor jedem Scrollen ~4px echten Dokument-Overflow
              (bestaetigt: 4px vor dem Scrollen zu #formel, 0px danach,
              sobald der Trigger feuert und transform zurueckgesetzt wird)
              und damit das iOS-Rubber-Band-Wippen beim seitlichen Wischen.
              overflow-x-hidden auf dem Wrapper eine Ebene hoeher faengt das
              ab, ohne die Animation selbst anzufassen. */}
          {/* Der Graph laeuft auf Mobil bis an die Bildschirmkanten statt in
              der Textspalte zu stehen. Die Figur ist 700x480 breit angelegt
              und wurde vorher auf die Spaltenbreite minus 2x16px Innenabstand
              der Seite minus den Innenabstand des InstrumentFrame
              heruntergerechnet — auf einem 390px-Geraet blieben davon rund
              310px, auf denen sechs beschriftete Knoten und ihre Kanten
              unterzubringen waren. Das ist die Ursache des gedraengten
              Eindrucks, nicht die Figur selbst. Der negative Aussenabstand
              hebt die Seitenpolsterung genau auf und gibt der Figur die volle
              Bildschirmbreite; ab sm: steht wieder alles wie vorher. */}
          <div className="pb-5 overflow-x-hidden">
            <div className="-mx-4 sm:mx-auto sm:max-w-4xl sm:px-6 lg:px-8">
              <InstrumentFrame eyebrow={de ? 'Antippen für Details' : 'Tap for details'}>
                {/* compact: no inline readout/transport panel here — that info
                    now lives in exactly one place, the CompCard below, instead
                    of twice. Freed-up height goes to the graph itself, which is
                    the whole point of this section. */}
                <FormulaGraph de={de} onSelect={setMobileCompId} compact />
              </InstrumentFrame>
            </div>
          </div>
          {mobileComp && (
            <div className={`${W} pb-12`}>
              <CompCard
                key={mobileComp.id}
                c={mobileComp}
                n={COMPONENTS.findIndex(c => c.id === mobileComp.id) + 1}
                de={de}
              />
            </div>
          )}
        </div>

        {/* Below: full-width deep-dive sections */}
        <div className={`${W} py-14`}>
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <HexMoS2 de={de} />
            <div id="matrix-window" className="h-full">
              <TempWindow de={de} />
            </div>
          </div>
          <FailureTimeline de={de} />
        </div>
      </section>

      {/* ── MICROSCOPE — real micrograph evidence ── */}
      <section className={`${W} pt-20 pb-16`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Microscope de={de} />
      </section>

      {/* ── ACT III — PROOF ── */}
      <section className={`${W} py-16`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <ActHead
          eyebrow={de ? 'Der Beweis' : 'The Proof'}
          title={de ? 'Gemessen, nicht behauptet.' : 'Measured, not claimed.'}
        />

        {/* Two instrument panels side by side instead of stacked — same
            content as before (Friction bars + folded-in outcome stats,
            Transfer Film), just laid out in parallel so the section doesn't
            run so tall. TransferFilm's SVG (viewBox 500×88) just renders
            shorter at half width; still reads fine. */}
        <div className="grid lg:grid-cols-2 gap-4 items-start mb-4">
          <InstrumentFrame eyebrow={de ? 'Reibung' : 'Friction'}
            footer={
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { v: '~300 km', d: de ? 'pro Rewax-Vorgang' : 'per rewax' },
                  { v: `${waxVsOil.life.waxLo}–${waxVsOil.life.wax}×`, d: de ? 'Kettenlaufzeit' : 'chain life' },
                  { v: `~€${waxVsOil.cost.savedEur}`, d: de ? `auf ${(waxVsOil.cost.km / 1000).toLocaleString('de-DE')}.000 km` : `over ${(waxVsOil.cost.km / 1000).toLocaleString('en-US')}k km` },
                ].map((s, i) => (
                  <div key={i}>
                    <CountUp value={s.v} className="font-mono text-[13px] font-semibold" style={{ color: 'var(--tx1)' }} />
                    <p className="text-meta mt-0.5" style={{ color: 'var(--txf)' }}>{s.d}</p>
                  </div>
                ))}
              </div>
            }
          >
            <FrictionBars de={de} />
          </InstrumentFrame>

          {/* Signature visual — Fe–S transfer film deposition (the payoff) */}
          <TransferFilm de={de} />
        </div>

        {/* Everything above proves zone 01 is the hardest place in the chain.
            This is the one block where that becomes a product decision, so it
            sits directly on top of the button and nowhere else. */}
        <div className="mt-16">
          <LineChoice de={de} />
        </div>

        {/* CTA */}
        <div className="rounded-2xl px-6 py-10 sm:py-12 text-center"
          style={{ background: 'var(--accent-wash-sm)', border: '1px solid rgba(var(--accent-rgb),0.12)' }}>
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Nächster Schritt' : 'Next step'}
          </p>
          <h3 className="font-display font-bold text-wx-tx1 mb-5" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {de ? 'Bereit für einen sauberen Antrieb?' : 'Ready for a clean drivetrain?'}
          </h3>
          <Link to="/#produkte"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {de ? 'Formel wählen' : 'Choose your formula'}
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </section>
      </main>

      <footer className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>
    </div>
  );
}
