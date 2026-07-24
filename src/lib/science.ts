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
    sumDe: 'Vollraffiniertes Paraffin bildet den Grundfilm — lineare Alkanketten (C₂₀–C₃₆) packen sich orthorhombisch zu ~10 nm dünnen Lamellen, die mehr Metall bedecken und weniger Wasser durchlassen als Standardwachse.',
    sumEn: 'Fully refined paraffin forms the base film — linear alkane chains (C₂₀–C₃₆) pack orthorhombically into ~10 nm lamellae that cover more metal and let less water through than standard waxes.',
    whyDe: 'Grobkristallines Standard-Wachs lässt messbare Lücken, durch die Wasser die Stahloberfläche erreicht. Ein eng schmelzendes Paraffin (58–60 °C) kristallisiert feiner und dichter — der Film schließt besser ab und schützt vor Oxidation.',
    whyEn: 'Coarse standard wax leaves measurable gaps where water reaches the steel. A tight-melting paraffin (58–60 °C) crystallises finer and denser — the film seals better and protects against oxidation.',
    physicsDe: [
      'Die erste Frage war täuschend einfach: Welches Paraffin? Paraffin ist keine Substanz, sondern eine Kategorie — sie reicht von weichen, öligen Kerzenwachsen bis zu spröden Technikalqualitäten. Die entscheidende Variable ist der Erstarrungsbereich.',
      'Wir haben uns für ein vollraffiniertes Erdöldestillat mit einem exakt definierten 2 °C-Erstarrungsfenster (58–60 °C) entschieden. Diese Enge ist keine Präzision um ihrer selbst willen — sie sichert die Reproduzierbarkeit. Ein breiterer Erstarrungsbereich produziert je nach Batch leicht unterschiedliche Kristallstrukturen.',
      'Beim Abkühlen aus der Schmelze nucleieren die linearen Kohlenwasserstoffketten (C₂₀–C₃₆) und bilden lamellare Kristalldomänen in orthorhombischer Anordnung (a = 7,42 Å, b = 4,96 Å) — ein dreidimensionales Gitterwerk aus ~10 nm dünnen Schichten. Diese Kristallstruktur bestimmt alles: die Haftung auf dem Metall, die Dichte des Films und die mechanische Belastbarkeit.',
      'Die lamellaren Oberflächen müssen kristallographisch glatt genug sein, um die nächste Lamelle zu nukleieren. Jede Abweichung in der Kettenlänge wird durch longitudinale Molekülverschiebungen innerhalb der Lamellen kompensiert. In den amorphen Zwischenbereichen dieses Gitters werden alle anderen Komponenten eingeschlossen — die Basismatrix ist das Skelett. Alles andere ist eingebettet.',
    ],
    physicsEn: [
      'The first question was deceptively simple: which paraffin? Paraffin isn\'t a material, it\'s a category — spanning soft, oily candle waxes to brittle technical grades. The decisive variable is the solidification range.',
      'We chose a fully refined petroleum distillate with a precisely defined 2 °C solidification window (58–60 °C). This narrow range isn\'t precision for its own sake — it ensures reproducibility. A wider solidification range produces subtly different crystal structures batch-to-batch.',
      'On cooling from the melt, the linear hydrocarbon chains (C₂₀–C₃₆) nucleate and form lamellar crystal domains in orthorhombic arrangement (a = 7.42 Å, b = 4.96 Å) — an interlocking three-dimensional lattice of ~10 nm thin layers. This crystal structure determines everything: adhesion to the metal, film density, and mechanical load capacity.',
      'The lamellar surfaces must stay crystallographically flat enough to nucleate the next lamella. Chain-length variations are compensated by longitudinal molecular shifts within each lamella. All other components are trapped in the amorphous spaces between crystals — the base matrix is the skeleton. Everything else is embedded within it.',
    ],
    insightDe: 'Das enge Erstarrungsfenster ist der Schlüssel zur Batch-Konsistenz — und damit zur gleichmäßigen Performance jedes Blocks.',
    insightEn: 'The narrow solidification window is the key to batch consistency — every block performing identically.',
    diagram: 'lamellar', cx: 350, cy: 105, r: 40,
  },
  {
    node: 2, id: 'matrix',
    graphLabelDe: 'FT-Wachs', graphLabelEn: 'FT-Wax',
    nameDe: 'Fischer-Tropsch-Wachs', nameEn: 'Fischer–Tropsch wax',
    roleDe: 'Härtemodul', roleEn: 'Hardener', metric: '+75 °C',
    sumDe: 'Synthetisches Hartwachs (>90 % Kristallinität) hebt den Tropfpunkt auf ~75 °C — die Matrix hält Position unter Last statt wegzuwandern und stabilisiert die MoS₂-Einbettung thermisch.',
    sumEn: 'Synthetic hard wax (>90% crystallinity) raises the drop point to ~75 °C — the matrix holds position under load instead of migrating and thermally stabilises the MoS₂ embedding.',
    whyDe: 'An Kontaktpunkten entstehen unter Last 45–55 °C. Weiches Wachs erreicht hier seine Grenze, migriert vom Gelenk weg und dünnt aus. Das härtere FT-Wachs (Tropfpunkt ~75 °C) bleibt an Ort und Stelle: weniger Migration, längere Intervalle. Gleichzeitig verhindert es, dass MoS₂-Partikel bei Wärme aus einer erweichten Matrix ausgeschwemmt werden.',
    whyEn: 'Contact points reach 45–55 °C under load. Soft wax hits its limit here, migrating away from the joint and thinning out. The harder FT wax (drop point ~75 °C) stays put: less migration, longer intervals. It also prevents MoS₂ particles from being flushed out of a softened matrix.',
    physicsDe: [
      'Das zweite Problem war der Sommer. An Kettenkontaktpunkten unter Last können Temperaturen 45–55 °C erreichen. Reines Paraffinwachs wäre an seiner thermischen Grenze — es würde erweichen, migrieren, auf dem Schaltwerk landen statt in den Gelenkstiften.',
      'Die Lösung war ein synthetisches Wachs, hergestellt über den Fischer-Tropsch-Prozess: eine Kohlenstoff-Syntheseroute, die Kohlenwasserstoffketten von außergewöhnlicher Reinheit liefert. Kein Schwefel, keine Aromaten, keine Verzweigungen — nur vollständig lineare Moleküle. Diese Reinheit resultiert in einer Kristallinität von über 90 % — deutlich höher als bei Erdölparaffin (65–80 %).',
      'In gezielt gewählter Konzentration ko-kristallisiert dieses Additiv mit der Basismatrix und bildet dichtere, defektärmere Kristalldomänen, die deutlich mehr Energie zum Schmelzen benötigen. Der effektive Tropfpunkt der Gesamtmatrix steigt auf ~72–78 °C. Das sichert nicht nur die Wachsschicht, sondern auch die MoS₂-Partikel in der Matrix — sie werden bei Wärme nicht aus erweichtem Wachs verdrängt.',
    ],
    physicsEn: [
      'The second problem was summer. At chain contact points under load, temperatures can reach 45–55 °C. Unmodified paraffin wax would be at its thermal limit — it would soften, migrate, end up on the derailleur instead of the chain pins.',
      'The solution was a synthetic wax produced via the Fischer-Tropsch process: a carbon synthesis route that yields hydrocarbon chains of exceptional purity. No sulfur, no aromatics, no branching — only perfectly linear molecules. This purity results in crystallinity above 90% — significantly higher than petroleum paraffin (65–80%).',
      'At a carefully chosen concentration, this additive co-crystallises with the base matrix and forms denser, more defect-free crystal domains requiring significantly more energy to melt. The effective drop point of the matrix rises to ~72–78 °C. This secures not just the wax layer, but also the MoS₂ particles within the matrix — they aren\'t displaced from softened wax under heat.',
    ],
    insightDe: 'Tests mit höherer Konzentration zeigten keine messbare Verbesserung. Das Optimum liegt unter dem, was man intuitiv erwarten würde.',
    insightEn: 'Tests at higher concentrations showed no measurable improvement. The optimum is lower than you\'d intuitively expect.',
    diagram: 'droplift', cx: 155, cy: 80, r: 35,
  },
  {
    node: 3, id: 'winterformel',
    graphLabelDe: 'Mikrokris.', graphLabelEn: 'Microcris.',
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
    diagram: 'coldflex', cx: 545, cy: 80, r: 35,
  },
  {
    node: 4, id: 'mos2',
    graphLabelDe: 'MoS₂', graphLabelEn: 'MoS₂',
    nameDe: 'Molybdändisulfid (MoS₂)', nameEn: 'Molybdenum disulfide (MoS₂)',
    roleDe: 'Festschmierstoff', roleEn: 'Solid lubricant', metric: 'μ 0,03',
    sumDe: 'Hexagonale MoS₂-Kristallite (P6₃/mmc, < 5 µm) scheren unter Kontaktdruck entlang der van-der-Waals-Ebenen und bilden einen Fe–S-Transferfilm auf dem Stahl — Grenzreibung bis μ 0,03.',
    sumEn: 'Hexagonal MoS₂ crystallites (P6₃/mmc, < 5 µm) shear along the van der Waals planes under contact pressure and form an Fe–S transfer film on the steel — boundary friction down to μ 0.03.',
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
    diagram: 'shear', cx: 350, cy: 280, r: 56,
  },
  {
    node: 5, id: 'sedimentation',
    graphLabelDe: 'Dispersant', graphLabelEn: 'Dispersant',
    nameDe: 'Dispergiersystem', nameEn: 'Dispersant system',
    roleDe: 'Stabilisator', roleEn: 'Stabiliser', metric: '5,6×',
    sumDe: 'MoS₂ ist 5,6× dichter als Wachs — nach Stokes sedimentieren 5 µm Partikel ~0,8 mm/min in der Schmelze. Amphiphile Ester adsorbieren an den Partikelkanten und erzeugen eine sterische Barriere, die homogene Verteilung sichert.',
    sumEn: 'MoS₂ is 5.6× denser than wax — by Stokes\' law, 5 µm particles sediment ~0.8 mm/min in the melt. Amphiphilic esters adsorb at particle edges and create a steric barrier that ensures homogeneous distribution.',
    whyDe: 'Dichte: MoS₂ 5,06 g/cm³ vs. Paraffin 0,9 g/cm³. Nach Stokes sinken 5 µm Partikel mit ~0,8 mm/min in der 65 °C-Schmelze. Ohne Stabilisator wäre der erste Block aus einer Charge arm, der letzte überladen. Der Dispersant umhüllt jedes Partikel mit einer sterischen Hülle aus Fettsäureketten.',
    whyEn: 'Density: MoS₂ 5.06 g/cm³ vs. paraffin 0.9 g/cm³. By Stokes\' law, 5 µm particles sink at ~0.8 mm/min in the 65 °C melt. Without a stabiliser, the first block from a batch would be lean, the last overloaded. The dispersant coats each particle in a steric shell of fatty acid chains.',
    physicsDe: [
      'MoS₂ hat eine Dichte von 5,06 g/cm³. Paraffinwachs hat eine Dichte von 0,9 g/cm³. Dichteunterschied: Faktor 5,6. Das Stokes\'sche Gesetz quantifiziert das Problem: ein 5 µm Partikel in der Wachsschmelze bei 65 °C (η ≈ 3,5 mPa·s) sedimentiert mit ~0,8 mm/min. In den 10–15 Minuten zwischen Rührstopp und vollständiger Erstarrung eines Blocks bedeutet das mehrere Millimeter Absinkweg — ein klarer Konzentrationsgradient im fertigen Produkt.',
      'Das Dispergiermittel ist ein amphiphiler Fettsäureester: ein Molekül mit einer polaren Kopfgruppe (Ester/Hydroxyl), die über Wasserstoffbrücken an MoS₂-Partikelkanten adsorbiert, und einer langen unpolaren Fettsäurekette (C₁₆–C₁₈), die sich in die Paraffinschmelze erstreckt. Diese Hülle um jeden Partikel erzeugt eine sterische Barriere: annähernde Partikel müssen die Fettsäureketten komprimieren — die resultierende Entropieabnahme erzeugt eine abstoßende Kraft, die sowohl Agglomeration als auch gravitationsbedingte Sedimentation verhindert.',
      'Entscheidend für die Wahl dieses spezifischen Esters: Sein Schmelzpunkt (58–60 °C) ist identisch mit der Basismatrix. Beim Abkühlen ko-kristallisiert der Ester in die Paraffinlamellen — die Integration verläuft thermodynamisch nahtlos, ohne Phasenseparation. Der Dispersant wird Teil der Matrix statt als separate Phase vorzuliegen.',
    ],
    physicsEn: [
      'MoS₂ has a density of 5.06 g/cm³. Paraffin wax has a density of 0.9 g/cm³. Density ratio: 5.6×. Stokes\' law quantifies the problem: a 5 µm particle in the wax melt at 65 °C (η ≈ 3.5 mPa·s) sediments at ~0.8 mm/min. In the 10–15 minutes between stopping agitation and complete solidification of a block, that means several millimetres of settling — a clear concentration gradient in the finished product.',
      'The dispersant is an amphiphilic fatty acid ester: a molecule with a polar head group (ester/hydroxyl) that adsorbs to MoS₂ particle edges via hydrogen bonds, and a long nonpolar fatty acid tail (C₁₆–C₁₈) extending into the paraffin melt. This shell around each particle creates a steric barrier: approaching particles must compress the tails — the resulting entropy decrease generates a repulsive force preventing both agglomeration and gravity-driven sedimentation.',
      'Critical to the choice of this specific ester: its melting point (58–60 °C) is identical to the base matrix. On cooling, the ester co-crystallises into the paraffin lamellae — integration is thermodynamically seamless, with no phase separation. The dispersant becomes part of the matrix rather than persisting as a separate phase.',
    ],
    insightDe: 'Ohne Dispergiermittel variiert die MoS₂-Konzentration durch den Block. Der erste Rewax-Vorgang wäre anders als der zwanzigste. Das ist nicht akzeptabel.',
    insightEn: 'Without dispersant, MoS₂ concentration varies through the block. The first rewax would perform differently from the twentieth. Unacceptable.',
    diagram: 'density', cx: 210, cy: 400, r: 35,
  },
  {
    node: 6, id: 'antioxidans',
    graphLabelDe: 'Antioxidans', graphLabelEn: 'Antioxidant',
    nameDe: 'Phenolisches Antioxidans', nameEn: 'Phenolic antioxidant',
    roleDe: 'Schutz', roleEn: 'Protection', metric: '12 Mo.',
    sumDe: 'Doniert H-Atome an Peroxylradikale und bricht die Oxidationskaskade. Doppelter Schutz: verhindert MoS₂ → MoO₃-Umwandlung und schützt die Wachsmatrix vor Versprödung — 12 Monate stabile Lagerung.',
    sumEn: 'Donates H atoms to peroxyl radicals and breaks the oxidation cascade. Dual protection: prevents MoS₂ → MoO₃ conversion and shields the wax matrix from embrittlement — 12 months of stable shelf life.',
    whyDe: 'Sauerstoff greift an zwei Fronten an: Er oxidiert die Wachsmatrix (Peroxide → Versprödung) und wandelt MoS₂ in abrasives MoO₃ um (Mo⁴⁺ → Mo⁶⁺). Feuchtigkeit beschleunigt diese Prozesse mehrfach. Das gehinderte phenolische Antioxidans unterbricht beide Kaskaden an der Wurzel.',
    whyEn: 'Oxygen attacks on two fronts: it oxidises the wax matrix (peroxides → embrittlement) and converts MoS₂ to abrasive MoO₃ (Mo⁴⁺ → Mo⁶⁺). Humidity accelerates these processes several-fold. The hindered phenolic antioxidant interrupts both cascades at the root.',
    physicsDe: [
      'Die letzte Frage war Zeit. Ein Wachsblock, der in Woche 1 performt aber in Monat 6 nachlässt, ist kein Produkt. Kohlenwasserstoffwachse sind anfällig für Autoxidation: Sauerstoffradikale greifen C–H-Bindungen an und initiieren eine Kettenreaktion, die Peroxide, Alkohole und Ketone produziert. Diese Oxidationsprodukte verspröden die Matrix und verschlechtern ihre Haftung auf Metall.',
      'Gleichzeitig greift Sauerstoff die MoS₂-Partikel an: O₂ substituiert Schwefel an den Partikeloberflächen und bildet MoO₃ — ein hartes, abrasives Material (Mohshärte ~5,5 vs. MoS₂ ~1). In feuchter Luft verläuft diese Oxidation mehrfach schneller, da Wasser die Mo–S-Bindungen destabilisiert und flüchtige MoO₂(OH)₂-Spezies bilden kann.',
      'Ein gehindertes Phenol-Antioxidans wirkt als Radikalkettenabbrecher: Die phenolische OH-Gruppe doniert ein Wasserstoffatom an Peroxylradikale (ROO•) und überführt sie in stabile Hydroperoxide (ROOH). Das resultierende Phenoxyradikal ist durch Elektronendelokalisierung und die sperrigen tert-Butylgruppen (sterische Hinderung) stabilisiert — es kann keine neue Kettenreaktion starten.',
      'Damit schützt eine einzige Komponente zwei Systeme: die Wachsmatrix vor Versprödung und den MoS₂-Festschmierstoff vor Umwandlung in sein abrasives Oxid. Die Konzentration wurde leicht erhöht, als ein separater Korrosionsinhibitor aus einer früheren Formulierungsversion entfernt wurde.',
    ],
    physicsEn: [
      'The last question was time. A wax block that performs in week 1 but degrades by month 6 isn\'t a product. Hydrocarbon waxes are susceptible to autoxidation: oxygen radicals attack C–H bonds, initiating a chain reaction producing peroxides, alcohols, and ketones. These oxidation products embrittle the matrix and degrade its adhesion to metal.',
      'Simultaneously, oxygen attacks MoS₂ particles: O₂ substitutes sulfur at particle surfaces and forms MoO₃ — a hard, abrasive material (Mohs hardness ~5.5 vs. MoS₂ ~1). In humid air this oxidation proceeds several times faster, as water destabilises Mo–S bonds and can form volatile MoO₂(OH)₂ species.',
      'A hindered phenolic antioxidant acts as a radical chain-breaker: the phenolic OH group donates a hydrogen atom to peroxyl radicals (ROO•), converting them to stable hydroperoxides (ROOH). The resulting phenoxy radical is stabilised by electron delocalisation and the bulky tert-butyl groups (steric hindrance) — it cannot start a new chain reaction.',
      'Thus a single component protects two systems: the wax matrix from embrittlement and the MoS₂ solid lubricant from conversion to its abrasive oxide. Concentration was raised slightly when a separate corrosion inhibitor was removed from an earlier formula version.',
    ],
    insightDe: 'Das Antioxidans schützt nicht nur das Wachs, sondern auch den Festschmierstoff. Eine Komponente, die zwei Versagensmodi gleichzeitig verhindert — Matrixversprödung und MoS₂ → MoO₃-Degradation.',
    insightEn: 'The antioxidant protects not just the wax, but also the solid lubricant. One component preventing two failure modes — matrix embrittlement and MoS₂ → MoO₃ degradation.',
    diagram: 'radical', cx: 490, cy: 400, r: 35,
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
  { from: 2, to: 4, labelDe: 'Thermostabilität',    labelEn: 'thermal stability', dash: false, main: false },
  { from: 6, to: 1, labelDe: 'Matrixschutz',        labelEn: 'matrix guard',     dash: true,  main: false },
];

