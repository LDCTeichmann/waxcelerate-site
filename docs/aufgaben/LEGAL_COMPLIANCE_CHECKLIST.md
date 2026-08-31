# Rechts-Compliance-Checkliste — Waxcelerate

**Für:** Luca. **Stand:** 31. August 2026 (aktualisiert nach Phase 2:
Gmail-Recherche zu Rohstofflieferanten, Produkthaftpflicht-Vergleich,
Website-Umsetzung).

> Ich bin kein Anwalt, das hier ist keine Rechtsberatung. Es ist eine
> recherchierte, quellenbelegte Übersicht über alle rechtlichen Baustellen
> rund um Website, Produkte und Vertriebskanäle — damit du siehst, was
> Pflicht ist, was optional, was schon erledigt ist und was ich für dich
> übernehmen kann. Bei allem, wo eine Unterschrift, ein Vertrag oder Geld
> von deinem Konto nötig ist, musst du selbst ran; ich sage dir aber genau
> wo und wie.

**Verwandte Dokumente, hier konsolidiert statt dupliziert:**
`docs/aufgaben/RECHTSTEXTE.md` (Website-Pflichttexte im Detail),
`docs/aufgaben/LUCA_TODO.md` (SEO/Sichtbarkeit, D1/D2 = Kleinanzeigen-/
eBay-Impressum bereits erledigt), Skill-Referenzen `10_business_core.md`,
`40_technical_kb.md`, `95_open_questions.md`.

**Wie du diese Liste liest:** Jeder Block hat denselben Aufbau — Status-
Check, was das Gesetz verlangt (mit Quelle), was bei Nichtbeachtung droht,
und zwei Spalten: *das erledige/recherchiere ich für dich* und *das kannst
nur du*. Ganz unten steht die priorisierte Gesamttabelle.

---

## 0. Sofort wichtig — die 5 dringendsten Punkte

**Update Phase 2:** Punkte 3–5 aus der ursprünglichen Liste sind erledigt
(Website-Code gebaut bzw. Gewerbeanmeldung bestätigt) — hier die aktuell
dringendsten:

| # | Was | Warum dringend | Risiko |
|---|---|---|---|
| 1 | **LUCID-Registrierung + duales System** | Ohne Bagatellgrenze Pflicht seit 1.7.2022, sobald du verpackte Ware in DE in Verkehr bringst — du tust das seit 2024. Verpackung ist jetzt bekannt (Karton, selten Luftpolsterfolie) | Bußgeld bis 200.000 € **+ sofortiges Vertriebsverbot** |
| 2 | **Produkthaftpflichtversicherung abschließen** | Vergleich liegt jetzt vor (Abschnitt 3) — nur noch deine Entscheidung + Abschluss | Ohne Versicherung haftest du privat und unbegrenzt |
| 3 | **PTFE-/GMS-/BHT-Lieferanten benennen** | Gmail-Suche hat MoS₂ (Werth-Metall) und Paraffinwachs (DistrEbution) gefunden, aber nicht die anderen Formel-Bestandteile — ohne sie ist die CLP-Einschätzung für Classic nur teilweise möglich | SDB-/Kennzeichnungspflicht bleibt für einen Teil der Formel ungeklärt |
| 4 | **AGB-Entscheidung treffen** | Seite ist seit Phase 1 als "in Überarbeitung" markiert; Website-Code ist jetzt sonst fertig — AGB sind der letzte offene Website-Baustein | Falsche/halbfertige AGB sind schlechter als gar keine (siehe RECHTSTEXTE.md) |
| 5 | **Kleinanzeigen-Impressum korrigieren** | Du hast selbst gesagt, es sei "nicht vollständig" — widerspricht dem bisherigen Stand in LUCA_TODO.md D1 | Abmahnrisiko wie jedes fehlende Marktplatz-Impressum |

---

## 1. Unternehmensform & Steuern

### Status-Check
- Rechtsform laut Business Core: Einzelunternehmen, Kleinunternehmer
  §19 UStG. **Bestätigt (Phase 2):** Gewerbeanmeldung ist beim Gewerbeamt
  Stuttgart erfolgt.
- Impressum (`ImpressumPage.tsx`) verweist korrekt auf §19 UStG,
  keine USt-IdNr. angegeben — konsistent mit Kleinunternehmerstatus.

