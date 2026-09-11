# SEO-Prüfbericht — September 2026

Stand: 2026-09-11, Branch `feat/seo-indexierbare-seiten` (Basis: `main` @ `cd0f82e`,
**noch nicht deployed**). Zwei Datenquellen, klar getrennt:

- **„Live"** = gegen `https://waxcelerate.de` gemessen — der Zustand, den jeder
  Crawler heute sieht, ohne die vier neuen Seiten aus diesem Release.
- **„Neu, lokal"** = gegen den lokalen Produktions-Build (`npm run build` +
  `vite preview`) gemessen — `/ueber-uns`, `/kontakt`, `/faq`, `/anleitung`
  existieren nur hier, noch nicht auf `waxcelerate.de`. Absolute Lighthouse-Werte
  sind lokal **nicht** mit Live-Werten vergleichbar (kein CDN, kein Edge-Cache,
  siehe Methodik unten) — deshalb wird gegen eine bereits live geschaltete
  Vergleichsseite unter identischen lokalen Bedingungen relativiert, nicht gegen
  absolute Zielwerte.

---

## 1. Automatisierter Live-Check (`npm run check:live`)

Gegen `https://waxcelerate.de`, vor diesem Release:

```
330 bestanden, 0 fehlgeschlagen.
```

Geprüft: alle 44 Sitemap-URLs (HTTP 200, genau ein Title/H1/Canonical,
Canonical absolut und self-referenzierend, kein `noindex`), die drei bewusst
nicht-indexierbaren App-Routen (`/admin`, `/bestellung-erfolgreich`,
`/produkt/:id/stage`, jeweils mit `noindex`), eine unbekannte URL → echtes 404,
robots.txt-Inhalt, Sitemap-Wohlgeformtheit, Startseite ohne JavaScript,
Redirect-Ketten aller vier Domain-Varianten.

**Nach diesem Release** (lokal gegen den Build simuliert, siehe Abschnitt 6)
kommen 4 weitere URLs zur Sitemap hinzu (48 statt 44) — dieselben Prüfungen
greifen automatisch, weil `check-live.mjs` die URL-Liste aus der Live-Sitemap
selbst liest.

## 2. Redirect-Kette (alle vier Domain-Varianten, aus dem Live-Check)

| Von | Nach | Hops | Status |
|---|---|---|---|
| `http://waxcelerate.de/` | `https://waxcelerate.de/` | 1 | ✓ |
| `http://www.waxcelerate.de/` | `https://waxcelerate.de/` | 2 | ✓ (≤ 2) |
| `https://www.waxcelerate.de/` | `https://waxcelerate.de/` | 1 | ✓ |
| `https://waxcelerate.de/` | — | 0 (Ziel) | ✓ |

Alle vier Varianten landen korrekt und mit maximal zwei Hops auf der
kanonischen Domain. `http://www` (zwei Hops: http→https, dann www→apex) ist
technisch sauber, aber eine Vercel-Dashboard-Aufgabe könnte ihn auf einen Hop
verkürzen (`www` auf „Redirect" statt zwei getrennte Regeln stellen) — bereits
in `docs/aufgaben/LUCA_TODO.md` als Aufgabe für Luca vermerkt, hier nur
bestätigt, nicht neu.

## 3. robots.txt und Sitemap

- `robots.txt`: HTTP 200, `Allow: /` vorhanden, verweist auf
  `https://waxcelerate.de/sitemap.xml`, dazu 17 explizite Allow-Blöcke für
  einzelne AI-Crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, …).
- `sitemap.xml`: wohlgeformtes XML, 44 URLs (live) → 48 nach diesem Release,
  alle antworten 200, kein Eintrag ist ein Redirect oder Duplikat.

## 4. Schema-Validator (validator.schema.org)

Getestet als Code-Snippet mit dem tatsächlichen, aus `dist/` extrahierten
JSON-LD der vier neuen Seiten (nicht nachgebaut — Original-Output der
Prerender-Skripte):

