# Rechts-Compliance-Checkliste — Waxcelerate

**Für:** Luca. **Stand:** 31. August 2026.

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

| # | Was | Warum dringend | Risiko |
|---|---|---|---|
| 1 | **LUCID-Registrierung + duales System** | Ohne Bagatellgrenze Pflicht seit 1.7.2022, sobald du verpackte Ware in DE in Verkehr bringst — du tust das seit 2024 | Bußgeld bis 200.000 € **+ sofortiges Vertriebsverbot** |
| 2 | **Produkthaftpflichtversicherung** | Deckt dich, falls eine Kette reißt oder Wachs einen Schaden verursacht | Ohne Versicherung haftest du privat und unbegrenzt |
| 3 | **Widerrufsbutton § 356a BGB — Code-Stand prüfen** | Pflicht seit 19.06.2026, Code existiert schon (`/widerruf`), aber das amtliche BMJ-Muster fehlt noch als Text auf `/widerrufsbelehrung` | Bußgelder bis 50.000 € + Abmahnungen |
| 4 | **GPSR-Kennzeichnung auf Produktseiten** | Seit 13.12.2024 EU-weit Pflicht: Herstellername + Postanschrift + E-Mail müssen bei **jedem Angebot** sichtbar sein — auf waxcelerate.de bislang nirgends geprüft | Marktplätze (v. a. Amazon später) blockieren sonst das Listing; Abmahnrisiko |
| 5 | **Gewerbeanmeldung-Status klären** | In keinem Dokument explizit bestätigt — Grundvoraussetzung für alles andere | Ohne Anmeldung ist der ganze restliche Compliance-Aufbau hinfällig |

---

## 1. Unternehmensform & Steuern

### Status-Check
- Rechtsform laut Business Core: Einzelunternehmen, Kleinunternehmer
  §19 UStG. **Nicht bestätigt:** ob die Gewerbeanmeldung beim
  Gewerbeamt Stuttgart formal erfolgt ist.
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
- **Bestätigen:** Ist die Gewerbeanmeldung beim Amt Stuttgart formal
  erfolgt? (Offene Frage aus `95_open_questions.md` Punkt 5.)
- Aktuellen Jahresumsatz (2026 laufend) grob nennen, damit die
  25.000-/100.000-€-Grenze im Blick bleibt.

**Status:** ❔ Gewerbeanmeldung unbestätigt · ✅ Kleinunternehmerstatus im
Impressum korrekt ausgewiesen

---

## 2. Website-Pflichtangaben (E-Commerce-Recht)

### Status-Check (Code gegengelesen)
| Pflicht | Ist-Zustand im Repo |
|---|---|
| Impressum §5 TMG | ✅ `ImpressumPage.tsx` — vollständig (Name, Anschrift, E-Mail, USt-Hinweis) |
| Datenschutzerklärung | ⚠️ `DatenschutzPage.tsx` behandelt Stripe, Vercel-Hosting und DSGVO-Rechte bereits — **aber `src/lib/analytics.ts` nutzt Vercel Analytics (cookiefrei), das in der Datenschutzerklärung nirgends erwähnt wird.** Die Aussage "verwendet keine Tracking-Cookies oder Analyse-Tools" ist dadurch faktisch falsch, auch wenn Vercel Analytics ohne Cookie/Consent auskommt — DSGVO Art. 13 verlangt trotzdem Transparenz über *jede* Verarbeitung, nicht nur Cookie-basierte. |
| Widerrufsbelehrung | ⚠️ `WiderrufsbelehrungPage.tsx` ist bewusst ein **Platzhalter** — Kommentar im Code bestätigt: das amtliche BMJ-Muster fehlt noch als eingefügter Text. Absichtlich so gelassen (rechtlich korrekt begründet in `RECHTSTEXTE.md`), aber **noch nicht ausgefüllt**. |
| Muster-Widerrufsformular | ❌ noch nicht als Text vorhanden (Teil des BMJ-Musters oben) |
| Widerrufsbutton § 356a BGB | ✅ **Code ist fertig:** `/widerruf`-Route + `api/widerruf.ts` fragen korrekt nur Bestellnummer/Datum/Produkt/E-Mail ab, **kein Grund**-Feld — genau die gesetzliche Vorgabe. Eingangsbestätigung per E-Mail (Resend) ist implementiert. |
| AGB | ⚠️ `AGBPage.tsx` ist als "in Überarbeitung" markiert, referenziert korrekt sowohl eBay- als auch eigenen Shop, aber ist noch kein fertiger Text — Platzhalter-Charakter |
| Versandkosten/Lieferzeit vor Kaufabschluss | ✅ `VersandUndZahlungPage.tsx` vollständig mit Tabelle |
| Grundpreisangabe (PAngV) | ❌ nicht geprüft — Wachsblöcke (300g/500g) fallen unter die Grundpreispflicht (siehe unten) |
| GPSR-Herstellerkennzeichnung auf Produktseiten | ❌ nicht vorhanden |

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
- BMJ-Musterlink erneut heraussuchen und den auszufüllenden Text mit
  Lucas Daten (Name, Anschrift, E-Mail, 14-Tage-Frist, Hinweis auf
  elektronische Widerrufsfunktion) als fertigen Textbaustein liefern —
  **Einfügen selbst ist Code-Arbeit, kein Rechtstext-Neuschreiben.**
