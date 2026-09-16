import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useAnimation';
import { useDispatchLine } from '@/hooks/useDispatchLine';
import { useToolProfile } from '@/hooks/useToolProfile';
import type { Weather, Terrain } from '@/lib/ridingProfile';
import { buildVerdict, type Entry } from '@/lib/waxRecommendation';
import { WAX_SHELF_LIFE_MONTHS } from '@/lib/waxMath';
import { canCheckout, isSoldOut, starterSetBundleProducts, trustStats } from '@/lib/data';
import { AddToCartButton } from '@/components/AddToCartButton';
import { AnimatedNumber } from '@/components/viz';
import { SketchFrame, WaxBlockBar } from '@/components/tools/sketches';
import { TogButton, ChipRow, ToolSlider } from '@/components/tools/primitives';
import { trackEbayClick, trackStarterInterest, trackWaxVerdict } from '@/lib/analytics';

/**
 * "Welcher ist meiner" — der Eroeffnungszustand des Hero-Dialogs.
 *
 * Bis 09/2026 oeffnete der Klick auf den Wachsblock die Rezeptur. Das
 * beantwortete die falsche Frage: wer vor einer Kaufentscheidung steht, fragt
 * nicht "woraus besteht das", sondern "welches davon ist meins" — und genau
 * das stand nirgends auf der Seite (UX_UPGRADE_PLAN.md §7.4 nennt die Luecke
 * selbst: "Entscheidungslaehmung Classic vs. Pro"). Sechs Rechner, ein
 * ChainFinder und eine Vergleichstabelle rechnen, keiner davon empfiehlt.
 *
 * Drei Angaben, ein Urteil. Und damit loest der Moment das Versprechen der
 * eigenen Schlagzeile ein: "Am Ende der Recherche."
 *
 * Zwei Dinge, die hier bewusst NICHT passieren:
 *  - Es wird nichts neu gerechnet. Alle Zahlen kommen aus waxMath ueber
 *    lib/waxRecommendation.ts. Ein siebter Rechner waere genau der Fehler,
 *    den dieser Umbau behebt.
 *  - Es wird nicht nur zugeraten. Bei sehr wenigen Kilometern empfiehlt die
 *    Karte den kleineren Block (7 EUR weniger), bei sehr vielen raet sie zur
 *    Hybrid-Methode statt zu mehr Produkt. Siehe `honesty`.
 *
 * Nebenwirkung mit Absicht: der Dialog schreibt ueber useToolProfile in das
 * seitenweite Fahrprofil (ridingProfile.ts). Wer den Block anfasst, findet
 * danach alle Rechner und die Produktseiten vorausgefuellt vor. Das Profil
 * existierte laengst, wurde aber von niemandem befuellt.
 */
