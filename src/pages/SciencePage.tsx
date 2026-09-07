import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { removeStaticJsonLd, removeStaticHeadMeta } from '@/lib/utils';
import { Navigation } from '@/sections/navigation';
import { Footer } from '@/sections/footer';
import { ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { InstrumentFrame, CountUp } from '@/components/viz';
import { BackLink } from '@/components/BackLink';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { waxVsOil, frictionRanges, products, type Product } from '@/lib/data';
import { COMPONENTS, FAILURES, type ScienceComponent } from '@/lib/science';
import { FormulaGraph } from '@/sections/science/FormulaGraph';
import { ContactZones, LineChoice } from '@/sections/science/ContactZones';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { HexMoS2, TransferFilm } from '@/sections/science/LabViz';
import { ReadMoreLink } from '@/sections/science/ReadMoreLink';

const W = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

// ─── ToothProfileDiagram — ideal vs. worn tooth flank, schematic ─────────────
// The two cassette photos (new/worn) show that wear happens; they can't show
// WHAT wears — a photo of two similar-looking teeth doesn't read as "material
// is gone" the way a drawn contour with a shaded difference does. This is a
// simplified, single-tooth cross-section, not a measured profile: a sprocket
// tooth pointing up, ideal contour solid, worn contour dashed with the loaded
// flank (left, where chain tension pulls under load) drawn hooked/thinned —
// the textbook "shark-fin" wear pattern — and the area between the two lines
// on that flank shaded as the material loss the text above describes.
function ToothProfileDiagram({ de }: { de: boolean }) {
  const idealD = 'M14,86 L29,42 L47,10 L73,10 L91,42 L106,86';
  // Worn: right flank + tip unchanged, left (loaded) flank recedes inward
  // from mid-height down to the base — the classic hooked wear silhouette.
  const wornD = 'M22,86 L33,52 L47,10 L73,10 L91,42 L106,86';
  const lossD = 'M14,86 L29,42 L47,10 L33,52 L22,86 Z';
  return (
    <svg viewBox="0 0 120 96" className="w-full h-auto" style={{ maxWidth: 108 }} aria-hidden>
      <path d={lossD} fill="var(--accent)" opacity="0.16" />
      <path d={idealD} fill="none" stroke="var(--txf)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={wornD} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="3 2.5" strokeLinejoin="round" />
      <line x1="106" y1="86" x2="14" y2="86" stroke="var(--bd)" strokeWidth="1" />
      <line x1="6" y1="70" x2="18" y2="66" stroke="var(--accent)" strokeWidth="0.8" opacity="0.7" />
      <text x="2" y="80" fontSize="7.5" fill="var(--accent)" fontFamily="monospace">
        {de ? 'Abtrag' : 'loss'}
      </text>
    </svg>
  );
}

// ─── WearDiagramFigure — cassette photo + explanation, shared by the mobile
// and desktop hero layouts below. Mobile-Plan B6: the source photo
// (cassette-wear-full.jpg) used to have a heading, a five-line paragraph and
// both "Neue/Abgenutzte Kassette" labels baked into the pixels — at the
// ~358px mobile display width that text rendered around 6px tall: not
// selectable, not resizable with the system font size, invisible to screen
// readers (the desktop image was even marked aria-hidden, so that reader
// audience never got the explanation at all), and not indexable by Google on
// a page built specifically to rank for chain-wax search terms. The three
// photos below (cassette-new / cassette-worn) are crops of the exact same
// source with the text-and-label regions painted over in the flat
// page-background colour — nothing about the photography changed. The words
// are real HTML now. cassette-wear-diagram is a separate, newer asset (see
// below) and isn't part of that crop family.
//
// 2026-09 revision: previously the photo and the two comparison thumbnails
// below it had no visible relationship — a reader had to work out on their
// own that the small crops were "a tooth from that cassette". Now a single
// magnifier ring sits directly on one real, visible tooth of the outer
// (largest) sprocket — the sprocket that actually carries the most load —
// with a leader line down to exactly what the ring is circling: the
// new/worn crops, reused unchanged, now framed as one split lens instead of
// two separate thumbnails, next to a drawn tooth-profile schematic that
// shows what a photo alone can't: where the material actually goes.
// Coordinates are percentages of the image box, valid because the source
// (cassette-wear-diagram) is a 1:1 square asset — see naturalWidth/Height.
const LUPE_X = 9, LUPE_Y = 45;
function WearDiagramFigure({ de }: { de: boolean }) {
  return (
    <figure className="m-0">
      {/* True alpha-transparent cutout (2026-09-02), not a photo on a
          matched background colour — the previous version relied on its
          rgb(245,245,245) backdrop happening to be close to the light-mode
          page background (`var(--pg)`) to "disappear"; that broke in dark
          mode, where the same rectangle read as a stark light box with a
          hard edge. A real cutout has no background to mismatch, so it sits
          cleanly on either theme without any colour-matching trick. PNG
          fallback (not JPG) because JPG has no alpha channel — a flattened
          `cassette-wear-diagram.jpg` still exists separately for OG/social
          meta, which needs an opaque image and doesn't render on a page
          background at all. */}
      <div className="relative">
        <picture>
          <source srcSet="/images/science/cassette-wear-diagram.webp" type="image/webp" />
          <img
            src="/images/science/cassette-wear-diagram.png"
            alt={de ? 'Shimano Ultegra Kassette' : 'Shimano Ultegra cassette'}
            className="w-full h-auto"
          />
        </picture>
        {/* Magnifier ring on one real tooth of the outer sprocket + leader
            line down to the split lens below. Percent-positioned so it tracks
            the same tooth at every viewport width. */}
        <div aria-hidden className="absolute rounded-full pointer-events-none"
          style={{
            left: `${LUPE_X}%`, top: `${LUPE_Y}%`, width: '12%', aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            border: '1.5px solid var(--accent)',
            boxShadow: '0 0 0 3px var(--pg), 0 0 10px rgba(var(--accent-rgb),0.35)',
          }} />
        <svg aria-hidden className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1={LUPE_X} y1={LUPE_Y + 6} x2={LUPE_X} y2="99" stroke="var(--accent)"
            strokeWidth="0.35" strokeDasharray="1.6 1.6" opacity="0.55" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <figcaption className="mt-4">
        <p className="text-[15px] font-bold mb-1.5" style={{ color: 'var(--tx1)' }}>
          {de ? 'Verschleißprinzip' : 'Wear principle'}
        </p>
        <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: 'var(--txm)', maxWidth: '36ch' }}>
          {de
            ? 'Reibung trägt die Zahnflanke der Kassette ab — die Kette greift schlechter und verschleißt schneller.'
            : 'Friction wears down the tooth flank on the cassette — the chain grips worse and wears out faster.'}
        </p>

        {/* Split lens — same tooth the ring above is circling, new/worn side
            by side inside one circular frame instead of two square
            thumbnails. Both images are the exact crops used before
            (cassette-new / cassette-worn); the framing changed, not the
            photography. */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 rounded-full overflow-hidden"
            style={{ width: 92, height: 92, border: '1.5px solid var(--accent)', background: '#f4f4f4' }}>
            <picture>
              <source srcSet="/images/science/cassette-new.webp" type="image/webp" />
              <img src="/images/science/cassette-new.jpg" alt={de ? 'Neue Kassette' : 'New cassette'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ clipPath: 'inset(0 50% 0 0)' }} />
            </picture>
            <picture>
              <source srcSet="/images/science/cassette-worn.webp" type="image/webp" />
              <img src="/images/science/cassette-worn.jpg" alt={de ? 'Abgenutzte Kassette' : 'Worn cassette'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ clipPath: 'inset(0 0 0 50%)' }} />
            </picture>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: 1, background: 'var(--accent)', opacity: 0.6 }} />
          </div>
          <ToothProfileDiagram de={de} />
        </div>
        <div className="flex items-center gap-4 mt-2" style={{ maxWidth: 300 }}>
          <div className="flex-shrink-0 flex justify-between" style={{ width: 92 }}>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tx1)' }}>{de ? 'Neu' : 'New'}</span>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>{de ? 'Abgenutzt' : 'Worn'}</span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--txf)' }}>{de ? 'Zahnprofil' : 'Tooth profile'}</span>
        </div>
      </figcaption>
    </figure>
  );
}

