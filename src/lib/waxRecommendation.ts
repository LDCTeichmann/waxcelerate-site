// ── Welcher Block ist deiner? ───────────────────────────────────────────────
//
// Die Auswahllogik hinter dem Hero-Moment (Klick auf den Wachsblock). Bewusst
// eine reine Funktion ohne JSX und ohne React-Import, damit sie wie
// lib/toolRegistry.ts auch aus den Prerender-Skripten unter scripts/ gelesen
// werden kann.
//
// WICHTIG: Hier wird nichts neu gerechnet und nichts neu behauptet. Alle
// Zahlen kommen aus waxMath.ts (switchEconomics, applicationsPerBlock,
// costPerApplication) und waxIntervals aus data.ts, alle Produktaussagen aus
// den vorhandenen Beschreibungen in data.ts. Der Moment ordnet vorhandene
// Fakten einem Fahrprofil zu — er erfindet keine.
//
// Die beiden Faelle, in denen die Empfehlung GEGEN den groesseren Warenkorb
// ausschlaegt (kleinerer Block, Hybrid-Hinweis), sind Absicht und kein
// Randfall: ein Ratgeber, der auch abraet, ist der einzige, dem man das
// Zuraten glaubt. Siehe `honesty` unten.

import { getProductById, starterSetOptions, type Product, type StarterSetOption } from '@/lib/data';
import type { Weather, Terrain } from '@/lib/ridingProfile';
import {
  switchEconomics, applicationsPerBlock, costPerApplication, referenceWax,
  type SwitchEconomics,
} from '@/lib/waxMath';

/** Wachst jemand schon, oder faehrt er noch Oel? Der Zweig, der alles aendert. */
export type Entry = 'waxes' | 'oil';

export interface VerdictInput {
  weather: Weather;
  terrain: Terrain;
  kmPerWeek: number;
  /** km je Wachsgang aus Wetter x Gelaende — kommt fertig aus useToolProfile. */
  interval: number;
  entry: Entry;
}

/** Warum diese Linie, in einem Satz — aus den Produktdaten, nicht neu erfunden. */
export type ProReason = 'nass' | 'mtb' | null;

/** Ein Hinweis, der den Warenkorb kleiner macht statt groesser. */
export type HonestyFlag = 'smaller-block' | 'hybrid' | null;

export interface Verdict {
  /** Das empfohlene Wachs. Immer gesetzt — auch im Oel-Zweig, dort als Teil des Sets. */
  wax: Product;
  variant: 'classic' | 'pro';
  /** Warum Pro statt Classic. null = Classic reicht. */
  proReason: ProReason;
  /** Der Einstiegsweg fuer Oel-Fahrer. null im Wachser-Zweig. */
  starter: StarterSetOption | null;
  /** Wirtschaftlichkeit bei diesem Profil, aus waxMath. */
  econ: SwitchEconomics;
  /** Wachsgaenge, die in dem Block stecken. */
  applications: number;
  /** Wachsgaenge, die dieses Profil in einem Jahr verbraucht. */
  applicationsPerYear: number;
  /** Preis je Wachsgang in Euro. */
  perApplication: number;
  /** Der eine Hinweis, der gegen den groesseren Warenkorb ausschlaegt. */
  honesty: HonestyFlag;
}

/**
 * Pro oder Classic.
 *
 * Deckt sich woertlich mit den vorhandenen Produktbeschreibungen in data.ts
 * ("Fuer Naesse und Winter" gegen "Fuer Fruehling bis Herbst") — das ist
 * bewusst kein neuer Claim, sondern derselbe, nur auf ein Profil angewandt.
 * MTB zaehlt mit, weil dort dieselbe Belastung greift (Schmutz, Spritzwasser,
 * kurze Intervalle), siehe waxIntervals.
 */
function pickVariant(weather: Weather, terrain: Terrain): { variant: 'classic' | 'pro'; reason: ProReason } {
  if (weather === 'nass') return { variant: 'pro', reason: 'nass' };
  if (terrain === 'mtb') return { variant: 'pro', reason: 'mtb' };
  return { variant: 'classic', reason: null };
}

const WAX_IDS = {
  classic: { big: 'wax-500', small: 'wax-300' },
  pro: { big: 'wax-500-mos2', small: 'wax-300-mos2' },
} as const;

/**
 * Das passende Starter-Set fuer den Oel-Zweig.
 *
 * Die vier Sets in data.ts sind bereits nach genau diesen Kriterien
 * geschnitten (starter-pro "Naesse, Kaelte, E-Bike", starter-classic
 * "Fruehjahr bis Herbst"), die Zuordnung ist deshalb fast reine Datenarbeit.
 * Gesucht wird ueber die Wachs-Id des Sets, nicht ueber die Set-Id: so bleibt
 * die Zuordnung gueltig, wenn Luca die Sets umbenennt oder umstellt.
 */
function pickStarter(variant: 'classic' | 'pro'): StarterSetOption | null {
  const wanted = variant === 'pro' ? 'wax-500-mos2' : 'wax-300';
  // Mit Kette zuerst: wer noch Oel faehrt, braucht genau das — eine fertig
  // gewachste Kette, damit das erste Entfetten entfaellt. Das ist die
  // eigentliche Kaufbremse, nicht der Preis.
  return starterSetOptions.find(o => o.waxId === wanted && o.chainId)
    ?? starterSetOptions.find(o => o.waxId === wanted)
    ?? null;
}

export function buildVerdict({ weather, terrain, kmPerWeek, interval, entry }: VerdictInput): Verdict {
  const { variant, reason } = pickVariant(weather, terrain);
  const ids = WAX_IDS[variant];

  const kmPerYear = Math.max(0, kmPerWeek) * 52;
  const big = getProductById(ids.big)!;

  // Erst mit dem 500er rechnen, dann fragen, ob der kleinere ehrlicher waere.
  // outlastsShelfLife heisst: der Block waere ueberlagert, bevor er leer ist
  // (WAX_SHELF_LIFE_MONTHS). Dann ist der 300er die richtige Antwort, auch
  // wenn er sieben Euro weniger einbringt.
  const bigEcon = switchEconomics({ kmPerYear, rewaxKm: interval, toolingCost: 0, waxProduct: big });
  const ownBlock = bigEcon.outlastsShelfLife ? getProductById(ids.small)! : big;

  const starter = entry === 'oil' ? pickStarter(variant) : null;

  // Im Oel-Zweig ist das Set die Antwort — dann muss auch der Balken den Block
  // zeigen, der WIRKLICH im Set steckt. Sonst verspricht die Karte neben einem
  // 300-g-Set die Reichweite eines 500ers, und das waere schlicht falsch.
  const wax = starter ? getProductById(starter.waxId) ?? ownBlock : ownBlock;

  const econ = wax === big
    ? bigEcon
    : switchEconomics({ kmPerYear, rewaxKm: interval, toolingCost: 0, waxProduct: wax });

  // Der Downsell-Hinweis gilt nur im Wachser-Zweig: im Set ist die Blockgroesse
  // ohnehin vorgegeben, ein "nimm den kleineren" waere dort ohne Handlung.
  const honesty: HonestyFlag = econ.needsHybridHint
    ? 'hybrid'
    : (!starter && bigEcon.outlastsShelfLife) ? 'smaller-block' : null;

  return {
    wax,
    variant,
    proReason: reason,
    starter,
    econ,
    applications: applicationsPerBlock(wax) ?? applicationsPerBlock(referenceWax) ?? 0,
    applicationsPerYear: econ.applicationsPerYear,
    perApplication: costPerApplication(wax) ?? 0,
    honesty,
  };
}
