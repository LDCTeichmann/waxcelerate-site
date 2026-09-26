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
import { waxVsOil, products, type Product } from '@/lib/data';
import { COMPONENTS, EDGES, FAILURES, FORMULA_STORY } from '@/lib/science';
import { Journey, ChainringHero } from '@/sections/science/journey/Journey';
import { NANO, type NanoKey } from '@/sections/science/journey/NanoScenes';
import { LineChoice } from '@/sections/science/ContactZones';
import '@/pages/product/wax/wax.css';
import { ComponentDiagram } from '@/sections/science/diagrams';
import { CassetteLens } from '@/sections/science/CassetteLens';
import { StandstillFilm } from '@/sections/science/LabViz';
import { ReadMoreLink } from '@/sections/science/ReadMoreLink';
import { ProofInstrument } from '@/sections/science/ProofInstrument';
import { CalcTrace } from '@/components/tools/CalcTrace';

const W = 'wx-frame';

// ─── Hero ───────────────────────────────────────────────────────────────────
// 27.09.2026: dunkel wie der Rest der Seite. Rechts dieselbe Welt wie die
// Formel-Reise (gezeichnetes Kettenblatt nach ISO 606, Kette laeuft ruhig,
// Linse auf ein Gelenk im Schnitt), damit der Hero Bild 0 der Reise ist und
// kein Foto davor. Das Kassettenfoto mit Lupe bleibt als Variante erhalten:
// HERO_VARIANT auf 'cassette' stellen, sonst aendert sich nichts.
// Zahlen nur aus `waxVsOil` (data.ts), wie auf der Startseite.
const HERO_VARIANT: 'chainring' | 'cassette' = 'chainring';

function ScienceHero({ de }: { de: boolean }) {
  const w = waxVsOil.watts, l = waxVsOil.life;
  const cards = [
    {
      value: `${w.wax[0]}–${w.wax[1]} W`,
      label: de ? 'Reibungsverlust in der Kette' : 'Friction loss in the chain',
      sub: de ? `Öl: ${w.oil[0]}–${w.oil[1]} W bei gleicher Leistung` : `Oil: ${w.oil[0]}–${w.oil[1]} W at the same power`,
    },
    {
      value: `${l.waxLo}–${l.wax}×`,
      label: de ? 'Kettenlaufzeit' : 'Chain life',
      sub: de ? 'typisch, gegenüber Öl' : 'typical, versus oil',
    },
  ];
  return (
    <section className="sci-hero">
      <div className="sci-hero__in">
        <div className="sci-hero__copy">
          <BackLink de={de} className="mb-6" />
          <p className="sci-eyebrow">{de ? 'Wissenschaft · Heißwachs gegen Öl' : 'Science · hot wax versus oil'}</p>
          <h1 className="sci-hero__h1">{de ? 'Ein messbarer Unterschied.' : 'One measurable difference.'}</h1>
          <p className="sci-hero__lede">
            {de
              ? 'Derselbe Antrieb, zwei Schmierstoffe, unabhängig gemessen. Und darunter die Physik, warum: vom Kettenblatt bis zum Molekül.'
              : 'Same drivetrain, two lubricants, measured independently. And below it the physics of why: from the chainring down to the molecule.'}
          </p>
          <dl className="sci-hero__stats">
            {cards.map(c => (
              <div key={c.label} className="sci-stat">
                <dt>{c.label}</dt>
                <dd><b>{c.value}</b><span>{c.sub}</span></dd>
              </div>
            ))}
          </dl>
          <p className="sci-hero__src">
            {de
              ? `Wattzahlen: Laborwerte von Zero Friction Cycling bei ${w.inputW} W Tretleistung, nicht selbst gemessen.`
              : `Watt figures: lab values from Zero Friction Cycling at ${w.inputW} W pedalling power, not measured by us.`}
          </p>
          <div className="sci-hero__cta">
            <a href="#formel" className="sci-btn sci-btn--primary">{de ? 'Hineinzoomen' : 'Zoom in'}<ArrowRight className="h-4 w-4" /></a>
            <a href="#beweis" className="sci-btn">{de ? 'Woher die Zahlen kommen' : 'Where the numbers come from'}</a>
          </div>
        </div>
        <div className="sci-hero__fig">
          {HERO_VARIANT === 'chainring' ? <ChainringHero de={de} /> : <CassetteLens de={de} />}
        </div>
      </div>
    </section>
  );
}

