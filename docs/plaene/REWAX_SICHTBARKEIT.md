# Rewax-Sichtbarkeit — was Luca off-site tun muss

**Stand 2026-09-07.** Die Seite `/kette-wachsen-lassen` ist der einzige
wiederkehrende Umsatz (`docs/AUDIT.md`). On-page ist sie jetzt so weit, wie
Code sie bringen kann: zwei Leistungen, sauberes Service-Schema, nationale
Framing, Trust-Signale, Prerender. **Ranking passiert trotzdem größtenteils
off-site.** Diese Liste bündelt, was über ~15 Dokumente verstreut liegt, in eine
Reihenfolge. Volltexte stehen in den verlinkten Quell-Docs — hier nur „was, warum,
wo".

Die realistische Erwartung (`docs/plaene/REICHWEITE_STRATEGIE.md` §1): „Kette
wachsen lassen" gegen Kettenhelden/Rydewax/bikeoptimierung rankt in **3–6
Monaten**. „Kettenwachs Stuttgart" über das Google-Profil kann **sofort** oben
stehen.

---

## Reihenfolge

### 1. Google-Unternehmensprofil füllen — der stärkste einzelne Hebel
Der einzige Suchraum, in dem eine junge Domain sofort ganz oben stehen kann
(`docs/aufgaben/GOOGLE_UNTERNEHMENSPROFIL.md`, `REICHWEITE_STRATEGIE.md` §3.1).
- Profil existiert bereits, wartet auf Inhalt. Prüfen: steht bei
  `google.com/business` „öffentlich sichtbar"? Wenn „wird verifiziert": abwarten.
- **Kategorie:** Fahrradgeschäft (+ Fahrradreparaturwerkstatt, ggf. Hersteller).
- **Adresse nicht öffentlich anzeigen** → „Ich liefere an meine Kunden".
  Liefergebiet: Stuttgart + Umkreis **und** „Deutschland" (Postservice).
- **Leistungen:** „Kette wachsen lassen" (15,95 €) **und** „Umstieg auf Wachs"
  (24,95 €), je mit Link auf `waxcelerate.de/kette-wachsen-lassen`.
