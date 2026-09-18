#!/usr/bin/env bash
# Ein Befehl, der alles fuer den Fable-Lauf vorbereitet.
#
#   bash los.sh
#
# Findet die Repos selbst, holt den richtigen Branch, baut den Lesestoff und
# sagt dir am Ende genau, was du als Naechstes tippst. Kostet nichts, aendert
# nichts an deinem Arbeitsbaum (kein checkout, kein Wechsel des Branches).

set -u
HIER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REF="origin/feat/porto-labels"

rot()  { printf '\033[31m%s\033[0m\n' "$*"; }
gruen(){ printf '\033[32m%s\033[0m\n' "$*"; }
info() { printf '\033[36m%s\033[0m\n' "$*"; }

hub_finden() {
  [ -n "${HUB:-}" ] && { echo "$HUB"; return; }
  for k in "$PWD" "$HIER/../.." \
           "$HOME/Developer Luca/waxcelerate/waxcelerate-sync" \
           "$HOME/waxcelerate-sync" "$HIER/../../../waxcelerate-sync"; do
    [ -f "$k/server.py" ] && [ -d "$k/.git" ] && { (cd "$k" && pwd); return; }
  done
  find "$HOME" -maxdepth 5 -type d -name waxcelerate-sync -print -quit 2>/dev/null
}

mp_finden() {
  [ -n "${MASTERPLAN:-}" ] && { echo "$MASTERPLAN"; return; }
  find "$HOME" -maxdepth 5 -type d -name waxcelerate-masterplan -print -quit 2>/dev/null
}

echo
info "== 1/4  Repos suchen =="
HUBP="$(hub_finden)"
if [ -z "${HUBP:-}" ] || [ ! -f "$HUBP/server.py" ]; then
  rot "Hub (waxcelerate-sync) nicht gefunden."
  echo "     Starte neu mit:  HUB=/pfad/zu/waxcelerate-sync bash los.sh"
  exit 1
fi
gruen "   Hub:        $HUBP"

MPP="$(mp_finden)"
if [ -z "${MPP:-}" ]; then
  rot "   Masterplan: NICHT GEFUNDEN"
  echo
  echo "   Darin steckt die Geschaeftsdiagnose, an der Fable jedes Feature misst."
  echo "   Entweder holen:"
  echo "     git clone https://github.com/LDCTeichmann/waxcelerate-masterplan \\"
  echo "       \"$(dirname "$HUBP")/waxcelerate-masterplan\""
  echo "   oder Pfad angeben:  MASTERPLAN=/pfad bash los.sh"
  exit 1
fi
gruen "   Masterplan: $MPP"

info "== 2/4  Branch holen (ohne checkout, dein Arbeitsbaum bleibt unberuehrt) =="
# Expliziter Refspec: legt origin/feat/porto-labels auch in einem flachen oder
# single-branch-Klon an, wo ein blosses "git fetch origin <branch>" nur FETCH_HEAD setzt.
if ! git -C "$HUBP" fetch origin \
       "+refs/heads/feat/porto-labels:refs/remotes/origin/feat/porto-labels" 2>&1 | tail -2; then
  rot "   git fetch fehlgeschlagen. Internet? Zugriff auf das Repo?"
  exit 1
fi
if ! git -C "$HUBP" rev-parse --verify "$REF" >/dev/null 2>&1; then
  rot "   Ref $REF nicht da. Versuche: git -C '$HUBP' fetch --depth=200 origin feat/porto-labels"
  exit 1
fi
gruen "   $REF = $(git -C "$HUBP" rev-parse --short "$REF")  ($(git -C "$HUBP" log -1 --format=%ci "$REF"))"

info "== 3/4  Pruefen =="
python3 "$HIER/build_kontext.py" --check --hub "$HUBP" --masterplan "$MPP" --ref "$REF" || {
  rot "   Pruefung nicht sauber (siehe oben). Nicht weitermachen."; exit 1; }

info "== 4/4  Lesestoff bauen =="
# In den Hub-Ordner, weil Fable dort laeuft. Dot-Ordner, damit er nicht stoert.
ZIEL="$HUBP/.fable"
python3 "$HIER/build_kontext.py" --hub "$HUBP" --masterplan "$MPP" --ref "$REF" \
        --out "$ZIEL/kontext" || exit 1

# Lokal ignorieren, ohne die getrackte .gitignore anzufassen.
# --absolute-git-dir, weil --git-dir einen relativen Pfad liefert, der gegen
# das aktuelle Arbeitsverzeichnis aufgeloest wuerde -- also das falsche Repo.
EXCL="$(git -C "$HUBP" rev-parse --absolute-git-dir)/info/exclude"
mkdir -p "$(dirname "$EXCL")"
grep -qxF '.fable/' "$EXCL" 2>/dev/null || echo '.fable/' >> "$EXCL"

# Auftrag mit dem echten Pfad fertigstellen.
python3 - "$HIER/auftrag.md" "$ZIEL/kontext/00_LESEKARTE.md" "$ZIEL/AUFTRAG.md" <<'PY'
import pathlib, sys
quelle, karte, ziel = (pathlib.Path(a) for a in sys.argv[1:4])
text = quelle.read_text(encoding="utf-8").replace("{{LESEKARTE}}", str(karte.resolve()))
assert "{{LESEKARTE}}" not in text
ziel.write_text(text, encoding="utf-8")
print(f"   Auftrag fertig: {ziel}")
PY

echo
gruen "============================================================"
gruen " Fertig. Jetzt diese zwei Schritte:"
gruen "============================================================"
echo
echo " 1) Vorher auf claude.ai -> Einstellungen -> Nutzung:"
echo "      - Usage credits EIN   (hast du erledigt)"
echo "      - Monthly spend limit ueber 'Manage' auf mindestens 40 EUR"
echo "        (steht auf 22 EUR, davon 18,53 EUR verbraucht -> sonst"
echo "         bricht der Lauf nach einem Drittel ab)"
echo
echo " 2) Im Terminal:"
echo
echo "      cd \"$HUBP\""
echo "      claude --model \"fable[1m]\" --effort xhigh"
echo
echo "    Dann den KOMPLETTEN Inhalt dieser Datei als eine Nachricht einfuegen:"
echo "      $ZIEL/AUFTRAG.md"
echo
echo "    (macOS: pbcopy < \"$ZIEL/AUFTRAG.md\"  legt ihn in die Zwischenablage)"
echo
echo "    Einwilligungsdialog bestaetigen. Fable liest 15 Dateien und schreibt"
echo "    FABLE_PLAN.md. Nach den 15 Lesevorgaengen einmal /cost tippen:"
echo "    erwartet ~6-7 \$. Ueber 8 \$ -> /effort high."
echo
