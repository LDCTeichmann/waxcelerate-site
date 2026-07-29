# Waxcelerate Website · Einstiegspunkt

Diese Datei ist das Inhaltsverzeichnis. Sie soll kurz bleiben, damit jede neue
Session sie ganz liest, ohne Kontext zu verbrennen. Alles Ausführliche liegt in
`docs/` und wird nur bei Bedarf geöffnet.

**Regel für Agenten:** diese Datei immer lesen. Aus `docs/` nur das, was der
konkreten Aufgabe entspricht. Neues Wissen gehört in die passende Detaildatei,
nicht hierher, außer es ist eine Entscheidung oder ein offener Punkt.

---

## Was das ist

Marketing-Website für Waxcelerate, deutsche Kleinmarke für Heißwachs-Kettenpflege
(Luca Teichmann, Stuttgart). React 19, TypeScript, Vite, kein Server.
Verkauf über eBay und Direktbestellung. Live auf `waxcelerate.de`, Deploy über
Push auf `main`, Vercel baut automatisch.

---

## Wo was steht

| Thema | Datei | Wann lesen |
|---|---|---|
| Technischer Einstieg, Deploy, Fallen | `AGENTS.md` | vor der ersten Code-Änderung |
| Kurzregeln, Datenhaltung, Hooks | `CLAUDE.md` | immer |
| Repo-Karte, Nachbarordner, Git-Stashes | `WEBSITE_HANDOFF.md` | bei Git- oder Ordnerfragen |
| **Designsystem, Farben, Zeichnungen, Typo** | **`docs/DESIGN.md`** | bei allem Visuellen |
| **Audit der ganzen Seite, Befunde und Reihenfolge** | **`docs/AUDIT.md`** | bei Struktur-, Funnel- und Prioritätsfragen |
| Wissenschaftsseite und Startseite, aktueller Umbau | `WISSENSCHAFT_NOTES.md` | bei Arbeit an diesen Seiten |
| Blog, Stand und Konzept | `BLOG_PLAN.md` | bei Blogarbeit |
| Blog, abgearbeitete Aufgaben | `BLOG_EXECUTION.md` | als Muster |
| Rechtstexte, Stripe, UX-Plan | `RECHTSTEXTE.md`, `STRIPE_SETUP.md`, `UX_UPGRADE_PLAN.md` | themenbezogen |

Inhaltliche Wahrheit über Produkt, Preise, Intervalle und erlaubte Claims steht
**nicht im Repo**, sondern im Anthropic-Skill `waxcelerate`. Ist es nicht
installiert: nachfragen statt raten. Nie eine technische Zahl aus dem Code
übernehmen, ohne sie zu hinterfragen.

---

## Offene Entscheidungen, die nur Luca treffen kann

Kurz halten. Erledigtes wandert nach unten in den Log.

- **µ 0,03 als Einzelzahl.** `waxVsOil.friction` ergibt „7× weniger als Öl". Die 0,03 ist der beste Wert der Pro-Spanne und im Formel-Graph korrekt als MoS₂-Kennwert ausgewiesen. Als Kachel ohne Zuordnung angreifbar. `frictionRanges` hat die ehrlichere Darstellung.
- **„~10 nm Lamellen"** im Paraffin-Text. Periode rund 9,3 nm ist ein Doppelstapel, eine Lamelle 4 bis 5 nm.
- **PTFE- und PFAS-Sprachpolitik** ist offen und blockiert einen geplanten Blogartikel.
- **„Leiser Antrieb"** wäre ein starkes Verkaufsargument, steht aber in keiner verbindlichen Quelle.
- **Foto-Lücke:** kein eigenes Vorher-Nachher-Paar geölt gegen gewachst. Größter offener Hebel auf der Startseite. `ComparisonSlider` liegt fertig und ungenutzt.
- **Kaufweg:** eBay bis der Stripe-Checkout steht, geplant Sonntag oder Montag.
- **Startseitenlänge:** Rechner, Anleitungen und FAQ stehen nach dem Kaufangebot. Vorschlag in `docs/AUDIT.md`, bewusst noch nicht umgesetzt.
- **`public/images/chain-dirty.jpg`** ist ein fremdes Foto mit englischer Kritzelei. Sollte gelöscht werden.
- **Starter-Sets** existieren nicht in `data.ts`. Solange `SETS_LIVE` in `ProductDoors.tsx` false ist, zeigt die Reihe zwei statt drei Türen.
- **57 Gedankenstriche** als Satzzeichen in `src/lib/data.ts` sind noch nicht bereinigt.

