# UX-Upgrade — Arbeitsplan

**Erstellt:** 27. Juli 2026 von Opus 5, nach einem vollständigen visuellen Audit
(Desktop 1440px, Mobile 390px, Dark Mode, Produktdetailseite) und Recherche zu
aktuellen E-Commerce- und Interaction-Design-Standards.

**Ausführung:** Sonnet 5, in **Claude Code**, in **einer** Session, **ohne
Subagenten**. Begründung siehe unten — das ist eine bewusste Entscheidung, keine
Unterlassung.
**Abnahme:** Luca wechselt danach zurück auf Opus 5 zur Bewertung.

Scope wurde von Luca festgelegt: **volle Struktur + Politur**, und
**Stripe wird scharf geschaltet** (siehe Phase 6 — das ist der einzige Teil,
der auf Input von Luca und auf Rechtstexte wartet).

### Warum eine Session und keine Subagenten

Die Phasen dieses Plans sind **nicht unabhängig.** Phase 1 baut das Raster, auf
dem 2, 3, 4 und 5 aufsetzen. Zwei Agenten, die parallel `products.tsx` und
`tools.tsx` umstellen, während ein dritter den `Section`-Wrapper noch ändert,
erzeugen Merge-Konflikte in genau den Dateien, um die es geht — und jeder
Subagent startet ohne den Kontext, den dieses Dokument gerade aufgebaut hat, muss
sich also erst wieder einlesen. Das kostet mehr Tokens, als es spart, und
verliert die Verifikationskette.

**Ausnahme, bei der ein Subagent sich lohnt:** eine reine Lese-Recherche, deren
Ergebnis eine kurze Antwort ist und kein Code — etwa „finde alle Stellen, an
denen eine Section-Breite gesetzt wird". Dafür ist `Explore` gedacht. Alles, was
Dateien schreibt, bleibt in der Hauptsession.

**Token-Disziplin stattdessen:** Nach jeder abgeschlossenen Phase committen und
in zwei Sätzen zusammenfassen, was jetzt gilt. Nicht ganze Dateien lesen, wenn
`grep -n` mit Kontext reicht. Keine Screenshots von Dingen, die eine
`getBoundingClientRect`-Messung besser beantwortet.

---

## 0. Bevor du irgendetwas anfasst

### 0.1 Lesereihenfolge

1. Dieses Dokument komplett
2. `AGENTS.md` (oberer Teil aktuell, unterer Teil veraltet)
3. `CLAUDE.md` — **Achtung, teils veraltet:** dort steht „kein Backend, keine
   E-Commerce-Funktionalität". Falsch. Es gibt Stripe-Checkout, Cart-Store,
   Upstash-Stock-API, Blog und eine Wissenschaftsseite. Regel 4 (Performance-
   Index-Balken in `why-wax.tsx` Block 4) beschreibt eine Komponente, die es
   nach dem Redesign nicht mehr gibt. Der Rest der kritischen Regeln gilt.
   **Aufgabe am Ende (Phase 8): CLAUDE.md korrigieren.**

### 0.2 Nicht anfassen

- **`git stash`** — es liegen zwei offene Stash-Einträge im Repo
  (`stash@{0}` Redesign auf `audit/award-winning`, `stash@{1}` WIP auf `main`).
  Niemals `git stash drop`, `git stash clear` oder `git checkout` in einen
  anderen Branch ohne Rückfrage.
- **Die Nachbarordner** in `Claude Playground/` (`wx-hero-light`, `wx-hr6jkh`,
  `DESIGN/`, `waxcelerate-store/`) — eigene Worktrees bzw. Archive.
- **`src/sections/hero-light.tsx` und `src/sections/hero/`** — der Hero ist der
  am stärksten durchdesignte Teil der Seite, mit langen Kommentaren, die
  erklären, warum einzelne Zeilen exakt so aussehen (Chromium-Compositing-Falle,
  mousemove-Resync-Glitch, GSAP-Transform-Ownership). Luca hat den Hero-Umbau
  **bewusst aus dem Scope genommen.** Ausnahme: die eine explizit benannte
  Änderung in Phase 4.3. Sonst nur lesen.
- **Zahlen.** Reibungskoeffizienten, Wachsausbeute, Intervalle, Watt-Angaben
  in `src/lib/data.ts` und den Sections sind von Luca verifiziert. Wenn dir eine
  Zahl falsch vorkommt: fragen, nicht korrigieren.
- **Was gut ist, bleibt gut.** `prefers-reduced-motion` ist auf dieser Seite
  vorbildlich umgesetzt (universeller Kill-Switch in `src/index.css` ~Zeile 639,
  plus einzelne Guards in fast jeder Komponente, Marquee pausiert bei
  `:hover`/`:focus-within`). Nicht vereinfachen, nicht „aufräumen".

### 0.3 Dev-Server und der Browser-Pane-Trick

```bash
npm run dev -- --port 5174
```

Besser: `preview_start` mit `{name: "waxcelerate-site"}` (Config liegt in
`.claude/launch.json`).

**Wichtig — sonst verlierst du eine Stunde:** Wenn der Browser-Pane in der App
versteckt ist, drosselt Chrome `requestAnimationFrame`. Folge: GSAP-Intros
laufen in Zeitlupe, Scroll-Reveals feuern nie, `window.scrollTo` bewegt nichts
(weil `html { scroll-behavior: smooth }` gesetzt ist), und Screenshots zeigen
leere oder um den Scroll-Offset verschobene Seiten. **Das sind keine Bugs auf
der Seite.** Ich habe das im Audit mehrfach geprüft und jeweils bestätigt, dass
die Elemente im DOM korrekt bei `opacity: 1` und richtiger Position stehen.

Workaround, den ich benutzt habe — einmal nach jedem Reload ausführen:

```js
(async()=>{
  const m = await import('/src/lib/gsap.ts');
  const g = m.gsap, ST = m.ScrollTrigger;
  document.documentElement.style.scrollBehavior = 'auto';
  // Statt zu scrollen: alle Sections außer der gewünschten ausblenden.
  window.__show = (sel) => {
    const secs = [...document.querySelectorAll('main > section, main > div')];
    secs.forEach(s => { s.style.display = (sel === '*' || s.matches(sel)) ? '' : 'none'; });
    ST.refresh();
    let t = g.globalTimeline.time();
    for (let i = 0; i < 120; i++) { t += 0.2; g.updateRoot(t); }  // Timeline manuell vorspulen
    g.set('[data-word]', { yPercent: 0 });
    g.set('[data-hero]', { opacity: 1, y: 0 });
    window.scrollTo(0, 0);
    return 'ok';
  };
  return 'ready';
})()
```

Dann `window.__show('#produkte')` und Screenshot. `window.__show('*')` stellt
alles wieder her.

**Regel daraus:** Bevor du einen visuellen Bug meldest oder „behebst", prüf per
`getComputedStyle` / `getBoundingClientRect`, ob das Problem im DOM existiert
oder nur im Screenshot. Ich habe im Audit vier vermeintliche Bugs so als
Werkzeug-Artefakte entlarvt.

### 0.4 Baseline

Vor der ersten Änderung, damit du später weißt, was du kaputt gemacht hast:

