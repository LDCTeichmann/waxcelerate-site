# Partner-Seite (B2B) — Konzept und Betrieb

Stand 24.09.2026. Ziel der Seite: Ziel des QR-Codes im Partner-Infoblatt (aktuelle Fassung: PR #45).
Shops, die das Blatt bekommen oder die Seite selbst finden, sehen, was drin ist, wie es läuft und wie sie Kontakt aufnehmen. Konditionen sehen nur Partner mit Code.

## Drei Stufen

| Stufe | URL | Sichtbarkeit |
|---|---|---|
| Partnerseite | `/partner` (Kurzlinks `/fachhandel`, `/haendler` → 301) | indexierbar, Sitemap (Priorität 0.3), nur kleiner Footer-Link „Für den Fachhandel", nicht in Topbar/Menü/Startseite, nicht in `llms.txt` |
| Konditionen | `/partner/konditionen` | `noindex` (Header in `vercel.json` + Meta), nie in der Sitemap; Inhalt nur von `/api/partner-access` nach Code-Login |
| Personalisierter QR | `/partner?s=<slug>&q=qr` | wie Partnerseite; „Für <Shop>" nur für Slugs aus `src/pages/partner/shops.ts` (Whitelist, bewusst leer ausgeliefert) |

## Wo was liegt

- Seite: `src/pages/PartnerPage.tsx`, Texte in `src/pages/partner/content.ts` (Preise/Ketten aus `data.ts`), Formular `PartnerRequestForm.tsx`
- Partnerbereich: `src/pages/PartnerAreaPage.tsx` (zeigt nur, was die API liefert)
- API: `api/partner-access.ts` (Login, Cookie, Konditionentext — **nur hier, nie in `src/`**), `api/partner-request.ts` (Testpaket-Anfrage per Mail)
- Codes: `scripts/partner-code.mjs`
- Vorrender: Eintrag `partner` in `NEW_STATIC_PAGES` (`scripts/generate-blog-html.mjs`)
- Tracking: `trackPartnerView/Cta/CodeOk` in `src/lib/analytics.ts` (`?q=qr|mail|…` als Quelle)

## Betrieb

Einmalig in Vercel (Environment Variables): `PARTNER_SESSION_SECRET` (mind. 32 zufällige Zeichen). `UPSTASH_REDIS_REST_URL/TOKEN` und `RESEND_API_KEY` sind vom Lager/Widerruf schon da. Ohne `PARTNER_SESSION_SECRET` antwortet der Partnerbereich mit 503 und zeigt „gerade nicht erreichbar" mit WhatsApp-Link.

```bash
# Zugang: UPSTASH-Variablen in der Umgebung oder in .env.local
node scripts/partner-code.mjs create "Beispiel Rad" "Leipzig" DE   # oder AT
node scripts/partner-code.mjs list
node scripts/partner-code.mjs revoke WX-XXXX-XXXX-XXXX             # wirkt sofort, auch für eingeloggte Browser
node scripts/partner-code.mjs restore WX-XXXX-XXXX-XXXX
```

`create` gibt einen Link `…/partner/konditionen?c=<CODE>` aus (für Mail oder zweiten QR). Beim ersten Login eines Codes geht eine Mail an waxcelerate@gmail.com. Rate-Limit: 10 Versuche je IP und 15 Minuten.

Konditionen ändern: `buildConditions()` in `api/partner-access.ts`. Preisempfehlungen kommen dort aus `data.ts`.

## Regeln

Copy-Regeln stehen im Kopf von `content.ts` (Sie-Form, UVP-Sprache, „0 € Warenrisiko", 400–550 km, keine Gedankenstriche). Nie in Seite oder API: interne Margen, Ketten-Rohertrag, Formel, „Kette zum EK für Mechaniker".

## Entschieden am 24.09.2026

- **Sortiment für Läden: nur MoS₂ Pro 500 g** (online 34,95 €). Ladenpreis-Empfehlung 34,95 € wie online, damit kein Preisunterschied zum eigenen Shop entsteht. Shops dürfen höher ansetzen.
- **Staffel (Einkaufspreis netto je Block):** ab 3 Blöcken 22,50 €, ab 8 Blöcken 21,00 €, ab 16 Blöcken 19,50 €, ab 32 Rahmenvereinbarung. Die Stufen liegen an den DHL-Gewichtsklassen (0,6 kg je Block: 3 = 2 kg, 8 = 5 kg, 16 = 10 kg). Shop-Marge bei 34,95 €: 35,6 / 39,9 / 44,2 %.
- **Kommission** 30 %: Laden 10,49 € (auf der Seite „rund 10,50 €“), du 24,46 € je Block. **Testpaket: 8 Blöcke** in einem 5-kg-Paket (7 auf Kommission, 1 gratis für die Werkstatt).
- **Versand Wachs:** frei Haus ab 8 Blöcken, darunter 7,70 € (nur im Partnerbereich).
- **Co-Branding ab 16 Blöcken** (volles 10-kg-Paket, eine Etikettenvariante), nie auf Kommission.
- **Rückversand-Laufzeit:** Rewax DE in der Regel 5 Werktage (3 Werktage Bearbeitung ab Ankunft, `TURNAROUND` in `rewax/content.ts`, dazu Post), AT ca. 8–10. Die „48–72 h“ im Infoblatt gelten für Lagerketten.
- **Österreich Rewax:** Mindestmenge 10, 9,95 € bis 19 Ketten je Sendung, 8,95 € ab 20, Rahmenvereinbarung 8,50 € ab 20 pro Woche. DE: 5–9 Ketten 9,95 €, ab 10 8,95 €.
- **Stempelkarten ohne Preisempfehlung**, weil die Website dieselben Karten direkt für 49,75 / 94,50 € verkauft (P09, Weg A empfohlen, offen).
- **HG95** aus PR #41 übernommen (Platzhalterfoto, Merchant-Feed hält sie zurück).
- **Design:** Theme-Tokens, Foto-Einstieg, Haarlinien, Serifzahlen sparsam, Gold nur im dunklen Abschlussband.

## Kalkulation Wachs (MoS₂ Pro 500 g, UVP 34,95 €)

Annahmen: Herstellung 6,00–7,00 € (Luca), Verpackung 0,70 €, Karton 1,50 € je Sendung, 0,6 kg je Block, DHL 2 kg 6,19 / 5 kg 7,70 € (Ops-Doku), 10 kg ≈ 10,80 € und 20 kg ≈ 16,50 € (**Annahme**), ohne Arbeitszeit. Kosten je Block 6,70 / 7,20 / 7,70 €, Rechnung mit 7,20 €. Unter 8 Blöcken zahlt der Laden 7,70 € Versand, ab 8 zahlst du.

| Blöcke | EK | Umsatz | Gewinn | je Block | Spanne je Block |
|---:|---:|---:|---:|---:|---:|
| 3 | 22,50 € | 67,50 € | 44,40 € | 14,80 € | 14,30–15,30 € |
| 5 | 22,50 € | 112,50 € | 75,00 € | 15,00 € | 14,50–15,50 € |
| 8 | 21,00 € | 168,00 € | 101,20 € | 12,65 € | 12,15–13,15 € |
| 10 | 21,00 € | 210,00 € | 125,70 € | 12,57 € | 12,07–13,07 € |
| 16 | 19,50 € | 312,00 € | 184,50 € | 11,53 € | 11,03–12,03 € |
| 32 | 19,50 € | 624,00 € | 375,60 € | 11,74 € | 11,24–12,24 € |

Kommission (Testpaket: 8 Blöcke, davon 7 auf Kommission und 1 gratis; 5 verkauft, 2 zurück, Rückversand 7,70 €): 62,22 € Gewinn, das sind 12,44 € je verkauftem Block inklusive des Gratisblocks (bei 6 von 7 verkauft: 79,49 €, also 13,25 € je Block). Schlimmster Fall: rund 16,90 € Versand hin und zurück plus der Gratisblock (7,20 €), die Kommissionsware bleibt Lager. Bei UVP 39,95 € wären es je Block rund 3,50 € mehr, aber 5 € Abstand zum Online-Preis (Kanalkonflikt). eBay Pro 500 g zum Vergleich: 29,46 € (heute) bzw. 23,46 € (gewerblich) je Block, aber mit Einzelversand und Kundenservice (P04).

Co-Branding-Kosten (Etikett + 10 € Einrichtung + 5 € Zeit) als Anteil der Erstbestellung: ab 8 Blöcken 17–24 %, ab 16 Blöcken 11–19 %, ab 24 Blöcken 8–16 % (Etikett 0,30 / 0,60 / 1,20 €).

## Offen für Luca

1. **Kartenpreise (P09):** Website-Karten auf 69 / 129 € anheben (Weg A) oder Karten nur direkt. Bis dahin keine Empfehlung an Shops.
2. **Infoblatt #45 korrigieren:** nennt noch Classic und 300 g, Kartenpreise 69–79 / 129–149 €, Co-Branding „ab 20“, „gewachst zurück in 48–72 h“ (gilt nur für Lagerketten), Testpaket „5–10 Blöcke“. Das Blatt liegt in #44/#45 in `public/` (öffentlich), v7 (#41) wollte es bewusst nicht dort: als PDF in den Partnerbereich statt öffentlich?
3. **Etikettenkosten** je Stück prüfen (Schwelle 16 gilt bis ca. 1,20 €).
4. **DHL-Preise** für 10 kg, 20 kg und Österreich verifizieren (Staffelgrenzen hängen an den Gewichtsklassen).
5. **Herstellkosten je Block** belegen (6–7 € sind Lucas Angabe, P04 deutet auf rund 7–8 € inkl. Material und Label).
6. **Service-Gebinde 1 kg** (Masterplan: nur für Service-Partner): aus dem Partnerbereich genommen, weil das Sortiment jetzt nur Pro 500 g ist. Wieder aufnehmen?
7. **Ketten-Staffel** „5–10 % ab Menge“: genaue Stufen?
8. **„Gewachst in Stuttgart und Leipzig“** (v7-Schalter `localRewax`): hier nicht behauptet, der Log vom 07.09. sagt „Leipzig als Standort ist tot“.
9. **HG95:** eigenes Foto, eBay-Artikelnummer.
10. Partnernamen für `?s=`-Links erst in `shops.ts` eintragen, wenn der Shop zugestimmt hat (Datei landet im öffentlichen Bundle).
11. **Hebel:** online und Ladenpreis gemeinsam auf 36,95 € testen (+1,40 € je Kommissionsblock), Bestellung in 8er-Kartons anbieten.

## Phase 2 (nicht gebaut)

Partner-Rechner mit Reglern, Co-Branding-Vorschau (Shopname tippen, Etikett erscheint), QR-Generator je Shop, Oberfläche zum Verwalten der Codes, Kassettenlupe als Beleg-Grafik, Infoblatt-PDF zum Download im Partnerbereich.
