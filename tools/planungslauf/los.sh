#!/usr/bin/env bash
# Baut das Codex-Planungspaket neu und legt es auf den Branch codex/planungskontext.
#
#   bash los.sh            # bauen, committen, pushen
#   bash los.sh --lokal    # nur bauen, nichts committen
#
# Braucht man nur, wenn sich der Hub bewegt hat und das Paket veraltet ist.
# Fuer den Lauf selbst siehe START.md -- da ist alles schon fertig.

set -u
HIER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REF="origin/feat/porto-labels"
BRANCH="codex/planungskontext"
NUR_LOKAL="${1:-}"

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
info "== 1/5  Repos suchen =="
HUBP="$(hub_finden)"
[ -n "${HUBP:-}" ] && [ -f "$HUBP/server.py" ] || {
  rot "Hub nicht gefunden. Start mit:  HUB=/pfad/zu/waxcelerate-sync bash los.sh"; exit 1; }
gruen "   Hub:        $HUBP"
MPP="$(mp_finden)"
[ -n "${MPP:-}" ] || {
  rot "   Masterplan NICHT GEFUNDEN."
  echo "   Darin steckt die Geschaeftsdiagnose, an der Codex jedes Feature misst."
  echo "   MASTERPLAN=/pfad bash los.sh   -- oder klonen:"
  echo "     git clone https://github.com/LDCTeichmann/waxcelerate-masterplan \\"
  echo "       \"$(dirname "$HUBP")/waxcelerate-masterplan\""; exit 1; }
gruen "   Masterplan: $MPP"

info "== 2/5  Branch holen =="
git -C "$HUBP" fetch origin \
  "+refs/heads/feat/porto-labels:refs/remotes/origin/feat/porto-labels" 2>&1 | tail -1
git -C "$HUBP" rev-parse --verify "$REF" >/dev/null 2>&1 || {
  rot "   $REF fehlt. git -C '$HUBP' fetch --depth=200 origin feat/porto-labels"; exit 1; }
gruen "   $REF = $(git -C "$HUBP" rev-parse --short "$REF")"

info "== 3/5  Pruefen =="
python3 "$HIER/build_kontext.py" --check --hub "$HUBP" --masterplan "$MPP" --ref "$REF" \
  || { rot "   Pruefung nicht sauber. Nicht weitermachen."; exit 1; }

info "== 4/5  Paket bauen =="
# --nur-doku: der Quelltext bleibt draussen, Codex liest ihn im Repo selbst nach.
# --pfad-basis: Lesekarte mit repo-relativen Pfaden, damit sie in der Codex-Cloud stimmt.
python3 "$HIER/build_kontext.py" --hub "$HUBP" --masterplan "$MPP" --ref "$REF" \
        --nur-doku --out "$HUBP/.codex-plan/kontext" --pfad-basis "$HUBP" || exit 1
cp "$HIER/auftrag.md"      "$HUBP/.codex-plan/AUFTRAG.md"
cp "$HIER/paket_README.md" "$HUBP/.codex-plan/README.md"

if [ "$NUR_LOKAL" = "--lokal" ]; then
  echo; gruen "Fertig (nur lokal): $HUBP/.codex-plan/"; exit 0
fi

info "== 5/5  Branch $BRANCH schreiben =="
VORHER="$(git -C "$HUBP" rev-parse --abbrev-ref HEAD)"
git -C "$HUBP" checkout -q -B "$BRANCH" "$REF" || exit 1
git -C "$HUBP" add .codex-plan || exit 1
# Nur .codex-plan darf im Commit landen -- im Hub arbeiten mehrere Sitzungen parallel.
FREMD="$(git -C "$HUBP" diff --cached --name-only | grep -cv '^\.codex-plan/' || true)"
[ "$FREMD" = "0" ] || { rot "   $FREMD fremde Datei(en) im Index. Abbruch."; exit 1; }
git -C "$HUBP" commit -q -m "Planungslauf: Lesestoff fuer eine Codex-Sitzung (.codex-plan/)" \
  || echo "   (nichts zu committen -- Paket unveraendert)"
git -C "$HUBP" push -u origin "$BRANCH" 2>&1 | tail -2
git -C "$HUBP" checkout -q "$VORHER" 2>/dev/null || true

echo
gruen "============================================================"
gruen " Fertig. In der ChatGPT-App:"
gruen "============================================================"
echo
echo "   Codex -> neue Aufgabe -> Repo waxcelerate-sync"
echo "   Branch: $BRANCH        (NICHT main)"
echo "   Modell: GPT-6 Astra, Reasoning hoechste Stufe (xhigh)"
echo
echo "   Nachricht:"
echo "     Lies .codex-plan/AUFTRAG.md vollstaendig und fuehre ihn aus."
echo
echo "   Ergebnis: CODEX_PLAN.md, fortlaufend geschrieben."
echo "   Details und Fortsetzung nach Fensterende: START.md"
echo
