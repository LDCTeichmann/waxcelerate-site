import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { symptoms } from '../hubContent';
import type { Symptom, SymptomId } from '../hubContent';
import { headingId } from '../headingId';

/** Position der Markierungen in der Grafik (viewBox 520 x 300). */
const SPOTS: Record<SymptomId, { x: number; y: number }> = {
  quietscht: { x: 272, y: 88 },
  blaettert: { x: 52, y: 170 },
  pulver: { x: 214, y: 255 },
  rost: { x: 318, y: 262 },
  schaltung: { x: 400, y: 208 },
  verschleiss: { x: 390, y: 130 },
};

/** Weg der Kette: obere Strecke, um die Kassette, durchs Schaltwerk, untere
 *  Strecke, um das Kettenblatt zurueck. */
const CHAIN_PATH = 'M130,92 L390,84 A46,46 0 0,1 390,176 L388,208 L390,256 A12,12 0 0,1 378,268 L130,248 A78,78 0 0,1 130,92 Z';

/**
 * Seitenansicht eines Antriebs, als Linienzeichnung in den Farben der Seite.
 * Keine Fotografie: die Markierungen muessen auf dem Bauteil sitzen, und das
 * klappt nur, wenn Bild und Koordinaten aus derselben Quelle kommen.
 */
function Drivetrain() {
  return (
    <svg viewBox="0 0 520 300" className="w-full h-auto" aria-hidden>
      {/* Rahmen: Kettenstrebe und Sitzstrebe, nur angedeutet */}
      <line x1="130" y1="170" x2="390" y2="130" stroke="var(--tx1)" strokeOpacity="0.07" strokeWidth="16" strokeLinecap="round" />
      <line x1="390" y1="130" x2="318" y2="10" stroke="var(--tx1)" strokeOpacity="0.07" strokeWidth="12" strokeLinecap="round" />

      {/* Kettenblatt mit Zaehnen und Spider */}
      <circle cx="130" cy="170" r="72" fill="none" stroke="var(--tx1)" strokeOpacity="0.28" strokeWidth="9" strokeDasharray="3.2 3" />
      <circle cx="130" cy="170" r="62" fill="none" stroke="var(--tx1)" strokeOpacity="0.18" strokeWidth="2" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <line
          key={deg}
          x1="130" y1="170"
          x2={130 + 58 * Math.cos((deg * Math.PI) / 180)}
          y2={170 + 58 * Math.sin((deg * Math.PI) / 180)}
          stroke="var(--tx1)" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round"
        />
      ))}
      {/* Kurbel und Pedal */}
      <line x1="130" y1="170" x2="84" y2="252" stroke="var(--tx1)" strokeOpacity="0.35" strokeWidth="13" strokeLinecap="round" />
      <rect x="62" y="246" width="44" height="12" rx="4" fill="var(--tx1)" fillOpacity="0.3" />
      <circle cx="130" cy="170" r="11" fill="var(--sf)" stroke="var(--tx1)" strokeOpacity="0.4" strokeWidth="3" />

      {/* Kassette */}
      {[42, 36, 30, 24, 18].map((r) => (
        <circle key={r} cx="390" cy="130" r={r} fill="none" stroke="var(--tx1)" strokeOpacity="0.22" strokeWidth="3" strokeDasharray={r > 30 ? '2.4 2.4' : undefined} />
      ))}
      <circle cx="390" cy="130" r="7" fill="var(--tx1)" fillOpacity="0.35" />

      {/* Schaltwerk: Aufhaengung, Koerper, Kaefig */}
      <line x1="390" y1="130" x2="436" y2="170" stroke="var(--tx1)" strokeOpacity="0.2" strokeWidth="7" strokeLinecap="round" />
      <line x1="436" y1="170" x2="404" y2="206" stroke="var(--tx1)" strokeOpacity="0.28" strokeWidth="12" strokeLinecap="round" />
      <line x1="400" y1="208" x2="378" y2="256" stroke="var(--tx1)" strokeOpacity="0.14" strokeWidth="22" strokeLinecap="round" />

      {/* Kette: breites Band, darauf gestrichelt die Glieder */}
      <path d={CHAIN_PATH} fill="none" stroke="var(--txm)" strokeOpacity="0.75" strokeWidth="9" strokeLinejoin="round" />
      <path d={CHAIN_PATH} fill="none" stroke="var(--sf)" strokeWidth="3.5" strokeDasharray="7 4" strokeLinejoin="round" />

      {/* Schaltroellchen ueber der Kette */}
      <circle cx="400" cy="208" r="10" fill="var(--sf)" stroke="var(--tx1)" strokeOpacity="0.45" strokeWidth="3" />
      <circle cx="378" cy="256" r="10" fill="var(--sf)" stroke="var(--tx1)" strokeOpacity="0.45" strokeWidth="3" />
    </svg>
  );
}