// ─── Sedimentation trace: Stokes' law, worked through ─────────────────────────
// The settling rate in the Dispersant copy is arithmetic, not lab data, so it
// is computed here from the inputs shown (CalcTrace, as in the calculators)
// and copy and trace cannot drift apart again. Until 2026-09-15 the copy said
// 0,8; the formula gives ~1,0. 0,9 g/cm³ is solid paraffin as in the copy;
// the lighter melt would push v up slightly, not down.
const STOKES = { rhoParticle: 5.06, rhoWax: 0.9, diameterUm: 5, etaMPas: 3.5 } as const;
function SedimentationTrace({ de }: { de: boolean }) {
  const { rhoParticle, rhoWax, diameterUm, etaMPas } = STOKES;
  const r = (diameterUm / 2) * 1e-6;
  const vMs = (2 * (rhoParticle - rhoWax) * 1000 * 9.81 * r * r) / (9 * etaMPas * 1e-3);
  const n = (x: number, digits: number) =>
    x.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-meta uppercase tracking-[0.1em] font-semibold mb-2.5" style={{ color: 'var(--txff)' }}>
        {de ? 'Stokes\'sches Gesetz, nachgerechnet' : "Stokes' law, worked through"}
      </p>
      <CalcTrace rows={[
        { label: de ? 'Dichte MoS₂ / Paraffin' : 'Density MoS₂ / paraffin', detail: `${n(rhoParticle, 2)} / ${n(rhoWax, 1)} g/cm³`, value: `${n(rhoParticle / rhoWax, 1)}×` },
        { label: de ? 'Schmelzviskosität bei 65 °C' : 'Melt viscosity at 65 °C', value: `η ≈ ${n(etaMPas, 1)} mPa·s` },
        { label: de ? 'Partikeldurchmesser' : 'Particle diameter', value: `${diameterUm} µm` },
        { label: de ? 'Sinkgeschwindigkeit' : 'Settling velocity', detail: 'v = 2·Δρ·g·r² / 9η', value: `≈ ${n(vMs * 60000, 1)} mm/min`, total: true },
      ]} />
    </div>
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
          ? 'Beide Wachse funktionieren das ganze Jahr. Pro bleibt bis −8 °C geschmeidig und hält bei Nässe und Kälte länger als Classic. Classic ist bei trockenem Wetter am stärksten und braucht bei Frost und Nässe öfter einen neuen Wachsgang. Dauerregen verkürzt das Intervall bei jedem Kettenwachs.'
          : 'Both waxes work all year. Pro stays supple down to −8 °C and lasts longer than Classic in wet and cold. Classic is strongest in dry weather and needs rewaxing more often in frost and wet. Constant rain shortens the interval of any chain wax.'}
      </p>
      {de && (
        <ReadMoreLink to="/blog/kettenwachs-winter">
          Kettenwachs im Winter, im Ratgeber
        </ReadMoreLink>
      )}
    </InstrumentFrame>
  );
}

