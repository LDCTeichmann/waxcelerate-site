// ─── Science-page editorial content ──────────────────────────────────────────
// Recovered depth: the "why" behind each component, the relationship graph, and
// the development-iteration story. Bilingual (de/en). Consumed by SciencePage,
// WaxField, WaxFormulaPanel and — untyped, so mind the shape — the prerender
// scripts generate-blog-html.mjs and generate-llms-txt.mjs.
// (Editorial science copy — distinct from product SKU data.)

export type DiagramKey =
  | 'lamellar' | 'droplift' | 'coldflex' | 'shear' | 'density' | 'radical'
  | 'ptfe' | 'stearin';

export interface ScienceComponent {
  node: number;          // stabile Id (1–6). Referenziert von EDGES und
                         // FORMULA_STORY, und generate-llms-txt.mjs sortiert danach.
  id: string;            // anchor / deep-link target
  // Kurzname. Hiess so, weil er in einen Knoten des Kanten-Graphen passen
  // musste; der ist weg, und der Name steht jetzt in einem Satz ("Greift
  // ineinander mit …", siehe meshFor in SciencePage.tsx). Deshalb ist
  // 'Mikrokris.' zu 'Mikrokristallin' geworden: der Platzmangel, der die
  // Abkuerzung erzwungen hat, existiert nicht mehr.
  graphLabelDe: string; graphLabelEn: string;
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
}

