import { waxVsOil, waxProcessTimeline } from '@/lib/data';

// ══════════════════════════════════════════════════════════════
// Vorschauen fuer das "Mehr wissen"-Deck (DeepDive.tsx)
// ══════════════════════════════════════════════════════════════
// Luca, 25.09.2026: die Karten "sehen uninteressant aus und zeigen noch
// nichts". Jede Karte zeigt jetzt im Kleinen, was dahinter steckt — dieselbe
// Bildsprache wie der geoeffnete Inhalt (Lupe, Ersparnis, Uhr, Kreislauf),
// als leichtes statisches SVG. Der schwere Inhalt wird weiterhin erst beim
// Oeffnen gemountet. Farben wie FrictionLens: Metall grau, nur Wachs blau.

const MONO = 'IBM Plex Mono, monospace';

/** Querschnitt durchs Gelenk wie in der grossen Lupe. Bei Hover ueber die
 *  Karte wechseln die Spalten von Wachs (blau) zu Oel (koernig) — .wxp-ddp-oil
 *  in wax.css. */
export function FrictionPreview() {
  const ring = (r: number, w: number) => ({ cx: 60, cy: 60, r, fill: 'none', strokeWidth: w });
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true">
      <defs>
        <pattern id="ddp-grit" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#3A2F24" />
          <circle cx="1.5" cy="2" r=".8" fill="#A8977C" /><circle cx="4.5" cy="4.5" r=".7" fill="#8A7A62" />
        </pattern>
      </defs>
      <circle cx="60" cy="60" r="54" fill="#101318" stroke="#fff" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="46" fill="#3B424C" stroke="#A9B2BD" strokeWidth="1" />
      <circle {...ring(34, 6)} stroke="#5685C0" />
      <circle {...ring(34, 6)} stroke="url(#ddp-grit)" className="wxp-ddp-oil" />
      <circle cx="60" cy="60" r="31" fill="#2F353E" stroke="#A9B2BD" strokeWidth="1" />
      <circle {...ring(20, 5)} stroke="#5685C0" />
      <circle {...ring(20, 5)} stroke="url(#ddp-grit)" className="wxp-ddp-oil" />
      <circle cx="60" cy="60" r="17" fill="#C9D1DA" stroke="#8C959F" strokeWidth="1" />
      <g fontFamily={MONO} fontSize="10" fill="#A9C4E6">
        <text x="132" y="44">01 Bolzen</text>
        <text x="132" y="64">02 Rolle</text>
        <text x="132" y="84">03 Laschen</text>
      </g>
      <line x1="80" y1="41" x2="128" y2="41" stroke="rgba(169,196,230,.35)" strokeDasharray="2 3" />
      <line x1="94" y1="61" x2="128" y2="61" stroke="rgba(169,196,230,.35)" strokeDasharray="2 3" />
    </svg>
  );
}

/** Ersparnis als zwei Balken Oel gegen Wachs, Zahlen aus waxVsOil.cost. */
export function SavingsPreview({ de }: { de: boolean }) {
  const { oilEur, waxEur, savedEur, km } = waxVsOil.cost;
  const w = (v: number) => (v / oilEur) * 150;
  const kmTxt = km.toLocaleString(de ? 'de-DE' : 'en-US');
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true">
      <text x="12" y="34" fontFamily="Fraunces, Georgia, serif" fontWeight="800" fontSize="28" fill="#fff">
        {de ? `~${savedEur} €` : `~€${savedEur}`}
      </text>
      <text x="12" y="50" fontFamily={MONO} fontSize="9.5" fill="#A1A1A1">{de ? `gespart auf ${kmTxt} km` : `saved over ${kmTxt} km`}</text>
      <g fontFamily={MONO} fontSize="9.5">
        <text x="12" y="76" fill="#A1A1A1">{de ? 'Öl' : 'Oil'}</text>
        <rect x="48" y="68" width={w(oilEur)} height="10" rx="3" fill="#6B7380" />
        <text x={52 + w(oilEur)} y="76" fill="#C4CBD3">{oilEur} €</text>
        <text x="12" y="98" fill="#A9C4E6">{de ? 'Wachs' : 'Wax'}</text>
        <rect x="48" y="90" width={w(waxEur)} height="10" rx="3" fill="#5685C0" className="wxp-ddp-grow" />
        <text x={52 + w(waxEur)} y="98" fill="#DDE7F4">{waxEur} €</text>
      </g>
    </svg>
  );
}

/** Uhr wie in ProcessWatch: Handarbeit je Wachsgang (aktive Schritte ohne
 *  die einmalige Erstreinigung) gegen Wartezeit. */
