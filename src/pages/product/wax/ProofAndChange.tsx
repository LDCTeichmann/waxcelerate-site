import { useEffect, useRef, useState } from 'react';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { trustStats, type Product } from '@/lib/data';
import { medianChainPrice } from '@/lib/waxMath';
import type { RichContent } from '@/lib/productContent';
import type { Review } from '@/sections/reviews';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico, CHANGE_ICONS } from './Ico';
import { tidyQuote, quoted } from './WaxSections';

// ── Proof-Leiste ────────────────────────────────────────────────────────────
// Direkt unter dem ersten Screen, dunkel als Tiefenwechsel: ein echter Satz
// aus einer eBay-Bewertung (pull, wortgleich), drei Zahlen. Die Zahlen sind
// kontoweit (trustStats) und werden weiter
// unten bei den Bewertungen auch so benannt.
export function ProofStrip({ de, quote }: { de: boolean; quote: Review | undefined }) {
  // Nur zitieren, was die Person wirklich geschrieben hat: ihr erster Satz,
  // lange Saetze gekuerzt (Kettenseite, 15.09.2026).
  const text = tidyQuote((de ? quote?.textDe : quote?.textEn) ?? '');
  const first = text.split(/(?<=[.!?…])\s/)[0] ?? '';
  const line = first.length > 90 ? `${first.slice(0, 88).trimEnd()} …` : first;
  return (
    <section className="wxp-proof pdp-dark" aria-label={de ? 'Vertrauen' : 'Trust'}>
      <div className="wxp-wrap">
        {quote && (
          <div className="q">
            {/* Kein Foto neben dem Namen: ein Bild neben einem Kundenzitat
                liest sich als Kundenfoto (Luca, 16.09.2026). */}
            <span className="qm" aria-hidden>“</span>
            <p>{quoted(line, de)}
              <small>{quote.name} · {de ? 'eBay verifiziert' : 'eBay verified'} · ★★★★★</small></p>
          </div>
        )}
        <div className="n"><div className="v num">{trustStats.reviews}</div><div className="k">{de ? 'Bewertungen' : 'reviews'}</div></div>
        <div className="n"><div className="v num">100 %</div><div className="k">{de ? 'positiv' : 'positive'}</div></div>
        <div className="n"><div className="v num">{trustStats.sold}+</div><div className="k">{de ? 'verkauft' : 'sold'}</div></div>
      </div>
    </section>
  );
}