export const COMPONENTS: ScienceComponent[] = [
  {
    node: 1, id: 'kristallstruktur',
    graphLabelDe: 'Paraffin', graphLabelEn: 'Paraffin',
    nameDe: 'Paraffin', nameEn: 'Paraffin',
    roleDe: 'Trägermatrix', roleEn: 'Base scaffold', metric: '58–60 °C',
    sumDe: 'Vollraffiniertes Paraffin bildet den Grundfilm — lineare Alkanketten (C₂₀–C₃₆) packen sich orthorhombisch zu rund 4 bis 5 nm dünnen Lamellen, die mehr Metall bedecken und weniger Wasser durchlassen als Standardwachse.',
    sumEn: 'Fully refined paraffin forms the base film — linear alkane chains (C₂₀–C₃₆) pack orthorhombically into lamellae of roughly 4 to 5 nm that cover more metal and let less water through than standard waxes.',
    whyDe: 'Grobkristallines Standard-Wachs lässt messbare Lücken, durch die Wasser die Stahloberfläche erreicht. Ein eng schmelzendes Paraffin (58–60 °C) kristallisiert feiner und dichter — der Film schließt besser ab und schützt vor Oxidation.',
    whyEn: 'Coarse standard wax leaves measurable gaps where water reaches the steel. A tight-melting paraffin (58–60 °C) crystallises finer and denser — the film seals better and protects against oxidation.',
    physicsDe: [
      'Die erste Frage war täuschend einfach: Welches Paraffin? Paraffin ist keine Substanz, sondern eine Kategorie — sie reicht von weichen, öligen Kerzenwachsen bis zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich.',
      'Wir haben uns für ein vollraffiniertes Erdöldestillat mit einem exakt definierten 2 °C-Erstarrungsfenster (58–60 °C) entschieden. Diese Enge ist keine Präzision um ihrer selbst willen — sie sichert die Reproduzierbarkeit. Ein breiterer Erstarrungsbereich produziert je nach Batch leicht unterschiedliche Kristallstrukturen.',
      'Beim Abkühlen aus der Schmelze nucleieren die linearen Kohlenwasserstoffketten (C₂₀–C₃₆) und bilden lamellare Kristalldomänen in orthorhombischer Anordnung (a = 7,42 Å, b = 4,96 Å) — ein dreidimensionales Gitterwerk aus Schichten von rund 4 bis 5 nm. Mehr kann eine einzelne Lamelle nicht sein, denn eine gestreckte C₃₆-Kette misst etwa 4,6 nm; die oft genannten 9 nm sind die Periode eines Doppelstapels. Diese Kristallstruktur bestimmt alles: die Haftung auf dem Metall, die Dichte des Films und die mechanische Belastbarkeit.',
      'Die lamellaren Oberflächen müssen kristallographisch glatt genug sein, um die nächste Lamelle zu nukleieren. Jede Abweichung in der Kettenlänge wird durch longitudinale Molekülverschiebungen innerhalb der Lamellen kompensiert. In den amorphen Zwischenbereichen dieses Gitters werden alle anderen Komponenten eingeschlossen — die Basismatrix ist das Skelett. Alles andere ist eingebettet.',
    ],
    physicsEn: [
      'The first question was deceptively simple: which paraffin? Paraffin isn\'t a material, it\'s a category — spanning soft, oily candle waxes to brittle technical grades. The decisive variable is the solidification range.',
      'We chose a fully refined petroleum distillate with a precisely defined 2 °C solidification window (58–60 °C). This narrow range isn\'t precision for its own sake — it ensures reproducibility. A wider solidification range produces subtly different crystal structures batch-to-batch.',
      'On cooling from the melt, the linear hydrocarbon chains (C₂₀–C₃₆) nucleate and form lamellar crystal domains in orthorhombic arrangement (a = 7.42 Å, b = 4.96 Å) — an interlocking three-dimensional lattice of layers roughly 4 to 5 nm thick. A single lamella cannot be thicker than that: an extended C₃₆ chain measures about 4.6 nm, and the 9 nm often quoted is the period of a double stack. This crystal structure determines everything: adhesion to the metal, film density, and mechanical load capacity.',
      'The lamellar surfaces must stay crystallographically flat enough to nucleate the next lamella. Chain-length variations are compensated by longitudinal molecular shifts within each lamella. All other components are trapped in the amorphous spaces between crystals — the base matrix is the skeleton. Everything else is embedded within it.',
    ],
    insightDe: 'Das enge Erstarrungsfenster ist der Schlüssel zur Batch-Konsistenz — und damit zur gleichmäßigen Performance jedes Blocks.',
    insightEn: 'The narrow solidification window is the key to batch consistency — every block performing identically.',
    diagram: 'lamellar',
  },
  {
    node: 2, id: 'matrix',
    graphLabelDe: 'FT-Wachs', graphLabelEn: 'FT-Wax',
    nameDe: 'Fischer-Tropsch-Wachs', nameEn: 'Fischer–Tropsch wax',
    roleDe: 'Härtemodul', roleEn: 'Hardener', metric: '+75 °C',
    sumDe: 'Synthetisches Hartwachs (>90 % Kristallinität) hebt den Tropfpunkt auf ~75 °C — die Matrix hält Position unter Last statt wegzuwandern und stabilisiert die MoS₂-Einbettung thermisch.',
    sumEn: 'Synthetic hard wax (>90% crystallinity) raises the drop point to ~75 °C — the matrix holds position under load instead of migrating and thermally stabilises the MoS₂ embedding.',
    whyDe: 'Paraffin wird nicht erst bei 58–60 °C weich, sondern spürbar schon einige Grad darunter. In praller Sommersonne oder im heißen Auto rückt eine Kette in diesen Bereich, weiches Wachs kriecht dann aus dem Gelenk und dünnt aus. Das härtere FT-Wachs hebt den Tropfpunkt auf ~75 °C: der Film behält seine Form, und die MoS₂-Partikel bleiben eingebettet, statt aus einer erweichten Matrix zu wandern.',
    whyEn: 'Paraffin does not wait for 58–60 °C to soften, it gets noticeably softer several degrees below. In full summer sun or a hot car a chain moves into that range, and soft wax creeps out of the joint and thins. The harder FT wax lifts the drop point to ~75 °C: the film keeps its shape, and the MoS₂ particles stay embedded instead of migrating out of a softened matrix.',
    physicsDe: [
      'Das zweite Problem war der Sommer. Paraffin wird nicht erst am Schmelzpunkt weich, sondern schon einige Grad darunter. In der Sonne, im heißen Auto oder auf einer langen Sommerausfahrt rückt die Kette in diesen Bereich. Reines Paraffin würde dann erweichen, wandern und auf dem Schaltwerk landen statt im Gelenk.',
      'Die Lösung war ein synthetisches Wachs, hergestellt über den Fischer-Tropsch-Prozess: eine Kohlenstoff-Syntheseroute, die Kohlenwasserstoffketten von außergewöhnlicher Reinheit liefert. Kein Schwefel, keine Aromaten, keine Verzweigungen — nur vollständig lineare Moleküle. Diese Reinheit resultiert in einer Kristallinität von über 90 % — deutlich höher als bei Erdölparaffin (65–80 %).',
      'In gezielt gewählter Konzentration ko-kristallisiert dieses Additiv mit der Basismatrix und bildet dichtere, defektärmere Kristalldomänen, die deutlich mehr Energie zum Schmelzen benötigen. Der effektive Tropfpunkt der Gesamtmatrix steigt auf ~72–78 °C. Das sichert nicht nur die Wachsschicht, sondern auch die MoS₂-Partikel in der Matrix — sie werden bei Wärme nicht aus erweichtem Wachs verdrängt.',
    ],
    physicsEn: [
      'The second problem was summer. Paraffin does not soften only at its melting point but several degrees below it. In the sun, in a hot car or on a long summer ride the chain moves into that range. Plain paraffin would then soften, migrate and end up on the derailleur instead of in the joint.',
      'The solution was a synthetic wax produced via the Fischer-Tropsch process: a carbon synthesis route that yields hydrocarbon chains of exceptional purity. No sulfur, no aromatics, no branching — only perfectly linear molecules. This purity results in crystallinity above 90% — significantly higher than petroleum paraffin (65–80%).',
      'At a carefully chosen concentration, this additive co-crystallises with the base matrix and forms denser, more defect-free crystal domains requiring significantly more energy to melt. The effective drop point of the matrix rises to ~72–78 °C. This secures not just the wax layer, but also the MoS₂ particles within the matrix — they aren\'t displaced from softened wax under heat.',
    ],
    insightDe: 'Tests mit höherer Konzentration zeigten keine messbare Verbesserung. Das Optimum liegt unter dem, was man intuitiv erwarten würde.',
    insightEn: 'Tests at higher concentrations showed no measurable improvement. The optimum is lower than you\'d intuitively expect.',
    diagram: 'droplift',
  },
  {
    node: 3, id: 'winterformel',
    graphLabelDe: 'Mikrokristallin', graphLabelEn: 'Microcrystalline',
    nameDe: 'Mikrokristallines Wachs', nameEn: 'Microcrystalline wax',
    roleDe: 'Plastifizierer', roleEn: 'Plastifier', metric: '−8 °C',
    sumDe: 'Verzweigte und zyklische Naphthene füllen die amorphen Zonen zwischen den Paraffinlamellen — die Matrix bleibt bei Frost elastisch bis −8 °C, kein Verspröden, kein Abplatzen.',
    sumEn: 'Branched and cyclic naphthenes fill the amorphous zones between paraffin lamellae — the matrix stays elastic in frost down to −8 °C, no embrittlement, no flaking.',
    whyDe: 'Standard-Wachse werden unter ~5 °C spröde und brechen bei Biegung auf. Die amorphe, mikrokristalline Komponente bleibt elastisch und verhindert, dass der Film an den Kettengelenken abplatzt — entscheidend für Winter- und E-Bike-Betrieb.',
    whyEn: 'Standard waxes turn brittle below ~5 °C and fracture under flex. The amorphous microcrystalline component stays elastic and stops the film flaking off the chain joints — decisive for winter and e-bike use.',
    physicsDe: [
      'Das entgegengesetzte Problem folgte sofort: Winter. Eine reine Paraffinmatrix mit Fischer-Tropsch-Härtemodul ist unterhalb von 5 °C extrem spröde — spröde genug, um bei Biegebelastung zu brechen. Ein Kettengelenk, das sich in der Kälte bewegt, ließ die Wachsschicht buchstäblich abplatzen.',
      'Mikrokristallines Wachs löst dieses Problem strukturell. Im Gegensatz zu den geradkettigen Paraffinen besteht es aus hochverzweigten und zyklischen Kohlenwasserstoffen (Naphthene, Isoparaffine). Diese Verzweigungen verhindern eine effiziente Molekülpackung — es entstehen keine geordneten Kristallstrukturen sondern feinere, dichtere Mikrokristalle. Die Moleküle besetzen die amorphen Bereiche zwischen den Paraffinlamellen und wirken dort als molekulare Plastifizierer.',
      'Diese Komponente erfüllt drei Funktionen gleichzeitig: (1) Die Matrix bleibt bis −8 °C elastisch verformbar statt zu brechen — die verzweigten Moleküle absorbieren mechanische Energie. (2) Die größere Kontaktfläche der verzweigten Moleküle erzeugt stärkere van-der-Waals-Wechselwirkungen mit der Stahloberfläche — bessere Haftung unter Scherkraft. (3) Die amorphen Bereiche betten die MoS₂-Partikel mechanisch in die Matrix ein und verhindern, dass sie unter Biegung freigesetzt werden.',
    ],
    physicsEn: [
      'The opposite problem arrived immediately: winter. A pure paraffin matrix with a Fischer-Tropsch hardener is extremely brittle below 5 °C — brittle enough to crack under bending stress. A chain link flexing in cold weather caused the wax coating to literally spall off.',
      'Microcrystalline wax solves this structurally. Unlike the straight-chain paraffins, it consists of highly branched and cyclic hydrocarbons (naphthenes, isoparaffins). This branching prevents efficient molecular packing — instead of ordered crystals, finer and denser microcrystals form. The molecules occupy the amorphous zones between paraffin lamellae and act as molecular plasticisers there.',
      'This component serves three functions simultaneously: (1) The matrix remains elastically deformable down to −8 °C — branched molecules absorb mechanical energy. (2) The larger contact area of branched molecules creates stronger van-der-Waals interactions with the steel surface — better adhesion under shear. (3) The amorphous regions mechanically embed the MoS₂ particles and prevent them from being released under flex.',
    ],
    insightDe: 'Ursprünglich höher konzentriert. Die Reduzierung war möglich, weil gleichzeitig der MoS₂-Anteil überarbeitet wurde.',
    insightEn: 'Originally at higher concentration. The reduction was possible because MoS₂ loading was revised simultaneously.',
    diagram: 'coldflex',
  },
  {
    // 2026-09-16: das "in trockener Luft" bzw. "trocken" an der mu-Zahl ist
    // keine Floskel. MoS2 erreicht 0,03 unter Grenzschmierung in trockener
    // Luft; in feuchter Luft lagert sich Wasser an die Kanten der Basalebenen
    // an und der Wert steigt deutlich. Seit dem Umbau von FrictionWatts ist
    // das die einzige mu-Zahl, die die Seite noch fuehrt, und sie geht ueber
    // COMPONENTS auch in llms-full.txt und den vorgerenderten Rumpf — die
    // Bedingung muss also hier stehen, nicht nur im Fliesstext daneben.
    // 2026-09-26: als `metric` (Kennzahl neben dem Namen) ist die mu-Zahl
    // raus. Dort stand sie ohne Satz daneben, und eine Kette faehrt immer in
    // feuchter Luft (0,1–0,2). Kennzahl ist jetzt die Partikelgroesse.
    node: 4, id: 'mos2',
    graphLabelDe: 'MoS₂', graphLabelEn: 'MoS₂',
    nameDe: 'Molybdändisulfid (MoS₂)', nameEn: 'Molybdenum disulfide (MoS₂)',
    roleDe: 'Festschmierstoff', roleEn: 'Solid lubricant', metric: '< 5 µm',
    sumDe: 'Hexagonale MoS₂-Kristallite (P6₃/mmc, < 5 µm) scheren unter Kontaktdruck entlang der van-der-Waals-Ebenen und bilden einen Fe–S-Transferfilm auf dem Stahl — Grenzreibung bis μ 0,03 in trockener Luft, in feuchter Luft liegt der Wert höher.',
    sumEn: 'Hexagonal MoS₂ crystallites (P6₃/mmc, < 5 µm) shear along the van der Waals planes under contact pressure and form an Fe–S transfer film on the steel — boundary friction down to μ 0.03 in dry air, higher in humid air.',
    whyDe: 'MoS₂ besteht aus S–Mo–S-Schichten, deren Interlayer-Bindungsenergie nur ~0,55 J/m² beträgt. Unter Druck (50–300 MPa) scheren die Schichten ab und lagern sich als 2–5 nm dünner Transferfilm auf der Metalloberfläche ab, verankert durch tribochemische Fe–S-Bindungen. Das senkt die Grenzreibung weit unter die von Öl.',
    whyEn: 'MoS₂ is built from S–Mo–S layers with an interlayer binding energy of only ~0.55 J/m². Under pressure (50–300 MPa) the layers shear and deposit as a 2–5 nm transfer film on the metal surface, anchored by tribochemical Fe–S bonds. This drops boundary friction well below oil.',
    physicsDe: [
      'MoS₂ ist eines der wenigen Materialien mit einem Reibungskoeffizienten unter 0,05 unter Grenzschmierbedingungen. Der Grund liegt in der Kristallstruktur (hexagonal, P6₃/mmc): Mo-Atome sandwichartig zwischen zwei Schwefelschichten, die Schichten untereinander nur durch schwache van-der-Waals-Kräfte gebunden (Bindungsenergie ~0,55 J/m²). Unter Kontaktdruck richten sich die Basalebenen parallel zur Gleitrichtung aus — die Schichten gleiten lateral fast widerstandslos.',
      'An Kettenkontaktflächen unter Last entstehen Drücke von 50–300 MPa. Das ist das Regime der Grenzschmierung — konventionelle Öle können keinen kontinuierlichen Film aufrechterhalten. MoS₂ bildet stattdessen einen Transferfilm: Partikel werden unter Druck auf der Stahloberfläche kompaktiert und durch tribochemische Reaktionen verankert. Mo–S-Bindungen reagieren mit der Eisen-/Eisenoxid-Oberfläche und bilden Fe–S-Verbindungen (FeS, FeS₂) — eine chemische Verankerung, die rein mechanischer Haftung weit überlegen ist.',
      'Der resultierende Transferfilm (2–5 nm) besteht aus geordneten, zweidimensionalen MoS₂-Nanoblättern, durchsetzt mit Fe–S-, Fe₃O₄- und FeOOH-Komponenten. Mit fortschreitender tribochemischer Reaktion werden die Gleitflächen konform und glatt — der Kontaktdruck sinkt, weiterer Verschleiß wird stark reduziert. Dieser Film persistiert, auch nachdem der Wachsträger längst abgetragen ist.',
      'Die Partikelgröße ist nicht zufällig: Unter 5 µm passen die Partikel in die Kettenlagerungsspalte (typisch 5–15 µm). Eine einzige Ladung Wachs enthält Millionen von Partikeln — ausreichend für mehrfache Transferfilm-Regeneration über hunderte Kilometer.',
    ],
    physicsEn: [
      'MoS₂ is one of the few materials with a friction coefficient below 0.05 under boundary lubrication conditions. The crystal structure is the reason (hexagonal, P6₃/mmc): Mo atoms sandwiched between two sulfur layers, with the layers bonded only by weak van-der-Waals forces (binding energy ~0.55 J/m²). Under contact pressure, the basal planes reorient parallel to the sliding direction — the layers slide laterally with almost no resistance.',
      'At chain contact surfaces under load, pressures reach 50–300 MPa. This is the boundary lubrication regime — conventional oils cannot maintain a continuous film here. MoS₂ instead forms a transfer film: particles compacted on the steel surface under pressure and anchored by tribochemical reactions. Mo–S bonds react with the iron/iron-oxide surface to form Fe–S compounds (FeS, FeS₂) — a chemical anchor far superior to purely mechanical adhesion.',
      'The resulting transfer film (2–5 nm) consists of ordered, two-dimensional MoS₂ nanosheets interspersed with Fe–S, Fe₃O₄, and FeOOH components. As the tribochemical reaction progresses, the sliding surfaces become conformal and smooth — contact pressure drops, further wear is strongly reduced. This film persists long after the wax carrier is worn away.',
      'Particle size is deliberate: below 5 µm, particles fit within chain clearances (typically 5–15 µm). A single charge of wax contains millions of particles — sufficient for multiple transfer film regeneration cycles over hundreds of kilometres.',
    ],
    insightDe: 'Der Transferfilm ist der eigentliche Schmierstoff — das Wachs ist nur das Trägervehikel. Die tribochemischen Fe–S-Bindungen verankern die MoS₂-Nanoblätter dauerhaft auf dem Stahl — sie schmieren noch, wenn der Block längst aufgebraucht ist.',
    insightEn: 'The transfer film is the actual lubricant — the wax is just the delivery vehicle. Tribochemical Fe–S bonds permanently anchor the MoS₂ nanosheets on the steel — they continue lubricating long after the block is spent.',
    diagram: 'shear',
  },
  {
    node: 5, id: 'sedimentation',
    graphLabelDe: 'Dispersant', graphLabelEn: 'Dispersant',
    nameDe: 'Dispergiersystem', nameEn: 'Dispersant system',
    roleDe: 'Stabilisator', roleEn: 'Stabiliser', metric: '5,6×',
    sumDe: 'MoS₂ ist 5,6× dichter als Wachs — nach Stokes sedimentieren 5 µm Partikel rund 1 mm/min in der Schmelze. Amphiphile Ester adsorbieren an den Partikelkanten und erzeugen eine sterische Barriere, die homogene Verteilung sichert.',
    sumEn: 'MoS₂ is 5.6× denser than wax — by Stokes\' law, 5 µm particles sediment about 1 mm/min in the melt. Amphiphilic esters adsorb at particle edges and create a steric barrier that ensures homogeneous distribution.',
    whyDe: 'Dichte: MoS₂ 5,06 g/cm³ vs. Paraffin 0,9 g/cm³. Nach Stokes sinken 5 µm Partikel mit rund 1 mm/min in der 65 °C-Schmelze. Ohne Stabilisator wäre der erste Block aus einer Charge arm, der letzte überladen. Der Dispersant umhüllt jedes Partikel mit einer sterischen Hülle aus Fettsäureketten.',
    whyEn: 'Density: MoS₂ 5.06 g/cm³ vs. paraffin 0.9 g/cm³. By Stokes\' law, 5 µm particles sink at about 1 mm/min in the 65 °C melt. Without a stabiliser, the first block from a batch would be lean, the last overloaded. The dispersant coats each particle in a steric shell of fatty acid chains.',
    physicsDe: [
      'MoS₂ hat eine Dichte von 5,06 g/cm³. Paraffinwachs hat eine Dichte von 0,9 g/cm³. Dichteunterschied: Faktor 5,6. Das Stokes\'sche Gesetz quantifiziert das Problem: ein 5 µm Partikel in der Wachsschmelze bei 65 °C (η ≈ 3,5 mPa·s) sedimentiert mit rund 1 mm/min. In den 10–15 Minuten zwischen Rührstopp und vollständiger Erstarrung eines Blocks bedeutet das mehrere Millimeter Absinkweg — ein klarer Konzentrationsgradient im fertigen Produkt.',
      'Das Dispergiermittel ist ein amphiphiler Fettsäureester: ein Molekül mit einer polaren Kopfgruppe (Ester/Hydroxyl), die über Wasserstoffbrücken an MoS₂-Partikelkanten adsorbiert, und einer langen unpolaren Fettsäurekette (C₁₆–C₁₈), die sich in die Paraffinschmelze erstreckt. Diese Hülle um jeden Partikel erzeugt eine sterische Barriere: annähernde Partikel müssen die Fettsäureketten komprimieren — die resultierende Entropieabnahme erzeugt eine abstoßende Kraft, die sowohl Agglomeration als auch gravitationsbedingte Sedimentation verhindert.',
      'Entscheidend für die Wahl dieses spezifischen Esters: Sein Schmelzpunkt (58–60 °C) ist identisch mit der Basismatrix. Beim Abkühlen ko-kristallisiert der Ester in die Paraffinlamellen — die Integration verläuft thermodynamisch nahtlos, ohne Phasenseparation. Der Dispersant wird Teil der Matrix statt als separate Phase vorzuliegen.',
    ],
    physicsEn: [
      'MoS₂ has a density of 5.06 g/cm³. Paraffin wax has a density of 0.9 g/cm³. Density ratio: 5.6×. Stokes\' law quantifies the problem: a 5 µm particle in the wax melt at 65 °C (η ≈ 3.5 mPa·s) sediments at about 1 mm/min. In the 10–15 minutes between stopping agitation and complete solidification of a block, that means several millimetres of settling — a clear concentration gradient in the finished product.',
      'The dispersant is an amphiphilic fatty acid ester: a molecule with a polar head group (ester/hydroxyl) that adsorbs to MoS₂ particle edges via hydrogen bonds, and a long nonpolar fatty acid tail (C₁₆–C₁₈) extending into the paraffin melt. This shell around each particle creates a steric barrier: approaching particles must compress the tails — the resulting entropy decrease generates a repulsive force preventing both agglomeration and gravity-driven sedimentation.',
      'Critical to the choice of this specific ester: its melting point (58–60 °C) is identical to the base matrix. On cooling, the ester co-crystallises into the paraffin lamellae — integration is thermodynamically seamless, with no phase separation. The dispersant becomes part of the matrix rather than persisting as a separate phase.',
    ],
    insightDe: 'Ohne Dispergiermittel variiert die MoS₂-Konzentration durch den Block. Der erste Rewax-Vorgang wäre anders als der zwanzigste. Das ist nicht akzeptabel.',
    insightEn: 'Without dispersant, MoS₂ concentration varies through the block. The first rewax would perform differently from the twentieth. Unacceptable.',
    diagram: 'density',
  },
  {
    node: 6, id: 'antioxidans',
    graphLabelDe: 'Antioxidans', graphLabelEn: 'Antioxidant',
    nameDe: 'Phenolisches Antioxidans', nameEn: 'Phenolic antioxidant',
    roleDe: 'Schutz', roleEn: 'Protection', metric: '12 Mo.',
    sumDe: 'Doniert H-Atome an Peroxylradikale und bricht die Oxidationskaskade, bevor sie die Wachsmatrix versprödet. Das hält den Block 12 Monate stabil.',
    sumEn: 'Donates H atoms to peroxyl radicals and breaks the oxidation cascade before it embrittles the wax matrix. That keeps the block stable for 12 months.',
    whyDe: 'Sauerstoff greift Kohlenwasserstoffwachse langsam an: Radikale ziehen H-Atome aus den Ketten, es entstehen Peroxide, die Matrix versprödet und haftet schlechter am Stahl. Wärme und Licht beschleunigen das. Das gehinderte phenolische Antioxidans unterbricht diese Kettenreaktion an der Wurzel.',
    whyEn: 'Oxygen slowly attacks hydrocarbon waxes: radicals pull H atoms from the chains, peroxides form, the matrix embrittles and adheres worse to steel. Heat and light speed this up. The hindered phenolic antioxidant interrupts this chain reaction at the root.',
    physicsDe: [
      'Die letzte Frage war Zeit. Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation: Sauerstoffradikale greifen C–H-Bindungen an und initiieren eine Kettenreaktion, die Peroxide, Alkohole und Ketone produziert. Diese Oxidationsprodukte verspröden die Matrix und verschlechtern ihre Haftung auf Metall.',
      'Ein gehindertes Phenol-Antioxidans wirkt als Radikalkettenabbrecher: Die phenolische OH-Gruppe doniert ein Wasserstoffatom an Peroxylradikale (ROO•) und überführt sie in stabile Hydroperoxide (ROOH). Das resultierende Phenoxyradikal ist durch Elektronendelokalisierung und die sperrigen tert-Butylgruppen (sterische Hinderung) stabilisiert — es kann keine neue Kettenreaktion starten.',
      'Die Konzentration wurde leicht erhöht, als ein separater Korrosionsinhibitor aus einer früheren Formulierungsversion entfernt wurde.',
    ],
    physicsEn: [
      'The last question was time. A wax block that performs in week 1 but degrades by month 6 isn\'t a product. Hydrocarbon waxes are susceptible to autoxidation: oxygen radicals attack C–H bonds, initiating a chain reaction producing peroxides, alcohols, and ketones. These oxidation products embrittle the matrix and degrade its adhesion to metal.',
      'A hindered phenolic antioxidant acts as a radical chain-breaker: the phenolic OH group donates a hydrogen atom to peroxyl radicals (ROO•), converting them to stable hydroperoxides (ROOH). The resulting phenoxy radical is stabilised by electron delocalisation and the bulky tert-butyl groups (steric hindrance) — it cannot start a new chain reaction.',
      'Concentration was raised slightly when a separate corrosion inhibitor was removed from an earlier formula version.',
    ],
    insightDe: 'Das Antioxidans wird verbraucht, damit das Wachs es nicht wird: jedes abgefangene Radikal ist eine Wachskette, die ganz bleibt.',
    insightEn: 'The antioxidant gets used up so the wax does not: every radical it traps is a wax chain that stays intact.',
    diagram: 'radical',
  },
];

