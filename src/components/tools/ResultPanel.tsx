// ── Die Antwort, immer an derselben Stelle und immer gleich gebaut ──────────
//
// Loest drei Beanstandungen auf einmal.
//
// Gleiche Stelle: die Antwort steht in jeder Karte unten, nach den Eingaben
// und vor der Handlungsaufforderung. Vorher stand sie oben und jede Karte
// baute sie leicht anders — mal 56 px, mal 72 px, mal mit, mal ohne
// Begruendungszeile.
//
// Optisch abgesetzt: der getoente Block fuellt den Raum, der vorher als
// Leerflaeche zwischen Bedienelementen und Knopf stand, und trennt zugleich
// sichtbar „was ich eingebe" von „was dabei herauskommt".
//
// Feste Geometrie: `mt-auto` haelt den Block unten, `min-h` haelt ihn hoch.
// Beides zusammen ergibt erst eine gleiche OBERkante — mit mt-auto allein
// wanderte sie zwischen 290 und 328 px, je nachdem, was im Block stand
// (gemessen 09/2026 ueber alle fuenf Karten bei 1280 px).
// Dazu gehoert, dass jeder Baustein eine feste Hoehe hat: der Urteilssatz
// mindestens zwei Zeilen, die Kennzahlzeile immer zwei Spalten (auch bei nur
// einem Eintrag), und es gibt keine optionale Bildzone mehr — die frueher
// „hero" genannte Zeile nutzte nur die Kettenlaenge, und genau sie war der
// Ausreisser. Das Kettenstueck steht dort jetzt bei der Skizze, wo es
// hingehoert: es zeigt eine Handlung am Bauteil, keine Kennzahl.
//
// Weniger Zahlen gleichzeitig: genau eine grosse Zahl, ein Satz Klartext dazu,
// hoechstens zwei Zusatzangaben. Alles Weitere gehoert nicht ins Ergebnis,
// sondern in ein Popover oder auf die Rechner-Einzelseite.
//
// Die Handlungsaufforderung steht seit dem Hoehen-Umbau IN diesem Block statt
// als eigener Streifen darunter (der frueheren ToolFooter). Das spart die
// doppelten Innenabstaende — Karte und Block hatten je 16-20 px — und liest
// sich richtiger: Antwort und naechster Schritt gehoeren zusammen.
//
// Teilen und Termin sitzen im Kartenstapel (`compact`) als Symbole rechts in
// der Zeile der Handlungsaufforderung — keine eigene Zeile, und die grosse
// Zahl behaelt die volle Breite (09/2026; vorher standen sie neben der Zahl).
// Auf den /rechner-Seiten sind sie beschriftet, brauchen damit ueber 250 px
// und stehen deshalb in einer eigenen Zeile.

import { useRef, useEffect } from 'react';
import { trackCalcComplete } from '@/lib/analytics';

export type ResultTone = 'neutral' | 'good' | 'warn';

/** Hoehe des Antwortblocks, gleich auf allen Karten. Gemessen aus dem
 *  hoechsten Fall: Polster 24 + Zahlzeile 36 + Urteil 2 Zeilen 35 +
 *  Kennzahlzeile 45 + Handlungszeile 52 + Abstaende. Jede Zeile hat dafuer
 *  eine feste Hoehe — ohne das schwankte der Block zwischen 190 und 206 px
 *  und die Antwort sprang beim Blaettern. */
const RESULT_H = 210;

