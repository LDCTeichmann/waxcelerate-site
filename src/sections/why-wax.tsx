import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { gsap } from '@/lib/gsap';

const cardStyle = {
  background: 'var(--card-bg)',
  boxShadow: 'var(--card-shad)',
};

interface Benefit {
  num: string;
  titleDe: string;
  titleEn: string;
  summaryDe: string;
  summaryEn: string;
  detailDe: string;
  detailEn: string;
  specValue?: string;
  specLabelDe?: string;
  specLabelEn?: string;
  image?: string;
  imageAltDe?: string;
  imageAltEn?: string;
  scienceAnchor: string;
  scienceLinkDe: string;
  scienceLinkEn: string;
}

const benefits: Benefit[] = [
  {
    num: '01',
    titleDe: 'Dichter Schutzfilm bei Nässe',
    titleEn: 'Denser protective film in wet conditions',
    summaryDe: 'Mikrokristallines Hartwachs packt dichter als Standard-Paraffin — weniger Lücken, weniger Wasser am Metall.',
    summaryEn: 'Microcrystalline hard wax packs denser than standard paraffin — fewer gaps, less water reaching the metal.',
    detailDe: 'Standard-Paraffin bildet grobkristalline Strukturen mit messbaren Lücken — durch diese Lücken erreicht Wasser die Metalloberfläche und Oxidation entsteht schneller. Mikrokristallines Hartwachs hat deutlich kleinere Kristallite, die dichter packen und mehr Metalloberfläche bedecken. Das reduziert den Wasserkontakt mit dem Stahl erheblich.',
    detailEn: 'Standard paraffin forms coarse crystal structures with measurable gaps — through these gaps water reaches the metal and oxidation sets in faster. Microcrystalline hard wax has significantly smaller crystallites that pack more densely and cover more metal surface area, substantially reducing water contact with the steel.',
    image: '/images/upload-18.jpeg',
    imageAltDe: 'Vergleich: Ölkette vs. Wachskette',
    imageAltEn: 'Comparison: oil chain vs. wax chain',
    scienceAnchor: '#kristallstruktur',
    scienceLinkDe: 'Kristallstruktur erklärt',
    scienceLinkEn: 'Crystal structure explained',
  },
  {
    num: '02',
    titleDe: 'Elastisch bis −8 °C',
    titleEn: 'Elastic down to −8 °C',
    summaryDe: 'MoS₂ hält die Wachsmatrix bei Frost geschmeidig — kein Abplatzen, konsistente Schaltung.',
    summaryEn: 'MoS₂ keeps the wax matrix flexible in frost — no flaking, consistent shifting.',
    detailDe: 'Standard-Wachse werden unter ~5 °C spröde — die Matrix bricht bei Biegebewegungen auf, Stücke platzen ab, Schmierung fällt aus. MoS₂ hält die Matrix elastisch bis −8 °C, verhindert Abplatzen und sorgt für konsistentere Schaltperformance. Ein Phenol-Antioxidans schützt zusätzlich das MoS₂ vor Umwandlung zu MoO₃ — einem abrasiven Oxidationsprodukt.',
    detailEn: 'Standard waxes become brittle below ~5 °C — the matrix fractures under flex stress, pieces chip off, and lubrication fails. MoS₂ keeps the matrix elastic down to −8 °C, preventing flaking and maintaining more consistent shifting. A phenolic antioxidant also protects the MoS₂ from converting to MoO₃ — an abrasive oxidation product.',
    specValue: '−8 °C',
    specLabelDe: 'Frostgrenze · Pro Formel',
    specLabelEn: 'Frost limit · Pro formula',
    scienceAnchor: '#winterformel',
    scienceLinkDe: 'Winterformel erklärt',
    scienceLinkEn: 'Winter formula explained',
  },
  {
    num: '03',
    titleDe: 'Stabil bis +75 °C',
    titleEn: 'Stable up to +75 °C',
    summaryDe: 'Fischer-Tropsch-Matrix hält Position unter Last — weniger Migration, längere Intervalle.',
    summaryEn: 'Fischer-Tropsch matrix holds position under load — less migration, longer intervals.',
    detailDe: 'An Kettenkontaktpunkten unter Last entstehen Temperaturen von 45–55 °C. Weiches Wachs erreicht hier seine thermische Grenze — es migriert weg vom Gelenk, dünnt aus, und Schmutz haftet an der Stelle. Die härtere Fischer-Tropsch-Matrix (Tropfpunkt ~75 °C) bleibt an Position: deutlich weniger Migration und Shedding, längere Rewax-Intervalle.',
    detailEn: 'Under load, chain contact points reach 45–55 °C. Soft wax approaches its thermal limit here — it migrates away from the joint, thins out, and dirt sticks where it exposed the metal. The harder Fischer-Tropsch matrix (drop point ~75 °C) holds its position: significantly less migration and shedding, longer re-wax intervals.',
    specValue: '+75 °C',
    specLabelDe: 'Tropfpunkt der Matrix',
    specLabelEn: 'Matrix drop point',
    scienceAnchor: '#matrix',
    scienceLinkDe: 'Matrix erklärt',
    scienceLinkEn: 'Matrix explained',
  },
];