// ─── Relationship graph — how the components interact ─────────────────────────
export interface ScienceEdge {
  from: number; to: number;
  labelDe: string; labelEn: string;
  dash: boolean; main: boolean;
  // A 'balance' edge isn't a dependency (nothing flows one way into the
  // other) — it's the formula's central trade-off, drawn differently
  // (double-ended, its own colour) so it doesn't read as just another
  // build relationship. See FT-Wachs <-> Mikrokristallin below: one raises
  // the drop point, the other keeps the matrix flexible, and the whole
  // reason the formula needs both at once is that neither can do the
  // other's job.
  balance?: boolean;
}
export const EDGES: ScienceEdge[] = [
  { from: 2, to: 1, labelDe: 'Ko-Kristallisation', labelEn: 'co-crystallises',  dash: false, main: false },
  { from: 3, to: 1, labelDe: 'Plastifiziert',       labelEn: 'plasticises',      dash: false, main: false },
  { from: 1, to: 4, labelDe: 'Trägermatrix',         labelEn: 'carrier matrix',   dash: false, main: true  },
  { from: 3, to: 4, labelDe: 'Einbettung',           labelEn: 'embedding',        dash: false, main: false },
  { from: 5, to: 4, labelDe: 'Sterische Hülle',     labelEn: 'steric shell',     dash: true,  main: false },
  { from: 2, to: 4, labelDe: 'Thermostabilität',    labelEn: 'thermal stability', dash: false, main: false },
  { from: 6, to: 1, labelDe: 'Matrixschutz',        labelEn: 'matrix guard',     dash: true,  main: false },
  // 2026-09 addition — both stated in the existing physics copy, both
  // previously invisible in the graph itself:
  { from: 5, to: 1, labelDe: 'Ko-Kristallisation', labelEn: 'co-crystallises',  dash: false, main: false },
  // Dispersant's ester shares Paraffin's melting point and co-crystallises
  // into its lamellae (science.ts, sedimentation.physicsDe[2]) — the same
  // mechanism as edge 0, different pair.
  { from: 2, to: 3, labelDe: 'Gegenspieler', labelEn: 'counterpart', dash: true, main: false, balance: true },
  // FT-Wachs hardens (drop point +75 degC) exactly what Mikrokristallin
  // keeps flexible (-8 degC) — the formula's one real trade-off, and the
  // reason it needs six components instead of one "good enough" wax.
];

