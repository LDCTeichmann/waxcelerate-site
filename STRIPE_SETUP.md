# Stripe einrichten — Schritt für Schritt

**Für:** Luca. Kein Vorwissen nötig, kein Stripe-Konto vorhanden.
**Dauer:** ca. 45 Minuten, davon 20 Minuten Warten auf Stripes Prüfung.
**Was du am Ende hast:** 12 Produkte in Stripe, 12 IDs zum Zurückschicken, und
einen funktionierenden Testkauf.

> **Wichtig:** Arbeite die Schritte 1–8 im **Testmodus** ab. Da fließt kein
> echtes Geld, und du kannst nichts kaputt machen. Erst Schritt 10 schaltet
> live — und der kommt erst, wenn auch die Rechtstexte stehen.

---

## Was Stripe dich kostet

Keine Grundgebühr, keine Einrichtungskosten. Nur pro Verkauf:

| Zahlungsart | Gebühr | Bei 29,95 € bleiben dir |
|---|---|---|
| Karte (EU-Standard) | ~1,5 % + 0,25 € | ~29,25 € |
| Karte (Premium/international) | ~1,9–2,9 % + 0,25 € | ~28,83–28,83 € |
| SEPA-Lastschrift | 0,35 € pauschal | ~29,60 € |
| Klarna | höher, im Dashboard prüfen | — |

Zum Vergleich: eBay nimmt je nach Kategorie deutlich mehr. Der Wechsel lohnt
sich rechnerisch — die Frage ist nur, ob dir der Rechtsaufwand das wert ist.

**Tipp:** SEPA-Lastschrift ist bei euren Preisen die günstigste Variante für
dich. Sie ist im Code schon aktiviert.

---

## Schritt 1 — Konto anlegen (5 Min)

1. Gehe auf **https://dashboard.stripe.com/register**
2. E-Mail, Name, Passwort → Konto erstellen
3. E-Mail bestätigen
4. Land: **Deutschland**, Währung: **EUR**

Du landest im Dashboard. Oben rechts siehst du einen Schalter
**„Testmodus"** — der muss **AN** sein. Alles Folgende passiert im Testmodus.

---

## Schritt 2 — Geschäftsdaten (10 Min)

Stripe fragt nach Angaben zur Identifizierung. Das ist Pflicht (Geldwäsche-
gesetz), nicht optional.

| Feld | Deine Antwort |
|---|---|
| Unternehmensart | **Einzelunternehmen / Einzelperson** |
| Branche | Sportartikel / Fahrradzubehör |
| Website | `https://waxcelerate.de` |
| Name | Luca Teichmann |
| Adresse | Florentinerstraße 17, 70619 Stuttgart |
| USt-IdNr. | **freilassen** — du bist Kleinunternehmer nach § 19 UStG |
| Bankverbindung | Deine IBAN (dorthin zahlt Stripe aus) |
| Ausweis | Perso oder Reisepass fotografieren |

Stripe prüft das im Hintergrund. Kann ein paar Stunden dauern — du kannst
währenddessen weitermachen.

**Produktbeschreibung für Kunden auf dem Kontoauszug:** trag `WAXCELERATE` ein.
Das sehen Kunden auf ihrer Abrechnung. Unklare Bezeichnungen sind der
häufigste Grund für Rückbuchungen.

---

## Schritt 3 — ⚠️ Stripe Tax AUSSCHALTEN (2 Min)

**Das ist der wichtigste Schritt im ganzen Dokument.**

Du bist Kleinunternehmer nach § 19 UStG und darfst **keine Umsatzsteuer
ausweisen**. Wenn Stripe Tax aktiv ist, rechnet Stripe automatisch 19 % drauf
oder weist sie auf der Rechnung aus — beides wäre falsch und im Zweifel ein
Steuerproblem.

1. Links im Menü: **Einstellungen** (Zahnrad oben rechts)
2. Suche nach **„Tax"** bzw. **„Steuern"**
3. Falls dort etwas aktiviert ist: **deaktivieren**
4. Bei den Preisen später darauf achten: **„Preis inklusive Steuern"** bzw.
   Steuerverhalten **„keine Steuer"**

Wenn du unsicher bist, mach einen Screenshot der Steuer-Einstellungen und
zeig ihn mir oder Sonnet. Das ist schnell geprüft.

---

## Schritt 4 — Die 12 Produkte anlegen (15 Min)

Menü links: **Produktkatalog** → **Produkt hinzufügen**.

Für jedes Produkt brauchst du nur drei Angaben: **Name**, **Preis**, und
**einmalige Zahlung** (nicht Abo!).

Hier ist die komplette Liste. Namen exakt so übernehmen — dann stimmt später
alles überein:

### Wachs

