#!/usr/bin/env bash
#
# Kompletter Audit-Lauf gegen den lokalen Produktions-Build.
# Aendert keine Projektdateien — schreibt ausschliesslich nach
# performance-audit/.
#
#   bash performance-audit/run-audit.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/performance-audit"
PORT=8099
BASE="http://localhost:$PORT"

PAGES=("/" "/produkt/wax-500/" "/kette-wachsen-lassen/" "/wissenschaft/" "/blog/")
name_of() { local n="${1#/}"; n="${n%/}"; echo "${n//\//_}" | sed 's/^$/home/'; }

echo "==> 1/5  Produktions-Build"
cd "$ROOT" && npm run build

echo "==> 2/5  Statischen Server auf :$PORT starten"
npx --yes serve@14 -l "$PORT" "$ROOT/dist" > /tmp/wx-serve.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 6

echo "==> 3/5  Lighthouse (Mobile + Desktop)"
mkdir -p "$OUT/lighthouse/mobile" "$OUT/lighthouse/desktop"
for u in "${PAGES[@]}"; do
  n="$(name_of "$u")"
  npx --yes lighthouse "$BASE$u" --quiet \
    --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu" \
    --form-factor=mobile --screenEmulation.mobile \
    --screenEmulation.width=412 --screenEmulation.height=823 \
    --screenEmulation.deviceScaleFactor=1.75 \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output=html --output-path="$OUT/lighthouse/mobile/$n"
  npx --yes lighthouse "$BASE$u" --quiet --preset=desktop \
    --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output=html --output-path="$OUT/lighthouse/desktop/$n"
done

echo "==> 4/5  Layout-, Axe- und Netzwerk-Audit (Playwright)"
node "$OUT/config/layout-audit.mjs" "$BASE" "$OUT/raw"
node "$OUT/config/overflow-trace.mjs" "$BASE" 390 | tee "$OUT/raw/overflow-390.txt"

echo "==> 5/5  webhint (statische Markup-Pruefung der vorgerenderten Seiten)"
mkdir -p "$OUT/webhint"
for u in "${PAGES[@]}"; do
  n="$(name_of "$u")"
  npx --yes hint "$BASE$u" --config "$OUT/config/.hintrc" \
    --formatters json > "$OUT/webhint/$n.json" 2>&1 || true
done

# sitespeed.io braucht freien Netzzugang fuer den Chromedriver-Download.
if npx --yes sitespeed.io --version >/dev/null 2>&1; then
  echo "==> Bonus  sitespeed.io"
  npx --yes sitespeed.io --config "$OUT/config/sitespeed.json" \
    "$BASE/" "$BASE/produkt/wax-500/" "$BASE/kette-wachsen-lassen/"
else
  echo "==> sitespeed.io nicht verfuegbar (Chromedriver-Download blockiert) — uebersprungen"
fi

echo
echo "Fertig. Reports in $OUT"