// ── Kapitel 01 · Was sich fuer dich aendert ────────────────────────────────
// Erst das Bild von sich selbst (saubere Finger), dann der Mechanismus, erst
// am Ende Messwerte. Icons statt 01–04: die Punkte haben keine Reihenfolge.
// "Es wird leise" bleibt draussen, bis Luca den Claim freigibt (PROJECT.md).
export function ChangeForYou({ product, de, t, rc }: { product: Product; de: boolean; t: ReturnType<typeof useLanguage>['t']; rc: RichContent | undefined }) {
  // Vierte Kennzahl statt der Reibungszahl (Luca, 14.09.2026: die war als
  // Einzelwert angreifbar). Aus den Preisen gerechnet wie in WaxHero.
  const fmt = (n: number) => n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const figs = [
    ...(rc?.stats ?? []),
    // Nur fuer Wachs: auf der Kettenseite (seit 15.09.2026 dieselbe
    // Komponente) ergaebe "< 1 Kette kostet der Block" keinen Sinn.
    ...(product.category === 'wax' && product.price < medianChainPrice ? [{
      value: '< 1',
      label: de ? 'Kette kostet der Block' : 'chain is what the block costs',
      sub: de ? `${fmt(product.price)} € gegen ~${fmt(medianChainPrice)} € für eine Kette.` : `€${fmt(product.price)} versus ~€${fmt(medianChainPrice)} for one chain.`,
    }] : []),
  ];
  // Einheit klein neben der Zahl ("250–450 km"), damit vier Kennzahlen in
  // eine Zeile passen.
  const split = (v: string) => { const m = v.match(/^(.*?)\s+(km)$/); return m ? [m[1], m[2]] : [v, '']; };

  // Texte teilt sich die Seite mit der Startseite (i18n whyWax.points).
  // 26.09.2026 (Luca: "emotionaler, mit Bildern"): jeder Punkt bekommt ein
  // eigenes Foto, die Kennzahlen stehen neben dem Vorher/Nachher-Regler und
  // zaehlen beim Hereinscrollen hoch.
  const points = t.whyWax.points.map((p, i) => ({ ...p, icon: CHANGE_ICONS[i], photo: CHANGE_PHOTOS[i] }));

  return (
    <section className="wxp-chapter wxp-change">
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Kapitel 01' : 'Chapter 01'}</p>
          <h2>{de ? 'Was sich für dich ändert.' : 'What changes for you.'}</h2>
          <p>{de ? 'Wachs härtet trocken aus. Alles Weitere folgt daraus.' : 'Wax sets dry. Everything else follows from that.'}</p>
        </div>
        <div className="wxp-change-top">
          {/* v5: Bildmass 1120 × 933 statt 1/1.02 mit object-contain — das
              gab oben und unten schwarze Balken. Labels jetzt aufs Bild. */}
          <div>
          <div className="wxp-cmpframe">
            <BeforeAfterSlider
              beforeSrc="/images/compare/chain-oel.webp" afterSrc="/images/compare/chain-wachs.webp"
              beforeAlt={de ? 'Kette mit Kettenöl, dunkel und verklebt' : 'Chain with chain oil, dark and sticky'}
              afterAlt={de ? 'Dieselbe Kette mit Heißwachs, sauber und trocken' : 'Same chain with hot wax, clean and dry'}
              beforeLabel={t.whyWax.oilLabel} afterLabel={t.whyWax.waxLabel} aspect="1120/933"
              fit="cover" bare overlayLabels />
          </div>
          <p className="wxp-cmpcap">{t.whyWax.captionPhoto}</p>
          </div>
          {figs.length > 0 && (
            <dl className="wxp-figs wxp-figs--grid">
              {figs.map(s => (
                <div key={s.label}>
                  <dd className="v"><CountUp value={split(s.value)[0]} />{split(s.value)[1] && <small> {split(s.value)[1]}</small>}</dd>
                  <dt className="k">{s.label}</dt>
                  <dd className="s">{s.sub}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <ul className="wxp-moments">
          {points.map(p => (
            <li key={p.title} className="wxp-moment">
              <div className="ph">
                <img src={p.photo.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: p.photo.pos }} />
                <span className="ic"><Ico name={p.icon} /></span>
              </div>
              <div className="tx"><h3>{p.title}</h3><p>{p.body}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Ein Foto je Punkt aus whyWax.points (gleiche Reihenfolge): sauber fahren,
// das Gelenk von nah, der Antrieb am Rad, das Wachsbad.
const CHANGE_PHOTOS: { src: string; pos?: string }[] = [
  { src: '/images/blog/ride-road-golden-800.webp', pos: '50% 35%' },
  { src: '/images/blog/chain-links-macro-800.webp' },
  { src: '/images/blog/chain-drivetrain-closeup-800.webp' },
  { src: '/images/blog/wax-bath-hanging-800.webp', pos: '50% 60%' },
];

// Zaehlt alle Zahlen in einem Wert wie "20–32" oder "2–3×" hoch, sobald er
// sichtbar wird. Erster Render (und Prerender-HTML) zeigt den Endwert, bei
// reduzierter Bewegung bleibt es dabei.
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    const nums = value.match(/\d+(?:[.,]\d+)?/g);
    if (!el || !nums || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const render = (k: number) => {
      let i = 0;
      return value.replace(/\d+(?:[.,]\d+)?/g, () => {
        const n = parseFloat(nums[i++].replace(',', '.'));
        return String(Math.round(n * k));
      });
    };
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setShown(render(0));
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1100);
        const eased = 1 - Math.pow(1 - k, 3);
        setShown(k < 1 ? render(eased) : value);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref} className="num">{shown}</span>;
}
