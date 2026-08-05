# Rechtstexte für den eigenen Checkout

**Für:** Luca. Was gebraucht wird, woher es kommt, was es kostet.
**Stand:** 27. Juli 2026

> Ich bin kein Anwalt, und das hier ist keine Rechtsberatung. Es ist eine
> recherchierte Übersicht, damit du weißt, was du brauchst und wo du es am
> günstigsten bekommst. Die Entscheidung und die Haftung liegen bei dir.

---

## Die gute Nachricht zuerst

**AGB sind in Deutschland nicht vorgeschrieben.** Es gibt keine Pflicht,
Allgemeine Geschäftsbedingungen zu haben. Ohne AGB gilt schlicht das Gesetz —
und das ist für einen kleinen Shop mit einfachen Warenverkäufen meist völlig
ausreichend.

Was **tatsächlich Pflicht** ist, ist eine kürzere Liste:

| Pflicht | Status bei dir |
|---|---|
| Impressum | ✅ vorhanden |
| Datenschutzerklärung | ⚠️ muss um Stripe ergänzt werden |
| Widerrufsbelehrung | ❌ fehlt komplett |
| Muster-Widerrufsformular | ❌ fehlt komplett |
| **Widerrufsbutton (§ 356a BGB)** | ❌ fehlt — **seit 19.06.2026 Pflicht** |
| Preisangaben, Versandkosten, Lieferzeit vor Kaufabschluss | ⚠️ teilweise |
| Button „Zahlungspflichtig bestellen" | ⚠️ prüfen |

Deine **aktuellen AGB sind das eigentliche Problem**: Sie verweisen von der
ersten bis zur letzten Zeile auf eBay („Alle Käufe erfolgen ausschließlich über
die eBay-Plattform", „Rückgaben gemäß eBay-Käuferschutzgarantie"). Ab dem
ersten Verkauf über deine eigene Seite sind sie schlicht **falsch** — und
falsche AGB sind schlechter als gar keine.

---

## Warum ich dir die Texte nicht selbst schreibe

Ich habe es zweimal versucht, beide Male hat ein Ausgabefilter das Dokument
blockiert. Unabhängig davon wäre es aber auch nicht die beste Empfehlung
gewesen, und das ist der wichtigere Grund:

**Für die Widerrufsbelehrung gibt es ein amtliches Muster — und dessen
korrekte Verwendung ist gesetzlich privilegiert.** Wer das amtliche Muster
zutreffend ausgefüllt verwendet, erfüllt seine Informationspflichten
nachweislich. Ein von mir formulierter Text hätte diesen Schutz **nicht**,
egal wie gut er wäre. Ein selbstgeschriebener Text ist hier also nicht nur
gleich gut, sondern **schlechter als das kostenlose Original**.

Deshalb: amtliches Muster nehmen, nicht nachbauen.

---

## Was du woher bekommst

### 1. Widerrufsbelehrung + Muster-Widerrufsformular — **kostenlos**

Das Bundesjustizministerium stellt beide Muster gratis bereit:

**https://www.bmj.de** → Service → Formulare → „Musterbelehrungen
Widerrufsrecht im Fernabsatz"
(direkt: `bmjv.de/DE/service/formulare/form_widerrufsrecht/`)

Du füllst nur die eckigen Klammern aus. Deine Werte:

```
Name:      Luca Teichmann
Anschrift: Florentinerstraße 17, 70619 Stuttgart
E-Mail:    waxcelerate@gmail.com
Telefon:   [hast du noch nicht im Impressum — überlegen, ob du eine angibst]
Frist:     14 Tage
```

**Eine wichtige Ergänzung:** Das amtliche Muster stammt von 2014 und kennt den
Widerrufsbutton noch nicht. Seit dem 19.06.2026 muss die Belehrung auch auf die
elektronische Widerrufsfunktion hinweisen. Das ist genau der Punkt, an dem die
kostenpflichtigen Dienste gerade nachgelegt haben — siehe unten.

### 2. Widerrufsbutton — **baut Sonnet, kostet nichts**

Das ist Code, kein Rechtstext. Die Anforderungen aus § 356a BGB sind klar
umrissen und stehen ausformuliert in `UX_UPGRADE_PLAN.md`, Abschnitt 6.4:

- Schaltfläche **„Vertrag widerrufen"**, gut lesbar, direkt erreichbar
  (Footer + eigene Route `/widerruf`)
- Eingabemaske: **nur** Vertragsidentifikation (Bestellnummer, Datum, Produkt)
  und ein Kontaktweg für die Eingangsbestätigung
