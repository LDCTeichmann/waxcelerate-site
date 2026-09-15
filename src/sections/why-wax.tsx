import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSectionReveal, prefersReducedMotion } from '@/hooks/useAnimation';
import { ScrollWordReveal } from '@/components/ScrollWordReveal';
import { ScienceTeaser } from '@/sections/science/ScienceTeaser';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { Ico, CHANGE_ICONS } from '@/pages/product/wax/Ico';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { waxVsOil, products } from '@/lib/data';
import { Section } from '@/components/Section';

type ProofTab = 'photo' | 'micro';

// "300–400 W" als ein Wort: Wortverbinder um den Strich, geschuetztes
// Leerzeichen vor der Einheit. Sonst bricht mobil "300–/400 W" um.
const range = ([lo, hi]: readonly number[]) => `${lo}⁠–⁠${hi} W`;

// Welcher Punkt welchen Beleg im Slider hat. Punkt 1 (sauber) sieht man auf
// dem Foto, Punkt 2 (Gelenk) unterm Mikroskop. Punkte 3/4 belegen die
// Kennzahlen direkt darunter (2–3×, 250–450 km).
const POINT_PROOF: (ProofTab | null)[] = ['photo', 'micro', null, null];

// ─── Was sich für dich ändert ────────────────────────────────────────────────
// 15.09.2026: Form von der Wachsseite (ProofAndChange.tsx, Kapitel 01)
// uebernommen, weil sie dort deutlich staerker wirkt als die alte Fassung hier
// ("Du merkst es sofort": 370-px-Slider in der Seitenspalte, nummerierte
// Zeilen 01–04, Messkarte mit Wattbalken und Kostenrechnung). Jetzt:
//   1. Grosser Slider zuerst. Das Foto ist der staerkste Eigenbeleg der Marke.
//      Mikroskop 1000× bleibt als Umschalter (Luca), Foto ist Standard.
//   2. Vier Punkte mit Icons statt 01–04, die Punkte haben keine Reihenfolge.
//      Texte teilt sich die Seite mit der Wachsseite (i18n whyWax.points).
//      "Es wird leise" bleibt draussen, bis der Claim freigegeben ist.
//      Runde 2: Punkt 1 und 2 schalten den Slider auf ihren Beleg um, der
//      Umschalter steht damit nicht mehr isoliert neben den Aussagen.
//   3. Kennzahlen produktneutral (die Wachsseite nennt Wachsgaenge je Block,
//      das passt vor der Produktwahl nicht). Wattbalken und Kostenkarte sind
//      darin aufgegangen. Watt immer mit Eingangsleistung, Laufzeit immer als
//      Spanne (Claims-Regeln).
//   4. Ein Weg zurueck zum Regal, nur ab lg: mobil uebernimmt das die feste
//      Leiste MobileStickyCTA ("Zu den Produkten"), dort steht nur der Preis.
export function WhyWax() {
  const { t, lang } = useLanguage();
  const de          = lang === 'de';
  const w           = t.whyWax;
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const sliderRef   = useRef<HTMLDivElement>(null);
  const pointsRef   = useRef<HTMLUListElement>(null);
  const figsRef     = useRef<HTMLDListElement>(null);
  const [proofTab, setProofTab] = useState<ProofTab>('photo');

  useSectionReveal(headerRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      for (const list of [pointsRef.current, figsRef.current]) {
        // Nach einem Anker-Sprung (#warum-wachs, Sektion lazy) steht die Liste
        // beim Mount schon im Bild. Dann nicht erst ausblenden und auf einen
        // Scroll warten, der nicht mehr kommt.
        if (!list || list.getBoundingClientRect().top < window.innerHeight) continue;
        gsap.fromTo(list.children,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
      }
    }, section);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  // Beleg-Link im Punkt: Tab umschalten. Unter lg steht der Slider ueber den
  // Punkten, also dorthin scrollen, sonst sieht man den Wechsel nicht.
  // scrollIntoView lief hier ins Leere (gemessen: Slider blieb bei −241 px),
  // deshalb explizit per scrollTo im naechsten Frame, nach dem Tab-Wechsel.
  // Nur wenn der Slider nicht schon ganz unter der Navigation sichtbar ist.
  const showProof = (tab: ProofTab) => {
    setProofTab(tab);
    if (window.innerWidth >= 1024) return;
    requestAnimationFrame(() => {
      const el = sliderRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top >= 80 && r.bottom <= window.innerHeight) return;
      const top = r.top + window.scrollY - Math.max(80, (window.innerHeight - r.height) / 2);
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  };

  const loc = de ? 'de-DE' : 'en-US';
  const { life, watts, cost } = waxVsOil;
  const wax500 = products.find(p => p.id === 'wax-500');
  const cheapest = Math.min(...products.filter(p => p.category === 'wax').map(p => p.price));
  const priceNote = w.ctaNote(cheapest.toLocaleString(loc, { minimumFractionDigits: 2 }) + ' €');

  // Beide Bildpaare sind auf 6/5 zugeschnitten (public/images/compare/), der
  // Umschalter springt deshalb nicht in der Hoehe.
  const proof = proofTab === 'photo'
    ? {
        beforeSrc: '/images/compare/chain-oel.webp',
        afterSrc: '/images/compare/chain-wachs.webp',
        beforeAlt: de ? 'Kette mit Kettenöl, dunkel und verklebt' : 'Chain with chain oil, dark and sticky',
        afterAlt: de ? 'Dieselbe Kette mit Heißwachs, sauber und trocken' : 'Same chain with hot wax, clean and dry',
        beforeLabel: w.oilLabel, afterLabel: w.waxLabel, caption: w.captionPhoto,
      }
    : {
        beforeSrc: '/images/compare/micro-ref.webp',
        afterSrc: '/images/compare/micro-mos2.webp',
        beforeAlt: de ? 'Kettenglied-Innenfläche, Referenz ohne MoS₂' : 'Chain link inner surface, reference without MoS₂',
        afterAlt: de ? 'Kettenglied-Innenfläche mit Waxcelerate und MoS₂' : 'Chain link inner surface with Waxcelerate and MoS₂',
        beforeLabel: w.proofRef, afterLabel: 'Waxcelerate', caption: w.captionMicro,
      };

  // Einheit klein neben der Zahl, damit vier Kennzahlen in eine Zeile passen.
  const figs: { value: string; unit?: string; title?: string; label: string; sub: React.ReactNode }[] = [
    { value: `${life.waxLo}–${life.wax}×`, label: w.figLife, sub: w.figLifeSub },
    { value: (wax500?.intervalDry ?? '250–450 km').replace(/\s*km$/, ''), unit: 'km', label: w.figInterval, sub: w.figIntervalSub },
    { value: `${watts.wax[0]}–${watts.wax[1]}`, unit: 'W', title: w.labValues, label: w.figWatts,
      sub: `${w.wattsShort(range(watts.oil), `${watts.inputW} W`)}. ${w.labValues}.` },
    { value: `${cost.savedEur}`, unit: '€', label: w.figSaved(cost.km.toLocaleString(loc)),
      sub: (
        <Link to="/produkt/wax-500#instrument" aria-label={w.derivationAria}
          className="group inline-flex items-center gap-1.5 font-semibold whitespace-nowrap py-2 -my-2"
          style={{ color: 'var(--tx1)' }}>
          {w.derivation}
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: 'var(--accent-soft)' }} aria-hidden />
        </Link>
      ) },
  ];

  const tabBtn = (id: ProofTab, label: string) => (
    <button type="button" aria-pressed={proofTab === id} onClick={() => setProofTab(id)}
      className="text-meta font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors cursor-pointer"
      style={{ color: proofTab === id ? '#fff' : 'var(--txm)', background: proofTab === id ? 'var(--accent)' : 'transparent' }}>
      {label}
    </button>
  );

  return (
    <Section id="warum-wachs" ref={sectionRef} className="bg-wx-sf">

      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '56px', background: 'linear-gradient(to bottom, var(--sf), transparent)', zIndex: 1 }} />

      {/* ── Kopf ── */}
      <div ref={headerRef} className="mb-8 sm:mb-11 max-w-[660px]">
        <p className="eyebrow mb-3 flex items-center gap-3" style={{ color: 'var(--accent-soft)' }}>
          <span aria-hidden className="inline-block w-7" style={{ height: '1.5px', background: 'currentColor' }} />
          {w.changeEyebrow}
        </p>
        <h2 className="font-display font-extrabold text-wx-tx1 leading-[1.02] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(34px, 4.4vw, 52px)' }}>
          <ScrollWordReveal text={w.changeTitle} />
        </h2>
        <p data-reveal="subtitle" className="mt-3 sm:mt-4 text-[16px] sm:text-[18px] leading-normal max-w-[44ch]" style={{ color: 'var(--txm)' }}>
          {w.changeLead}
        </p>
      </div>

      {/* ── Beleg links, Punkte rechts (mobil: Beleg zuerst) ── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-[72px] items-center">
        <div ref={sliderRef} className="scroll-mt-24">
          <div className="rounded-[18px] overflow-hidden" style={{ boxShadow: '0 24px 48px rgba(0,0,0,.16)' }}>
            <BeforeAfterSlider key={proofTab} aspect="6/5" fit="cover" bare overlayLabels
              beforeSrc={proof.beforeSrc} afterSrc={proof.afterSrc}
              beforeAlt={proof.beforeAlt} afterAlt={proof.afterAlt}
              beforeLabel={proof.beforeLabel} afterLabel={proof.afterLabel} />
          </div>
          {/* Umschalter wie bisher: eigene Flaeche je Option, sonst wurde er
              nicht als klickbar erkannt (Luca-Feedback 08/2026). */}
          <div className="mt-3.5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="inline-flex items-center gap-1.5 flex-shrink-0">
              <ArrowLeftRight className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--txff)' }} aria-hidden />
              <div className="inline-flex items-center gap-1 p-0.5 rounded-full"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
                {tabBtn('photo', w.proofPhoto)}
                {tabBtn('micro', w.proofMicro)}
              </div>
            </div>
            <p className="text-small leading-snug" style={{ color: 'var(--txm)' }} aria-live="polite">{proof.caption}</p>
          </div>
        </div>

        <ul ref={pointsRef} className="grid gap-[18px] sm:gap-[26px] list-none p-0 m-0">
          {w.points.map((p, i) => {
            const tab = POINT_PROOF[i];
            const active = tab !== null && tab === proofTab;
            return (
              <li key={p.title} className="grid grid-cols-[46px_1fr] sm:grid-cols-[52px_1fr]">
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center transition-colors duration-300"
                  style={{ background: active ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.08)', color: active ? '#fff' : 'var(--accent)' }}>
                  <Ico name={CHANGE_ICONS[i]} className="w-[18px] h-[18px] sm:w-5 sm:h-5"
                    style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
                </span>
                <div>
                  <h3 className="font-display font-bold text-wx-tx1 text-[19px] sm:text-[22px] leading-[1.2]">{p.title}</h3>
                  <p className="mt-1 sm:mt-1.5 text-[15px] sm:text-[15.5px] leading-[1.5] sm:leading-[1.55] max-w-[44ch]" style={{ color: 'var(--txm)' }}>
                    {p.body}
                  </p>
                  {tab && (
                    <button type="button" onClick={() => showProof(tab)} aria-pressed={active}
                      className="group mt-1.5 inline-flex items-center gap-1.5 py-1 text-[13px] font-semibold rounded cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ color: active ? 'var(--accent)' : 'var(--tx1)', outlineColor: 'var(--accent)' }}>
                      <ArrowLeftRight className="h-3 w-3" style={{ color: 'var(--accent-soft)' }} aria-hidden />
                      <span className="underline decoration-1 underline-offset-[3px]"
                        style={{ textDecorationColor: active ? 'var(--accent)' : 'var(--bd)' }}>
                        {tab === 'photo' ? w.seePhoto : w.seeMicro}
                      </span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Kennzahlen ── Haarlinie oben, Trennlinien zwischen den Spalten,
          mobil 2×2. */}
      <dl ref={figsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 sm:gap-y-7 mt-12 lg:mt-16"
        style={{ borderTop: '1px solid var(--bd2)' }}>
        {figs.map((f, i) => (
          <div key={f.label} style={{ borderColor: 'var(--bd2)' }}
            className={`pt-5 sm:pt-6 pr-3 sm:pr-4 lg:pr-6 ${i % 2 ? 'border-l pl-4 sm:pl-5' : ''} ${i > 0 ? 'lg:border-l lg:pl-7' : ''}`}>
            <dd className="font-display font-extrabold leading-none tracking-[-0.03em] whitespace-nowrap"
              title={f.title}
              style={{ fontSize: 'clamp(23px, 3.4vw, 44px)', color: 'var(--accent)' }}>
              {/* 23 px Untergrenze: "250–450 km" muss bei 360 px in die rechte
                  Halbspalte passen (whitespace-nowrap, gemessen). */}
              <span className="num">{f.value}</span>
              {f.unit && <small className="text-[16px] sm:text-[22px] font-semibold ml-1" style={{ color: 'var(--tx2)' }}>{f.unit}</small>}
            </dd>
            <dt className="mt-2.5 sm:mt-3 font-semibold text-[14px] sm:text-[14.5px] leading-snug" style={{ color: 'var(--tx1)' }}>{f.label}</dt>
            <dd className="mt-1 text-[13px] sm:text-[13.5px] leading-snug" style={{ color: 'var(--txf)' }}>{f.sub}</dd>
          </div>
        ))}
      </dl>

      {/* ── Weg zurueck zum Regal ── ab lg als Button, mobil nur der Preis
          (die feste Leiste unten fuehrt dort schon zu den Produkten). */}
      <p className="lg:hidden mt-6 text-small" style={{ color: 'var(--txm)' }}>{priceNote}</p>
      <div className="hidden lg:flex mt-10 items-center gap-4">
        <a href="#produkte" className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition-transform hover:-translate-y-px"
          style={{ background: 'var(--tx1)', color: 'var(--pg)' }}>
          {w.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </a>
        <span className="text-small" style={{ color: 'var(--txm)' }}>{priceNote}</span>
      </div>

      {/* ── Tür in die Wissenschaft ── */}
      <ScienceTeaser de={de} />

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '64px', background: 'linear-gradient(to bottom, color-mix(in srgb, var(--pg), transparent 100%), var(--pg))', zIndex: 1 }} />
    </Section>
  );
}
