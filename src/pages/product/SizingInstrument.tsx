// ── Was das fuer dich heisst ────────────────────────────────────────────────
//
// Die Produktseite hoert hier auf, das Produkt zu BESCHREIBEN, und rechnet aus,
// was es fuer den Besucher bedeutet. Das ist der eine Teil der Seite, den kein
// Wettbewerber kopieren kann: die Rechenwege liegen seit Monaten in waxMath.ts
// und trieben bisher nur die sechs Rechner unter /rechner an.
//
// Der Anlass: Die Seite beantwortete zwei Fragen nicht, an denen Kaufent-
// scheidungen scheitern.
//   - "Welche Groesse?" — zwei Knoepfe, keine Hilfe.
//   - "Classic oder Pro?" — eine Vergleichstabelle in einem Modal.
// Beide sind jetzt gerechnete Antworten.
//
// Die Groessenempfehlung empfiehlt bewusst auch nach UNTEN. Unter rund
// 55 km/Woche haelt der 500er laenger als seine eigene Haltbarkeit
// (WAX_SHELF_LIFE_MONTHS = 30), dann ist der kleinere Block die ehrliche
// Antwort — obwohl er je Anwendung teurer ist (1,84 € gegen 1,15 €). Ein
// Instrument, das immer das Teurere empfiehlt, ist kein Instrument.
//
// Alle Zahlen kommen aus vorhandenen Funktionen. Es wird nichts erfunden, und
// AssumptionsDisclosure legt die neun Rechengrundlagen offen.
//
// BEWUSST NICHT hier: eine personalisierte Ersparnis. Das statische
// Kostenbeispiel weiter unten (costNote: 4.000 km Oel gegen 12.000 km Wachs)
// benutzt ein anderes Modell als drivetrainCosts. Zwei verschiedene
// Euro-Betraege zur selben Frage auf einer Seite waeren unglaubwuerdig.

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/data';
import { getProductById } from '@/lib/data';
import { switchEconomics, WAX_SHELF_LIFE_MONTHS } from '@/lib/waxMath';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import { useLanguage } from '@/hooks/useLanguage';
import { InstrumentFrame } from '@/components/viz/InstrumentFrame';
import { ProfileBar } from '@/components/tools/ProfileBar';
import { AssumptionsDisclosure } from '@/components/tools/AssumptionsDisclosure';

/** Eine Kennzahl unter einer Haarlinie. Kein Kasten, kein Icon — DESIGN.md §3. */
function Readout({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="py-4 pr-4" style={{ borderTop: '1px solid var(--bd)' }}>
      <p className="font-display font-bold leading-[1.05] tracking-[-0.02em]"
        style={{ fontSize: 'clamp(1.35rem, 2.6vw, 1.75rem)', color: 'var(--tx1)' }}>
        {value}
      </p>
      <p className="text-meta mt-1" style={{ color: 'var(--txff)' }}>{label}</p>
      {note && <p className="text-meta mt-0.5 leading-[1.4]" style={{ color: 'var(--txff)' }}>{note}</p>}
    </div>
  );
}

/** Das Ergebnis der Groessenrechnung. EINE Quelle fuer beide Ausgabestellen:
    das Instrument und die Zeile am Groessenschalter im Kaufblock. Zwei
    getrennte Rechnungen waeren genau der Fehler, der auf dieser Seite schon
    Widerrufsrecht und GPSR auseinanderlaufen liess. */
export interface SizeAdvice {
  /** Der empfohlene Block, oder undefined ausserhalb der Wachsprodukte. */
  recommended: Product | undefined;
  /** Zeigt die Empfehlung auf das gerade angesehene Produkt? */
  matchesCurrent: boolean;
  /** Der grosse Block wuerde laenger reichen als seine Haltbarkeit. */
  largeOutlastsShelfLife: boolean;
  large: Product | undefined;
}

export function sizeAdviceFor(product: Product, profile: ToolProfileState): SizeAdvice {
  const isPro = product.variant === 'pro';
  const kmPerYear = profile.kmPerWeek * 52;
  const small = getProductById(isPro ? 'wax-300-mos2' : 'wax-300');
  const large = getProductById(isPro ? 'wax-500-mos2' : 'wax-500');
  const largeEcon = large
    ? switchEconomics({ kmPerYear, rewaxKm: profile.interval, toolingCost: 0, waxProduct: large })
    : null;
  const outlasts = !!largeEcon?.outlastsShelfLife;
  const recommended = outlasts ? small : large;
  return {
    recommended,
    matchesCurrent: recommended?.id === product.id,
    largeOutlastsShelfLife: outlasts,
    large,
  };
}

