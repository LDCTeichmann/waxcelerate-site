# Conversion & Usability — Recherche-Runde 2

**Erstellt:** 19.08.2026, Sonnet 5. Zweite Recherche-Runde, bewusst auf Themen
beschränkt, die `docs/plaene/NAVIGATION_UX_PLAN.md` noch nicht abdeckt
(Navigation, Trust-Placement-Grundlagen, Rabattstaffeln, Informationstiefe,
Checkout-Choice-Overload, Aesthetic-Usability-Effect, Slider-Grundlagen —
alles dort nachlesen, nicht hier wiederholt).

**Quellenkritik wie im ersten Durchgang:** mehrere kursierende Zahlen (ASOS-
Bildanzahl, "Lifestyle-Fotos +22–30%", Cart-Drawer-A/B-Werte) tauchten
wortgleich auf mehreren SEO-Content-Farmen auf, ohne auffindbare Primärquelle
— klassisches Zeichen für zirkulär abgeschriebene Pseudo-Statistik. Diese sind
unten explizit als **[unverifiziert]** markiert, nicht als Fakt übernommen.

🔨 = kann ich einfach bauen · 🤔 = Empfehlung, kurz bestätigen · 🙋 = nur du ·
✅ = bereits gut

---

## 1. Produktfotografie

- 🔨 **Maßstabsbild fehlt.** [Baymard, belegt] 42% der Nutzer schätzen
  Produktgröße aus Fotos ab und brechen bei Fehleinschätzung ab; 28% der
  großen Sites liefern kein Größenvergleichsbild. Waxcelerate-Dosen/-Flaschen
  haben aktuell keinen Größenvergleich (Hand hält Dose, Lineal o.ä.).
- 🔨 **Bildunterschriften bei Mikroskopie-Bildern.** [Baymard, belegt] 52%
  der Sites erklären nicht, was genau im Bild zu sehen ist. Eine Zeile
  ("Wachsschicht bei 50-facher Vergrößerung, trocken") macht die Aussage für
  Laien nachvollziehbar.
- ✅/🔨 **Zoom/Pinch auf Mobile geprüft.** [Baymard, belegt] 40% der
  Mobile-Sites unterstützen keine Pinch/Tap-Gesten auf Produktbildern.
  Geprüft: `viewport`-Meta erlaubt bereits System-Pinch-Zoom (kein
  `user-scalable=no`/`maximum-scale`, keine `touch-action`-Sperre gefunden).
  Zusätzlich existiert bereits ein `ImageLightbox`-Tap-to-enlarge auf der
  Produktseite (größeres Bild, `srcSetFor`/`lg()` liefern hochauflösende
  Varianten). Echtes In-Bild-Pinch-to-Zoom (Finger-Geste direkt auf dem
  Bild, nicht nur System-Zoom) habe ich bewusst NICHT gebaut — Multi-Touch-
  Gestenlogik lässt sich in dieser Umgebung nicht auf einem echten Touch-
  Gerät verifizieren (die Browser-Pane-Mobile-Emulation übersetzt nur
  Maus-zu-Touch, kein echtes Multi-Touch), und ungetestete Gestenlogik
  auf den Live-Server zu schieben ist genau das Risiko, das vermieden
  werden sollte. Für die Mikroskopie-Bilder auf `/wissenschaft` zusätzlich:
  diese Seite wird gerade parallel in einer anderen Session bearbeitet,
  dort in dieser Runde bewusst nichts angefasst.
- ✅ **56% der Nutzer starten die Produktseite mit dem Bild**, nicht dem Text
  [Baymard]. Aktuelle Seite zeigt Bild bereits prominent oben — kein
  Änderungsbedarf, nur zur Bestätigung der bestehenden Struktur.
- Verworfen: "Lifestyle-Fotos schlagen Studio-Fotos um 22–30%" **[unverifiziert,
  keine Primärquelle auffindbar]**. Richtung plausibel (Kombination aus
  Studio- und Anwendungsfoto), aber keine Zahl, die man Luca als Beleg
  vorlegen sollte.

