// ─── Belastungstest — die Formel zum Selbst-Kaputtmachen ────────────────────
//
// Nach der Reise durch die sechs Stoffe darf man selbst drehen: Temperatur,
// Kontaktdruck, und jeden Stoff einzeln herausnehmen. Der Film reagiert nur
// an Schwellen, die schon anderswo auf der Seite belegt sind:
//
//  Kaelte    ohne Mikrokristallin reisst der Film unter +5 °C (FAILURES[0],
//            "platzte bei < 5 °C"; Classic-Untergrenze im Einsatzbereich),
//            mit Mikrokristallin haelt er bis −8 °C (Pro-Untergrenze, Metrik)
//  Waerme    ohne FT-Wachs rundet die Oberflaeche ab ~58–60 °C ab
//            (Paraffin-Erstarrungspunkt), mit FT-Wachs ab ~75 °C (Tropfpunkt)
//  Last      50–300 MPa Kontaktdruck (FORMULA_STORY, MoS2): je hoeher, desto
//            staerker der Fe–S-Transferfilm — ohne MoS2 gibt es keinen
//  Dispergier ohne es liegen die Plaettchen unten (FAILURES[2])
//  Antioxidans wirkt ueber Monate; hier gibt es nur die ehrliche Zeile dazu
//
// Kein Wert ist hier erfunden, und kein Zustand, den die Seite nicht schon
// in Worten behauptet.

import { useState } from 'react';
import { InstrumentFrame } from '@/components/viz';
import { COMPONENTS } from '@/lib/science';
import { WaxField, type FieldKey } from '../WaxField';

type Texts = Partial<Record<FieldKey, { de: string; en: string; src?: string }>>;

const TOGGLES: FieldKey[] = ['matrix', 'winterformel', 'mos2', 'sedimentation', 'antioxidans'];
const smooth = (a: number, b: number, v: number) => { const x = Math.max(0, Math.min(1, (v - a) / (b - a))); return x * x * (3 - 2 * x); };