export function WaxVerdict({ de, onClose, entry, setEntry, onShowFormula }: {
  de: boolean;
  onClose: () => void;
  entry: Entry;
  setEntry: (e: Entry) => void;
  onShowFormula: () => void;
}) {
  const profile = useToolProfile();
  const { weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek, interval } = profile;
  const dispatch = useDispatchLine(de);
  const answerRef = useRef<HTMLDivElement>(null);

  const v = buildVerdict({ weather, terrain, kmPerWeek, interval, entry });

  // Einmal je Seitenaufruf, nicht je Chip-Klick (siehe trackWaxVerdict).
  useEffect(() => { trackWaxVerdict(v.wax.id); }, [v.wax.id]);

  const nf = (n: number, d = 0) => n.toLocaleString(de ? 'de-DE' : 'en-US',
    { minimumFractionDigits: d, maximumFractionDigits: d });
  const eur = (n: number) => `${nf(n, 2)} €`;

  const terrains: { v: Terrain; label: string }[] = [
    { v: 'strasse', label: de ? 'Straße' : 'Road' },
    { v: 'gravel', label: 'Gravel' },
    { v: 'mtb', label: 'MTB' },
  ];
  const weathers: { v: Weather; label: string }[] = [
    { v: 'trocken', label: de ? 'Trocken' : 'Dry' },
    { v: 'gemischt', label: de ? 'Gemischt' : 'Mixed' },
    { v: 'nass', label: de ? 'Nass & Winter' : 'Wet & winter' },
  ];

  /** Warum diese Linie — woertlich aus den Produktbeschreibungen in data.ts,
   *  nur auf das eingestellte Profil bezogen. Kein neuer Claim. */
  const reason = v.proReason === 'nass'
    ? (de
      ? 'Bei Nässe und Kälte bildet MoS₂ einen festeren Transferfilm: längere Intervalle, weniger Rost, flexibel bis −8 °C.'
      : 'In wet and cold, MoS₂ builds a harder transfer film: longer intervals, less rust, functional down to −8 °C.')
    : v.proReason === 'mtb'
      ? (de
        ? 'Auf dem MTB stehen kurze Intervalle und Spritzwasser an. Dafür ist die Pro-Formel gemacht: festerer Film, längere Intervalle, weniger Rost.'
        : 'MTB means short intervals and spray. That is what the Pro formula is for: a harder film, longer intervals, less rust.')
      : (de
        ? 'Für dein Profil reicht Classic: sauberer Antrieb, kein Nachschmieren, kein Dreck. Am besten bei trockenem Wetter.'
        : 'Classic is enough for your profile: a clean drivetrain, no re-lubing, no grime. Best in dry weather.');

  // Nur wenn sich die EMPFEHLUNG aendert, nicht bei jedem Slider-Pixel: der
  // Wechsel Classic→Pro oder 500→300 ist der Moment, den man sehen soll.
  useEffect(() => {
    if (prefersReducedMotion() || !answerRef.current) return;
    const tl = gsap.fromTo(answerRef.current, { opacity: 0.35, y: 4 },
      { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
    return () => { tl.kill(); };
  }, [v.wax.id, v.starter?.id]);

  // Gedeckelt an der Haltbarkeit: "43 Mon." neben dem Hinweis, dass ein Block
  // bei diesen Kilometern ueberlagert, waeren zwei Aussagen, die sich
  // widersprechen. "30+ Mon." sagt dasselbe, ohne etwas zu behaupten, das der
  // eigene Hinweis eine Zeile tiefer wieder einkassiert.
  const monthsCapped = v.econ.monthsPerBlock > WAX_SHELF_LIFE_MONTHS;
  const monthsShown = Math.min(v.econ.monthsPerBlock, WAX_SHELF_LIFE_MONTHS);

  const honesty = v.honesty === 'smaller-block'
    ? (de
      ? 'Bei deinen Kilometern wäre der große Block überlagert, bevor du ihn aufbrauchst. Der kleinere ist hier der ehrlichere Kauf.'
      : 'At your mileage the large block would age out before you use it up. The smaller one is the honest choice here.')
    : v.honesty === 'hybrid'
      ? (de
        ? 'So oft wachst du in der Praxis nicht im Topf. Für deine Kilometer ist Heißwachs plus Tropfwachs dazwischen der ehrliche Weg.'
        : 'Nobody fires up the pot that often. At your mileage, hot wax plus drip wax in between is the honest route.')
      : null;

  /** Im Öl-Zweig ist das Set die Antwort, nicht der Block allein. */
  const starterProduct = v.starter
    ? starterSetBundleProducts.find(p => p.id === v.starter!.id) ?? null
    : null;
  const offer = starterProduct ?? v.wax;

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="grid lg:grid-cols-[0.72fr_1fr]">

        {/* ── LINKS: die drei Angaben ── */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 lg:py-7 lg:border-r min-w-0" style={{ borderColor: 'var(--bd)' }}>
          {/* Keine Eyebrow "Drei Angaben" mehr: die Kopfzeile des Dialogs sagt
              das bereits, und die nummerierten Schritte erklaeren sich selbst. */}
          <Step n={1} label={de ? 'Wie fährst du?' : 'How do you ride?'}>
            <ChipRow>
              {terrains.map(o => (
                <TogButton key={o.v} active={terrain === o.v} onClick={() => setTerrain(o.v)}>
                  {o.label}
                </TogButton>
              ))}
            </ChipRow>
          </Step>

          <Step n={2} label={de ? 'Bei welchem Wetter?' : 'In what weather?'}>
            <ChipRow>
              {weathers.map(o => (
                <TogButton key={o.v} active={weather === o.v} onClick={() => setWeather(o.v)}>
                  {o.label}
                </TogButton>
              ))}
            </ChipRow>
          </Step>

          <Step n={3} label={de ? 'Wie viel pro Woche?' : 'How much per week?'} last>
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <ToolSlider
                  value={kmPerWeek}
                  onValueChange={setKmPerWeek}
                  min={20} max={500} step={10}
                  ariaLabel={de ? 'Kilometer pro Woche' : 'Kilometres per week'}
                />
              </div>
              <span className="num text-[14px] font-semibold tabular-nums flex-shrink-0 w-[74px] text-right"
                style={{ color: 'var(--tx1)' }}>
                {nf(kmPerWeek)} km
              </span>
            </div>
          </Step>

          {/* Der Zweig. Bewusst nicht nummeriert — sonst sind es vier Fragen,
              und die vierte waere die wichtigste. */}
          <div className="mt-4 pt-4 sm:mt-5 sm:pt-5" style={{ borderTop: '1px solid var(--bd2)' }}>
            <div className="flex flex-wrap gap-1.5">
              <TogButton active={entry === 'waxes'} onClick={() => setEntry('waxes')}>
                {de ? 'Ich wachse schon' : 'I already wax'}
              </TogButton>
              <TogButton active={entry === 'oil'} onClick={() => setEntry('oil')}>
                {de ? 'Noch Öl am Rad' : 'Still on oil'}
              </TogButton>
            </div>
          </div>
        </div>

        {/* ── RECHTS: das Urteil ── */}
        {/* Gestapelt braucht die Antwort eine Kante gegen die Fragen; nebeneinander
            traegt das `lg:border-r` der linken Spalte die Trennung schon. */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 lg:py-7 flex flex-col min-w-0 min-h-[320px] lg:min-h-[420px] border-t lg:border-t-0"
          style={{ borderColor: 'var(--bd)' }}>

          {entry === 'oil' && (
            <p className="eyebrow mb-2" style={{ color: 'var(--accent-soft)' }}>
              {de ? 'Den schwierigen Teil haben wir schon gemacht' : 'We already did the hard part'}
            </p>
          )}

          <div ref={answerRef} className="flex items-start gap-4">
            <img
              src={offer.image}
              alt={de ? offer.title : offer.titleEn}
              className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
              style={{ border: '1px solid var(--bd2)' }}
            />
            <div className="min-w-0 flex-1">
              {/* Der volle Set-Titel ("Starter-Set — Kettenwachs 300g — Classic
                  + YBN 11S 11-fach — vorgewachst") laeuft hier ueber drei
                  Zeilen und erschlaegt den Preis. Das Set traegt seinen Namen,
                  die Zusammenstellung steht als Unterzeile darunter. */}
              <h3 className="font-display font-bold text-[1.2rem] lg:text-[1.35rem] leading-tight"
                style={{ color: 'var(--tx1)' }}>
                {v.starter
                  ? (de ? 'Das Starter-Set' : 'The starter set')
                  : (de ? offer.title : offer.titleEn)}
              </h3>
              {v.starter && (
                <p className="text-[12.5px] leading-snug mt-1" style={{ color: 'var(--txm)' }}>
                  {de ? v.starter.taglineDe : v.starter.taglineEn}
                </p>
              )}
              <p className="num text-[17px] font-bold mt-1" style={{ color: 'var(--tx1)' }}>
                {eur(offer.price)}
              </p>
            </div>
          </div>

          {/* Begruendung: genau zwei Zeilen, damit der Block darunter beim
              Umschalten nicht wandert. */}
          {/* Feste Hoehe nur ab lg: dort stehen Fragen und Urteil nebeneinander
              und der Block darunter darf beim Umschalten nicht wandern.
              Gestapelt (Handy) waeren zwei Zeilen zu wenig — dort passt der
              Satz in drei, und gescrollt wird ohnehin. */}
          <p className="mt-3.5 text-[13.5px] leading-relaxed line-clamp-3 lg:line-clamp-2 lg:h-[3.3em]"
            style={{ color: 'var(--tx2)' }}>
            {entry === 'oil'
              ? (de
                ? 'Die eigentliche Hürde ist das erste Entfetten, nicht das Wachsen. Die Kette kommt fertig entfettet und gewachst: montieren, losfahren.'
                : 'The real hurdle is the first degreasing, not the waxing. The chain arrives degreased and waxed: fit it and ride.')
              : reason}
          </p>

          {/* Genau zwei Kennzahlen — und die zweite ist bewusst der Anker
              gegen Öl, nicht eine weitere Verbrauchsangabe. Ein Block, der
              18 Monate hält, ist eine Spezifikation; was er gegenüber
              Weiterölen spart, ist das Ergebnis. Die Zahl kommt aus
              drivetrainCosts (Kette + Kassette + Schmierstoff), derselben
              Rechnung wie auf der Produktseite und unter /rechner.
              Fällt sie nicht positiv aus, steht wieder der Preis je
              Wachsgang dort — behauptet wird nie eine Ersparnis, die das
              Profil nicht hergibt. */}
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <Fact
              label={de ? 'Hält dich' : 'Lasts you'}
              value={<><AnimatedNumber value={monthsShown} />{monthsCapped ? '+' : ''} {de ? 'Mon.' : 'mo.'}</>}
            />
            {v.econ.savingsPerYear > 0 ? (
              <Fact
                // "Statt Öl im Jahr +55 €" laesst sich auch als Mehrkosten
                // lesen. Der Nutzen gehoert ins Label, die Zahl bleibt nackt.
                label={de ? 'Sparst du im Jahr' : 'You save a year'}
                accent
                value={<><AnimatedNumber value={v.econ.savingsPerYear} /> €</>}
              />
            ) : (
              <Fact
                label={de ? 'Je Wachsgang' : 'Per waxing'}
                value={eur(v.perApplication)}
              />
            )}
          </dl>

          <div className="mt-4">
            <SketchFrame
              height={136}
              caption={de
                ? `${nf(kmPerWeek * 52)} km im Jahr · ${nf(interval)} km je Wachsgang · rund ${eur(v.perApplication)} pro Wachsgang.`
                : `${nf(kmPerWeek * 52)} km a year · ${nf(interval)} km per waxing · about ${eur(v.perApplication)} each.`}
            >
              <WaxBlockBar
                applications={v.applications}
                perYear={v.applicationsPerYear}
                blockLabel={de ? `1 Block · ${v.wax.weight}` : `1 block · ${v.wax.weight}`}
                leftoverLabel={de ? `${v.wax.applications} Wachsgänge` : `${v.wax.applications} waxings`}
                usedLabel={v.applicationsPerYear >= v.applications
                  ? (de ? '1. Jahr · Block vorher leer' : 'Year 1 · block runs out first')
                  : (de ? '1. Jahr' : 'Year 1')}
              />
            </SketchFrame>
          </div>

          {/* Der Hinweis, der gegen den groesseren Warenkorb ausschlaegt. Die
              Zeile wird immer gerendert, auch leer — sonst springt der CTA.
              Dieselbe Disziplin wie in ResultPanel. */}
          <div className="mt-3 min-h-[30px]">
            {honesty && (
              <p className="text-[12.5px] leading-snug pl-3"
                style={{ color: 'var(--txm)', borderLeft: '2px solid var(--tool-warn)' }}>
                {honesty}
                {v.honesty === 'hybrid' && (
                  <>
                    {' '}
                    <Link to="/anleitung" onClick={onClose} className="font-semibold"
                      style={{ color: 'var(--accent-soft)' }}>
                      {de ? 'So geht das' : 'How that works'}
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>

          {/* ── CTA ── */}
          <div className="mt-auto pt-4 flex flex-col gap-2.5">
            {starterProduct && v.starter ? (
              // Starter-Sets leben nur in starterSetBundleProducts und haben
              // bei inaktivem Stripe keinen eigenen eBay-Artikel — deshalb
              // fuehrt der Weg hier auf die Set-Seite, nicht in den Warenkorb.
              <Link
                to="/starter-set"
                onClick={() => { trackStarterInterest(v.starter!.id); onClose(); }}
                className="flex items-center justify-center gap-1.5 w-full px-5 py-3 rounded-xl text-[14px] font-semibold transition-transform active:scale-[0.98]"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {de ? 'Set ansehen' : 'View the set'}
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            ) : isSoldOut(offer) ? (
              <p className="text-[13px] font-semibold text-center py-3" style={{ color: 'var(--txm)' }}>
                {de ? 'Zurzeit ausverkauft' : 'Currently sold out'}
              </p>
            ) : canCheckout(offer) ? (
              <AddToCartButton product={offer} fullWidth />
            ) : (
              <a
                href={offer.ebayUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.stopPropagation(); trackEbayClick(offer.id); }}
                className="flex items-center justify-center gap-1.5 w-full px-5 py-3 rounded-xl text-[14px] font-semibold transition-transform active:scale-[0.98]"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {de ? 'Jetzt bestellen' : 'Order now'}
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            )}

            {/* Die beiden Hebel, die unter jedem Kauf-Button dieser Seite
                ohnehin gelten, hier aber fehlten: wie schnell es da ist
                (Zeit) und dass es andere schon gekauft haben (Zuversicht).
                Beide aus bestehenden Quellen — useDispatchLine und
                trustStats —, keine neue Zahl. */}
            <p className="text-[12px] leading-snug text-center" style={{ color: 'var(--txm)' }}>
              {dispatch}
            </p>
            <p className="text-[12px] leading-snug text-center" style={{ color: 'var(--txf)' }}>
              {de
                ? `Über ${trustStats.sold} verkaufte Einheiten · ${trustStats.reviews} Bewertungen · 100 % positiv`
                : `${trustStats.sold}+ units sold · ${trustStats.reviews} reviews · 100 % positive`}
            </p>

            <button
              type="button"
              onClick={onShowFormula}
              className="inline-flex items-center gap-1.5 self-center text-[12.5px] font-semibold group mt-0.5"
              style={{ color: 'var(--accent-soft)' }}
            >
              {de ? 'Was in diesem Block steckt' : 'What is in this block'}
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ein nummerierter Schritt auf einer Haarlinie — derselbe Rhythmus wie in
 *  ChainFinder.tsx, bewusst ohne gefuellte Kachel (DESIGN.md §3). */
function Step({ n, label, children, last, className = '' }: {
  n: number; label: string; children: React.ReactNode; last?: boolean; className?: string;
}) {
  return (
    <div className={`${last ? '' : 'mb-3 pb-3 sm:mb-4 sm:pb-4'} ${className}`}
      style={last ? undefined : { borderBottom: '1px solid var(--bd2)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="num text-meta" style={{ color: 'var(--accent-soft)' }}>
          {String(n).padStart(2, '0')}
        </span>
        <span className="text-small uppercase tracking-[0.14em]" style={{ color: 'var(--txf)' }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Eine Kennzahl auf einer Haarlinie.
 *
 *  `accent` ist fuer die eine Zahl, die das Ergebnis traegt: Fraunces statt
 *  Libre Franklin (`.num-display`, laut DESIGN.md §2 genau fuer Momente
 *  reserviert) und in Markenblau. Zwei gleich gesetzte Zahlen nebeneinander
 *  waeren zwei Spezifikationen; eine davon soll die Antwort sein. */
function Fact({ label, value, accent }: {
  label: string; value: React.ReactNode; accent?: boolean;
}) {
  return (
    <div style={{ borderTop: `1px solid ${accent ? 'var(--accent-soft)' : 'var(--bd2)'}` }} className="pt-2">
      <dt className="text-[11.5px] uppercase tracking-[0.12em]"
        style={{ color: accent ? 'var(--accent-soft)' : 'var(--txff)' }}>{label}</dt>
      <dd
        className={`${accent ? 'num-display font-display text-[26px]' : 'num text-[19px]'} font-bold leading-none mt-1.5`}
        style={{ color: accent ? 'var(--accent-strong)' : 'var(--tx1)' }}
      >
        {value}
      </dd>
    </div>
  );
}
