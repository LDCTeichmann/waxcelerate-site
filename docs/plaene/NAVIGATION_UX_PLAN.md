# Navigation, Usability & Conversion — Recherche und Plan

**Erstellt:** 19.08.2026, Sonnet 5. Auslöser: Lucas wiederholte Frage (zweimal
über zwei frühere Sessions notiert, nie bearbeitet), ob recherchiert wurde, was
bei Navigation/Bedienbarkeit tatsächlich funktioniert — nicht nur "sieht gut
aus", sondern belegt wirkt und zur Conversion beiträgt.

**Methode:** Zwei parallele Recherche-Durchgänge (Navigation/IA, Conversion/
Affordance) gegen Primärquellen — Baymard Institute, Nielsen Norman Group,
vereinzelt Spiegel Research Center — plus ein eigener Code-Audit der
tatsächlich gebauten Seite. Beide Agents wurden angewiesen, unbestätigte
KI-Zusammenfassungen und Sekundärquellen-Zahlen explizit als solche zu
kennzeichnen statt sie als Fakt auszugeben. Das ist im Text unten mit
**[stark belegt]** / **[Sekundärquelle, Vorsicht]** / **[keine Studie
gefunden, eigene Ableitung]** markiert — nimm diese Kennzeichnung ernst, sie
ist der Punkt der ganzen Übung.

**Wie du das liest:** 🔨 = kann ich einfach bauen, kein Risiko. 🤔 = ich habe
eine Empfehlung, aber du solltest sie kurz bestätigen. 🙋 = nur du kannst das
entscheiden oder liefern. ✅ = geprüft und bereits richtig, keine Aktion nötig.

---

## 0. Bereits richtig — durch Recherche bestätigt, nicht anfassen

Das hier ist genauso wichtig wie die Lücken unten: mehrere bewusste
Entscheidungen dieser Seite sind nicht nur "vertretbar", sondern die
forschungsgestützte Best Practice — sie wirken vermutlich zufällig richtig,
weil gesunder Menschenverstand hier mit der Forschung übereinstimmt.

- ✅ **Keine Suchleiste.** Baymard hat in großangelegten DTC-Site-Tests Suche
  bei kleinen, fokussierten Katalogen als vernachlässigbar eingestuft und
  empfiehlt explizit, das Budget stattdessen in Content zu stecken. Bei ~4
  Wachs-Varianten + 8 Ketten ist das exakt Waxcelerates Fall. **[stark
  belegt, Baymard "DTC UX"]**
- ✅ **Keine Produktfilter im Wachs-Regal.** Gleiche Logik — Filter reduzieren
  große Listen auf handhabbare Größe, bei einer bereits kleinen Liste stiften
  sie eher Verwirrung. Die Kettenliste hat bewusst Filter (Geschwindigkeit/
  Marke) — das ist der einzige Bereich mit genug SKUs (8), wo das Sinn
  ergibt, und genau dort ist es auch gebaut.
- ✅ **Ratgeber-Panel statt Mega-Menü.** NN/g: Gruppen sollten nach
  Nutzer-Mentalmodellen geordnet sein, mit einer Kontextzeile pro Punkt statt
  reiner Label-Liste — komplexe Widgets gehören nicht ins Menü. Das
  Ratgeber-Panel (Tools/Anleitungen/FAQ/Blog, je mit Beschreibungszeile) trifft
  das exakt. Ein vollwertiges Mega-Menü wäre bei dieser Kataloggröße Overkill.
  **[stark belegt, NN/g "Mega Menus Work Well"]**
- ✅ **Hamburger-Menü auf Mobile.** NN/g bestätigt einen Discoverability-
  Nachteil gegenüber sichtbarer Navigation, nennt Hamburger aber explizit
  akzeptabel für "browse-mostly"-Sites mit begrenztem Screen-Real-Estate.
  Waxcelerates redaktioneller Zeitschriften-Look verträgt keine App-artige
  Bottom-Tab-Bar (die laut NN/g die Alternative bei ≤5 Punkten wäre) — das
  Hamburger-Menü ist hier der stimmigere Kompromiss.