// ─── Story-led build — the narrated assembly of the Pro recipe ────────────────
// Each step focuses one component and draws the relationship(s) that connect it to
// what's already on the stage.
//
// 2026-09-16: das Feld `edges` (Indizes in EDGES) ist weg. Es sagte dem
// Kantengraphen, welche Linie er in welchem Schritt zeichnen soll. Den Graphen
// gibt es nicht mehr, und die Beziehungen selbst stehen jetzt als Text unter
// der geoeffneten Komponente, gefiltert direkt aus EDGES (siehe meshFor in
// SciencePage.tsx). EDGES ist deshalb unveraendert geblieben: der Inhalt war
// nie das Problem, die Darstellung war es.
export interface FormulaStep {
  node: number;        // component introduced / focused this step (node id)
  captionDe: string; captionEn: string;
}
export const FORMULA_STORY: FormulaStep[] = [
  {
    node: 1,
    captionDe: 'Alles beginnt mit der Trägermatrix: vollraffiniertes Paraffin (C₂₀–C₃₆) erstarrt bei 58–60 °C zu einem orthorhombischen Kristallgitter aus rund 4 bis 5 nm dünnen Lamellen — und schließt jedes weitere Molekül in dieses Skelett ein.',
    captionEn: 'It all starts with the carrier matrix: fully refined paraffin (C₂₀–C₃₆) solidifies at 58–60 °C into an orthorhombic crystal lattice of lamellae roughly 4 to 5 nm thick — locking every other molecule into this scaffold.',
  },
  {
    node: 4,
    captionDe: 'In die Matrix eingebettet sitzt das Herz der Formel — MoS₂ mit hexagonaler P6₃/mmc-Kristallstruktur. Unter 50–300 MPa Kontaktdruck scheren die S–Mo–S-Schichten und bilden einen 2–5 nm dünnen Fe–S-Transferfilm auf dem Stahl.',
    captionEn: 'Embedded in the matrix sits the heart of the formula — MoS₂ with hexagonal P6₃/mmc crystal structure. Under 50–300 MPa contact pressure, the S–Mo–S layers shear and deposit a 2–5 nm Fe–S transfer film on the steel.',
  },
  {
    node: 2,
    captionDe: 'Fischer-Tropsch-Wachs (>90 % Kristallinität) ko-kristallisiert mit dem Paraffin und hebt den Tropfpunkt auf ~75 °C. Das stabilisiert auch die MoS₂-Einbettung — die Matrix hält die Partikel unter Sommerlast an Ort und Stelle.',
    captionEn: 'Fischer–Tropsch wax (>90% crystallinity) co-crystallises with the paraffin and lifts the drop point to ~75 °C. This also stabilises the MoS₂ embedding — the matrix keeps particles in place under summer load.',
  },
  {
    node: 3,
    captionDe: 'Mikrokristallines Wachs — verzweigte und zyklische Naphthene — füllt die amorphen Zonen zwischen den Paraffinlamellen. Dreifache Funktion: Plastifizierung bis −8 °C, stärkere van-der-Waals-Haftung auf Stahl und mechanische Einbettung der MoS₂-Partikel.',
    captionEn: 'Microcrystalline wax — branched and cyclic naphthenes — fills the amorphous zones between paraffin lamellae. Triple function: plasticisation to −8 °C, stronger van der Waals adhesion to steel, and mechanical embedding of the MoS₂ particles.',
  },
  {
    node: 5,
    captionDe: 'MoS₂ ist 5,6× dichter als Wachs (5,06 vs. 0,9 g/cm³) — nach Stokes\' Gesetz sinkt es in Minuten. Ein amphiphiler Fettsäureester legt eine sterische Hülle um jedes Partikel. Entropischer Widerstand verhindert Agglomeration und Sedimentation.',
    captionEn: 'MoS₂ is 5.6× denser than wax (5.06 vs. 0.9 g/cm³) — per Stokes\' law it sinks in minutes. An amphiphilic fatty acid ester wraps each particle in a steric shell. Entropic resistance prevents agglomeration and sedimentation.',
  },
  {
    node: 6,
    captionDe: 'Ein gehindertes Phenol doniert H-Atome an Peroxylradikale (ROO•) und bricht die Oxidationskaskade. So schützt es die Wachsmatrix vor Autooxidation und Versprödung.',
    captionEn: 'A hindered phenol donates H atoms to peroxyl radicals (ROO•), breaking the oxidation cascade. That shields the wax matrix from autooxidation and embrittlement.',
  },
];
export const STORY_DONE = {
  de: 'Das ist die Pro-Rezeptur: Trägermatrix, Festschmierstoff und Schutz in einem Block. Tippe eine Komponente, um sie zu erkunden.',
  en: 'That\'s the Pro recipe: carrier matrix, solid lubricant and protection in a single block. Tap any component to explore it.',
};

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
// NOT part of the relationship graph (no EDGES), so SciencePage/WaxField are
// unaffected. Node ids 7–8 avoid collision with the graph nodes 1–6.
export const CLASSIC_EXTRA: ScienceComponent[] = [
  {
    node: 7, id: 'ptfe',
    graphLabelDe: 'PTFE', graphLabelEn: 'PTFE',
    nameDe: 'PTFE (Polytetrafluorethylen)', nameEn: 'PTFE (polytetrafluoroethylene)',
    roleDe: 'Gleitzusatz', roleEn: 'Glide additive', metric: '< 1 µm',
    sumDe: 'Submikrone PTFE-Partikel (< 1 µm) halten den Wachsfilm glatt und antihaftend — der Gleitzusatz der Classic-Formel für trockene Bedingungen.',
    sumEn: 'Sub-micron PTFE particles (< 1 µm) keep the wax film slick and non-stick — the glide additive in the Classic formula for dry conditions.',
    whyDe: 'PTFE ist als Feststoff ausgesprochen gleitfähig und antihaftend. Fein in die Wachsmatrix eingebettet hält es den Film glatt und sauber: Er bleibt trocken, wird nicht klebrig und bindet keinen Schmutz.',
    whyEn: 'As a solid, PTFE is exceptionally slippery and non-stick. Finely embedded in the wax matrix it keeps the film smooth and clean: it stays dry, never turns tacky, and doesn\'t attract dirt.',
    physicsDe: [
      'PTFE besteht aus langen Fluorkohlenstoffketten, deren Fluorhülle nahezu keine zwischenmolekularen Bindungen eingeht — daher die hohe Gleitfähigkeit und die Antihaft-Wirkung des Materials.',
      'Als Partikel unter 1 µm verteilt sich PTFE gleichmäßig im erstarrenden Paraffin und legt sich als dünner, glatter Belag an die Oberfläche. Das unterstreicht die trockene Sauberkeit des Wachses — ein gleitfähiger Schönwetter-Film für milde, trockene Bedingungen.',
    ],
    physicsEn: [
      'PTFE is built from long fluorocarbon chains whose fluorine shell forms almost no intermolecular bonds — hence the material\'s slipperiness and non-stick behaviour.',
      'As sub-micron particles it disperses evenly through the solidifying paraffin and forms a thin, smooth surface layer. This reinforces the dry cleanliness of the wax — a slick fair-weather film for mild, dry conditions.',
    ],
    insightDe: 'Classic setzt auf PTFE statt MoS₂: das ganze Jahr nutzbar und bei trockenen Bedingungen am stärksten, ohne die Zusätze für Nässe und Kälte.',
    insightEn: 'Classic uses PTFE instead of MoS₂: usable all year and strongest in dry conditions, without the additives for wet and cold.',
    diagram: 'ptfe',
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
    diagram: 'stearin',
  },
];