| Seite | Typ | Fehler | Warnungen |
|---|---|---|---|
| `/faq` | `FAQPage` (alle 22 Fragen) | 0 | 0 |
| `/faq` (Smoke-Test) | `FAQPage` + `BreadcrumbList` | 0 | 0 |
| `/anleitung` | `HowTo` (5 Schritte, Supply, Tool) | 0 | 0 |
| `/ueber-uns` | `AboutPage` (referenziert `Person` per `@id`) | 0 | 0 |
| `/kontakt` | `ContactPage` (referenziert `Organization` per `@id`) | 0 | 0 |

Bereits vorhandenes Schema (`Product`, `Offer`, `Organization`, `WebSite`,
`BlogPosting`, Rechner-`SoftwareApplication`) war in einer früheren Session
bereits mit 0 Fehlern auf Start-, Produkt-, Rechner- und Blogseiten geprüft
(siehe Memory-Notiz vom 2026-09-10) — in diesem Durchgang nicht erneut
angefasst, da unverändert.

**Ein Konstruktionsdetail extra geprüft:** `/ueber-uns` referenziert den
sitewiten `Person`-Knoten aus `index.html` per `@id`
(`https://waxcelerate.de/#person-luca`) statt ihn zu duplizieren — ohne diesen
Fix hätte die Seite zwei widersprüchliche `Person`-Objekte über „Luca
Teichmann" getragen (eines vollständig mit `description`/`knowsAbout`, eines
unvollständig). Per Browser-JS auf der hydrierten Seite verifiziert: genau
ein `Person`-Block im Live-DOM.

## 5. Google Rich Results Test

| Getestet | Ergebnis | Einordnung |
|---|---|---|
| `/produkt/wax-500` (live) | **4 valide Items** (Product snippets, Merchant listings, …), je 2 nicht-kritische Hinweise „review"/„aggregateRating" fehlt (optional) | Erwartet und beabsichtigt — kein `AggregateRating`, siehe Abschnitt 7 |
| `/faq`-Snippet (Code-Test, lokaler Build-Output) | „No items detected" für `FAQPage` | **Kein Markup-Fehler** — Google hat FAQ-Rich-Results am 07.05.2026 komplett aus der Suche entfernt (bestätigt in Memory vom 2026-07-24). Der Validator zeigt trotzdem 0 Schema-Fehler; `FAQPage` bleibt als Antwort-Extraktionshilfe für KI-Systeme wertvoll, nur nicht mehr als Google-Rich-Result. |

Rich-Results-Eligibility wurde für `FAQPage`/`HowTo` bewusst nicht als
Erfolgskriterium behandelt — das wäre eine falsche Erwartung an ein
Schema-Feature, das Google für diesen Typ abgeschaltet hat.

## 6. Lighthouse Mobile (lokal, `chrome-headless-shell`, simulierte Drosselung)

Kommando (Playwright-Chromium-Cache, kein System-Chrome installiert):

```bash
CHROME_PATH=~/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell \
  npx lighthouse <url> --output=json --chrome-flags="--headless=new --no-sandbox" \
  --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate
```

**Methodik-Hinweis, wichtig für die Einordnung:** diese Zahlen entstehen gegen
`vite preview` auf `localhost` — kein CDN, kein Edge-Cache, kein HTTP/2-Server-Push,
keine Vercel-Bildoptimierung. Absolute Werte sind deshalb **nicht** mit den
production-gemessenen Werten von `waxcelerate.de` vergleichbar (dort zuletzt
Startseite 87–89, siehe `docs/berichte/`-Vorgänger bzw. Memory vom 2026-09-10).
Um trotzdem eine faire Aussage zu treffen, läuft **dieselbe Messung unter
identischen lokalen Bedingungen gegen eine bereits live geschaltete
Vergleichsseite** (`/starter-set`, ähnlich textlastig, ähnliche Seitenstruktur).

| Seite | Perf | A11y | Best Practices | SEO | LCP |
|---|---|---|---|---|---|
| `/starter-set` (**live**, lokaler Vergleichslauf) | 80 | — | — | — | 4,7 s |
| `/faq` (neu, Median aus 3 Läufen) | **83** | 100 | 96 | 100 | 4,2 s |
| `/anleitung` (neu) | 86 | 100 | 96 | 100 | 3,7 s |
| `/ueber-uns` (neu) | 86 | 100 | 96 | 100 | 3,7 s |
| `/kontakt` (neu) | 82 | 100 | 96 | 100 | 4,3 s |

