# Gesamtübersicht — was aussteht

**Stand:** 19.08.2026. Antwort auf: "was steht noch alles aus, was steht noch
in den Plänen, und was wäre sonst noch sinnvoll für UI/UX/Usability/
Conversion." Alle 13 bestehenden Plan-/Aufgaben-Dokumente wurden gegen den
echten Code-/Repo-Zustand geprüft (nicht blind übernommen — mehrere Punkte,
die die Dokumente noch als offen listen, sind längst erledigt). Dazu zwei neue
Recherche-Runden zu Navigation/IA und Conversion/Usability.

**Wie du das liest:** Checkboxen zum Abhaken. 🔨 = ich kann sofort loslegen,
keine Rückfrage nötig. 🤔 = ich hab eine Empfehlung, brauche aber kurz dein
Okay. 🙋 = nur du kannst das liefern oder entscheiden. ⛔ = wartet auf etwas
anderes. Details/Quellen zu den UX-Punkten stehen in
`docs/plaene/NAVIGATION_UX_PLAN.md` und `docs/plaene/CONVERSION_UX_PLAN.md` —
hier nur die verdichtete Handlungsliste.

---

## Der eine Punkt, der am meisten freischaltet

🙋 **Die 12 Stripe Price-IDs.** (`docs/aufgaben/STRIPE_SETUP.md`) Sobald die
gesetzt sind, schaltet das den eigenen Checkout scharf und entblockiert direkt
darunter drei weitere Punkte in dieser Liste (C2, die Rechtstexte-Livepflicht,
und die Zwei-Kaufwege-Frage aus `NAVIGATION_UX_PLAN.md` 2.3). Das ist mit
Abstand der größte Hebel im ganzen Projekt — technisch trivial für mich, sobald
die IDs da sind (`data.ts` befüllen), aber kann nur von dir kommen
(Stripe-Kontoeinrichtung).

---

## 🔨 Kann ich jetzt direkt angehen — kein Risiko, keine Rückfrage

- [x] **Footer auf 5 Unterseiten ergänzt** (Blog-Index, Blog-Artikel,
      Wissenschaft, Rewax, Starter-Set) — `tsc -b` sauber. *(`NAVIGATION_UX_PLAN.md` 1.1)*
- [x] ~~Preis pro Gramm ergänzen~~ — **Korrektur:** existierte schon als
      €/100g auf Karte und Detailseite, mein ursprünglicher Fund war falsch
      (falscher Such-String). Kein Code geändert, nur die Doku korrigiert.
      *(`NAVIGATION_UX_PLAN.md` 1.2)*
- [x] **Blog-Index bekommt eine sichtbare "Zurück zur Startseite"-Zeile**,
      analog zu den anderen Unterseiten — ergänzt, `tsc -b` sauber.
      *(`NAVIGATION_UX_PLAN.md` 2.2)*
- [x] **Footer-Sitemap vervollständigt**: `/kette-wachsen-lassen` (Rewax) und
      `/starter-set` fehlten im Footer, obwohl eigene Seiten mit eigenem
      Angebot — ergänzt. *(`DISCOVERY_UX_PLAN.md`, neue Recherche-Runde 3)*
- [x] **Barrierefreiheits-Basis-Check** durchgeführt, `tsc -b` + Build +
      Live-Kontraströechnung im Browser sauber. Gefunden und behoben:
      - Zwei **echte, aktuell live sichtbare Kontrastfehler**: "X+ zufriedene
        Kunden" auf der Produktseite lag bei ~2,2:1 statt der WCAG-Pflicht
        4,5:1 (jetzt `var(--txm)`, ~6,7:1); die "Nur noch X verfügbar"-Warnung
        im (aktuell inaktiven) Warenkorb-Button lag bei ~2,1:1 (jetzt
        amber-700, ~5,0:1 — wäre sonst erst beim Stripe-Go-Live aufgefallen)
      - Ein Produktbild ohne beschreibenden Alt-Text (Starter-Set-Karten)
      - Zwei Suchfelder ohne `aria-label` (nur Placeholder: Blog-Index, FAQ)
      - `autoComplete="email"` im Widerruf-Formular ergänzt
      - Stichprobe bei Button-Beschriftungen und Linktexten: keine Lücken
        gefunden (Icon-Buttons haben durchgängig `aria-label` oder
        sichtbaren Text, keine "hier klicken"-Linktexte)
      - **Nicht vollständig geprüft:** ein wiederkehrendes Muster blasser
        `rgba(0,0,0,0.28–0.35)`-Textfarben in `ProductDetailPage.tsx`
        (Mono-Labels für Specs/Preis-pro-Anwendung) — bewusst nicht
        pauschal umgeschrieben, da das eine systematische, mutmaßlich
        gewollte Design-Sprache ist und keine punktuelle Lücke; verdient
        einen eigenen, fokussierten Kontrast-Durchgang statt eines
        Nebenbei-Fixes.
