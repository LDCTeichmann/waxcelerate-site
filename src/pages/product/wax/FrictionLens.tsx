import { useState } from 'react';

// ══════════════════════════════════════════════════════════════
// KAPITEL 02 — WO DIE REIBUNG WIRKLICH SITZT
// ══════════════════════════════════════════════════════════════
// Die frühere Schnittzeichnung "entlang des Bolzens" war fuer Laien nicht
// lesbar (Lucas Feedback, 13.09.2026): eine Kette steht am Rad aufrecht, man
// sieht sie von der Seite. Deshalb jetzt genau diese Ansicht, und eine Lupe
// schaut durch den Bolzen eines Gelenks: konzentrische Ringe sind ohne
// Vorwissen lesbar (Bolzen → Spalt → Laschenschulter → Spalt → Rolle).
// Zone 03 (Lasche auf Lasche) liegt seitlich und ist deshalb in der Kette
// selbst markiert, nicht in der Lupe.
//
// Der Umschalter Oel/Wachs faerbt dieselben Spalten um: koernige
// Schleifpaste gegen sauberen blauen Film. Linienstaerken nach DESIGN.md §2
// (1,2 / 1,7 / 2,6), Figurenschrift >= 11 px. Wachs ist die einzige blaue
// Flaeche, alles Metall bleibt grau.

type Zone = 'z1' | 'z2' | 'z3';

function LensFigure({ oil, zone, de }: { oil: boolean; zone: Zone | null; de: boolean }) {
  const film = oil ? 'url(#wxp-grit)' : '#5685C0';
  const op = (z: Zone) => (zone && zone !== z ? 0.22 : 1);
  // Kette: 6 Bolzen im Abstand 44, y = 190. Aussenlaschen (vorn) je zwei
  // Bolzen, Innenlaschen (hinten) dazwischen.
  const pins = [50, 94, 138, 182, 226, 270];
  const plate = (x1: number, x2: number, r: number, pinch: number) =>
    `M ${x1} ${190 - r} Q ${(x1 + x2) / 2} ${190 - r + pinch} ${x2} ${190 - r} A ${r} ${r} 0 0 1 ${x2} ${190 + r} Q ${(x1 + x2) / 2} ${190 + r - pinch} ${x1} ${190 + r} A ${r} ${r} 0 0 1 ${x1} ${190 - r} Z`;
  return (
    <svg viewBox="0 0 640 380" role="img"
      aria-label={de
        ? 'Fahrradkette in Seitenansicht. Eine Lupe zeigt den Querschnitt durch ein Gelenk: Bolzen, Laschenschulter und Rolle mit zwei Spalten dazwischen.'
        : 'Bicycle chain in side view. A loupe shows the cross-section through one joint: pin, plate shoulder and roller with two gaps between them.'}>
      <defs>
        <pattern id="wxp-grit" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#3A2F24" />
          <circle cx="2" cy="3" r="1.2" fill="#8A7A62" /><circle cx="7" cy="7" r="1" fill="#6E6150" /><circle cx="8" cy="2" r=".7" fill="#A8977C" />
        </pattern>
        <clipPath id="wxp-lensclip"><circle cx="470" cy="190" r="140" /></clipPath>
      </defs>

      <g transform="translate(-12 -34) scale(1.18)">
        {/* Innenlaschen, hinten */}
        <g stroke="#7D8793" strokeWidth="1.2" fill="#262B33">
          <path d={plate(94, 138, 18, 4)} /><path d={plate(182, 226, 18, 4)} />
        </g>
        {/* Aussenlaschen, vorn */}
        <g stroke="#A9B2BD" strokeWidth="1.7" fill="#2E343D">
          <path d={plate(50, 94, 22, 6)} /><path d={plate(138, 182, 22, 6)} /><path d={plate(226, 270, 22, 6)} />
        </g>
        {/* Zone 03: wo Innen- und Aussenlasche aufeinanderliegen */}
        <g className="ring" style={{ opacity: op('z3') }} stroke={oil ? '#8A7A62' : '#7AA0CE'} strokeWidth="1.7" fill="none">
          {pins.slice(1, 5).map(x => <circle key={x} cx={x} cy="190" r="16" />)}
        </g>
        <g fill="#C9D1DA" stroke="#8C959F" strokeWidth="1.2">
          {pins.map(x => <circle key={x} cx={x} cy="190" r="6" />)}
        </g>
        <line x1="20" y1="190" x2="300" y2="190" stroke="rgba(255,255,255,.14)" strokeDasharray="8 3 2 3" />
        <circle cx="182" cy="190" r="28" fill="none" stroke="#fff" strokeWidth="2" />
        <text x="160" y="146" textAnchor="middle" fontFamily="Libre Franklin, sans-serif" fontSize="11" fill="#A1A1A1">{de ? 'Außenlasche' : 'Outer plate'}</text>
        <text x="116" y="238" textAnchor="middle" fontFamily="Libre Franklin, sans-serif" fontSize="11" fill="#A1A1A1">{de ? 'Innenlasche' : 'Inner plate'}</text>
      </g>
      {/* Verbindung Lupe klein → gross */}
      <line x1="226" y1="164" x2="352" y2="100" stroke="rgba(255,255,255,.35)" strokeDasharray="3 3" />
      <line x1="226" y1="216" x2="352" y2="280" stroke="rgba(255,255,255,.35)" strokeDasharray="3 3" />

      {/* Querschnitt durch den Bolzen */}
      <g clipPath="url(#wxp-lensclip)">
        <circle cx="470" cy="190" r="140" fill="#101318" />
        <circle cx="470" cy="190" r="118" fill="#3B424C" stroke="#A9B2BD" strokeWidth="1.7" />
        <circle className="ring" style={{ opacity: op('z2') }} cx="470" cy="190" r="84" fill={film} />
        <circle cx="470" cy="190" r="76" fill="#2F353E" stroke="#A9B2BD" strokeWidth="1.7" />
        <circle className="ring" style={{ opacity: op('z1') }} cx="470" cy="190" r="46" fill={film} />
        <circle cx="470" cy="190" r="38" fill="#C9D1DA" stroke="#8C959F" strokeWidth="1.7" />
      </g>
      <circle cx="470" cy="190" r="140" fill="none" stroke="#fff" strokeWidth="2.6" />
      <g fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="600" textAnchor="middle">
        <g className="ring" style={{ opacity: op('z1') }}><circle cx="512" cy="162" r="12" fill="#16191D" stroke="#A9C4E6" strokeWidth="1.6" /><text x="512" y="166" fill="#DDE7F4">01</text></g>
        <g className="ring" style={{ opacity: op('z2') }}><circle cx="527" cy="133" r="12" fill="#16191D" stroke="#A9C4E6" strokeWidth="1.6" /><text x="527" y="137" fill="#DDE7F4">02</text></g>
      </g>
      <g fontFamily="Libre Franklin, sans-serif" fontSize="12" textAnchor="middle">
        <text x="470" y="194" fill="#2A2F36" fontWeight="600">{de ? 'Bolzen' : 'Pin'}</text>
        <text x="470" y="254" fill="#C4CBD3">{de ? 'Laschenschulter' : 'Plate shoulder'}</text>
        <text x="470" y="296" fill="#C4CBD3">{de ? 'Rolle' : 'Roller'}</text>
      </g>
    </svg>
  );
}