---

## Beauftragt, noch nicht gebaut

Von Luca am 2026-07-28 vorgegeben. Spezifikation hier festhalten, damit sie
nicht im Chatverlauf verloren geht.

**Starter-Sets als Produkte in `data.ts`**
`/starter-set` steht, rechnet aber mit einem Beispielset aus vorhandenen
Katalogpreisen. Damit man es kaufen kann, braucht es echte SKUs, entweder als
neue Kategorie oder als konfigurierbares Bundle. Zubehoer ebenso: Aufhaengedraht
3 Stueck 5 EUR zuzueglich 1,80 EUR Versand, Quick-Link-Zange 5 EUR.

**FAQ und Kontakt wirken zu breit**
Nicht angefasst. Im Code steht bei beiden Sektionen ein Kommentar des anderen
Agenten, dass zwei Versuche mit max-w-2xl als "nach links verschoben" gelesen
wurden. Vorschlag als dritter Weg: Ueberschrift bleibt an der linken
Spaltenkante wie in allen anderen Sektionen, nur der Lesetext wird auf etwa
880 px begrenzt. Vorher abstimmen, das ist fremdes Terrain.

**chain-dirty.jpg loeschen**
Fremdes Foto mit englischer Kritzelei, unbenutzt.

---

## Entscheidungslog

Eine Zeile pro Entscheidung, neueste oben. Begründungen stehen im Code-Kommentar
an der Stelle, an der die Entscheidung wirkt.

- 2026-07-29 · /starter-set gebaut. Rabatt als Rechnung gezeigt, nie als Prozent-Badge.
- 2026-07-29 · Produktliste erscheint erst nach Klick auf eine Tuer, mit Rueckweg.
- 2026-07-29 · Zehnerkarte auf /rewax statt als vierte Produkttuer.
- 2026-07-29 · Rewax-CTA geht direkt auf WhatsApp mit vorbefuelltem Text, E-Mail als Alternative.
- 2026-07-29 · KI-Bilder process-melt.jpg und process-dip.jpg ersetzt durch echte Aufnahmen (public/images/rewax/)
- 2026-07-28 · „Was das bedeutet" ist kein Diagramm mehr, sondern drei Zeilen mit Foto und je einer Aussage (`WhatChanges.tsx`). Zwei Diagrammversuche davor sind gescheitert, weil beide erst dekodiert werden wollten.
- 2026-07-28 · Kettenglied im Schnitt: die Kette steht jetzt aufrecht links, damit die Schnittebene waagerecht in die Zeichnung läuft
- 2026-07-28 · `/rewax` gebaut: eigene Seite, Navigation, Band unter der Produktliste. Nur Rewax bereits gewachster Ketten, kein Entfetten.
- 2026-07-28 · Preise Rewax B2C: 13,95 € einzeln, 9,95 € ab drei Ketten, plus 1,80 € Rückversand. **Ersetzt die älteren 9,99 / 24,99 im Business-Kontext-Skill, das gehört dort nachgezogen.**
- 2026-07-28 · Eine Aussage pro Fläche. `waxVsOil.life` trägt jetzt eine Spanne, überall wird „2 bis 3×" gerendert, nie mehr „3×"
- 2026-07-28 · `InstrumentFrame` hell steht auf Weiß statt `--sf2`, `grain` nur noch in der dunklen Variante. Panel ist Papier, nicht ein weiterer Grauton der Seite.
- 2026-07-28 · Figuren bekommen zwei Layouts statt einer Skalierung, weil SVG-Text mit der viewBox schrumpft (`useMediaQuery.ts`)
- 2026-07-28 · Produkteinstieg über drei Türen nach Absicht statt Produktliste (`ProductDoors.tsx`)
- 2026-07-28 · Zeichenskala als Tokens `--dw-hair/line/bold`, Mindestschrift 11 px in Figuren (`docs/DESIGN.md`)
- 2026-07-28 · Grain-Overlay auf 2 % und `color-interpolation-filters=sRGB`, behebt den Olivstich
- 2026-07-28 · Antriebsverlust als Sägezahn statt Balken oder Strichkamm (`DrivetrainLoss.tsx`)
- 2026-07-28 · ACT I Kontaktzonen ergänzt, behebt den toten Anker `#problem`
