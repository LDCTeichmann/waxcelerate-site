# Deine Liste — stur von oben nach unten

**Stand:** 2026-09-06. Diese Datei ersetzt die alte (Aug-Version war veraltet).
**Regel:** Nichts hier verlangt Nachdenken. Kopieren, einfügen, fertig.
**Wenn du müde bist:** Mach nur **Teil 1** (15 Min). Der Rest kann warten.

---

## Gerade live gegangen (nichts zu tun)

Alles aus den letzten Sessions ist auf `main` und via Vercel deployed:
Rechner-Sektion (Optik + Logik + Kalender + Auffindbarkeit), Mobile-Hero,
Reviews, Rewax/Starter-Set, ScienceTeaser. Build war grün, Live-Check ok.

Wenn du magst, einmal draufschauen: **waxcelerate.de/rechner** und auf dem Handy
die Startseite.

---

# TEIL 1 — Die neuen Rechner-Seiten bei Google & Bing anmelden · 15 Min

**Warum:** Die 7 Rechner-Seiten sind neu. Google findet sie sonst erst in Wochen
von selbst. Anmelden = Tage statt Wochen.

## 1a. Bing / ChatGPT (1 Befehl, 30 Sek)

Terminal öffnen, das hier reinkopieren:

```bash
cd ~/"Claude Playground"/waxcelerate-site && npx tsx scripts/ping-indexnow.mjs
```

Fertig, wenn „HTTP 202" o. ä. kommt. (Bing-Index = auch DuckDuckGo und
ChatGPT-Suche.)

## 1b. Google Search Console (10–15 Min, stumpfes Klicken)