### Rechtliche Anforderung (Stand 2026)
- **Kleinunternehmerregelung, neue Schwellen seit 1.1.2025:** ≤ 25.000 €
  Vorjahresumsatz **und** ≤ 100.000 € laufendes Jahr (vorher 22.000 € /
  50.000 €). Wird die 100.000-€-Grenze unterjährig gerissen, endet der
  Status **sofort ab dem überschreitenden Umsatz** — nicht mehr erst zum
  Jahresende wie früher. [Kleinunternehmerregelung 2026](https://www.mehrwertsteuerrechner.de/kleinunternehmerregelung/), [IHK Stuttgart](https://www.ihk.de/stuttgart/fuer-unternehmen/recht-und-steuern/steuerrecht/umsatzsteuer-national/kleinunternehmerregelung-in-der-umsatzsteuer-1843632)
- Seit 2025 keine USt-Voranmeldung und keine USt-Jahreserklärung mehr
  für Kleinunternehmer nötig — administrative Erleichterung.
- **EU-Kleinunternehmerregelung** seit 1.1.2025 in Kraft: eigene
  KU-IdNr. beim BZSt nötig, *bevor* du grenzüberschreitend (z. B. nach
  Österreich, Stichwort Wien-B2B) ohne USt fakturierst.
- Gewerbeanmeldung ist unabhängig von der Umsatzsteuerfrage Pflicht für
  jede gewerbliche Tätigkeit (Herstellung + Verkauf von Waren) —
  Gewerbeamt Stuttgart, einmalig ca. 20–65 €.

### Risiko bei Nichteinhaltung
- Fehlende Gewerbeanmeldung: Bußgeld, rückwirkende Gewerbesteuerschätzung,
  Problem bei Bank/Versicherung (siehe Block 3).
- Grenze überschritten, aber weiter ohne USt fakturiert: Nachzahlung der
  Umsatzsteuer aus eigener Tasche (Kunden zahlen ja nicht rückwirkend
  mehr), ggf. Steuerhinterziehungs-Vorwurf bei Vorsatz.

### Nächste Schritte — von Claude erledigbar
- Quartalsweise eine kurze Umsatz-Grenzwert-Prüfung anbieten (auf
  Zuruf: aktuellen Jahresumsatz nennen, ich sage dir wo du stehst).
- KU-IdNr.-Beantragungsablauf beim BZSt für dich zusammenfassen, sobald
  Österreich-B2B konkret ansteht (Wien-Shops laut B2B-Masterplan in
  Anbahnung).

### Nächste Schritte — nur von dir
- Aktuellen Jahresumsatz (2026 laufend) grob nennen, damit die
  25.000-/100.000-€-Grenze im Blick bleibt.

**Status:** ✅ Gewerbeanmeldung bestätigt · ✅ Kleinunternehmerstatus im
Impressum korrekt ausgewiesen

---

## 2. Website-Pflichtangaben (E-Commerce-Recht)

### Status-Check (Code gegengelesen — Phase 2: alles unten außer AGB jetzt umgesetzt)
| Pflicht | Ist-Zustand im Repo |
|---|---|
| Impressum §5 TMG | ✅ `ImpressumPage.tsx` — vollständig (Name, Anschrift, E-Mail, USt-Hinweis) |
| Datenschutzerklärung | ✅ `DatenschutzPage.tsx` behandelt Stripe, Vercel-Hosting, DSGVO-Rechte **und jetzt einen eigenen Absatz zu Vercel Analytics** (cookiefrei, drei anonyme Events, keine IP-Speicherung, Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO) |
| Widerrufsbelehrung | ✅ `WiderrufsbelehrungPage.tsx` enthält jetzt den vollständigen Text von Anlage 1 EGBGB (Widerrufsrecht, Fristbeginn bei Warenkauf, Folgen des Widerrufs), ausgefüllt mit Waxcelerates Daten |
| Muster-Widerrufsformular | ✅ vollständiger Text von Anlage 2 EGBGB jetzt auf derselben Seite, mit Waxcelerates Kontaktdaten in der "An"-Zeile |
| Hinweis auf elektronische Widerrufsfunktion (§356a BGB) | ✅ eigener Abschnitt "Widerruf über die Website", der die Funktion und den Weg über `/widerruf` beschreibt. **Einschränkung:** die exakte amtliche Formulierung der 2026er-Ergänzung zum Muster konnte nicht wortgetreu von der Primärquelle (bmj.de/gesetze-im-internet.de) verifiziert werden — diese Domains waren über die verfügbaren Web-Tools nicht erreichbar. Die inhaltliche Pflicht ist erfüllt (Verbraucher wird informiert), eine spätere Gegenprüfung des exakten Wortlauts gegen die Originalquelle schadet trotzdem nicht. |
| Widerrufsbutton § 356a BGB | ✅ **Code ist fertig:** `/widerruf`-Route + `api/widerruf.ts` fragen korrekt nur Bestellnummer/Datum/Produkt/E-Mail ab, **kein Grund**-Feld — genau die gesetzliche Vorgabe. Eingangsbestätigung per E-Mail (Resend) ist implementiert. |
| AGB | ⚠️ weiterhin offen — `AGBPage.tsx` ist als "in Überarbeitung" markiert. Einzig verbleibender Website-Baustein; wartet auf deine 0-€-vs.-Dienst-Entscheidung (siehe `RECHTSTEXTE.md`) |
| Versandkosten/Lieferzeit vor Kaufabschluss | ✅ `VersandUndZahlungPage.tsx` vollständig mit Tabelle |
| Grundpreisangabe (PAngV) | ✅ **Korrektur zu Phase 1:** war bereits implementiert, meine erste Einschätzung war falsch. `ProductShelf.tsx` (Homepage-Regal) und `ProductDetailPage.tsx` (inkl. mobiler Sticky-Bar) zeigen den Preis pro 100g bereits korrekt an |
| GPSR-Herstellerkennzeichnung auf Produktseiten | ✅ neue gemeinsame Komponente `GpsrInfo.tsx`, eingebunden auf `ProductDetailPage.tsx`, `ProductStagePage.tsx` und `AccessoryDetailPage.tsx` — Name, Anschrift, E-Mail direkt auf jeder Kauf-Seite sichtbar, nicht nur verlinkt |

### Rechtliche Anforderung
- **Widerrufsbelehrung/-formular:** Das amtliche BMJ-Muster ist rechtlich
  privilegiert (siehe Begründung in `RECHTSTEXTE.md`) — muss nur noch mit
  Lucas Daten ausgefüllt und eingefügt werden. **Ergänzung seit 19.06.2026:**
  Das Muster von 2014 kennt den Widerrufsbutton noch nicht — der Hinweis
  auf die elektronische Widerrufsfunktion muss ergänzt werden.
- **Grundpreisangabe (§4 PAngV):** Pflicht für Waren nach Gewicht, außer
  bei Nenngewicht < 10 g. 300g/500g-Wachsblöcke sind **klar
  grundpreispflichtig** (Angabe z. B. "5,99 €/100 g"). [PAngV-Übersicht Händlerbund](https://www.haendlerbund.de/de/ratgeber/recht/3766-grundpreisangabe)
- **Barrierefreiheitsstärkungsgesetz (BFSG):** Pflicht für Online-Shops
  seit 28./29.6.2025 — **aber** Kleinstunternehmen (< 10 Mitarbeiter UND
  ≤ 2 Mio. € Jahresumsatz/-bilanzsumme) sind von der Pflicht zur
  barrierefreien Website ausgenommen. Waxcelerate erfüllt diese Ausnahme
  eindeutig (Solo-Founder, kleiner Umsatz). **Wichtige Einschränkung:**
  Die Ausnahme gilt nur für den Online-Shop selbst — falls du künftig
  eines der in §1 Abs. 2 BFSG explizit erfassten *Produkte* verkaufst
  (v. a. Elektronikprodukte), müssten diese selbst barrierefrei sein.
  Wachs/Ketten fallen nicht darunter. [Kleinstunternehmen-BFSG](https://ohn.haendlerbund.de/recht/rechtsfragen/kleinstunternehmen-bfsg-ausnahme)
- **GPSR (General Product Safety Regulation), seit 13.12.2024 EU-weit
  direkt geltend:** Bei jedem Produktangebot müssen Herstellername,
  Handelsname, Postanschrift und elektronische Kontaktadresse **sichtbar**
  angegeben werden — auf der Produktseite, nicht nur im Impressum.
  [GPSR-Pflichten Online-Handel](https://www.it-recht-kanzlei.de/eu-produktsicherheitsverordnung-gpsr-haendler-informationspflichten.html), [RWT-Gruppe](https://www.rwt-gruppe.de/news/die-neue-eu-produktsicherheitsverordnung-neue-pflichten-insbesondere-fuer-online-haendler.html)
- **TTDSG/Cookies:** Da Vercel Analytics laut eigenem Code-Kommentar
  cookiefrei ist und keine personenbezogenen Daten speichert, ist kein
  Cookie-Consent-Banner nötig — **aber** die Datenschutzerklärung muss
  die Nutzung trotzdem benennen (Transparenzpflicht, unabhängig vom
  Cookie-Status).

### Risiko bei Nichteinhaltung
- Widerrufsbutton/-belehrung: Bußgelder bis 50.000 € + Abmahnungen
  (siehe `RECHTSTEXTE.md` — aktuell "heißes" Abmahnthema, weil die
  Pflicht neu ist).
- Fehlende Grundpreisangabe: klassischer, häufiger Abmahngrund im
  E-Commerce, meist im dreistelligen bis niedrigen vierstelligen Bereich.
- Fehlende GPSR-Angaben: Abmahnrisiko + Blockade bei Amazon-Listing
  (Amazon verlangt die GPSR-Angaben inzwischen aktiv in Seller Central).
- Unvollständige Datenschutzerklärung (Analytics nicht erwähnt):
  Abmahnrisiko geringer, aber formal ein DSGVO-Verstoß.

### Nächste Schritte — von Claude erledigbar
- Sobald du dich für "keine AGB" entscheidest: `AGBPage.tsx` auf einen
  kurzen erklärenden Hinweis kürzen statt Platzhalter stehen zu lassen.
- Optional: exakten Wortlaut der 2026er-Muster-Ergänzung zur elektronischen
  Widerrufsfunktion nachträglich gegen die Primärquelle verifizieren,
  sobald bmj.de/gesetze-im-internet.de erreichbar sind.

### Nächste Schritte — nur von dir
- **AGB-Entscheidung treffen:** Rechtstext-Dienst (~15 €/Monat,
  Abmahnschutz) oder kostenlose Variante mit IHK-Gegencheck — letzter
  offener Punkt aus `RECHTSTEXTE.md`.
- Telefonnummer fürs Widerrufsmuster festlegen, falls gewünscht (optional).

**Status:** ✅ alles bis auf AGB umgesetzt und live auf
`claude/legal-compliance-checklist-lk34t5` (PR #17) — AGB wartet auf
deine Entscheidung

---

## 3. Produkt-/Chemikalienrecht (größter Rechercheblock)

### Status-Check
- Sicherheitsaussagen in `40_technical_kb.md` sind fundiert (PTFE inert,
  MoS₂ im Block eingekapselt, GMS/BHT unbedenklich) — das ist gute
  *Kunden*information, ersetzt aber kein Sicherheitsdatenblatt oder eine
  CLP-Einstufung.
- Business Core listet SDB-Pflicht als "Status offen".
- **Phase 2 — per Gmail-Recherche (waxcelerate@gmail.com,
  teichmannldc@gmail.com) gefundene Rohstoff-Lieferanten:**
  - **Werth-Metall** (Inh. Fabian Werth, Grammetal, USt-Id DE282703646):
    MoS₂-Pulver min. 98,5 %, 4–5 µm, **CAS-Nr. 1317-33-5**, 1 kg
    bezogen Anfang Januar 2026 (Rechnung 19819).
  - **DistrEbution GmbH** (Hamburg): Paraffinwachs Vollraffinat 58/60
    Tafeln (Art.-Nr. D10022.4, Rechnung RG-324773/RG-337225) sowie
    Hartparaffin T19 im selben Themenstrang.
  - `src/lib/data.ts` bestätigt zusätzlich, dass PTFE (< 1 µm) tatsächlich
    Teil der Classic-Formel ist (`formula: ['Vollraffiniertes
    Paraffinwachs', 'PTFE < 1 µm', 'Stearinsäurederivat']`) — der
    PTFE-Lieferant selbst sowie GMS/BHT (Pro-Linie) waren per Gmail-
    Volltextsuche **nicht auffindbar** (weder als eigene Bestellung noch
    als Anhang in der Sammel-Mail "Waxcelerate Rechnungen/Invoice").
    Möglich: anderer Suchbegriff, älterer Kauf außerhalb der durchsuchten
    Postfächer, oder Teil einer bereits fertigen Vormischung.
  - Zusätzlich in derselben Sammel-Mail gefunden, relevant für Block 4:
    eine **Alibaba-Rechnung über 200 Einheiten Verpackung (2025)**.

### Rechtliche Anforderung
- **CLP-Kennzeichnung:** Nur *als gefährlich eingestufte* Gemische
  brauchen Piktogramme/H-Sätze/Signalwörter auf dem Etikett. Ein
  Wachsgemisch, das nach CLP-Kriterien **nicht** als gefährlich
  eingestuft ist, braucht keine Gefahrkennzeichnung. [ECHA CLP-Kennzeichnung](https://echa.europa.eu/de/regulations/clp/labelling), [BAuA-Leitfaden](https://www.baua.de/DE/Themen/Chemikalien-Biostoffe/Gefahrstoffe/Einstufung-und-Kennzeichnung/Kennzeichnungselemente/Beispiel-Kennzeichnungsetikett)
  → **Aber:** die Einstufung selbst muss trotzdem einmal geprüft/dokumentiert
  werden — das entscheidet, ob überhaupt Kennzeichnungspflicht besteht.
- **Konkrete Einstufungs-Recherche zu den jetzt bekannten Rohstoffen (Phase 2):**
  - **Paraffinwachs Vollraffinat 58/60** (DistrEbution, Art. D10022.4):
    öffentliche Sicherheitsdatenblätter zu diesem Wachstyp stufen ihn
    **nicht als gefährlich nach CLP** ein — kein PBT/vPvB, alle
    Bestandteile REACH-registriert und unauffällig. Keine SDB-Pflicht
    für diesen Rohstoff allein.
  - **MoS₂-Pulver, CAS 1317-33-5** (Werth-Metall): öffentliche
    Herstellerangaben zu diesem CAS weisen die **rohe Pulverform** mit
    H319 (schwere Augenreizung) und H332 (gesundheitsschädlich beim
    Einatmen) aus — als *Rohstoff* also durchaus CLP-relevant. Das
    bestätigt die bestehende Produktionsvorsicht in `40_technical_kb.md`
    (FFP2 bei losem Feinpulver). **Wichtig:** Diese Einstufung gilt für
    das lose Pulver; ob sie auf das fertige, feste MoS₂-Wachsgemisch
    "durchschlägt" (CLP-Mischungsregeln, Konzentrationsgrenzwerte,
    Aggregatzustand-Bridging), ist eine fachliche Einzelfallprüfung, die
    ein Fachdienstleister/Labor machen sollte, keine Excel-Faustregel.
  - PTFE- und GMS/BHT-Rohware bislang nicht identifizierbar (s.o.) —
    für eine vollständige Einstufung der Classic- und Pro-Rezeptur fehlen
    diese Bausteine noch.
  - **Praktische Konsequenz:** Für die **Pro-Linie (MoS₂)** ist eine echte
    CLP-Einstufungsprüfung des fertigen Gemischs empfehlenswert, sobald du
    entscheidest ob/wie B2B-Verkauf skaliert — für die **Classic-Linie**
    (Paraffin unauffällig, PTFE-Quelle unbekannt) kann das noch nicht
    abschließend beurteilt werden.
- **Sicherheitsdatenblatt (REACH Art. 31):** Pflicht nur, wenn das Gemisch
  (a) als gefährlich nach CLP eingestuft ist, oder (b) PBT/vPvB-Kriterien
  erfüllt, oder (c) auf der REACH-Kandidatenliste steht. **Wenn keiner
  dieser drei Fälle zutrifft, besteht keine gesetzliche SDB-Pflicht** —
  B2B-Partner können trotzdem freiwillig danach fragen (kommt in der
  Praxis häufig vor, unabhängig von der gesetzlichen Pflicht). [REACH Art. 31 FAQ](https://www.reach-clp-biozid-helpdesk.de/DE/REACH/FAQ/Sicherheitsdatenblatt)
- **GPSR — Produktkennzeichnung auf der Verpackung selbst:** Seit
  13.12.2024 zusätzlich zur Website-Pflicht (siehe Block 2) auch am
  *physischen Produkt*: Rückverfolgbarkeit (Chargen-/Losnummer),
  Herstelleridentifikation. [GPSR-Übersicht IHK Köln](https://www.ihk.de/koeln/hauptnavigation/recht-steuern/produktsicherheit-6206448)
- **Produkthaftung (ProdHaftG):** verschuldensunabhängige Haftung für
  Personen-/Sachschäden durch ein fehlerhaftes Produkt — unabhängig
  davon, ob eine Kennzeichnungspflicht besteht. Das ist der Grund, warum
  die Produkthaftpflichtversicherung P0 bleibt, *auch wenn* das Wachs
  chemikalienrechtlich unauffällig ist.

### Risiko bei Nichteinhaltung
- Fehlende Chargennummer/Rückverfolgbarkeit: bei einem Rückruf (auch
  hypothetisch) haftest du ohne Möglichkeit, betroffene Chargen
  einzugrenzen — Totalrückruf statt gezielter Aktion.
- Fehlendes SDB trotz tatsächlicher Gefährlichkeit: Bußgeld nach ChemG,
  zusätzlich Vertrauensverlust bei B2B-Partnern.
- Keine Produkthaftpflicht: unbegrenzte private Haftung bei Personenschaden
  (z. B. Kette reißt, Sturz) — das teuerste Einzelrisiko der ganzen Liste.

### Produkthaftpflicht-Vergleich (Phase 2, grünes Licht erteilt)

| Anbieter | Deckungssumme | Selbstbeteiligung | Einstiegspreis/Hinweis |
|---|---|---|---|
| **andsafe** | bis 10 Mio. € (Sonderbranchen bis 25 Mio. €) | k. A. in Recherche | Produkthaftpflicht bereits **in der Betriebshaftpflicht enthalten**, "erweiterte Produkthaftpflicht" als Zusatzmodul; Beitrag richtet sich nach Jahresumsatz, komplett online abschließbar |
| **exali** | k. A. in Recherche | k. A. in Recherche | Ab **450 €/Jahr netto** branchenübergreifend — teurer als andsafe, dafür auf Kleinunternehmer/Dienstleister spezialisiert |
| **Hiscox** | ab 10 Mio. € | bis 1.000 € | Spezialisiert auf Online-Händler/E-Commerce-Risiken |
| **Gothaer** | ab 3 Mio. € | ab 250 € | Klassischer Vollversicherer, oft im Paket mit Betriebshaftpflicht |
| **AXA** | ab 3 Mio. € | k. A. in Recherche | Klassischer Vollversicherer |
| **HDI** | k. A. in Recherche | bis 1.000 € | Klassischer Vollversicherer, häufig für Produkthaftpflicht als Baustein empfohlen |

**Einschätzung:** Für ein Einzelunternehmen mit Kleinstumsatz ist
**andsafe** preislich am ehesten passend (umsatzabhängiger Beitrag,
Produkthaftpflicht schon in der Basis-Betriebshaftpflicht enthalten,
online in Minuten abschließbar) — exali ist eher für höhere
Beratungs-/Dienstleistungsrisiken kalkuliert und mit 450 €/Jahr spürbar
teurer. Endgültige Zahl nur über die jeweiligen Online-Rechner (Umsatz,
Sortiment "Kosmetik/Chemie/Wachs" eingeben) zu bekommen — das ist der
nächste, von dir auszuführende Schritt.

### Nächste Schritte — von Claude erledigbar
- Chargennummern-System-Vorschlag (z. B. Produktionsdatum + laufende
  Nummer) ausarbeiten, sobald gewünscht.
- Weitersuchen nach PTFE-/GMS-/BHT-Lieferanten, falls du weitere
  Postfächer, Zeiträume oder Lieferantennamen nennen kannst.

### Nächste Schritte — nur von dir
- Bei andsafe (und optional 1-2 weiteren) den Online-Rechner mit realen
  Umsatzzahlen durchgehen und abschließen.
- PTFE- und GMS/BHT-Lieferanten benennen, falls per Gmail nicht
  auffindbar — dann kann die CLP-Einschätzung für die Classic-Formel
  vervollständigt werden.
- Entscheiden, ob für die Pro-Linie (MoS₂) eine professionelle
  CLP-Einstufung des fertigen Gemischs beauftragt werden soll.

**Status:** ⚠️ CLP-Teilbild vorhanden (Paraffin unbedenklich, MoS₂-Rohstoff
mit H319/H332, PTFE/GMS/BHT offen) · ⚠️ Produkthaftpflicht-Vergleich
fertig, Abschluss steht noch aus · ✅ GPSR-Produktkennzeichnung auf der
Website umgesetzt (Block 2) — Kennzeichnung auf der physischen
Verpackung selbst weiterhin zu prüfen

---

## 4. Verpackung & Umwelt

### Status-Check
- Business Core listet LUCID als P0, Status "Erledigung unbestätigt".
- **Bestätigt (Phase 2):** Verpackungsmaterial ist fast ausschließlich
  **Karton** (Kartonboxen), selten Luftpolsterfolie. Damit ist die
  Materialfrage für die Systembeteiligung geklärt — im Wesentlichen eine
  einzige Materialart.
- Gmail-Fund: eine Alibaba-Rechnung über 200 Einheiten Verpackung (2025) —
  spricht für Karton-/Verpackungsimport aus China; für die
  LUCID-Meldung zählt trotzdem nur, welches Material **in Deutschland
  beim Endkunden landet** (Herkunft der Verpackung ist irrelevant für
  die Meldepflicht, nur die Marktbringung in DE zählt).

### Rechtliche Anforderung
- **LUCID-Registrierung:** Seit 1.7.2022 ausnahmslos Pflicht für jeden,
  der verpackte Ware in Deutschland in Verkehr bringt — **keine
  Bagatellgrenze**. Die Registrierung selbst ist kostenlos und komplett
  digital. [LUCID-Pflicht Übersicht](https://deutsche-recycling.de/blog/verpackungsgesetz-lucid/)
- **Zwei getrennte Schritte nötig:** (1) Registrierung bei LUCID (ZSVR,
  kostenlos), (2) Systembeteiligungsvertrag mit einem dualen System
  (Landbell, Reclay u. a. — **kostenpflichtig**, richtet sich nach
  Verpackungsmaterial und -menge).
- **Meldepflichten:** Mengenmeldung sowohl an das duale System als auch
  an LUCID selbst — jeweils zu Jahresbeginn (Planmenge) und Jahresende
  (Ist-Menge).
- Betroffene Materialien bei Waxcelerate: Wachsdose/-behälter, Kartons,
  Füllmaterial, Versandtaschen — jede Materialart einzeln der
  Systembeteiligung zuordnen.

### Risiko bei Nichteinhaltung
- Fehlende Registrierung/Systembeteiligung: Bußgeld bis 200.000 € **+
  sofortiges Vertriebsverbot** — das schärfste Einzelrisiko dieser
  ganzen Liste. Amazon und andere Marktplätze verlangen die LUCID-Nummer
  inzwischen aktiv vor Freischaltung.
- Fehlerhafte/verspätete Meldung: Bußgeld bis 10.000 €.

### Nächste Schritte — von Claude erledigbar
- Schritt-für-Schritt-Anleitung zur LUCID-Registrierung (welche Angaben
  gebraucht werden: Firmenname, Anschrift, Markennamen, Verpackungsarten)
  vorbereiten.
- Kostenvergleich 2–3 duale Systeme (Landbell, Reclay, Interseroh)
  anhand geschätzter Jahresmengen erstellen, sobald du die ungefähren
  verpackten Stückzahlen/Materialien bestätigst.

### Nächste Schritte — nur von dir
- LUCID-Registrierung selbst durchführen (Login mit eigenen
  Unternehmensdaten, nicht durch Claude ausführbar) und danach den
  Systembeteiligungsvertrag abschließen (bei überwiegend Karton meist
  günstigste Materialkategorie).

**Status:** ⚠️ Materialarten jetzt bekannt (Karton, selten
Luftpolsterfolie), Registrierung selbst weiterhin unbestätigt — nach
Produkthaftung das schärfste Bußgeldrisiko dieser Liste

---

## 5. Marktplatz-spezifische Pflichten

### Status-Check
- **eBay:** "Mich"-Seite laut `LUCA_TODO.md` D2 mit fertigem Text erledigt.
- **Kleinanzeigen:** ⚠️ **Korrektur (Phase 2):** Du hast selbst bestätigt,
  dass das Impressum "nicht vollständig" ist — im Widerspruch zum bisher
  in `LUCA_TODO.md` D1 als erledigt geführten Stand. Da Claude dein
  privates Kleinanzeigen-Konto nicht einsehen kann, hier der Soll-Text
  zum Abgleich (identisch mit `LUCA_TODO.md` D1):
  ```
  Waxcelerate
  Luca Teichmann
  Florentinerstraße 17
  70619 Stuttgart

  Telefon: +49 157 51957470
  E-Mail: waxcelerate@gmail.com
  Website: https://waxcelerate.de

  Kleinunternehmer gemäß § 19 UStG, daher wird keine Umsatzsteuer ausgewiesen.
  ```
  Bitte mit dem aktuellen Stand auf Kleinanzeigen abgleichen und sagen,
  was konkret fehlt (z. B. Telefonnummer, Website-Feld) — dann liefere
  ich einen zielgenauen Korrekturtext.
- **Amazon:** laut Business Core "geplant — erst nach LUCID + GTIN-
  Befreiung", also noch nicht spruchreif.

### Rechtliche Anforderung
- eBay/Kleinanzeigen: gewerbliche Anbieter müssen ein vollständiges
  Impressum auf der Profil-/Unternehmensseite hinterlegen (Verlängerung
  der TMG-Pflicht auf Marktplätze) — unabhängig vom eigenen Shop.
- **Amazon-Vorbereitung:**
  - **GTIN-Befreiung:** Seller Central → Katalog → Produkt hinzufügen →
    "GTIN-Befreiung beantragen", Produktkategorie wählen, Markenname
    angeben (oder "Generic"), Nachweis als PDF/JPEG/TIFF hochladen,
    Antwort typischerweise binnen 48 Std. [GTIN-Befreiung Ablauf](https://sellercentral.amazon.de/seller-forums/discussions/t/8f581f02-771e-4075-a984-7a671f8f4b3d)
  - Amazon verlangt zusätzlich die GPSR-Pflichtangaben und in vielen
    Kategorien die LUCID-Nummer als Voraussetzung fürs Listing — Block 2,
    3 und 4 sind also **Voraussetzung**, nicht optional, für den
    Amazon-Start.
- **B2B-Rechnungen** an Fachhandel: müssen alle Pflichtangaben nach §14
  UStG enthalten (Name/Anschrift beider Parteien, Steuernummer,
  Rechnungsdatum, fortlaufende Rechnungsnummer, Menge/Art der Leistung,
  Kleinunternehmer-Hinweis statt USt-Ausweis) — reiner Formalismus, aber
  bei fehlerhaften Rechnungen können B2B-Kunden den Vorsteuerabzug (bei
  ihnen) verlieren und reklamieren.

### Risiko bei Nichteinhaltung
- Fehlendes/fehlerhaftes Marktplatz-Impressum: Abmahnrisiko, meist von
  Konkurrenten oder Abmahnvereinen.
- Amazon-Start ohne LUCID/GPSR: Amazon blockt das Listing selbst,
  bevor es überhaupt zu einem externen Rechtsrisiko kommt.

### Nächste Schritte — von Claude erledigbar
- B2B-Rechnungsvorlage mit allen Pflichtangaben nach §14 UStG erstellen
  (falls noch nicht vorhanden — bitte bestätigen).
- Amazon-Checkliste (GTIN-Befreiung, GPSR-Feld, LUCID-Nachweis) für den
  Start vorbereiten, sobald Block 2/3/4 abgeschlossen sind.

### Nächste Schritte — nur von dir
- Kleinanzeigen-Impressum mit dem Soll-Text oben abgleichen und sagen,
  was fehlt (Screenshot hilft).
- Amazon-Timing final entscheiden (offene Frage aus `95_open_questions.md`
  Punkt 10).

**Status:** ✅ eBay erledigt · ⚠️ Kleinanzeigen laut dir unvollständig,
Korrektur wartet auf Detailangabe · ❔ Amazon noch nicht spruchreif, aber
Voraussetzungen jetzt bekannt

---

## 6. Marke/Kennzeichen

### Status-Check
- Business Core listet DPMA-Markenrecherche + ggf. Wortmarke Klasse 4
  als P0, Status offen.

### Rechtliche Anforderung
- **DPMA-Wortmarkenanmeldung:** Grundgebühr 290 € elektronisch für bis
  zu 3 Nizza-Klassen (Klasse 4 = Schmierstoffe/Wachse fällt allein
  darunter), Schutzdauer 10 Jahre. [DPMA-Kosten 2026](https://www.starting-up.de/recht/marken-patentschutz/marke-anmelden-beim-dpma.html)
  - **Fördermöglichkeit:** EU-SME-Fund kann 2026 bis zu 75 % der
    Anmeldegebühr für KMU mit Sitz in der EU erstatten — vor Anmeldung
    Voucher beantragen.
- Vor der Anmeldung lohnt sich eine kostenlose Ähnlichkeitsrecherche im
  DPMA-Register (DPMAregister online), um Kollisionen mit bestehenden
  Marken auszuschließen — v. a. wegen der von dir selbst erwähnten
  Verwechslungsgefahr mit Skiwachs-Marken.

### Risiko bei Nichteinhaltung
- Ohne eigene Markenanmeldung: kein Schutz gegen Trittbrettfahrer, die
  "Waxcelerate" für ähnliche Produkte nutzen; umgekehrt Risiko, selbst
  unwissentlich eine bestehende Marke zu verletzen (Unterlassungs-/
  Schadensersatzansprüche Dritter).

### Nächste Schritte — von Claude erledigbar
- Kostenlose DPMA-Registerrecherche zu "Waxcelerate" in Klasse 4 (und
  angrenzenden Klassen wie 3 für Pflegemittel) durchführen, um eine grobe
  erste Einschätzung zu Kollisionen zu geben.
- SME-Fund-Voucher-Ablauf zusammenfassen.

### Nächste Schritte — nur von dir
- Anmeldung selbst bei DPMAdirektWeb einreichen (Unterschrift/Zahlung
  nötig).

**Status:** ❌ offen, aber kein akutes Bußgeldrisiko wie Block 1/3/4 —
niedrigere Dringlichkeit, aber "je länger du wartest, desto größer das
Risiko einer Kollision"

---

## 7. Gesamt-Prioritätentabelle

| Prio | Thema | Status | Geschätzte Kosten | Nächster konkreter Schritt |
|---|---|---|---|---|
| **P0** | Produkthaftpflichtversicherung abschließen | ⚠️ Vergleich fertig | vermutlich am günstigsten bei andsafe | Online-Rechner mit echten Zahlen durchgehen, abschließen |
| **P0** | LUCID-Registrierung + duales System | ⚠️ Materialarten bekannt | Registrierung kostenlos, System nach Menge | Registrierung selbst durchführen |
| **P0** | PTFE-/GMS-/BHT-Lieferanten benennen | ❌ per Gmail nicht auffindbar | 0 € | Lieferantennamen nennen |
| **P0** | AGB-Entscheidung treffen | ⚠️ letzter offener Website-Punkt | 0–20 €/Monat | Rechtstext-Dienst ja/nein entscheiden |
| **P0** | Kleinanzeigen-Impressum korrigieren | ⚠️ laut dir unvollständig | 0 € | Sagen, was genau fehlt |
| **P1** | CLP-Einstufung Pro-Linie (MoS₂-Gemisch) professionell prüfen lassen | ⚠️ Rohstoff-Einstufung bekannt (H319/H332), Gemisch offen | Fachdienstleister-Kosten variabel | Entscheiden ob/wann beauftragt wird |
| **P1** | Chargennummern-System (GPSR-Rückverfolgbarkeit) | ❌ fehlt | 0 € | Konzept von mir, Umsetzung in Produktion |
| **P2** | DPMA-Markenanmeldung | ❌ offen | 290 € (ggf. -75 % Förderung) | Registerrecherche zuerst |
| **P2** | EU-Kleinunternehmer-IdNr. für Österreich | ❌ offen | 0 € | Erst relevant bei Wien-Launch |
| **P2** | Amazon-Vorbereitung (GTIN, GPSR-Feld) | ❔ noch nicht spruchreif | 0 € | Erst nach LUCID |

**Bereits erledigt (aus dieser Tabelle entfernt):** Gewerbeanmeldung ✅,
Widerrufsbelehrung + Muster-Widerrufsformular ✅, GPSR-Herstellerangaben
auf Produktseiten ✅, Grundpreisangabe ✅ (war schon vorhanden),
Datenschutzerklärung/Vercel-Analytics-Absatz ✅ — alles auf
`claude/legal-compliance-checklist-lk34t5` (PR #17) umgesetzt.

---

## Was ich von dir brauche, um weiterzumachen

1. **PTFE- und GMS-/BHT-Lieferanten benennen** — per Gmail-Suche nicht
   auffindbar; mit Namen kann ich die CLP-Einstufung für die
   Classic-Formel vervollständigen.
2. **AGB-Entscheidung:** Rechtstext-Dienst oder "keine AGB" (letzter
   offene Website-Baustein, Code für alles andere ist bereits live).
3. **Kleinanzeigen-Impressum:** sagen, was konkret fehlt, dann liefere
   ich einen zielgenauen Korrekturtext.
4. Produkthaftpflicht bei einem der verglichenen Anbieter (am ehesten
   andsafe) tatsächlich abschließen.
5. Entscheiden, ob für die Pro-Linie (MoS₂) eine professionelle
   CLP-Einstufung des fertigen Gemischs beauftragt werden soll.

Alles andere in dieser Liste ist bereits vorbereitet, umgesetzt oder
wartet nur auf deine Entscheidung, nicht auf weitere Informationen von dir.
