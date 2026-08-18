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

## Wie die Doku sortiert ist

Im Wurzelverzeichnis liegen nur vier Dateien, und das soll so bleiben. Alles
andere steht in `docs/`, nach Lebenszyklus getrennt:

| Ort | Was dort liegt |
|---|---|
| Wurzel | `PROJECT.md` (diese Datei), `CLAUDE.md`, `AGENTS.md`, `README.md` |
| `docs/` | Dauerhafte Referenz: Designsystem, Audit, Repo-Karte, Wissenschaftsnotizen |
| `docs/plaene/` | Laufende Bauvorhaben. Ist eines fertig, wandert es nach `docs/archiv/` |
| `docs/aufgaben/` | Was **Luca** selbst tun muss, nicht ein Agent |
| `docs/archiv/` | Abgearbeitet oder überholt. Nur als Muster oder Beleg lesen, nie als Auftrag |

**Neue Datei anlegen:** in den passenden Unterordner, und eine Zeile in die
Tabelle unten. Keine neuen Markdown-Dateien in die Wurzel.

---

## Wo was steht

| Thema | Datei | Wann lesen |
|---|---|---|
| Technischer Einstieg, Deploy, Fallen | `AGENTS.md` | vor der ersten Code-Änderung |
| Kurzregeln, Datenhaltung, Hooks | `CLAUDE.md` | immer |
| Repo-Karte, Nachbarordner, Git-Stashes | `docs/REPO_KARTE.md` | bei Git- oder Ordnerfragen |
| **Designsystem, Farben, Zeichnungen, Typo** | **`docs/DESIGN.md`** | bei allem Visuellen |
| **Audit der ganzen Seite, Befunde und Reihenfolge** | **`docs/AUDIT.md`** | bei Struktur-, Funnel- und Prioritätsfragen |
| Wissenschaftsseite und Startseite, aktueller Umbau | `docs/WISSENSCHAFT_NOTES.md` | bei Arbeit an diesen Seiten |
| Blog, Stand und Konzept | `docs/plaene/BLOG_PLAN.md` | bei Blogarbeit |
| Blog, abgearbeitete Aufgaben | `docs/archiv/BLOG_EXECUTION.md` | als Muster |
| Rechtstexte, Stripe, UX-Plan | `docs/aufgaben/RECHTSTEXTE.md`, `docs/aufgaben/STRIPE_SETUP.md`, `docs/plaene/UX_UPGRADE_PLAN.md` | themenbezogen |
| Mobile-Optimierung (Stufe A/B abgeschlossen, C wartet auf Stripe-IDs), Deploy-Status | `docs/plaene/MOBILE_PLAN.md`, `docs/plaene/DEPLOY_HANDOFF.md` | vor jedem Deploy des `mobile-optimization`-Branchs oder bei Arbeit an Mobile-Performance/A11y |

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
- **66 Gedankenstriche** als Satzzeichen in `src/lib/data.ts` sind noch nicht bereinigt. (Stand 11.08.2026 nachgezählt, vorher stand hier 57.)

Am 11.08.2026 aus dieser Liste entfernt, weil beim Nachprüfen längst erledigt:
`chain-dirty.jpg` existiert nicht mehr, und die Starter-Sets sind live —
`SETS_LIVE` steht auf `true`, `starterSet` liegt in `data.ts`.

---

## Beauftragt, noch nicht gebaut

**Rewax-Seite: Reihenfolge und CTA neu denken**
Inhalt steht, aber der Aufbau erzeugt noch Reibung. Gewuenscht: Rotationsargument
sichtbarer (bei zwei oder drei Ketten faehrt immer eine, waehrend die andere bei
uns ist), Zehnerkarte als Geschenkidee inszenieren, Bilder staerker einsetzen.

**Bewertungen: Fotos in die Karten**
Marquee bleibt, das gefaellt. Offen ist, wie das Foto in die Karte kommt, ohne
dass der Text unlesbar wird. Vorschlag: kleines quadratisches Foto links neben
dem Zitat statt Hintergrundbild, damit der Kontrast nicht vom Motiv abhaengt.

**Dunkler Block Herkunft und Produktion**
Konzept siehe Antwort im Chat vom 2026-07-29.

**Skill `waxcelerate` nachziehen**
Fertiger Copy-Paste-Block liegt in `docs/SKILL_PREISE_UPDATE.md`. Das Skill ist
aus der Session heraus nur lesbar, deshalb muss der Block von Hand hinein.

---

## Entscheidungslog

Eine Zeile pro Entscheidung, neueste oben. Begründungen stehen im Code-Kommentar
an der Stelle, an der die Entscheidung wirkt.

