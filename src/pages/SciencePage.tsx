import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { gsap } from '@/lib/gsap';

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      setP(scrollTop / Math.max(scrollHeight - clientHeight, 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]" style={{ background: 'var(--bd)' }}>
      <div
        className="h-full"
        style={{ width: `${p * 100}%`, background: 'linear-gradient(90deg, #1A3080, #6A8AE8)', transition: 'width 0.05s linear' }}
      />
    </div>
  );
}

// ─── Composition tiers — no percentages, purely qualitative ──────────────────
const tiers = [
  {
    color: '#1A3080',
    barW: '82%',
    roleDe: 'Basisstruktur',
    roleEn: 'Base Structure',
    tagDe: 'Volumenbestimmend',
    tagEn: 'Volume-determining',
    dotsDe: '3 Komponenten',
    dotsEn: '3 components',
    descDe: 'Kristallines Paraffingerüst  ·  Mikrokristalliner Plastifikator  ·  Synthetisches Härtewachs',
    descEn: 'Crystalline paraffin scaffold  ·  Microcrystalline plasticizer  ·  Synthetic hard wax',
  },
  {
    color: '#4A72D4',
    barW: '46%',
    roleDe: 'Festschmierstoff',
    roleEn: 'Solid Lubricant',
    tagDe: 'Hochaktiv · Spurenkonzentration',
    tagEn: 'Highly active · Trace concentration',
    dotsDe: '1 Komponente',
    dotsEn: '1 component',
    descDe: 'MoS₂ — Hexagonales Schichtgitter  ·  Partikelgröße &lt;5 µm',
    descEn: 'MoS₂ — Hexagonal layer lattice  ·  Particle size &lt;5 µm',
  },
  {
    color: '#8AAAF0',
    barW: '24%',
    roleDe: 'Stabilisatoren',
    roleEn: 'Stabilizers',
    tagDe: 'Spurenadditive · Unverzichtbar',
    tagEn: 'Trace additives · Non-negotiable',
    dotsDe: '2 Komponenten',
    dotsEn: '2 components',
    descDe: 'Amphiphiler Fettsäureester  ·  Gehindertes Phenol-Antioxidans',
    descEn: 'Amphiphilic fatty acid ester  ·  Hindered phenolic antioxidant',
  },
];

function CompositionTiers({ de }: { de: boolean }) {
  const barsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const bars = barsRef.current?.querySelectorAll('.tier-bar');
      if (bars?.length) {
        gsap.fromTo(bars,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, stagger: 0.18, ease: 'power3.out', transformOrigin: 'left center',
            scrollTrigger: { trigger: barsRef.current, start: 'top 80%', once: true } }
        );
      }
    }, barsRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={barsRef} className="space-y-8">
      {tiers.map((t, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between mb-2 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <span className="text-[13px] font-bold text-wx-tx1">{de ? t.roleDe : t.roleEn}</span>
              <span className="text-[10px] text-wx-txff">{de ? t.dotsDe : t.dotsEn}</span>
            </div>
            <span className="text-[10px] text-wx-txff shrink-0 hidden sm:block">{de ? t.tagDe : t.tagEn}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--bd2)' }}>
            <div className="tier-bar h-full rounded-full" style={{ width: t.barW, background: t.color }} />
          </div>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: 'var(--txff)' }}
            dangerouslySetInnerHTML={{ __html: de ? t.descDe : t.descEn }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Crystal Lattice ──────────────────────────────────────────────────────────
function CrystalLattice() {
  const nodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nodes = nodeRef.current?.querySelectorAll('.lat-node') as NodeListOf<HTMLElement>;
    if (!nodes?.length) return;
    nodes.forEach((n, i) => {
      gsap.to(n, {
        opacity: Math.random() * 0.4 + 0.6,
        scale: Math.random() * 0.3 + 0.85,
        duration: 1.8 + Math.random() * 1.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.06,
      });
    });
    return () => gsap.killTweensOf(nodes);
  }, []);

  const rows = 6, cols = 9;
  return (
    <div className="w-full rounded-2xl overflow-hidden p-7" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <div ref={nodeRef} className="grid mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const isBig = (row * 3 + col * 2) % 5 === 0;
          return (
            <div key={i} className="lat-node mx-auto rounded-full"
              style={{
                width: isBig ? '9px' : '5px',
                height: isBig ? '9px' : '5px',
                background: isBig ? '#2B52B0' : 'var(--bd)',
                boxShadow: isBig ? '0 0 10px rgba(43,82,176,0.5)' : 'none',
              }}
            />
          );
        })}
      </div>
      <p className="text-center text-[9px] text-wx-txff uppercase tracking-[0.2em]">
        Lamellare Kristalldomänen · C₂₀–C₃₆
      </p>
    </div>
  );
}