export function StressTest({ de, withoutText }: { de: boolean; withoutText: Texts }) {
  const [temp, setTemp] = useState(20);
  const [load, setLoad] = useState(120);
  const [off, setOff] = useState<FieldKey[]>([]);
  const has = (k: FieldKey) => !off.includes(k);
  const toggle = (k: FieldKey) => setOff(o => (o.includes(k) ? o.filter(x => x !== k) : [...o, k]));
  const name = (k: FieldKey) => { const c = COMPONENTS.find(x => x.id === k)!; return de ? c.graphLabelDe : c.graphLabelEn; };

  const cracked = has('winterformel') ? temp < -8 : temp < 5;
  const slump = has('matrix') ? smooth(72, 80, temp) : smooth(55, 62, temp);
  const transfer = has('mos2') ? 0.25 + 0.75 * smooth(50, 300, load) : 0;

  // Was gerade passiert, als kurze Zeilen. Wo es die Seite schon in Worten
  // gibt (WITHOUT), wird genau dieser Text genommen.
  type Line = { tone: 'bad' | 'warn' | 'good'; text: string };
  const lines: Line[] = [];
  const w = (k: FieldKey) => (de ? withoutText[k]?.de : withoutText[k]?.en) ?? '';
  if (cracked) lines.push({ tone: 'bad', text: has('winterformel')
    ? (de ? 'Unter −8 °C wird auch diese Matrix spröde. Das ist die Untergrenze des Einsatzbereichs.' : 'Below −8 °C this matrix turns brittle too. That is the lower limit of the operating range.')
    : w('winterformel') });
  if (slump > 0.05) lines.push({ tone: 'bad', text: has('matrix')
    ? (de ? 'Über dem Tropfpunkt von ~75 °C wird jeder Wachsfilm weich, auch dieser.' : 'Above the ~75 °C drop point every wax film softens, this one too.')
    : w('matrix') });
  if (!has('winterformel') && !cracked) lines.push({ tone: 'warn', text: de ? 'Ohne Mikrokristallin reißt der Film schon unter +5 °C. Dreh die Temperatur runter.' : 'Without microcrystalline wax the film cracks below +5 °C. Turn the temperature down.' });
  if (!has('matrix') && slump <= 0.05) lines.push({ tone: 'warn', text: de ? 'Ohne FT-Wachs wird der Film schon ab ~60 °C weich. Dreh die Temperatur hoch.' : 'Without FT wax the film softens from ~60 °C. Turn the temperature up.' });
  if (!has('mos2')) lines.push({ tone: 'bad', text: w('mos2') });
  else lines.push({ tone: 'good', text: de
    ? `Bei ${load} MPa scheren die MoS₂-Schichten und bauen den Transferfilm auf dem Stahl auf.`
    : `At ${load} MPa the MoS₂ layers shear and build the transfer film on the steel.` });
  if (!has('sedimentation')) lines.push({ tone: 'bad', text: w('sedimentation') });
  if (!has('antioxidans')) lines.push({ tone: 'warn', text: `${w('antioxidans')} ${de ? 'Das zeigt sich über Monate, nicht in diesem Moment.' : 'That shows over months, not in this moment.'}` });
  if (!lines.some(l => l.tone !== 'good')) lines.unshift({ tone: 'good', text: de ? 'Der Film hält: fest am Stahl, biegsam, geschmiert.' : 'The film holds: bonded to the steel, flexible, lubricated.' });

  const pctT = ((temp + 15) / 100) * 100;

  return (
    <InstrumentFrame eyebrow={de ? 'Belastungstest' : 'Stress test'} chip={<span className="num-data">{de ? 'selbst probieren' : 'try it'}</span>}>
      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <div>
          <div className="relative stress-film" data-cold={cracked || undefined} data-hot={slump > 0.05 || undefined}>
            <WaxField de={de} without={off} cracked={cracked} slump={slump} transfer={transfer} />
          </div>
          <ul className="mt-4 space-y-2" aria-live="polite">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-snug" style={{ color: 'var(--tx2)' }}>
                <span aria-hidden className="mt-[5px] h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: l.tone === 'good' ? 'var(--accent)' : l.tone === 'warn' ? '#C9A13B' : '#D9822B' }} />
                {l.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-[12px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--txf)' }}>{de ? 'Temperatur' : 'Temperature'}</span>
              <span className="num-data text-[15px] font-semibold" style={{ color: 'var(--tx1)' }}>{temp > 0 ? '+' : ''}{temp} °C</span>
            </span>
            <input type="range" min={-15} max={85} step={1} value={temp} onChange={e => setTemp(Number(e.target.value))}
              className="stress-range stress-range--temp mt-2 w-full" style={{ ['--p' as string]: `${pctT}%` }}
              aria-label={de ? 'Temperatur in Grad Celsius' : 'Temperature in degrees Celsius'} />
            <span className="relative block h-4 text-[11px] num" style={{ color: 'var(--txf)' }}>
              {[-8, 5, 60, 75].map(v => (
                <span key={v} className="absolute -translate-x-1/2" style={{ left: `${((v + 15) / 100) * 100}%` }}>{v > 0 ? '+' : ''}{v}°</span>
              ))}
            </span>
          </label>

          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-[12px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--txf)' }}>{de ? 'Kontaktdruck im Gelenk' : 'Contact pressure in the joint'}</span>
              <span className="num-data text-[15px] font-semibold" style={{ color: 'var(--tx1)' }}>{load} MPa</span>
            </span>
            <input type="range" min={50} max={300} step={10} value={load} onChange={e => setLoad(Number(e.target.value))}
              className="stress-range mt-2 w-full" style={{ ['--p' as string]: `${((load - 50) / 250) * 100}%` }}
              aria-label={de ? 'Kontaktdruck in Megapascal' : 'Contact pressure in megapascals'} />
          </label>

          <div>
            <p className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--txf)' }}>
              {de ? 'Stoffe im Film' : 'Substances in the film'}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="stress-chip" data-on aria-disabled title={de ? 'Ohne Trägermatrix gibt es keinen Film.' : 'Without the carrier matrix there is no film.'}>
                {name('kristallstruktur')}
              </span>
              {TOGGLES.map(k => (
                <button key={k} type="button" className="stress-chip" data-on={has(k) || undefined} aria-pressed={has(k)} onClick={() => toggle(k)}>
                  {name(k)}
                </button>
              ))}
            </div>
            <p className="text-[12px] mt-3" style={{ color: 'var(--txf)' }}>
              {de ? 'Tippe einen Stoff an, um ihn herauszunehmen. Die Schwellen stammen aus dem Einsatzbereich und den Entwicklungsstufen weiter unten.'
                : 'Tap a substance to take it out. The thresholds come from the operating range and the development steps further down.'}
            </p>
          </div>
          {(off.length > 0 || temp !== 20 || load !== 120) && (
            <button type="button" onClick={() => { setOff([]); setTemp(20); setLoad(120); }}
              className="text-[12.5px] font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
              {de ? 'Zurücksetzen' : 'Reset'}
            </button>
          )}
        </div>
      </div>
    </InstrumentFrame>
  );
}