- ✅ **Wachs-Staffel als Fließtext, nicht als Prozent-Badge.**
  (`multiDiscount`: "Wachs-Staffel: 2 Stk. 5% · 3 Stk. 10% · ab 5 Stk. 15%").
  Trifft ziemlich genau den Mittelweg, den die Recherche als Ableitung
  vorschlägt: Information ohne Sale-Optik, die das Preisbild beschädigen
  würde. Kein Handlungsbedarf.
- ✅ **Wachs direkt im Regal, nur die Kettenliste klappt auf.** Baymards
  Warnung vor "Intermediary Category Pages" (31% Scheiternsrate in Tests)
  betrifft reine Zwischenseiten ohne Produkte. Das ist hier nicht der Fall —
  das Wachs-Regal zeigt die Produkte direkt, nur die längere Kettenliste ist
  hinter einem Klick. Kein Risiko in der aktuellen Form.
- ✅ **Mikroskop-Slider zieht sich nach erster Interaktion zurück.** Baymards
  Slider-Forschung (>50% Fehlinterpretation von Drag-Handles ohne klares
  Signal) und die Habituations-Logik sprechen dafür, dass ein Dauer-Hinweis
  nach der ersten echten Nutzung verschwinden sollte. Das ist laut
  Session-Historie bereits genau so gebaut (Puls + Hand-Cursor stoppen
  dauerhaft bei erstem Drag/Tap/Pfeiltaste). Keine Aktion.

---

## 1. 🔨 Sofort umsetzbar — kein Risiko, keine Rückfrage nötig

### 1.1 Footer fehlt auf 5 von 7 Unterseiten-Typen — höchste Priorität

**Eigener Code-Fund, nicht aus der externen Recherche:** `<Footer />` wird
aktuell nur auf der Startseite und der Produktdetailseite gerendert. Blog-Index,
Blog-Artikel, `/wissenschaft`, `/kette-wachsen-lassen` und `/starter-set` haben
**keinen** Footer. Das heißt: Impressum, Datenschutz, AGB, Widerrufsbelehrung
sind von diesen fünf Seitentypen aus nicht erreichbar, ohne erst zur
Startseite zurückzugehen.

Das ist doppelt problematisch:
- **UX:** Baymards Breadcrumb-Forschung zeigt, dass das Fehlen von
  Orientierungs-/Ausweg-Elementen der Problemfall ist, in dem die meisten
  großen Sites versagen (94% bei Fehlen beider Breadcrumb-Typen). Diese Seiten
  sind aktuell echte Sackgassen.
- **Rechtlich:** Impressumspflicht in Deutschland verlangt leichte
  Erreichbarkeit "auf jeder Seite" — ein Impressum, das nur von 2 von 7
  Seitentypen aus erreichbar ist, ist angreifbar.

**Aufwand klein, Risiko null** — `<Footer />` ist eine fertige Komponente,
muss nur in 5 Dateien eingebunden werden (`BlogIndexPage.tsx`,
`BlogArticlePage.tsx`, `SciencePage.tsx`, `RewaxPage.tsx`,
`StarterSetPage.tsx`).

### 1.2 ~~Preis pro Einheit fehlt~~ · Korrektur: existiert bereits

**Ursprünglich als Lücke notiert, bei der Umsetzung widerlegt.** Mein
`grep` hatte nach `€/g` gesucht und nichts gefunden — tatsächlich zeigt die
Seite den Grundpreis bereits als **€/100g**, sowohl auf der Produktkarte
(`ProductShelf.tsx`, Variable `per100`) als auch auf der Detailseite
(`ProductDetailPage.tsx`, Variable `per100g`, an zwei Stellen gerendert).
€/100g ist bei diesen Packungsgrößen ohnehin die sinnvollere Einheit als
€/g (vermeidet unhandliche Nachkommastellen). **Kein Handlungsbedarf** —
Baymards Empfehlung (Grundpreis sichtbar machen) ist bereits erfüllt.