## 2. Warenkorb/Checkout (relevant sobald Stripe live geht)

- 🤔 **Versandkosten so früh wie möglich zeigen — der größte Einzelhebel in
  diesem ganzen Block.** [Baymard, stark belegt] ~70% Cart-Abandonment
  branchenweit, 48% davon wegen "extra costs too high" — der häufigste
  Einzelgrund überhaupt. Sobald der Checkout gebaut wird: Versandkosten auf
  der Produktseite oder spätestens im Warenkorb zeigen, nicht erst am Ende.
- 🤔 **Gast-Checkout ohne Konto-Pflicht.** [Baymard] 26% brechen wegen
  Konto-Zwang ab. Bei Stripe-Umsetzung mitdenken.
- ✅ **Wenige Formularfelder sind bei Waxcelerates kleinem Sortiment
  natürlich gegeben** — kein zusätzlicher Eingriff nötig, aber beim
  Checkout-Bau nicht durch unnötige Zusatzfelder wieder aufblähen.
- Verworfen: Cart-Drawer-vs.-Cart-Page-Prozentzahlen **[unverifiziert]** —
  Baymard selbst sagt, das ist kontextabhängig und nicht pauschal
  entscheidbar. Bei Waxcelerates winzigem Katalog vermutlich zweitrangig
  gegenüber der Kostentransparenz-Frage oben.

## 3. Formulare (jetzt schon relevant, nicht erst bei Stripe)

`WiderrufPage.tsx` hat bereits ein echtes Formular (orderNumber, orderDate,
product, email) mit Labels und `type="email"` — geprüft, im Kern schon
richtig gebaut. Kleine Lücke:

- 🔨 **`autoComplete`-Attribute ergänzen** (z. B. `autoComplete="email"` auf
  dem E-Mail-Feld). [Baymard, belegt] `autocomplete="off"` zu setzen wäre ein
  Fehler — hier fehlt das Attribut schlicht, kein Fehlverhalten, nur eine
  kleine Verbesserung. Aufwand trivial.
- 🤔 **Für den künftigen Stripe-Checkout vormerken:** `inputmode="numeric"`
  bei Zahlungsfeldern, Fehlermeldungen beim Feld-Verlassen statt erst beim
  Absenden zeigen, Label bleibt bei Validierungsfehler sichtbar. Keine Aktion
  jetzt, nur nicht vergessen — analog zum Stripe-Vormerkpunkt in
  `NAVIGATION_UX_PLAN.md` 2.3.

## 4. Ladezeit/Performance

- 🔨 **Bildgewicht statt Bildanzahl prüfen.** [Google/SOASTA-Studie,
  900.000 Landingpages, belegt] 53% verlassen eine Mobile-Seite nach >3s
  Ladezeit; Seiten mit ≤5s Ladezeit erzielen doppelt so viel Umsatz wie
  19s-Seiten. Konvertierende Sessions hatten 38% weniger Bilder als
  nicht-konvertierende — nicht "weniger Bilder zeigen", sondern
  unkomprimierte/blockierende Assets sind das eigentliche Problem. Konkret:
  WebP/AVIF durchgängig, responsive `srcset`, Above-the-fold priorisieren.
- Kein belastbarer Befund zu "GSAP-Animationen und Conversion" speziell —
  das ist ein technisches Performance-Thema (Lighthouse LCP/INP/CLS), kein
  eigenständig erforschtes Conversion-Feld. Direkt technisch prüfbar statt
  auf weitere Forschung zu warten.

## 5. Soziale Bewährtheit jenseits der Bewertungsanzahl

- 🤔 **"Kürzlich verkauft"-Hinweise nur mit echten Daten, und nur wenn genug
  Volumen da ist.** [Journal of Retailing Meta-Analyse, 416 Effektgrößen,
  belegt] Demand-basierte Knappheit wirkt bei utilitaristischen Produkten
  (Kettenwachs passt) am stärksten — aber bei einem Ein-Personen-Betrieb mit
  überschaubarem Volumen wirkt eine dünne "3 Leute haben das diese Woche
  gekauft"-Anzeige eher unglaubwürdig als überzeugend. Nur umsetzen, wenn die
  echte Verkaufsfrequenz das hergibt.
