// ─── Science-page editorial content ──────────────────────────────────────────
// Recovered depth: the "why" behind each component, the relationship graph, and
// the development-iteration story. Bilingual (de/en). Consumed by SciencePage +
// FormulaGraph. (Editorial science copy — distinct from product SKU data.)

export type DiagramKey =
  | 'lamellar' | 'droplift' | 'coldflex' | 'shear' | 'density' | 'radical'
  | 'ptfe' | 'stearin';

export interface ScienceComponent {
  node: number;          // graph node id (1–6), referenced by EDGES
  id: string;            // anchor / deep-link target
  graphLabelDe: string; graphLabelEn: string;  // short label for the graph
  nameDe: string; nameEn: string;
  roleDe: string; roleEn: string;
  metric: string;
  // Tier 1 — always visible
  sumDe: string; sumEn: string;
  // Tier 2a — "Warum das zählt" (short rationale)
  whyDe: string; whyEn: string;
  // Tier 2b — "Die Physik" (deep copy, one entry per paragraph)
  physicsDe: string[]; physicsEn: string[];
  insightDe: string; insightEn: string;
  diagram: DiagramKey;
  // Graph geometry (from the recovered ASSEMBLY_NODES layout)
  cx: number; cy: number; r: number;
}

export const COMPONENTS: ScienceComponent[] = [
  {
    node: 1, id: 'kristallstruktur',
    graphLabelDe: 'Paraffin', graphLabelEn: 'Paraffin',
    nameDe: 'Paraffin', nameEn: 'Paraffin',
    roleDe: 'Trägermatrix', roleEn: 'Base scaffold', metric: '58–60 °C',
    sumDe: 'Vollraffiniertes Paraffin bildet den Grundfilm — kleine, dicht gepackte Kristalle bedecken mehr Metall und lassen weniger Wasser durch.',
    sumEn: 'Fully refined paraffin forms the base film — small, densely packed crystals cover more metal and let less water through.',
    whyDe: 'Grobkristallines Standard-Wachs lässt messbare Lücken, durch die Wasser die Stahloberfläche erreicht. Ein eng schmelzendes Paraffin (58–60 °C) kristallisiert feiner und dichter — der Film schließt besser ab und schützt vor Oxidation.',
    whyEn: 'Coarse standard wax leaves measurable gaps where water reaches the steel. A tight-melting paraffin (58–60 °C) crystallises finer and denser — the film seals better and protects against oxidation.',
    physicsDe: [
      'Die erste Frage war täuschend einfach: Welches Paraffin? Paraffin ist keine Substanz, sondern eine Kategorie — sie reicht von weichen, öligen Kerzenwachsen bis zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich.',
      'Wir haben uns für ein vollraffiniertes Erdöldestillat mit einem exakt definierten 2 °C-Erstarrungsfenster (58–60 °C) entschieden. Diese Enge ist keine Präzision um ihrer selbst willen — sie sichert die Reproduzierbarkeit. Ein breiterer Erstarrungsbereich produziert je nach Batch leicht unterschiedliche Kristallstrukturen.',
      'Beim Abkühlen aus der Schmelze nucleieren die linearen Kohlenwasserstoffketten (C₂₀–C₃₆) und bilden lamellare Kristalldomänen — ein dreidimensionales Gitterwerk. Alle anderen Komponenten werden in den Zwischenbereichen dieses Gitters eingeschlossen. Die Basismatrix ist das Skelett. Alles andere ist eingebettet.',
    ],
    physicsEn: [
      'The first question was deceptively simple: which paraffin? Paraffin isn’t a material, it’s a category — spanning soft, oily candle waxes to brittle technical grades. The decisive variable is the solidification range.',
      'We chose a fully refined petroleum distillate with a precisely defined 2 °C solidification window (58–60 °C). This narrow range isn’t precision for its own sake — it ensures reproducibility. A wider solidification range produces subtly different crystal structures batch-to-batch.',
      'On cooling from the melt, the linear hydrocarbon chains (C₂₀–C₃₆) nucleate and form lamellar crystal domains — an interlocking three-dimensional lattice. All other components are trapped in the spaces between these crystals. The base matrix is the skeleton. Everything else is embedded within it.',
    ],
    insightDe: 'Das enge Erstarrungsfenster ist der Schlüssel zur Batch-Konsistenz — und damit zur gleichmäßigen Performance jedes Blocks.',
    insightEn: 'The narrow solidification window is the key to batch consistency — every block performing identically.',
    diagram: 'lamellar', cx: 320, cy: 112, r: 32,
  },
  {
    node: 2, id: 'matrix',
    graphLabelDe: 'FT-Wachs', graphLabelEn: 'FT-Wax',
    nameDe: 'Fischer-Tropsch-Wachs', nameEn: 'Fischer–Tropsch wax',
    roleDe: 'Härtemodul', roleEn: 'Hardener', metric: '+75 °C',
    sumDe: 'Synthetisches Hartwachs hebt den Tropfpunkt auf ~75 °C — die Matrix hält Position unter Last statt wegzuwandern.',
    sumEn: 'Synthetic hard wax raises the drop point to ~75 °C — the matrix holds position under load instead of migrating.',
    whyDe: 'An Kontaktpunkten entstehen unter Last 45–55 °C. Weiches Wachs erreicht hier seine Grenze, migriert vom Gelenk weg und dünnt aus. Das härtere FT-Wachs (Tropfpunkt ~75 °C) bleibt an Ort und Stelle: weniger Migration, längere Intervalle.',
    whyEn: 'Contact points reach 45–55 °C under load. Soft wax hits its limit here, migrating away from the joint and thinning out. The harder FT wax (drop point ~75 °C) stays put: less migration, longer intervals.',
    physicsDe: [
      'Das zweite Problem war der Sommer. An Kettenkontaktpunkten unter Last können Temperaturen 45–55 °C erreichen. Reines Paraffinwachs wäre an seiner thermischen Grenze — es würde erweichen, migrieren, auf dem Schaltwerk landen statt in den Gelenkstiften.',
      'Die Lösung war ein synthetisches Wachs, hergestellt über den Fischer-Tropsch-Prozess: eine Kohlenstoff-Syntheseroute, die Kohlenwasserstoffketten von außergewöhnlicher Reinheit liefert. Kein Schwefel, keine Aromaten, keine Verzweigungen — nur vollständig lineare Moleküle.',
      'In gezielt gewählter Konzentration erhöht dieses Additiv den effektiven Tropfpunkt der Gesamtmatrix auf ~72–78 °C. Der Mechanismus: Es ko-kristallisiert mit der Basismatrix, bildet aber dichtere, defektärmere Kristalldomänen, die deutlich mehr Energie zum Schmelzen benötigen.',
    ],
    physicsEn: [
      'The second problem was summer. At chain contact points under load, temperatures can reach 45–55 °C. Unmodified paraffin wax would be at its thermal limit — it would soften, migrate, end up on the derailleur instead of the chain pins.',
      'The solution was a synthetic wax produced via the Fischer-Tropsch process: a carbon synthesis route that yields hydrocarbon chains of exceptional purity. No sulfur, no aromatics, no branching — only perfectly linear molecules.',
      'At a carefully chosen concentration, this additive raises the effective drop point of the matrix to ~72–78 °C. The mechanism: it co-crystallizes with the base wax but forms denser, more defect-free crystal domains requiring significantly more energy to melt.',
    ],
    insightDe: 'Tests mit höherer Konzentration zeigten keine messbare Verbesserung. Das Optimum liegt unter dem, was man intuitiv erwarten würde.',
    insightEn: 'Tests at higher concentrations showed no measurable improvement. The optimum is lower than you’d intuitively expect.',
    diagram: 'droplift', cx: 154, cy: 88, r: 28,
  },
  {
    node: 3, id: 'winterformel',
    graphLabelDe: 'Mikrokris.', graphLabelEn: 'Microcris.',
    nameDe: 'Mikrokristallines Wachs', nameEn: 'Microcrystalline wax',
    roleDe: 'Plastifizierer', roleEn: 'Plastifier', metric: '−10 °C',
    sumDe: 'Hält die Matrix bei Frost elastisch bis −10 °C — kein Verspröden, kein Abplatzen an den Gelenken.',
    sumEn: 'Keeps the matrix elastic in frost down to −10 °C — no embrittlement, no flaking at the joints.',
    whyDe: 'Standard-Wachse werden unter ~5 °C spröde und brechen bei Biegung auf. Die amorphe, mikrokristalline Komponente bleibt elastisch und verhindert, dass der Film an den Kettengelenken abplatzt — entscheidend für Winter- und E-Bike-Betrieb.',
    whyEn: 'Standard waxes turn brittle below ~5 °C and fracture under flex. The amorphous microcrystalline component stays elastic and stops the film flaking off the chain joints — decisive for winter and e-bike use.',
    physicsDe: [
      'Das entgegengesetzte Problem folgte sofort: Winter. Eine reine Paraffinmatrix mit Fischer-Tropsch-Härtemodul ist unterhalb von 5 °C extrem spröde — spröde genug, um bei Biegebelastung zu brechen. Ein Kettengelenk, das sich in der Kälte bewegt, ließ die Wachsschicht buchstäblich abplatzen.',
      'Mikrokristallines Wachs löst dieses Problem strukturell. Im Gegensatz zu den geradkettigen Paraffinen besteht es aus hochverzweigten und zyklischen Molekülen, die keine geordneten Kristallstrukturen bilden können. Sie besetzen die amorphen Bereiche zwischen den Paraffindomänen — molekulare Plastifizierung.',
      'Diese Komponente erfüllt drei Funktionen gleichzeitig: (1) Die Matrix bleibt bis −10 °C elastisch verformbar statt zu brechen. (2) Die verzweigten Moleküle haben stärkere van-der-Waals-Wechselwirkungen mit der Stahloberfläche — bessere Haftung unter Scherkraft. (3) Die amorphen Bereiche betten die MoS₂-Partikel mechanisch in die Matrix ein.',
    ],
    physicsEn: [
      'The opposite problem arrived immediately: winter. A pure paraffin matrix with a Fischer-Tropsch hardener is extremely brittle below 5 °C — brittle enough to crack under bending stress. A chain link flexing in cold weather caused the wax coating to literally spall off.',
      'Microcrystalline wax solves this structurally. Unlike the straight-chain paraffins, it consists of highly branched and cyclic molecules that cannot form ordered crystal structures. They occupy the amorphous zones between paraffin crystal domains — molecular plasticization.',
      'This component serves three functions simultaneously: (1) The matrix remains elastically deformable down to −10 °C. (2) Branched molecules have stronger van-der-Waals interactions with the steel surface — better adhesion. (3) The amorphous regions mechanically embed the MoS₂ particles in the matrix.',
    ],
    insightDe: 'Ursprünglich höher konzentriert. Die Reduzierung war möglich, weil gleichzeitig der MoS₂-Anteil überarbeitet wurde.',
    insightEn: 'Originally at higher concentration. The reduction was possible because MoS₂ loading was revised simultaneously.',
    diagram: 'coldflex', cx: 486, cy: 88, r: 28,
  },
  {
    node: 4, id: 'mos2',
    graphLabelDe: 'MoS₂', graphLabelEn: 'MoS₂',
    nameDe: 'Molybdändisulfid (MoS₂)', nameEn: 'Molybdenum disulfide (MoS₂)',
    roleDe: 'Festschmierstoff', roleEn: 'Solid lubricant', metric: 'μ 0,03',
    sumDe: 'Lamellare MoS₂-Partikel (< 5 µm) gleiten wie Spielkarten aufeinander und bilden einen Transferfilm auf dem Stahl — Reibung bis μ 0,03.',
    sumEn: 'Lamellar MoS₂ particles (< 5 µm) glide like playing cards and form a transfer film on the steel — friction down to μ 0.03.',
    whyDe: 'MoS₂ besteht aus S–Mo–S-Schichten mit schwacher Bindung dazwischen. Unter Druck scheren die Schichten ab und legen sich als 2–5 nm dünner Transferfilm auf die Metalloberfläche (50–300 MPa an den Gelenken). Das senkt die Grenzreibung deutlich unter die von Öl.',
    whyEn: 'MoS₂ is built from S–Mo–S layers weakly bound between sheets. Under pressure the layers shear and lay down as a 2–5 nm transfer film on the metal (50–300 MPa at the joints). This drops boundary friction well below oil.',
    physicsDe: [
      'MoS₂ ist eines der wenigen Materialien mit einem Reibungskoeffizienten unter 0,05 unter Grenzschmierbedingungen. Der Grund liegt in der Kristallstruktur (hexagonal, P6₃/mmc): Mo-Atome sandwichartig zwischen zwei Schwefelschichten, die Schichten untereinander nur durch schwache van-der-Waals-Kräfte gebunden. Unter Kontaktdruck scheren diese Bindungen — die Schichten gleiten lateral fast widerstandslos.',
      'An Kettenkontaktflächen unter Last entstehen Drücke von 50–300 MPa. Das ist das Regime der Grenzschmierung — konventionelle Öle können keinen kontinuierlichen Film aufrechterhalten. MoS₂ bildet stattdessen einen Transferfilm: Partikel werden unter Druck auf der Stahloberfläche deponiert und durch tribochemische Bindungen (Mo–S → Fe–S) verankert. Dieser Film persistiert, auch nachdem der Wachsträger längst abgetragen ist.',
      'Die Partikelgröße ist nicht zufällig: Unter 5 µm passen die Partikel in die Kettenlagerungsspalte (typisch 5–15 µm). Eine einzige Ladung Wachs enthält Millionen von Partikeln — ausreichend für mehrfache Transferfilm-Regeneration über hunderte Kilometer. Mehr Konzentration schwächt die Wachsmatrix ohne tribologischen Mehrwert.',
    ],
    physicsEn: [
      'MoS₂ is one of the few materials with a friction coefficient below 0.05 under boundary lubrication conditions. The crystal structure is the reason (hexagonal, P6₃/mmc): Mo atoms sandwiched between two sulfur layers, with the layers bonded only by weak van-der-Waals forces. Under contact pressure, these bonds shear — the layers slide laterally with almost no resistance.',
      'At chain contact surfaces under load, pressures reach 50–300 MPa. This is the boundary lubrication regime — conventional oils cannot maintain a continuous film here. MoS₂ instead forms a transfer film: particles deposited on the steel surface and anchored by tribochemical bonds (Mo–S → Fe–S). This film persists long after the wax carrier is worn away.',
      'Particle size is deliberate: below 5 µm, particles fit within chain clearances (typically 5–15 µm). A single charge of wax contains millions of particles — sufficient for multiple transfer film regeneration cycles over hundreds of kilometers. Higher concentrations weaken the wax matrix without tribological benefit.',
    ],
    insightDe: 'Der Transferfilm ist der eigentliche Schmierstoff — das Wachs ist nur das Trägervehikel. MoS₂-Schichten, nanometerdick auf dem Stahl, schmieren noch, wenn der Block längst aufgebraucht ist.',
    insightEn: 'The transfer film is the actual lubricant — the wax is just the delivery vehicle. Nanometer-thin MoS₂ layers on the steel continue lubricating long after the block is spent.',
    diagram: 'shear', cx: 320, cy: 260, r: 48,
  },
  {
    node: 5, id: 'sedimentation',
    graphLabelDe: 'Dispersant', graphLabelEn: 'Dispersant',
    nameDe: 'Dispergiersystem', nameEn: 'Dispersant system',
    roleDe: 'Stabilisator', roleEn: 'Stabiliser', metric: '5,6×',
    sumDe: 'MoS₂ ist 5,6× dichter als Wachs und würde absinken. Ein amphiphiler Ester hält die Partikel gleichmäßig in der Schmelze verteilt — Block für Block.',
    sumEn: 'MoS₂ is 5.6× denser than wax and would sink. An amphiphilic ester keeps the particles evenly suspended in the melt — block after block.',
    whyDe: 'Dichte: MoS₂ 5,06 g/cm³ vs. Paraffin 0,9 g/cm³. Ohne Stabilisator sedimentieren die Partikel — der erste Block wäre arm, der letzte überladen. Der Dispersant umhüllt jedes Partikel und sorgt für gleichmäßige Qualität in jeder Kleinstcharge.',
    whyEn: 'Density: MoS₂ 5.06 g/cm³ vs. paraffin 0.9 g/cm³. Without a stabiliser the particles settle — the first block would be lean, the last overloaded. The dispersant coats each particle for consistent quality in every small batch.',
    physicsDe: [
      'MoS₂ hat eine Dichte von 5,06 g/cm³. Paraffinwachs hat eine Dichte von 0,9 g/cm³. Dichteunterschied: Faktor 5,6. Gibt man MoS₂ in geschmolzenes Wachs ohne Stabilisierung, sinken die Partikel messbar schnell. In den Minuten zwischen Rührstopp und Guss bedeutet das messbare Konzentrationsgradienten im fertigen Block.',
      'Das Dispergiermittel ist ein amphiphiler Fettsäureester: ein Molekül mit einer polaren Kopfgruppe, die über Wasserstoffbrücken an MoS₂-Partikelkanten adsorbiert, und einer langen unpolaren Fettsäurekette, die sich in die Paraffinschmelze erstreckt. Diese Hülle um jeden Partikel erzeugt eine sterische Barriere: annähernde Partikel müssen die Fettsäureketten komprimieren — dieser entropische Widerstand verhindert Agglomeration und Sedimentation.',
      'Entscheidend für die Wahl dieses spezifischen Esters: Sein Schmelzpunkt (58–60 °C) ist identisch mit der Basismatrix. Die Integration in die erstarrende Matrix verläuft thermodynamisch nahtlos — kein Auftrennen, keine Phasenseparation beim Abkühlen.',
    ],
    physicsEn: [
      'MoS₂ has a density of 5.06 g/cm³. Paraffin wax has a density of 0.9 g/cm³. Density ratio: 5.6×. Add MoS₂ to molten wax without stabilization and the particles sink measurably fast. In the minutes between stopping agitation and casting, this creates measurable concentration gradients in the finished block.',
      'The dispersant is an amphiphilic fatty acid ester: a molecule with a polar head group that adsorbs to MoS₂ particle edges via hydrogen bonds, and a long nonpolar fatty acid tail extending into the paraffin melt. This shell around each particle creates a steric barrier: approaching particles must compress the tails — this entropic resistance prevents agglomeration and sedimentation.',
      'Critical to the choice of this specific ester: its melting point (58–60 °C) is identical to the base matrix. Integration into the solidifying matrix is thermodynamically seamless — no phase separation on cooling.',
    ],
    insightDe: 'Ohne Dispergiermittel variiert die MoS₂-Konzentration durch den Block. Der erste Rewax-Vorgang wäre anders als der zwanzigste. Das ist nicht akzeptabel.',
    insightEn: 'Without dispersant, MoS₂ concentration varies through the block. The first rewax would perform differently from the twentieth. Unacceptable.',
    diagram: 'density', cx: 214, cy: 358, r: 28,
  },
  {
    node: 6, id: 'antioxidans',
    graphLabelDe: 'Antioxidans', graphLabelEn: 'Antioxidant',
    nameDe: 'Phenolisches Antioxidans', nameEn: 'Phenolic antioxidant',
    roleDe: 'Schutz', roleEn: 'Protection', metric: '12 Mo.',
    sumDe: 'Fängt Radikale ab und schützt das MoS₂ vor Umwandlung zu abrasivem MoO₃ — 12 Monate stabile Lagerung.',
    sumEn: 'Scavenges radicals and protects the MoS₂ from converting to abrasive MoO₃ — 12 months of stable shelf life.',
    whyDe: 'Sauerstoff oxidiert MoS₂ langsam zu MoO₃ — einem harten, abrasiven Produkt, das genau das Gegenteil von Schmierung bewirkt. Das gehinderte phenolische Antioxidans unterbricht die Radikalkette und hält die Formel über die gesamte Haltbarkeit wirksam.',
    whyEn: 'Oxygen slowly converts MoS₂ to MoO₃ — a hard, abrasive product that does the opposite of lubrication. The hindered phenolic antioxidant breaks the radical chain and keeps the formula effective across its full shelf life.',
    physicsDe: [
      'Die letzte Frage war Zeit. Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation: Sauerstoffradikale greifen C–H-Bindungen an und initiieren eine Kettenreaktion, die Peroxide, Alkohole und Ketone produziert. Diese Oxidationsprodukte verspröden die Matrix.',
      'Und sie können die MoS₂-Oberfläche von einem Schmierstoff (MoS₂) in ein Abrasivum verwandeln (MoO₃, gebildet durch Mo⁴⁺ → Mo⁶⁺ Oxidation). Ein gehindertes Phenol-Antioxidans wirkt als Radikalkettenabbrecher: Die phenolische OH-Gruppe doniert ein Wasserstoffatom an Peroxylradikale (ROO•) und bricht die Oxidationskaskade ab.',
      'Die Konzentration wurde leicht erhöht, als wir einen separaten Korrosionsinhibitor aus einer früheren Formulierungsversion entfernt haben. Dieser hatte eine sekundäre antioxidative Wirkung. Ohne ihn trägt das Phenol-Antioxidans die gesamte Last — eine leichte Erhöhung kompensiert dies vollständig.',
    ],
    physicsEn: [
      'The last question was time. A wax block that performs in week 1 but degrades by month 6 isn’t a product. Hydrocarbon waxes are susceptible to autoxidation: oxygen radicals attack C–H bonds, initiating a chain reaction producing peroxides, alcohols, and ketones. These oxidation products embrittle the matrix.',
      'And they can convert the MoS₂ surface from a lubricant (MoS₂) into an abrasive (MoO₃, formed by Mo⁴⁺ → Mo⁶⁺ oxidation). A hindered phenolic antioxidant acts as a radical chain-breaker: the phenolic OH group donates a hydrogen atom to peroxyl radicals (ROO•), breaking the oxidation cascade.',
      'Concentration was raised slightly when we removed a separate corrosion inhibitor from an earlier formula version. That inhibitor had a secondary antioxidant effect. Without it, the phenolic antioxidant carries the full stabilization load — a slight increase covers this completely.',
    ],
    insightDe: 'Das Antioxidans schützt nicht nur das Wachs, sondern auch den Festschmierstoff. Eine Komponente, die zwei Versagensmodi gleichzeitig verhindert.',
    insightEn: 'The antioxidant protects not just the wax, but also the solid lubricant. One component preventing two failure modes simultaneously.',
    diagram: 'radical', cx: 426, cy: 358, r: 28,
  },
];