export function ResultPanel({
  value, unit, verdict, facts, tone = 'neutral', actions, cta, compact, toolSlug, hasResult = true,
}: {
  /** Die eine grosse Zahl. Node, damit AnimatedNumber hineinpasst. */
  value: React.ReactNode;
  unit?: string;
  /** Ein bis zwei Saetze Klartext: was die Zahl bedeutet und was zu tun ist. */
  verdict?: React.ReactNode;
  /** Bis zu zwei Eintraege, nebeneinander. */
  facts?: { label: string; value: string }[];
  tone?: ResultTone;
  actions?: React.ReactNode;
  /** Die eine Handlungsaufforderung, unterste Zeile des Blocks. */
  cta?: React.ReactNode;
  /** Im Kartenstapel der Startseite: Aktionen als Symbole neben der CTA. */
  compact?: boolean;
  /** P1-4: Slug fuer calc_complete. Ohne Angabe wird nichts getrackt (z. B.
   *  im kompakten Kartenstapel der Startseite, wo derselbe Rechner mehrfach
   *  auftauchen kann). */
  toolSlug?: string;
  /** Manche Karten haben einen "wartet auf Eingabe"-Zustand (bisher nur
   *  WearCalculator, method=ruler ohne gueltigen Messwert) — dort ist noch
   *  kein Ergebnis da, calc_complete soll dann nicht feuern. Alle anderen
   *  Rechner zeigen ab dem ersten Rendern ein gueltiges Ergebnis mit
   *  sinnvollen Vorgaben (bewusste Produktentscheidung), Default true. */
  hasResult?: boolean;
}) {
  const shownFacts = (facts ?? []).slice(0, 2);
  const trackedRef = useRef(false);
  useEffect(() => {
    if (toolSlug && hasResult && !trackedRef.current) {
      trackedRef.current = true;
      trackCalcComplete(toolSlug);
    }
  }, [toolSlug, hasResult]);
  // Drei Toene mit festen Rollen, auf allen Karten gleich: neutral (noch kein
  // Ergebnis / nichts zu tun), gut (Blau = Wachs, Ersparnis, passt) und warn
  // (Bernstein = bitte handeln). Vorher war „Kette tauschen" blau getoent —
  // dieselbe Farbe wie „du sparst 92 €".
  const TONE = {
    neutral: { accent: 'var(--tx1)', bg: 'var(--inset-bg)', bd: 'var(--inset-bd)' },
    good: { accent: 'var(--brand)', bg: 'rgba(var(--accent-rgb),0.07)', bd: 'rgba(var(--accent-rgb),0.28)' },
    warn: { accent: 'var(--tool-warn)', bg: 'rgba(var(--tool-warn-rgb),0.07)', bd: 'rgba(var(--tool-warn-rgb),0.30)' },
  }[tone];
  // Ein Wort als Antwort („Kette tauschen") braucht weniger Groesse als eine
  // Zahl, sonst bricht es auf schmalen Karten um.
  const isWord = typeof value === 'string' && /[a-zäöüß]{3}/i.test(value);
  return (
    <div
      className="mt-auto mx-3.5 mb-3.5 sm:mx-4 sm:mb-4 rounded-2xl px-3.5 py-3 sm:px-4 flex flex-col"
      style={{ background: TONE.bg, border: `1px solid ${TONE.bd}`, minHeight: RESULT_H }}
    >
      {/* Feste Hoehe: ein Wort („Kette tauschen") ist kleiner gesetzt als eine
          Zahl, die Zeile darf dadurch nicht niedriger werden. */}
      <div className="flex items-baseline gap-2 min-w-0 h-9">
        <span
          className={`${isWord ? 'text-[24px] sm:text-[26px]' : 'text-[30px] sm:text-[34px]'} font-bold leading-none tabular-nums tracking-[-0.01em]`}
          style={{ color: TONE.accent }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[15px] sm:text-[16px] font-semibold leading-none truncate" style={{ color: 'var(--tx2)' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Mindesthoehe zwei Zeilen: ein kurzer Satz soll den Block nicht
          schrumpfen lassen, sonst steht die Kennzahlzeile je Rechner woanders. */}
      {/* Genau zwei Zeilen: kuerzere Saetze bekommen die Hoehe trotzdem,
          laengere werden geschnitten — die Copy muss also in zwei Zeilen
          passen (in `title` steht sie vollstaendig). */}
      <p
        className="text-[12.5px] leading-snug mt-1.5 h-[2.75em] line-clamp-2"
        style={{ color: 'var(--tx2)' }}
        title={typeof verdict === 'string' ? verdict : undefined}
      >
        {verdict}
      </p>

      {/* Immer zwei Spalten, auch bei nur einer Kennzahl — damit steht die
          erste Kennzahl in jeder Karte an derselben Stelle. */}
      {/* Immer gerendert, auch ohne Eintraege: sonst faellt der Block auf
          Karten ohne Kennzahl um 45 px in sich zusammen. */}
      {(
        <dl
          className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 pt-2 h-[45px]"
          style={{ borderTop: shownFacts.length ? '1px solid var(--inset-bd)' : '1px solid transparent' }}
        >
          {shownFacts.map(f => (
            <div key={f.label} className="min-w-0">
              <dt className="text-meta truncate" style={{ color: 'var(--txff)' }}>{f.label}</dt>
              <dd className="text-[12.5px] font-medium tabular-nums truncate" style={{ color: 'var(--tx2)' }}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Im Stapel: Handlungsaufforderung und die Symbol-Aktionen (Teilen,
          Kalender) in EINER Zeile. Vorher standen die Symbole neben der
          grossen Zahl und nahmen ihr den Platz. */}
      {compact ? (
        (cta || actions) && (
          <div className="mt-auto pt-2.5 flex items-stretch gap-2">
            {cta && <div className="flex-1 min-w-0">{cta}</div>}
            {actions}
          </div>
        )
      ) : (
        <div className="mt-auto pt-2.5 flex flex-col gap-2.5">
          {actions}
          {cta}
        </div>
      )}
    </div>
  );
}
