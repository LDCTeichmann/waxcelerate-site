# Deine Liste — stur von oben nach unten abarbeiten

**Stand:** 4. August 2026
**Regel:** Nichts hier verlangt Nachdenken. Kopieren, einfügen, fertig. Wenn etwas nicht klappt, steht direkt darunter, was dann zu tun ist.
**Hintergrund und Begründungen:** alles in `SICHTBARKEIT_PLAN.md`. Musst du nicht lesen, um diese Liste abzuarbeiten.

---

# TEIL A — Das Eine, das alles blockiert

## A1. Die kaputte Git-Sperre lösen und den Fix live bringen

**Warum:** Eine hängengebliebene Datei (`index.lock`) blockiert jeden Git-Befehl in deinem Projekt. Dadurch ist eine seit Tagen fertige Korrektur nie live gegangen. Solange die fehlt, laden 22 fertige Seiten weder Design noch Funktion, und Google sieht auf den Verkaufsseiten nichts.

**Vorher:** Schließe alle Claude-Code-Fenster und alle Editoren, die das Projekt geöffnet haben. Terminal darf offen bleiben.

**Wichtig:** In deinem Projekt liegen aktuell mehrere unfertige Änderungen aus parallelen Sessions (Design-Arbeit an Rewax- und Wissenschaftsseite, dazu die Arbeit aus meiner Sonnet-Session). Der Block unten committet **gezielt nur die Dateien, die zu diesem Fix gehören**, und lässt alles andere unangetastet liegen.

**Dann das hier komplett kopieren und im Terminal einfügen:**

```
cd ~/"Claude Playground"/waxcelerate-site
rm -f .git/index.lock .git/objects/maintenance.lock
git add vite.config.ts public/74ee22c75cc92464f6fc7d87ee40a1848108c9411d03f5173e05ba74a23fe01f.txt scripts/ping-indexnow.mjs public/sitemap.xml
git commit -m "Fix asset base path, add IndexNow key and ping script"
git checkout main
git merge --ff-only fix/asset-base-path
git push origin main
```

**Falls die Sonnet-Session vor A1 fertig geworden ist**, kommen zusätzlich `scripts/generate-product-html.mjs` und `package.json` dazu. Den genauen, fertigen Befehl dafür liefert die Session am Ende in ihrem Bericht. Nimm dann den, nicht diesen.

**So sieht Erfolg aus:** Die letzte Zeile endet mit etwas wie `main -> main`. Kein `rejected`, kein `fatal`.