### 1.3 Hover-Delay am Ratgeber-Panel prüfen

**[stark belegt, Baymard]:** 88% der Top-Sites mit Hover-Menüs nutzen ein
~0,3–0,5s Delay vor dem Öffnen, sonst Flackern bei zufälligem Drüberfahren.
Falls das Ratgeber-Panel aktuell per Klick statt Hover öffnet (laut Code:
`onClick={() => setIsResourcesOpen(v => !v)}` — es ist bereits klickbasiert,
nicht Hover), ist das ohnehin kein Thema. **Keine Aktion nötig, hier zur
Vollständigkeit geprüft und verworfen.**

---

## 2. 🤔 Empfehlung mit Begründung — bitte kurz bestätigen

### 2.1 eBay-Vertrauenssignal näher an den Kaufpunkt

**[stark belegt, Baymard "perceived security"]:** Vertrauen ist lokal, nicht
global — ein Trust-Signal in der Fußzeile überträgt sich nicht automatisch auf
den Kaufmoment. **[Sekundärquelle, Vorsicht]:** Bei unbekannten Marken wirken
Gütesiegel/Vertrauenssignale überproportional stärker als bei etablierten
Marken (österreichische Gütezeichen-Studie 2020, mit Vorbehalt zitiert).

Aktuell steht "200+ Bewertungen · Versand aus Stuttgart · eBay-Käuferschutz"
in der Abschluss-CTA-Zeile ganz unten — richtig positioniert für den
allerletzten Moment, aber nicht direkt am Kaufbutton auf der Produktkarte
selbst, wo die eigentliche Entscheidung fällt.

**Vorschlag:** eBay-Bewertungszahl (oder ein kompakter Verweis darauf) direkt
bei der Produktkarte/dem "Jetzt kaufen"-Button wiederholen, nicht nur global.
**[Spiegel Research Center, gut abgesichert]:** Bei 200+ Bewertungen ist der
Grenznutzen weiterer Bewertungen gering — der Hebel liegt nicht in mehr
Bewertungen, sondern darin, dass die vorhandene Zahl am Kaufpunkt sichtbar
ist, bevor jemand zu eBay wechselt.

*Warum Rückfrage:* Das ist ein Platzierungs-Eingriff in bereits fein
abgestimmte Kartenlayouts (`ProductShelf.tsx`) — technisch klein, aber ich
will nicht ungefragt an einem Layout drehen, an dem laut Session-Historie
schon mehrfach gefeilt wurde.

### 2.2 Einfache Rück-Affordance dort ergänzen, wo sie fehlt

Die meisten Unterseiten haben bereits einen Rückweg (Rewax, Wissenschaft,
Starter-Set: "Zurück zur Startseite"; Blog-Artikel: "Zurück zum Blog";
Produktdetail: echter Breadcrumb). Die Lücke ist kleiner als die externe
Recherche zunächst vermuten ließ — der Haupt-Fund ist wirklich 1.1 (Footer),
nicht ein flächendeckendes Breadcrumb-Problem.

**Vorschlag:** Kein voller hierarchischer Breadcrumb-Ausbau nötig (die IA ist
flach genug, dass sich der Aufwand laut Baymards eigener Einschränkung nicht
lohnt — der Hauptnutzen von Breadcrumbs ist Filterzustands-Erhalt, den
Waxcelerate mangels Filtern kaum braucht). Stattdessen: Blog-Index bekommt
zusätzlich zum Logo-Link eine sichtbare "Zurück zur Startseite"-Zeile, analog
zu den anderen Unterseiten, für Konsistenz.

### 2.3 Zwei-Kaufwege-Problem vormerken, bevor Stripe live geht

**[stark belegt, Baymard-Amazon-Beispiel + Accenture-Studie zu Choice
Overload]:** Mehrere gleichrangige primäre Handlungsaufforderungen auf einer
Produktseite erzeugen nachweislich Zögern. Aktuell ist die Seite eindeutig
(nur eBay-Weg sichtbar) — das ist laut dieser Forschung korrekt. Das Risiko
entsteht erst in dem Moment, in dem der Stripe-Checkout live geht und beide
Wege gleichzeitig sichtbar werden.