// ─── Relationship graph — how the components interact ─────────────────────────
export interface ScienceEdge {
  from: number; to: number;
  labelDe: string; labelEn: string;
  dash: boolean; main: boolean;
}
export const EDGES: ScienceEdge[] = [
  { from: 2, to: 1, labelDe: 'Ko-Kristallisation', labelEn: 'co-crystallises',  dash: false, main: false },
  { from: 3, to: 1, labelDe: 'Plastifiziert',       labelEn: 'plasticises',      dash: false, main: false },
  { from: 1, to: 4, labelDe: 'Trägermatrix',         labelEn: 'carrier matrix',   dash: false, main: true  },
  { from: 3, to: 4, labelDe: 'Einbettung',           labelEn: 'embedding',        dash: false, main: false },
  { from: 5, to: 4, labelDe: 'Sterische Hülle',     labelEn: 'steric shell',     dash: true,  main: false },
  { from: 6, to: 4, labelDe: 'Oxidationsschutz',    labelEn: 'oxidation guard',  dash: true,  main: false },
];

// ─── Development-iteration story — why the combination evolved ────────────────
export interface ScienceFailure {
  vDe: string; vEn: string;
  failDe: string; failEn: string;
  fixDe: string; fixEn: string;
  isCurrent?: boolean;
}
export const FAILURES: ScienceFailure[] = [
  {
    vDe: 'Frühe Formel', vEn: 'Early formula',
    failDe: 'Wachsschicht platzte bei < 5 °C ab — Biegebelastung brach die spröde Matrix.',
    failEn: 'Wax coating spalled below 5 °C — flexing cracked the brittle matrix.',
    fixDe: 'Mikrokristallines Wachs als Plastifikator ergänzt.',
    fixEn: 'Added microcrystalline wax as a plasticizer.',
  },
  {
    vDe: 'Iteration 2', vEn: 'Iteration 2',
    failDe: 'Höhere FT-Wachs-Konzentration getestet — keine messbare Verbesserung beim Tropfpunkt.',
    failEn: 'Higher FT-wax concentration tested — no measurable drop-point improvement.',
    fixDe: 'Optimum liegt niedriger als intuitiv erwartet.',
    fixEn: 'Optimum is lower than intuitively expected.',
  },
  {
    vDe: 'Iteration 3', vEn: 'Iteration 3',
    failDe: 'MoS₂ ohne Dispergiermittel: messbarer Konzentrationsgradient von oben nach unten im Block.',
    failEn: 'MoS₂ without dispersant: measurable concentration gradient top-to-bottom in the block.',
    fixDe: 'Amphiphiler Fettsäureester stabilisiert die Partikel.',
    fixEn: 'Amphiphilic fatty acid ester stabilizes the particles.',
  },
  {
    vDe: 'Aktuelle Formel', vEn: 'Current formula',
    failDe: 'Separater Korrosionsinhibitor entfernt — seine antioxidative Nebenwirkung kompensiert.',
    failEn: 'Separate corrosion inhibitor removed — its secondary antioxidant effect compensated.',
    fixDe: 'Phenol-Antioxidans-Konzentration leicht erhöht.',
    fixEn: 'Phenolic antioxidant concentration raised slightly.',
    isCurrent: true,
  },
];

