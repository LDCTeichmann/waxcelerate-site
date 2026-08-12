# Deine Liste — stur von oben nach unten

**Stand:** 5. August 2026
**Regel:** Nichts hier verlangt Nachdenken. Kopieren, einfügen, fertig.
**Hintergründe:** `docs/plaene/SICHTBARKEIT_PLAN.md`, `docs/plaene/PFAS_STRATEGIE.md`, `docs/plaene/REICHWEITE_STRATEGIE.md`. Musst du nicht lesen.

---

## ✅ Erledigt

- Asset-Fehler behoben, alle 41 Seiten liefern echtes HTML
- Produktseiten live und geprüft (`waxcelerate.de/produkt/wax-500` zeigt eine echte Seite)
- `/rewax` → `/kette-wachsen-lassen` umgestellt, mit 301
- Google Search Console verifiziert, **Sitemap eingereicht, 35 URLs erkannt**
- Bing Webmaster Tools verbunden, Sitemap eingereicht
- IndexNow scharf: 35 URLs gemeldet (HTTP 202)
- 10 URLs bei Google zur Indexierung angemeldet

---

# ⚠️ ZUERST: ein Fehler im letzten Commit

In deinen Commit sind drei Git-Repositories geraten, die dort nicht hingehören: `.claude/worktrees/agent-*`. Git hat sie als Submodul-Verweise eingetragen (die Warnung „adding embedded git repository" im Terminal). Sie zeigen auf Objekte, die auf GitHub nicht existieren. Ein frischer Klon deines Repos würde daran scheitern.

Ich habe `.gitignore` ergänzt. Das hier räumt es auf:

```
cd ~/"Claude Playground"/waxcelerate-site
rm -f .git/index.lock .git/HEAD.lock
git rm -r --cached .claude/worktrees .claude/settings.local.json
git add .gitignore docs/aufgaben/EBAY_MICH_SEITE.md docs/aufgaben/LUCA_TODO.md
git commit -m "Remove embedded worktree repos from index, ignore .claude internals"
git push origin fix/asset-base-path:main
```

Deine Dateien auf der Platte bleiben unangetastet, nur Git vergisst sie.

---

# TEIL B — Bing, DuckDuckGo, ChatGPT · ✅ erledigt

Nach jedem Deploy einmal wiederholen, dann kennt Bing neue Seiten binnen Minuten:

```
cd ~/"Claude Playground"/waxcelerate-site
npx tsx scripts/ping-indexnow.mjs
```

---

# TEIL C — Google-Indexierung

## C1. Sitemap · ✅ erledigt

## C2. URLs anmelden — MORGEN diese zehn

Search Console → Suchleiste oben („URL prüfen") → URL einfügen → **„Indexierung beantragen"** → warten bis bestätigt → nächste. Google nimmt etwa zehn pro Tag.

```
https://waxcelerate.de/blog/heisswachs-vs-fluessigwachs
https://waxcelerate.de/blog/fahrradkette-entfetten
https://waxcelerate.de/blog/kettenlaufzeit-heisswachs
https://waxcelerate.de/blog/kettenwachs-rennrad-gravelbike
https://waxcelerate.de/blog/wachs-haelt-nicht-haeufige-fehler
https://waxcelerate.de/blog/vorgewachste-kette
https://waxcelerate.de/blog/kettenwachs-winter
https://waxcelerate.de/blog/topf-zum-kette-wachsen
https://waxcelerate.de/blog/tropfwachs-hybrid-methode
https://waxcelerate.de/blog/von-oel-auf-wachs-umsteigen
```

## C3. ÜBERMORGEN die letzten fünf

```
https://waxcelerate.de/blog/ebike-kette-wachsen
https://waxcelerate.de/blog/kettenverschleiss-messen
https://waxcelerate.de/blog/erste-fahrt-nach-wachsen
https://waxcelerate.de/blog/schnellverschluss-quicklink
https://waxcelerate.de/blog/wachs-entsorgen-topf-pflegen
```

Danach sind alle 18 Artikel plus die zehn wichtigsten Seiten angemeldet. Die Rechtstexte brauchst du nicht, die findet Google über die Sitemap.

## C4. In einer Woche: Kontrolle

Search Console → **Indexierung → Seiten**. Dann sollten dort Zahlen stehen statt „Processing data". Mach einen Screenshot und schick ihn mir, das ist meine Messgrundlage.

---

# TEIL D — Verlinkungen, für die du niemanden fragen musst

> Das sind die einzigen Linkquellen, die komplett in deiner Hand liegen. Zusammen etwa 20 Minuten.

## D1. Kleinanzeigen-Impressum (5 Min)

**Warum:** Erscheint danach automatisch unter **jeder** deiner Anzeigen. Als gewerblicher Anbieter ohnehin Pflicht.

**Wo:** kleinanzeigen.de → oben rechts auf deinen Namen → **Unternehmensseite** → **Rechtliche Angaben**

**Was rein muss:**

```
Waxcelerate
Luca Teichmann
Florentinerstraße 17
70619 Stuttgart

Telefon: +49 157 51957470
E-Mail: waxcelerate@gmail.com
Website: https://waxcelerate.de

Kleinunternehmer gemäß § 19 UStG, daher wird keine Umsatzsteuer ausgewiesen.
```

Falls es kein eigenes Feld „Website" gibt: URL ans Ende des Impressumstexts. Wirkt genauso.

## D2. eBay „Mich"-Seite (5 Min)

Text liegt fertig in **`docs/aufgaben/EBAY_MICH_SEITE.md`**. Kopieren, einfügen, speichern.

**Merksatz:** Auf der Profilseite sind Links erlaubt. **In Artikelbeschreibungen nicht** — dort nur das Wort „Waxcelerate" ohne Link. Google wertet auch unverlinkte Nennungen, du riskierst also nichts.

## D3. Zwei Profile, in denen du schon stehst (5 Min)

Beide haben ein Website-Feld, das vermutlich leer ist:

- **velomarkt.de** → dein Inserat
- **buycycle.com** → dein Verkäuferprofil

## D4. Google Unternehmensprofil · angelegt, wartet auf Verifizierung

Status laut deinem Screenshot: **„Google verarbeitet derzeit Ihre Angaben zur Verifizierung. Das kann bis zu fünf Tage dauern."** Solange steht dort „Nicht öffentlich sichtbar". Das ist normal, nichts zu tun außer warten.

Bereits richtig eingestellt: Kein Ladengeschäft, Einzugsgebiete gesetzt, Telefon und Website eingetragen, Kategorie Fahrradgeschäft.

**Ein Hinweis zu den Einzugsgebieten:** Du hast Stuttgart, Hamburg, Berlin, München, Leipzig, Deutschland und Österreich eingetragen. „Deutschland" schließt Hamburg, Berlin, München und Leipzig bereits ein, die vier sind also überflüssig. Das schadet nicht, aber ein sehr breites Einzugsgebiet schwächt tendenziell das lokale Signal für Stuttgart. Wenn du magst, lass später nur **Stuttgart, Deutschland und Österreich** stehen.

**Was du übersprungen hast und nachtragen solltest:** die Unternehmensbeschreibung. Der richtlinienkonforme Text ohne URL liegt in `docs/aufgaben/GOOGLE_UNTERNEHMENSPROFIL.md`. Nachtragen unter „Profil bearbeiten".

---

## D5. NACH der Freigabe: das Profil füllen

> **Erst wenn der Status von „Nicht öffentlich sichtbar" auf sichtbar wechselt.** Vorher verpufft die Arbeit oder wird nicht übernommen.

Alle Punkte im Dashboard oder direkt in der Google-Suche über die Verwaltungsleiste.

- [ ] **Beschreibung** nachtragen, Text aus `docs/aufgaben/GOOGLE_UNTERNEHMENSPROFIL.md`
- [ ] **Produkte eintragen** (Reiter „Produkte bearbeiten"). Die vier Wachse mit Preis, Beschreibung und Link auf die jeweilige Produktseite:
  - Kettenwachs 500g Classic · 29,95 € · `waxcelerate.de/produkt/wax-500`
  - Kettenwachs 300g Classic · 22,95 € · `waxcelerate.de/produkt/wax-300`
  - Kettenwachs 500g Pro · 34,95 € · `waxcelerate.de/produkt/wax-500-mos2`
  - Kettenwachs 300g Pro · 26,95 € · `waxcelerate.de/produkt/wax-300-mos2`
- [ ] **Leistung eintragen:** „Kette wachsen lassen", 13,95 €, Link auf `waxcelerate.de/kette-wachsen-lassen`
- [ ] **Fotos hochladen**, in dieser Reihenfolge: Logo, Wachsblock, Wachsbad mit Ketten, fertige Kette in Nahaufnahme, Verpackung. **Nur eigene Fotos**, keine KI-Bilder.
- [ ] **Erste Bewertungen.** Ein Profil ohne Bewertungen wirkt tot. Frag zwei oder drei Stammkunden, die du persönlich kennst. **Nichts dafür geben und nichts kaufen** — Google erkennt das, und die Strafe trifft das ganze Profil. Zwei echte Sätze sind mehr wert als zehn generische.
- [ ] **Öffnungszeiten weiterhin leer lassen.** Bei einem Versandbetrieb ohne Laden ist das normal und besser als eine unglaubwürdige Angabe.

**Das 400-€-Werbeguthaben:** Kannst du ignorieren. Google Ads lohnt sich erst, wenn du weißt, welche Suchbegriffe konvertieren, und dafür brauchst du erst organische Daten aus der Search Console. Das Guthaben verfällt nicht sofort, und Geld auszugeben, bevor du weißt wofür, ist der teuerste Weg zu dieser Erkenntnis.

---

# TEIL E — Presse

> **Nicht jetzt verschicken.** Erst wenn die neue Classic ohne PTFE läuft. Dann heißt die Nachricht „unser komplettes Sortiment ist fluorfrei" statt „eine von zwei Linien", und das ist eine völlig andere Mail. Begründung in `docs/plaene/PFAS_STRATEGIE.md`.

Alle Texte liegen fertig in **`docs/aufgaben/OUTREACH_TEXTE.md`**:

- **E1 Stiftung Warentest** — sie schreiben selbst, dass nicht alle Anbieter geantwortet haben. Die Liste ist offen.
- **E2 speed-ville.de** — 48.100 Aufrufe auf dem Kettenwachs-Vergleich, du fehlst darin, ein Wettbewerber hat dort schon einen Gastbeitrag.
- **E3** weitere Blogs, zwei bis drei pro Monat
- **E4 Radforum** — du wirst dort schon empfohlen, einmal offen als Hersteller antworten

**Vorbereitung, die du schon jetzt machen kannst:** Lieferantenerklärungen zur PFAS-Freiheit einholen. Eine Mail je Rohstofflieferant, Vorlage in `docs/plaene/PFAS_STRATEGIE.md` §4. Ohne die kannst du „komplett fluorfrei" nicht belastbar behaupten.

---

# TEIL F — Auf deinem Mac, wenn du Zeit hast

## F1. Kettenbilder auf die eigene Domain (10 Min)

Acht Produktbilder liegen auf eBays Servern. Endet ein Listing, ist das Bild weg — auf der Produktseite, in der Sitemap und im Merchant-Feed.

Erst schauen:

```
cd ~/"Claude Playground"/waxcelerate-site
npx tsx scripts/migrate-chain-images.mjs
```

Sieht gut aus, dann echt:

```
npx tsx scripts/migrate-chain-images.mjs --apply
npx tsc --noEmit
npm run build
```

Holt automatisch die größere Fassung von eBay (Google will mindestens 1200 px für Produkt-Rich-Results, bisher waren es 500) und legt eine Sicherungskopie von `data.ts` an.

## F2. Merchant Center (20 Min)

**Erst jetzt sinnvoll**, vorher wäre der Feed abgelehnt worden.

1. `merchants.google.com` → Konto für `waxcelerate.de` anlegen und verifizieren
2. Produkte → Feeds → „Geplanter Abruf" auf `https://waxcelerate.de/google-merchant-feed.xml`
3. **EU-Besonderheit, wird oft übersehen:** Für kostenlose Einträge muss das Konto unter Wachstum → Programme verwalten mit einem Preisvergleichsdienst verknüpft sein, zum Beispiel idealo

## F3. Fremde Kopie deiner Marke abschalten (5 Min)

`https://bffweqay3hca2.kimi.page/` trägt öffentlich den Titel „Waxcelerate", vermutlich ein übrig gebliebener Vorschau-Build. Im Kimi-Konto löschen oder auf privat stellen.

---

# TEIL G — Was ich von dir brauche

Kurze Antworten reichen. Nichts davon blockiert etwas.

1. **Anwendungen pro 500-g-Block:** `data.ts` sagt 20–32, das Skill sagt 15–20. Welche stimmt?
2. **Kettenlaufzeit:** Du sagtest 16.000–20.000 km. Eigene Messung mit Kettenlehre, Kundenrückmeldungen, oder Schätzung? Bei einer echten Messung baue ich daraus einen eigenen Artikel, und der wäre stark.
3. **Bewertungszahl:** Auf der Seite stehen drei verschiedene — 200+, 164 und „über 500 verkaufte Einheiten". Was ist die richtige Zahl, und ist das Bewertungen oder Verkäufe?
4. **Rücksendekosten:** Wer trägt sie? Solange das offen ist, fehlt im Produkt-Schema ein Feld und Google zeigt die Rückgabezeile unvollständig.
5. **Profil-Adressen:** eBay-Shop, Kleinanzeigen-Profil, Instagram. Damit verknüpfe ich alles zu einer Marken-Entität, was gegen die Verwechslung mit dem Skiwachs hilft.
6. **Classic-Umstellung:** Rezeptur validiert oder noch in Arbeit? Davon hängt der Zeitpunkt für Teil E ab.

---

# Reihenfolge, falls du wenig Zeit hast

| Zeit | Mach das |
|---|---|
| 2 Min | Der Aufräum-Commit oben |
| 10 Min | C2, die zehn Blog-URLs |
| 15 Min | D1 + D2, deine einzigen eigenen Linkquellen |
| 15 Min | D4, Google Unternehmensprofil |
| später | E, F, G |