// ─── FrictionWatts — Reibungsverlust in der Kette, in Watt ──────────────────
//
// Bis 2026-09-16 standen hier drei Balken mit Reibungskoeffizienten: Pro
// μ 0,03–0,06, Classic μ 0,05–0,07, Kettenoel μ 0,18–0,25. Das ist raus, aus
// zwei Gruenden (WISSENSCHAFT_REDESIGN.md 1.1):
//
//  - Es sind Kennwerte des FESTSTOFFS unter trockenen Laborbedingungen, keine
//    gemessenen Werte unseres Produkts im Antrieb. Ein Balken, der "Pro" heisst
//    und einen MoS2-Materialkennwert zeigt, behauptet eine Produktmessung, die
//    es nicht gibt. In feuchter Luft liegt MoS2 ausserdem deutlich hoeher.
//  - Die Balkenlaenge kam aus einem Feld `pct` in data.ts, also aus einer frei
//    gewaehlten Zahl ohne Einheit. Eine Skala, die niemand ablesen kann, ist
//    Dekoration.
//
// Watt ist der Wert, der beides heilt. Er ist veroeffentlicht (Zero Friction
// Cycling), er hat eine Einheit, er hat eine Eingangsleistung, die danebensteht,
// und er misst die Kette statt das Pulver. Die Balken laufen deshalb jetzt auf
// einer echten Achse von 0 bis SCALE_W, mit Teilstrichen, und jeder Balken ist
// ein Bereich von lo bis hi statt einer Laenge ab null — denn genau das sind
// die Zahlen: eine Spanne von frisch behandelt bis Intervallende.
//
// mu ist damit nicht von der Seite verschwunden, nur von hier. Es steht weiter
// im MoS2-Kapitel, wo die Umgebung danebensteht, in die es gehoert.
//
// `frictionRanges` bleibt in data.ts als interne Referenz erhalten.
const SCALE_W = 12;
function FrictionWatts({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(prefersReducedMotion());
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => setRun(true) });
    return () => trigger.kill();
  }, []);

  const w = waxVsOil.watts;
  const rows = [
    { id: 'wax', label: de ? 'Heißwachs' : 'Hot wax', lo: w.wax[0], hi: w.wax[1], highlight: true },
    { id: 'oil', label: de ? 'Kettenöl' : 'Chain oil', lo: w.oil[0], hi: w.oil[1], highlight: false },
  ];
  const ticks = [0, 4, 8, 12];
  const pct = (v: number) => (v / SCALE_W) * 100;

  return (
    <div ref={ref} id="reibung" className="scroll-mt-24">
      <div className="space-y-6">
        {rows.map(r => (
          <div key={r.id}>
            <div className="flex justify-between items-baseline mb-2">
              <span className={`text-[13px] font-medium ${r.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>{r.label}</span>
              <span className="num-data text-[13px]" style={{ color: r.highlight ? 'var(--accent)' : 'var(--txf)' }}>
                {r.lo}–{r.hi} W
              </span>
            </div>
            {/* Bereichsbalken: er beginnt bei lo und endet bei hi, sitzt also
                wirklich dort auf der Achse, wo die Spanne liegt. Ein Balken ab
                null haette dieselbe Zahl als Laenge dargestellt und damit die
                Untergrenze verschenkt. */}
            <div className="relative h-3 rounded-full" style={{ background: 'var(--bd2)' }}>
              <div className="absolute inset-y-0 rounded-full"
                style={{
                  left: `${pct(r.lo)}%`,
                  width: run ? `${pct(r.hi - r.lo)}%` : '0%',
                  background: r.highlight
                    ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                    : 'repeating-linear-gradient(45deg, var(--txf) 0 3px, transparent 3px 7px)',
                  transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
                }} />
            </div>
          </div>
        ))}
      </div>

      {/* Die Achse. Sie ist der ganze Punkt dieses Umbaus: vorher gab es keine. */}
      <div className="relative mt-3 h-8" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'var(--bd)' }} />
        {ticks.map(t => (
          <div key={t} className="absolute top-0" style={{ left: `${pct(t)}%` }}>
            <div className="w-px h-1.5" style={{ background: 'var(--bd)' }} />
            <span className="num-data text-[11px] absolute top-2.5"
              style={{ color: 'var(--txf)', transform: t === 0 ? 'none' : t === SCALE_W ? 'translateX(-100%)' : 'translateX(-50%)' }}>
              {t}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed mt-2" style={{ color: 'var(--txm)' }}>
        {de
          ? `Reibungsverlust in der Kette, in Watt, bei ${w.inputW} W Tretleistung. Die Spanne reicht von frisch behandelt bis Intervallende.`
          : `Friction loss in the chain, in watts, at ${w.inputW} W pedalling power. The range runs from freshly treated to end of interval.`}
      </p>
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
        <span className="absolute -top-2.5 left-4 num text-meta px-2 py-0.5 rounded-full"
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
          <span className="num font-semibold text-[15px]" style={{ color: 'var(--tx1)' }}>{price}</span>
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

// ─── ACT II — Die Formel ───────────────────────────────────────────────────
//
// Die Inszenierung laeuft in der Formel-Reise (src/sections/science/journey):
// Kette, Gelenk, Spalt, Film, jede Zutat als Antwort auf ein Problem.
// Dort stehen pro Station nur ein, zwei Saetze. Wer tiefer will, findet hier
// darunter jede Komponente mit Begruendung, Physik und Diagramm — eine
// ruhige Liste, keine zweite Inszenierung.

const FIELD_KEYS = ['kristallstruktur', 'matrix', 'winterformel', 'mos2', 'sedimentation', 'antioxidans'] as const;
const isFieldKey = (id: string) => (FIELD_KEYS as readonly string[]).includes(id);

/** Alle Kanten, die diese Komponente beruehren, in beide Richtungen. */
function meshFor(node: number, de: boolean) {
  return EDGES.flatMap(e => {
    if (e.from !== node && e.to !== node) return [];
    const other = COMPONENTS.find(c => c.node === (e.from === node ? e.to : e.from));
    if (!other) return [];
    return [{
      name: de ? other.graphLabelDe : other.graphLabelEn,
      label: de ? e.labelDe : e.labelEn,
      balance: !!e.balance,
    }];
  });
}

/** Molekuelbild aus der Lupe der Reise, als Standbild. */
function SubstanceArt({ id, de }: { id: string; de: boolean }) {
  const key = id as NanoKey;
  const sc = NANO[key].render(NANO[key].still, de, false);
  const cid = `sub-${id}`;
  return (
    <svg viewBox="0 0 240 240" className="sub-art" aria-hidden>
      <defs>
        <clipPath id={`${cid}-c`}><circle cx="120" cy="120" r="118" /></clipPath>
        <radialGradient id={`${cid}-bg`} cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#141922" /><stop offset="1" stopColor="#07090C" /></radialGradient>
      </defs>
      <g clipPath={`url(#${cid}-c)`}><rect width="240" height="240" fill={`url(#${cid}-bg)`} />{sc.art}</g>
      <circle cx="120" cy="120" r="118.5" fill="none" stroke="rgba(169,196,230,0.45)" strokeWidth="2" />
    </svg>
  );
}

function ComponentDetails({ de }: { de: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const steps = FORMULA_STORY
    .map(s => ({ comp: COMPONENTS.find(c => c.node === s.node)!, s }))
    .filter(x => x.comp && isFieldKey(x.comp.id));
  return (
    <ol className="sub-grid">
      {steps.map(({ comp: c, s }, i) => {
        const isOpen = open === c.id;
        const mesh = meshFor(c.node, de);
        return (
          <li key={c.id} id={c.id} className={`sub-card scroll-mt-24${isOpen ? ' is-open' : ''}`}>
            <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} className="sub-head">
              <SubstanceArt id={c.id} de={de} />
              <span className="sub-meta">
                <span className="sub-num">0{i + 1}</span>
                <span className="sub-name">{de ? c.nameDe : c.nameEn}</span>
                <span className="sub-role">{de ? c.roleDe : c.roleEn}</span>
              </span>
              <span className="sub-metric">{c.metric}</span>
              <ChevronDown className="sub-chev" aria-hidden />
            </button>
            <div className="sub-body" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', visibility: isOpen ? 'visible' : 'hidden' }}>
              <div className="overflow-hidden">
                <div className="sub-body-in">
                  <div>
                    <p className="text-[15px] leading-relaxed" style={{ color: 'var(--tx1)' }}>{de ? c.sumDe : c.sumEn}</p>
                    <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--tx2)' }}>{de ? c.whyDe : c.whyEn}</p>
                    {mesh.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5 mt-4">
                        {mesh.map((m, j) => (
                          <li key={j} className="text-[12px] rounded-full px-2.5 py-1"
                            style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx2)' }}>
                            <b style={{ color: 'var(--tx1)', fontWeight: 600 }}>{m.name}</b>
                            <span style={{ color: 'var(--txf)' }}> {m.balance ? '⇄' : '·'} {m.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.id === 'mos2' && de && (
                      <ReadMoreLink to="/blog/mos2-kettenwachs">Mehr im Ratgeber: MoS₂ im Kettenwachs</ReadMoreLink>
                    )}
                  </div>
                  <Disclosure label={de ? 'Die Physik' : 'The physics'}>
                    <div className="pt-3 space-y-3">
                      <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>{de ? s.captionDe : s.captionEn}</p>
                      {(de ? c.physicsDe : c.physicsEn).map((t, j) => (
                        <p key={j} className="text-[13.5px] leading-relaxed" style={{ color: 'var(--txm)' }}>{t}</p>
                      ))}
                      <ComponentDiagram which={c.diagram} de={de} />
                      <Insight>{de ? c.insightDe : c.insightEn}</Insight>
                      {c.id === 'sedimentation' && <SedimentationTrace de={de} />}
                    </div>
                  </Disclosure>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
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
      <main id="main-content" className="noir sci">
      {/* 25.09.2026: der Mikroskop-Abschnitt "Wie das aussieht" ist weg.
          Seine Bilder tragen eingebrannte, vergleichende Beschriftungen ohne
          eigene Messung, und der noetige Hinweis "keine eigenen Aufnahmen"
          untergrub eine Seite unter dem Anspruch "gemessen, nicht
          behauptet" (Luca: "Informationen komisch"). Zurueck erst mit
          eigenen Aufnahmen, siehe PROJECT.md. */}
      <ScienceHero de={de} />

      {/* ── DIE REISE ──
          26.09.2026: "Wo es reibt" (FrictionLens) und das Film-Labor waren
          zwei Sektionen mit denselben Ringen hintereinander. Jetzt eine
          Kamerafahrt: Kette → Gelenk mit den drei Reibstellen → Spalt (Oel
          gegen Wachs) → Film, jede Zutat als Antwort auf ein Problem →
          zurueck. #problem und #formel zeigen beide hierher, damit alte
          Links weiter landen. Die Produktseiten behalten FrictionLens. */}
      <section id="formel" className="lab-section pdp-dark scroll-mt-16">
        <span id="problem" className="block scroll-mt-16" aria-hidden />
        <div className={`${W} lab-head`}>
          <p className="eyebrow">{de ? 'Wo es reibt und was dagegen hilft' : 'Where it rubs and what helps'}</p>
          <h2>{de ? 'Von der Kette bis zum Molekül.' : 'From the chain to the molecule.'}</h2>
          <p className="lede">{de
            ? 'Scroll dich hinein: vom Kettenblatt in ein Gelenk, in den Spalt mit der höchsten Last und in den Film, der dort arbeitet. Jede Zutat taucht genau da auf, wo sie ein Problem löst.'
            : 'Scroll in: from the chainring into a joint, into the gap under the highest load and into the film that works there. Each ingredient shows up exactly where it solves a problem.'}</p>
        </div>
        <Journey de={de} onBeweis={() => document.getElementById('beweis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
      </section>

      <section id="stoffe" className={`${W} pt-20 pb-16 scroll-mt-24`}>
        <ActHead
          eyebrow={de ? 'Für Neugierige' : 'For the curious'}
          title={de ? 'Die sechs Stoffe im Detail.' : 'The six substances in detail.'}
        />
        <ComponentDetails de={de} />
        <FailureTimeline de={de} />
      </section>

      {/* ── ACT III — PROOF ──
          id="beweis": Ziel des Hero-Links "Woher die Zahlen kommen" (vorher
          "Wie das gemessen wurde" → #problem, das aber erklaerte WO im
          Kettenglied Reibung entsteht, nicht WIE gemessen wurde — und die
          Seite trug "Gemessen, nicht behauptet" bei genau einer Quellenzeile
          ohne Jahr/URL im Footer, keinem Methodenteil). Jetzt direkt unter
          der Ueberschrift, die diese Aussage traegt. */}
      <section id="beweis" className={`${W} py-16 scroll-mt-24`} style={{ borderTop: '1px solid var(--bd2)' }}>
        <ActHead
          eyebrow={de ? 'Der Beweis' : 'The Proof'}
          title={de ? 'Was unabhängig gemessen wurde.' : 'What was measured independently.'}
        />


        {/* Two instrument panels side by side instead of stacked (friction
            bars + folded-in outcome stats on the left, StandstillFilm on the
            right), so the section doesn't run so tall. StandstillFilm's SVG
            (viewBox 360×190) scales down at half width and still reads.

            2026-09-16: items-start statt items-stretch. Die Begruendung fuer
            das Strecken war, dass zwei gleich hohe Geraete besser aussehen als
            eines mit einer Luecke darunter. Das galt, solange die natuerlichen
            Hoehen nahe beieinander lagen. Mit dem Umbau der Balken auf Watt ist
            das linke Panel deutlich kuerzer geworden, und gestreckt stand die
            Leere dann INNERHALB des Rahmens: rund eine halbe Panelhoehe
            gepunktetes Raster unter dem letzten Element. Eine Luecke zwischen
            zwei Karten liest sich als Layout, eine Luecke in einem
            Instrumentenrahmen liest sich als fehlender Inhalt. */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4 items-start">
          <div>
          <InstrumentFrame eyebrow={de ? 'Reibung' : 'Friction'}
            footer={
              <>
                {/* No cost tile here on purpose: ProofInstrument below is the
                    page's one cost model (as on the product page). Mobile
                    shows the chain-life figure alone, desktop both tiles. */}
                <p className="sm:hidden text-center">
                  <CountUp value={`${waxVsOil.life.waxLo}–${waxVsOil.life.wax}×`} className="font-mono text-[13px] font-semibold" style={{ color: 'var(--tx1)' }} />
                  <span className="text-meta ml-1.5" style={{ color: 'var(--txf)' }}>
                    {de ? 'Kettenlaufzeit gegenüber Öl' : 'chain life versus oil'}
                  </span>
                </p>
                <div className="hidden sm:grid sm:grid-cols-2 gap-3 text-center">
                  {[
                    { v: '~300 km', d: de ? 'pro Rewax-Vorgang' : 'per rewax' },
                    { v: `${waxVsOil.life.waxLo}–${waxVsOil.life.wax}×`, d: de ? 'Kettenlaufzeit' : 'chain life' },
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
            <FrictionWatts de={de} />
          </InstrumentFrame>
          {/* Methode & Grenzen steht jetzt unter dem Reibungs-Instrument statt
              ueber beiden: dort fuellt es die Spalte neben dem hoeheren
              Stillstands-Instrument (25.09.2026), statt eine Leerflaeche zu
              lassen, und steht direkt bei den Zahlen, die es einordnet. */}
            {/* Methode & Grenzen: die Zahlen sind Laborwerte Dritter (Zero
            Friction Cycling), keine eigene Messung von Waxcelerate — das
            stand bisher nirgends klar da, obwohl die Seite mit "Gemessen,
            nicht behauptet" wirbt. Titel/Jahr/URL der genauen Publikation
            stehen noch aus (Luca muss die konkrete Quelle bestaetigen,
            siehe SEO-Plan P0-2) — deshalb hier bewusst kein Link, nur die
            ehrliche Einordnung, ohne eine URL zu erfinden. */}
        <p className="text-meta mt-5 leading-relaxed" style={{ color: 'var(--txff)' }}>
          {de
            ? 'Diese Werte stammen aus unabhängigen Labortests von Zero Friction Cycling, nicht aus eigenen Messungen von Waxcelerate. Laborbedingungen (konstante Leistung, kontrollierte Kette) bilden die Straße nicht eins zu eins ab — Wetter, Verschmutzung und Fahrstil verschieben die Werte im Alltag in beide Richtungen. Die Größenordnung der Unterschiede bleibt davon unberührt.'
            : 'These figures come from independent lab tests by Zero Friction Cycling, not from measurements Waxcelerate ran itself. Lab conditions (constant power, controlled chain) do not map onto the road one to one — weather, dirt and riding style shift real-world values in both directions. The order of magnitude of the difference is unaffected by that.'}
        </p>
          </div>

          {/* Signature visual — why a joint runs boundary-lubricated (the payoff) */}
          <StandstillFilm de={de} />
        </div>

        {/* Personal case under the lab case: same drivetrainCosts() and shared
            riding profile as the product page's SizingInstrument. The "work it
            out yourself" links follow the instrument instead of preceding it. */}
        <div className="mt-10">
          <ProofInstrument de={de} />
        </div>

        {de && (
          <div className="flex flex-col gap-1 mt-2">
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
        {/* Einsatzbereich gehoert zur Wahl Classic/Pro, nicht neben die
            MoS2-Grafik (die fiel 25.09.2026 als Doppelung zur Mikroskop-
            Station weg). */}
        <div id="matrix-window" className="mt-6 mb-16 scroll-mt-24">
          <TempWindow de={de} />
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
          <p className="eyebrow mb-3" style={{ color: 'var(--accent-soft)' }}>
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

      <footer className="noir sci sci-foot">
        <div className={`${W} py-12 text-center`}>
        <p className="text-meta mb-6" style={{ color: 'var(--txff)' }}>
          {de
            ? 'Quelle: Friction Facts, „Friction-Producing Mechanisms of a Bicycle Chain“, bereitgestellt von Zero Friction Cycling.'
            : 'Source: Friction Facts, "Friction-Producing Mechanisms of a Bicycle Chain," published by Zero Friction Cycling.'}
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-wx-txm transition-opacity hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          {de ? 'Zurück zur Startseite' : 'Back to home'}
        </Link>
        </div>
      </footer>

      <Footer />
    </div>
  );
}