interface Ingredient {
  nameDe: string;
  nameEn: string;
  funcDe: string;
  funcEn: string;
  metric: string;
  anchor: string;
}

const ingredients: Ingredient[] = [
  { nameDe: 'Paraffin',        nameEn: 'Paraffin',        funcDe: 'Trägermatrix',     funcEn: 'Base scaffold',   metric: '58–60 °C', anchor: '#paraffin'        },
  { nameDe: 'FT-Wachs',        nameEn: 'FT Wax',          funcDe: 'Härter',           funcEn: 'Hardener',        metric: '+14 °C',    anchor: '#ft-wachs'        },
  { nameDe: 'Mikrokristallin',  nameEn: 'Microcrystalline', funcDe: 'Plastifizierer',  funcEn: 'Plastifier',      metric: '−10 °C',    anchor: '#mikrokristallin' },
  { nameDe: 'MoS₂',            nameEn: 'MoS₂',            funcDe: 'Festschmierstoff', funcEn: 'Solid lubricant', metric: 'μ 0,03',    anchor: '#mos2'            },
  { nameDe: 'Dispersant',       nameEn: 'Dispersant',      funcDe: 'Stabilisator',     funcEn: 'Stabiliser',      metric: '5,6×',      anchor: '#dispersant'      },
  { nameDe: 'Antioxidans',      nameEn: 'Antioxidant',     funcDe: 'Schutz',           funcEn: 'Protection',      metric: '12 Mo.',    anchor: '#antioxidans'     },
];

const frictionData = [
  { labelDe: 'Pro',       labelEn: 'Pro',        val: 'μ 0,03–0,06', pct: 100, highlight: true  },
  { labelDe: 'Classic',   labelEn: 'Classic',    val: 'μ 0,05–0,07', pct: 80,  highlight: true  },
  { labelDe: 'Kettenöl',  labelEn: 'Chain Oil',  val: 'μ 0,18–0,25', pct: 18,  highlight: false },
];