// ─── Die Formel-Reise (Wissenschaftsseite, src/sections/science/journey) ─────
// Eine Kamerafahrt von der Kette am Kettenblatt bis in den Film im Gelenk
// und zurueck. Pro Takt ein, zwei Saetze; die Tiefe steht in COMPONENTS.
// Der letzte Takt (Ergebnis) wird in Journey.tsx aus waxVsOil gebaut, damit
// die Zahlen nur an einer Stelle stehen.
//
// Fachlich geprueft 26.09.2026: 9° = 360°/40 Zaehne. Buchsenlos: der Kragen
// der Innenlasche ist die Buchse. Paraffin erstarrt in Plaettchen,
// Mikrowachs in feinen Nadeln. Stokes ~1 mm/min (siehe sedimentation). Keine
// mu-Zahl: MoS2 liegt in feuchter Luft bei 0,1–0,2, eine Kette faehrt nie in
// trockener.
export interface JourneyBeat { act: number; eyebrowDe: string; eyebrowEn: string; titleDe: string; titleEn: string; bodyDe: string; bodyEn: string }
export const JOURNEY_ACTS = [
  { de: 'Die Kette', en: 'The chain' },
  { de: 'Das Gelenk', en: 'The joint' },
  { de: 'Der Spalt', en: 'The gap' },
  { de: 'Der Film', en: 'The film' },
  { de: 'Zurück', en: 'Back out' },
];
export const JOURNEY_BEATS: JourneyBeat[] = [
  { act: 0, eyebrowDe: 'Maßstab ~10 cm', eyebrowEn: 'Scale ~10 cm',
    titleDe: 'Wo die Kette arbeitet.', titleEn: 'Where the chain works.',
    bodyDe: 'Oben läuft die Kette unter Zug aufs Kettenblatt. Diese Seite trägt deine ganze Tretkraft.',
    bodyEn: 'Up top the chain runs onto the chainring under tension. This side carries all of your pedalling force.' },
  { act: 0, eyebrowDe: 'Maßstab ~5 cm', eyebrowEn: 'Scale ~5 cm',
    titleDe: 'Jedes Glied knickt ein.', titleEn: 'Every link hinges.',
    bodyDe: 'Beim Auflaufen dreht sich jedes Gelenk um 9°, bei 40 Zähnen. Genau dann gleitet Stahl auf Stahl, unter voller Last. Am Kettenblatt, am Ritzel und an den Schaltröllchen, in jeder Runde.',
    bodyEn: 'As it runs on, every joint turns by 9° on a 40-tooth ring. That is when steel slides on steel, under full load. At the chainring, the cog and the jockey wheels, every lap.' },
  { act: 1, eyebrowDe: 'Maßstab ~1 cm', eyebrowEn: 'Scale ~1 cm',
    titleDe: 'Ein Gelenk, durchleuchtet.', titleEn: 'One joint, x-rayed.',
    bodyDe: 'Unter den Laschen stecken drei Teile ineinander: Bolzen, Kragen der Innenlasche und Rolle. Moderne 9- bis 12-fach-Ketten haben keine eigene Buchse mehr, der Kragen übernimmt ihre Aufgabe.',
    bodyEn: 'Under the plates three parts nest inside each other: pin, the inner plate’s collar and the roller. Modern 9 to 12-speed chains have no separate bushing, the collar does its job.' },
  { act: 1, eyebrowDe: 'Reibstelle 01', eyebrowEn: 'Friction point 01',
    titleDe: 'Bolzen gegen Kragen.', titleEn: 'Pin against collar.',
    bodyDe: 'Hier liegt die ganze Zugkraft an. Der Bolzen drückt einseitig gegen den Kragen und dreht sich bei jedem Einknicken darin. Kein Film muss mehr aushalten als dieser.',
    bodyEn: 'All of the tension sits here. The pin presses against one side of the collar and turns inside it at every hinge. No film has to take more than this one.' },
  { act: 1, eyebrowDe: 'Reibstelle 02', eyebrowEn: 'Friction point 02',
    titleDe: 'Rolle gegen Kragen.', titleEn: 'Roller against collar.',
    bodyDe: 'Die Rolle dreht sich, wenn sie auf einen Zahn trifft. Sie liegt ganz außen, hier kommt Schmutz zuerst an.',
    bodyEn: 'The roller turns when it meets a tooth. It sits furthest out, so this is where dirt arrives first.' },
  { act: 1, eyebrowDe: 'Reibstelle 03', eyebrowEn: 'Friction point 03',
    titleDe: 'Lasche gegen Lasche.', titleEn: 'Plate against plate.',
    bodyDe: 'Innen- und Außenlasche liegen flach aufeinander. Läuft die Kette schräg, schleifen sie seitlich aneinander.',
    bodyEn: 'Inner and outer plates lie flat on each other. When the chain runs at an angle, they rub sideways.' },
  { act: 2, eyebrowDe: 'Tausendfach näher', eyebrowEn: 'A thousand times closer',
    titleDe: 'Hinein in Reibstelle 01.', titleEn: 'Into friction point 01.',
    bodyDe: 'An der Druckseite trennen Bolzen und Kragen nur wenige Mikrometer. Was in diesem Spalt sitzt, entscheidet über den Verschleiß.',
    bodyEn: 'On the loaded side, pin and collar are only a few micrometres apart. Whatever sits in this gap decides the wear.' },
  { act: 2, eyebrowDe: 'Maßstab ~100 µm · mit Öl', eyebrowEn: 'Scale ~100 µm · with oil',
    titleDe: 'Öl bleibt flüssig.', titleEn: 'Oil stays liquid.',
    bodyDe: 'Öl ist klebrig und fließt. Staub bleibt daran hängen und wird mit in den Spalt gezogen. Dort wirkt er wie Schleifpaste: er zerkratzt die Stahlflächen, und die Kette längt sich.',
    bodyEn: 'Oil is tacky and flows. Dust sticks to it and gets pulled into the gap. There it works like grinding paste: it scratches the steel and the chain stretches.' },
  { act: 2, eyebrowDe: 'Maßstab ~100 µm · mit Wachs', eyebrowEn: 'Scale ~100 µm · with wax',
    titleDe: 'Wachs wird fest.', titleEn: 'Wax turns solid.',
    bodyDe: 'Heißwachs füllt den Spalt und erstarrt. Ein fester, trockener Film bindet keinen Staub, es entsteht keine Paste. Deshalb hält eine gewachste Kette deutlich länger, oft 2 bis 3×.',
    bodyEn: 'Hot wax fills the gap and solidifies. A firm, dry film holds no dust, so no paste forms. That is why a waxed chain lasts much longer, often 2 to 3×.' },
  { act: 3, eyebrowDe: 'Maßstab ~10 µm · Paraffin', eyebrowEn: 'Scale ~10 µm · paraffin',
    titleDe: 'So erstarrt der Film.', titleEn: 'How the film sets.',
    bodyDe: 'Beim Abkühlen wachsen in der Schmelze feine Paraffin-Plättchen und verkeilen sich ineinander. Dieses Gerüst trägt alles, was noch kommt.',
    bodyEn: 'As it cools, fine paraffin platelets grow in the melt and lock into each other. This scaffold carries everything that follows.' },
  { act: 3, eyebrowDe: 'Problem: Last · MoS₂', eyebrowEn: 'Problem: load · MoS₂',
    titleDe: 'Gegen den Druck.', titleEn: 'Against the pressure.',
    bodyDe: 'Unter voller Last wird Wachs an den Rauheitsspitzen weggedrückt, dort kommen sich die Stahlflächen am nächsten. MoS₂-Plättchen legen sich flach an den Stahl, ihre Schichten gleiten aufeinander und füllen die Täler der Oberfläche.',
    bodyEn: 'Under full load wax is pushed away at the roughness peaks, where the steel surfaces come closest. MoS₂ platelets lie flat on the steel, their layers glide over each other and fill the valleys of the surface.' },
  { act: 3, eyebrowDe: 'Problem: Hitze · FT-Wachs', eyebrowEn: 'Problem: heat · FT wax',
    titleDe: 'Gegen den Sommer.', titleEn: 'Against summer.',
    bodyDe: 'Paraffin schmilzt um 58 °C und wird schon deutlich darunter weich. In praller Sonne könnte der Film wandern. Fischer-Tropsch-Wachs kristallisiert mit dem Paraffin zusammen und hält das Gerüst bis ~75 °C in Form.',
    bodyEn: 'Paraffin melts around 58 °C and softens well below that. In full sun the film could migrate. Fischer–Tropsch wax crystallises together with the paraffin and holds the scaffold in shape up to ~75 °C.' },
  { act: 3, eyebrowDe: 'Problem: Kälte · Mikrowachs', eyebrowEn: 'Problem: cold · microcrystalline',
    titleDe: 'Gegen den Frost.', titleEn: 'Against frost.',
    bodyDe: 'Bei Frost werden reine Paraffin-Plättchen spröde, beim Biegen reißt der Film an ihren Grenzen. Mikrokristallines Wachs aus verzweigten Molekülen bildet feine, unregelmäßige Kristalle dazwischen und hält ihn bis −8 °C biegsam.',
    bodyEn: 'In frost pure paraffin platelets turn brittle and the film cracks along their edges when it flexes. Microcrystalline wax, made of branched molecules, forms fine, irregular crystals in between and keeps it flexible down to −8 °C.' },
  { act: 3, eyebrowDe: 'Problem: beim Gießen · Dispergiersystem', eyebrowEn: 'Problem: casting · dispersant',
    titleDe: 'Gegen das Absinken.', titleEn: 'Against settling.',
    bodyDe: 'MoS₂ ist 5,6× dichter als Wachs und sinkt in der Schmelze rund 1 mm pro Minute. Eine Esterhülle um jedes Partikel verhindert, dass sie zu Klumpen zusammenfinden, die ein Vielfaches schneller sinken. So enthält der letzte Block einer Charge so viel wie der erste.',
    bodyEn: 'MoS₂ is 5.6× denser than wax and sinks about 1 mm per minute in the melt. An ester shell around each particle stops them clumping into lumps that sink many times faster, so the last block of a batch holds as much as the first.' },
  { act: 3, eyebrowDe: 'Problem: Zeit · Antioxidans', eyebrowEn: 'Problem: time · antioxidant',
    titleDe: 'Gegen das Altern.', titleEn: 'Against ageing.',
    bodyDe: 'Sauerstoff bildet Radikale, die Wachsketten angreifen und den Film spröde machen. Ein gehindertes Phenol gibt sein H zuerst ab und stoppt die Kettenreaktion.',
    bodyEn: 'Oxygen forms radicals that attack wax chains and make the film brittle. A hindered phenol gives up its H first and stops the chain reaction.' },
  { act: 4, eyebrowDe: 'Zurück auf ~10 cm', eyebrowEn: 'Back to ~10 cm',
    titleDe: 'Das alles steckt in jedem Glied.', titleEn: 'All of that sits in every link.',
    bodyDe: 'Sechs Stoffe in einem Film von wenigen Mikrometern, in jedem Gelenk deiner Kette.',
    bodyEn: 'Six substances in a film a few micrometres thin, in every joint of your chain.' },
];