| # | Name | Preis |
|---|---|---|
| 1 | Kettenwachs 500g — Classic | 29,95 € |
| 2 | Kettenwachs 300g — Classic | 22,95 € |
| 3 | Kettenwachs 500g — Pro | 34,95 € |
| 4 | Kettenwachs 300g — Pro | 26,95 € |

### Vorgewachste Ketten

| # | Name | Preis |
|---|---|---|
| 5 | Shimano Ultegra HG701 11-fach — vorgewachst | 44,90 € |
| 6 | YBN 11S 11-fach — vorgewachst | 34,95 € |
| 7 | SRAM Force PC-1170 11-fach — vorgewachst | 39,95 € |
| 8 | Shimano Dura-Ace / XTR CN-M9100 12-fach — vorgewachst | 69,95 € |
| 9 | Shimano XT / Ultegra CN-M8100 12-fach — vorgewachst | 54,95 € |
| 10 | Shimano SLX / 105 CN-M7100 12-fach — vorgewachst | 44,95 € |
| 11 | SRAM NX Eagle 12-fach — vorgewachst | 44,95 € |
| 12 | YBN S12S 12-fach — vorgewachst | 39,95 € |

**Bei jedem Produkt einstellen:**
- Preismodell: **Pauschalpreis** / einmalig — **kein Abo**
- Währung: **EUR**
- Steuerverhalten: **inklusive** bzw. keine Steuer (siehe Schritt 3)

**Versandkosten NICHT als Produkt anlegen.** Die berechnet die Website
automatisch (1,80 € Großbrief / 2,90 € Maxibrief / 4,90 € Paket, ab 50 € frei).

---

## Schritt 5 — Die 12 Preis-IDs kopieren (5 Min)

Das ist das, was ich von dir brauche.

Klick jedes Produkt an. Unter **Preise** steht eine ID, die mit **`price_`**
beginnt — z. B. `price_1QxYzABC123def456`.

⚠️ **Nicht verwechseln:** Es gibt auch IDs mit `prod_` — die brauche ich
**nicht**. Nur die mit `price_`.

Kopier sie in diese Liste und schick sie mir zurück. Einfach ausfüllen:

```
wax-500        (Kettenwachs 500g Classic, 29,95 €) = price_
wax-300        (Kettenwachs 300g Classic, 22,95 €) = price_
wax-500-mos2   (Kettenwachs 500g Pro,     34,95 €) = price_
wax-300-mos2   (Kettenwachs 300g Pro,     26,95 €) = price_

chain-hg701    (Shimano Ultegra HG701,    44,90 €) = price_
chain-ybn11    (YBN 11S,                  34,95 €) = price_
chain-force    (SRAM Force PC-1170,       39,95 €) = price_
chain-m9100    (Shimano Dura-Ace/XTR,     69,95 €) = price_
chain-m8100    (Shimano XT/Ultegra,       54,95 €) = price_
chain-m7100    (Shimano SLX/105,          44,95 €) = price_
chain-nx       (SRAM NX Eagle,            44,95 €) = price_
chain-ybn12    (YBN S12S,                 39,95 €) = price_
```

---

## Schritt 6 — API-Schlüssel holen (2 Min)

Menü: **Entwickler** → **API-Schlüssel**

Du siehst zwei Werte:

| Name | Beginnt mit | Wofür |
|---|---|---|
| Veröffentlichbarer Schlüssel | `pk_test_…` | brauchen wir **nicht** |
| Geheimer Schlüssel | `sk_test_…` | **den brauche ich** |

Beim geheimen Schlüssel auf **„Anzeigen"** klicken und kopieren.

> 🔒 **Der geheime Schlüssel ist wie ein Passwort für dein Geld.** Schick ihn
> mir **nicht** hier im Chat. Trag ihn direkt selbst in Vercel ein — das ist
> Schritt 7. Wenn er doch mal irgendwo landet, wo er nicht hingehört: im
> Dashboard unter „API-Schlüssel" auf **„Rollieren"** klicken, dann ist der
> alte sofort wertlos.

---

## Schritt 7 — Schlüssel in Vercel eintragen (5 Min)

1. **https://vercel.com** → dein Projekt `waxcelerate-site`
2. **Settings** → **Environment Variables**
3. Diese Einträge anlegen:

| Name | Wert |
|---|---|
| `STRIPE_SECRET_KEY` | dein `sk_test_…` aus Schritt 6 |
| `SITE_URL` | `https://waxcelerate.de` |
| `RESEND_API_KEY` | für Bestell-E-Mails — falls noch nicht da, sag Bescheid |

Für jede Variable **alle drei Umgebungen** ankreuzen (Production, Preview,
Development).

**Falls dort noch `STRIPE_SHIPPING_FREE` oder `STRIPE_SHIPPING_STANDARD`
stehen:** die kannst du löschen. Der neue Code berechnet den Versand selbst und
braucht sie nicht mehr.