// ─── Classic-only components ──────────────────────────────────────────────────
// The 6 COMPONENTS above describe the Pro/MoS₂ system. The Classic formula
// (paraffin + PTFE + stearic-acid derivative) shares the paraffin base but
// replaces the solid-lubricant package with PTFE. These extra entries let the
// hero "look inside" dive show real ingredient cards for Classic too. They are
// NOT part of the relationship graph (no EDGES), so SciencePage/FormulaGraph are
// unaffected. Node ids 7–8 avoid collision with the graph nodes 1–6.
export const CLASSIC_EXTRA: ScienceComponent[] = [
  {
    node: 7, id: 'ptfe',
    graphLabelDe: 'PTFE', graphLabelEn: 'PTFE',
    nameDe: 'PTFE (Polytetrafluorethylen)', nameEn: 'PTFE (polytetrafluoroethylene)',
    roleDe: 'Gleitzusatz', roleEn: 'Glide additive', metric: '< 1 µm',
    sumDe: 'Submikrone PTFE-Partikel (< 1 µm) senken die Oberflächenreibung und halten den Film glatt — der Trockenschmierstoff der Classic-Formel.',
    sumEn: 'Sub-micron PTFE particles (< 1 µm) lower surface friction and keep the film slick — the dry lubricant of the Classic formula.',
    whyDe: 'PTFE hat einen der niedrigsten Reibungskoeffizienten aller Feststoffe. Fein in die Wachsmatrix eingebettet, gleiten die Kettengelenke leichter, ohne dass der Film klebrig wird oder Schmutz bindet.',
    whyEn: 'PTFE has one of the lowest friction coefficients of any solid. Finely embedded in the wax matrix, the chain joints glide more easily without the film turning tacky or attracting dirt.',
    physicsDe: [
      'PTFE besteht aus langen Fluorkohlenstoffketten, deren Fluorhülle nahezu keine zwischenmolekularen Bindungen eingeht — daher die extreme Gleitfähigkeit und die Antihaft-Wirkung.',
      'Als Partikel unter 1 µm verteilt sich PTFE gleichmäßig im erstarrenden Paraffin und legt sich an den Reibflächen als dünner, gleitfähiger Belag an. Das ergänzt die trockene Sauberkeit des Wachses um eine spürbar niedrigere Reibung im milden Temperaturbereich.',
    ],
    physicsEn: [
      'PTFE is built from long fluorocarbon chains whose fluorine shell forms almost no intermolecular bonds — hence the extreme slipperiness and non-stick behaviour.',
      'As sub-micron particles it disperses evenly through the solidifying paraffin and deposits a thin, glide-friendly layer at the friction surfaces. This adds a noticeably lower friction to the dry cleanliness of the wax across the mild temperature range.',
    ],
    insightDe: 'Classic setzt auf PTFE statt MoS₂: ideal für trockene Bedingungen von Frühjahr bis Herbst, ohne die Komplexität des Ganzjahres-Pakets.',
    insightEn: 'Classic uses PTFE instead of MoS₂: ideal for dry conditions from spring to autumn, without the complexity of the year-round package.',
    diagram: 'ptfe', cx: 320, cy: 260, r: 40,
  },
  {
    node: 8, id: 'haftung',
    graphLabelDe: 'Stearat', graphLabelEn: 'Stearate',
    nameDe: 'Stearinsäure-Derivat', nameEn: 'Stearic-acid derivative',
    roleDe: 'Haftvermittler', roleEn: 'Adhesion promoter', metric: 'Fe-Bindung',
    sumDe: 'Ein Fettsäurederivat verankert den Wachsfilm an der Stahloberfläche — bessere Haftung, gleichmäßigerer Film, weniger Abrieb beim Einfahren.',
    sumEn: 'A fatty-acid derivative anchors the wax film to the steel surface — better adhesion, a more even film, less shedding during break-in.',
    whyDe: 'Reines Paraffin haftet nur schwach auf Metall. Die polare Kopfgruppe des Stearinsäure-Derivats bindet an die Stahloberfläche, während der unpolare Schwanz in der Wachsmatrix verankert ist — eine molekulare Brücke zwischen Film und Kette.',
    whyEn: 'Pure paraffin adheres only weakly to metal. The polar head group of the stearic-acid derivative bonds to the steel surface while the non-polar tail anchors in the wax matrix — a molecular bridge between film and chain.',
    physicsDe: [
      'Die Carboxyl-Kopfgruppe (–COOH) adsorbiert über Wasserstoffbrücken und Chemisorption an der oxidischen Stahloberfläche; die lange Alkylkette ko-kristallisiert mit dem Paraffin.',
      'Das Ergebnis ist ein Film, der unter Scherbelastung an Ort und Stelle bleibt, statt sich abzulösen — entscheidend für die ersten Kilometer nach dem Wachsen.',
    ],
    physicsEn: [
      'The carboxyl head group (–COOH) adsorbs to the oxidic steel surface via hydrogen bonding and chemisorption; the long alkyl tail co-crystallises with the paraffin.',
      'The result is a film that stays in place under shear instead of shedding — decisive for the first kilometres after waxing.',
    ],
    insightDe: 'Der gleiche Haftmechanismus steckt auch in der Pro-Formel — bei Classic trägt er den PTFE-Film, bei Pro den MoS₂-Transferfilm.',
    insightEn: 'The same adhesion mechanism is in the Pro formula too — in Classic it carries the PTFE film, in Pro the MoS₂ transfer film.',
    diagram: 'stearin', cx: 214, cy: 358, r: 28,
  },
];