- **Produkte:** die 4 Wachse mit Preis + Link (`/produkt/wax-*`).
- **Beschreibung:** die fertige 631-Zeichen-Version im Doc (keine URL am Ende,
  sonst „Ungültiger Wert"). PFAS-Satz erst nach der Classic-Reformulierung.
- **2–3 echte Bewertungen** von Stammkunden. **Nichts kaufen** — die Strafe
  trifft das ganze Profil.
- **Fotos:** Logo, Wachsblock, Wachsbad, fertige Kette, Verpackung. Keine
  KI-Bilder.

### 2. Search Console
`docs/aufgaben/LUCA_TODO.md` Teil 1–2.
- Sitemap `waxcelerate.de/sitemap.xml` einreichen/prüfen. Screenshot des
  Coverage-Reports als Messgrundlage (`SICHTBARKEIT_PLAN.md` §11).
- `/kette-wachsen-lassen` einzeln zur Indexierung anmelden.
- Beobachtungsset an Suchbegriffen (`MOBILE_PLAN.md` §B8 + neu für den Umstieg):
  `fahrradkette wachsen lassen`, `kette wachsen lassen`, `kettenwachs service`,
  `kette einschicken wachsen`, `fahrradkette wachsen lassen stuttgart`,
  **`fahrradkette entfetten lassen`**, **`kette auf wachs umstellen lassen`**,
  **`neue kette wachsen lassen`**, `was kostet kette wachsen lassen`.
- IndexNow nach jedem Deploy: `npx tsx scripts/ping-indexnow.mjs` (einmal).
- Bing Webmaster Tools verbinden (→ auch DuckDuckGo, ChatGPT Search).

### 3. Backlinks — die fertigen Texte verschicken/klicken
Alle Texte liegen bereit. „Zehn ehrliche Links aus dem Radsport schlagen tausend
aus Verzeichnissen" (`SICHTBARKEIT_PLAN.md` §10.9).
- **Kleinanzeigen-Impressum** mit `waxcelerate.de` — erscheint unter jeder
  Anzeige (`OUTREACH_TEXTE.md` D1, Adresse Florentinerstraße 17, 70619 Stuttgart).
- **eBay-„Mich"-Seite** mit Link (`docs/aufgaben/EBAY_MICH_SEITE.md`).
- **velomarkt.de** + **buycycle.com** Website-Feld ausfüllen (`OUTREACH_TEXTE.md` D3).
- **bikeoptimierung.de** anschreiben — der eigene Wiederverkäufer rankt für den
  Markennamen, verlinkt aber nicht (fertige Nachricht `SICHTBARKEIT_PLAN.md`
  §10.1).
- **idealo** (Backlink + EU-Pflicht für kostenlose Shopping-Einträge,
  `OUTREACH_TEXTE.md` F1).

### 4. Content
`docs/plaene/BLOG_PLAN.md` §4.
- **„Fahrradkette von Öl auf Wachs umstellen (lassen)"** — der Artikel, der jetzt
  den Umstieg-Service trägt. Der Blog-Artikel `von-oel-auf-wachs-umsteigen`
  existiert; um einen Absatz „lassen statt selbst" + Link auf
  `/kette-wachsen-lassen` ergänzen.
- **„Kettenwachs ohne PFAS: was hinter dem Label steckt"** — steigende
  Suchnachfrage, von Stiftung Warentest thematisch vorbereitet, hoch verlinkbar
  (`SICHTBARKEIT_PLAN.md` §5). Blockiert bis Classic-Reformulierung freigegeben.
- **„Was kostet Kettenwachs wirklich? Preis pro Gramm und pro 1.000 km"** — mit
  der €/100g-Tabelle aus `SICHTBARKEIT_PLAN.md` §4.3.
- **Das Wachs-Logbuch** — laufende Verschleißmessungen. „Das Einzige, was ein
  Wettbewerber nicht abschreiben kann, und genau das, was Antwortmaschinen
  bevorzugt zitieren." Braucht Lucas Messdaten.

### 5. YouTube
Ein Video „Kette wachsen lassen, so läuft's ab" (`OUTREACH_TEXTE.md` F4). „Auf
Deutsch gibt es dazu kaum etwas Gutes." Verlinkt zurück auf die Seite.

### 6. Radforum
`radforum.de/threads/3164256-kettenwachs` — Waxcelerate taucht dort schon in
Empfehlungen auf. Einmal offen als Hersteller antworten (Text
`SICHTBARKEIT_PLAN.md` §10.6).

### 7. Presse — blockiert, nur vormerken
`docs/aufgaben/OUTREACH_TEXTE.md` E1–E3, `PFAS_STRATEGIE.md` §3. Wartet auf die
Classic-PFAS-Reformulierung.
- **Stiftung Warentest** (`test.de/kontakt`) — die PFAS-frei-Liste ist offen,
  war eine Selbstauskunft.
- **speed-ville.de** (`info@speed-ville.de`) — der Vergleichsartikel „6 Anbieter"
  hat 48.100 Aufrufe und rankt für das Hauptkeyword; Optimize hat dort schon
  einen Gastbeitrag platziert.
- rennrad-news.de, bike-x.de, bavarian-bike.de u.a. — 2–3 pro Monat.

---

## Was der Code schon erledigt hat (nicht nochmal anfassen)

- Service-Schema: zwei Leistungen als `hasOfferCatalog`, `provider` per `@id`
  am `#organization`-Knoten, `areaServed` als `Country`.
- Service + FAQPage jetzt auch im vorgerenderten HTML (JS-lose KI-Crawler).
- og/twitter-Tags im `<Helmet>` (gingen vorher bei der Hydration verloren).
- Sitemap: `/kette-wachsen-lassen` auf `priority 1.0`, `changefreq weekly`.
- „Aus ganz Deutschland"-Abschnitt nennt die Städte ehrlich — **keine
  Doorway-Stadtseiten** (Richtlinienrisiko, gegen die Projekt-Ethik).
- FAQ deckt die Kosten-, Ablauf-, Stadt- und Umstieg-Suchfragen ab.

## Offene Luca-Entscheidungen mit SEO-Bezug (aus `GESAMTUEBERSICHT.md`)

- **Betriebsbereitschaft Entfetten** — bis dahin `UMSTIEG_LIVE = false`, dann
  fällt der ganze Umstieg-Teil (Keywords, zweites Offer) weg.
- Bewertungszahl vereinheitlichen (200+ / 164 / 145).
- Classic-Reformulierung — Zeitplan; blockiert Presse + PFAS-Artikel.
- Kettenlaufzeit-Messung dokumentieren — „potenziell der stärkste
  Content-Baustein im ganzen Projekt".