function Hotspot({ symptom, index, active, onSelect }: { symptom: Symptom; index: number; active: boolean; onSelect: () => void }) {
  const spot = SPOTS[symptom.id];
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onSelect}
      aria-pressed={active}
      aria-label={`${symptom.label} (${symptom.where})`}
      className="absolute -translate-x-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-full"
      style={{ left: `${(spot.x / 520) * 100}%`, top: `${(spot.y / 300) * 100}%` }}
    >
      {!active && (
        <span
          className="absolute inset-1 rounded-full animate-ping motion-reduce:hidden"
          style={{ background: 'rgba(var(--accent-rgb),0.35)', animationDuration: '2.4s', animationDelay: `${index * 0.4}s` }}
          aria-hidden
        />
      )}
      <span
        className="relative h-7 w-7 rounded-full inline-flex items-center justify-center font-mono text-[12px] font-semibold transition-transform"
        style={
          active
            ? { background: 'var(--accent)', color: 'var(--pg)', transform: 'scale(1.15)', boxShadow: '0 0 0 4px rgba(var(--accent-rgb),0.25)' }
            : { background: 'var(--sf)', color: 'var(--accent)', border: '2px solid var(--accent)' }
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
 * Reparaturhilfe, der Einstieg ueber das, was man am Rad sieht oder hoert: ein
 * Antrieb mit Markierungen, daneben pro Symptom Ursache, schnelle Loesung und
 * der Sprung genau in den Abschnitt, der es erklaert.
 */
export function SymptomFinder() {
  const [activeId, setActiveId] = useState<SymptomId>(symptoms[0].id);
  const active = symptoms.find((s) => s.id === activeId) ?? symptoms[0];

  return (
    <section aria-labelledby="symptome-titel" className="mb-24">
      <div className="max-w-xl mb-8">
        <p className="font-mono text-small uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>
          Etwas stimmt nicht?
        </p>
        <h2 id="symptome-titel" className="font-display text-[28px] sm:text-[34px] font-bold text-wx-tx1 leading-[1.1] mb-3">
          Was ist los mit deiner Kette?
        </h2>
        <p className="text-[15px] leading-[1.7] text-wx-txm">
          Tipp auf die Stelle, an der es hakt. Du bekommst die wahrscheinlichste
          Ursache, die schnelle Lösung und den Abschnitt, der es genau erklärt.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] items-stretch">
        <div className="rounded-3xl p-4 sm:p-8 flex flex-col" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
          <div className="relative">
            <Drivetrain />
            {symptoms.map((s, i) => (
              <Hotspot key={s.id} symptom={s} index={i} active={s.id === activeId} onSelect={() => setActiveId(s.id)} />
            ))}
          </div>
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
            {symptoms.map((s, i) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  aria-pressed={isActive}
                  className="text-[13px] px-3 py-2 rounded-full transition-colors inline-flex items-center gap-2"
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
          <p className="font-mono text-small uppercase tracking-[0.18em] text-wx-txf mb-3">
            {active.where}
          </p>
          <h3 className="font-display text-[26px] font-bold text-wx-tx1 leading-tight mb-6">{active.label}</h3>

          <p className="font-mono text-small uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>
            Wahrscheinliche Ursache
          </p>
          <p className="text-[15px] leading-[1.7] text-wx-tx2 mb-6">{active.cause}</p>

          <div className="rounded-2xl px-5 py-4 mb-7" style={{ background: 'var(--accent-wash)', borderLeft: '3px solid var(--accent)' }}>
            <p className="font-mono text-small uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--accent)' }}>
              Schnelle Lösung
            </p>
            <p className="text-[15px] leading-[1.65] text-wx-tx1">{active.fix}</p>
          </div>

          <Link
            to={`/blog/${active.slug}#${headingId(active.heading)}`}
            className="mt-auto inline-flex items-center gap-2 text-[14px] font-semibold w-fit"
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