**Vorschlag, schon jetzt festhalten:** Wenn Stripe scharfgeschaltet wird
(`docs/plaene/UX_UPGRADE_PLAN.md` Phase 6), sollte einer der beiden Wege
eindeutig primär sein (z. B. Direktkauf als Hauptbutton, eBay als
sekundärer, kleinerer Link "oder bei eBay kaufen") statt zwei gleich
gewichteter Buttons. Keine Aktion jetzt — nur ein Punkt, der in der
Stripe-Umsetzung selbst mitgedacht werden muss, sonst wird ein heute
korrekter Zustand beim Checkout-Launch versehentlich kaputtgemacht.

---

## 3. 🙋 Nur du kannst das — Entscheidung oder Material nötig

### 3.1 Echtes Vorher-Nachher-Foto bleibt der größte Hebel

Das war schon vor dieser Recherche als größte Lücke bekannt (`PROJECT.md`).
Die Recherche bestätigt es nochmal von einer anderen Seite: **[keine Studie
gefunden zu Slider-vs.-statisch, ehrliche Lücke]** — es gibt keine belastbare
Forschung, die einen interaktiven Slider gegen ein einfaches Bildpaar
ausspielt. Der eigentliche Hebel ist nicht die Interaktionsform, sondern dass
ein **echtes Foto einer geölten vs. gewachsten Kette überhaupt existiert** —
die Mikroskopie-Aufnahmen sind wissenschaftlich stark, aber abstrakt; ein
Laie kann sie nicht an seinem eigenen Rad nachprüfen. `ComparisonSlider` liegt
fertig und ungenutzt, wartet nur auf das Bildpaar.

*Keine neue Erkenntnis, aber jetzt mit einer klaren Begründung, warum die
Interaktionsform zweitrangig ist — falls das die Prioritätsfrage "erst
Foto besorgen oder erst Slider polieren" für dich vereinfacht.*

### 3.2 Rewax-Reminder mit verkürztem Wiederkauf-Pfad

**[Praxisliteratur, keine akademische Studie, aber konsistent]:** Manuelle
Replenishment-Reminder verpuffen häufig, weil sie zurück auf die normale
Produktseite verlinken und den ganzen Kaufweg neu verlangen. Ein
Ein-Klick-Nachbestell-Link (vorausgefüllter Warenkorb/direkte
WhatsApp-Nachricht mit Kontext) wäre laut dieser Logik deutlich wirksamer.

**Offenes Problem, das keine Forschung löst:** Das Wachs-Wechselintervall ist
kilometerabhängig, nicht zeitabhängig — ein klassischer Kalender-Reminder
("nach 60 Tagen") passt strukturell nicht. Der bereits vorhandene Rechner
könnte hier die eigentliche Lösung sein (Nutzer gibt Kilometerleistung ein,
bekommt ein Datum statt eine Pauschale) — aber ob/wie ein Reminder-System
überhaupt gebaut werden soll (E-Mail? Kein Newsletter-System vorhanden bisher)
ist eine Entscheidung, die außerhalb des Seiten-Codes liegt.

### 3.3 Über-mich-Fakten prüfen

**[stark belegt, NN/g Trust-and-Credibility-Report]:** Nutzer suchen aktiv
"Über mich"-Seiten in der frühen Vertrauensbildung, aber echte Glaubwürdigkeit
entsteht durch überprüfbare Fakten, nicht durch Markenerzählung. Die Sektion
ist strukturell richtig platziert (früh im Scroll-Pfad). Prüf selbst: stehen
dort konkrete, nachprüfbare Zahlen (Betriebsdauer, Anzahl gewachster Ketten,
Standort), oder ist es eher erzählerisch? Das kann ich nicht aus dem Code
beurteilen, das ist eine inhaltliche Einschätzung.

---

## 4. Eingeordnet, aber bewusst nicht empfohlen

Damit hier nichts verschwiegen wird, was recherchiert, aber verworfen wurde:

- **Bottom-Tab-Bar statt Hamburger auf Mobile** — technisch möglich bei ≤5
  Hauptpunkten, aber passt nicht zum redaktionellen Look. Verworfen.
- **Mega-Menü statt Ratgeber-Panel** — bei dieser Kataloggröße unnötig,
  NN/g warnt sogar explizit davor, Dinge ins Menü zu packen, "nur weil man
  kann". Verworfen.
- **Sticky-Add-to-Cart-Forschung** — die einzige gefundene Zahl (+7,9%
  Abschlüsse) stammt aus einem einzelnen A/B-Test einer Agentur, keine
  Instituts-Studie. Nicht belastbar genug, um daraus eine Änderung
  abzuleiten — der bestehende Sticky-Mobile-CTA bleibt, aber nicht *weil*
  diese Zahl es beweist, sondern weil er allgemeiner Konvention entspricht.
- **Konkrete "Genius"-Navigationsbeispiele einzelner Marken** (Rapha, Aesop,
  Le Labo) — die Recherche fand dazu keine belastbare UX-Kritik, nur
  Markenbeschreibungen. Der Agent hat sich bewusst geweigert, sich Aussagen
  dazu auszudenken. Falls das noch gewünscht ist: eigene, gezielte
  Recherche mit direktem Abruf einzelner Live-Sites, nicht allgemeine
  Websuche — das wäre ein separater Auftrag.

---

## 5. Empfohlene Reihenfolge

1. **1.1 Footer auf 5 Unterseiten** — größter Fund, kleinster Aufwand, auch
   rechtlich relevant. Zuerst.
2. **1.2 Preis pro Einheit** — klein, unabhängig, kein Designrisiko.
3. **2.2 Blog-Index Rückweg** — trivial, rundet 1.1 ab.
4. **2.1 eBay-Signal am Kaufpunkt** — etwas mehr Layout-Feingefühl, kurze
   Bestätigung von dir sinnvoll.
5. **2.3 Merken für Stripe-Launch** — keine Aktion jetzt, nur nicht
   vergessen, wenn Phase 6 aus `UX_UPGRADE_PLAN.md` angegangen wird.
6. **3.x** — liegt bei dir (Foto, Reminder-System, Über-mich-Fakten).

---

## Anhang — Quellen mit Fundstelle (was direkt verifiziert wurde)

- Baymard, "DTC UX: Avoid Intermediary Category Pages" — baymard.com/blog/dtc-avoid-intermediary-category-pages
- Baymard, "Slider Interfaces" — baymard.com/blog/slider-interfaces
- Baymard, "E-Commerce Breadcrumbs" — baymard.com/blog/ecommerce-breadcrumbs
- Baymard, "Perceived Security of Payment Form" / "Customers Perceive Only Parts of a Checkout Page as Secure"
- Baymard, "Site Seal Trust" — baymard.com/blog/site-seal-trust
- Baymard, "Product Page Price Discounts" — baymard.com/blog/product-page-price-discounts
- Baymard, "Price Per Unit" — baymard.com/blog/price-per-unit
- NN/g, "Mega Menus Work Well for Site Navigation" — nngroup.com/articles/mega-menus-work-well
- NN/g, "Hamburger Menus" — nngroup.com/articles/hamburger-menus
- NN/g, "Basic Patterns for Mobile Navigation: A Primer" — nngroup.com/articles/mobile-navigation-patterns
- NN/g, "Aesthetic-Usability Effect" (Kurosu & Kashimura 1995) — nngroup.com/articles/aesthetic-usability-effect
- NN/g, "After the Buy Button in E-Commerce" — nngroup.com/articles/after-the-buy-button-in-e-commerce
- Spiegel Research Center (Northwestern), Review-Count-zu-Conversion-Zahlen — über Sekundärquellen konsistent zitiert, nicht direkt gefetcht

Alles, was nicht in dieser Liste steht, aber oben im Text vorkommt, ist explizit
als Sekundärquelle oder eigene Ableitung markiert — siehe Kennzeichnung im
Fließtext.