- 2026-08-13 · **Englischer Zweig eingefroren, nicht ausgebaut.** Die Sprachumschaltung laeuft ueber `localStorage` ohne eigene URL, es gibt kein `hreflang`, `index.html` steht fest auf `lang="de"`. Damit ist die gesamte englische Textarbeit (`titleEn`, `descriptionEn`, der englische Teil von `i18n.ts`) fuer Google und jeden KI-Crawler unsichtbar. Entscheidung: **so lassen**. Die realistischen Ranking-Chancen liegen alle im Deutschen, und ein zweiter Markt kostet doppelte Pflege, bevor der erste laeuft. Der Umschalter bleibt als Bedienkomfort. **Wieder aufmachen, wenn:** der eigene Checkout laeuft und messbar Auslandsbestellungen kommen — dann `/en/`-Routen mit `hreflang` in beide Richtungen.
- 2026-08-13 · **Motion-Briefs verworfen** (`docs/archiv/LOTTIE_MOTION_BRIEFS.md`). Nie gebaut, wuerden funktionierende SVG-Diagramme durch eine neue Abhaengigkeit ersetzen. Reversibel, Briefs bleiben liegen.
- 2026-08-11 · **Repo aufgeräumt.** Doku nach Lebenszyklus in `docs/` sortiert (Wurzel: 27 → 4 Markdown-Dateien). `assets-archiv/` (172 MB) aus dem Repo heraus nach `../waxcelerate-assets-archiv/`. Verwaiste Arbeitskopien unter `.claude/worktrees/` (219 MB) gelöscht, die drei ungespeicherten SciencePage-Experimente daraus als Patches in `docs/archiv/worktree-experimente-2026-06/` gesichert. `functions/` (Cloudflare Pages) entfernt — die Seite läuft auf Vercel, der Ordner wurde nie ausgeführt.
- 2026-08-11 · **`/admin` war in Produktion kaputt** und ist repariert. `AdminPage.tsx` rief `/api/admin`, den Endpunkt gab es aber nur als Cloudflare-Function in `functions/api/admin.ts`. Auf Vercel greift ausschließlich `api/`, also lief die Bestandsverwaltung ins Leere. Jetzt portiert als `api/admin.ts`. Ohne gesetztes `ADMIN_PASSWORD` antwortet der Endpunkt bewusst mit 503 statt jeden hereinzulassen.
- 2026-08-11 · **Der Stop-Hook, der `git add -A && git commit && git push` ausführte, ist entfernt** (`.claude/settings.json`). Er hat jede Sitzung ungeprüft committet und gepusht. Wer ihn zurückholt, sollte wissen, dass er auch Halbfertiges veröffentlicht.
- 2026-08-11 · `api/` wird von keiner `tsconfig` erfasst und damit **weder von `tsc -b` noch vom Build geprüft**. Bekannt, nicht behoben. Bis dahin Serverless-Änderungen von Hand prüfen: `npx tsc --noEmit --skipLibCheck --strict --module esnext --moduleResolution bundler --target es2022 --types node api/*.ts`

- 2026-07-29 · Hero-Bild entschieden: Variante A, hängende Ketten. Rotation verworfen. Begründung in `docs/DESIGN.md` §6, Einbau liegt in Todoist auf Mittwoch.
- 2026-07-29 · Rewax-CTA ist ein Bildband über die volle Breite statt eines blassen Kastens, ein Knopf statt zwei. Geschenk-Hinweis sitzt auf der Stempelkarte selbst.
- 2026-07-29 · Bewertungskarten zeigen das Kundenfoto als 16:9-Band oben, Text bleibt auf der Kartenfläche. Laufschrift bleibt.
- 2026-07-29 · Wachs-Staffel 2/3/5 Stueck = 5/10/15 Prozent, ausschliesslich auf Wachs. Prozent-Badge von den Produktkarten entfernt, Staffel steht einmal ruhig ueber der Liste.
- 2026-07-29 · Starter-Set als Konfigurator: zwei Fragen, Zange und Draht liegen automatisch bei. 15 Prozent unter der Teilesumme, angezeigt als Euro-Ersparnis statt als Prozentzahl.
- 2026-07-29 · Zubehoer als eigener Typ `Accessory` statt als `Product`, weil Zubehoer keine Intervalle, Kompatibilitaeten oder Bewertungen hat und nicht in die Produktfilter gehoert.
- 2026-07-29 · `/rewax`, `/starter-set` und `/wissenschaft` werden vorgerendert und stehen in der Sitemap.
- 2026-07-29 · `chain-dirty.jpg` und vier tote Zwischenstaende geloescht.
- 2026-07-29 · FAQ und Kontakt: Lesemass 880px nur auf dem Inhaltsblock, Ueberschrift bleibt an der Spaltenkante.
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
- 2026-07-28 · Figuren bekommen zwei Layouts statt einer Skalierung, weil SVG-Text mit der viewBox schrumpft. (Der damalige Helfer `src/hooks/useMediaQuery.ts` wurde am 11.08.2026 entfernt — er hatte keinen einzigen Aufrufer mehr. Die Entscheidung gilt weiter, sie wird heute über Tailwind-Breakpoints umgesetzt.)
- 2026-07-28 · Produkteinstieg über drei Türen nach Absicht statt Produktliste (`ProductDoors.tsx`)
- 2026-07-28 · Zeichenskala als Tokens `--dw-hair/line/bold`, Mindestschrift 11 px in Figuren (`docs/DESIGN.md`)
- 2026-07-28 · Grain-Overlay auf 2 % und `color-interpolation-filters=sRGB`, behebt den Olivstich
- 2026-07-28 · Antriebsverlust als Sägezahn statt Balken oder Strichkamm (`DrivetrainLoss.tsx`)
- 2026-07-28 · ACT I Kontaktzonen ergänzt, behebt den toten Anker `#problem`