// ─── Temperature range ────────────────────────────────────────────────────────
function TempRange({ de }: { de: boolean }) {
  const items = [
    { labelDe: 'Unmodifiziertes Paraffin', labelEn: 'Unmodified paraffin', lo: 58, hi: 62, color: 'var(--bd)' },
    { labelDe: 'Waxcelerate Classic',      labelEn: 'Waxcelerate Classic', lo: 60, hi: 76, color: '#2B52B0' },
    { labelDe: 'Waxcelerate Pro',          labelEn: 'Waxcelerate Pro',     lo: 60, hi: 79, color: '#4A72D4' },
  ];
  const min = 55, max = 85;
  const toX = (v: number) => ((v - min) / (max - min)) * 100;
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const bars = barRef.current?.querySelectorAll('.t-bar');
      bars?.forEach(bar => {
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out', transformOrigin: 'left center',
          scrollTrigger: { trigger: barRef.current, start: 'top 82%', once: true } });
      });
    }, barRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full rounded-2xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff mb-5">
        {de ? 'Effektiver Tropfpunkt' : 'Effective drop point'}
      </p>
      <div ref={barRef} className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-wx-txm">{de ? item.labelDe : item.labelEn}</span>
              <span className="text-[11px] font-mono text-wx-txf">{item.lo}–{item.hi}°C</span>
            </div>
            <div className="relative h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
              <div className="t-bar absolute top-0 h-full rounded-full"
                style={{ left: `${toX(item.lo)}%`, width: `${toX(item.hi) - toX(item.lo)}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {[55, 60, 65, 70, 75, 80, 85].map(t => (
          <span key={t} className="text-[9px] text-wx-txff font-mono">{t}°</span>
        ))}
      </div>
    </div>
  );
}

// ─── MoS₂ layers with hover shear animation ───────────────────────────────────
function MoS2Layers({ de }: { de: boolean }) {
  const [hovered, setHovered] = useState(false);
  const layers = ['S', 'Mo', 'S', 'gap', 'S', 'Mo', 'S'];
  return (
    <div className="w-full rounded-2xl p-5 cursor-default" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff mb-5 text-center">
        {de ? 'Hexagonale Schichtstruktur · 2H-Polymorphe' : 'Hexagonal layer structure · 2H polymorph'}
      </p>
      <div
        className="flex flex-col items-center gap-0 select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {layers.map((label, i) => {
          const isGap = label === 'gap';
          const isMo = label === 'Mo';
          const isTop = i < 3;
          const shiftTop = hovered && isTop ? '-6px' : '0px';
          const shiftBot = hovered && !isTop && !isGap ? '6px' : '0px';
          return (
            <div key={i}
              className="flex items-center justify-center gap-1.5 w-full"
              style={{
                height: isGap ? '20px' : '22px',
                transform: isGap ? 'none' : `translateX(${isTop ? shiftTop : shiftBot})`,
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              {isGap ? (
                <span className="text-[9px] text-wx-txff tracking-widest">
                  ↕ {de ? 'van-der-Waals-Bindung' : 'van der Waals bond'}
                </span>
              ) : (
                <>
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="rounded-full flex-shrink-0"
                      style={{
                        width: isMo ? '14px' : '10px',
                        height: isMo ? '14px' : '10px',
                        background: isMo ? '#4A72D4' : '#A8C0F4',
                        boxShadow: isMo ? '0 0 8px rgba(74,114,212,0.6)' : 'none',
                        transition: 'box-shadow 0.3s',
                      }}
                    />
                  ))}
                  <span className="text-[10px] text-wx-txff ml-2 w-4">{label}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] text-wx-txff mt-3 transition-opacity duration-300" style={{ opacity: hovered ? 1 : 0.4 }}>
        {de ? '↑ Hover — Scherschicht sichtbar' : '↑ Hover — shear layer visible'}
      </p>
      <div className="mt-5 pt-4 border-t border-wx-bd2 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="font-serif-display italic text-[26px] font-bold" style={{ color: '#4A72D4' }}>μ 0.03</p>
          <p className="text-[10px] text-wx-txff mt-0.5">{de ? 'Reibungskoeff. (Grenzschmierung)' : 'Friction coeff. (boundary lubrication)'}</p>
        </div>
        <div className="text-center">
          <p className="font-serif-display italic text-[26px] font-bold text-wx-tx1">&lt;5 µm</p>
          <p className="text-[10px] text-wx-txff mt-0.5">{de ? 'Partikelgröße d₅₀' : 'Particle size d₅₀'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Particle sedimentation ───────────────────────────────────────────────────
function ParticleSuspension({ de }: { de: boolean }) {
  return (
    <div className="w-full rounded-2xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff mb-5">
        {de ? 'Ohne vs. mit Dispergiermittel' : 'Without vs. with dispersant'}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { titleDe: 'Ohne', titleEn: 'Without', settled: true },
          { titleDe: 'Mit',  titleEn: 'With',    settled: false },
        ].map((panel, pi) => (
          <div key={pi} className="flex flex-col items-center">
            <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '90px', background: 'var(--bd2)', border: '1px solid var(--bd)' }}>
              {panel.settled ? (
                <>
                  <div className="absolute inset-x-0 top-3 flex flex-wrap gap-1 px-3 justify-center opacity-20">
                    {[...Array(4)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: '#4A72D4' }} />)}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 p-2 justify-center rounded-b" style={{ background: 'rgba(43,82,176,0.2)' }}>
                    {[...Array(14)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: '#2B52B0' }} />)}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-wrap gap-1.5 p-3 items-center justify-center">
                  {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: '#4A72D4', opacity: 0.9 }} />)}
                </div>
              )}
            </div>
            <p className="text-[11px] font-semibold text-wx-tx1 mt-2">{de ? panel.titleDe : panel.titleEn}</p>
            <p className="text-[10px] text-wx-txff text-center mt-0.5">
              {panel.settled
                ? (de ? 'Gradient im Block' : 'Gradient in block')
                : (de ? 'Gleichmäßig verteilt' : 'Uniformly distributed')}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-wx-bd2">
        <p className="text-[11px] text-wx-txff text-center">
          {de ? 'MoS₂ ist 5.6× schwerer als Paraffin — ohne Stabilisierung sedimentiert es messbar.' : 'MoS₂ is 5.6× denser than paraffin — without stabilization it sediments measurably.'}
        </p>
      </div>
    </div>
  );
}

// ─── Friction bars ────────────────────────────────────────────────────────────
function FrictionBars({ de }: { de: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const bars = [
    { label: 'Waxcelerate Pro', tag: 'PRO', desc: 'μ 0.03–0.06', pct: 100, hi: true },
    { label: 'Waxcelerate Classic',          desc: 'μ 0.05–0.07', pct: 86,  hi: true },
    { labelDe: 'Graphit-Heißwachs', labelEn: 'Graphite Wax',    desc: 'μ 0.08–0.12', pct: 60, hi: false },
    { labelDe: 'Kettenöl (nass)',   labelEn: 'Chain oil (wet)', desc: 'μ 0.18–0.25', pct: 15, hi: false, dim: true },
  ];
  useEffect(() => {
    const ctx = gsap.context(() => {
      ref.current?.querySelectorAll('.fb').forEach(bar => {
        const pct = parseFloat((bar as HTMLElement).dataset.w!) / 100;
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: pct, duration: 1, ease: 'power3.out', transformOrigin: 'left center',
          scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full rounded-2xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff mb-5">
        {de ? 'Reibungskoeffizient μ — Grenzschmierung' : 'Friction coefficient μ — boundary lubrication'}
      </p>
      <div ref={ref} className="space-y-3.5">
        {bars.map((b, i) => {
          const label = 'label' in b ? b.label : (de ? b.labelDe : b.labelEn);
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[12px] font-medium ${b.hi ? 'text-wx-tx1' : 'text-wx-txm'}`}>
                  {label}
                  {'tag' in b && b.tag && (
                    <span className="ml-1.5 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded" style={{ background: 'linear-gradient(135deg,#1A3080,#4A72D4)', color: 'rgba(255,255,255,0.9)' }}>
                      {b.tag}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-mono ${b.hi ? 'text-wx-tx2' : b.dim ? 'text-wx-txff' : 'text-wx-txf'}`}>{b.desc}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd)' }}>
                <div className="fb h-full w-full rounded-full" data-w={b.pct}
                  style={{ background: b.hi ? (b.pct === 100 ? 'linear-gradient(90deg,#1A3080,#6A8AE8)' : 'linear-gradient(90deg,#2B52B0,#4A72D4)') : b.dim ? 'var(--bd2)' : 'var(--txff)', transformOrigin: 'left center', transform: 'scaleX(0)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pull quote / insight ─────────────────────────────────────────────────────
function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-5 py-1">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" style={{ background: 'linear-gradient(to bottom, #2B52B0, #7A9AEC)' }} />
      <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--tx2)' }}>
        {children}
      </p>
    </div>
  );
}

// ─── Chapter ──────────────────────────────────────────────────────────────────
interface ChapterProps {
  num: string; catDe: string; catEn: string;
  titleDe: string; titleEn: string;
  bodyDe: React.ReactNode; bodyEn: React.ReactNode;
  insightDe: string; insightEn: string;
  visual: React.ReactNode;
  flip?: boolean; de: boolean;
}

function Chapter({ num, catDe, catEn, titleDe, titleEn, bodyDe, bodyEn, insightDe, insightEn, visual, flip, de }: ChapterProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 84%', once: true } }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="mb-24 lg:mb-32" style={{ opacity: 0 }}>
      {/* Chapter eyebrow */}
      <div className="flex items-center gap-4 mb-8">
        <span className="font-display font-bold tabular-nums leading-none select-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: 'rgba(43,82,176,0.12)' }}>
          {num}
        </span>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-0.5" style={{ color: '#4A72D4' }}>
            {de ? catDe : catEn}
          </p>
          <div className="h-px w-12" style={{ background: 'rgba(43,82,176,0.35)' }} />
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        {/* Text side */}
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-2xl sm:text-[1.75rem] font-bold text-wx-tx1 leading-snug">
            {de ? titleDe : titleEn}
          </h2>
          <div className="space-y-4 text-[14px] leading-[1.85] text-wx-txm">
            {de ? bodyDe : bodyEn}
          </div>
          <Insight>{de ? insightDe : insightEn}</Insight>
        </div>
        {/* Visual side */}
        <div>{visual}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function SciencePage() {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const heroRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  // Hero word-by-word animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (wordsRef.current.length) {
        gsap.fromTo(wordsRef.current,
          { opacity: 0, y: 22, rotateX: -12 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: 0.2 }
        );
      }
      gsap.fromTo('[data-hero-sub]',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.85 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const heroWords = de
    ? ['Sechs', 'Stoffe.', 'Jede', 'mit', 'Geschichte.']
    : ['Six', 'components.', 'Each', 'one', 'earned.'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--pg)' }}>
      <ScrollProgress />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-wx-bd"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[13px] text-wx-txm hover:text-wx-tx1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {de ? 'Zurück' : 'Back'}
          </Link>
          <span className="font-display text-[13px] font-semibold text-wx-tx1 tracking-wide">
            Waxcelerate <span style={{ color: '#4A72D4' }}>·</span> {de ? 'Wissenschaft' : 'Science'}
          </span>
          <div className="w-14" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <div ref={heroRef} className="pt-24 pb-20 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] mb-6" style={{ color: '#4A72D4' }}>
            {de ? 'Formulierungsdokumentation' : 'Formulation Documentation'}
          </p>
          <h1 className="font-display font-bold text-wx-tx1 leading-[1.08] mb-7 flex flex-wrap justify-center gap-x-4 gap-y-1 perspective-[600px]"
            style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}>
            {heroWords.map((w, i) => (
              <span key={i} ref={el => { if (el) wordsRef.current[i] = el; }}
                style={{ display: 'inline-block', opacity: 0 }}>
                {w}
              </span>
            ))}
          </h1>
          <p data-hero-sub className="text-[15px] leading-relaxed text-wx-txm max-w-[520px] mx-auto" style={{ opacity: 0 }}>
            {de
              ? 'Jede Komponente in dieser Formel existiert, weil ein Test gescheitert ist — oder weil ein Kompromiss nicht akzeptabel war.'
              : "Every component in this formula exists because a test failed — or because a compromise was unacceptable."}
          </p>
        </div>

        {/* ── Composition card ── */}
        <div className="mb-28">
          <div className="rounded-2xl border border-wx-bd p-8 sm:p-10"
            style={{ background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)' }}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3" style={{ color: '#4A72D4' }}>
                  {de ? 'Sechs Bestandteile' : 'Six components'}
                </p>
                <h2 className="font-display text-2xl font-bold text-wx-tx1 mb-4 leading-tight">
                  {de ? 'Die vollständige Formel' : 'The complete formula'}
                </h2>
                <p className="text-[14px] leading-relaxed text-wx-txm mb-6">
                  {de
                    ? 'Ein Jahr Iteration — von ersten Schmelzversuchen bis zur stabilen Produktion. Die Mengen werden hier nicht genannt. Was zählt: warum jede Komponente überhaupt drin ist.'
                    : 'A year of iteration — from first melt tests to stable production. Exact quantities are not disclosed here. What matters: why each component is in there at all.'}
                </p>
                <div className="space-y-3">
                  {[
                    { colorIdx: 0, catDe: 'Basismatrix', catEn: 'Base matrix', descDe: 'Kristallines Trägergerüst', descEn: 'Crystalline scaffold' },
                    { colorIdx: 1, catDe: 'Plastifikator', catEn: 'Plasticizer', descDe: 'Kälteflexibilität & Haftung', descEn: 'Cold flexibility & adhesion' },
                    { colorIdx: 2, catDe: 'Härtemodul', catEn: 'Hardener', descDe: 'Schmelzpunkterhöhung', descEn: 'Drop point elevation' },
                    { colorIdx: 3, catDe: 'MoS₂', catEn: 'MoS₂', descDe: 'Primärer Festschmierstoff', descEn: 'Primary solid lubricant' },
                    { colorIdx: 4, catDe: 'Dispergiermittel', catEn: 'Dispersant', descDe: 'Partikelstabilisierung', descEn: 'Particle stabilization' },
                    { colorIdx: 5, catDe: 'Antioxidans', catEn: 'Antioxidant', descDe: 'Langzeitschutz', descEn: 'Long-term protection' },
                  ].map((item, i) => {
                    const colors = ['#1A3080','#2B52B0','#4A72D4','#7A9AEC','#A8C0F4','#C8D8FA'];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[item.colorIdx] }} />
                        <span className="text-[12px] font-semibold text-wx-tx1 w-28 flex-shrink-0">{de ? item.catDe : item.catEn}</span>
                        <span className="text-[12px] text-wx-txf">{de ? item.descDe : item.descEn}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-6 text-wx-txff">
                  {de ? 'Relative Bedeutung — keine Mengenangaben' : 'Relative importance — no quantities shown'}
                </p>
                <CompositionTiers de={de} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-5 mb-28">
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
          <span className="text-[9px] uppercase tracking-[0.3em] text-wx-txff">
            {de ? 'Kapitel für Kapitel' : 'Chapter by chapter'}
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
        </div>

        {/* ══ CHAPTER 01 ══════════════════════════════════════════════════════ */}
        <Chapter num="01" de={de}
          catDe="Die Basis" catEn="The Foundation"
          titleDe="Das kristalline Gerüst"
          titleEn="The crystalline scaffold"
          bodyDe={<>
            <p>Die erste Frage war täuschend einfach: Welches Paraffin? Paraffin ist keine Substanz, sondern eine Kategorie — sie reicht von weichen, öligen Kerzenwachsen bis zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich.</p>
            <p>Wir haben uns für ein vollraffiniertes Erdöldestillat mit einem exakt definierten 2°C-Erstarrungsfenster (58–60°C) entschieden. Diese Enge ist keine Präzision um ihrer selbst willen — sie sichert die Reproduzierbarkeit. Ein breiterer Erstarrungsbereich produziert je nach Batch leicht unterschiedliche Kristallstrukturen. Erster Block, letzter Block, gleiche Charge: identisch.</p>
            <p>Beim Abkühlen aus der Schmelze nucleieren die linearen Kohlenwasserstoffketten (C₂₀–C₃₆) und bilden lamellare Kristalldomänen — ein dreidimensionales Gitterwerk. Alle anderen Komponenten werden in den Zwischenbereichen dieses Gitters eingeschlossen. Die Basismatrix ist das Skelett. Alles andere ist eingebettet.</p>
          </>}
          bodyEn={<>
            <p>The first question was deceptively simple: which paraffin wax? Paraffin isn't a material, it's a category — spanning soft, oily candle waxes to brittle technical grades. The decisive variable is the solidification range.</p>
            <p>We chose a fully refined petroleum distillate with a precisely defined 2°C solidification window (58–60°C). This narrow range isn't precision for its own sake — it ensures reproducibility. A wider solidification range produces subtly different crystal structures batch-to-batch. First block, last block, same production run: identical.</p>
            <p>On cooling from the melt, the linear hydrocarbon chains (C₂₀–C₃₆) nucleate and form lamellar crystal domains — an interlocking three-dimensional lattice. All other components are trapped in the spaces between these crystals. The base matrix is the skeleton. Everything else is embedded within it.</p>
          </>}
          insightDe="Das enge Erstarrungsfenster ist der Schlüssel zur Batch-Konsistenz — und damit zur gleichmäßigen Performance jedes Blocks."
          insightEn="The narrow solidification window is the key to batch consistency — and to every block performing identically."
          visual={<CrystalLattice />}
        />

        {/* ══ CHAPTER 02 ══════════════════════════════════════════════════════ */}
        <Chapter num="02" de={de} flip
          catDe="Härtemodul" catEn="Hardener Module"
          titleDe="Synthetisch reines Härtewachs"
          titleEn="Synthetically pure hard wax"
          bodyDe={<>
            <p>Das zweite Problem war der Sommer. An Kettenkontaktpunkten unter Last können Temperaturen 45–55°C erreichen. Reines Paraffinwachs wäre an seiner thermischen Grenze — es würde erweichen, migrieren, auf dem Schaltwerk landen statt in den Gelenkstiften.</p>
            <p>Die Lösung war ein synthetisches Wachs, hergestellt über den Fischer-Tropsch-Prozess: eine Kohlenstoff-Syntheseroute, die Kohlenwasserstoffketten von außergewöhnlicher Reinheit liefert. Kein Schwefel, keine Aromaten, keine Verzweigungen — nur vollständig lineare Moleküle.</p>
            <p>In gezielt gewählter Konzentration erhöht dieses Additiv den effektiven Tropfpunkt der Gesamtmatrix auf ~72–78°C. Der Mechanismus: Es ko-kristallisiert mit der Basismatrix, bildet aber dichtere, defektärmere Kristalldomänen, die deutlich mehr Energie zum Schmelzen benötigen. Thermisch stabil weit oberhalb jeder realistischen Sommerfahrtemperatur.</p>
          </>}
          bodyEn={<>
            <p>The second problem was summer. At chain contact points under load, temperatures can reach 45–55°C. Unmodified paraffin wax would be at its thermal limit — it would soften, migrate, end up on the derailleur instead of the chain pins.</p>
            <p>The solution was a synthetic wax produced via the Fischer-Tropsch process: a carbon synthesis route that yields hydrocarbon chains of exceptional purity. No sulfur, no aromatics, no branching — only perfectly linear molecules.</p>
            <p>At a carefully chosen concentration, this additive raises the effective drop point of the matrix to ~72–78°C. The mechanism: it co-crystallizes with the base wax but forms denser, more defect-free crystal domains requiring significantly more energy to melt. Thermally stable well above any realistic summer riding temperature.</p>
          </>}
          insightDe="Warum nicht mehr davon? Tests mit höherer Konzentration zeigten keine messbare Verbesserung. Das Optimum liegt unter dem, was man intuitiv erwarten würde."
          insightEn="Why not more? Tests at higher concentrations showed no measurable improvement. The optimum is lower than you'd intuitively expect."
          visual={<TempRange de={de} />}
        />

        {/* ══ CHAPTER 03 ══════════════════════════════════════════════════════ */}
        <Chapter num="03" de={de}
          catDe="Kälteflexibilität" catEn="Cold Flexibility"
          titleDe="Mikrokristallines Wachs"
          titleEn="Microcrystalline wax"
          bodyDe={<>
            <p>Das entgegengesetzte Problem folgte sofort: Winter. Eine reine Paraffinmatrix mit Fischer-Tropsch-Härtemodul ist unterhalb von 5°C extrem spröde — spröde genug, um bei Biegebelastung zu brechen. Ein Kettengelenk, das sich in der Kälte bewegt, ließ die Wachsschicht buchstäblich abplatzen.</p>
            <p>Mikrokristallines Wachs löst dieses Problem strukturell. Im Gegensatz zu den geradkettigen Paraffinen besteht es aus hochverzweigten und zyklischen Molekülen, die keine geordneten Kristallstrukturen bilden können. Sie besetzen die amorphen Bereiche zwischen den Paraffindomänen — molekulare Plastifizierung.</p>
            <p>Diese Komponente erfüllt drei Funktionen gleichzeitig: (1) Die Matrix bleibt bis −10°C elastisch verformbar statt zu brechen. (2) Die verzweigten Moleküle haben stärkere van-der-Waals-Wechselwirkungen mit der Stahloberfläche — bessere Haftung unter Scherkraft. (3) Die amorphen Bereiche betten die MoS₂-Partikel mechanisch in die Matrix ein.</p>
          </>}
          bodyEn={<>
            <p>The opposite problem arrived immediately: winter. A pure paraffin matrix with a Fischer-Tropsch hardener is extremely brittle below 5°C — brittle enough to crack under bending stress. A chain link flexing in cold weather caused the wax coating to literally spall off.</p>
            <p>Microcrystalline wax solves this structurally. Unlike the straight-chain paraffins, it consists of highly branched and cyclic molecules that cannot form ordered crystal structures. They occupy the amorphous zones between the paraffin crystal domains — molecular plasticization.</p>
            <p>This component serves three functions simultaneously: (1) The matrix remains elastically deformable down to −10°C instead of fracturing. (2) The branched molecules have stronger van-der-Waals interactions with the steel surface — better adhesion under shear. (3) The amorphous regions mechanically embed the MoS₂ particles in the matrix.</p>
          </>}
          insightDe="Ursprünglich höher konzentriert. Die Reduzierung war möglich, weil gleichzeitig der MoS₂-Anteil überarbeitet wurde — weniger Partikelmasse erfordert weniger Bindermasse."
          insightEn="Originally at a higher concentration. The reduction was possible because MoS₂ loading was revised simultaneously — less particle mass requires less binder mass."
          visual={
            <div className="rounded-2xl p-5 space-y-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff">
                {de ? 'Temperaturfenster — Matrix flexibel' : 'Temperature window — matrix stays flexible'}
              </p>
              {[
                { labelDe: 'Kälteflexibilität bis', labelEn: 'Cold flexibility to', val: '−10°C', w: 20, color: '#4A72D4' },
                { labelDe: 'Optimale Performance', labelEn: 'Optimal performance', val: '−8°C → +35°C', w: 80, color: '#2B52B0' },
                { labelDe: 'Thermisch stabil bis', labelEn: 'Thermally stable to', val: '+78°C', w: 100, color: '#1A3080' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] text-wx-txm">{de ? item.labelDe : item.labelEn}</span>
                    <span className="text-[11px] font-mono font-semibold text-wx-tx1">{item.val}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.w}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-wx-bd2">
                {[
                  { de: 'Plastifizierung', en: 'Plastification' },
                  { de: 'Haftung', en: 'Adhesion' },
                  { de: 'Partikelbindung', en: 'Particle binding' },
                ].map((fn, i) => (
                  <div key={i} className="text-center rounded-lg py-2 px-1" style={{ background: 'rgba(43,82,176,0.08)', border: '1px solid rgba(43,82,176,0.12)' }}>
                    <p className="text-[10px] font-medium" style={{ color: '#4A72D4' }}>{de ? fn.de : fn.en}</p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* ══ CHAPTER 04 ══════════════════════════════════════════════════════ */}
        <Chapter num="04" de={de} flip
          catDe="Festschmierstoff" catEn="Solid Lubricant"
          titleDe="Molybdändisulfid — &lt;5 µm"
          titleEn="Molybdenum disulfide — &lt;5 µm"
          bodyDe={<>
            <p>MoS₂ ist eines der wenigen Materialien mit einem Reibungskoeffizienten unter 0.05 unter Grenzschmierbedingungen. Der Grund liegt in der Kristallstruktur: Mo-Atome sandwichartig zwischen zwei Schwefelschichten, die Schichten untereinander nur durch schwache van-der-Waals-Kräfte gebunden. Unter Kontaktdruck scheren diese Bindungen — die Schichten gleiten lateral fast widerstandslos.</p>
            <p>An Kettenkontaktflächen unter Last entstehen Drücke von 50–300 MPa. Das ist das Regime der Grenzschmierung — konventionelle Öle können keinen kontinuierlichen Film aufrechterhalten. MoS₂ bildet stattdessen einen Transferfilm: Partikel werden unter Druck auf der Stahloberfläche deponiert und durch tribochemische Bindungen (Mo–S → Fe–S) verankert. Dieser Film persistiert, auch nachdem der Wachsträger längst abgetragen ist.</p>
            <p>Die Partikelgröße ist nicht zufällig: Unter 5 µm passen die Partikel in die Kettenlagerungsspalte (typisch 5–15 µm) und sind dabei groß genug, substanzielle Masse pro Partikel zu transportieren. Eine einzige Ladung Wachs enthält Millionen von Partikeln — ausreichend für mehrfache Transferfilm-Regeneration über hunderte Kilometer. Mehr Konzentration schwächt die Wachsmatrix, ohne tribologischen Mehrwert.</p>
          </>}
          bodyEn={<>
            <p>MoS₂ is one of the few materials with a friction coefficient below 0.05 under boundary lubrication conditions. The crystal structure is the reason: Mo atoms sandwiched between two sulfur layers, with the layers bonded only by weak van-der-Waals forces. Under contact pressure, these bonds shear — the layers slide laterally with almost no resistance.</p>
            <p>At chain contact surfaces under load, pressures reach 50–300 MPa. This is the boundary lubrication regime — conventional oils cannot maintain a continuous film here. MoS₂ instead forms a transfer film: particles are deposited on the steel surface under pressure and anchored by tribochemical bonds (Mo–S → Fe–S). This film persists long after the wax carrier has been worn away.</p>
            <p>Particle size is deliberate: below 5 µm, particles fit within chain clearances (typically 5–15 µm) while being large enough to carry meaningful mass. A single charge of wax contains millions of particles — sufficient for multiple cycles of transfer film regeneration over hundreds of kilometers. Higher concentrations weaken the wax matrix without adding tribological benefit.</p>
          </>}
          insightDe="Der Transferfilm ist der eigentliche Schmierstoff — das Wachs ist nur das Trägervehikel. MoS₂-Schichten, nanometerdick auf dem Stahl, schmieren noch, wenn der Block längst aufgebraucht ist."
          insightEn="The transfer film is the actual lubricant — the wax is just the delivery vehicle. Nanometer-thin MoS₂ layers on the steel continue lubricating long after the block is spent."
          visual={<MoS2Layers de={de} />}
        />

        {/* ══ CHAPTER 05 ══════════════════════════════════════════════════════ */}
        <Chapter num="05" de={de}
          catDe="Dispergiersystem" catEn="Dispersant System"
          titleDe="Amphiphiler Fettsäureester"
          titleEn="Amphiphilic fatty acid ester"
          bodyDe={<>
            <p>MoS₂ hat eine Dichte von 5.06 g/cm³. Paraffinwachs hat eine Dichte von 0.9 g/cm³. Dichteunterschied: Faktor 5.6. Gibt man MoS₂ in geschmolzenes Wachs ohne Stabilisierung, sinken die Partikel messbar schnell. In den Minuten zwischen Rührstopp und Guss bedeutet das messbare Konzentrationsgradienten im fertigen Block — die ersten Scheiben schmiern anders als die letzten.</p>
            <p>Das Dispergiermittel ist ein amphiphiler Fettsäureester: ein Molekül mit einer polaren Kopfgruppe, die über Wasserstoffbrücken an MoS₂-Partikelkanten adsorbiert, und einer langen unpolaren Fettsäurekette, die sich in die Paraffinschmelze erstreckt. Diese Hülle um jeden Partikel erzeugt eine sterische Barriere: Annähernde Partikel müssen die Fettsäureketten komprimieren — dieser entropische Widerstand verhindert Agglomeration und Sedimentation.</p>
            <p>Entscheidend für die Wahl dieses spezifischen Esters: Sein Schmelzpunkt (58–60°C) ist identisch mit der Basismatrix. Die Integration in die erstarrende Matrix verläuft thermodynamisch nahtlos — kein Auftrennen, keine Phasenseparation beim Abkühlen.</p>
          </>}
          bodyEn={<>
            <p>MoS₂ has a density of 5.06 g/cm³. Paraffin wax has a density of 0.9 g/cm³. Density ratio: 5.6×. Add MoS₂ to molten wax without stabilization and the particles sink measurably fast. In the minutes between stopping agitation and casting, this creates measurable concentration gradients in the finished block — early slices lubricate differently from later ones.</p>
            <p>The dispersant is an amphiphilic fatty acid ester: a molecule with a polar head group that adsorbs to MoS₂ particle edges via hydrogen bonds, and a long nonpolar fatty acid tail extending into the paraffin melt. This shell around each particle creates a steric barrier: approaching particles must compress the tails — this entropic resistance prevents agglomeration and sedimentation.</p>
            <p>Critical to the choice of this specific ester: its melting point (58–60°C) is identical to the base matrix. Integration into the solidifying matrix is thermodynamically seamless — no phase separation, no layering on cooling.</p>
          </>}
          insightDe="Ohne Dispergiermittel variiert die MoS₂-Konzentration durch den Block. Der erste Rewax-Vorgang wäre anders als der zwanzigste. Das ist nicht akzeptabel."
          insightEn="Without dispersant, MoS₂ concentration varies through the block. The first rewax would perform differently from the twentieth. Unacceptable."
          visual={<ParticleSuspension de={de} />}
        />

        {/* ══ CHAPTER 06 ══════════════════════════════════════════════════════ */}
        <Chapter num="06" de={de} flip
          catDe="Langzeitstabilität" catEn="Long-term Stability"
          titleDe="Gehindertes Phenol-Antioxidans"
          titleEn="Hindered phenolic antioxidant"
          bodyDe={<>
            <p>Die letzte Frage war Zeit. Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation: Sauerstoffradikale greifen C–H-Bindungen an und initiieren eine Kettenreaktion, die Peroxide, Alkohole und Ketone produziert. Diese Oxidationsprodukte verspröden die Matrix — und können die MoS₂-Oberfläche von einem Schmierstoff (MoS₂) in ein Abrasivum verwandeln (MoO₃, gebildet durch Mo⁴⁺ → Mo⁶⁺ Oxidation).</p>
            <p>Ein gehindertes Phenol-Antioxidans wirkt als Radikalkettenabbrecher: Die phenolische OH-Gruppe doniert ein Wasserstoffatom an Peroxylradikale (ROO•) und bricht die Oxidationskaskade ab. Das resultierende Phenoxyradikal ist durch sterische Gruppen stabilisiert und reaktionsträgert. Eine Komponente mit drei Schutzebenen: Wachsmatrix, MoS₂-Oberfläche, Lagerstabilität.</p>
            <p>Die Konzentration wurde leicht erhöht, als wir einen separaten Korrosionsinhibitor aus einer früheren Formulierungsversion entfernt haben. Dieser hatte eine sekundäre antioxidative Wirkung. Ohne ihn trägt das Phenol-Antioxidans die gesamte Last — eine leichte Erhöhung kompensiert dies vollständig, bei Mehrkosten von unter einem Euro pro Produktionsbatch.</p>
          </>}
          bodyEn={<>
            <p>The last question was time. A wax block that performs in week 1 but degrades by month 6 isn't a product. Hydrocarbon waxes are susceptible to autoxidation: oxygen radicals attack C–H bonds, initiating a chain reaction producing peroxides, alcohols, and ketones. These oxidation products embrittle the matrix — and can convert the MoS₂ surface from a lubricant (MoS₂) into an abrasive (MoO₃, formed by Mo⁴⁺ → Mo⁶⁺ oxidation).</p>
            <p>A hindered phenolic antioxidant acts as a radical chain-breaker: the phenolic OH group donates a hydrogen atom to peroxyl radicals (ROO•), breaking the oxidation cascade. The resulting phenoxy radical is stabilized by steric bulk and is unreactive. One component, three protection layers: wax matrix, MoS₂ surface, shelf life.</p>
            <p>Concentration was raised slightly when we removed a separate corrosion inhibitor from an earlier formula version. That inhibitor had a secondary antioxidant effect. Without it, the phenolic antioxidant carries the full stabilization load — a slight increase covers this completely at an additional cost of under one euro per production batch.</p>
          </>}
          insightDe="Das Antioxidans schützt nicht nur das Wachs, sondern auch den Festschmierstoff. Oxidiertes MoS₂ ist MoO₃ — und das ist abrasiv. Eine Komponente, die zwei Versagensmodi gleichzeitig verhindert."
          insightEn="The antioxidant protects not just the wax, but also the solid lubricant. Oxidized MoS₂ is MoO₃ — and that's abrasive. One component preventing two failure modes simultaneously."
          visual={
            <div className="rounded-2xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff mb-5">
                {de ? 'Drei Schutzebenen' : 'Three protection layers'}
              </p>
              <div className="space-y-3">
                {[
                  { n: '01', titleDe: 'Wachsmatrix', titleEn: 'Wax matrix',
                    descDe: 'Stoppt Autoxidation der Kohlenwasserstoffketten — bei Produktion und Lagerung.',
                    descEn: 'Stops autoxidation of hydrocarbon chains — during production and storage.' },
                  { n: '02', titleDe: 'MoS₂-Oberfläche', titleEn: 'MoS₂ surface',
                    descDe: 'Verhindert langsame MoS₂ → MoO₃ Oxidation durch Sauerstoffspuren in der Matrix.',
                    descEn: 'Prevents slow MoS₂ → MoO₃ surface oxidation from trace oxygen in the matrix.' },
                  { n: '03', titleDe: 'Lagerstabilität', titleEn: 'Shelf life',
                    descDe: 'Peroxidzahl bleibt auch nach 12–24 Monaten unter dem Leistungsgrenzwert.',
                    descEn: 'Peroxide value stays below the performance threshold after 12–24 months.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3.5 p-3.5 rounded-xl" style={{ background: 'rgba(43,82,176,0.06)', border: '1px solid rgba(43,82,176,0.12)' }}>
                    <span className="font-display text-[22px] font-bold tabular-nums flex-shrink-0 leading-none mt-0.5" style={{ color: 'rgba(43,82,176,0.3)' }}>{item.n}</span>
                    <div>
                      <p className="text-[12px] font-semibold text-wx-tx1 mb-1">{de ? item.titleDe : item.titleEn}</p>
                      <p className="text-[11px] text-wx-txm leading-relaxed">{de ? item.descDe : item.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* ── Results ── */}
        <div className="mb-28">
          <div className="text-center mb-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-2" style={{ color: '#4A72D4' }}>
              {de ? 'Das Ergebnis' : 'The Result'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-wx-tx1 leading-tight">
              {de ? 'Was die Formel leistet' : 'What the formula delivers'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FrictionBars de={de} />
            <div className="rounded-2xl p-5" style={{ background: 'var(--sf2)', border: '1px solid var(--bd)' }}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-wx-txff mb-5">
                {de ? 'Konsistenz — Block zu Block' : 'Consistency — block to block'}
              </p>
              <div className="space-y-4">
                {[
                  { de: 'Erster Block', en: 'First block' },
                  { de: 'Zehnter Block', en: 'Tenth block' },
                  { de: 'Zwanzigster Block', en: 'Twentieth block' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[12px] text-wx-txm">{de ? item.de : item.en}</span>
                      <span className="text-[11px] font-medium" style={{ color: '#4A72D4' }}>
                        {de ? 'Identisch' : 'Identical'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bd2)' }}>
                      <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(90deg,#1A3080,#4A72D4)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-wx-txm mt-5 pt-4 leading-relaxed" style={{ borderTop: '1px solid var(--bd2)' }}>
                {de
                  ? 'Das Dispergiersystem stellt sicher, dass MoS₂ gleichmäßig im Gussblock verteilt ist — von der ersten bis zur letzten Scheibe.'
                  : 'The dispersant system ensures MoS₂ is uniformly distributed throughout the cast block — from first slice to last.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mb-28">
          <div className="rounded-2xl border border-wx-bd overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--card-from) 0%, var(--card-to) 100%)' }}>
            <div className="p-10 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3" style={{ color: '#4A72D4' }}>
                {de ? 'Bereit?' : 'Ready?'}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-wx-tx1 mb-3 leading-tight">
                {de ? 'Die Formel auf deiner Kette.' : 'Put the formula on your chain.'}
              </h2>
              <p className="text-[14px] text-wx-txm mb-7 max-w-sm mx-auto">
                {de
                  ? 'Waxcelerate Pro und Classic direkt über eBay — mit vollem Käuferschutz.'
                  : 'Waxcelerate Pro and Classic via eBay — with full buyer protection.'}
              </p>
              <Link to="/"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[14px] text-white transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg,#1A3080,#4A72D4)' }}>
                <ArrowLeft className="w-4 h-4" />
                {de ? 'Zurück zu den Produkten' : 'Back to products'}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
