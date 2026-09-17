import { useState } from 'react';
import { Link } from 'react-router-dom';
import { waxProcessTimeline, type Product } from '@/lib/data';
import { getArticleBySlug } from '@/pages/blog/articles';

// ══════════════════════════════════════════════════════════════
// KAPITEL 04 — SO LAEUFT'S AB
// ══════════════════════════════════════════════════════════════
// Der groesste Einwand gegen Heisswachs ist "klingt aufwendig". Die erste
// Fassung zeigte eine 45-Minuten-Stoppuhr, die nach "dauert ewig" aussah
// (Luca, 14.09.2026). Jetzt wie ein Rezept: Arbeitszeit, Wartezeit,
// Schwierigkeit oben, darunter ein massstaeblicher Zeitstrahl (blau = du
// tust etwas, schraffiert = du wartest) und die Schritte. Standard ist das
// Nachwachsen, weil das der Normalfall ist; das erste Mal (mit Entfetten)
// ist zweitrangig zuschaltbar.
//
// v5 (14.09.2026, Luca): Handgriffe, die gehen, waehrend das Wachs schmilzt,
// laufen parallel (Kette abnehmen, aufhaengen, beim ersten Mal entfetten).
// Deshalb ein Zeitplan mit zwei Spuren statt einer Kette hintereinander, dazu
// eine kleine Uhr mit derselben Einteilung und der Schritt "Kette montieren".
//
// Minuten, Spur und die eigenen Schritte stehen in data.ts
// (waxProcessTimeline), die uebrigen Texte wortgleich in der Anleitung
// (articles.ts).

type Step = (typeof waxProcessTimeline)[number] & { i: number; name: string; text: string; start: number; n: number };

/** Startzeiten: Nebenschritte ab Minute 0 hintereinander, Hauptschritte
 *  hintereinander; ein Schritt mit afterSide wartet auf beide Spuren. */
function schedule<T extends (typeof waxProcessTimeline)[number]>(steps: T[]) {
  let side = 0, main = 0;
  const sideEnd = steps.filter(s => s.lane === 'side').reduce((a, s) => a + s.minutes, 0);
  const out = steps.map(s => {
    if (s.lane === 'side') { const start = side; side += s.minutes; return { ...s, start }; }
    const start = s.afterSide ? Math.max(main, sideEnd) : main;
    main = start + s.minutes;
    return { ...s, start };
  });
  return { steps: out, total: Math.max(main, side) };
}

