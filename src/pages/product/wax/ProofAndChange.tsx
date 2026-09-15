import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { trustStats, type Product } from '@/lib/data';
import { medianChainPrice } from '@/lib/waxMath';
import type { RichContent } from '@/lib/productContent';
import type { Review } from '@/sections/reviews';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico, CHANGE_ICONS } from './Ico';

// ── Proof-Leiste ────────────────────────────────────────────────────────────
// Direkt unter dem ersten Screen, dunkel als Tiefenwechsel: ein Gesicht, ein
// Satz, drei Zahlen. Die Zahlen sind kontoweit (trustStats) und werden weiter
// unten bei den Bewertungen auch so benannt.
export function ProofStrip({ de, quote }: { de: boolean; quote: Review | undefined }) {
  const photo = quote?.photo?.replace(/\.jpg$/, '.webp');
  // Nur zitieren, was die Person wirklich geschrieben hat: der Kernsatz, wenn
  // er in ihrer Bewertung steht, sonst ihr erster Satz. Vorher stand hier fest
  // "Kein Zurück mehr zum Öl." unter jedem Namen, auch unter Bewertungen, die
  // den Satz nicht enthalten (Kettenseite, 15.09.2026).
  const text = (de ? quote?.textDe : quote?.textEn) ?? '';
  const key = de ? 'Kein Zurück mehr zum Öl.' : 'No going back to oil.';
  const first = text.split(/(?<=[.!?])\s/)[0] ?? '';
  const line = text.includes(key) ? key : first.length > 90 ? `${first.slice(0, 88).trimEnd()} …` : first;
  return (
    <section className="wxp-proof pdp-dark" aria-label={de ? 'Vertrauen' : 'Trust'}>
      <div className="wxp-wrap">
        {quote && (
          <div className="q">
            {photo && <img src={photo} alt="" loading="lazy" decoding="async" />}
            <p>{de ? `„${line}“` : `“${line}”`}
              <small>{quote.name} · {quote.source === 'web' ? (de ? 'verifizierter Käufer' : 'verified buyer') : (de ? 'eBay verifiziert' : 'eBay verified')} · ★★★★★</small></p>
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
  const points = t.whyWax.points.map((p, i) => ({ ...p, icon: CHANGE_ICONS[i] }));

  return (
    <section className="wxp-chapter">
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Kapitel 01' : 'Chapter 01'}</p>
          <h2>{de ? 'Was sich für dich ändert.' : 'What changes for you.'}</h2>
          <p>{de ? 'Wachs härtet trocken aus. Alles Weitere folgt daraus.' : 'Wax sets dry. Everything else follows from that.'}</p>
        </div>
        <div className="wxp-split">
          {/* v5: Bildmass 1120 × 933 statt 1/1.02 mit object-contain — das
              gab oben und unten schwarze Balken. Labels jetzt aufs Bild. */}
          <div className="wxp-cmpframe">
            <BeforeAfterSlider
              beforeSrc="/images/compare/chain-oel.webp" afterSrc="/images/compare/chain-wachs.webp"
              beforeAlt={de ? 'Kette mit Kettenöl, dunkel und verklebt' : 'Chain with chain oil, dark and sticky'}
              afterAlt={de ? 'Dieselbe Kette mit Heißwachs, sauber und trocken' : 'Same chain with hot wax, clean and dry'}
              beforeLabel={t.whyWax.oilLabel} afterLabel={t.whyWax.waxLabel} aspect="1120/933"
              fit="cover" bare overlayLabels />
          </div>
          <ul className="wxp-points">
            {points.map(p => (
              <li key={p.title}>
                <span className="ic"><Ico name={p.icon} /></span>
                <div><h3>{p.title}</h3><p>{p.body}</p></div>
              </li>
            ))}
          </ul>
        </div>
        {figs.length > 0 && (
          <dl className="wxp-figs">
            {figs.map(s => (
              <div key={s.label}>
                <dd className="v">{split(s.value)[0]}{split(s.value)[1] && <small> {split(s.value)[1]}</small>}</dd>
                <dt className="k">{s.label}</dt>
                <dd className="s">{s.sub}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