- [ ] **Maßstabsbild für Wachs-Dosen** prüfen/ergänzen (Größenvergleich).
      *(`CONVERSION_UX_PLAN.md` 1)*
- [ ] **Bildunterschriften bei den Mikroskopie-Bildern** ("Wachsschicht bei
      50-facher Vergrößerung, trocken" o.ä.). *(`CONVERSION_UX_PLAN.md` 1)*
- [x] **Pinch/Zoom auf Produktbildern (Mobile)** geprüft: System-Zoom nicht
      blockiert, Lightbox mit hochauflösendem Bild existiert bereits. Echtes
      In-Bild-Pinch-Gesture bewusst nicht gebaut — nicht auf echtem
      Touch-Gerät verifizierbar in dieser Umgebung, zu riskant ungetestet zu
      shippen. *(`CONVERSION_UX_PLAN.md` 1)*
- [ ] **Bildgewicht/Lazy-Loading-Check** (WebP/AVIF durchgängig, srcset,
      Above-the-fold priorisieren). *(`CONVERSION_UX_PLAN.md` 4)*
- [ ] **`autoComplete`-Attribute im Widerruf-Formular** ergänzen — klein,
      `WiderrufPage.tsx` ist sonst schon sauber gebaut.
      *(`CONVERSION_UX_PLAN.md` 3)*
- [ ] **Kompaktes Sprungmarken-Menü auf `/wissenschaft`** — bewusst noch
      nicht gebaut, siehe `DISCOVERY_UX_PLAN.md` (bekannt fragiles
      GSAP-Scroll-Verhalten auf dieser Seite, eigener vorsichtiger Durchgang
      statt Nebenbei-Fix).
- [x] **Reste aus `UX_UPGRADE_PLAN.md` verifiziert** — alle fünf bereits
      erledigt, keine davon musste noch gebaut werden:
      - Anleitungen-Akkordeon: schließt sich bereits korrekt auf Mobile
        (<768px), offen auf Desktop — genau die Mobile-"überwältigend"-Fix
        aus einer früheren Session
      - Produktgalerie-Pfeile: nutzen bereits das etablierte
        "dunkle Pille + heller Pfeil"-Muster, kontrastunabhängig vom Foto
        dahinter
      - Lieferdatum + Preis/100g stehen bereits auf der Produktseite
      - Mobile Sticky-CTA bleibt bereits durchgehend sichtbar (Mobile-Plan
        B2), blendet nur im Footer aus
      - Verkaufszahl/Bewertungen stehen bereits direkt an der Kaufentscheidung
        auf der Karte (ab 20 Stück, schwacher Beleg sonst ausgeblendet)

## 🤔 Meine Empfehlung, bitte kurz bestätigen

- [ ] **eBay-Vertrauenssignal näher an den Kaufpunkt** verschieben/wiederholen
      (aktuell nur ganz unten in der Abschluss-CTA). Kleiner Eingriff in ein
      bereits fein abgestimmtes Kartenlayout, deshalb Rückfrage.
      *(`NAVIGATION_UX_PLAN.md` 2.1)*
- [ ] **Produktname vereinheitlichen**: "MoS₂ Pro Edition" vs. "Pro" —
      Content/SEO, aber schnell erledigt. *(`SICHTBARKEIT_PLAN.md` §12.5)*
- [ ] **Reibungskoeffizient aus der Meta-Description entfernen oder belegen**
      — aktuell unbelegte Zahl live im `<head>`. *(`SICHTBARKEIT_PLAN.md` §12.7)*
- [ ] **AGB-Grundsatzentscheidung**: keine AGB / IHK-Muster / bezahlter
      Rechtstext-Dienst (~15 €/Monat) — meine Empfehlung wäre der bezahlte
      Dienst wegen Abmahnrisiko, wie im Dokument selbst schon vorgeschlagen.
      *(`RECHTSTEXTE.md`)*
- [ ] **"Kürzlich verkauft"-Hinweis** — nur falls echte Verkaufsfrequenz das
      glaubwürdig hergibt, sonst lieber lassen. *(`CONVERSION_UX_PLAN.md` 5)*

## 🙋 Nur du — UX/Conversion-relevant für Website-Besucher

- [ ] Die 12 Stripe Price-IDs (siehe oben, der große Blocker)
- [ ] **BMJ-Musterwiderrufsbelehrung + -formular** in
      `WiderrufsbelehrungPage.tsx` einfügen — Platzhalter ist noch drin,
      rechtlich zwingend vor Checkout-Livegang. *(`RECHTSTEXTE.md`)*
- [ ] **Echtes Vorher-Nachher-Foto** (geölt vs. gewachst, gleiche Kette,
      gleicher Winkel) — größter Hebel pro Aufwand laut internem Audit,
      entblockiert `ComparisonSlider`. *(`DESIGN_ROADMAP.md` 4.1)*
- [ ] **Über-mich-Fakten prüfen**: stehen dort konkrete, nachprüfbare Zahlen
      (Betriebsdauer, Anzahl gewachster Ketten) statt nur Erzählung?
      *(`NAVIGATION_UX_PLAN.md` 3.3)*
- [ ] **Hero-Entscheidung treffen oder bestätigen** — seit über drei Wochen
      weder umgesetzt noch widerrufen (Variante A, hängende Ketten).
      *(`DESIGN_ROADMAP.md` 3.1)*

## 🙋 Nur du — SEO/Content/Business-intern, keine Website-UX

Kurz gebündelt, Volltext steht in den Einzeldokumenten:

- [ ] Widersprüchliche Bewertungszahl vereinheitlichen (200+ vs. 164, an drei
      Stellen unterschiedlich)
- [ ] Anwendungszahl pro Block klären (20–32 vs. 15–20)
- [ ] Kettenlaufzeit-Grundlage (16.000–20.000 km) — Messung oder Schätzung?
- [ ] Classic-PFAS-Rezeptur-Umstellung (blockiert Presse-Outreach)
- [ ] Google-Unternehmensprofil fertigstellen (Beschreibung, Fotos,
      Leistungen — Profil existiert bereits, wartet auf Inhalt)
- [ ] Kleinanzeigen-/eBay-Mich-Seite/velomarkt/buycycle mit Link versehen
      (Texte liegen fertig in `OUTREACH_TEXTE.md`/`EBAY_MICH_SEITE.md`)
- [ ] Merchant Center einrichten, Kettenbilder von eBay migrieren (Skript
      liegt bereit, braucht nur Ausführung mit Mac-Zugriff)
- [ ] Presse-Outreach (Stiftung Warentest, speed-ville.de) — wartet ohnehin
      auf die Classic-Umstellung
- [ ] Kimi-Klon-Vorschau abschalten (`bffweqay3hca2.kimi.page`)

Volle Liste mit Kontext: `docs/aufgaben/LUCA_TODO.md`,
`docs/aufgaben/OUTREACH_TEXTE.md`, `docs/plaene/SICHTBARKEIT_PLAN.md` §12.

## ⛔ Blockiert

- **Checkout-Kaufpfad 5→2 Schritte** ← wartet auf Stripe Price-IDs
- **Presse-Outreach** ← wartet auf Classic-PFAS-Rezeptur-Umstellung
- **Rewax-Preis überdenken** ← reine Entscheidung, nicht dringend
  *(`SICHTBARKEIT_PLAN.md` §9 Phase 7)*

---

## ✅ Schon erledigt — zur Sicherheit hier vermerkt, nicht nochmal anfassen

- `DEPLOY_HANDOFF.md` komplett (Branch längst gemerged)
- `MOBILE_PLAN.md` Stufe A und B komplett
- `UX_UPGRADE_PLAN.md` Phasen 1, 2.1, 3.1, 3.2, 4.6, 5.1, 7.2, 8.3
- `SICHTBARKEIT_PLAN.md` Phase 1, 2, Teile von Phase 4
- `RECHTSTEXTE.md`: `/widerruf`, `/widerrufsbelehrung`-Grundgerüst, AGB,
  Datenschutz-Stripe-Abschnitt, `/versand-und-zahlung` existieren im Code
- Alle Punkte aus `NAVIGATION_UX_PLAN.md` Abschnitt 0 (bereits richtig,
  durch Recherche bestätigt — keine Suchleiste, keine Wachs-Filter,
  Ratgeber-Panel, Hamburger-Menü, Staffel als Fließtext)

---

## Empfohlene Reihenfolge

1. **Footer-Fix** (🔨 1.1) — größter Fund, kleinster Aufwand, auch rechtlich.
2. **Accessibility-Basis-Check** (🔨) — einmal durchlaufen, deckt fast alles ab.
3. **Restliche 🔨-Punkte** — unabhängig voneinander, in beliebiger Reihenfolge.
4. **🤔-Punkte** — sobald du die kurzen Bestätigungen gibst.
5. **Stripe Price-IDs** (🙋, sobald du Zeit findest) — schaltet den größten
   nachgelagerten Block frei.
6. **Rest der 🙋-Liste** — nach deiner eigenen Priorität, nichts davon ist
   technisch von mir abhängig.

Sag mir einfach, wo ich anfangen soll — oder wenn du bei einem Punkt eine
Frage hast, bevor ich loslege.
