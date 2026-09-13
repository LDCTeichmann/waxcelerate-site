import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { trustStats } from '@/lib/data';
import type { RichContent } from '@/lib/productContent';
import type { Review } from '@/sections/reviews';
import type { useLanguage } from '@/hooks/useLanguage';
import { Ico, type IcoName } from './Ico';

// ── Proof-Leiste ────────────────────────────────────────────────────────────
// Direkt unter dem ersten Screen, dunkel als Tiefenwechsel: ein Gesicht, ein
// Satz, drei Zahlen. Die Zahlen sind kontoweit (trustStats) und werden weiter
// unten bei den Bewertungen auch so benannt.
export function ProofStrip({ de, quote }: { de: boolean; quote: Review | undefined }) {
  const photo = quote?.photo?.replace(/\.jpg$/, '.webp');
  return (
    <section className="wxp-proof pdp-dark" aria-label={de ? 'Vertrauen' : 'Trust'}>
      <div className="wxp-wrap">
        {quote && (
          <div className="q">
            {photo && <img src={photo} alt="" loading="lazy" decoding="async" />}
            <p>{de ? '„Kein Zurück mehr zum Öl.“' : '“No going back to oil.”'}
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
export function ChangeForYou({ de, t, rc }: { de: boolean; t: ReturnType<typeof useLanguage>['t']; rc: RichContent | undefined }) {
  const points: { icon: IcoName; title: string; body: string }[] = de ? [
    { icon: 'hand', title: 'Du bleibst sauber.', body: 'Kein Ketten-Abdruck an der Wade, keine schwarzen Finger beim Rad-Einladen.' },
    { icon: 'gear', title: 'Im Gelenk mahlt nichts mehr.', body: 'Öl bindet Staub zu Schleifpaste zwischen Bolzen und Rolle. An trockenem Wachs haftet kein Dreck.' },
    { icon: 'shieldPlain', title: 'Der ganze Antrieb hält länger.', body: 'Die Kette oft 2–3× so lange, Kassette und Kettenblätter verschleißen mit ihr langsamer.' },
    { icon: 'calendar', title: 'Pflege wird selten.', body: 'Alle ~300 km neu wachsen statt nach jeder Regenfahrt ölen. Ohne Lappen und Kettenreiniger.' },
  ] : [
    { icon: 'hand', title: 'You stay clean.', body: 'No chain mark on your calf, no black fingers when loading the bike.' },
    { icon: 'gear', title: 'Nothing grinds in the joints.', body: 'Oil binds dust into grinding paste between pin and roller. Dry wax gives dirt nothing to stick to.' },
    { icon: 'shieldPlain', title: 'The whole drivetrain lasts longer.', body: 'The chain often lasts 2–3× as long, cassette and chainrings wear more slowly with it.' },
    { icon: 'calendar', title: 'Maintenance becomes rare.', body: 'Rewax roughly every 300 km instead of oiling after every wet ride. No rags, no degreaser.' },
  ];

  return (
    <section className="wxp-chapter">
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Kapitel 01' : 'Chapter 01'}</p>
          <h2>{de ? 'Was sich für dich ändert.' : 'What changes for you.'}</h2>
          <p>{de ? 'Wachs härtet trocken aus. Alles Weitere folgt daraus.' : 'Wax sets dry. Everything else follows from that.'}</p>
        </div>
        <div className="wxp-split">
          <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.18)' }}>
            <BeforeAfterSlider
              beforeSrc="/images/compare/chain-oel.webp" afterSrc="/images/compare/chain-wachs.webp"
              beforeAlt={de ? 'Kette mit Kettenöl, dunkel und verklebt' : 'Chain with chain oil, dark and sticky'}
              afterAlt={de ? 'Dieselbe Kette mit Heißwachs, sauber und trocken' : 'Same chain with hot wax, clean and dry'}
              beforeLabel={t.whyWax.oilLabel} afterLabel={t.whyWax.waxLabel} aspect="1/1.02" />
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
        {rc?.stats && rc.stats.length > 0 && (
          <dl className="wxp-figs">
            {rc.stats.map(s => (
              <div key={s.label}>
                <dd className="v">{s.value}</dd>
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
