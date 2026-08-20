# Wegfindung & Discovery — Recherche-Runde 3

**Erstellt:** 19.08.2026, Sonnet 5. Dritte Recherche-Runde, konkret zu "was
gibt es neben Back-to-Top/Home-Button noch an smarten Wegfindungs-Mustern"
(siehe auch, verwandte Inhalte, Sprungmarken etc.). Bereits vorhanden auf der
Seite, nicht nochmal vorgeschlagen: Back-to-Top-Button (Footer), "Ähnliche
Produkte" auf der Produktdetailseite, "Weiterlesen" unter jedem Blog-Artikel,
Breadcrumb/Zurück-Links, Ratgeber-Dropdown.

Auffällig gut in dieser Runde: der Agent hat eine kursierende "Chartbeat
2026"-Studienzahl zu Scroll-Fortschrittsanzeigen direkt gegen die echte
Chartbeat-Seite geprüft — dort nicht auffindbar, vermutlich erfunden — und
korrekt verworfen statt übernommen.

---

## Umgesetzt in dieser Session

- ✅ **Footer-Sitemap vervollständigt.** [NN/g, belegt, konkrete Regel] Ein
  vollständiger Sitemap-Footer ist laut NN/g sinnvoll bei ≤ ca. 25 Seiten —
  Waxcelerate liegt klar darunter, ein ausführlicherer Footer ist hier also
  *richtig*, nicht Overkill. Geprüft: `/kette-wachsen-lassen` (Rewax) und
  `/starter-set` fehlten komplett im Footer, obwohl beides eigene Seiten mit
  eigenem Angebot sind. Ergänzt in `footer.tsx` (Shop-Spalte).

## 🔨 Empfohlen, noch nicht gebaut

- 🔨 **Kompaktes Sprungmarken-Menü auf `/wissenschaft`.** [NN/g, mit
  Einschränkung] TOCs lohnen sich bei langen, klar in Blöcke zerlegbaren
  Seiten — die Wissenschaftsseite ist mit 970 Zeilen/mehreren Akten (Reibung,
  Formel, Matrix) ein guter Kandidat. **Bewusst noch nicht umgesetzt in
  dieser Session**, weil diese Seite laut Session-Historie bekannt fragiles
  GSAP-ScrollTrigger-Verhalten hat (mehrfach dokumentierte Scroll-Bugs unter
  Automatisierung) — das ist genau die Art Änderung, die ich nicht
  unverifiziert "einfach reinbauen" wollte. NN/g warnt außerdem explizit:
  ein zu groß/grafisch gestaltetes TOC wird für Werbung gehalten und
  ignoriert — muss kompakt und dezent bleiben, auf Mobile als
  Accordion/sticky-collapsible, nicht als Sidebar. Eigener, vorsichtiger
  Durchgang empfohlen, nicht im Vorbeigehen.

## Geprüft und bewusst NICHT umgesetzt — Forschung stützt es nicht

- ❌ **Vor/Zurück-Navigation zwischen Blog-Artikeln.** Keine belastbare
  Studie gefunden (die kursierende "+18% Pageviews"-Zahl ist ein unbelegter
  SEO-Blog-Claim). Zusätzlich inhaltlich fragwürdig: der Blog ist thematisch
  geordnet (6-Kategorie-Taxonomie), nicht chronologisch — eine Vor/Zurück-
  Leiste würde eine Reihenfolge suggerieren, die es gar nicht gibt. Die
  bestehenden 3 kuratierten "verwandte Artikel" sind die bessere Lösung.
- ❌ **Scroll-Fortschrittsanzeige.** Keine Studie belegt einen Nutzen; die
  einzige kursierende Zahl dazu ("Chartbeat 2026") ist nicht auf der echten
  Chartbeat-Seite auffindbar und vermutlich erfunden. Ein UX-Bericht
  beschreibt sogar einen störenden/ablenkenden Effekt. Nicht bauen.
- ❌ **Sektions-Dots / Sticky-Mini-Nav mit Live-Hervorhebung** für die lange
  Startseite. Kein NN/g-/Baymard-Beleg für dieses Muster bei redaktionellen
  Landingpages (das Muster stammt aus Portfolio-/Onboarding-Kontexten mit
  kurzen linearen Sequenzen, nicht 10 inhaltlich unterschiedlichen
  Sektionen). NN/g-Eyetracking zeigt stattdessen: 80% der Aufmerksamkeit
  liegt above the fold — der Hebel ist, Wichtiges weiter oben zu platzieren,
  nicht zusätzliche Scroll-Navigations-UI zu bauen.
- ❌ **Produktvergleichs-Feature** für die 3–4 Wachs-Sorten. Baymards
  Kriterium ist Produktkomplexität (viele technische Specs), nicht
  Katalog-Größe — unsere Varianten sind einfach genug, dass eine
  Vergleichsfunktion keinen zusätzlichen Nutzen gegenüber der bestehenden
  Kartendarstellung hätte.

## Bestätigt richtig, keine Änderung

- ✅ **Empfehlungsblöcke am Artikelende statt in der Seitenleiste.** [NN/g
  "Related Content Boosts Pageviews, When Done Right", direkt geprüft] Genau
  das bestehende Muster (3 verwandte Artikel am Ende, klare Überschriften)
  ist die von NN/g empfohlene Platzierung und Form. Keine Änderung.
- ✅ **Keine Next/Prev-Kette, kein Fortschrittsbalken, keine Sektions-Dots** —
  siehe oben, alle drei bewusst verworfen statt implementiert.

## Nicht entschieden, niedrige Priorität

- Sparsame **Inline-Links im Fließtext** von Blog-Artikeln zur
  Wissenschaftsseite bei Fachbegriffen — plausibel nach dem
  Information-Scent-Prinzip, aber keine dedizierte Studie dazu gefunden.
  Kein Fix, eher eine redaktionelle Fingerübung für später, falls gewünscht.