- Grundpreis-Berechnung + Anzeige auf Produktseiten technisch umsetzen
  (Folgeauftrag, sobald gewünscht).
- GPSR-Pflichtangaben-Baustein für Produktseiten vorbereiten.
- Datenschutzerklärung um einen Absatz zu Vercel Analytics ergänzen
  (Textvorschlag, keine neue Rechtsberatung nötig, da Tatsachenbeschreibung).

### Nächste Schritte — nur von dir
- Entscheiden: Rechtstext-Dienst (~15 €/Monat, Abmahnschutz) oder
  kostenlose Variante mit IHK-Gegencheck — offene Empfehlung aus
  `RECHTSTEXTE.md`.
- Telefonnummer fürs Widerrufsmuster festlegen (optional, aber im BMJ-
  Muster vorgesehen).

**Status:** ⚠️ Größtenteils vorbereitet, aber mehrere Platzhalter noch
nicht final ausgefüllt — höchste Website-Priorität

---

## 3. Produkt-/Chemikalienrecht (größter Rechercheblock)

### Status-Check
- Sicherheitsaussagen in `40_technical_kb.md` sind fundiert (PTFE inert,
  MoS₂ im Block eingekapselt, GMS/BHT unbedenklich) — das ist gute
  *Kunden*information, ersetzt aber kein Sicherheitsdatenblatt oder eine
  CLP-Einstufung.
- Business Core listet SDB-Pflicht als "Status offen".
- Rohstoff-Rechnungen/Downloads von Luca stehen noch aus (laut Zusage,
  werden im Chat nachgereicht) — **sobald sie da sind, kann ich direkt**
  die Hersteller identifizieren und deren öffentlich verfügbare
  Sicherheitsdatenblätter/Einstufungen dazu heraussuchen.

