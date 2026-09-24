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

- **Rückversand-Laufzeit:** Rewax DE in der Regel 5 Werktage (3 Werktage Bearbeitung ab Ankunft laut `TURNAROUND` in `rewax/content.ts`, dazu Post). AT ca. 8–10 Werktage. Die „48–72 h“ im Infoblatt gelten für die Lagerlieferung von Ketten, nicht für den Rewax-Rückversand.
- **Co-Branding:** ab **15 Blöcken** im Direktkauf, bis zu zwei Etikettenvarianten, nie auf Kommission (`COBRANDING_MIN_BLOCKS`). Rechnung unten. Gilt, solange ein Etikett unter ca. 1,20 € kostet, sonst 20.
- **Wachs-Staffel bleibt** 19,50 / 18,00 / 16,50 € (Classic 500 g). EK 22 € wäre unattraktiv: Shop-Marge 7,95 € (26,5 %) läge unter Kommission (8,98 €, 30 %).
- **Österreich Rewax:** Mindestmenge 10, 9,95 € bis 19 Ketten je Sendung, 8,95 € ab 20, Rahmenvereinbarung 8,50 € ab 20 pro Woche. DE: 5–9 Ketten 9,95 €, ab 10 8,95 €.
- **Stempelkarten ohne Preisempfehlung** auf Seite und im Partnerbereich, weil die Website dieselben Karten direkt für 49,75 / 94,50 € verkauft (Pfad P09 im Masterplan, Weg A empfohlen, offen).
- **HG95** aus PR #41 übernommen (`data.ts`, Bilder, `excludeFromFeed`). Platzhalterfoto ist das HG93-Bild, der Merchant-Feed hält sie zurück.
- **Design:** Theme-Tokens statt fest dunkel, Foto-Einstieg (`rewax/hero.webp`) mit Scrim, Haarlinien statt Kacheln, große Serifzahlen nur für Kernzahlen, Gold nur im dunklen Abschlussband.

## Kalkulation Wachs (500 g Classic, UVP 29,95 €)

Annahmen: Herstellung 6,00 € (Luca), Verpackung 0,50 €, Karton 1,50 € je Sendung, Block 0,6 kg, DHL 2 kg 6,19 / 5 kg 7,70 € (Ops-Doku), 10 kg ≈ 10,80 € und 20 kg ≈ 16,50 € (**Annahme**), Luca zahlt Versand, ohne Arbeitszeit.

| Kanal | Shop-Marge | Luca-Erlös | nach Herstellung + Verpackung |
|---|---:|---:|---:|
| Kommission 30 % | 8,98 € | 20,96 € | 14,46 € |
| Direkt ab 3 (19,50) | 10,45 € (34,9 %) | 19,50 € | 13,00 € |
| Direkt ab 10 (18,00) | 11,95 € (39,9 %) | 18,00 € | 11,50 € |
| Direkt ab 25 (16,50) | 13,45 € (44,9 %) | 16,50 € | 10,00 € |

Deckungsbeitrag je Bestellung: 10 Blöcke 102,70 €, 15 Blöcke 160,20 €, 20 Blöcke 212,00 €. Co-Branding-Kosten (Etikett + 10 € Einrichtung + 15 Minuten) als Anteil der Erstbestellung: ab 10 Blöcken 17–26 %, ab 15 Blöcken 12–21 %, ab 20 Blöcken 10–18 % (Etikett 0,30 / 0,60 / 1,20 €). Zum Vergleich eBay: 21,23 € (heute) bzw. 16,26 € (gewerblich) je Block, ohne Arbeitszeit (P04). Wachs im B2B ist Türöffner für Ketten und Rewax, nicht der Gewinntreiber.

## Offen für Luca

1. **Kartenpreise (P09):** Website-Karten auf 69 / 129 € anheben (Weg A) oder Karten nur direkt. Bis dahin keine Empfehlung an Shops.
2. **Infoblatt #45 korrigieren:** Grafik „gewachst zurück in 48–72 h“, Kartenpreise 69–79 / 129–149 €, Co-Branding „ab 20“ → 15. Das Blatt liegt in #44/#45 in `public/` (öffentlich), v7 (#41) wollte es bewusst nicht dort: als PDF in den Partnerbereich statt öffentlich?
3. **Etikettenkosten** je Stück prüfen (Schwelle 15 gilt bis ca. 1,20 €).
4. **Versandregel Wachs:** frei Haus ab wie vielen Blöcken? (frei ab 10 kostet ca. 1,10–1,20 € je Block)
5. **DHL-Preise** für 10 kg, 20 kg und Österreich verifizieren.
6. **Herstellkosten je Block** belegen (6 € ist Lucas Angabe, P04 deutet auf rund 7–8 € inkl. Material).
7. **Ketten-Staffel** „5–10 % ab Menge“: genaue Stufen?
8. **„Gewachst in Stuttgart und Leipzig“** (v7-Schalter `localRewax`): hier nicht behauptet, der Log vom 07.09. sagt „Leipzig als Standort ist tot“.
9. **HG95:** eigenes Foto, eBay-Artikelnummer.
10. Partnernamen für `?s=`-Links erst in `shops.ts` eintragen, wenn der Shop zugestimmt hat (Datei landet im öffentlichen Bundle).

## Phase 2 (nicht gebaut)

Partner-Rechner mit Reglern, Co-Branding-Vorschau (Shopname tippen, Etikett erscheint), QR-Generator je Shop, Oberfläche zum Verwalten der Codes, Kassettenlupe als Beleg-Grafik, Infoblatt-PDF zum Download im Partnerbereich.