```bash
npx tsc --noEmit && npm run build
```

Muss sauber durchlaufen. Wenn nicht: **stopp und melden**, nicht reparieren —
dann ist etwas anderes im Argen.

---

## Der Befund in einem Satz

Die Seite ist handwerklich stark (Typografie, Motion-Disziplin, Accessibility,
Textqualität), aber sie **fühlt sich unruhig an, weil jede Section ihr eigenes
Raster hat**, sie **versteckt ihre besten Inhalte in Karussells**, und sie
**zeigt einen Warenkorb, der nicht befüllbar ist**. Das sind drei strukturelle
Ursachen, keine hundert kleinen Schönheitsfehler.

---

## Phase 1 — Ein Raster für die ganze Seite

**Das ist die wichtigste Änderung im Plan.** Wenn du nur eine Phase schaffst,
dann diese.

### 1.1 Der Befund

Gemessene linke Kante der Section-Überschriften bei Viewport 1440px
(`getBoundingClientRect().left`):

| Section | Container | Linke Kante | Ausrichtung |
|---|---|---|---|
| Hero (`h1`) | max-w-7xl + px-20 | **104 px** | links |
| Warum Wachs | max-w-5xl | **201 px** | links |
| Produkte | max-w-5xl | **201 px** | links |
| Reviews | max-w-5xl | **201 px** | links |
| Über mich | max-w-5xl | **201 px** | **zentriert** |
| Tools | max-w-6xl | **137 px** | links |
| Anleitungen | max-w-4xl | **265 px** | links |
| FAQ | max-w-3xl | **377 px** | links |
| Kontakt | max-w-3xl | **377 px** | **zentriert** |

Beim Scrollen springt die linke Textkante also 104 → 201 → 137 → 265 → 377.
Fünf verschiedene Breiten, dazwischen zweimal ein Wechsel auf zentriert. Genau
das erzeugt das „irgendwie unsauber"-Gefühl, das sich schwer benennen lässt.

**Die eigentliche Ursache** ist nicht, dass die Breiten unterschiedlich sind —
schmale Spalten für FAQ-Text sind typografisch richtig. Die Ursache ist, dass
jede Section ihre eigene Breite **`mx-auto` zentriert**. Dadurch wandert die
linke Kante mit der Breite mit.

### 1.2 Die Lösung

Eine gemeinsame äußere Spalte für alle Sections. Schmale Inhalte werden **innen
links angeschlagen**, nicht neu zentriert.

Lege `src/components/Section.tsx` an:

```tsx
// Eine Spalte für die ganze Seite. Sections dürfen ihre Inhalte schmaler
// setzen (Lesbarkeit), aber niemals neu zentrieren — sonst wandert die linke
// Textkante beim Scrollen, und genau das ließ die Seite unruhig wirken.
export function Section({ id, className = '', children }: {
  id?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-20">
        {children}
      </div>
    </section>
  );
}
```

Dazu ein `SectionHeader` (Eyebrow + `h2` + Lead), **immer linksbündig**, damit
alle Section-Köpfe identisch aussehen.

Dann umstellen: `why-wax.tsx`, `products.tsx`, `reviews.tsx`, `about.tsx`,
`tools.tsx`, `guides.tsx`, `faq.tsx`, `contact.tsx`.

Innerhalb der Section:
- Fließtext / FAQ / Prosa: `max-w-2xl` oder `max-w-3xl` **ohne `mx-auto`**
- Karten-Grids: volle Breite der Spalte
- `text-center` auf Section-Köpfen in `about.tsx` und `contact.tsx` **entfernen**

### 1.3 Hero-Angleichung

Der Hero steht bei 104 px, weil seine Karte zusätzlich um `lg:px-6` (24 px)
eingerückt ist. Ziel: Hero-`h1` und alle `h2` haben dieselbe linke Kante.

Du darfst dafür **nur** das Padding des Hero-Textcontainers anpassen
(`hero-light.tsx` Zeile ~292, das `px-6 sm:px-10 lg:px-14 xl:px-20`) oder das
Padding im neuen `Section`-Wrapper. Keine anderen Hero-Änderungen.

### 1.4 Verifikation

Im Browser bei 1440px, 1280px und 768px ausführen:

```js
JSON.stringify([...document.querySelectorAll('main h1, main section h2')]
  .map(h => ({ t: h.textContent.trim().slice(0,24),
               left: Math.round(h.getBoundingClientRect().left),
               align: getComputedStyle(h).textAlign })), null, 1)
```

**Erfolgskriterium: alle `left`-Werte liegen innerhalb von 2 px beieinander, und
kein `align` ist `center`.** Erst wenn das erfüllt ist, ist Phase 1 fertig.

---

## Phase 2 — Versteckte Inhalte sichtbar machen

Recherche-Grundlage: NN/g hat über drei Jahrzehnte belegt, dass Nutzer bei
automatisch rotierenden Karussells meist nur den ersten Frame sehen oder gar
keinen, und dass rotierender Inhalt Kontrolle wegnimmt. Beide Karussells hier
verstecken ausgerechnet die stärksten Verkaufsargumente der Seite.

### 2.1 Tools — 1 von 3 Rechnern ist sichtbar