---

## Schritt 8 — Webhook einrichten (5 Min)

Der Webhook ist die Leitung, über die Stripe der Website meldet „Zahlung ist
durch". Ohne ihn bekommst du keine Bestell-E-Mail und der Lagerbestand wird
nicht heruntergezählt.

1. Stripe-Dashboard: **Entwickler** → **Webhooks** → **Endpunkt hinzufügen**
2. URL: `https://waxcelerate.de/api/stripe-webhook`
3. Ereignisse auswählen: **`checkout.session.completed`**
4. Speichern
5. Auf dem neuen Endpunkt: **Signaturgeheimnis** anzeigen (beginnt mit `whsec_`)
6. In Vercel als `STRIPE_WEBHOOK_SECRET` eintragen (wie Schritt 7)

---

## Schritt 9 — Testkauf (5 Min)

Sobald Sonnet die Preis-IDs eingebaut hat:

1. Website öffnen, ein Produkt in den Warenkorb legen
2. Zur Kasse gehen
3. **Diese Testkarte benutzen:**
   ```
   Kartennummer: 4242 4242 4242 4242
   Ablaufdatum:  irgendein Datum in der Zukunft (z. B. 12/30)
   CVC:          beliebige 3 Ziffern (z. B. 123)
   PLZ:          beliebig
   ```
4. Bestellung abschließen

**Das musst du danach prüfen:**

- [ ] Landet die Seite auf „Bestellung erfolgreich"?
- [ ] Steht im Stripe-Dashboard unter **Zahlungen** der Testkauf?
- [ ] Stimmt der **Versandbetrag** (1,80 / 2,90 / 4,90 € / 0 € ab 50 €)?
- [ ] Wurde **keine Umsatzsteuer** ausgewiesen?
- [ ] Kam die Bestell-E-Mail an?
- [ ] Steht auf der Rechnung der § 19-UStG-Hinweis?

Wenn irgendetwas davon nicht stimmt: **nicht live schalten.** Screenshot machen,
Sonnet zeigen.

---

## Schritt 10 — Live schalten (erst zum Schluss!)

⛔ **Vorher müssen diese Punkte abgehakt sein:**

- [ ] Testkauf aus Schritt 9 komplett erfolgreich
- [ ] Widerrufsbutton auf der Seite gebaut und getestet (Pflicht seit
      19.06.2026, Bußgeld bis 50.000 €)
- [ ] Widerrufsbelehrung + Muster-Widerrufsformular online
- [ ] AGB überarbeitet — die aktuellen verweisen komplett auf eBay und wären
      ab dem ersten Eigenverkauf schlicht falsch
- [ ] Datenschutzerklärung um Stripe ergänzt
- [ ] Versandkosten und Lieferzeit vor dem Bestellabschluss sichtbar
- [ ] Stripe-Kontoprüfung aus Schritt 2 abgeschlossen

Erst dann:

1. Stripe-Dashboard: Schalter **„Testmodus"** ausschalten
2. Schritte 4–8 **im Live-Modus wiederholen** — Produkte, Preis-IDs, API-Key
   und Webhook sind im Live-Modus **komplett andere Werte**. Das ist der
   Punkt, an dem die meisten stolpern.
3. Die neuen `price_…`-IDs an Sonnet, den neuen `sk_live_…` in Vercel
4. **Ersten echten Kauf selbst machen**, mit deiner eigenen Karte, für 22,95 €.
   Danach in Stripe stornieren/erstatten. Das ist die einzige Prüfung, die
   wirklich zählt.

---

## Wenn etwas klemmt

| Problem | Ursache |
|---|---|
| „Stripe not yet configured" | Die `price_`-ID fehlt für dieses Produkt |
| Checkout-Button tut nichts | `STRIPE_SECRET_KEY` fehlt in Vercel oder Deploy fehlt |
| Keine Bestell-E-Mail | Webhook nicht eingerichtet oder `whsec_` falsch |
| Steuer wird ausgewiesen | Stripe Tax ist an → Schritt 3 |
| Falscher Versandbetrag | `weightGrams` / `shippingClass` in `data.ts` prüfen |
| Live geht nicht, Test schon | Live-Modus braucht eigene Keys und eigene Produkte |

---

## Ganz kurz — was du wirklich tun musst

1. Konto anlegen, Daten eintragen
2. **Stripe Tax ausschalten** ← der eine Schritt, den man nicht vergessen darf
3. 12 Produkte anlegen
4. 12 `price_`-IDs kopieren und mir schicken
5. `sk_test_…` und `whsec_…` selbst in Vercel eintragen
6. Testkauf machen
7. Rechtstexte fertigstellen
8. Live schalten und einmal selbst echt kaufen

Alles andere ist gebaut.
