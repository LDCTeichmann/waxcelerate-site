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

## Offen für Luca

1. Co-Branding-Schwelle: Infoblatt #45 sagt 20 Blöcke, Masterplan und v7 sagen 10 (`COBRANDING_MIN_BLOCKS`, aktuell 20).
2. Ketten-Staffel „5–10 % ab Menge": genaue Stufen?
3. Konditionen im Partnerbereich stammen aus dem Masterplan (08.07.) und dem Infoblatt; Rewax-Mengenstufen widersprechen sich für Österreich (Mindestmenge 10, Stufe 5–9 entfällt; Masterplan §3 nennt für AT trotzdem 9,95 € je Kette bei 10). Bitte prüfen.
4. Rückversand-Laufzeit: Infoblatt-Grafik sagt „gewachst zurück in 48–72 h", Masterplan sagt DE ca. 5 Werktage. Auf der Seite steht keine Rückversand-Zeit, im Partnerbereich der Masterplan-Wert.
5. „Gewachst in Stuttgart und Leipzig" (v7-Schalter `localRewax`): hier nicht behauptet. Der Log vom 07.09. sagt „Leipzig als Standort ist tot".
6. `HG95` steht nur in PR #41 (mit Platzhalterbild) in `data.ts`. Nach dem Merge erscheint sie automatisch in der Sortimentliste.
7. Partnernamen für `?s=`-Links erst in `shops.ts` eintragen, wenn der Shop zugestimmt hat (Datei landet im öffentlichen Bundle).

## Phase 2 (nicht gebaut)

Partner-Rechner mit Reglern, Co-Branding-Vorschau (Shopname tippen, Etikett erscheint), QR-Generator je Shop, Oberfläche zum Verwalten der Codes, Kassettenlupe als Beleg-Grafik, Infoblatt-PDF zum Download im Partnerbereich.