1. Öffne **search.google.com/search-console**
2. Oben die Suchleiste („URL prüfen") — die erste URL einfügen — Enter
3. Warten, bis die Prüfung durch ist — Knopf **„Indexierung beantragen"** klicken
4. Bestätigen, warten bis „Anfrage gesendet" — dann die nächste URL

Diese 7, eine nach der anderen:

```
https://waxcelerate.de/rechner
https://waxcelerate.de/rechner/verschleiss
https://waxcelerate.de/rechner/intervall
https://waxcelerate.de/rechner/passende-kette
https://waxcelerate.de/rechner/kettenlaenge
https://waxcelerate.de/rechner/umstieg
https://waxcelerate.de/rechner/ersparnis
```

Falls Google „Kontingent für heute erschöpft" sagt: Rest morgen, gleiches Vorgehen.

---

# TEIL 2 — Backlinks, die nur du setzen kannst · ~20 Min, wenn du Energie hast

**Warum:** Die Rechner ranken erst, wenn irgendwer von außen auf die Domain
verweist. Das sind die Quellen, die komplett in deiner Hand liegen.

- [ ] **Kleinanzeigen-Impressum** (5 Min). kleinanzeigen.de → dein Name oben
      rechts → Unternehmensseite → Rechtliche Angaben. Falls ein Feld „Website"
      da ist: `https://waxcelerate.de` rein. Sonst ans Ende des Impressumstexts.
      Erscheint danach automatisch unter jeder Anzeige.
- [ ] **eBay „Mich"-Seite** (5 Min). Fertiger Text liegt in
      `docs/aufgaben/EBAY_MICH_SEITE.md` — kopieren, einfügen, speichern.
      (Link nur auf der Profilseite, NICHT in Artikelbeschreibungen.)
- [ ] **velomarkt.de** + **buycycle.com** (5 Min). Bei beiden im
      Verkäuferprofil / Inserat das Website-Feld mit `https://waxcelerate.de`
      füllen.
- [ ] **bikeoptimierung.de anschreiben** (5 Min). Der Shop nennt „Waxcelerate"
      an mehreren Stellen als Qualitätsargument, verlinkt aber nicht. Kurze
      freundliche Nachricht (WhatsApp/Instagram im Footer): ob sie „Waxcelerate"
      einmal auf `waxcelerate.de` verlinken können, z. B. auf ihrer „Über
      uns"-Seite als Herstellerangabe.

---

# TEIL 3 — Google-Unternehmensprofil füllen · nur wenn schon verifiziert

Prüf: **google.com/business** → steht dort „öffentlich sichtbar"? Wenn ja:

- [ ] **Beschreibung** eintragen. Text: `docs/aufgaben/GOOGLE_UNTERNEHMENSPROFIL.md`
- [ ] **4 Wachs-Produkte** eintragen (Reiter „Produkte"), je mit Preis + Link:
  - Kettenwachs 500g Classic · 29,95 € · `waxcelerate.de/produkt/wax-500`
  - Kettenwachs 300g Classic · 22,95 € · `waxcelerate.de/produkt/wax-300`
  - Kettenwachs 500g Pro · 34,95 € · `waxcelerate.de/produkt/wax-500-mos2`
  - Kettenwachs 300g Pro · 26,95 € · `waxcelerate.de/produkt/wax-300-mos2`
- [ ] **Leistung:** „Kette wachsen lassen" · 13,95 € · `waxcelerate.de/kette-wachsen-lassen`
- [ ] **Fotos** (nur eigene, keine KI-Bilder): Logo, Wachsblock, Wachsbad,
      fertige Kette nah, Verpackung.
- [ ] **2–3 echte Bewertungen** von Stammkunden, die du kennst. Nichts dafür
      geben — Google erkennt das und bestraft das ganze Profil.

Wenn noch „wird verifiziert": nichts tun, abwarten.

---

# TEIL 4 — 6 kurze Antworten, die Claude braucht

Kurze Antworten reichen, im Chat. Nichts davon blockiert Teil 1–3.

1. **Anwendungen pro 500-g-Block:** Code sagt 20–32, Skill sagt 15–20. Was stimmt?
2. **Kettenlaufzeit 16.000–20.000 km:** eigene Messung mit Lehre,
   Kundenrückmeldungen, oder Schätzung? (Bei echter Messung → eigener Artikel.)
3. **Bewertungszahl:** auf der Seite stehen 200+, 164 und „über 500 Einheiten".
   Was ist die richtige Zahl, und ist es Bewertungen oder Verkäufe?
4. **Rücksendekosten bei Widerruf:** wer zahlt? (Fehlt im Produkt-Schema.)
5. **Profil-URLs:** eBay-Shop, Kleinanzeigen-Profil, Instagram — exakte Links.
6. **Classic ohne PTFE:** Rezeptur validiert oder noch in Arbeit? (Steuert den
   Zeitpunkt für Presse-Outreach an Stiftung Warentest / speed-ville.)

---

# TEIL 5 — „Sag Claude Bescheid, dann macht er das"

Kann Claude selbst erledigen, sobald du grünes Licht gibst:

- [ ] **FAQ-Schema auf den Rechner-Seiten** (bringt KI-Zitierbarkeit —
      ChatGPT/Perplexity/Claude ziehen daraus Antworten). Claude baut je Seite
      3–5 Frage/Antwort-Paare aus dem vorhandenen Text; **du liest ~15 Sätze
      gegen, bevor es live geht** (Claims-Regeln). Details:
      `docs/plaene/RECHNER_SICHTBARKEIT.md` §2.3.
- [ ] **Interne Links von Produkt-/Wissenschaft-/Rewax-Seiten** auf den jeweils
      passenden Rechner.
- [ ] **Stripe Price-IDs eintragen** (`data.ts`) — sobald du die 12 IDs aus
      Stripe hast, schaltet Claude den eigenen Checkout scharf. Details:
      `docs/aufgaben/STRIPE_SETUP.md`. Das ist der größte einzelne Hebel im
      Projekt.

---

# TEIL 6 — Kleinkram, wenn mal Zeit ist

- [ ] **Merchant Center** (`merchants.google.com`): Konto für `waxcelerate.de`,
      Feed `https://waxcelerate.de/google-merchant-feed.xml` als geplanter
      Abruf, unter Wachstum → Programme mit idealo verknüpfen (EU-Pflicht für
      kostenlose Einträge).
- [ ] **Fremde Marken-Kopie:** falls `bffweqay3hca2.kimi.page` noch „Waxcelerate"
      im Titel trägt — im Kimi-Konto löschen oder auf privat.
- [ ] **Presse** (Stiftung Warentest, speed-ville) — Texte liegen in
      `docs/aufgaben/OUTREACH_TEXTE.md`, aber **erst nach** der Classic-PTFE-
      Umstellung verschicken.

---

## Wenig Zeit? Diese Reihenfolge:

| Zeit | Mach |
|---|---|
| 30 Sek | Teil 1a (der eine Terminal-Befehl) |
| 15 Min | Teil 1b (7 URLs in Search Console) |
| 20 Min | Teil 2 (deine Backlinks) |
| später | Teil 3–6 |