### Rechtliche Anforderung
- **CLP-Kennzeichnung:** Nur *als gefährlich eingestufte* Gemische
  brauchen Piktogramme/H-Sätze/Signalwörter auf dem Etikett. Ein
  Wachsgemisch, das nach CLP-Kriterien **nicht** als gefährlich
  eingestuft ist, braucht keine Gefahrkennzeichnung. [ECHA CLP-Kennzeichnung](https://echa.europa.eu/de/regulations/clp/labelling), [BAuA-Leitfaden](https://www.baua.de/DE/Themen/Chemikalien-Biostoffe/Gefahrstoffe/Einstufung-und-Kennzeichnung/Kennzeichnungselemente/Beispiel-Kennzeichnungsetikett)
  → **Aber:** die Einstufung selbst muss trotzdem einmal geprüft/dokumentiert
  werden — das entscheidet, ob überhaupt Kennzeichnungspflicht besteht.
  PTFE ist als Feststoff/im Wachs gebunden praktisch immer unproblematisch;
  MoS₂ als Feinstpulver wäre reizend (steht schon so in der Technical KB) —
  im fertigen, festen Wachsblock aber gebunden.
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

### Nächste Schritte — von Claude erledigbar
- **Sobald du die Rechnungen/Downloads hochlädst:** Rohstoff-Hersteller
  und Produktnamen daraus extrahieren, öffentlich verfügbare
  Herstellerangaben/SDS zu PTFE-Rohware, MoS₂-Pulver, GMS und BHT
  zusammentragen, daraus ableiten, ob eine CLP-Einstufung als gefährlich
  überhaupt in Betracht kommt. **Was ich dafür aus den Dokumenten
  brauche:** Herstellername, Produktbezeichnung/Artikelnummer,
  Liefermenge — die Formel selbst (Mengenverhältnisse) bleibt vertraulich
  und wird nicht gebraucht.
- Angebote für Produkthaftpflicht (exali/andsafe/Hiscox/Gothaer)
  vergleichend recherchieren, sobald du grünes Licht gibst — Preisrahmen
  laut Business Core 100–300 €/Jahr.
- Vorschlag für ein einfaches Chargennummern-System (z. B.
  Produktionsdatum + laufende Nummer) ausarbeiten.

### Nächste Schritte — nur von dir
- **Rechnungen/Downloads der Rohstofflieferanten schicken** (im Chat,
  wie besprochen) — das ist der Startschuss für die SDS-Recherche.
- Produkthaftpflicht-Versicherung abschließen (Vertrag/Unterschrift).
- Entscheiden, ob ein Fachdienstleister ein rechtsgültiges SDB erstellen
  soll, falls sich aus der Recherche ein tatsächlicher Bedarf ergibt
  (das kann Claude nicht ersetzen — ein SDB ist ein amtlich relevantes
  Dokument mit Haftungsfolgen für den Ersteller).

**Status:** ❌ SDB-Frage offen, wartet auf Unterlagen · ❌ Produkthaftpflicht
laut Business Core noch nicht bestätigt abgeschlossen · ⚠️ GPSR-
Produktkennzeichnung fehlt

---

## 4. Verpackung & Umwelt

### Status-Check
- Business Core listet LUCID als P0, Status "Erledigung unbestätigt".

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
- Materialarten der aktuellen Verpackung konkret benennen (Dose:
  Kunststoff oder Metall? Karton-Typ? Füllmaterial?).
- LUCID-Registrierung selbst durchführen (Login mit eigenen
  Unternehmensdaten, nicht durch Claude ausführbar) und danach den
  Systembeteiligungsvertrag abschließen.

**Status:** ❔ nicht bestätigt erledigt — zweitschärfstes Bußgeldrisiko
nach Produkthaftung, sollte parallel zu Block 1 zuerst angegangen werden

---

## 5. Marktplatz-spezifische Pflichten

### Status-Check
- **eBay:** "Mich"-Seite laut `LUCA_TODO.md` D2 mit fertigem Text erledigt.
- **Kleinanzeigen:** Impressum auf Unternehmensseite laut `LUCA_TODO.md`
  D1 mit Anleitung erledigt — **nicht durch Claude einsehbar, ob wirklich
  live gespeichert.**
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
- Kurz bestätigen, ob das Kleinanzeigen-Impressum wirklich gespeichert
  und sichtbar ist (Screenshot reicht).
- Amazon-Timing final entscheiden (offene Frage aus `95_open_questions.md`
  Punkt 10).

**Status:** ✅ eBay/Kleinanzeigen wahrscheinlich erledigt (Bestätigung
ausstehend) · ❔ Amazon noch nicht spruchreif, aber Voraussetzungen jetzt
bekannt

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
| **P0** | Produkthaftpflichtversicherung | ❌ offen | 100–300 €/Jahr | Angebot einholen (exali/andsafe) |
| **P0** | LUCID-Registrierung + duales System | ❔ unbestätigt | Registrierung kostenlos, System nach Menge | Materialarten bestätigen → Anleitung von mir |
| **P0** | Widerrufsbelehrung: BMJ-Muster einfügen | ⚠️ Platzhalter im Code | 0 € | Textbaustein von mir, dann einfügen |
| **P0** | GPSR-Herstellerangaben auf Produktseiten | ❌ fehlt | 0 € (Textänderung) | Baustein von mir vorbereiten lassen |
| **P0** | Gewerbeanmeldung-Status bestätigen | ❔ unbekannt | ggf. 20–65 € einmalig | Kurz bestätigen |
| **P1** | Grundpreisangabe auf Produktseiten | ❌ fehlt | 0 € | In Produktseiten-Code einbauen |
| **P1** | SDS-/CLP-Einstufungs-Check für Rohstoffe | ❌ wartet auf Unterlagen | ggf. 0 € (keine Pflicht, falls unbedenklich) | Rechnungen/Downloads schicken |
| **P1** | Chargennummern-System (GPSR-Rückverfolgbarkeit) | ❌ fehlt | 0 € | Konzept von mir, Umsetzung in Produktion |
| **P1** | Datenschutzerklärung um Vercel Analytics ergänzen | ⚠️ Lücke | 0 € | Textvorschlag von mir |
| **P1** | AGB fertigstellen oder bewusst weglassen | ⚠️ Platzhalter | 0–20 €/Monat | Entscheidung treffen (siehe RECHTSTEXTE.md) |
| **P2** | DPMA-Markenanmeldung | ❌ offen | 290 € (ggf. -75 % Förderung) | Registerrecherche zuerst |
| **P2** | EU-Kleinunternehmer-IdNr. für Österreich | ❌ offen | 0 € | Erst relevant bei Wien-Launch |
| **P2** | Amazon-Vorbereitung (GTIN, GPSR-Feld) | ❔ noch nicht spruchreif | 0 € | Erst nach P0-Block 1/3/4 |

---

## Was ich von dir brauche, um weiterzumachen

1. **Rechnungen/Downloads der Rohstofflieferanten** (PTFE-Rohware,
   MoS₂-Pulver, GMS, BHT) — schick sie im Chat, dann starte ich die
   SDS-/CLP-Recherche direkt.
2. Bestätigung: Gewerbeanmeldung formal erfolgt — ja/nein?
3. Materialarten der aktuellen Verpackung (Dose-Material, Karton, Füllstoff).
4. Kurze Bestätigung, ob das Kleinanzeigen-Impressum wirklich live ist.
5. Grünes Licht, ob ich Angebote für Produkthaftpflicht vergleichend
   recherchieren soll.

Alles andere in dieser Liste ist bereits vorbereitet oder wartet nur auf
deine Entscheidung, nicht auf weitere Informationen von dir.