- **Der Widerrufsgrund darf nicht abgefragt werden** — auch nicht optional
- Bestätigungsschaltfläche **„Widerruf bestätigen"**
- Danach Eingangsbestätigung an den Kunden

Läuft technisch über dieselbe E-Mail-Infrastruktur wie die Bestellbestätigung
(`RESEND_API_KEY`). Kein zusätzlicher Dienst nötig.

**Risiko bei Nichtbeachtung:** Bußgelder bis 50.000 € plus Abmahnungen durch
Mitbewerber. Das ist der teuerste Einzelpunkt auf dieser Liste — und
gleichzeitig der, der dich am wenigsten kostet, wenn du ihn einfach machst.

### 3. AGB — **drei Wege**

| Weg | Kosten | Für dich |
|---|---|---|
| **Gar keine AGB** | 0 € | Zulässig. Es gilt das Gesetz. Die falschen eBay-AGB müssen dann aber **weg** — nicht stehenlassen. |
| **IHK-Muster** | 0 € | Die IHK Stuttgart stellt Mustertexte und kostenlose Erstberatung für Gründer bereit. Du bist dort ohnehin gemeldet. |
| **Rechtstext-Dienst mit Abmahnschutz** | ~10–20 €/Monat | IT-Recht Kanzlei, Händlerbund, eRecht24. Texte werden automatisch aktuell gehalten, inkl. Haftungsübernahme bei Abmahnung. |

### 4. Datenschutzerklärung ergänzen — **kostenlos**

Muss um Stripe erweitert werden: Datenübermittlung an Stripe Payments Europe
(Irland), Zweck, Rechtsgrundlage (Art. 6 Abs. 1 lit. b DSGVO —
Vertragserfüllung), Drittlandtransfer in die USA. Stripe stellt dafür eigene
Textbausteine bereit, die du übernehmen darfst.

---

## Meine Empfehlung

**Für die ersten Monate: rund 15 €/Monat für einen Rechtstext-Dienst.**

Ich schreibe das ungern, weil du ausdrücklich günstig bleiben willst. Aber
rechne kurz mit: Eine einzige Abmahnung kostet typischerweise das Zwanzig- bis
Fünfzigfache eines Jahresbeitrags. Und dieses Jahr ist ein besonders schlechtes
Jahr zum Sparen, weil der Widerrufsbutton **brandneu** ist — die Pflicht gilt
seit sechs Wochen, die Musterbelehrungen sind gerade erst angepasst worden, und
genau bei solchen Umstellungen fahren Abmahnkanzleien ihre Wellen.

Wenn der Shop nach ein paar Monaten läuft und die Texte stabil sind, kannst du
kündigen und die Texte behalten.

**Wenn du es trotzdem auf 0 € machen willst — das ist legitim:**

1. Widerrufsbelehrung + Formular vom BMJ, sorgfältig ausgefüllt
2. Widerrufsbutton bauen lassen (kostet dich nichts)
3. **Keine AGB** — die falschen eBay-AGB löschen, nicht ersetzen
4. Datenschutz um Stripe ergänzen
5. Versandkosten, Lieferzeit und Zahlungsarten sichtbar vor Kaufabschluss
6. Bei der IHK Stuttgart einmal kostenlos drüberschauen lassen

Das ist die schlanke Variante. Sie ist vertretbar — sie verlagert nur das
Restrisiko auf dich statt auf einen Dienstleister.

---

## Was Sonnet daraus baut

Ohne dass du vorher irgendetwas entscheiden musst:

- [ ] `/widerruf` — Route, Formular, Bestätigungsseite, E-Mail (§ 356a BGB)
- [ ] `/widerrufsbelehrung` — leere Seite mit Struktur, du fügst den BMJ-Text ein
- [ ] `AGBPage.tsx` — eBay-Inhalte raus (sie werden falsch)
- [ ] `DatenschutzPage.tsx` — Stripe-Abschnitt ergänzen
- [ ] `/versand-und-zahlung` — Versandkosten, Lieferzeit, Zahlungsarten
- [ ] Footer — Links auf alle Rechtsseiten inkl. Widerrufsbutton
- [ ] Produktseite + Warenkorb — Versandkosten und Lieferzeit sichtbar
- [ ] Letzter Button vor Stripe: „Zahlungspflichtig bestellen"
- [ ] `noindex` von Impressum und AGB nehmen — die sollen auffindbar sein

**Reihenfolge:** Alles bauen, im Stripe-Testmodus prüfen, dann Texte einsetzen,
**dann erst** live schalten. Nicht vorher.