// ─── Hero "look inside" dive — honest per-variant composition ─────────────────
// Each variant lists only what is genuinely in it (matches data.ts `formula`).
//   Pro     — the full six-component MoS₂ system.
//   Classic — paraffin base + a little microcrystalline wax + PTFE + stearate.
//             No FT-wax, no antioxidant: Classic is the simpler, dry-weather mix.
// Order is "base → matrix additives → lubricant → surface", i.e. how the block
// is built up, so the dive's cross-section reads from foundation to function.
export function diveFormula(variant: 'classic' | 'pro'): ScienceComponent[] {
  const all = [...COMPONENTS, ...CLASSIC_EXTRA];
  const get = (id: string) => all.find(c => c.id === id)!;
  if (variant === 'pro') {
    return [
      get('kristallstruktur'), // Paraffin — Trägermatrix
      get('matrix'),           // FT-Wachs — Härtemodul
      get('winterformel'),     // Mikrokristallin — Plastifizierer
      get('mos2'),             // MoS₂ — Festschmierstoff
      get('sedimentation'),    // Dispersant — Stabilisator
      get('antioxidans'),      // Antioxidans — Schutz
    ];
  }
  return [
    get('kristallstruktur'),   // Paraffin — Trägermatrix
    get('winterformel'),       // Mikrokristallin — etwas Elastizität
    get('ptfe'),               // PTFE — Gleitzusatz
    get('haftung'),            // Stearin — Haftvermittler
  ];
}