// ─── Hotspots der Formel-Reise ───────────────────────────────────────────────
// Antippbare Stellen im Bild. Standardmaessig zu; wer tiefer will, oeffnet die
// Physik dahinter. `anchor` wird in Journey.tsx auf die Geometrie aufgeloest
// (geometry.ts), `from`/`to` sind Takt-Positionen. `schematic` heisst: Groesse
// oder Form ist eine Groessenordnung, keine Messung. `detail` springt zur
// ausfuehrlichen Liste unten auf der Seite.
export interface JourneyHotspot {
  id: string; anchor: string; from: number; to: number;
  titleDe: string; titleEn: string; bodyDe: string; bodyEn: string;
  formula?: string; valueDe?: string; valueEn?: string;
  sourceDe?: string; sourceEn?: string; schematic?: boolean; detail?: string;
}
export const JOURNEY_HOTSPOTS: JourneyHotspot[] = [
  { id: 'tension', anchor: 'tension', from: 0, to: 1,
    titleDe: 'Das Zugtrum', titleEn: 'The tight span',
    bodyDe: 'Das obere Kettenstück überträgt deine Tretkraft vom Blatt zum Ritzel. Bei 250 W und 90 Kurbelumdrehungen pro Minute läuft die Kette auf einem 40er-Blatt mit 0,76 m/s. Im Mittel zieht sie mit rund 330 N, beim Antritt mit einem Vielfachen.',
    bodyEn: 'The upper span carries your pedalling force from ring to cog. At 250 W and 90 rpm on a 40-tooth ring the chain runs at 0.76 m/s. On average it pulls with about 330 N, several times that when you sprint.',
    formula: 'F = P / v = 250 W / 0,76 m/s ≈ 330 N', sourceDe: 'nachgerechnet', sourceEn: 'worked out' },
  { id: 'tooth', anchor: 'tooth', from: 0, to: 1.2,
    titleDe: 'Zahnform nach ISO 606', titleEn: 'Tooth form per ISO 606',
    bodyDe: 'Die Zahnlücke ist ein Kreisbogen, in den sich die Rolle legt. Daran schließt die Flanke an, über die die Rolle beim Auf- und Ablaufen gleitet. Die Zahnkraft geht über die Rolle in die Kette, nicht direkt auf den Bolzen.',
    bodyEn: 'The tooth gap is an arc the roller settles into. The flank follows, and the roller slides over it as it runs on and off. Tooth force enters the chain through the roller, not directly through the pin.',
    formula: 'rᵢ = 0,505·d₁ + 0,069·∛d₁', valueDe: 'Teilung 12,7 mm · Rolle 7,75 mm', valueEn: 'Pitch 12.7 mm · roller 7.75 mm',
    sourceDe: 'ISO 606, Serie 081/082', sourceEn: 'ISO 606, series 081/082' },
  { id: 'hinge', anchor: 'pinB', from: 1, to: 2,
    titleDe: 'Der Knickwinkel', titleEn: 'The articulation angle',
    bodyDe: 'Jedes Gelenk dreht beim Auflaufen um 360° geteilt durch die Zähnezahl und beim Ablaufen wieder zurück. Am 40er-Blatt sind das 9°, am 11er-Ritzel 32,7°. Darum verlieren kleine Ritzel mehr Leistung als große.',
    bodyEn: 'Every joint turns by 360° divided by the tooth count as it runs on, and back again as it runs off. On a 40-tooth ring that is 9°, on an 11-tooth cog 32.7°. That is why small cogs cost more power than big ones.',
    formula: 'θ = 360° / z', sourceDe: 'Geometrie; Verlust je Ritzelgröße: Friction Facts', sourceEn: 'Geometry; loss per cog size: Friction Facts' },
  { id: 'pin', anchor: 'pin', from: 2, to: 4,
    titleDe: 'Der Bolzen', titleEn: 'The pin',
    bodyDe: 'Ein gehärteter Stahlstift, in die Außenlaschen gepresst und vernietet. Er dreht sich nicht gegen die Außenlaschen, sondern im Kragen der Innenlasche. Diese Paarung trägt die volle Kettenzugkraft.',
    bodyEn: 'A hardened steel pin, pressed into the outer plates and riveted. It does not turn against the outer plates but inside the inner plate’s collar. This pair carries the full chain tension.',
    valueDe: 'Ø ≈ 3,7 mm', valueEn: 'Ø ≈ 3.7 mm' },
  { id: 'collar', anchor: 'collar', from: 2, to: 5,
    titleDe: 'Kragen statt Buchse', titleEn: 'Collar instead of bushing',
    bodyDe: 'Bei 9- bis 12-fach-Ketten ist die Buchse in die Innenlasche eingeformt. Bolzen und Kragen bilden das Gleitlager, das am meisten verschleißt. Was sich hier abträgt, misst du später als Kettenlängung.',
    bodyEn: 'On 9 to 12-speed chains the bushing is formed into the inner plate. Pin and collar make up the plain bearing that wears the most. What wears away here is what you later measure as chain stretch.',
    sourceDe: 'Friction Facts', sourceEn: 'Friction Facts' },
  { id: 'roller', anchor: 'roller', from: 2, to: 6,
    titleDe: 'Die Rolle', titleEn: 'The roller',
    bodyDe: 'Sie sitzt lose auf dem Kragen und rollt beim Einlaufen am Zahn ab, statt über ihn zu schleifen. Ihre Innenseite gegen den Kragen ist die zweite Reibstelle. Sie liegt ganz außen, hier kommt Schmutz zuerst an.',
    bodyEn: 'It sits loose on the collar and rolls onto the tooth instead of scraping over it. Its bore against the collar is the second friction point. It sits furthest out, so dirt arrives here first.',
    valueDe: 'Ø 7,75 mm', valueEn: 'Ø 7.75 mm', sourceDe: 'ISO 606', sourceEn: 'ISO 606' },
  { id: 'plates', anchor: 'plates', from: 2, to: 6,
    titleDe: 'Die Laschen', titleEn: 'The plates',
    bodyDe: 'Innen- und Außenlaschen tragen die Zugkraft von Bolzen zu Bolzen. Wo sie flach aufeinanderliegen, reiben sie bei Schräglauf seitlich. Der Anteil am Verlust ist klein, aber hier setzt sich Schmutz fest.',
    bodyEn: 'Inner and outer plates carry tension from pin to pin. Where they lie flat on each other they rub sideways when the chain runs at an angle. Their share of the loss is small, but dirt settles here.' },
  { id: 'clearance', anchor: 'gap', from: 6.2, to: 9,
    titleDe: 'Das Spiel im Gelenk', titleEn: 'Clearance in the joint',
    bodyDe: 'Zwischen Bolzen und Kragen ist ein Spiel von Hundertstelmillimetern. Unter Zug liegt der Bolzen einseitig an. Auf der Druckseite bleiben nur wenige Mikrometer, und genau dort muss der Schmierfilm halten.',
    bodyEn: 'Between pin and collar there is a clearance of hundredths of a millimetre. Under tension the pin bears on one side. On the loaded side only a few micrometres remain, and that is where the film has to hold.',
    valueDe: 'Spalt im Bild: 3 µm', valueEn: 'Gap shown: 3 µm', schematic: true },
  { id: 'grit', anchor: 'grit', from: 7, to: 8,
    titleDe: 'Dreikörper-Abrasion', titleEn: 'Three-body abrasion',
    bodyDe: 'Straßenstaub besteht zu großen Teilen aus Quarz, Mohs-Härte 7, etwa so hart wie gehärteter Kettenstahl. Im klebrigen Öl gebunden rollt er zwischen den Flächen und trägt beide ab. Tribologen nennen das Dreikörper-Abrasion.',
    bodyEn: 'Road dust is largely quartz, Mohs hardness 7, about as hard as hardened chain steel. Bound in tacky oil it rolls between the surfaces and wears both. Tribologists call this three-body abrasion.',
    valueDe: 'Partikel ~1–100 µm', valueEn: 'Particles ~1–100 µm' },
  { id: 'waxfilm', anchor: 'waxfilm', from: 8, to: 9,
    titleDe: 'Ein fester Film', titleEn: 'A solid film',
    bodyDe: 'Unterhalb seines Schmelzbereichs ist Wachs fest und trocken. Staub haftet nicht, er wird nicht in den Spalt geschwemmt und bildet keine Paste. Der Film trägt, bis er sich über die Kilometer abreibt, dann kommt der nächste Wachsgang.',
    bodyEn: 'Below its melting range wax is solid and dry. Dust does not stick, is not washed into the gap and forms no paste. The film carries until it wears off over the kilometres, then it is time for the next waxing.' },
  { id: 'lamella', anchor: 'paraffin', from: 9, to: 10, detail: 'kristallstruktur',
    titleDe: 'Paraffin-Lamellen', titleEn: 'Paraffin lamellae',
    bodyDe: 'Paraffin besteht aus geraden Kohlenwasserstoffketten, etwa C₂₀ bis C₄₀. Beim Erstarren strecken sie sich und stapeln sich zu Lamellen, so dick wie eine Kette lang ist. Die Lamellen bilden die Plättchen, die das Gerüst des Films tragen.',
    bodyEn: 'Paraffin consists of straight hydrocarbon chains, roughly C₂₀ to C₄₀. On solidifying they straighten and stack into lamellae as thick as a chain is long. The lamellae build the platelets that form the film’s scaffold.',
    formula: 'L ≈ n · 0,127 nm  →  C₃₄ ≈ 4,3 nm', sourceDe: 'Kristallographie der n-Alkane', sourceEn: 'n-alkane crystallography' },
  { id: 'mos2', anchor: 'mos2', from: 10, to: 11, detail: 'mos2',
    titleDe: 'MoS₂, ein Schichtgitter', titleEn: 'MoS₂, a layer lattice',
    bodyDe: 'Innerhalb jeder S–Mo–S-Lage halten starke kovalente Bindungen, zwischen den Lagen nur schwache Van-der-Waals-Kräfte. Unter Last scheren die Lagen ab und bilden auf dem Stahl einen Transferfilm. In feuchter Luft steigt die Reibung deutlich an.',
    bodyEn: 'Strong covalent bonds hold within each S–Mo–S layer, only weak van der Waals forces between them. Under load the layers shear off and build a transfer film on the steel. In humid air friction rises noticeably.',
    valueDe: 'Lagenabstand 0,615 nm · μ trocken ≈ 0,03–0,06', valueEn: 'Layer spacing 0.615 nm · μ dry ≈ 0.03–0.06',
    sourceDe: 'Kennwerte des Feststoffs, nicht der Kette', sourceEn: 'Properties of the solid, not of the chain' },
  { id: 'ft', anchor: 'ft', from: 11, to: 12, detail: 'matrix',
    titleDe: 'Fischer-Tropsch-Wachs', titleEn: 'Fischer–Tropsch wax',
    bodyDe: 'Synthetisch aufgebaute, lineare Alkane mit deutlich längeren Ketten als Paraffin. Sie schmelzen erst bei rund 80 bis 110 °C und kristallisieren mit dem Paraffin zusammen. Wird das Paraffin im Sommer weich, bleibt dieses Gerüst stehen.',
    bodyEn: 'Synthetic, linear alkanes with much longer chains than paraffin. They only melt at around 80 to 110 °C and co-crystallise with the paraffin. When the paraffin softens in summer, this scaffold stays in place.',
    valueDe: 'Formstabil bis ~75 °C (Mischung)', valueEn: 'Holds shape to ~75 °C (blend)' },
  { id: 'micro', anchor: 'micro', from: 12, to: 13, detail: 'winterformel',
    titleDe: 'Mikrokristallines Wachs', titleEn: 'Microcrystalline wax',
    bodyDe: 'Verzweigte und ringförmige Kohlenwasserstoffe, Isoparaffine und Naphthene. Sie packen schlecht und bilden nur kleine, unregelmäßige Kristalle. Dazwischen bleibt eine zähe Zone, die bei Kälte schert, statt zu reißen.',
    bodyEn: 'Branched and ring-shaped hydrocarbons, isoparaffins and naphthenes. They pack poorly and form only small, irregular crystals. In between remains a tough zone that shears in the cold instead of cracking.',
    valueDe: 'Biegsam bis −8 °C', valueEn: 'Flexible to −8 °C' },
  { id: 'disp', anchor: 'disp', from: 13, to: 14, detail: 'sedimentation',
    titleDe: 'Warum Partikel nicht verklumpen dürfen', titleEn: 'Why particles must not clump',
    bodyDe: 'Ein Partikel sinkt in der Schmelze nach Stokes, und die Geschwindigkeit wächst mit dem Quadrat des Radius. Ein Klumpen aus 5-µm-Teilchen mit 20 µm Durchmesser sinkt 16-mal so schnell. Die Esterhülle hält die Partikel auf Abstand.',
    bodyEn: 'A particle sinks through the melt according to Stokes, and the speed grows with the square of the radius. A 20 µm clump of 5 µm particles sinks 16 times as fast. The ester shell keeps the particles apart.',
    formula: 'v = 2·Δρ·g·r² / 9η  ≈ 1 mm/min (5 µm, 65 °C)', sourceDe: 'nachgerechnet, siehe unten', sourceEn: 'worked out, see below' },
  { id: 'antiox', anchor: 'antiox', from: 14, to: 15, detail: 'antioxidans',
    titleDe: 'Gehindertes Phenol', titleEn: 'Hindered phenol',
    bodyDe: 'Sauerstoff erzeugt Peroxylradikale, die eine Kettenreaktion durch das Wachs treiben. Das Phenol gibt sein H-Atom zuerst ab. Das entstehende Radikal ist durch seine sperrigen Seitengruppen so stabil, dass die Reaktion dort endet.',
    bodyEn: 'Oxygen creates peroxyl radicals that drive a chain reaction through the wax. The phenol gives up its H atom first. The radical it leaves is so stabilised by its bulky side groups that the reaction stops there.',
    formula: 'ROO· + ArOH → ROOH + ArO·' },
];