export function ClockPreview({ de }: { de: boolean }) {
  // Nachwachsen ohne die einmalige Erstreinigung. Nebenlauf-Schritte (Kette
  // abnehmen, waehrend das Wachs schmilzt) zaehlen zur Handarbeit, aber nicht
  // zur Uhr — sie laufen parallel, wie in ProcessWatch.
  const repeat = waxProcessTimeline.filter(s => !s.firstOnly);
  const steps = repeat.filter(s => s.lane !== 'side');
  const total = steps.reduce((a, s) => a + s.minutes, 0);
  const work = repeat.filter(s => s.active).reduce((a, s) => a + s.minutes, 0);
  const R = 40, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true">
      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
      <g transform="rotate(-90 60 60)">
        {steps.map((s, i) => {
          const len = (s.minutes / total) * C;
          const el = (
            <circle key={i} cx="60" cy="60" r={R} fill="none" strokeWidth="9"
              stroke={s.active ? '#5685C0' : 'rgba(255,255,255,.28)'}
              strokeDasharray={`${Math.max(len - 2, 1)} ${C}`} strokeDashoffset={-acc} />
          );
          acc += len;
          return el;
        })}
      </g>
      <text x="60" y="64" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="800" fontSize="16" fill="#fff">{total}′</text>
      <g fontFamily={MONO} fontSize="9.5">
        <rect x="124" y="42" width="9" height="9" rx="2" fill="#5685C0" />
        <text x="138" y="50" fill="#DDE7F4">{de ? `${work} Min. Hand` : `${work} min hands-on`}</text>
        <rect x="124" y="64" width="9" height="9" rx="2" fill="rgba(255,255,255,.28)" />
        <text x="138" y="72" fill="#A1A1A1">{de ? 'Rest wartet' : 'rest is waiting'}</text>
      </g>
    </svg>
  );
}

/** Kreislauf: Block leer → nachbestellen oder Kette einschicken. */
export function CyclePreview({ de }: { de: boolean }) {
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true">
      <rect x="18" y="38" width="44" height="44" rx="9" fill="#2B52B0" stroke="#5685C0" />
      <rect x="18" y="66" width="44" height="16" rx="0" fill="#101318" opacity=".55" />
      <text x="40" y="100" textAnchor="middle" fontFamily={MONO} fontSize="9" fill="#A1A1A1">{de ? 'leer' : 'empty'}</text>
      <path d="M70 52 C100 30 120 30 146 36" fill="none" stroke="#A9C4E6" strokeWidth="1.4" markerEnd="url(#ddp-arr)" />
      <path d="M70 70 C100 92 120 92 146 86" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" strokeDasharray="3 3" markerEnd="url(#ddp-arr2)" />
      <defs>
        <marker id="ddp-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#A9C4E6" /></marker>
        <marker id="ddp-arr2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="rgba(255,255,255,.5)" /></marker>
      </defs>
      <g fontFamily={MONO} fontSize="9.5">
        <text x="152" y="40" fill="#DDE7F4">{de ? 'nachbestellen' : 'reorder'}</text>
        <text x="152" y="90" fill="#A1A1A1">{de ? 'einschicken' : 'send it in'}</text>
      </g>
    </svg>
  );
}

/** Nach dem ersten Film (Kettenseite): Film nimmt ab, Nachwachsen setzt ihn
 *  wieder auf voll. */
export function RefillPreview({ de }: { de: boolean }) {
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true">
      <line x1="16" y1="92" x2="204" y2="92" stroke="rgba(255,255,255,.2)" />
      <path d="M16 30 L86 80 L86 30 L156 80 L156 30 L204 64" fill="none" stroke="#5685C0" strokeWidth="2" strokeLinejoin="round" />
      <g fontFamily={MONO} fontSize="9.5" fill="#A1A1A1">
        <text x="16" y="108">{de ? 'Film' : 'film'}</text>
        <text x="90" y="24" fill="#A9C4E6">{de ? 'nachwachsen' : 'rewax'}</text>
      </g>
    </svg>
  );
}

/** Wachsbad (Kettenseite, "Was wir damit machen"): Kette taucht ins Bad. */
export function BathPreview({ de }: { de: boolean }) {
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true">
      <path d="M40 58 L40 98 Q40 106 48 106 L132 106 Q140 106 140 98 L140 58" fill="none" stroke="#A9B2BD" strokeWidth="1.6" />
      <rect x="42" y="72" width="96" height="32" rx="4" fill="#2B52B0" opacity=".85" />
      <path d="M60 20 Q90 40 90 84 Q90 40 120 20" fill="none" stroke="#C9D1DA" strokeWidth="3" strokeDasharray="6 3" />
      <g fontFamily={MONO} fontSize="9.5">
        <text x="152" y="80" fill="#DDE7F4">{de ? 'ganz durch' : 'all through'}</text>
        <text x="152" y="94" fill="#A1A1A1">{de ? 'jedes Gelenk' : 'every joint'}</text>
      </g>
    </svg>
  );
}
