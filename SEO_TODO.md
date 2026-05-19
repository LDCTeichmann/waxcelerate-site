# Waxcelerate SEO — Was du selbst erledigen musst

Stand: Mai 2026 · Alles Technische wurde bereits gebaut.

---

## 🔴 KRITISCH — Ohne das blockiert alles (Reihenfolge beachten)

### A. Domain kaufen: waxcelerate.de
1. Geh auf **united-domains.de** oder **namecheap.com**
2. Suche nach `waxcelerate.de` — sollte frei sein
3. Kaufen, ca. 12–15 €/Jahr
4. Du brauchst Zugang zu den DNS-Einstellungen der Domain

### B. Domain in Vercel verbinden
1. Geh auf **vercel.com** → dein Projekt → Settings → Domains
2. Klicke „Add Domain" → tippe `waxcelerate.de`
3. Vercel zeigt dir DNS-Einträge (A-Record oder CNAME)
4. Trag diese Einträge beim Domain-Anbieter ein
5. Warte 15–60 Minuten → Vercel zeigt „Valid Configuration"
6. Dann auch `www.waxcelerate.de` hinzufügen → Vercel redirected automatisch auf die Hauptdomain

### C. HTTPS prüfen
- Vercel aktiviert SSL automatisch sobald DNS aktiv ist
- Teste: `https://waxcelerate.de` muss das Schloss-Symbol zeigen

---

## 🟡 DANACH — Google Search Console einrichten

### D. Search Console Verifizierung
1. Geh auf **search.google.com/search-console**
2. „Property hinzufügen" → URL-Präfix → `https://waxcelerate.de`
3. Wähle **HTML-Meta-Tag** Methode
4. Du bekommst einen Code: `<meta name="google-site-verification" content="DEIN_CODE">`
5. Schick mir diesen Code — ich trage ihn in index.html ein und pushe
   (oder trag ihn selbst in index.html nach dem `<meta name="robots">` Tag ein)
6. Klicke „Bestätigen" in Search Console

### E. Sitemap einreichen
1. In Search Console → Sitemaps (linke Leiste)
2. Neue Sitemap-URL eingeben: `https://waxcelerate.de/sitemap.xml`
3. Klicke „Einreichen"
4. Status sollte nach 1–2 Tagen „Erfolgreich" zeigen

### F. URL-Indexierung beantragen
1. In Search Console → URL-Überprüfung (oben in der Suchleiste)
2. Tippe `https://waxcelerate.de/`
3. „Indexierung beantragen"
4. Dann auch für 2–3 Produktseiten wiederholen (z.B. `/produkt/wax-500`)

---

## 🟢 BACKLINKS — Das bringt langfristig den meisten Traffic

### G. ZeroFriction Cycling (Priorität 1)
- Website: **zerofrictioncycling.com.au** (Adam Kerin)
- Schreib auf Englisch, z.B.:

> Hi Adam,
> I'm Luca, a medical student from Stuttgart running Waxcelerate — a small batch hot wax operation. I've been following ZFC for years and your research fundamentally shaped how I formulate my wax. I'd love to send you a sample (both Classic and Pro MoS₂). No strings attached — just curious what you'd think. Happy to provide full ingredient breakdown. 
>
> Luca

- ZFC hat eine Wax-Empfehlungsliste. Dort gelistet zu werden ist ~50 Backlinks wert.

### H. Deutsche Fahrrad-Foren (Priorität 2)
Meld dich an und werde aktives Mitglied — dann kannst du irgendwann dein Produkt erwähnen (kein Spam):
- **rennrad-news.de/forum** — Rennrad, Triathleten
- **mtb-news.de/forum** — MTB
- **fahrradzukunft.de** — Nachhaltigkeit/Effizienz-Fokus

Suchanfragen wie „Heißwachs Kette" haben wenig Konkurrenz — ein Forum-Beitrag von dir kann schnell ranken.

### I. Blogger/Medien kontaktieren
- **Velomotion.de** — deutsches Fahrradmagazin, schreiben über Produkte
- **Gravelbike.com** — internationale Reichweite
- **Rennrad-News.de** (Redaktion, nicht Forum) — haben Produkttests

Muster-E-Mail:
> Ich bin Luca Teichmann, Medizinstudent und Entwickler von Waxcelerate — einem Heißwachs für Fahrradketten aus Stuttgart. 164 eBay-Bewertungen, 100% positiv, seit 2023. Hätte ich die Chance, euch ein Testmuster zu schicken?

---

## 🔵 CONTENT — Artikel schreiben (mittelfristig, 2–3 Monate)

Jeder dieser Artikel kann eigenständig bei Google ranken und direkt zum Shop linken.
Schreib auf Deutsch, ~800–1200 Wörter, ehrlich und spezifisch.

| Titel | Keyword | Schwierigkeit |
|-------|---------|---------------|
| Heißwachs vs. Flüssigwachs: Der echte Vergleich | „heißwachs fahrrad" | niedrig |
| Fahrradkette entfetten: Schritt-für-Schritt | „fahrradkette entfetten" | mittel |
| Wie lange hält eine gewachste Kette wirklich? | „gewachste kette haltbarkeit" | niedrig |
| Heißwachs selber machen — was du wissen musst | „heißwachs selber machen" | niedrig |

Wo veröffentlichen? Entweder direkt auf deiner Webseite als Blog-Sektion, oder auf einem kostenlosen Medium wie Substack / LinkedIn — Hauptsache irgendwo mit Link zurück zu waxcelerate.de.

---

## ⬜ NIEDRIGE PRIORITÄT (kann warten)

### Google Business Profile
- Nur relevant wenn du lokal gesucht werden willst (z.B. „Kettenöl Stuttgart")
- Wäre kostenlos: business.google.com
- Braucht echte Adresse — kannst du mit deiner Heimadresse machen

---

## Checkliste Zusammenfassung

| # | Was | Wer | Priorität |
|---|-----|-----|-----------|
| A | waxcelerate.de kaufen | Luca | 🔴 Kritisch |
| B | Domain in Vercel + DNS | Luca | 🔴 Kritisch |
| C | HTTPS prüfen | Luca | 🔴 Kritisch |
| D | Search Console verifizieren | Luca (+ mir Code schicken) | 🟡 Danach |
| E | Sitemap einreichen | Luca | 🟡 Danach |
| F | URL-Indexierung beantragen | Luca | 🟡 Danach |
| G | ZeroFriction Cycling E-Mail | Luca | 🟢 Backlinks |
| H | Forum-Präsenz aufbauen | Luca | 🟢 Backlinks |
| I | Blogger/Medien kontaktieren | Luca | 🟢 Backlinks |
| J | 4× Artikel schreiben | Luca | 🔵 Content |

---

*Technisch gebaut und committed: index.html, sitemap.xml, robots.txt, schema markup, per-product meta tags, canonical tags, security headers.*