**Befund:** `#tools` ist ein Coverflow. Bei 1440px Breite ist genau eine Karte
(~340 px) lesbar, links und rechts stehen zwei ausgegraute, unscharfe
Geisterkarten. Die Navigation sind drei winzige Punkte mit 10px-Labels
(„Intervall / Vorrat / Rotation"). Es gibt keine Pfeile. Rund 60 % der
Bildschirmbreite tragen nichts bei, und zwei der drei Rechner werden von den
meisten Besuchern nie gesehen.

Die Rechner sind inhaltlich das Beste an der Seite — sie beantworten genau die
Fragen, die vor einem Kauf im Weg stehen. Sie gehören nach vorn.

**Umbau in `src/sections/tools.tsx`:**
- **Desktop (`lg:`)**: alle drei Rechner nebeneinander im 3er-Grid, gleich hoch,
  volle Spaltenbreite nutzen. Coverflow entfällt.
- **Tablet (`sm:`)**: 2 + 1 oder horizontal scrollbar mit `scroll-snap`.
- **Mobile**: horizontal wischbar mit `scroll-snap-type: x mandatory`,
  aber mit **beschrifteten Tabs statt Punkten** darüber, und der nächsten Karte
  als sichtbarem 12–16px-Anschnitt am Rand, damit die Wischbarkeit erkennbar ist.
- Die Punkt-Indikatoren werden zu echten Tabs mit `role="tab"` und lesbarer
  Schriftgröße (≥ 13px).

**Achtung — kritische Regel aus CLAUDE.md:** keine Hooks in `.map()`. Wenn du
die drei Rechner in einer Schleife renderst, brauchst du eine
Wrapper-Komponente dazwischen (Vorbild: `RevealSlot` in derselben Datei).

**Verifikation:** Bei 1440px sind alle drei Rechner gleichzeitig lesbar und
gleich hoch. Bei 390px ist der zweite Rechner mit einem Wisch erreichbar, und
die Tabs sagen, wie viele es gibt. `npx tsc --noEmit` sauber.

### 2.2 Reviews — Zitate laufen weg und sind abgeschnitten

**Befund:** Die Bewertungen laufen in einem Auto-Marquee (`.marquee-track`,
Track-Breite 5888 px bei 1088 px Fenster). Die Zitate sind mit „…" abgeschnitten
und lassen sich nirgends zu Ende lesen. Bei zwei der drei sichtbaren Karten
steht weißer Text über hellen Fahrradfotos — die Lesbarkeit ist grenzwertig.
Die Karten sind unterschiedlich aufgebaut (mit Foto / ohne Foto), was die Reihe
optisch zerreißt.

Positiv und **beibehalten:** Der Marquee pausiert bereits bei `:hover` und
`:focus-within` und ist bei `prefers-reduced-motion` komplett aus.

**Umbau in `src/sections/reviews.tsx`:**
- **Desktop:** statisches Grid (3 Spalten), keine Bewegung. Zitate vollständig
  oder mit funktionierendem „Mehr lesen"-Aufklapper.
- **Mobile:** wischbar mit `scroll-snap`, eine Karte pro Screen.
- Karten vereinheitlichen: entweder alle mit Foto oder Foto als klar
  abgesetzter Block über dem Zitat — nicht Text über Foto.
- Wo Text auf Foto bleibt: dunkler Scrim dahinter, Kontrast ≥ 4.5:1 prüfen.
- Die Statistik-Zeile (`200+ Bewertungen · 346 verkauft · 0 negativ`) und der
  Button „Alle 200+ Bewertungen auf eBay ansehen" bleiben — die sind stark.

### 2.3 Anleitungen — Section wirkt leer

**Befund:** Alle drei Akkordeon-Einträge sind zugeklappt. Die Section besteht
aus drei dünnen Zeilen plus einer Temperatur-Referenzkarte rechts, deren
Oberkante zudem 53 px höher sitzt als die des Akkordeons. Auf 1440px ist die
Section fast leer.

- Ersten Eintrag standardmäßig geöffnet (NN/g: Inhalt soll sichtbar sein, wenn
  keine Interaktion nötig war, um ihn zu finden).
- Oberkanten von Akkordeon und Temperaturkarte angleichen.
- Am Ende der Section einen Link zu `/blog` („Ausführliche Ratgeber →") — die
  Blog-Artikel existieren und sind von hier aus nicht erreichbar.

---

## Phase 3 — Produktdetailseite

Die Produktseite ist die Seite, auf der gekauft wird. Sie hat aktuell die
größten strukturellen Lücken.

### 3.1 Sackgassen-Header, kein Footer

**Befund (präzise):** `ProductDetailPage.tsx` Zeile 273–287 rendert einen
eigenen, minimalen `<header>`: „← Zurück" (Link auf `/`), beim Scrollen der
Produkttitel, und das Cart-Icon. Es ist also **nicht** so, dass gar kein Header
da wäre. Was fehlt, ist alles andere: **kein Logo, kein Menü, keine
Produktnavigation — und `<Footer />` wird überhaupt nicht gerendert**, also auch
kein Impressum, keine AGB, kein Datenschutz.

Wer über Google, eine KI-Antwort oder einen geteilten Link direkt hier landet,
sieht eine Seite ohne Absender und ohne Weg irgendwohin außer „zurück zur
Startseite". Das ist ein Orientierungsproblem, ein Vertrauensproblem, ein
SEO-Problem (keine internen Links) — und **sobald der eigene Checkout live ist,
ein rechtliches Problem**: Impressum und AGB müssen von jeder Seite aus
erreichbar sein, gerade von der, auf der gekauft wird.

- **`<Footer />` einbinden.** Nicht verhandelbar, sobald Phase 6 live geht.
- Den bestehenden Header behalten, aber ergänzen: Logo links (Link auf `/`),
  daneben ein Breadcrumb `Start / Produkte / Classic 500g` statt des nackten
  „← Zurück". Die immersive Optik bleibt so erhalten.
- Der Breadcrumb ist auch für Google und KI-Crawler relevant — das
  `breadcrumbSchema` (Zeile 266) ist bereits im `<head>`, hat aber bisher **kein
  sichtbares Gegenstück auf der Seite**. Sichtbarer Breadcrumb und Schema sollen
  übereinstimmen.

### 3.2 Zwei `<h1>` im DOM

**Befund:** `ProductDetailPage.tsx` Zeile 345 und 482 rendern beide ein `<h1>`
mit demselben Produkttitel (Mobile- und Desktop-Variante). Beide sind im DOM,
eine ist nur per CSS versteckt. Im Live-DOM gemessen: `h1count: 2`.

Eine Variante zu `<p>` oder `<span>` mit den gleichen Klassen machen, oder
besser: ein `<h1>` mit responsiven Klassen statt zwei Varianten.

Nebenbei: die Überschriftenreihenfolge auf der Seite ist `h1 → h3 → h2 → h2`.
Die `h3` („Funktioniert mit allen großen …") sollte `h2` sein.

### 3.3 Lesbarkeit der Bildergalerie

- Die Zähler `01`–`06` rechts sind hellgrau auf hellem Foto — kaum sichtbar.
  Kontrast erhöhen (Scrim oder dunklere Farbe).
- Die Vor/Zurück-Kreise sind sehr klein. **Mindestens 44 × 44 px Trefferfläche**
  (WCAG 2.5.8 / iOS-HIG). Das gilt auch für die Galerie-Thumbnails.
- Unten links stapeln sich Thumbnail-Leiste und die halbtransparente
  Cross-Sell-Karte („300g — Classic, 22,95 €") übereinander. Entzerren.

### 3.4 Fehlende Kaufinformation

Die Startseiten-Karte zeigt Lieferdatum („Mi., 29. Juli") und Preis pro 100 g.
Die Produktseite zeigt beides nicht. Baymard führt Lieferdatums-Angabe auf der
Produktseite als hochwirksam und billig. Beides übernehmen.

---

## Phase 4 — Funnel und Querverlinkung

### 4.1 Reviews-Section hat keine `id`

**Befund:** Die Reviews-Section ist die einzige Section ohne `id`. Dadurch fehlt
sie in `SectionDots.tsx` (dort sind 8 Einträge für 9 Sections), ist nicht per
Anker verlinkbar und taucht in keiner Navigation auf. Ausgerechnet der
Social-Proof-Block.

`id="bewertungen"` vergeben, in `SectionDots` NAV_ITEMS aufnehmen. Ob sie auch
in die Hauptnavigation soll: eher nicht, die ist schon voll — aber verlinkbar
muss sie sein.

### 4.2 Mobile Sticky-CTA verschwindet für immer

**Befund (Code-Analyse, `src/components/MobileStickyCTA.tsx`):** Der
`productsObserver` setzt `visible = false`, sobald `#produkte` in den Viewport
kommt. Danach setzt ihn nichts wieder auf `true` — der `homeObserver` feuert nur
bei Zustandsänderungen von `#home`. Ergebnis: Sobald ein mobiler Nutzer einmal
an den Produkten vorbeigescrollt ist, **gibt es für den gesamten Rest der Seite
keinen sichtbaren Kauf-Weg mehr** — nicht bei Tools, nicht bei Anleitungen,
nicht bei FAQ, nicht bei Kontakt.

Baymard misst für persistente Sticky-Buy-Buttons +5–12 % Conversion auf Mobile.

**Fix:** Logik umstellen auf „sichtbar, sobald der Hero verlassen ist, außer
während `#produkte` selbst im Viewport steht". Also den `productsObserver` so
umbauen, dass er `visible` beim Verlassen wieder auf `true` setzt.

**Verifikation:** Bei 390px durch die ganze Seite scrollen. Der Balken ist bei
Hero weg, bei `#produkte` weg, überall sonst da.

### 4.3 Zweiter Hero-CTA fehlt auf Mobile

**Befund:** `hero-light.tsx` Zeile ~358, der Button „Wie funktioniert
Heißwachs?" hat `hidden sm:inline-flex`. Mobile Nutzer bekommen nur einen
einzigen Pfad. Wer noch nicht kaufbereit ist, hat keinen Einstieg.

**Das ist die einzige erlaubte Hero-Änderung außer Phase 1.3.** Den zweiten CTA
auch auf Mobile zeigen — als Textlink unter dem Primärbutton, nicht als zweiter
gleichwertiger Button. Danach die Hero-Höhe auf 390 × 844 prüfen: nichts darf
unter die Falz rutschen, was vorher darüber war.

### 4.4 Die Seite endet ohne Aufforderung

Letzte Section vor dem Footer ist „Kontakt". Wer bis dorthin gelesen hat, ist
die am besten informierte Person auf der Seite — und bekommt keinen Kaufimpuls,
sondern ein Kontaktformular.

Nach `#kontakt` ein schmales Abschluss-Band: eine Zeile Zusammenfassung
(„3× Kettenlaufzeit, ~€70 gespart über 12.000 km"), ein primärer CTA zu
`#produkte`, darunter die Trust-Zeile (Bewertungen, Versand, Käuferschutz).
Kein neues Design erfinden — die Bausteine dafür gibt es schon im Hero.

### 4.5 Fehlende Querverbindungen

Vorhanden und gut: `why-wax` → `/wissenschaft`, `tools` → „Wachs kaufen",
`faq` → „Kette jetzt sauber halten", `produkte` → „Vergleich ansehen".

Ergänzen:
- `anleitungen` → `/blog` (siehe 2.3)
- `bewertungen` → `#produkte`
- Produktseite → `/wissenschaft`, `#faq`, `/blog`
- `/blog`-Artikel → passendes Produkt (prüfen, ob das schon existiert, bevor du
  es baust)

### 4.6 Keine 404-Seite

**Befund:** In `src/App.tsx` fängt `<Route path="*">` alles ab und rendert die
komplette Startseite. `/voellig-falsche-url` liefert also Status 200 mit dem
vollen Homepage-Inhalt. Für Nutzer verwirrend, für Google Duplicate Content
unter beliebig vielen URLs.

Echte `NotFound`-Komponente: Navigation + Footer, kurze Erklärung, Links zu
Produkten / FAQ / Blog / Start. Die Homepage bekommt `path="/"`.

---

## Phase 5 — Dark Mode und einzelne visuelle Fehler

### 5.1 Logo verschwindet im Dark Mode

**Befund (Screenshot bei `theme=noir` bestätigt):** `/images/No BG No Sign Logo.png`
enthält schwarze Formen. Auf dem noir-Hintergrund bleiben nur die blauen Punkte
sichtbar — in der Navigation, im Footer und im Mobile-Menü. Das Markenzeichen
ist im Dark Mode praktisch unsichtbar.

Verwendungsstellen: `navigation.tsx` Zeile 114 und 246, `footer.tsx` Zeile 28.

Lösung: eine helle Logo-Variante als eigenes Asset und per `.noir`-Klasse
umschalten. **Kein CSS-`filter: invert()`** — das kippt auch das Blau.

Nebenbei: Der Dateiname enthält Leerzeichen. Beim Anlegen der neuen Variante
einen sauberen Namen verwenden (`logo-light.png` / `logo-dark.png`); die alte
Datei erst entfernen, wenn alle drei Fundstellen umgestellt sind.

### 5.2 Kontakt — die Button-Hierarchie ist verdreht

**Befund:** Die WhatsApp-Karte trägt das Label „meist sofort", der E-Mail-Karte
steht „am selben Tag". Der schnellere Kanal hat den schwächeren Button: WhatsApp
ist blassgrün und wirkt deaktiviert, E-Mail ist kräftig dunkelblau ausgefüllt.

Entweder beide gleich stark, oder WhatsApp als der stärkere. Bei zwei Optionen
in einer Reihe darf der Kontrast nicht suggerieren, dass eine davon aus ist.

### 5.3 Produktfotos „Pro" gehen im Hintergrund unter

Schwarzes Wachs auf dunklem Schiefer, in einer Karte mit dunklem Rand — im Dark
Mode fast konturlos. Das betrifft `pro-3.webp` und die 300g-Variante.

Kein Fall für Code. **Frag Luca**, ob es Aufnahmen des Pro-Wachses auf hellerem
Grund gibt. Falls nicht: als Notlösung einen dezenten helleren Verlauf hinter
das Produktbild in der Karte legen. Neue Bilder nicht generieren — auf dieser
Seite sind KI-Bilder ausdrücklich unerwünscht.

### 5.4 Über-mich-Bild ist unglücklich beschnitten

Das Foto der eBay Seller Leadership Week ist am rechten Rand mitten durch das
eBay-Logo geschnitten („eBa"). `object-position` anpassen, sodass das Logo
entweder ganz drin oder ganz draußen ist.

### 5.5 Toter Code in `useTheme`

`src/hooks/useTheme.tsx`: Der zweite `useEffect` synchronisiert mit der
OS-Einstellung, aber nur `if (!localStorage.getItem('wx-theme'))`. Der erste
Effect schreibt `wx-theme` bei jedem Mount. Die Bedingung ist damit nie erfüllt
— der Handler kann nicht feuern.

Entweder entfernen oder reparieren. **Vorsicht:** Der Kommentar
„Always default to light — OS dark mode should not auto-enable dark" ist eine
bewusste Entscheidung. Wenn du reparierst statt entfernst, änderst du das
Verhalten gegen Lucas Absicht. **Im Zweifel: entfernen und im Commit erwähnen.**

---

## Phase 6 — Stripe scharf schalten

**Luca hat das ausdrücklich so entschieden.** Diese Phase ist als einzige auf
Input von außen angewiesen.

### 6.1 Ausgangslage

**Befund:** `src/lib/data.ts` hat das Feld `stripePriceId?: string`, aber
**kein einziges Produkt hat einen Wert gesetzt** (geprüft: die einzigen
Fundstellen sind die Typdefinition Zeile 12, der Kommentar Zeile 432 und die
Funktion `canCheckout` Zeile 437).

Konsequenz heute: `canCheckout()` ist überall `false`, jeder CTA fällt auf
„Bei eBay kaufen" zurück, `AddToCartButton` wird nie gerendert — **aber
`CartIcon`, `CartDrawer` und `CartPersistenceHint` werden bedingungslos
gerendert.** Es gibt also ein Warenkorb-Symbol in der Navigation (Desktop und
Mobile), das dauerhaft einen leeren Warenkorb öffnet, ohne dass es irgendeinen
Weg gäbe, etwas hineinzulegen.

**Die gute Nachricht:** Das Backend ist fertig und sauber gebaut.
`api/create-checkout.ts` schlägt die Price-IDs serverseitig aus `data.ts` nach
(der Client sendet nie Beträge), macht Versandkostenfreiheit ab 50 €,
Rechnungserstellung mit §19-UStG-Hinweis, Karte/SEPA/Klarna, 13 Lieferländer.
`api/stock.ts` fällt ohne Redis sauber auf „unbegrenzt" zurück. Der Umschalter
in `products.tsx` ist ebenfalls schon gebaut: sobald eine `stripePriceId`
existiert, wird automatisch „In den Warenkorb" mit „oder bei eBay →" als
Sekundärlink gerendert. **Es fehlen nur Daten und Umgebungsvariablen, kein Code.**

### 6.2 Versandkosten — so wird es gebaut

Luca hat vorgegeben: **Preise wie bei eBay. Versand 2,90 € bei Wachs, 1,80 € bei
Ketten, jeweils mit Basissendungsverfolgung, bei Einzelbestellungen. Bei
Mehrfachbestellungen ändert sich der Preis.**

Luca hat am 27.07.2026 präzisiert: **Ketten gehen als Großbrief (1,80 €),
Wachs als Maxibrief (2,90 €).** Das sind die Deutsche-Post-Brieftarife 2026.
Ihre Grenzen bestimmen die gesamte Logik:

| Format | max. Gewicht | max. Maße | Preis 2026 |
|---|---|---|---|
| Großbrief | 500 g | 35,3 × 25 × **2 cm** | 1,80 € |
| Maxibrief | 1.000 g | 35,3 × 25 × **5 cm** | 2,90 € |
| darüber | — | Paket | 4,90 € |

**Der entscheidende Punkt, den reines Gewicht nicht abbildet:** Ein 300-g-
Wachsblock wiegt unter 500 g, ist aber **dicker als 2 cm** — er passt physisch
nie in einen Großbrief. Eine Versandlogik, die nur auf Gramm schaut, würde ihm
1,80 € berechnen und Luca bei jeder Bestellung 1,10 € Verlust einbringen.
Ketten dagegen sind flach und passen.

Deshalb braucht **jedes Produkt eine Versandklasse**, und das Gewicht
eskaliert nur nach oben, nie nach unten.

**Wichtige Vereinfachung gegenüber dem bisherigen Code:** `api/create-checkout.ts`
erwartet aktuell zwei im Stripe-Dashboard vorab angelegte Shipping-Rates
(`STRIPE_SHIPPING_FREE`, `STRIPE_SHIPPING_STANDARD` als `shr_…`). Das ist
unnötig. Stripe Checkout akzeptiert `shipping_options[].shipping_rate_data`
**inline** — Betrag, Name und Lieferzeit direkt in der Session, ohne dass im
Dashboard irgendetwas angelegt werden muss.

Damit fallen **zwei Umgebungsvariablen und zwei Dashboard-Objekte weg**, und der
Versandpreis kann pro Warenkorb berechnet werden statt aus zwei festen Stufen zu
wählen. Genau das braucht die Staffelung. Bau es so um.

**Konkret:**

1. In `src/lib/data.ts` pro Produkt ein Feld `weightGrams: number` ergänzen
   (Produktgewicht plus Verpackung — die Zahlen kommen von Luca, siehe 6.3).
2. Eine Tabelle an *einer* Stelle, die Luca ohne Code-Kenntnisse ändern kann:

```ts
// ── Versand ──────────────────────────────────────────────────────────────
// Deutsche-Post-Brieftarife 2026, von Luca bestätigt (27.07.2026).
// Preise ändern? Nur diese beiden Blöcke anfassen, sonst nichts.

export type ShippingClass = 'grossbrief' | 'maxibrief';

export const shipping = {
  grossbrief: { cents: 180, maxGrams:  500, label: 'Großbrief' },
  maxibrief:  { cents: 290, maxGrams: 1000, label: 'Maxibrief' },
  paket:      { cents: 490,                 label: 'Paket'     },
  freeFromCents: 5000,   // ab 50 € versandkostenfrei
};

// Die Klasse eskaliert nur nach oben: erst das dickste Produkt im Warenkorb,
// dann das Gesamtgewicht. Ein Wachsblock ist auch bei 380 g ein Maxibrief,
// weil er die 2-cm-Grenze des Großbriefs reißt.
export function shippingFor(items: { product: Product; quantity: number }[]) {
  const grams = items.reduce((g, i) => g + i.product.weightGrams * i.quantity, 0);
  const needsMaxi = items.some(i => i.product.shippingClass === 'maxibrief');

  if (grams > shipping.maxibrief.maxGrams)                 return shipping.paket;
  if (needsMaxi || grams > shipping.grossbrief.maxGrams)   return shipping.maxibrief;
  return shipping.grossbrief;
}
```

Pro Produkt in `data.ts` also **zwei** neue Felder: `weightGrams` und
`shippingClass`. Ketten bekommen `'grossbrief'`, alle vier Wachsblöcke
`'maxibrief'`.

**Warum das so und nicht nach Kategorie:** Zwei Ketten (~600 g) reißen die
500-g-Grenze und werden dadurch automatisch korrekt zum Maxibrief — obwohl
beide einzeln Großbriefe wären. Ein gemischter Warenkorb ebenso. Die Funktion
bildet ab, was physisch passiert, nicht was im Katalog steht, und stimmt
deshalb auch bei Kombinationen, an die heute niemand denkt.

**Ein Punkt für Luca, kein Code:** Großbrief und Maxibrief enthalten im
Standardtarif **keine Sendungsverfolgung** — Tracking gibt es dort nur per
Einschreiben (+2,65 €). Wenn die Seite „Sendungsverfolgung" verspricht, muss
geklärt sein, worüber die läuft (eBay-Versandlabel und Internetmarke-
Geschäftskundentarife bieten eine Basis-Verfolgung, der Schalterkauf nicht).
**Nicht selbst entscheiden — fragen, und im Zweifel nichts versprechen, was der
gewählte Tarif nicht hergibt.**

3. `api/create-checkout.ts` berechnet das Gesamtgewicht aus den Positionen,
   sucht die passende Stufe und setzt sie inline:

```ts
shipping_options: [{
  shipping_rate_data: {
    type: 'fixed_amount',
    fixed_amount: { amount: cents, currency: 'eur' },
    display_name: label,
    delivery_estimate: {
      minimum: { unit: 'business_day', value: 1 },
      maximum: { unit: 'business_day', value: 3 },
    },
  },
}],
```

4. **Der Versandpreis muss im Warenkorb stehen, bevor der Nutzer zu Stripe
   geht** — nicht erst auf der Stripe-Seite. Das ist in Deutschland
   Pflichtangabe und gleichzeitig einer der stärksten Hebel gegen
   Kaufabbruch: Die Warenkorbabbruchrate liegt 2026 bei 70 %, und
   überraschende Zusatzkosten sind seit Jahren der meistgenannte Grund.
   `CartDrawer.tsx` muss also dieselbe Tabelle benutzen wie der Server.
   Eine gemeinsame Funktion in `data.ts`, von beiden Seiten importiert —
   **die Logik darf nicht zweimal existieren.**

### 6.3 Was du von Luca brauchst — frag danach, rate nicht

**Am 27.07.2026 bereits von Luca entschieden — nicht erneut fragen:**

- Versand über 1.000 g: **4,90 €**
- Versandkostenfrei: **ab 50 €**
- Sortiment: **Wachs *und* Ketten** über den eigenen Checkout, also brauchen
  **12 Produkte** eine `stripePriceId` (4 Wachs + 8 Ketten)

**Was noch offen ist** — halte die Liste kurz, er soll das in fünf Minuten
beantworten können:

1. **Die `stripePriceId` (`price_…`) für alle 12 Produkte.** Erfinde keine,
   setze keine Platzhalter, die wie echte IDs aussehen. Wenn nur ein Teil
   kommt: die übrigen bleiben ohne ID und fallen automatisch auf eBay zurück —
   der Code kann das bereits, das ist kein Sonderfall.
2. **Gewicht pro Produkt inkl. Verpackung**, grob gerundet reicht.
   Falls er keine Zahlen zur Hand hat: gemeinsam schätzen (Wachsblock 500 g →
   ~600 g mit Karton, 300 g → ~380 g, Kette → ~300 g) und **die Schätzung als
   Schätzung im Code kommentieren**, damit später klar ist, dass sie nicht
   gemessen war.
3. **Bestätigung, dass die Env-Variablen in Vercel gesetzt sind:**
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
   optional `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, `SITE_URL`.
   (`STRIPE_SHIPPING_FREE` und `STRIPE_SHIPPING_STANDARD` entfallen nach 6.2 —
   die dürfen in Vercel gelöscht werden, sobald der Umbau steht.)

**Bestandsführung nicht übersehen:** Mit 12 verkäuflichen Produkten wird
`api/stock.ts` relevant. Ohne Upstash-Konfiguration liefert es „unbegrenzt" für
alles — dann kann jemand etwas bestellen, das nicht mehr da ist. Kläre mit Luca,
ob Upstash eingerichtet ist oder ob er den Bestand vorerst manuell im Blick
behält. Kein Blocker, aber es gehört benannt statt stillschweigend angenommen.

Was du **ohne** Rückfrage vorbereiten kannst — mach das zuerst, dann wartet
nichts auf die Antworten: den Umbau auf `shipping_rate_data`, die vollständige
Versandtabelle (alle drei Stufen sind bestätigt), das Feld `weightGrams`, den
Widerrufs-Button aus 6.4, die Versandanzeige im
`CartDrawer`, `.env.example`, und eine Build-Prüfung, die warnt, wenn ein
Produkt eine `stripePriceId` hat (weil dann der angezeigte Preis aus `data.ts`
und der berechnete aus Stripe kommen — **eine Abweichung wäre ein
Rechtsfehler, kein Schönheitsfehler**).

### 6.4 Recht — was du offenlegen musst, bevor irgendetwas live geht

Ich bin kein Anwalt und Sonnet ist es auch nicht. Aber diese Punkte sind
recherchiert und konkret genug, dass Luca sie kennen muss, **bevor** der eigene
Checkout scharf geschaltet wird. Bei eBay hat eBay das alles übernommen — auf
der eigenen Seite nicht mehr.

- **Widerrufsbutton nach § 356a BGB — seit 19. Juni 2026 Pflicht.** Gilt für
  alle B2C-Fernabsatzverträge mit gesetzlichem Widerrufsrecht, also für genau
  diesen Fall. Das Datum ist bereits vergangen; die Pflicht greift ab dem
  ersten Verkauf über die eigene Seite. Bei Verstoß drohen Bußgelder bis
  **50.000 €** und Abmahnungen durch Mitbewerber.

  Nicht zu verwechseln mit dem Kündigungsbutton (§ 312k BGB, seit 2022) — der
  gilt nur für Dauerschuldverhältnisse und ist hier irrelevant.

  **Das ist die einzige rechtliche Neuerung in diesem Plan, die eigenen Code
  braucht.** Konkret drei Bausteine:

  1. **Schaltfläche „Vertrag widerrufen"** (oder gleichwertig), gut lesbar und
     ohne Umwege erreichbar — Footer-Link plus eigene Route, z. B. `/widerruf`.
  2. **Eingabemaske.** Abgefragt werden darf *nur*: Identifikation des Vertrags
     (Bestellnummer, Datum, Produkt) und ein elektronisches Kontaktmittel für
     die Eingangsbestätigung. **Der Widerrufsgrund darf ausdrücklich nicht
     abgefragt werden** — kein „Warum möchten Sie widerrufen?"-Feld, auch nicht
     optional.
  3. **Bestätigungsfunktion** mit der Beschriftung „Widerruf bestätigen"
     (oder gleichwertig), danach eine Eingangsbestätigung an den Verbraucher.

  Technisch passt das zum vorhandenen Setup: Formular → Serverless-Funktion →
  E-Mail über `RESEND_API_KEY` (den nutzt `api/stripe-webhook.ts` bereits) an
  Luca **und** als Eingangsbestätigung an den Kunden. Kein neuer Dienst nötig.

  **Die Widerrufsbelehrung muss den Button erwähnen** — das amtliche
  Muster stammt von 2014 und deckt § 356a noch nicht ab. Siehe
  `RECHTSTEXTE_ENTWURF.md`.
- **Widerrufsbelehrung + Muster-Widerrufsformular**, 14 Tage.
- **Versandkosten und Lieferzeit vor Bestellabschluss** (deckt 6.2 ab).
- **Button-Beschriftung „Zahlungspflichtig bestellen"** — Stripe Checkout ist
  hier in der Regel konform, aber der letzte Button *auf der eigenen Seite*
  vor der Weiterleitung darf nicht „Weiter" heißen.
- **§19 UStG:** Kleinunternehmer, keine Umsatzsteuer ausweisen. Der Hinweis
  steht bereits im Rechnungsfuß in `api/create-checkout.ts`. **Prüfe zusätzlich,
  dass in den Stripe-Einstellungen keine automatische Steuerberechnung
  (Stripe Tax) aktiv ist** — sonst weist Stripe USt aus, die Luca nicht
  ausweisen darf.
- `AGBPage.tsx`, `DatenschutzPage.tsx`, `ImpressumPage.tsx` existieren.
  **Ob ihr Inhalt Fernabsatz abdeckt, kann Sonnet nicht beurteilen.**
  Empfehlung an Luca: AGB und Widerrufsbelehrung über einen Rechtstext-Dienst
  erstellen lassen (IT-Recht Kanzlei, Händlerbund, e-recht24 — alle mit
  Abmahnschutz für kleine Shops). Sonnet baut die Texte ein, schreibt sie nicht.
- **„eBay-Käuferschutz" als Vertrauenssignal** steht in der Hero-Statleiste und
  bei den Bewertungen. Beim eigenen Checkout trägt das nicht mehr. Ersatz:
  Käuferschutz über Klarna/SEPA, 14 Tage Widerrufsrecht, Versand aus Stuttgart,
  persönliche Antwort. Textentscheidung — Luca formuliert, Sonnet setzt um.

**Reihenfolge:** Erst alles bauen und im Stripe-Testmodus durchspielen. Dann
Luca den Rechts-Punkt vorlegen. Erst danach Live-Keys. **Nicht live schalten,
solange 6.4 nicht abgehakt ist** — auch nicht „kurz zum Testen".

### 6.5 Falls die IDs in dieser Session nicht kommen

Dann ist Stripe nicht aktivierbar — und dann ist der leere Warenkorb weiterhin
das größte Vertrauensproblem der Seite. In dem Fall: `CartIcon`,
`CartDrawer` und `CartPersistenceHint` hinter eine abgeleitete Konstante legen,
die automatisch anspringt, sobald das erste Produkt eine `stripePriceId` hat:

```ts
export const checkoutEnabled = products.some(canCheckout);
```

Nichts löschen. Vollständig reversibel. **Und melde deutlich, dass Phase 6 offen
geblieben ist** — nicht als erledigt verbuchen.

---

## Phase 7 — Kaufpsychologie, Reibung, KI-Sichtbarkeit

Diese Phase ist recherchebasiert. Sie sagt nicht „mach es schöner", sondern
benennt die Stellen, an denen dieser Seite konkret etwas fehlt, das
vergleichbare Seiten haben.

### 7.1 Was schon da ist — nicht neu bauen

Damit du keine Arbeit doppelst: `public/robots.txt` erlaubt explizit **alle**
großen KI-Crawler (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, CCBot,
Google-Extended, Applebot-Extended …). Es gibt `llms.txt` (69 Zeilen) und
`llms-full.txt` (1.002 Zeilen), `sitemap.xml`, einen
`google-merchant-feed.xml`, und JSON-LD auf Startseite, Produktseiten,
Wissenschaftsseite und Blog — inklusive `FAQPage`, `HowTo`, `Organization`,
`WebSite`+`SearchAction`, `AggregateOffer`, `ItemList`.

Das ist deutlich mehr als die meisten Shops dieser Größe haben. Der Kommentar in
`ProductDetailPage.tsx` Zeile 229–235, warum es bewusst **kein** per-Produkt
`aggregateRating` gibt (die 200+ eBay-Bewertungen sind Verkäuferfeedback, kein
SKU-Feedback — als Produktbewertung ausgezeichnet wäre das erfundenes
Review-Markup), ist fachlich richtig. **Nicht „reparieren".**

### 7.2 Schema — die echten Lücken

Drei Felder fehlen, und alle drei werden mit dem eigenen Checkout erst richtig
relevant:

- **`shippingDetails` (`OfferShippingDetails`)** — Versandkosten und Lieferzeit
  maschinenlesbar. Google zeigt das in Shopping- und Rich-Results an; ohne
  Angabe wird oft konservativ geschätzt. Speist sich direkt aus der Tabelle
  aus 6.2, also kein doppelter Pflegeaufwand.
- **`hasMerchantReturnPolicy` (`MerchantReturnPolicy`)** — 14 Tage
  Widerrufsrecht, Rücksendekosten, Land. Fällt mit 6.4 sowieso an.
- **`priceValidUntil: '2026-12-31'`** (Zeile 239) ist ein hartcodiertes Datum,
  das ab Januar still veraltet. Auf „heute + 12 Monate" berechnen.

Bei den vorgewachsten Ketten zusätzlich **`gtin`/`mpn`**, wo bekannt — Shimano-
und SRAM-Teile haben echte GTINs, und die verbessern die Zuordnung deutlich.

### 7.3 KI-Crawler lesen kein JavaScript

Der wichtigste technische Punkt aus der Recherche: **GPTBot, OAI-SearchBot,
ClaudeBot und PerplexityBot holen das rohe HTML und führen kein JavaScript
aus.** Diese Seite ist eine React-SPA. Was nicht im ausgelieferten HTML steht,
existiert für diese Crawler nicht.

`npm run build` erzeugt über `scripts/generate-blog-html.mjs` bereits
vorgerendertes HTML für die Blogartikel — der Mechanismus ist also vorhanden und
verstanden. **Prüf nach dem Build, was in `dist/` für `/` und für
`/produkt/wax-500` tatsächlich im HTML steht.** Wenn dort nur `<div id="root">`
plus JSON-LD steht, sehen KI-Crawler den Fließtext der Produktseiten nicht — und
`llms-full.txt` ist dann der einzige Kanal, über den sie den Inhalt bekommen.

Das ist kein Grund zur Panik (deshalb existiert `llms-full.txt`), aber es
gehört gemessen und im Bericht erwähnt. **Bau kein SSR ein** — das wäre ein
eigenes Projekt und steht nicht im Scope.

### 7.4 Reibung im Kaufweg

Recherchestand 2026: Warenkorbabbruch liegt bei rund 70 %. Der Käufer hat sich
dabei fast nie gegen das Produkt entschieden — es sind Vertrauen und Reibung.

Was dieser Seite konkret fehlt:

- **Rückgaberecht ist nirgends sichtbar.** Eine sichtbare Rückgabe-Zusage senkt
  die gefühlten Kosten einer Fehlentscheidung. Gehört auf die Produktkarte, die
  Produktseite und in den Warenkorb — nicht nur in die AGB.
- **Versandkosten erst im Checkout** (löst 6.2).
- **Keine Bewertungszahl als Zahl.** Die Karten zeigen fünf Sterne und
  „41 Bewertungen", aber keinen Durchschnitt („4,9"). Bewertungen sind laut
  Recherche der stärkste Einzelfaktor für Vertrauen — die Zahl gehört
  dazugeschrieben.
- **Entscheidungslähmung Classic vs. Pro.** Vier Wachsvarianten, und die
  Unterscheidung steht hinter „Vergleich ansehen". Ein Satz pro Karte, der die
  Wahl abnimmt („Für Frühling bis Herbst" / „Für Nässe und Winter"), ist
  wirksamer als ein Vergleichslink. Die Texte existieren bereits in
  `llms.txt` — dort stehen sie besser formuliert als auf der Seite selbst.
- **Preisanker.** Die Seite rechnet an mehreren Stellen vor, dass Wachs über
  12.000 km ~70 € spart. Dieser Vergleich steht in `#warum-wachs`, aber **nicht
  neben dem Preis**, wo die Entscheidung fällt. Ein Anker („29,95 € · Öl im
  gleichen Zeitraum ~151 €") direkt an der Preiszeile nutzt die vorhandene,
  belegte Zahl an der Stelle, wo sie wirkt. **Keine neuen Zahlen erfinden** —
  nur die vorhandenen umplatzieren.

### 7.5 Designphilosophie — was hier *nicht* zu tun ist

Aus der Recherche zu prämierten Seiten 2026: Sie haben **einen** einprägsamen
Moment, nicht zwanzig Effekte, und der läuft auch auf Mittelklasse-Geräten
flüssig.

Diese Seite hat ihren Moment bereits — den Wachsblock im Hero mit der
Lupenfunktion. **Füg keinen zweiten hinzu.** Alles, was dieser Plan sonst
vorschlägt, geht in die andere Richtung: ein Raster statt fünf, Inhalte
sichtbar statt in Karussells, Bewegung raus, wo sie das Lesen stört. Ruhe ist
hier das Upgrade, nicht mehr Bewegung.

Wenn du bei einer Entscheidung unsicher bist, ist die Frage nicht „wie wird das
beeindruckender", sondern „wie wird das ruhiger und eindeutiger".

---

## Phase 8 — Verifikation und Übergabe

Erst wenn Phase 1–5 stehen.

### 8.1 Technisch

```bash
npx tsc --noEmit
npm run build
```

Beides muss sauber sein. Der Pre-Commit-Hook prüft `tsc` ohnehin.

### 8.2 Visuell — an diesen Breiten prüfen

390 (iPhone), 768 (Tablet), 1280, 1440. Jeweils hell **und** dunkel.

Checkliste:
- [ ] Linke Textkante aller Section-Köpfe identisch (Skript aus 1.4)
- [ ] Kein horizontales Scrollen: `document.documentElement.scrollWidth === window.innerWidth`
- [ ] Logo in beiden Themes sichtbar (Nav, Footer, Mobile-Menü)
- [ ] Alle drei Rechner auf Desktop gleichzeitig sichtbar
- [ ] Bewertungszitate vollständig lesbar
- [ ] Produktseite hat Navigation, Footer, genau **ein** `<h1>`
- [ ] Mobile-Sticky-CTA über die ganze Seite außer Hero und `#produkte`
- [ ] `/voellig-falsche-url` zeigt eine 404-Seite, nicht die Startseite
- [ ] Tastaturbedienung: mit `Tab` durch die Seite, Fokus immer sichtbar,
      keine Falle im Mobile-Menü oder Cart-Drawer

### 8.3 Dokumentation nachziehen

`CLAUDE.md` korrigieren (siehe 0.1): Backend/E-Commerce existiert, Regel 4 ist
gegenstandslos, neuer `Section`-Wrapper als verbindliches Raster aufnehmen.

### 8.4 Commits

Pro Phase ein Commit, nicht alles in einen. Deutsche oder englische Messages
konsistent zum bisherigen Log (bisher englisch, imperativ). Gedankenstrich-Regel
aus den Editorial-Regeln beachten. Nur committen, wenn Luca es sagt.

### 8.5 Bericht für die Opus-5-Abnahme

Am Ende in den Chat, kurz und ehrlich:
- Was ist fertig und verifiziert
- Was ist angefangen und warum nicht fertig
- Was hast du **nicht** gemacht und warum
- Was hast du gefunden, das in diesem Plan nicht steht
- Wo bist du von diesem Plan abgewichen und warum

**Nichts als erledigt melden, was du nicht im Browser oder im Build gesehen
hast.** Die Abnahme prüft genau das nach.

---

## Anhang — Was ich geprüft und als „kein Bug" verworfen habe

Damit du diese Wege nicht noch einmal gehst:

- **Hero-Headline erscheint nicht / Seite ist grau** → gedrosseltes rAF im
  versteckten Browser-Pane. Im DOM steht alles korrekt bei `opacity: 1`.
- **Scrollen bewegt die Seite nicht** → `scroll-behavior: smooth` plus
  gedrosseltes rAF. Auf echten Geräten kein Problem.
- **Screenshots mit weißen Flächen oder verschobener Navigation** →
  Compositor-Versatz im versteckten Pane.
- **Dritte Bewertungskarte ist angeschnitten** → eingefrorener Marquee, kein
  Layoutfehler.
- **`prefers-reduced-motion`** → sauber und vollständig umgesetzt, inklusive
  `scroll-behavior: auto` im universellen Kill-Switch. Nicht anfassen.
- **`/api/stock` wird zweimal geladen** → React StrictMode im Dev-Modus. In
  Produktion einmal.
- **Produkt mit unbekannter ID** → `ProductDetailPage` Zeile 156 hat bereits
  einen sauberen „Produkt nicht gefunden"-Zustand.

---

## Anhang — Recherche-Grundlage

- Baymard Institute: Sticky-Add-to-Cart +5–12 % Conversion auf Mobile;
  Lieferdatum auf der Produktseite als hochwirksam bei geringem Aufwand; nur
  38 % der Shops haben eine „gute" Produktseiten-UX auf Mobile.
  <https://baymard.com/blog/current-state-ecommerce-product-page-ux>
- NN/g zu Karussells: Nutzer sehen meist nur den ersten Frame; rotierender
  Inhalt nimmt Kontrolle; Akkordeons und Karussells sollen nur auf Anforderung
  wechseln. <https://www.nngroup.com/articles/auto-forwarding/> und
  <https://www.nngroup.com/articles/designing-effective-carousels/>
- Core Web Vitals 2026: LCP < 2,5 s, INP < 200 ms, CLS < 0,1 im 75. Perzentil.
  Shops, die alle drei erreichen, sehen 15–30 % bessere Conversion. Der Hero
  dieser Seite lädt ein großes Foto — LCP nach dem Umbau einmal messen.
- Award-Prämierte Seiten 2026: nicht zwanzig Effekte, sondern **ein**
  einprägsamer Moment, der auf Mittelklasse-Geräten flüssig läuft. Diese Seite
  hat ihren Moment bereits (Hero-Wachsblock mit Lupe). Der Rest der Seite darf
  ruhig sein — Ruhe ist hier das Upgrade, nicht mehr Bewegung.

---

## Reihenfolge in einem Blick

| # | Phase | Wirkung | Risiko |
|---|---|---|---|
| 1 | Ein Raster für alle Sections | sehr hoch | mittel |
| 2 | Tools + Reviews + Anleitungen entkarussellieren | hoch | mittel |
| 3 | Produktseite: Nav, Footer, ein h1, Breadcrumb | hoch | niedrig |
| 4 | Sticky-CTA, Abschluss-CTA, IDs, 404, Querlinks | hoch | niedrig |
| 5 | Logo im Dark Mode, Kontakt-Buttons, Bildschnitte | mittel | sehr niedrig |
| 6 | Stripe scharf schalten | sehr hoch | **hoch — Recht + Luca** |
| 7 | Kaufpsychologie, Schema-Lücken, KI-Sichtbarkeit | mittel–hoch | niedrig |
| 8 | Verifikation und Doku | — | — |

**Empfohlene Reihenfolge:** 1 → 3 → 4 → 5 → 2 → 6 → 7 → 8.

Begründung: Phase 1 zuerst, weil alle späteren Layout-Arbeiten auf dem
einheitlichen Raster aufsetzen — wer 2 vor 1 macht, baut die Tools zweimal.
Phase 6 kommt spät, weil sie als einzige auf Antworten von Luca und auf
Rechtstexte wartet; alles Vorbereitbare daraus (6.2) kann aber jederzeit
parallel laufen, sobald Phase 1 steht.

**Phase 1 halb gemacht ist schlimmer als gar nicht gemacht** — entweder ganz
oder gar nicht. Alle anderen Phasen sind einzeln abschließbar.
