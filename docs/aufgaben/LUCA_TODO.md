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

**2026-09-10 · Technik-SEO-Pass (Commit `ecbb8ec`, live + geprüft):**
- Unbekannte URLs liefern jetzt echtes **HTTP 404** statt 200 (vorher „soft
  404", Google konnte Fantasie-URLs indexieren). Neue `dist/404.html`, `noindex`.
- **Content-Security-Policy**-Header ergänzt (im Browser über alle Seitentypen
  getestet, keine Fehler).
- Rechner-Seiten hatten nach dem Laden zwei `<title>`/Canonical im Quelltext —
  behoben.
- `aggregateRating` (5,0 / 200) aus dem Startseiten-Produkt-Schema raus —
  dieselbe „self-serving Review"-Falle wie bei den früher entfernten
  Produkt-Ratings.
- Struktierte Daten gegen `validator.schema.org` geprüft: 0 Fehler auf Start,
  Produkt, Rechner, Blog.

---

# TEIL 1 — Die neuen Rechner-Seiten anmelden

## 1a. Bing / DuckDuckGo / ChatGPT · ✅ ERLEDIGT

`npx tsx scripts/ping-indexnow.mjs` lief (44 URLs, HTTP 200), zuletzt nach dem
neuesten Deploy. Claude kann das nach jedem weiteren Deploy einfach nochmal
ausführen — dafür brauchst du nichts zu tun.

## 1b. Google Search Console · MUSS von Hand, ist aber OPTIONAL

**Wichtig, damit du's einordnen kannst:** Google hat **keine** Funktion, die man
per Terminal-Befehl ansteuern kann (anders als Bing). „Indexierung beantragen"
geht nur durch Klicken in der Search Console, eingeloggt mit deinem Google-Konto.
Claude kann das nicht für dich machen.

**Aber:** Die Sitemap listet alle 7 Rechner-Seiten und ist bei Google
eingereicht. Google findet sie also so oder so — die manuelle Anmeldung
beschleunigt es nur (Tage statt Wochen). **Wenn du müde bist: überspring das,
kostet höchstens etwas Zeit.**

Falls du es doch machst (10–15 Min, stumpfes Klicken):

1. **search.google.com/search-console** öffnen
2. Oben die Suchleiste („URL prüfen") — erste URL einfügen — Enter
3. Warten — **„Indexierung beantragen"** klicken — bestätigen — nächste URL

```
https://waxcelerate.de/rechner
https://waxcelerate.de/rechner/verschleiss
https://waxcelerate.de/rechner/intervall
https://waxcelerate.de/rechner/passende-kette
https://waxcelerate.de/rechner/kettenlaenge
https://waxcelerate.de/rechner/umstieg
https://waxcelerate.de/rechner/ersparnis
```

„Kontingent für heute erschöpft" → Rest am nächsten Tag.

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
- [ ] **Vercel: `www` als Weiterleitung** (2 Min, nur du — Dashboard-Klick).
      Aktuell macht `http://www.waxcelerate.de` **zwei** Redirect-Sprünge bis zur
      finalen Adresse (`http→https→apex`); alle anderen drei Varianten sind schon
      bei einem Sprung. Fix: vercel.com → Projekt `waxcelerate-site` → Settings →
      Domains → bei `www.waxcelerate.de` auf **„Redirect to waxcelerate.de"**
      stellen. Vercel macht daraus einen einzigen Sprung inkl. `https`-Upgrade.
      Danach Gegencheck: `curl -sIL http://www.waxcelerate.de | grep -c ^HTTP`
      sollte `2` zeigen (ein Redirect + finale 200) statt `3`.

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

# TEIL 4 — kurze Antworten, die Claude braucht

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
7. **Umstieg-Service (`/kette-wachsen-lassen`):** Ist der Betrieb sicher
   eingerichtet, geölte Ketten in einem **separaten** Ultraschallbad zu entfetten
   (vor dem Wachsbad)? Wenn nein → Claude setzt `UMSTIEG_LIVE = false`, die Seite
   ist dann reine Auffrischung.
8. **Turnaround:** aktuell steht „3–5 Werktage ab Ankunft bei uns" auf der Seite.
   Passt das, oder eine andere Spanne?
9. **Verkaufszahlen je Wachs-SKU** (Produktkarten-Neugliederung, 09/2026): die
   Regal-Karten zeigen `78 Bewertungen · 250+ verkauft` (Classic) und
   `20 Bewertungen · 80+ verkauft` (Pro) — abgeleitet aus `unitsSold`/
   `reviewCount` je SKU in `data.ts` (Classic 500g 188/52, Classic 300g 65/26,
   Pro 500g 64/14, Pro 300g 17/6). Laut dir wurde mittlerweile mehr verkauft.
   Aktuelle Zahlen je SKU nachreichen, dann trägt Claude sie in `data.ts` ein
   — die Anzeige-Logik (`variantStats()` in `ProductShelf.tsx`) bleibt gleich.

---

# TEIL 5 — „Sag Claude Bescheid, dann macht er das"

- [x] **FAQ-Schema auf den Rechner-Seiten** · ✅ erledigt + live. Je Rechner
      2–4 Frage/Antwort-Paare, sichtbar auf der Seite und im Schema
      (ChatGPT/Perplexity/Claude ziehen daraus Antworten). Antworten sind aus
      dem schon geprüften Erklärtext abgeleitet — **schau bei Gelegenheit mal
      über die Fragen/Antworten auf z. B. `waxcelerate.de/rechner/verschleiss`
      und sag Bescheid, wenn eine Formulierung nicht passt.**
- [x] **Interne Links von Produkt-/Wissenschaft-/Rewax-/Starter-Set-Seiten** auf
      den passenden Rechner · ✅ erledigt + live.
- [ ] **Stripe Price-IDs eintragen** (`data.ts`) — sobald du die 12 IDs aus
      Stripe hast, schaltet Claude den eigenen Checkout scharf. Details:
      `docs/aufgaben/STRIPE_SETUP.md`. Das ist der größte einzelne Hebel im
      Projekt.
- [ ] **Weitere Konzept-Punkte** aus `docs/plaene/RECHNER_SICHTBARKEIT.md` §2
      (HowTo-Schema, kontextuelle Links in einzelnen Blog-Artikeln) — kleiner
      Rest, auf Zuruf.

---

# TEIL 6 — Kleinkram, wenn mal Zeit ist

- [ ] **Fotos & Video für `/kette-wachsen-lassen`:** aktuell trägt die Seite nur
      das eine eBay-Standfoto von dir (`people/luca-stage.webp`) und die drei
      vorhandenen Ablauf-Fotos (`images/rewax/step-1..3`). Geplant/gewünscht,
      sobald du dazu kommst: ein Werkbank-/Wachstopf-Porträt statt des
      eBay-Stands, echte Nahaufnahmen der drei Schritte, und **Videomaterial**
      (Kette im Wachsbad, Ablauf). Sag Claude Bescheid, wenn Material da ist —
      dann baut er es ein.
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
| 0 Min | Teil 1a ist schon erledigt (Claude macht das nach jedem Deploy) |
| 20 Min | Teil 2 (deine Backlinks) — der wichtigste offene Punkt |
| 15 Min | Teil 3 (Google-Profil), falls schon verifiziert |
| optional | Teil 1b (7 URLs in Search Console — beschleunigt nur) |
| bei Zeit | Teil 4 (6 kurze Antworten für Claude), Teil 6 |