**Falls `merge --ff-only` fehlschlägt** (Meldung „Not possible to fast-forward"), stattdessen:

```
git merge fix/asset-base-path --no-edit
git push origin main
```

**Falls der Push abgelehnt wird** („non-fast-forward"):

```
git pull --rebase origin main
git push origin main
```

---

## A2. Prüfen, ob es gewirkt hat

Warte zwei Minuten, bis Vercel gebaut hat. Dann **neues privates Fenster** öffnen und diese Adresse **direkt eintippen**, nicht von der Startseite klicken:

```
waxcelerate.de/produkt/wax-500
```

**Gut:** Die Seite sieht normal aus, mit Menü, Bildern, Preis, Button.
**Schlecht:** Weiß, oder nackter Text ohne Gestaltung.

Schreib mir kurz, welches von beidem. Bei „schlecht" mache ich weiter, bevor irgendetwas anderes passiert.

---

# TEIL B — Sofortige Sichtbarkeit, unabhängig von Google

> Google entscheidet selbst, wann es eine neue Domain ernst nimmt. Bing nicht. Über Bing bist du zusätzlich in DuckDuckGo und in ChatGPT-Suche sichtbar, weil beide den Bing-Index nutzen. Das ist der schnellste Weg zu „man findet mich".

## B1. Bing Webmaster Tools einrichten (10 Minuten)

1. Öffne `bing.com/webmasters`
2. Mit Google-Konto anmelden (Knopf „Import from Google Search Console") — das überträgt die Bestätigung deiner Domain automatisch, du musst nichts verifizieren
3. Falls der Import nicht geht: „Add site manually" → `https://waxcelerate.de` → Bestätigung über die HTML-Datei wählen und mir kurz Bescheid geben, den Rest mache ich
4. Danach links unter „Sitemaps" eintragen: `https://waxcelerate.de/sitemap.xml`

## B2. IndexNow scharf schalten (2 Minuten, nach A1)

Ich habe Schlüssel und Skript schon ins Projekt gelegt. Du musst es nur einmal auslösen:

```
cd ~/"Claude Playground"/waxcelerate-site
npx tsx scripts/ping-indexnow.mjs
```

**So sieht Erfolg aus:** `✓ 33 URLs an IndexNow gemeldet`

**Falls „Schluesseldatei nicht erreichbar" kommt:** Vercel war noch nicht fertig. Fünf Minuten warten, Befehl wiederholen.

Ab jetzt nach jedem Deploy einmal denselben Befehl, dann kennt Bing neue Seiten binnen Minuten.

---

# TEIL C — Google richtig anstoßen

## C1. Search Console kontrollieren (10 Minuten)

1. `search.google.com/search-console` öffnen, Property `waxcelerate.de` wählen
2. Links **Sitemaps** → falls `sitemap.xml` nicht gelistet ist, eintragen: `sitemap.xml` → Senden
3. Links **Indexierung → Seiten** → **Screenshot machen und mir schicken**. Ich brauche die Zahlen bei „Nicht indexiert" und die Gründe darunter. Das ist meine Messgrundlage, ohne die kann ich nicht beurteilen, ob es wirkt.

## C2. Wichtigste Seiten einzeln anmelden (10 Minuten, erst nach A2)

Oben in der Search Console ist eine Suchleiste („URL prüfen"). Dort nacheinander diese sechs Adressen einfügen, jeweils auf **„Indexierung beantragen"** klicken, warten bis bestätigt, nächste:

```
https://waxcelerate.de/
https://waxcelerate.de/rewax
https://waxcelerate.de/starter-set
https://waxcelerate.de/produkt/wax-500
https://waxcelerate.de/produkt/wax-500-mos2
https://waxcelerate.de/blog
```

Mehr als etwa zehn pro Tag nimmt Google nicht an, das reicht aber.

---

# TEIL D — Verlinkungen, damit Google die Domain überhaupt ernst nimmt

> Ohne Links von anderen Seiten bleibt eine neue Domain für Google unwichtig, egal wie gut sie technisch ist. Das ist der Punkt, an dem aktuell am meisten liegen bleibt.

## D1. Kleinanzeigen-Impressum (5 Minuten, rechtlich ohnehin Pflicht)

Kleinanzeigen → Unternehmensseite → Rechtliche Angaben → Impressum ausfüllen, **inklusive Feld für die Website**: `https://waxcelerate.de`

Das erscheint danach automatisch unter **jeder** deiner Anzeigen.

## D2. eBay „Mich"-Seite (5 Minuten)

eBay → Mein eBay → Verkäufer-Cockpit → Shop → „Über mich"-Seite bearbeiten. Dort `https://waxcelerate.de` als Link einbauen.

**Wichtig:** Links in Artikelbeschreibungen bleiben verboten. Nur auf dieser Seite ist es erlaubt. In den Artikeln reicht das Wort „Waxcelerate" ohne Link.

## D3. bikeoptimierung.de anschreiben (3 Minuten)

Die verkaufen dein Wachs und ranken bei Google für deinen eigenen Markennamen besser als du, verlinken dich aber nirgends. Über Instagram-Direktnachricht oder WhatsApp (beides steht in deren Fußzeile).

**Text zum Kopieren:**

> Hallo, hier ist Luca von Waxcelerate. Schön zu sehen, wie ihr das Wachs einsetzt, der Kettenservice ist sauber aufgebaut.
>
> Eine kleine Bitte: Würdet ihr „Waxcelerate" bei euch einmal auf waxcelerate.de verlinken, zum Beispiel auf der Über-uns-Seite als Herstellerangabe? Das hilft mir gerade sehr, weil die Marke online noch schwer zu finden ist, und für eure Kunden ist es praktisch, wenn sie technische Angaben direkt finden.
>
> Falls ihr Produktfotos oder Datenblätter in guter Auflösung braucht, schick ich euch die gern.
>
> Beste Grüße, Luca (waxcelerate)

## D4. Deine B2B-Partner (10 Minuten, verteilt)

An alle Partnershops dieselbe Bitte, per Mail oder WhatsApp:

> Hallo [Name], kurze Bitte: Könntet ihr Waxcelerate auf eurer Website einmal als geführte Marke mit Link auf waxcelerate.de nennen? Hilft mir gerade sehr bei der Auffindbarkeit. Fotos und Texte liefere ich gern zu.
>
> Beste Grüße, Luca

**Nimm das ab sofort fest ins Onboarding neuer Partner auf**, dann passiert es künftig von allein.

## D5. Google Unternehmensprofil (15 Minuten)

`business.google.com` → Profil anlegen.

- Name: `Waxcelerate`
- Kategorie: `Fahrradgeschäft`
- Kein Ladengeschäft, aber Liefergebiet angeben: Stuttgart und Umgebung
- Website: `https://waxcelerate.de`
- Fotos hochladen: Wachsblock, Wachsbad, gewachste Kette

Das ist der stärkste einzelne Hebel für „Kettenwachs Stuttgart" und hilft Google, dich vom gleichnamigen Skiwachs zu unterscheiden.

---

# TEIL E — Große Chancen, je eine Mail

## E1. Stiftung Warentest (10 Minuten)

Sie haben 2025 Hersteller zur PFAS-Frage befragt und schreiben ausdrücklich, dass einige nicht geantwortet haben. Du warst nicht dabei. Über `test.de/kontakt`.

> Betreff: Ergänzung zu „Schmiermittel für Fahrradketten – auch ohne PFAS"
>
> Sehr geehrte Redaktion,
>
> in Ihrem Beitrag vom 26.05.2025 haben Sie Anbieter von Heißwachsen zur PFAS-Frage befragt. Wir waren damals nicht dabei und möchten die Angabe gern nachreichen.
>
> Waxcelerate ist ein Kleinunternehmen aus Stuttgart, das Heißwachs für Fahrradketten in eigenen Chargen herstellt. Wir führen zwei Formeln und unterscheiden dabei bewusst:
>
> Die MoS₂ Pro Edition ist PFAS- und PTFE-frei. Basis ist Paraffin, geschmiert wird mit Molybdändisulfid, einem metallischen Festschmierstoff.
>
> Die Classic-Linie enthält derzeit noch PTFE. Wir weisen das auf der Produktseite offen aus, statt es zu umschreiben, und stellen die Rezeptur derzeit auf ein fluorfreies Additiv um.
>
> Für Rückfragen zu Zusammensetzung oder Herstellung stehe ich gern zur Verfügung, ebenso für Muster.
>
> Beste Grüße
> Luca Teichmann, Waxcelerate, Stuttgart

## E2. speed-ville.de (10 Minuten)

Deutscher Rennrad-Blog. Deren Kettenwachs-Vergleich hat 48.100 Aufrufe und rankt für dein wichtigstes Suchwort. Du kommst darin nicht vor, ein Wettbewerber hat dort schon einen Gastbeitrag. An `info@speed-ville.de`.

> Betreff: Kettenwachs-Vergleich, Ergänzung aus Stuttgart
>
> Hallo Daniel,
>
> euer Vergleich „Welches Kettenwachs fürs Rennrad ist das beste" ist der Artikel, auf den ich Kunden am häufigsten verweise, wenn sie erst mal verstehen wollen, worum es geht.
>
> Ich stelle in Stuttgart selbst Heißwachs her, in kleinen Chargen, seit 2024. Zwei Formeln, eine für Frühjahr bis Herbst, eine mit MoS₂ für Winter und Nässe. 500 g liegen bei 29,95 €, also rund 6 € je 100 g. In eurem Vergleich liegen die Heißwachse zwischen 10 und 11 € je 100 g.
>
> Zwei Dinge, die ich anbieten kann:
>
> Erstens Testmuster, beide Formeln, kostenlos und ohne Bedingungen. Wenn es euch nicht überzeugt, schreibt das gern genauso.
>
> Zweitens, falls es euch inhaltlich reizt: Seit dem PFAS-Beitrag der Stiftung Warentest fragen mich Kunden ständig, was davon für Kettenwachs gilt. Ich könnte einen Gastbeitrag schreiben, der das sauber auseinandersortiert, inklusive offener Deklaration für unsere eigenen Linien. Ohne Wettbewerber zu nennen, es geht um die Sache.
>
> Sag Bescheid, wohin ich die Muster schicken darf.
>
> Beste Grüße, Luca (waxcelerate)

## E3. Radforum (10 Minuten)

Im Thread `radforum.de/threads/3164256-kettenwachs` wirst du bereits von anderen empfohlen. Account anlegen, Website ins Profil eintragen, **einmal** offen als Hersteller antworten. Vorher die Forenregeln zu Herstellerbeiträgen lesen. Nicht in mehreren Threads posten, das fliegt auf und schadet.

---

# TEIL F — Aufräumen

## F1. Fremde Kopie deiner Marke abschalten (5 Minuten)

`https://bffweqay3hca2.kimi.page/` trägt öffentlich den Titel „Waxcelerate" und ist vermutlich ein übrig gebliebener Vorschau-Build aus einer früheren Bau-Session. Er taucht bei der Markensuche auf, deine echte Seite nicht. Im Kimi-Konto löschen oder auf privat stellen.

---

# TEIL G — Was ich von dir brauche

Kurze Antworten reichen, keine Recherche nötig.

1. **Anwendungen pro 500-g-Block:** Im Code stehen 20–32, im Skill 15–20. Welche stimmt?
2. **Kettenlaufzeit:** Du sagtest 16.000–20.000 km. Worauf beruht das? Eigene Messung mit Kettenlehre, Kundenrückmeldungen, oder Erfahrungsschätzung? Bei einer echten Messung baue ich daraus einen eigenen Artikel, das wäre stark.
3. **Bewertungszahl:** Auf der Seite stehen drei verschiedene: 200+, 164, und „über 500 verkaufte Einheiten". Was ist die richtige Zahl, und ist das Bewertungen oder Verkäufe?
4. **Classic ohne PTFE:** Ist die neue Rezeptur schon getestet, oder noch in Entwicklung? Danach richtet sich, ob wir es jetzt schon kommunizieren.
5. **Profil-Adressen** für die Markenverknüpfung: eBay-Shop, Kleinanzeigen-Profil, Instagram.

---

# Reihenfolge, falls du wenig Zeit hast

| Zeit | Mach das | Wirkung |
|---|---|---|
| 5 Min | **A1 + A2** | schaltet 22 fertige Seiten scharf |
| 15 Min | **B1 + B2** | binnen Stunden in Bing, DuckDuckGo, ChatGPT auffindbar |
| 10 Min | **C1** | ich bekomme die Messgrundlage |
| 10 Min | **D1 + D2** | erste echte Verlinkungen, eine davon Pflicht |
| Rest | D3–D5, E, F, G | mittelfristige Autorität |

**A1 blockiert alles andere.** Wenn du heute nur fünf Minuten hast, mach A1 und A2.
