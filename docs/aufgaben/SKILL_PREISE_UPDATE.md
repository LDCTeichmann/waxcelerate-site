# Korrekturblock für das `waxcelerate`-Skill

Das Skill liegt bei mir nur als **schreibgeschützter Cache**. Ich kann es lesen,
aber nicht ändern. Deshalb hier der fertige Block: in
`references/20_products_pricing.md` den Abschnitt 5 ersetzen und Abschnitt 8
ergänzen. Zwei Minuten Copy-Paste, danach kann keine Session mehr die alten
Preise ziehen.

---

## 5. Kettenwachs-Service (B2C) · Stand 2026-09-07

**Zwei Leistungen**, beide reiner Postversand deutschlandweit (Stuttgart, kein
Leipzig-Standort mehr). Bearbeitung 3–5 Werktage ab Ankunft bei uns, dazu je
1–2 Werktage Postlaufzeit hin und zurück.

### Auffrischung — bereits gewachste Kette neu wachsen
- **15,95 € je Kette** einzeln, zzgl. **1,80 € Rückversand** (Großbrief)
- **11,95 € je Kette ab drei Ketten**, zzgl. **2,90 € Rückversand** (Maxibrief,
  einmal je Sendung)
- Altes Wachs löst kochendes Wasser, ganz ohne Lösemittel; dann frisches Bad.

### Umstieg — geölte oder fabrikneue Kette entfetten und erstmals wachsen
- **24,95 € je Kette** einzeln, **21,95 €** ab drei Ketten, zzgl. Rückversand
- Wie das volle Programm des Wettbewerbs (Kettenhelden 39,95 €, bikeoptimierung
  34,90 €), ~10 € günstiger.
- Ablauf: die Kette kommt zuerst in ein **separates Ultraschallbad**, wird
  gründlich entfettet und getrocknet, **bevor** sie das erste Mal ins Wachs
  geht. Das Wachsbad sieht nie eine ölige Kette (Öl schwimmt oben, blockiert
  die Penetration, macht eine ganze Charge unbrauchbar).
- **Ersetzt** die frühere Aussage "kein Entfetten geölter Ketten". Setzt
  voraus, dass der Betrieb den separaten Entfetter-Prozess leistet
  (Code-Flag `UMSTIEG_LIVE` in `src/pages/rewax/content.ts`).

### Prepaid-Karten (5er / 10er) — nur für die Auffrischung
- All-in: Kartenpreis deckt Wachsen **und** Rückversand. Übertragbar, kein
  Ablaufdatum, wir führen die Karte.
- **5er-Karte: 49,75 €** (9,95 €/Vorgang) → Ersparnis 30,00 € gegen 5 × 15,95 €
- **10er-Karte: 94,50 €** (9,45 €/Vorgang) → Ersparnis 65,00 € gegen 10 × 15,95 €
- Nach außen nur die Euro-Ersparnis, kein Prozentsatz.

Diese Zahlen **ersetzen** 13,95 / 9,95 und alles davor (9,99 / 24,99, die alte
10er-Karte zu 89,55 €).

## 8. Zubehör und Sets (neu, B2C)

- **Aufhängedraht, 3 Stück: 4,95 €** zuzüglich 1,80 € Versand
- **Quick-Link-Zange: 4,95 €**
- **Starter-Set:** ein Wachs plus eine vorgewachste Kette, Zange und Draht
  liegen immer bei. Preis **15 Prozent unter der Summe der Einzelteile**.
  Nach außen wird die **Ersparnis in Euro** genannt, nicht der Prozentsatz.
  Vier feste Kombinationen (Stand 2026-09-06):
  - **Ohne Kette** — Kettenwachs 300 g Classic + Zange + Draht, **keine Kette** →
    **27,92 €** (Ersparnis 4,93 €). Günstigster Einstieg, für alle mit schon
    vorhandener wachsbarer Kette. Draht + Zange sind der einmalige Fixkostenteil,
    nachgekauft wird nur Wachs.
  - **Classic** — Kettenwachs 300 g Classic + YBN 11S 11-fach → **57,63 €**
    (Ersparnis 10,17 €). Bewusst der kleine 300-g-Block: günstiger Einstieg.
  - **HG701** — Kettenwachs 500 g Classic + Shimano Ultegra HG701 11-fach →
    **72,04 €** (Ersparnis 12,71 €).
  - **Pro** — Kettenwachs 500 g Pro + Shimano XT/Ultegra M8100 12-fach →
    **84,83 €** (Ersparnis 14,97 €).
  Daneben ein freier Konfigurator (jedes Wachs × jede Kette, immer mit Kette).
- **Mengenstaffel Wachs:** 2 Stück 5 %, 3 Stück 10 %, ab 5 Stück 15 %.
  **Gilt ausschließlich auf Kettenwachs, nie auf Ketten.** Begründung: eine
  Kette kauft man einmal pro Rad, Rabatt darauf verschenkt Marge ohne Menge zu
  bewegen. Wachs ist Verbrauchsmaterial.
- Kein Dauerrabatt-Badge auf Produktkarten. Die Staffel steht einmal ruhig über
  der Liste.

## Ergänzung zu `30_claims_language.md`

- **„Leiser Antrieb" ist freigegeben** (Luca, 2026-07-29) und darf als
  Nutzenargument verwendet werden.
- **PTFE aktiv nennen**, ruhig und mit dem Antihaft-Vergleich. Verschweigen
  wirkt wie ein Geheimnis, und die Pro-Linie verkauft sich besser, wenn die
  Classic-Linie ehrlich benannt ist.
- **Wattwerte** immer mit Eingangsleistung: 2 bis 4 W gegen 6 bis 10 W bei
  300 bis 400 W Eingangsleistung.
- **Kettenlaufzeit** immer als Spanne „2 bis 3×", nie als „3×".