export function FrictionLens({ de }: { de: boolean }) {
  const [oil, setOil] = useState(false);
  const [zone, setZone] = useState<Zone | null>(null);

  const zones: { id: Zone; n: string; t: string; pr: string; body: string }[] = de ? [
    { id: 'z1', n: '01', t: 'Bolzen gegen Laschenschulter', pr: 'Höchster Druck', body: 'Der innere Ring. Kleinste Fläche, volle Kettenspannung. Hier entsteht die Längung, die du mit der Kettenlehre misst.' },
    { id: 'z2', n: '02', t: 'Rolle gegen Laschenschulter', pr: 'Hoher Druck', body: 'Der äußere Ring. Offen nach außen, hier kommt Staub in den Antrieb. Ein fester Film bindet ihn nicht.' },
    { id: 'z3', n: '03', t: 'Innenlasche gegen Außenlasche', pr: 'Wenig Druck', body: 'Die Kreise in der Kette links: dort liegen die Laschen aufeinander. Große Fläche, kaum Last, ein Flüssigfilm muss hier bei jeder Bewegung geschert werden.' },
  ] : [
    { id: 'z1', n: '01', t: 'Pin against plate shoulder', pr: 'Highest pressure', body: 'The inner ring. Smallest area, full chain tension. This is where the elongation you measure with a chain checker comes from.' },
    { id: 'z2', n: '02', t: 'Roller against plate shoulder', pr: 'High pressure', body: 'The outer ring. Open to the outside, this is where dust gets in. A solid film does not bind it.' },
    { id: 'z3', n: '03', t: 'Inner plate against outer plate', pr: 'Low pressure', body: 'The circles in the chain on the left: where the plates overlap. Large area, little load, a liquid film has to be sheared here with every movement.' },
  ];

  return (
    <section className="wxp-chapter wxp-darkband pdp-dark">
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Kapitel 02' : 'Chapter 02'}</p>
          <h2>{de ? 'Wo die Reibung wirklich sitzt.' : 'Where the friction really is.'}</h2>
          <p>{de ? 'So, wie die Kette am Rad hängt. Die Lupe zeigt, was im Gelenk passiert.' : 'The chain as it hangs on the bike. The loupe shows what happens inside a joint.'}</p>
        </div>
        <div className="wxp-lens-wrap">
          <div className="wxp-frame wxp-lens">
            <div className="wxp-frame-head">
              <span className="lab">{de ? 'Seitenansicht · Lupe im Gelenk' : 'Side view · loupe in a joint'}</span>
              <div className="wxp-toggle" role="group" aria-label={de ? 'Schmierung' : 'Lubrication'}>
                <button type="button" aria-pressed={oil} onClick={() => setOil(true)}>{de ? 'Mit Öl' : 'With oil'}</button>
                <button type="button" aria-pressed={!oil} onClick={() => setOil(false)}>{de ? 'Mit Wachs' : 'With wax'}</button>
              </div>
            </div>
            <LensFigure oil={oil} zone={zone} de={de} />
            <p className="wxp-lens-state" aria-live="polite">
              {oil
                ? (de ? <><b>Mit Öl:</b> der Film ist flüssig und offen. Staub wird gebunden und zu Schleifpaste, genau in den Spalten mit dem höchsten Druck.</>
                  : <><b>With oil:</b> the film is liquid and open. Dust gets bound into grinding paste, right in the gaps with the highest pressure.</>)
                : (de ? <><b>Mit Wachs:</b> ein trockener Film sitzt in beiden Spalten. Staub haftet nicht, nichts wird zu Paste.</>
                  : <><b>With wax:</b> a dry film sits in both gaps. Dust does not stick, nothing turns into paste.</>)}
            </p>
          </div>
          <ol className={`wxp-zones${zone ? ' dim' : ''}`}>
            {zones.map(z => (
              <li key={z.id} className={zone === z.id ? 'hi' : undefined}
                onMouseEnter={() => setZone(z.id)} onMouseLeave={() => setZone(null)}
                onFocus={() => setZone(z.id)} onBlur={() => setZone(null)} tabIndex={0}>
                <div className="h"><span className="n">{z.n}</span><span className="t">{z.t}</span><span className="pr">{z.pr}</span></div>
                <p>{z.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="wxp-cassette">
          {/* v5 (14.09.2026): kein weisser Kasten mehr. Die WebP hat einen
              transparenten Grund (RGBA), die JPG einen weissen — deshalb nur
              noch die WebP, direkt auf dem Dunkelband. Die Zoom-Linse zeigt
              dieselbe Datei vergroessert auf die markierte Zahnflanke, wie
              die Lupe in der Kettenzeichnung oben. */}
          <div className="wxp-cas-card">
            <img src="/images/science/cassette-wear-diagram.webp" alt={de ? 'Shimano Ultegra Kassette' : 'Shimano Ultegra cassette'} loading="lazy" decoding="async" />
            <svg className="link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <line x1="27" y1="47" x2="66" y2="70" />
            </svg>
            <span className="loupe" aria-hidden />
            <span className="zoom" aria-hidden style={{ backgroundImage: 'url(/images/science/cassette-wear-diagram.webp)' }} />
            <span className="tag">{de ? 'Zahnflanke, vergrößert' : 'Tooth flank, magnified'}</span>
          </div>
          <div>
            <p className="eyebrow" style={{ color: 'var(--wxp-ice)' }}>{de ? 'Der Beleg' : 'The evidence'}</p>
            <h3>{de ? 'Verschleiß frisst die Zahnflanke.' : 'Wear eats the tooth flank.'}</h3>
            <p className="txt">{de
              ? 'Schleifpaste aus Öl und Staub trägt die Flanken der Kassette ab. Die Kette greift schlechter und längt sich schneller. Trockenes Wachs bindet diesen Staub nicht, deshalb hält die Kassette mit Wachs etwa doppelt so lange.'
              : 'Grinding paste of oil and dust wears down the cassette flanks. The chain engages worse and elongates faster. Dry wax does not bind that dust, so the cassette lasts roughly twice as long with wax.'}</p>
            <div className="wxp-teeth">
              <figure>
                <svg width="120" height="84" viewBox="0 0 120 84" aria-hidden="true"><path d="M8 80 L38 16 Q60 4 82 16 L112 80" fill="rgba(169,196,230,.12)" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                <figcaption><b>{de ? 'Neu' : 'New'}</b> · {de ? 'symmetrisch' : 'symmetric'}</figcaption>
              </figure>
              <figure>
                <svg width="120" height="84" viewBox="0 0 120 84" aria-hidden="true">
                  <path d="M8 80 L38 16 Q60 4 82 16 L112 80" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d="M8 80 L40 20 Q54 10 66 18 Q70 40 88 52 L112 80" fill="rgba(169,196,230,.12)" stroke="#A9C4E6" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
                <figcaption><b>{de ? 'Abgenutzt' : 'Worn'}</b> · {de ? 'Haifischflosse' : 'shark fin'}</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