// Uhr: Bogen von Minute a bis b auf Radius r (0 = oben, im Uhrzeigersinn).
function arc(a: number, b: number, total: number, r: number) {
  const gap = 0.018;
  const a0 = (a / total) * Math.PI * 2 + gap, a1 = Math.max(a0 + 0.02, (b / total) * Math.PI * 2 - gap);
  const p = (x: number) => [Math.sin(x) * r, -Math.cos(x) * r];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

function Clock({ steps, total, lit, de }: { steps: Step[]; total: number; lit: number | null; de: boolean }) {
  const R = 50, RS = 34;
  const ticks = Array.from({ length: Math.floor(total / 5) + 1 }, (_, k) => k * 5).filter(m => m < total);
  return (
    <div className="wxp-clock">
      <svg viewBox="-66 -66 132 132" role="img"
        aria-label={de ? `Uhr: ${total} Minuten gesamt` : `Clock: ${total} minutes in total`}>
        <defs>
          <pattern id="wxp-hatch-clock" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" fill="var(--sf2)" /><rect width="2.5" height="5" fill="var(--bd2)" />
          </pattern>
        </defs>
        <circle r="62" fill="var(--sf)" stroke="var(--bd)" />
        {ticks.map(m => {
          const x = (m / total) * Math.PI * 2;
          return <line key={m} x1={Math.sin(x) * 58} y1={-Math.cos(x) * 58} x2={Math.sin(x) * 61} y2={-Math.cos(x) * 61} stroke="var(--txf)" strokeWidth="1" />;
        })}
        {steps.map(s => (
          <path key={s.i} d={arc(s.start, s.start + s.minutes, total, s.lane === 'side' ? RS : R)} fill="none"
            stroke={s.active ? 'var(--wxp-accent)' : 'url(#wxp-hatch-clock)'}
            strokeWidth={(s.lane === 'side' ? 7 : 12) + (lit === s.i ? 4 : 0)}
            opacity={lit !== null && lit !== s.i ? 0.35 : 1} style={{ transition: 'opacity .2s, stroke-width .2s' }} />
        ))}
      </svg>
      <div className="c"><span className="t num">{total}</span><span className="u">min</span></div>
    </div>
  );
}

// Drei Modi statt zwei (Seitenordnung 09/2026, Chat 3): "Drei Ketten" zeigt
// den Ablauf einer Rotations-Session. Gleicher Zeitplan wie Nachwachsen,
// Arbeitsschritte ×3 nur dort, wo sie tatsaechlich an jeder Kette einzeln
// anfallen (`perChain` in waxProcessTimeline) — Erhitzen, Kuehlen und
// Einfahren bleiben gleich lang, weil sie fuer den ganzen Topf bzw. nur fuer
// die eine Kette gelten, die wieder ans Rad kommt. Das ist eine Annahme ohne
// eigene Zeitmessung fuer drei Ketten; an Luca gemeldet (siehe Abschlussnotiz
// des Chats), nicht eigenmaechtig entschieden.
export type RunMode = 'rewax' | 'first' | 'rotation';

export function ProcessWatch({ de, product, chapter, initialMode = 'rewax' }: {
  de: boolean; product?: Product; chapter?: string;
  /** Fuer Deep-Links (/anleitung#neue-kette, #re-waxen, #rotation): der Anker
   *  waehlt den Modus, mit dem das Kapitel oeffnet. */
  initialMode?: RunMode;
}) {
  const [mode, setMode] = useState<RunMode>(initialMode);
  const [sel, setSel] = useState<number | null>(null);
  const [focusStep, setFocusStep] = useState<number | null>(null);
  const [hot, setHot] = useState<number | null>(null);
  const first = mode === 'first';
  const rotation = mode === 'rotation';

  const guide = getArticleBySlug('heisswachs-anleitung');
  const texts = guide?.howTo?.steps ?? [];
  const named = waxProcessTimeline.map((s, i) => {
    const h = s.howToIndex !== undefined ? texts[s.howToIndex] : undefined;
    const minutes = rotation && s.perChain ? s.minutes * 3 : s.minutes;
    const nameSuffix = rotation && s.perChain ? ' ×3' : '';
    return {
      ...s, i, minutes,
      name: (h?.name ?? (de ? s.nameDe : s.nameEn) ?? '') + nameSuffix,
      text: (de ? s.textDe : s.textEn) ?? h?.text ?? '',
    };
  }).filter(s => s.name && (first || !s.firstOnly));
  const { steps: timed, total } = schedule(named);
  const steps: Step[] = timed.map((s, n) => ({ ...s, n: n + 1 }));
  const work = steps.filter(s => s.active).reduce((a, s) => a + s.minutes, 0);
  const wait = total - work;
  const lit = focusStep ?? sel;
  const main = steps.filter(s => s.lane !== 'side');
  const side = steps.filter(s => s.lane === 'side');
  const sideEnd = side.reduce((a, s) => a + s.minutes, 0);
  const axis = Array.from({ length: Math.floor(total / 10) + 1 }, (_, k) => k * 10);
  const pos = (m: number) => `${(m / total) * 100}%`;

  // Punkte in Prozent des quadratischen Ausschnitts (object-position 25 % 50 %
  // auf dem 16:10-Foto). Bild und Liste teilen sich `hot`.
  const kit = [
    { x: 82, y: 24, n: de ? 'Dieser Block' : 'This block',
      d: product ? (de ? `${product.applications} Wachsgänge` : `${product.applications} waxings`) : (de ? 'reicht für mehrere Wachsgänge' : 'enough for several waxings'),
      e: de ? 'im Bild' : 'pictured' },
    { x: 55, y: 40, n: de ? 'Kettenschloss-Zange' : 'Quick-link pliers', d: de ? 'öffnet das Schloss in Sekunden' : 'opens the link in seconds', e: de ? 'empfohlen' : 'recommended' },
    { x: 66, y: 91, n: de ? 'Draht oder Haken' : 'Wire or hook', d: de ? 'zum Eintauchen und Aufhängen' : 'for dipping and hanging', e: de ? 'im Bild' : 'pictured' },
    { x: 16, y: 84, n: de ? 'Deine Kette' : 'Your chain', d: de ? 'mit Kettenschloss' : 'with quick link', e: de ? 'im Bild' : 'pictured' },
  ];

  const seg = (s: Step) => (
    <div key={s.i} className={`seg${s.active ? ' act' : ' wait'}${lit === s.i ? ' on' : ''}${s.minutes / total < 0.06 ? ' tiny' : ''}`}
      style={{ left: pos(s.start), width: `calc(${pos(s.minutes)} - 3px)` }}
      onMouseEnter={() => setFocusStep(s.i)} onClick={() => setSel(s.i)}>
      <span className="lbl"><b>{s.n}</b>{s.minutes >= 2 && <> · {s.minutes}′</>}</span>
      <span className="tip">{s.name} · {s.minutes} min</span>
    </div>
  );

  return (
    <section className="wxp-chapter wxp-procband">
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{chapter ?? (de ? 'Kapitel 04' : 'Chapter 04')}</p>
          <h2>{de ? 'So läuft’s ab.' : 'How it works.'}</h2>
          <p>{de ? 'Wie ein Rezept: ein paar Minuten Handgriffe, der Rest ist Warten.' : 'Like a recipe: a few minutes of handling, the rest is waiting.'}</p>
        </div>

        <div className="wxp-recipe">
          <div className="stats" aria-live="polite">
            <Clock steps={steps} total={total} lit={lit} de={de} />
            <div className="work"><span className="k">{de ? 'Arbeitszeit' : 'Hands-on'}</span><span className="v num">{work}<small> min</small></span></div>
            <div><span className="k">{de ? 'Wartezeit' : 'Waiting'}</span><span className="v num">{wait}<small> min</small></span></div>
            <div><span className="k">{de ? 'Schwierigkeit' : 'Difficulty'}</span><span className="v">{de ? 'einfach' : 'easy'}</span></div>
          </div>
          <div className="wxp-mode" role="group" aria-label={de ? 'Durchgang' : 'Run'}>
            <button type="button" aria-pressed={mode === 'rewax'} onClick={() => setMode('rewax')}>{de ? 'Nachwachsen' : 'Rewaxing'}</button>
            <button type="button" aria-pressed={mode === 'first'} onClick={() => setMode('first')}>{de ? 'Erstes Mal (+ Entfetten)' : 'First time (+ degreasing)'}</button>
            <button type="button" aria-pressed={mode === 'rotation'} onClick={() => setMode('rotation')}>{de ? 'Drei Ketten' : 'Three chains'}</button>
          </div>
        </div>

        {/* Zeitplan: oben der Hauptablauf, darunter was nebenher geht.
            Breiten und Positionen massstaeblich zur Gesamtzeit. */}
        <div className="wxp-tl" aria-hidden onMouseLeave={() => setFocusStep(null)}>
          <div className="lane main">{main.map(seg)}</div>
          {side.length > 0 && (
            <div className="lane side">
              {side.map(seg)}
              <span className="cap" style={{ left: `calc(${pos(sideEnd)} + 10px)` }}>
                {de ? '← nebenher, während das Wachs schmilzt' : '← alongside, while the wax melts'}
              </span>
            </div>
          )}
          <div className="axis">
            {axis.map(m => <span key={m} style={{ left: pos(m) }}>{m}{m === 0 ? '' : '′'}</span>)}
          </div>
        </div>
        <div className="wxp-tl-legend">
          <span><i className="act" />{de ? 'du tust etwas' : 'hands-on'}</span>
          <span><i className="wait" />{de ? 'du wartest, zum Beispiel bei einem Kaffee' : 'you wait, for example over a coffee'}</span>
        </div>

        <ol className="wxp-steps" style={{ ['--n' as string]: steps.length }}>
          {steps.map(s => (
            <li key={s.i} className={lit === s.i ? 'on' : undefined}
              onMouseEnter={() => setFocusStep(s.i)} onMouseLeave={() => setFocusStep(null)}>
              <button type="button" onFocus={() => setFocusStep(s.i)} onBlur={() => setFocusStep(null)}
                onClick={() => setSel(sel === s.i ? null : s.i)} aria-pressed={sel === s.i}>
                <span className="top"><span className="n">{s.n}</span>
                  <span className={`mm${s.active ? '' : ' w'}`}>{s.active ? (de ? 'Arbeit · ' : 'work · ') : (de ? 'warten · ' : 'wait · ')}{s.minutes} min</span></span>
                <span className="at">{s.lane === 'side'
                  ? (de ? 'während das Wachs schmilzt' : 'while the wax melts')
                  : (de ? `ab Minute ${s.start}` : `from minute ${s.start}`)}</span>
                <span className="nm">{s.name}</span>
                <span className="tx">{s.text}</span>
              </button>
            </li>
          ))}
        </ol>
        <Link to="/blog/heisswachs-anleitung" className="inline-flex items-center gap-1.5 mt-6 text-[13.5px] font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent-soft)' }}>
          {de ? 'Ausführliche Anleitung mit Fotos →' : 'Full guide with photos →'}
        </Link>

        <div className="wxp-kit" onMouseLeave={() => setHot(null)}>
          <div className="wxp-flat">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/blog/tools-quicklink-pliers-800.webp" />
              <img src="/images/blog/tools-quicklink-pliers-1600.webp" alt={de ? 'Blauer Wachsblock, Kettenschloss-Zange, Draht mit Haken und Kette auf Schiefer' : 'Blue wax block, quick-link pliers, wire with hook and chain on slate'} loading="lazy" decoding="async" />
            </picture>
            {kit.map((h, i) => (
              <button key={i} type="button" className="wxp-hot" style={{ left: `${h.x}%`, top: `${h.y}%` }}
                aria-pressed={hot === i} aria-label={`${i + 1} · ${h.n}`}
                onMouseEnter={() => setHot(i)} onFocus={() => setHot(i)} onBlur={() => setHot(null)} onClick={() => setHot(i)}>{i + 1}</button>
            ))}
            {hot !== null && <span className="wxp-hotlabel" style={{ left: `${kit[hot].x}%`, top: `${kit[hot].y}%` }}>{kit[hot].n}</span>}
          </div>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{de ? 'Das brauchst du' : 'What you need'}</p>
            <h3>{de ? 'Vier Dinge im Bild, ein alter Topf dazu.' : 'Four things in the picture, plus an old pot.'}</h3>
            <p className="sub">{de ? 'Kein Spezialgerät. Ein alter Topf wird zum Wachstopf, mehr Anschaffung gibt es nicht.' : 'No special equipment. An old pot becomes the wax pot, that is the only purchase.'}</p>
            <ul className="wxp-klist">
              {kit.map((h, i) => (
                <li key={i} className={hot === i ? 'on' : undefined} onMouseEnter={() => setHot(i)}>
                  <span className="k">{i + 1}</span><div>{h.n} <span className="d">· {h.d}</span></div><em>{h.e}</em>
                </li>
              ))}
              <li><span className="k o">+</span><div>{de ? 'Alter Topf oder Slow Cooker' : 'Old pot or slow cooker'} <span className="d">· {de ? 'nie unbeaufsichtigt, danach nicht mehr für Essen' : 'never unattended, not for food afterwards'}</span></div><em>{de ? 'Küche' : 'kitchen'}</em></li>
              <li><span className="k o">+</span><div>Isopropanol 99 % <span className="d">· {de ? 'nur beim ersten Mal, zum Entfetten' : 'first time only, for degreasing'}</span></div><em>{de ? 'Drogerie' : 'pharmacy'}</em></li>
            </ul>
            <div className="wxp-alts">
              <Link to="/starter-set"><b>{de ? 'Zange und Draht fehlen?' : 'No pliers or wire?'}</b>{de ? 'Das Starter-Set bringt beides mit. ' : 'The starter set brings both. '}<em>{de ? 'Set ansehen →' : 'View the set →'}</em></Link>
              <Link to="/kette-wachsen-lassen"><b>{de ? 'Keine Lust selbst?' : 'Rather not do it yourself?'}</b>{de ? 'Kette einschicken, fahrbereit zurück. ' : 'Send the chain in, get it back ready. '}<em>{de ? 'So geht’s →' : 'How it works →'}</em></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
