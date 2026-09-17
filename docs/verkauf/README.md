# Partner-Infoblatt

`partner-infoblatt.html` ist das A4-Blatt für Fachhandels-Besuche: vier Seiten,
gedacht zum Durchgehen im Laden, zum Dalassen und zum Weiterleiten per Mail.

Es liegt bewusst in `docs/` und nicht in `public/`, damit es nicht auf
waxcelerate.de landet und nicht indexiert wird. Bilder und Schriften lädt es
relativ aus `../../public/`, deshalb funktioniert es nur an dieser Stelle im
Repo. Beim Verschieben brechen alle Pfade.

## Drucken

1. Datei im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Strg/Cmd+P.
3. Papierformat **A4**, Ränder **keine**, **Hintergrundgrafiken einschalten**.
   Ohne den letzten Haken druckt Chrome die dunklen Flächen weiß.
4. **Als PDF sichern**.

Ergebnis sind genau vier A4-Seiten. Für den gedruckten Leave-Behind: 250 g matt.

## Variante und Shopname

Ganz unten in der Datei steht ein `CONFIG`-Block. Nur den anfassen:

```js
const CONFIG = {
  variant: 'aufwand',   // 'aufwand' oder 'beweis'
  shopName: '',         // leer = neutrale Fassung
  city: 'Leipzig',
  localRewax: false,
};
```

**`variant`** entscheidet über Seite 1 und 2:

| Wert | Für welchen Laden | Aufhänger |
|---|---|---|
| `aufwand` | wachst bereits selbst | „Sie wachsen schon. Ab jetzt ohne Bankzeit." |
| `beweis` | wachst nicht | „Ihre Kunden wachsen schon. Bezahlt werden andere." |

**`shopName`** setzt die Zeile „Für [Shop]" auf Seite 1. Für das Blatt zum
Mitnehmen leer lassen, für die Mail nach dem Besuch ausfüllen. Das ist der
billigste Personalisierungshebel, den es gibt.

**`city`** steht in der Exklusivitätszeile („Wir suchen zwei bis drei Partner
in …"). Im B2B ist dieses Argument erlaubt, im B2C nicht.

**`localRewax`** blendet auf Seite 2 „Gewachst wird in Stuttgart und Leipzig"
ein. Steht auf `false`, bis Luca das für die jeweilige Region wirklich zusagen
kann.

## Was wo herkommt

- Preise, Ketten und Intervalle: `src/lib/data.ts`. Nichts hier hart eintippen,
  ohne dort nachzusehen. Ein Abgleich läuft über den Befehl unten.
- Farben, Schriften und Strichstärken: die `.noir`-Tokens aus `src/index.css`.
  Kraft-Gold `#B9A67E` trägt ausschließlich Geldzahlen.
- Kassettenlupe, Verschleißlineal, Blockbalken und Stempelkarte sind statische
  Nachbauten von `src/sections/science/CassetteLens.tsx`,
  `src/components/tools/sketches.tsx` und `src/components/GiftCardObject.tsx`.
- `logo.svg` ist aus `src/components/WaxcelerateMark.tsx` erzeugt. Es gibt
  sonst keine SVG-Fassung des Logos im Repo.
- `qr-whatsapp.svg` zeigt auf `wa.me/4915751957470` mit vorgeschriebenem Text.

## Die Schriften in `fonts/`

Fraunces und Libre Franklin liegen auf der Website als **variable** Fonts.
Chrome kann variable Fonts beim Drucken nicht in die PDF einbetten und fällt
still auf Liberation Serif und DejaVu Sans zurück. Am Bildschirm sieht man
davon nichts, in der PDF, die du verschickst, sofort. Deshalb liegen in
`fonts/` feste Schnitte, erzeugt aus genau denselben Dateien:

```bash
pip install fonttools brotli
python3 - <<'EOF'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
def bake(src, out, axes, family, subfamily):
    f = TTFont(src)
    instancer.instantiateVariableFont(f, axes, inplace=True, updateFontNames=False)
    full = f"{family} {subfamily}"
    for nid, val in ((1,family),(2,subfamily),(4,full),(6,full.replace(' ','')),(16,family),(17,subfamily)):
        f['name'].setName(val, nid, 3, 1, 0x409)
    f.flavor = 'woff2'; f.save(out)
bake('public/fonts/6NUI8FyLNQOQZAnv9bYEvBjUVG5Ga92uVSQO8UikR_BPug.woff2',
     'docs/verkauf/fonts/fraunces-700.woff2', {'opsz':88,'SOFT':36,'WONK':1},
     'Fraunces Print', 'Bold')
for w, sub in ((400,'Regular'),(500,'Medium'),(600,'SemiBold'),(700,'Bold')):
    bake('public/fonts/jizDREVItHgc8qDIbSTKq4XkRiUf2zcZiVbJ.woff2',
         f'docs/verkauf/fonts/libre-franklin-{w}.woff2', {'wght':w},
         'Libre Franklin Print', sub)
EOF
```

Die Fraunces-Achsenwerte (`opsz 88, SOFT 36, WONK 1`) sind dieselben, die
`src/index.css` auf Überschriften setzt. IBM Plex Mono ist schon statisch und
kommt weiter direkt aus `public/fonts/`.

Die Latin-Subsets kennen fünf Zeichen nicht, die sonst auf DejaVu zurückfallen
würden: `₂ → ≈ ● ★`. Sie sind im Blatt durch echtes `<sub>`, Inline-SVG und
gezeichnete Punkte ersetzt. Wer neuen Text einfügt, sollte keines davon
eintippen.

**Gegenprüfen, dass die PDF sauber ist:**

```bash
python3 -c "
import re
d = open('Waxcelerate-Partner-Infoblatt.pdf','rb').read()
f = sorted({x.decode().split('+')[-1] for x in re.findall(rb'/BaseFont\s*/([A-Za-z0-9+\-]+)', d)})
print(f)
print('Ersatzschriften:', [x for x in f if 'DejaVu' in x or 'Liberation' in x] or 'keine')
"
```

## Nach einer Preisänderung gegenprüfen

```bash
npx tsx -e "
import { products, isSoldOut } from './src/lib/data.ts';
import { readFileSync } from 'node:fs';
const html = readFileSync('docs/verkauf/partner-infoblatt.html','utf8');
const fmt = n => n.toFixed(2).replace('.',',')+' €';
for (const p of products.filter(p => p.category==='chain' || p.category==='wax'))
  if (!isSoldOut(p) && !html.includes(fmt(p.price)))
    console.log('FEHLT:', p.chainModel ?? p.title, fmt(p.price));
"
```

## Regeln, die auf diesem Blatt gelten

Aus `21_b2b_masterplan.md` und `30_claims_language.md`:

- Keine Gedankenstriche als Satzzeichen. Bindestriche in Zahlenbereichen
  (400–550 km) sind etwas anderes und erlaubt.
- Keine Staffelpreise und keine Mengenrabatte. Die stehen nur im
  Konditionenblatt.
- Keine exakten Rewax-Preise. Aufs Infoblatt gehört „unter 10 € je Kette".
- Keine Preisbindung. Jede Zahl ist eine unverbindliche Empfehlung, und das
  steht auch so drauf.
- Kein „Made in Germany" für Shimano-, SRAM- oder YBN-Ketten. Nur
  „Handgewachst in Stuttgart".
- „Über 500 verkaufte Einheiten, 100 % positives Feedback", nie „eBay".
- Rewax-Intervall 400–550 km, nie 600.