- 🙋 **Rechtlich hart, nicht nur Stilfrage: keine Fake-Countdown-Timer, keine
  erfundenen Lagerbestände.** [Wettbewerbszentrale, EU-Parlament EPRS-Studie,
  belegt] LG Düsseldorf hat im September 2025 genau das abgemahnt (Fake-
  Countdown + falsche "nur noch 17 Stück"-Angabe). Passt ohnehin zur
  "ehrliche Marke"-Positionierung, aber wichtig zu wissen: das ist kein
  Graubereich, sondern bereits gerichtlich sanktioniert.
- ✅ **Mengenbasierte Signale (echte niedrige Lagerbestände) schlagen
  Countdown-Timer** in mehreren zitierten Studien systematisch — falls
  irgendwann Knappheit kommuniziert werden soll, echte Stückzahl statt
  Zeitdruck.
- Verworfen: nutzergenerierte Foto-Bewertungen "+100% Interaktion"
  **[Vendor-eigene Studien von Bazaarvoice/PowerReviews, Interessenkonflikt]**
  — Richtung plausibel, Zahl nicht belastbar genug für eine Entscheidung.

## 6. Barrierefreiheit — der am klarsten actionable Fund dieser Runde

- 🔨 **Fünf-Punkte-Basis-Check, deckt 96% aller real gefundenen Probleme ab.**
  [WebAIM Million Report, 1 Mio. Homepages untersucht, sehr stark belegt]
  Farbkontrast (83,9% der Sites betroffen), fehlende Alt-Texte (53,1%),
  unbeschriftete Formularfelder (51%), unklare Linktexte (46,3%),
  unbeschriftete Buttons (30,6%). Konkrete, kurze Prüfliste — kein
  Ratespiel, sondern eine Reihenfolge nach realer Häufigkeit.
- 🙋/🔨 **Wichtigste Einordnung: Accessibility-Mängel kosten lautlos Umsatz.**
  [Click-Away-Pound-Studie 2019, UK, echte Primärquelle mit PDF] 69% der
  Nutzer mit Behinderung verlassen eine schwer nutzbare Seite sofort, ohne es
  zu melden (nur 8% geben Feedback). Bei einem Solo-Betrieb ohne
  systematisches Monitoring ist das der Grund, warum dieses Problem sonst nie
  auffällt — niemand beschwert sich, der Umsatz fehlt einfach lautlos. Ich
  kann den Fünf-Punkte-Check selbst durchführen (🔨); ob/wie tief
  nachgebessert wird, ist eine Aufwand-Frage, die du priorisieren solltest.

## 7. Ethische Dringlichkeit — Zusammenfassung

Deckt sich mit Punkt 5 oben: echte, nicht-manipulierte Dringlichkeit wirkt
nachweislich (Loss-Aversion, Tversky & Kahneman) — der Unterschied zwischen
legitim und riskant ist nicht die Darstellungsform, sondern ob die
zugrundeliegende Zahl/Frist tatsächlich stimmt und sich bei Nichtzutreffen
nicht "zurücksetzt". Kein neuer Punkt gegenüber 5, nur die saubere
Trennlinie, falls das Thema später konkret wird.

---

## Kurzfazit

Am stärksten belegt in dieser Runde: Baymard zu Cart-Abandonment (48% wegen
Versandkosten), WebAIM-Fehlerverteilung, Click-Away-Pound-Studie,
Google/SOASTA-Ladezeitstudie, Journal-of-Retailing-Meta-Analyse zu
Knappheit, die deutsche Rechtslage zu Fake-Countdowns. Am schwächsten/verworfen:
ASOS-Bildzahl, Lifestyle-Foto-Prozentsatz, Cart-Drawer-A/B-Werte,
UGC-Foto-Interaktionsrate (Vendor-Studien).