export function SizingInstrument({ product, profile, accentColor }: {
  product: Product;
  profile: ToolProfileState;
  accentColor: string;
}) {
  const { t, lang } = useLanguage();
  const de = lang === 'de';

  const isWax = product.category === 'wax';
  const isPro = product.variant === 'pro';

  const kmPerYear = profile.kmPerWeek * 52;
  const rewaxKm = profile.interval;

  // toolingCost 0: auf der Produktseite geht es nicht um den Umstieg, sondern
  // um die Reichweite dieses Blocks. breakEvenMonths bleibt dadurch ungenutzt.
  const econ = switchEconomics({ kmPerYear, rewaxKm, toolingCost: 0, waxProduct: product });

  const perYear = Math.max(1, Math.round(econ.applicationsPerYear));

  const { recommended, matchesCurrent: isRecommended, largeOutlastsShelfLife, large } =
    sizeAdviceFor(product, profile);

  // ── Formelempfehlung ──────────────────────────────────────────────────────
  // Nur das Wetter entscheidet, und zwar mit Lucas eigenen, freigegebenen
  // Positionierungen (shelf.classicFor "Fruehling bis Herbst", shelf.proFor
  // "Ganzjahr & E-Bike") plus den bestFor-Daten in data.ts (Classic "Sommer &
  // Trockenheit", Pro "Herbst & Winter", "Ganzjahresbetrieb").
  // Bewusst konservativ: "gemischt" bleibt Classic, weil Classic ausdruecklich
  // fuer Fruehling bis Herbst freigegeben ist. Nur echte Naesse fuehrt zu Pro.
  // ACHTUNG: Diese Zuordnung ist ein VORSCHLAG und braucht Lucas Freigabe.
  const wantsPro = profile.weather === 'nass';
  const formulaMismatch = isWax && wantsPro !== isPro;

  const monthLabel = (m: number) =>
    m >= 24
      ? (de ? `${(m / 12).toFixed(1).replace('.', ',')} Jahre` : `${(m / 12).toFixed(1)} years`)
      : (de ? `${m} ${m === 1 ? 'Monat' : 'Monate'}` : `${m} ${m === 1 ? 'month' : 'months'}`);

  const perMonth = econ.monthsPerBlock > 0 ? product.price / econ.monthsPerBlock : null;
  const fmt = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

  return (
    <section id="instrument" style={{ background: 'var(--pg)' }}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pb-12 lg:pb-16">
        <InstrumentFrame eyebrow={de ? 'Für dein Fahren gerechnet' : 'Calculated for your riding'}>
          <h2 className="font-display text-[20px] sm:text-[24px] font-bold tracking-[-0.02em] mb-1"
            style={{ color: 'var(--tx1)' }}>
            {de ? 'Was das für dich heißt' : 'What this means for you'}
          </h2>
          <p className="text-small mb-5" style={{ color: 'var(--txm)' }}>
            {de
              ? 'Drei Angaben, und die Seite rechnet den Rest. Voreingestellt ist ein durchschnittliches Profil.'
              : 'Three inputs and the page works out the rest. An average profile is preset.'}
          </p>

          <ProfileBar profile={profile} />

          {/* Ergebnisse. Ketten haben kein applications-Feld, dort bleiben
              Blockreichweite und Monatskosten leer — die Frage stellt sich
              bei einer fertig gewachsten Kette nicht. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 mt-4">
            <Readout
              value={`${rewaxKm} km`}
              label={de ? 'Dein Wachsintervall' : 'Your waxing interval'} />
            <Readout
              value={de ? `${perYear}×` : `${perYear}×`}
              label={de ? 'Wachsgänge pro Jahr' : 'Waxings per year'} />
            {isWax && econ.monthsPerBlock > 0 && (
              econ.outlastsShelfLife ? (
                <Readout
                  value={monthLabel(WAX_SHELF_LIFE_MONTHS)}
                  label={de ? 'Haltbarkeit des Blocks' : 'Shelf life of the block'}
                  note={de
                    ? `Rechnerisch würde er ${monthLabel(econ.monthsPerBlock)} reichen — länger, als er haltbar ist.`
                    : `He would mathematically last ${monthLabel(econ.monthsPerBlock)} — longer than its shelf life.`} />
              ) : (
                <Readout
                  value={monthLabel(econ.monthsPerBlock)}
                  label={de ? 'Reicht dir dieser Block' : 'This block lasts you'} />
              )
            )}
            {isWax && perMonth !== null && (
              <Readout
                value={fmt(perMonth)}
                label={de ? 'Kosten pro Monat' : 'Cost per month'} />
            )}
          </div>

          {/* ── Die zwei Empfehlungen ──────────────────────────────────────
              Erst wenn eine davon NICHT auf das gerade angesehene Produkt
              zeigt, ist sie eine Aussage. Zeigt sie darauf, bestaetigt sie
              nur — auch das ist eine Antwort, aber eine leise. */}
          {isWax && (
            <div className="mt-5 pt-5 space-y-2.5" style={{ borderTop: '1px solid var(--bd)' }}>
              {/* Groesse */}
              {recommended && (
                isRecommended ? (
                  <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--txm)' }}>
                    {de
                      ? `Die ${product.weight}-Größe passt zu diesem Profil.`
                      : `The ${product.weight} size fits this profile.`}
                  </p>
                ) : (
                  <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--tx2)' }}>
                    {de
                      ? `Bei diesem Profil passt die ${recommended.weight}-Größe besser: `
                      : `At this profile the ${recommended.weight} size fits better: `}
                    <span style={{ color: 'var(--txm)' }}>
                      {largeOutlastsShelfLife
                        ? (de
                          ? `der ${large?.weight}-Block würde bei dir länger reichen, als er haltbar ist.`
                          : `the ${large?.weight} block would last you longer than its shelf life.`)
                        : (de
                          ? 'günstiger je Anwendung.'
                          : 'cheaper per application.')}
                    </span>{' '}
                    <Link to={`/produkt/${recommended.id}`}
                      className="inline-flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                      style={{ color: accentColor }}>
                      {de ? `${recommended.weight} ansehen` : `View ${recommended.weight}`}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </p>
                )
              )}

              {/* Sehr viele Wachsgaenge: needsHybridHint aus waxMath, bis
                  09/2026 nie gerendert. */}
              {econ.needsHybridHint && (
                <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--tx2)' }}>
                  {de
                    ? `Bei ${perYear} Wachsgängen im Jahr wird Heißwachsen allein aufwendig. `
                    : `At ${perYear} waxings a year hot waxing alone gets laborious. `}
                  <Link to="/blog/tropfwachs-hybrid-methode"
                    className="inline-flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                    style={{ color: accentColor }}>
                    {de ? 'Hybrid-Methode ansehen' : 'See the hybrid method'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              )}

              {/* Formel */}
              {formulaMismatch && (
                <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--tx2)' }}>
                  {de
                    ? (wantsPro
                      ? 'Du fährst überwiegend bei Nässe. Dafür ist Pro gemacht: '
                      : 'Du fährst überwiegend trocken. Dafür reicht Classic: ')
                    : (wantsPro
                      ? 'You ride mostly in the wet. That is what Pro is made for: '
                      : 'You ride mostly dry. Classic is enough for that: ')}
                  <span style={{ color: 'var(--txm)' }}>
                    {wantsPro ? t.products.shelf.proFor : t.products.shelf.classicFor}.
                  </span>{' '}
                  <Link to={`/produkt/${wantsPro ? (product.weight === '300g' ? 'wax-300-mos2' : 'wax-500-mos2') : (product.weight === '300g' ? 'wax-300' : 'wax-500')}`}
                    className="inline-flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                    style={{ color: accentColor }}>
                    {de ? (wantsPro ? 'Pro ansehen' : 'Classic ansehen') : (wantsPro ? 'View Pro' : 'View Classic')}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              )}
            </div>
          )}

          <div className="mt-5">
            <AssumptionsDisclosure />
          </div>
        </InstrumentFrame>
      </div>
    </section>
  );
}