// ─── Hero dive — relationship map (positions + labelled links) ────────────────
// The genuine relationships between components (mirrors EDGES), laid out as a
// readable network: paraffin is the matrix hub, the solid lubricant the second
// hub. Solid links = structural, dashed = protective/surface. Used by WaxDive to
// show WHICH ingredients relate and HOW (each link carries a relationship label).
export interface DiveNodePos { id: string; x: number; y: number; big?: boolean }
export interface DiveLink {
  a: string; b: string; labelDe: string; labelEn: string; main?: boolean; dash?: boolean;
}
export interface DiveGraph { nodes: DiveNodePos[]; links: DiveLink[] }

export const DIVE_GRAPH: Record<'classic' | 'pro', DiveGraph> = {
  pro: {
    nodes: [
      { id: 'kristallstruktur', x: 230, y: 86,  big: true }, // Paraffin (matrix hub)
      { id: 'matrix',           x: 100, y: 150 },             // FT-Wachs
      { id: 'winterformel',     x: 360, y: 150 },             // Mikrokristallin
      { id: 'mos2',             x: 230, y: 250, big: true },  // MoS₂ (lubricant hub)
      { id: 'sedimentation',    x: 104, y: 352 },             // Dispersant
      { id: 'antioxidans',      x: 356, y: 352 },             // Antioxidans
    ],
    links: [
      { a: 'kristallstruktur', b: 'mos2',            labelDe: 'Trägermatrix',      labelEn: 'carrier matrix',  main: true },
      { a: 'matrix',           b: 'kristallstruktur', labelDe: 'Ko-Kristallisation', labelEn: 'co-crystallises' },
      { a: 'winterformel',     b: 'kristallstruktur', labelDe: 'Plastifiziert',    labelEn: 'plasticises' },
      { a: 'winterformel',     b: 'mos2',            labelDe: 'Einbettung',        labelEn: 'embedding' },
      { a: 'sedimentation',    b: 'mos2',            labelDe: 'Sterische Hülle',   labelEn: 'steric shell',    dash: true },
      { a: 'antioxidans',      b: 'mos2',            labelDe: 'Oxidationsschutz',  labelEn: 'oxidation guard', dash: true },
    ],
  },
  classic: {
    nodes: [
      { id: 'kristallstruktur', x: 230, y: 96,  big: true }, // Paraffin (matrix hub)
      { id: 'winterformel',     x: 100, y: 200 },            // Mikrokristallin
      { id: 'haftung',          x: 360, y: 200 },            // Stearin
      { id: 'ptfe',             x: 230, y: 300, big: true }, // PTFE (lubricant hub)
    ],
    links: [
      { a: 'kristallstruktur', b: 'ptfe',            labelDe: 'Trägermatrix',     labelEn: 'carrier matrix', main: true },
      { a: 'winterformel',     b: 'kristallstruktur', labelDe: 'Plastifiziert',   labelEn: 'plasticises' },
      { a: 'winterformel',     b: 'ptfe',            labelDe: 'Einbettung',       labelEn: 'embedding' },
      { a: 'haftung',          b: 'kristallstruktur', labelDe: 'Haftvermittlung', labelEn: 'adhesion',       dash: true },
      { a: 'haftung',          b: 'ptfe',            labelDe: 'Filmhaftung',      labelEn: 'film bond',      dash: true },
    ],
  },
};