export function WhyWax() {
  const { lang }   = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);
  const pillsRef   = useRef<HTMLDivElement>(null);
  const proofRef   = useRef<HTMLDivElement>(null);
  const de         = lang === 'de';

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Benefit cards stagger in
      if (cardsRef.current) {
        const els = cardsRef.current.querySelectorAll('[data-benefit]');
        gsap.fromTo(els,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.12,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 88%', once: true } },
        );
      }

      // Ingredient pills stagger in
      if (pillsRef.current) {
        const els = pillsRef.current.querySelectorAll('[data-pill]');
        gsap.fromTo(els,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06,
            scrollTrigger: { trigger: pillsRef.current, start: 'top 90%', once: true } },
        );
      }

      // Friction bars animate in on scroll
      if (proofRef.current) {
        proofRef.current.querySelectorAll('.fbar').forEach((bar) => {
          const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
          gsap.fromTo(bar, { scaleX: 0 }, {
            scaleX: pct, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: proofRef.current, start: 'top 82%', once: true },
          });
        });
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="warum-wachs" ref={sectionRef} className="relative py-24 sm:py-32 bg-wx-sf chain-texture">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-12">
            <p className="eyebrow mb-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Die Formel' : 'The Formula'}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-wx-tx1 mb-4">
              <ScrollWordReveal
                text={de ? 'Was Waxcelerate anders macht.' : 'What makes Waxcelerate different.'} />
            </h2>
            <p data-reveal="subtitle" className="text-wx-txm max-w-xl text-[15px]">
              {de
                ? 'Drei Bedingungen, an denen Schmiermittel versagen. Und warum sie bei Waxcelerate weniger versagen.'
                : 'Three conditions where lubricants fail. And why they fail less with Waxcelerate.'}
            </p>
          </div>

          {/* ── Benefit cards ── */}
          <div ref={cardsRef} className="space-y-5 mb-14">
            {benefits.map((b, i) => {
              const isOpen = expandedIdx === i;
              return (
                <div
                  key={i}
                  data-benefit
                  className="rounded-2xl border border-wx-bd overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
                  style={cardStyle}
                >
                  <div className={`grid lg:grid-cols-2 ${i % 2 !== 0 ? 'lg:[direction:rtl]' : ''}`}>

                    {/* Visual */}
                    <div
                      className="relative h-[220px] lg:h-auto lg:min-h-[300px] overflow-hidden"
                      style={{ background: 'var(--sf2)', direction: 'ltr' }}
                    >
                      {b.image ? (
                        <>
                          <img
                            src={b.image}
                            alt={de ? b.imageAltDe : b.imageAltEn}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }}
                          />
                          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                              style={{ color: 'rgba(255,255,255,0.65)' }}>
                              {de ? 'Öl vs. Wachs' : 'Oil vs. Wax'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                          <span
                            className="font-display font-bold tabular-nums leading-none"
                            style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', color: 'var(--accent-soft)' }}
                          >
                            {b.specValue}
                          </span>
                          {b.specLabelDe && (
                            <span className="text-[10px] mt-3 uppercase tracking-[0.16em] font-medium"
                              style={{ color: 'var(--txf)' }}>
                              {de ? b.specLabelDe : b.specLabelEn}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-8 xl:p-10 flex flex-col" style={{ direction: 'ltr' }}>
                      <span
                        className="font-display font-bold text-[2.6rem] leading-none tabular-nums select-none"
                        style={{ color: 'rgba(var(--accent-rgb), 0.10)' }}
                      >
                        {b.num}
                      </span>

                      <h3
                        className="font-display font-bold text-wx-tx1 mt-2 mb-3 leading-tight"
                        style={{ fontSize: 'clamp(1.2rem, 2.3vw, 1.6rem)', letterSpacing: '-0.01em' }}
                      >
                        {de ? b.titleDe : b.titleEn}
                      </h3>

                      <p className="text-[14px] leading-relaxed text-wx-tx2 mb-4">
                        {de ? b.summaryDe : b.summaryEn}
                      </p>

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedIdx(prev => prev === i ? null : i)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium self-start"
                        style={{ color: 'var(--accent)' }}
                      >
                        {isOpen ? (de ? 'Weniger' : 'Less') : (de ? 'Mehr erfahren' : 'Learn more')}
                        <ChevronDown
                          className="h-3.5 w-3.5 transition-transform duration-300"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>

                      {/* Expandable detail */}
                      <div style={{
                        display: 'grid',
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        transition: 'grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}>
                        <div style={{ overflow: 'hidden' }}>
                          <p className="text-[13px] leading-relaxed pt-4 pb-3" style={{ color: 'var(--txm)' }}>
                            {de ? b.detailDe : b.detailEn}
                          </p>
                          <Link
                            to={`/wissenschaft${b.scienceAnchor}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70 pb-1"
                            style={{ color: 'var(--accent)' }}
                          >
                            {de ? b.scienceLinkDe : b.scienceLinkEn}
                            <span aria-hidden="true" className="text-[10px]">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Formula ingredients overview ── */}
          <div className="mb-12">
            <h3 className="font-display font-bold text-wx-tx1 mb-1 leading-tight"
              style={{ fontSize: 'clamp(1.15rem, 2vw, 1.4rem)' }}>
              {de ? '6 Komponenten. Ein Ziel.' : '6 components. One goal.'}
            </h3>
            <p className="text-[13px] mb-5" style={{ color: 'var(--txm)' }}>
              {de
                ? 'Jede Zutat hat eine präzise Funktion in der Formel.'
                : 'Every ingredient has a precise function in the formula.'}
            </p>
            <div ref={pillsRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ingredients.map((ing, i) => (
                <Link
                  key={i}
                  data-pill
                  to={`/wissenschaft${ing.anchor}`}
                  className="group rounded-xl border border-wx-bd p-4 transition-all duration-300 hover:border-[var(--accent-soft)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                  style={cardStyle}
                >
                  <span
                    className="font-display font-bold tabular-nums leading-none block"
                    style={{ fontSize: 'clamp(1.05rem, 2vw, 1.35rem)', color: 'var(--accent-soft)' }}
                  >
                    {ing.metric}
                  </span>
                  <p className="text-[13px] font-semibold text-wx-tx1 mt-1.5">
                    {de ? ing.nameDe : ing.nameEn}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                    {de ? ing.funcDe : ing.funcEn}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link
                to="/wissenschaft"
                className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                {de ? 'Vollständige Wissenschaft →' : 'Full science page →'}
              </Link>
            </div>
          </div>

          {/* ── Batch quality note ── */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-5 mb-8"
            style={{ borderTop: '1px solid var(--bd2)', borderBottom: '1px solid var(--bd2)' }}
          >
            <div>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--tx2)' }}>
                {de ? 'Gleichmäßige Qualität — Block für Block' : 'Consistent quality — block to block'}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--txf)' }}>
                {de
                  ? 'Kleinstchargen in Stuttgart mit kontrollierter Homogenisierung.'
                  : 'Small-batch production in Stuttgart with controlled homogenisation.'}
              </p>
            </div>
            <Link to="/wissenschaft#sedimentation"
              className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}>
              {de ? 'Sedimentation erklärt →' : 'Sedimentation explained →'}
            </Link>
          </div>

          {/* ── Proof: friction + cost ── */}
          <div ref={proofRef} className="grid sm:grid-cols-2 gap-3 mb-7">

            {/* Friction */}
            <div className="rounded-xl border border-wx-bd p-5 flex flex-col" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Reibung' : 'Friction'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">μ 0,03</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {frictionData.map((item, j) => (
                  <div key={j}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-[11px] font-medium ${item.highlight ? 'text-wx-tx1' : 'text-wx-txf'}`}>
                        {de ? item.labelDe : item.labelEn}
                      </span>
                      <span className={`text-[11px] font-mono tabular-nums ${item.highlight ? 'text-wx-tx2' : 'text-wx-txff'}`}>
                        {item.val}
                      </span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                      <div className="fbar h-full w-full rounded-full" data-w={item.pct}
                        style={{
                          background: item.highlight
                            ? 'linear-gradient(90deg, var(--accent-strong), var(--accent-soft))'
                            : 'var(--bd2)',
                          transformOrigin: 'left center',
                          transform: 'scaleX(0)',
                        }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/wissenschaft#reibung"
                className="flex items-center gap-1 text-[11px] font-medium mt-3 pt-3 transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)', borderTop: '1px solid var(--bd2)' }}>
                {de ? 'Vollständiger Vergleich →' : 'Full comparison →'}
              </Link>
            </div>

            {/* Cost savings */}
            <div className="rounded-xl border border-wx-bd p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 text-wx-txm" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-wx-txm">
                    {de ? 'Kostenersparnis' : 'Cost savings'}
                  </p>
                </div>
                <span className="font-display font-bold text-wx-tx1 tabular-nums text-[22px] leading-none">~€70</span>
              </div>
              <p className="text-[11px] font-semibold mb-3" style={{ color: 'var(--accent)' }}>
                {de ? '46 % weniger über 12.000 km' : '46% less over 12,000 km'}
              </p>
              <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid var(--bd2)' }}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-wx-txf">{de ? 'Mit Öl (3 Ketten)' : 'With oil (3 chains)'}</span>
                  <span className="text-wx-txm tabular-nums">~€151</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-wx-txf">{de ? 'Mit Wachs (1 Kette)' : 'With wax (1 chain)'}</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--accent)' }}>~€81</span>
                </div>
              </div>
              <p className="text-[10px] mt-3 pt-3 leading-relaxed"
                style={{ borderTop: '1px solid var(--bd2)', color: 'var(--txff)' }}>
                {de
                  ? 'Basis: Kettenpreis €30, Rewax alle 400 km vs. Öl alle 300 km, 12.000 km. Kette 6.000–12.000 km mit Wachs vs. 2.000–3.000 km mit Öl (Kettendehnung 0,75 %).'
                  : 'Based on: chain price €30, re-wax every 400 km vs. oil every 300 km, 12,000 km total. Chain 6,000–12,000 km with wax vs. 2,000–3,000 km with oil (0.75% chain stretch).'}
              </p>
            </div>
          </div>

          {/* ── Formula selector note ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4 px-5 rounded-xl"
            style={{ background: 'var(--sf2)', border: '1px solid var(--bd2)' }}>
            <p className="text-[12px]" style={{ color: 'var(--txm)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx2)' }}>
                {de ? 'Welche Formel?' : 'Which formula?'}
              </span>
              {' · '}
              <span>Classic (PTFE) — {de ? 'Frühjahr–Herbst' : 'spring–autumn'}</span>
              {'  ·  '}
              <span>Pro (MoS₂) — {de ? 'Ganzjahr, Winter & E-Bike' : 'year-round, winter & e-bike'}</span>
            </p>
            <Link to="/#produkte"
              className="text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}>
              {de ? 'Zu den Produkten →' : 'See products →'}
            </Link>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, var(--pg))', zIndex: 1 }} />
    </section>
  );
}