// ─── Story-led build — the narrated assembly of the Pro recipe ────────────────
// Each step focuses one component and draws the relationship(s) that connect it to
// what's already on the stage. FormulaGraph plays this as a guided build (spine
// first, then each spoke), one relationship at a time — which is also why the hub
// pills never stack. `edges` holds indices into EDGES above.
export interface FormulaStep {
  node: number;        // component introduced / focused this step (node id)
  edges: number[];     // EDGES indices drawn + highlighted this step
  captionDe: string; captionEn: string;
}
export const FORMULA_STORY: FormulaStep[] = [
  {
    node: 1, edges: [],
    captionDe: 'Alles beginnt mit der Trägermatrix: vollraffiniertes Paraffin (C₂₀–C₃₆) erstarrt bei 58–60 °C zu einem orthorhombischen Kristallgitter aus ~10 nm dünnen Lamellen — und schließt jedes weitere Molekül in dieses Skelett ein.',
    captionEn: 'It all starts with the carrier matrix: fully refined paraffin (C₂₀–C₃₆) solidifies at 58–60 °C into an orthorhombic crystal lattice of ~10 nm lamellae — locking every other molecule into this scaffold.',
  },
  {
    node: 4, edges: [2],
    captionDe: 'In die Matrix eingebettet sitzt das Herz der Formel — MoS₂ mit hexagonaler P6₃/mmc-Kristallstruktur. Unter 50–300 MPa Kontaktdruck scheren die S–Mo–S-Schichten und bilden einen 2–5 nm dünnen Fe–S-Transferfilm auf dem Stahl.',
    captionEn: 'Embedded in the matrix sits the heart of the formula — MoS₂ with hexagonal P6₃/mmc crystal structure. Under 50–300 MPa contact pressure, the S–Mo–S layers shear and deposit a 2–5 nm Fe–S transfer film on the steel.',
  },
  {
    node: 2, edges: [0, 6],
    captionDe: 'Fischer-Tropsch-Wachs (>90 % Kristallinität) ko-kristallisiert mit dem Paraffin und hebt den Tropfpunkt auf ~75 °C. Das stabilisiert auch die MoS₂-Einbettung — die Matrix hält die Partikel unter Sommerlast an Ort und Stelle.',
    captionEn: 'Fischer–Tropsch wax (>90% crystallinity) co-crystallises with the paraffin and lifts the drop point to ~75 °C. This also stabilises the MoS₂ embedding — the matrix keeps particles in place under summer load.',
  },
  {
    node: 3, edges: [1, 3],
    captionDe: 'Mikrokristallines Wachs — verzweigte und zyklische Naphthene — füllt die amorphen Zonen zwischen den Paraffinlamellen. Dreifache Funktion: Plastifizierung bis −8 °C, stärkere van-der-Waals-Haftung auf Stahl und mechanische Einbettung der MoS₂-Partikel.',
    captionEn: 'Microcrystalline wax — branched and cyclic naphthenes — fills the amorphous zones between paraffin lamellae. Triple function: plasticisation to −8 °C, stronger van der Waals adhesion to steel, and mechanical embedding of the MoS₂ particles.',
  },
  {
    node: 5, edges: [4],
    captionDe: 'MoS₂ ist 5,6× dichter als Wachs (5,06 vs. 0,9 g/cm³) — nach Stokes\' Gesetz sinkt es in Minuten. Ein amphiphiler Fettsäureester legt eine sterische Hülle um jedes Partikel. Entropischer Widerstand verhindert Agglomeration und Sedimentation.',
    captionEn: 'MoS₂ is 5.6× denser than wax (5.06 vs. 0.9 g/cm³) — per Stokes\' law it sinks in minutes. An amphiphilic fatty acid ester wraps each particle in a steric shell. Entropic resistance prevents agglomeration and sedimentation.',
  },
  {
    node: 6, edges: [5, 7],
    captionDe: 'Ein gehindertes Phenol doniert H-Atome an Peroxylradikale (ROO•) und bricht die Oxidationskaskade. Doppelter Schutz: verhindert MoS₂ → MoO₃-Umwandlung (Mo⁴⁺ → Mo⁶⁺) und schützt die Wachsmatrix selbst vor Autooxidation und Versprödung.',
    captionEn: 'A hindered phenol donates H atoms to peroxyl radicals (ROO•), breaking the oxidation cascade. Dual protection: prevents MoS₂ → MoO₃ conversion (Mo⁴⁺ → Mo⁶⁺) and shields the wax matrix itself from autooxidation and embrittlement.',
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
// NOT part of the relationship graph (no EDGES), so SciencePage/FormulaGraph are
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
      { id: 'kristallstruktur', x: 230, y: 70,  big: true }, // Paraffin (matrix hub)
      { id: 'matrix',           x: 86,  y: 150 },             // FT-Wachs
      { id: 'winterformel',     x: 374, y: 150 },             // Mikrokristallin
      { id: 'mos2',             x: 230, y: 215, big: true },  // MoS₂ (lubricant hub)
      { id: 'sedimentation',    x: 96,  y: 312 },             // Dispersant
      { id: 'antioxidans',      x: 364, y: 312 },             // Antioxidans
    ],
    links: [
      { a: 'kristallstruktur', b: 'mos2',            labelDe: 'Trägermatrix',      labelEn: 'carrier matrix',  main: true },
      { a: 'matrix',           b: 'kristallstruktur', labelDe: 'Ko-Kristallisation', labelEn: 'co-crystallises' },
      { a: 'winterformel',     b: 'kristallstruktur', labelDe: 'Plastifiziert',    labelEn: 'plasticises' },
      { a: 'winterformel',     b: 'mos2',            labelDe: 'Einbettung',        labelEn: 'embedding' },
      { a: 'sedimentation',    b: 'mos2',            labelDe: 'Sterische Hülle',   labelEn: 'steric shell',    dash: true },
      { a: 'antioxidans',      b: 'mos2',            labelDe: 'Oxidationsschutz',  labelEn: 'oxidation guard', dash: true },
      { a: 'matrix',           b: 'mos2',            labelDe: 'Thermostabilität',  labelEn: 'thermal stability' },
      { a: 'antioxidans',      b: 'kristallstruktur', labelDe: 'Matrixschutz',    labelEn: 'matrix guard',    dash: true },
    ],
  },
  classic: {
    nodes: [
      { id: 'kristallstruktur', x: 230, y: 86,  big: true }, // Paraffin (matrix hub)
      { id: 'winterformel',     x: 96,  y: 200 },            // Mikrokristallin
      { id: 'haftung',          x: 364, y: 200 },            // Stearin
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