Alle vier neuen Seiten liegen unter identischen lokalen Bedingungen **auf
Höhe oder über** der bereits live geschalteten Vergleichsseite — kein
Hinweis auf eine Performance-Regression durch dieses Release.

**A11y 100 auf allen vier, nach einem Fix:** Lighthouse fand auf `/kontakt`
zunächst `link-in-text-block` (ein Link im Fließtext war nur über die Farbe
erkennbar — der Impressum-Link im Absatz „Die vollständige
Anbieterkennzeichnung steht im Impressum"). Behoben mit demselben Muster, das
`BlogArticlePage.tsx` für Inline-Links bereits verwendet
(`underline underline-offset-2`), erneut gemessen: 100/100.

**Best Practices 96 auf allen vieren, zwei sitewide/lokale Ursachen, keine
Regression:**
1. `errors-in-console`: `_vercel/insights/script.js` antwortet lokal 404 —
   das Vercel-Analytics-Skript gibt es nur mit echtem Vercel-Edge, tritt auf
   **jeder** Seite der Site lokal auf, nicht nur den neuen.
2. `valid-source-maps`: der Haupt-JS-Bundle hat keine Source-Map — eine
   sitewide Build-Konfigurationsfrage, unabhängig von diesem Release.

## 7. Bewusst nicht umgesetzt: AggregateRating

Kein `AggregateRating` irgendwo im Schema — bestätigt durch den Rich-Results-Test
auf `/produkt/wax-500`, der es korrekt als „optional, fehlt" meldet, nicht als
Fehler. Die verfügbare Zahl ist die eBay-Konto-Bewertung (identisch auf allen
Produkten), die Google als self-serving/templated Review-Markup einstuft —
zweimal in früheren Sessions bewusst entfernt (Memory vom 2026-07-24 und
2026-09-10). Um es legitim zu bekommen, bräuchte es ein eigenes
Bewertungssystem mit echten, pro-Produkt-eindeutigen `review_id`s — ein
eigenes Vorhaben, hier nicht begonnen.

## 8. Startseite ohne JavaScript

`curl https://waxcelerate.de/` (kein Browser, kein JS-Rendering): 476 Wörter
substanzieller Fließtext im Roh-HTML, ein `<h1>` mit dem Hauptsuchbegriff
(„Waxcelerate — Heißwachs für Fahrradketten aus Stuttgart"), Links zu allen
Produkten, Rechnern und (nach diesem Release) den vier neuen Seiten. Der Text
liegt in `<noscript>` statt direkt in `#root` — bewusste Abwägung, siehe
Abschnitt 9.

## 9. Bekannte, bewusste Abwägungen (keine Bugs)

- **Vorgerenderter Text in `<noscript>` statt direkt im `#root`-Markup.**
  Browser mit aktiviertem JavaScript rendern `<noscript>`-Inhalt nie — kein
  Aufblitzen von ungestyltem Fallback-HTML, bevor React übernimmt (das war
  vor dieser Lösung ein sichtbares Problem auf echten Geräten/Mobilfunk).
  Googlebot und die meisten KI-Crawler (die JavaScript ausführen oder das
  Roh-HTML inklusive `<noscript>` parsen) sehen den Text in beiden Fällen.
  Ein reiner Text-Extraktor, der `<noscript>`-Inhalt explizit verwirft, würde
  ihn verpassen — laut verfügbarer Dokumentation ist das bei den großen
  KI-Crawlern (GPTBot, ClaudeBot, PerplexityBot) nicht der Fall, aber nicht
  für jedes System einzeln verifizierbar. Risiko eingestuft als gering,
  bewusst in Kauf genommen; würde sich nur durch einen eigenen, visuell
  verifizierten Umbau ändern (kein einfacher Wechsel, siehe
  `scripts/lib/prerender.mjs` Kommentar zu `buildPage()`).
- **Kein `AggregateRating`** — siehe Abschnitt 7.
- **`http://www` als 2-Hop-Redirect** — siehe Abschnitt 2, Vercel-Dashboard-Aufgabe
  für Luca.

## 10. Liste möglicher Crawl-/Indexierungsbarrieren

Geprüft und **keine gefunden** bei:
- Login/CAPTCHA/JS-Challenge vor öffentlichen Seiten (Produktion antwortet
  200 ohne Challenge, bestätigt per `curl`).
- Geoblocking (keine Vercel-Middleware/Edge-Config dafür im Repo gefunden).
- Pauschale Bot-Blockaden (robots.txt erlaubt explizit alle großen
  Such-/KI-Crawler).
- Soft-404 (unbekannte URLs liefern echtes HTTP 404, kein SPA-Fallback mit
  200 — seit dem Wegfall des Catch-all-Rewrites in `vercel.json`).
- Fehlendes/falsches Canonical, doppelte Title/H1 (0 von 330 automatisierten
  Prüfungen fehlgeschlagen).

**Offen, außerhalb des Codes, nur Luca kann sie beheben** (unverändert
gegenüber `docs/plaene/SICHTBARKEIT_PLAN.md`, hier nur bestätigt):
- Google Search Console: Sitemap nach diesem Release erneut einreichen,
  Indexierung für die vier neuen URLs beantragen (siehe `docs/SEO_TECHNIK.md` §4).
- Google Merchant Center: Konto/Feed-Verknüpfung, EU-Preisvergleichsdienst —
  Voraussetzung für Sterne/Preis in Google Shopping/Free Listings.
- Bing Webmaster Tools: Import aus GSC.
- `http://www`-Redirect auf einen Hop verkürzen (Vercel-Dashboard).

## 11. Bestand gehärtet statt neu geschrieben (bewusste Entscheidung)

Kein neuer Blogartikel in diesem Durchgang — die 18 vorhandenen decken die
Heißwachs-Kernthemen bereits ab (Anleitung, Entfetten, Umstieg, Laufzeit/Kosten,
Fehler, Winter, MoS₂, Verschleiß messen …); weitere Artikel blind dazuzuschreiben
hätte reales Kannibalisierungsrisiko gegen die eigenen Seiten gehabt. Stattdessen:

- Die vier neuen Seiten sind jetzt in jeden Artikel-Fußbereich, die Sitemap und
  `llms.txt`/`llms-full.txt` eingewoben (siehe Abschnitt 3 und `docs/SEO_TECHNIK.md`).
- **Nicht angefasst:** `HowTo`-Abdeckung der Artikel liegt weiter bei 5 von 18
  (`fahrradkette-entfetten`, `heisswachs-anleitung`, `tropfwachs-hybrid-methode`,
  `von-oel-auf-wachs-umsteigen`, `schnellverschluss-quicklink`). Weitere Artikel
  wie `kettenverschleiss-messen` oder `wachs-entsorgen-topf-pflegen` beschreiben
  teilweise Schrittfolgen, die sich als `HowTo` eignen könnten — bewusst nicht
  ergänzt, weil das eine Einzelfallprüfung pro Artikel braucht (nicht jeder
  Absatz mit Schritten ist tatsächlich eine Anleitung im Sinne des Schemas),
  keine Schablonenarbeit. Empfehlung, keine Umsetzung.
- **Nicht geschrieben:** eine eigene Seite zur Stuttgarter Herstellung — die
  reale Themenlücke, die bereits in einer früheren Session identifiziert wurde
  (Memory vom 2026-07-24). Berührt die Claims-Regeln aus `PROJECT.md`
  („Hergestellt in Stuttgart" nur fürs Wachs, nie „Made in Germany" für die
  zugekauften Ketten) und ist Lucas Copy-Entscheidung, nicht meine.

## 12. Nicht in diesem Durchgang geprüft

- **PageSpeed-Insights-Felddaten** (Real-User-Metriken) — brauchen echten
  Produktions-Traffic über mehrere Tage, per Definition nicht vor einem
  Deploy verfügbar.
- **Rich-Results-Preview/Vorschau-Rendering** — der Code-Snippet-Modus von
  Google testet Markup-Gültigkeit, nicht die exakte SERP-Darstellung; die
  bräuchte eine live erreichbare URL.

---

## Verifikations-Kommandos (Nachvollziehbarkeit)

```bash
npm run check:live                                   # 330/330 gegen die Live-Domain (vor diesem Release)
npx tsc -b --force && npm run build                   # sauber, siehe Etappe 1
npm run preview -- --port 4319                        # lokaler Produktions-Build
CHROME_PATH=~/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell \
  npx lighthouse http://localhost:4319/faq/ --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate
```