// ─── Opening hero — the page's actual "hero" moment: headline stats + a large
// cassette rendering. Deliberately sober, not a dark photo stage — the page's
// whole pitch is "gemessen, nicht behauptet," so a loud hero would undercut
// its own argument. The one accent is a soft radial glow behind the cassette
// image (same technique as FormulaStory's glow further down), just enough to
// read as an entrance rather than another plain instrument panel. All numbers
// come from the same `waxVsOil` source as the homepage's why-wax section — no
// invented stats. ProblemHero below carries on with the sober toggle deep-dive.
function ScienceHero({ de }: { de: boolean }) {
  const w = waxVsOil.watts, l = waxVsOil.life;
  const pro = frictionRanges.find(r => r.id === 'pro')!;
  const oil = frictionRanges.find(r => r.id === 'oil')!;
  // Three measurements, not four — "Trocken" isn't a measurement (no unit,
  // no comparison value), it was padding out a 2x2 grid. It now lives as a
  // half-sentence in the lede below instead of posing as a fourth data
  // point. Icons dropped too: they were purely decorative next to a mono
  // numeral that already reads as data on its own, and every other
  // instrument panel on this page (FrictionBars, TempWindow, HexMoS2) makes
  // its case with numbers and labels alone, no iconography — these three
  // cards now match that language instead of being the one exception.
  const cards = [
    {
      value: `μ ${pro.muLo.toFixed(2)}–${pro.muHi.toFixed(2)}`,
      sentenceDe: `Reibung im Antrieb — Öl liegt bei μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}.`,
      sentenceEn: `Drivetrain friction — oil sits at μ ${oil.muLo.toFixed(2)}–${oil.muHi.toFixed(2)}.`,
    },
    {
      value: `${w.wax[0]}–${w.wax[1]} W`,
      sentenceDe: `Antriebsverlust — Öl braucht ${w.oil[0]}–${w.oil[1]} W bei gleicher Leistung.`,
      sentenceEn: `Drivetrain loss — oil needs ${w.oil[0]}–${w.oil[1]} W at the same power.`,
    },
    {
      value: `${l.waxLo}–${l.wax}×`,
      sentenceDe: 'Typische Kettenlebensdauer gegenüber Öl.',
      sentenceEn: 'Typical chain lifespan versus oil.',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20" style={{ background: 'var(--pg)' }}>
      {/* Soft entrance glow behind the cassette image, right side of the
          section on desktop where the photo actually sits — same radial-wash
          + blur technique as FormulaStory's glow (below), just wider and
          fainter since this sits behind a photo, not a line diagram.
          overflow-hidden on the section contains the blur so it can't bleed
          across the hairline border into ACT I below it. */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden
        style={{
          background: 'radial-gradient(ellipse 55% 60% at 78% 45%, var(--accent-wash-sm) 0%, transparent 70%)',
          filter: 'blur(32px)',
        }} />
      {/* Wider than the page's usual max-w-4xl reading column — this is the
          page's actual hero image, it needs room to be the dominant element
          next to the text, not squeezed into what's left of a narrow column. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 lg:flex lg:items-center lg:gap-12 xl:gap-20">
        <div className="max-w-lg lg:flex-shrink-0">
          <BackLink de={de} className="mb-5" />
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Direktvergleich' : 'Direct comparison'}
          </p>
          <h1 className="font-display font-bold leading-[1.02] mb-4"
            style={{ color: 'var(--tx1)', fontSize: 'clamp(2.4rem, 5.2vw, 4rem)', letterSpacing: '-0.02em' }}>
            {de ? 'Ein messbarer Unterschied.' : 'One measurable difference.'}
          </h1>
          <p className="text-lead mb-6" style={{ color: 'var(--txm)', maxWidth: '40ch' }}>
            {de
              ? 'Derselbe Antrieb, zwei Schmierstoffe — Seite an Seite gemessen. Trocken, ohne Flecken an Kleidung oder Fingern.'
              : 'Same drivetrain, two lubricants — measured side by side. Dry, no stains on clothes or fingers.'}
          </p>

          {/* Mobile/tablet: same figure, just inline above the stats instead
              of floating beside them — no room for that at this width. */}
          <div className="lg:hidden mb-6">
            <WearDiagramFigure de={de} />
          </div>

          {/* Stats — three measurements in one accent-topped row instead of a
              hairline-divided list: the row reads as one instrument readout
              (like FrictionBars/TempWindow below it) rather than a stack of
              separate facts, and num-data at almost double the previous size
              actually looks like the page's central claim instead of a list
              caption. */}
          <div className="grid grid-cols-3 mb-8" style={{ borderTop: '1px solid var(--accent-soft)' }}>
            {cards.map((c, i) => (
              <div key={i} className="pt-3.5 pr-3"
                style={{ borderLeft: i > 0 ? '1px solid var(--bd2)' : undefined, paddingLeft: i > 0 ? 14 : 0 }}>
                <p className="num-data font-bold leading-none" style={{ color: 'var(--tx1)', fontSize: 'clamp(20px, 2.6vw, 26px)' }}>
                  {c.value}
                </p>
                <p className="text-[12.5px] leading-snug mt-2" style={{ color: 'var(--tx2)' }}>
                  {de ? c.sentenceDe : c.sentenceEn}
                </p>
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
function CompCard({ c, n, de, cardRef, compact }: { c: ScienceComponent; n: number; de: boolean; cardRef?: React.Ref<HTMLDivElement>; compact?: boolean }) {
  return (
    <div ref={cardRef} id={c.id} className="scroll-mt-24 rounded-2xl border border-wx-bd overflow-hidden"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shad)', minHeight: compact ? 280 : undefined }}>
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
        {/* compact (mobile carousel): clamp to 3 lines so every card in the
            swipe deck starts at the same height regardless of how long its
            summary is — otherwise the deck visibly jumps taller/shorter as
            you swipe past e.g. MoS2's four-sentence summary vs a two-sentence
            one. Full CompCard usage (none currently) keeps the unclamped
            paragraph. */}
        <p className={`text-[14px] leading-relaxed text-wx-tx2 mt-3 max-w-prose ${compact ? 'line-clamp-3' : ''}`}>
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

        {c.id === 'mos2' && de && (
          <ReadMoreLink to="/blog/mos2-kettenwachs">
            Mehr im Ratgeber: MoS₂ im Kettenwachs
          </ReadMoreLink>
        )}
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
      {de && (
        <ReadMoreLink to="/blog/kettenwachs-winter">
          Kettenwachs im Winter, im Ratgeber
        </ReadMoreLink>
      )}
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

// BeforeAfterSlider lebt jetzt in components/BeforeAfterSlider.tsx — die
// Startseite braucht dieselbe Gegenueberstellung (siehe why-wax.tsx).

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
      {/* Bis 2026-09: hier stand eine Lede-Zeile ("Originalaufnahmen von
          Antriebskomponenten ... identischer Vergroesserung und identischen
          Aufnahmebedingungen"), die eine Herkunfts- und Vergleichsbehauptung
          traf, die fuer diese Bilder nicht zutrifft — sie sind echte
          Mikroskopieaufnahmen, aber nicht von Waxcelerate-eigenen Proben
          gemacht. Ersatzlos gestrichen statt umformuliert: die Ueberschrift
          traegt den Abschnitt allein, die Bildunterschriften sind bereits
          sachlich (siehe unten). */}

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--txm)', opacity: 0.35 }} />
          <span className="text-meta" style={{ color: 'var(--txm)' }}>
            {de ? 'Ohne Festschmierstoff' : 'Without solid lubricant'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-meta" style={{ color: 'var(--txm)' }}>
            {de ? 'Mit MoS₂-Festschmierstoff' : 'With MoS₂ solid lubricant'}
          </span>
        </div>
      </div>

      {/* Card grid — mobile keeps only 01 + 03 (chain link + tooth flank, the
          two subjects with the clearest before/after contrast); 02 + 04 stay
          hidden below sm: and appear at the tablet/desktop 2-column layout.
          Real feedback: four full-width cards was too much scrolling for too
          little new information on a narrow screen. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {MICRO.map((row) => {
          const mobileVisible = row.n === '01' || row.n === '03';
          return (
            <div key={row.n} className={`${mobileVisible ? '' : 'hidden sm:block'} rounded-2xl overflow-hidden`}
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
                beforeAlt={`${de ? row.de : row.en} – ${de ? 'ohne Festschmierstoff' : 'without solid lubricant'}`}
                afterAlt={`${de ? row.de : row.en} – ${de ? 'mit MoS₂-Festschmierstoff' : 'with MoS₂ solid lubricant'}`}
                beforeLabel={de ? 'Referenz' : 'Reference'}
                afterLabel="MoS₂"
              />
            </div>
          );
        })}
      </div>

      {/* Bildquelle statt Methodik-Behauptung — dieselbe Korrektur wie oben:
          "identische Vergroesserung/Bedingungen je Paar" war nicht belegbar. */}
      <p className="text-meta leading-relaxed mt-5" style={{ color: 'var(--txff)' }}>
        {de
          ? 'Mikroskopaufnahmen zur Veranschaulichung des Wirkprinzips — keine Aufnahmen der hier verkauften Chargen.'
          : 'Micrographs illustrating the mechanism — not photographs of the batches sold here.'}
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
  // 2026-09: the μ-value moved from a fixed right-aligned column to sitting
  // right at each bar's own end (left: pct%) — it now visually belongs to
  // the bar it measures instead of reading as a separate list of numbers
  // next to unrelated bar lengths. The oil bar gets a diagonal hatch instead
  // of a flat fill (same hatch language as TransferFilm's steel texture
  // below) to read as "reference, not a product" rather than just a paler
  // grey. Both changes replace the old explanatory footnote — the figure
  // states "shorter = worse" itself instead of needing a sentence to say so.
  return (
    <div ref={ref} id="reibung" className="scroll-mt-24 space-y-4">
      {frictionRanges.map(r => {
        const mu = `μ ${r.muLo.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}–${r.muHi.toLocaleString(de ? 'de' : 'en', { minimumFractionDigits: 2 })}`;
        return (
          <div key={r.id}>
            <div className="flex justify-between mb-1.5">
              <span className={`text-[13px] font-medium ${r.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{labels[r.id]}</span>
              <span className="num-data text-[12px]" style={{ color: r.highlight ? 'var(--tx2)' : 'var(--txff)' }}>{mu}</span>
            </div>
            {/* Bar + a small tick right where it ends, in the value's own
                colour — ties the number above to this specific point on the
                bar instead of leaving "which end is that number about" to
                the reader, without risking the number itself overlapping
                the fill (it stays in the safe right-aligned header row). */}
            <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
              <div className="h-full rounded-full"
                style={{
                  width: run ? `${r.pct}%` : '0%',
                  background: r.highlight
                    ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                    : 'repeating-linear-gradient(45deg, var(--txf) 0 3px, transparent 3px 7px)',
                  transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                }} />
            </div>
            <div className="relative h-1.5">
              <div className="absolute top-0 w-px h-1.5" aria-hidden
                style={{
                  left: run ? `${r.pct}%` : '0%', transition: 'left 1s cubic-bezier(0.22,1,0.36,1)',
                  background: r.highlight ? 'var(--accent)' : 'var(--txf)',
                }} />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between pt-1">
        <span className="text-meta" style={{ color: 'var(--txf)' }}>{de ? 'mehr Reibung' : 'more friction'}</span>
        <span className="text-meta" style={{ color: 'var(--txf)' }}>{de ? 'weniger Reibung' : 'less friction'}</span>
      </div>
    </div>
  );
}

// ─── CTA product card — the close, made of an actual product instead of a
// bare button ────────────────────────────────────────────────────────────────
// The page just walked the reader through "Zwei Feststoffe, ein Unterschied"
// (LineChoice, right above this) — Classic vs. Pro, by criteria. The closing
// card used to be a wash-box with a number, a headline and one generic button
// to "/#produkte", disconnected from the choice the reader had just made. This
// picks both options back up as real, buyable cards: photo, price, badge —
// everything from data.ts (CLAUDE.md rule: no product info hardcoded outside
// it), nothing invented for this page.
function CtaProductCard({ product, de, featured }: { product: Product; de: boolean; featured?: boolean }) {
  const price = new Intl.NumberFormat(de ? 'de-DE' : 'en-US', { style: 'currency', currency: 'EUR' }).format(product.price);
  return (
    <Link to={`/produkt/${product.id}`}
      className="group relative flex gap-4 rounded-2xl p-4 sm:p-5 transition-transform active:scale-[0.98]"
      style={{
        background: 'var(--card-bg)', boxShadow: 'var(--card-shad)',
        border: featured ? '1.5px solid var(--accent)' : '1px solid var(--bd)',
      }}>
      {product.badge && (
        <span className="absolute -top-2.5 left-4 num-data text-meta px-2 py-0.5 rounded-full"
          style={{
            background: featured ? 'var(--accent)' : 'var(--sf2)',
            color: featured ? '#fff' : 'var(--txm)',
            border: featured ? 'none' : '1px solid var(--bd2)',
          }}>
          {de ? product.badge : product.badgeEn}
        </span>
      )}
      <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 84, height: 84, background: '#f4f4f4' }}>
        <img src={product.image} alt={de ? product.title : product.titleEn}
          className="w-full h-full object-cover" style={{ objectPosition: product.imagePosition ?? 'center' }} loading="lazy" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-wx-tx1 leading-tight" style={{ fontSize: '1.05rem' }}>
          {de ? product.title : product.titleEn}
        </p>
        <p className="text-[12.5px] leading-snug mt-1 line-clamp-2" style={{ color: 'var(--txm)' }}>
          {de ? product.description : product.descriptionEn}
        </p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="num-data font-semibold text-[15px]" style={{ color: 'var(--tx1)' }}>{price}</span>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold transition-opacity group-hover:opacity-70"
            style={{ color: featured ? 'var(--accent)' : 'var(--tx1)' }}>
            {de ? 'Ansehen' : 'View'}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
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
                    {c.id === 'mos2' && de && (
                      <ReadMoreLink to="/blog/mos2-kettenwachs">
                        Mehr im Ratgeber: MoS₂ im Kettenwachs
                      </ReadMoreLink>
                    )}
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
          {/* Prev/next arrows flanking the dots — the dots alone read as a
              progress indicator, not something to click, and "Scrollen zum
              Erkunden" only ever shows on step 1 (see below), so from step 2
              on there was no visible cue that this section keeps going.
              Arrows reuse the same scrollToComponent() the dots and graph
              nodes already call — no new navigation mechanism, just another
              visible entry point into it. */}
          <div className="flex items-center gap-4">
            <button type="button"
              onClick={() => activeIdx > 0 && scrollToComponent(COMPONENTS[activeIdx - 1].id)}
              disabled={activeIdx === 0}
              aria-label={de ? 'Vorherige Komponente' : 'Previous component'}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity disabled:pointer-events-none active:scale-[0.97]"
              style={{
                color: 'var(--accent)', background: 'var(--accent-wash)',
                border: '1px solid rgba(var(--accent-rgb),0.22)',
                opacity: activeIdx === 0 ? 0.3 : 1,
              }}>
              <ArrowLeft className="h-4 w-4" />
            </button>

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

            <button type="button"
              onClick={() => activeIdx < COMPONENTS.length - 1 && scrollToComponent(COMPONENTS[activeIdx + 1].id)}
              disabled={activeIdx === COMPONENTS.length - 1}
              aria-label={de ? 'Nächste Komponente' : 'Next component'}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity disabled:pointer-events-none active:scale-[0.97]"
              style={{
                color: 'var(--accent)', background: 'var(--accent-wash)',
                border: '1px solid rgba(var(--accent-rgb),0.22)',
                opacity: activeIdx === COMPONENTS.length - 1 ? 0.3 : 1,
              }}>
              <ArrowRight className="h-4 w-4" />
            </button>
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

  // Mobile formula section: tapping a node used to scroll the page down to
  // a full stack of all 6 detail cards, always fully expanded below the
  // graph — cramped, and required scrolling to read something the graph
  // itself was already pointing at. Now a horizontal snap-carousel sits
  // directly under the (height-capped) graph, one CompCard per component:
  // swiping updates which node the graph highlights, and tapping a node
  // scrolls the carousel to match — one screen, two ways to browse the same
  // six components. Defaults to the first component so nothing is empty
  // before anyone has swiped or tapped.
  const [mobileCompId, setMobileCompId] = useState(COMPONENTS[0]?.id ?? null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Swipe -> graph focus. IntersectionObserver (not a scroll listener) so
  // this fires once per settled panel instead of on every scroll frame, and
  // reports whichever panel is most centred regardless of whether the user
  // swiped or a node-tap scrolled the carousel there itself (see
  // jumpToMobileComp below) — either way, "most visible panel" is correct.
  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;
    const obs = new IntersectionObserver((entries) => {
      const best = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const id = best?.target instanceof HTMLElement ? best.target.dataset.compId : undefined;
      if (id) setMobileCompId(prev => (prev === id ? prev : id));
    }, { root, threshold: [0.6] });
    Object.values(panelRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Graph tap -> carousel scroll. Called directly from FormulaGraph's
  // onSelect instead of via a useEffect keyed on mobileCompId — an effect
  // would also fire after the IntersectionObserver's own setMobileCompId
  // (i.e. after every swipe), re-issuing a scrollIntoView the user had
  // already just produced themselves.
  const jumpToMobileComp = (id: string) => {
    setMobileCompId(id);
    panelRefs.current[id]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

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
  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: de ? 'Startseite' : 'Home', item: 'https://waxcelerate.de' },
      { '@type': 'ListItem', position: 2, name: de ? 'Wissenschaft' : 'Science', item: 'https://waxcelerate.de/wissenschaft' },
    ],
  });
  // Selbe og:image wie die vorgerenderte /wissenschaft-Huelle
  // (scripts/generate-blog-html.mjs, STATIC_PAGES), damit Social-Vorschauen
  // vor und nach der Hydration dasselbe Bild zeigen.
  const ogImage = 'https://waxcelerate.de/images/science/cassette-wear-diagram.jpg';

  // Die vorgerenderte Huelle liefert dasselbe WebPage-Schema client-seitig
  // noch einmal ueber das TechArticle-Schema unten drunter — ohne diesen
  // Aufruf stehen nach der Hydration zwei getrennte JSON-LD-Bloecke fuer
  // dieselbe URL im DOM (siehe removeStaticJsonLd in src/lib/utils.ts).
  // Gleiches gilt fuer die title-/description-/canonical-/og-/twitter-Tags,
  // die das <Helmet> unten erneut setzt (siehe removeStaticHeadMeta).
  useEffect(() => { removeStaticJsonLd(); removeStaticHeadMeta(); }, []);

  return (
    <div className="min-h-screen bg-wx-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://waxcelerate.de/wissenschaft" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://waxcelerate.de/wissenschaft" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{pageSchema}</script>
        <script type="application/ld+json">{breadcrumbSchema}</script>
      </Helmet>

      <Navigation />

      {/* Mobile-Plan B7d: kein <main>-Landmark auf dieser Seite — "zum
          Inhalt springen" hatte nichts zum Ansteuern. */}
      <main id="main-content">
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

        {/* Mobile: graph + swipeable carousel, one screen ─────────────────
            2026-09 revision. Previously the graph sat in its own
            InstrumentFrame block, and a single CompCard for the tapped
            component sat in a SEPARATE block below it — measured at
            393px + 329px on a 375-wide device, never simultaneously
            visible on anything shorter than a 812px-tall phone, and no
            affordance signalled that the card below could change at all
            (only tapping a graph node revealed that). Now both live in one
            InstrumentFrame: the graph is height-capped (clamp 220-320px)
            so it can never push the carousel off-screen, and the carousel
            itself peeks the next card's edge so swiping reads as available
            before anyone tries it. */}
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
              overflow-x-clip (nicht overflow-x-hidden) auf dem Wrapper eine
              Ebene hoeher faengt das ab, ohne die Animation selbst
              anzufassen. hidden wuerde denselben X-Overflow zwar auch
              schneiden, stuft dabei aber laut Spec die andere Achse von
              overflow-y: visible auf auto hoch — der gekippte, nach unten
              versetzte Frame zaehlte dann schon vor seinem eigenen Reveal als
              vertikaler Overflow dieses Wrappers, und der Browser zeichnete
              genau in dem Moment eine Scrollbar. clip laesst overflow-y in
              Ruhe. */}
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
          <div className="pb-5 overflow-x-clip">
            <div className="-mx-4 sm:mx-auto sm:max-w-4xl sm:px-6 lg:px-8">
              <InstrumentFrame eyebrow={de ? 'Antippen oder wischen' : 'Tap or swipe'}>
                {/* Height-capped so the graph can never crowd the carousel
                    below it off-screen — aspect-ratio derives the matching
                    width from that height, and w-full/h-auto inside then
                    exactly fills it (FormulaGraph itself is untouched, still
                    sized by its own viewBox aspect for the desktop story). */}
                <div className="mx-auto" style={{ height: 'clamp(200px, 34vh, 300px)', aspectRatio: '520 / 490', maxWidth: '100%' }}>
                  <FormulaGraph de={de} onSelect={jumpToMobileComp} compact mobile />
                </div>
              </InstrumentFrame>
            </div>
          </div>

          {/* Snap-carousel — one CompCard per component, ~86% width so the
              next card's edge peeks in as the swipe cue. scroll-px-4 keeps
              the peeking edge readable against the page's own px-4 gutter
              instead of running edge-to-edge like the graph above it. */}
          <div ref={carouselRef}
            className="flex gap-3 overflow-x-auto px-4 pb-2"
            style={{ scrollSnapType: 'x mandatory', scrollPaddingLeft: 16 }}>
            {COMPONENTS.map((c, i) => (
              <div key={c.id}
                ref={el => { panelRefs.current[c.id] = el; }}
                data-comp-id={c.id}
                className="flex-shrink-0"
                style={{ width: '86%', maxWidth: 360, scrollSnapAlign: 'center' }}>
                <CompCard c={c} n={i + 1} de={de} compact />
              </div>
            ))}
          </div>
          {/* Position dots — mirrors the desktop story's dot pagination so
              the two experiences read as the same feature, not two
              unrelated widgets. Tapping one jumps the carousel directly
              instead of requiring three swipes. */}
          <div className="flex items-center justify-center gap-2 mt-3 pb-8">
            {COMPONENTS.map(c => (
              <button key={c.id} type="button" onClick={() => jumpToMobileComp(c.id)}
                aria-label={de ? c.nameDe : c.nameEn}
                className="rounded-full transition-all duration-300"
                style={{
                  width: mobileCompId === c.id ? 20 : 6, height: 6,
                  background: mobileCompId === c.id ? 'var(--accent)' : 'var(--bd)',
                }} />
            ))}
          </div>
        </div>

        {/* Below: full-width deep-dive sections. Mobile-Plan (real feedback,
            2026-08-19): "weniger der anderen Bilder ... eher beieinander" —
            MoS₂-Diagramm + Temperaturfenster rücken auf Mobil enger
            zusammen (gap-4 statt gap-6, MoS₂-Grafik zusätzlich schmaler
            gerahmt) statt als zwei lose Kacheln mit viel Luft dazwischen zu
            wirken; die Entwicklungs-Zeitleiste (reine Text-Historie, kein
            Beleg) entfällt auf Mobil ganz. */}
        <div className={`${W} py-14`}>
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
            <div className="max-w-[320px] mx-auto w-full sm:max-w-none">
              <HexMoS2 de={de} />
            </div>
            <div id="matrix-window" className="h-full scroll-mt-24">
              <TempWindow de={de} />
            </div>
          </div>
          <div className="hidden lg:block">
            <FailureTimeline de={de} />
          </div>
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
        {/* items-stretch (default): FrictionBars' own chart runs taller than
            TransferFilm's thin banner SVG, so items-start left a bare ~90px
            gap under the right panel — two "matched" instrument panels that
            visibly weren't. Stretching both to the row's height reads as a
            pair of same-size devices instead. */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <InstrumentFrame eyebrow={de ? 'Reibung' : 'Friction'}
            footer={
              <>
                {/* Mobile: one line instead of three tiles — the cost figure
                    alone carries the point without crowding the bars above
                    it. Desktop keeps all three (grid, sm+). */}
                <p className="sm:hidden text-center">
                  <CountUp value={`~€${waxVsOil.cost.savedEur}`} className="font-mono text-[13px] font-semibold" style={{ color: 'var(--tx1)' }} />
                  <span className="text-meta ml-1.5" style={{ color: 'var(--txf)' }}>
                    {de ? `gespart auf ${(waxVsOil.cost.km / 1000).toLocaleString('de-DE')}.000 km` : `saved over ${(waxVsOil.cost.km / 1000).toLocaleString('en-US')}k km`}
                  </span>
                </p>
                <div className="hidden sm:grid sm:grid-cols-3 gap-3 text-center">
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
              </>
            }
          >
            <FrictionBars de={de} />
          </InstrumentFrame>

          {/* Signature visual — Fe–S transfer film deposition (the payoff) */}
          <TransferFilm de={de} />
        </div>

        {de && (
          <div className="flex flex-col gap-1">
            <ReadMoreLink to="/blog/kettenlaufzeit-heisswachs">
              Vollständige Intervall- und Kostenrechnung im Ratgeber
            </ReadMoreLink>
            <ReadMoreLink to="/rechner/verschleiss">
              Oder direkt: Kettenverschleiß für deinen Antrieb berechnen
            </ReadMoreLink>
          </div>
        )}

        {/* Everything above proves zone 01 is the hardest place in the chain.
            This is the one block where that becomes a product decision, so it
            sits directly on top of the button and nowhere else. */}
        <div className="mt-16">
          <LineChoice de={de} />
        </div>

        {/* CTA — 2026-09: LineChoice directly above just sorted the reader
            between Classic and Pro by criteria; the old close was a wash-box
            with a number, a headline and one generic button to "/#produkte",
            disconnected from that choice and from what's actually being sold
            — no photo, no price. Both options now come back as real product
            cards (CtaProductCard, defined above) built entirely from
            data.ts, so the close picks up exactly where LineChoice left off
            instead of resetting to a generic pitch. */}
        <div className="text-center mb-8">
          <CountUp value={`${waxVsOil.life.waxLo}–${waxVsOil.life.wax}×`}
            className="num-display font-display font-bold leading-none inline-block mr-2 align-middle"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'var(--accent)' }} />
          <span className="text-[13px] align-middle" style={{ color: 'var(--txm)' }}>
            {de ? 'Kettenlaufzeit gegenüber Öl, gemessen in Zone 01.' : 'Chain life versus oil, measured in zone 01.'}
          </span>
          <p className="eyebrow mt-6 mb-3" style={{ color: 'var(--accent-soft)' }}>
            {de ? 'Nächster Schritt' : 'Next step'}
          </p>
          <h3 className="font-display font-bold text-wx-tx1" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {de ? 'Bereit für einen sauberen Antrieb?' : 'Ready for a clean drivetrain?'}
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {(['wax-500', 'wax-500-mos2'] as const).map(id => {
            const product = products.find(p => p.id === id)!;
            return <CtaProductCard key={id} product={product} de={de} featured={product.variant === 'pro'} />;
          })}
        </div>

        {de && (
          <p className="text-meta text-center mt-6">
            <Link to="/blog/von-oel-auf-wachs-umsteigen" className="underline underline-offset-2"
              style={{ color: 'var(--accent-soft)' }}>
              Oder zuerst: Anleitung zum Umstieg von Öl auf Wachs
            </Link>
          </p>
        )}
      </section>
      </main>

      <footer className={`${W} py-12 text-center`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <p className="text-meta mb-6" style={{ color: 'var(--txff)' }}>
          {de
            ? 'Quelle: Friction Facts / Zero Friction Cycling, „Friction-Producing Mechanisms of a Bicycle Chain“.'
            : 'Source: Friction Facts / Zero Friction Cycling, "Friction-Producing Mechanisms of a Bicycle Chain."'}
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
      </footer>

      <Footer />
    </div>
  );
}
