import { useState } from 'react';
import { Link } from 'react-router-dom';
import { waxProcessTimeline, type Product } from '@/lib/data';
import { getArticleBySlug } from '@/pages/blog/articles';

// ══════════════════════════════════════════════════════════════
// KAPITEL 04 — SO LAEUFT'S AB
// ══════════════════════════════════════════════════════════════
// Der groesste Einwand gegen Heisswachs ist "klingt aufwendig". Eine
// maßstabsgetreue 45-Minuten-Stoppuhr widerlegt das sichtbar: Navy heisst
// "du tust etwas", schraffiert heisst "du wartest". Die Schritttexte kommen
// wortgleich aus der Anleitung (articles.ts, howTo von heisswachs-anleitung,
// eine Quelle auch fuer das HowTo-JSON-LD), die Minuten aus data.ts
// (waxProcessTimeline). "Nachwachsen" blendet das Entfetten aus.
//
// Darunter "Das brauchst du" als Foto mit Markierungen: drei Dinge sind im
// Bild, zwei kommen aus dem Haushalt.

const R = 112, SW = 26;

function arcPath(a0: number, a1: number) {
  const p = (a: number) => [Math.sin(a) * R, -Math.cos(a) * R];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

export function ProcessWatch({ de, product }: { de: boolean; product: Product }) {
  const [mode, setMode] = useState<'first' | 're'>('first');
  const [sel, setSel] = useState(1);
  const [hot, setHot] = useState<number | null>(null);

  const guide = getArticleBySlug('heisswachs-anleitung');
  const texts = guide?.howTo?.steps ?? [];
  const steps = waxProcessTimeline
    .map((s, i) => ({ ...s, i, name: texts[i]?.name ?? '', text: texts[i]?.text ?? '' }))
    .filter(s => s.name);
  const visible = steps.filter(s => mode === 'first' || !s.firstOnly);
  const total = visible.reduce((a, s) => a + s.minutes, 0);
  const active = visible.filter(s => s.active).reduce((a, s) => a + s.minutes, 0);
  const selected = visible.some(s => s.i === sel) ? sel : visible[0]?.i ?? 0;

  let acc = 0;
  const gap = 0.025;
  const arcs = visible.map(s => {
    const da = (s.minutes / total) * Math.PI * 2;
    const a0 = acc + gap / 2, a1 = Math.max(a0 + 0.02, acc + da - gap / 2);
    const mid = (a0 + a1) / 2;
    acc += da;
    return { s, d: arcPath(a0, a1), lx: Math.sin(mid) * (R + 34), ly: -Math.cos(mid) * (R + 34) };
  });
  const ticks = Array.from({ length: total }, (_, i) => {
    const an = (i / total) * Math.PI * 2, r1 = R - SW / 2 - 8, r2 = r1 - (i % 5 === 0 ? 8 : 4);
    return { x1: Math.sin(an) * r1, y1: -Math.cos(an) * r1, x2: Math.sin(an) * r2, y2: -Math.cos(an) * r2, major: i % 5 === 0 };
  });

  const hotspots = de
    ? [{ x: 58, y: 34, l: `Der Block · ${product.applications} Wachsgänge` }, { x: 31, y: 74, l: 'Deine Kette · einmal entfettet' }, { x: 72, y: 78, l: 'Draht oder Haken' }]
    : [{ x: 58, y: 34, l: `The block · ${product.applications} waxings` }, { x: 31, y: 74, l: 'Your chain · degreased once' }, { x: 72, y: 78, l: 'Wire or hook' }];

  return (
    <section className="wxp-chapter wxp-procband">
      <div className="wxp-wrap">
        <div className="wxp-chead">
          <p className="eyebrow">{de ? 'Kapitel 04' : 'Chapter 04'}</p>
          <h2>{de ? 'So läuft’s ab.' : 'How it works.'}</h2>
          <p>{de ? 'Die Uhr zeigt ehrlich, wo die Zeit hingeht: das meiste ist Warten.' : 'The clock shows honestly where the time goes: most of it is waiting.'}</p>
        </div>
        <div className="wxp-watch-wrap">
          <div className="wxp-watch">
            <svg viewBox="-150 -150 300 300" role="img"
              aria-label={de ? `Stoppuhr: ${total} Minuten, davon ${active} Minuten Arbeit und ${total - active} Minuten Warten` : `Stopwatch: ${total} minutes, ${active} minutes of work and ${total - active} minutes waiting`}>
              <defs>
                <pattern id="wxp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill="#E3E9F1" /><rect width="3" height="6" fill="#C9D5E4" />
                </pattern>
              </defs>
              <circle r="136" fill="var(--pg)" stroke="var(--bd)" />
              {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.major ? 'var(--txf)' : 'var(--bd2)'} strokeWidth={t.major ? 1.4 : 1} />)}
              {arcs.map(({ s, d, lx, ly }) => (
                <g key={s.i}>
                  <path className="arc" d={d} fill="none" stroke={s.active ? '#1F4A7D' : 'url(#wxp-hatch)'}
                    strokeWidth={s.i === selected ? SW + 10 : SW} opacity={s.i === selected ? 1 : 0.8}
                    onClick={() => setSel(s.i)}>
                    <title>{s.name} · {s.minutes} min</title>
                  </path>
                  <text x={lx} y={ly + 5} textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight={800} fontSize="15"
                    fill={s.i === selected ? 'var(--accent-soft)' : 'var(--txf)'}>{s.i + 1}</text>
                </g>
              ))}
              <rect x="-8" y="-150" width="16" height="12" rx="3" fill="var(--tx1)" />
            </svg>
            <div className="center">
              <div className="t num">{total}<small> min</small></div>
              <div className="s"><b>~{active} min</b> {de ? 'tust du etwas' : 'of actual work'}<br />~{total - active} min {de ? 'wartest du' : 'waiting'}</div>
            </div>
          </div>
          <div>
            <div className="wxp-mode" role="group" aria-label={de ? 'Durchgang' : 'Run'}>
              <button type="button" aria-pressed={mode === 'first'} onClick={() => setMode('first')}>{de ? 'Erstes Mal' : 'First time'}</button>
              <button type="button" aria-pressed={mode === 're'} onClick={() => setMode('re')}>{de ? 'Nachwachsen' : 'Rewaxing'}</button>
            </div>
            <ol className="wxp-slist">
              {visible.map(s => (
                <li key={s.i} className={s.i === selected ? 'on' : undefined}>
                  <button type="button" aria-expanded={s.i === selected} onClick={() => setSel(s.i)}>
                    <span className="n">{s.i + 1}</span>
                    <span className="nm">{s.name}</span>
                    <span className={`mm${s.active ? '' : ' w'}`}>{s.active ? '' : (de ? 'warten · ' : 'wait · ')}{s.minutes} min</span>
                  </button>
                  {s.i === selected && <div className="body">{s.text}</div>}
                </li>
              ))}
            </ol>
            <Link to="/blog/heisswachs-anleitung" className="inline-flex items-center gap-1.5 mt-5 text-[13.5px] font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Ausführliche Anleitung mit Fotos →' : 'Full guide with photos →'}
            </Link>
          </div>
        </div>

        <div className="wxp-kit">
          <div className="wxp-flat" onMouseLeave={() => setHot(null)}>
            <img src="/images/blog/wax-blue-wire-chain-1600.webp" alt={de ? 'Wachsblock, Kette und Draht auf Schiefer' : 'Wax block, chain and wire on slate'} loading="lazy" decoding="async" className="photo-neutral" />
            {hotspots.map((h, i) => (
              <button key={i} type="button" className="wxp-hot" style={{ left: `${h.x}%`, top: `${h.y}%` }}
                aria-pressed={hot === i} aria-label={h.l}
                onMouseEnter={() => setHot(i)} onFocus={() => setHot(i)} onClick={() => setHot(i)}>{i + 1}</button>
            ))}
            {hot !== null && <span className="wxp-hotlabel" style={{ left: `${hotspots[hot].x}%`, top: `${hotspots[hot].y}%` }}>{hotspots[hot].l}</span>}
          </div>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>{de ? 'Das brauchst du' : 'What you need'}</p>
            <h3>{de ? 'Drei Dinge im Bild, zwei aus dem Haushalt.' : 'Three things in the picture, two from home.'}</h3>
            <p className="sub">{de ? 'Kein Spezialgerät. Ein alter Topf wird zum Wachstopf, mehr Anschaffung gibt es nicht.' : 'No special equipment. An old pot becomes the wax pot, that is the only purchase.'}</p>
            <ul className="wxp-klist">
              <li><span className="k">1</span><div>{de ? 'Dieser Block' : 'This block'} <span className="d">· {product.applications} {de ? 'Wachsgänge' : 'waxings'}</span></div><em>{de ? 'im Bild' : 'pictured'}</em></li>
              <li><span className="k">2</span><div>{de ? 'Deine Kette' : 'Your chain'} <span className="d">· {de ? 'mit Quick-Link' : 'with quick link'}</span></div><em>{de ? 'im Bild' : 'pictured'}</em></li>
              <li><span className="k">3</span><div>{de ? 'Draht oder Haken' : 'Wire or hook'} <span className="d">· {de ? 'zum Eintauchen' : 'for dipping'}</span></div><em>{de ? 'im Bild' : 'pictured'}</em></li>
              <li><span className="k o">+</span><div>{de ? 'Alter Topf' : 'Old pot'} <span className="d">· {de ? 'aus der Küche' : 'from the kitchen'}</span></div><em>{de ? 'Haushalt' : 'at home'}</em></li>
              <li><span className="k o">+</span><div>Isopropanol 99 % <span className="d">· {de ? 'Drogerie, nur fürs erste Mal' : 'pharmacy, first time only'}</span></div><em>{de ? 'Haushalt' : 'at home'}</em></li>
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
