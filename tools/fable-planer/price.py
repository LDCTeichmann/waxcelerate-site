#!/usr/bin/env python3
"""Zaehlt die Token des fertigen Buendels und rechnet die Kosten -- VOR dem Senden.

Die Zaehlung laeuft ueber die count_tokens-Schnittstelle und ist **kostenlos**.
Das ist der einzige Weg, die exakte Zahl zu kennen, ohne Guthaben auszugeben.

    python3 price.py                      # Tabelle ueber alle effort-Stufen
    python3 price.py --budget 19          # bricht ab, wenn die Projektion reisst
    python3 price.py --effort xhigh --batch

Braucht ANTHROPIC_API_KEY (oder ein per `ant auth login` angelegtes Profil) und
das SDK: pip install anthropic
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
BUENDEL = HIER / "out" / "bundle.txt"
PROMPT = HIER / "prompt.md"
SPEND_LOG = HIER / "out" / "spend.log"

MODELL = "claude-fable-5-1"

# USD je 1 Mio Token, Fable 5.1. Batch halbiert alles.
PREISE = {
    "input": 10.0,
    "output": 50.0,
    "cache_write_5m": 12.50,
    "cache_write_1h": 20.0,
    "cache_read": 0.25,
}

# Geschaetzte Thinking-Token je effort-Stufe bei einer Aufgabe dieser Groesse.
# SCHAETZUNG, keine Zusage -- Thinking ist bei Fable immer an und zaehlt als
# Output. Nach dem ersten echten Lauf steht die Wahrheit in spend.log.
THINKING_SCHAETZUNG = {"low": 8_000, "medium": 20_000, "high": 35_000,
                       "xhigh": 55_000, "max": 90_000}
# ~11.000 Woerter deutsches Markdown.
TEXT_SCHAETZUNG = 18_000


def prompt_teile() -> tuple[str, str]:
    text = PROMPT.read_text(encoding="utf-8")
    teile = {}
    for name in ("SYSTEM", "USER"):
        m = re.search(rf"^## {name}\s*$(.*?)(?=^## |\Z)", text, re.M | re.S)
        if not m:
            sys.exit(f"FEHLER: Abschnitt '## {name}' fehlt in {PROMPT}")
        teile[name] = m.group(1).strip()
    return teile["SYSTEM"], teile["USER"]


def anfrage_bauen(cache: str | None = "5m") -> dict:
    """Baut die Anfrage-Struktur. Das Buendel ist ein eigener Block, damit
    cache_control genau darauf sitzt und der Prefix stabil bleibt."""
    system, user = prompt_teile()
    if not BUENDEL.is_file():
        sys.exit(f"FEHLER: {BUENDEL} fehlt. Erst build_bundle.py laufen lassen.")
    buendel = BUENDEL.read_text(encoding="utf-8")

    buendel_block: dict = {
        "type": "text",
        "text": "Hier ist das Buendel:\n\n" + buendel,
    }
    if cache:
        buendel_block["cache_control"] = (
            {"type": "ephemeral", "ttl": "1h"} if cache == "1h" else {"type": "ephemeral"}
        )

    return {
        "system": [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        "messages": [{"role": "user", "content": [buendel_block, {"type": "text", "text": user}]}],
    }


def kosten(input_tok: int, out_tok: int, *, batch: bool, cache_write: str | None) -> dict:
    faktor = 0.5 if batch else 1.0
    if cache_write == "1h":
        in_rate = PREISE["cache_write_1h"]
    elif cache_write == "5m":
        in_rate = PREISE["cache_write_5m"]
    else:
        in_rate = PREISE["input"]
    ein = input_tok / 1_000_000 * in_rate * faktor
    aus = out_tok / 1_000_000 * PREISE["output"] * faktor
    return {"input": ein, "output": aus, "summe": ein + aus}


def bisher_ausgegeben() -> float:
    if not SPEND_LOG.is_file():
        return 0.0
    summe = 0.0
    for zeile in SPEND_LOG.read_text(encoding="utf-8").splitlines():
        try:
            summe += float(json.loads(zeile).get("kosten_usd", 0.0))
        except (ValueError, json.JSONDecodeError, AttributeError):
            continue
    return summe


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--budget", type=float, help="USD-Deckel; Rueckgabecode 2 wenn gerissen")
    ap.add_argument("--effort", choices=list(THINKING_SCHAETZUNG),
                    help="nur diese Stufe zeigen")
    ap.add_argument("--batch", action="store_true", help="Batch-Preise (50 %%) hervorheben")
    ap.add_argument("--cache", choices=["5m", "1h", "aus"], default="aus",
                    help="Cache-Schreibaufschlag lohnt nur, wenn ein zweiter "
                         "Aufruf im TTL folgt; fuer einen Einzellauf guenstiger aus")
    ap.add_argument("--model", default=MODELL)
    args = ap.parse_args()

    try:
        import anthropic
    except ImportError:
        sys.exit("FEHLER: SDK fehlt. pip install anthropic")

    cache = None if args.cache == "aus" else args.cache
    anfrage = anfrage_bauen(cache)

    client = anthropic.Anthropic()
    print(f"Zaehle Token fuer {args.model} (kostenlos) ...")
    try:
        gezaehlt = client.messages.count_tokens(
            model=args.model, system=anfrage["system"], messages=anfrage["messages"])
    except anthropic.APIStatusError as e:
        sys.exit(f"FEHLER {e.status_code}: {e.message}")
    except anthropic.APIConnectionError as e:
        sys.exit(f"Verbindung fehlgeschlagen: {e}")

    input_tok = gezaehlt.input_tokens
    print(f"\nInput exakt: {input_tok:,} Token".replace(",", "."))
    if input_tok > 1_000_000:
        print("!! Ueber dem 1-Mio-Kontextfenster. Manifest kuerzen oder --slim bauen.")

    stufen = [args.effort] if args.effort else list(THINKING_SCHAETZUNG)
    print(f"\nOutput-Schaetzung: {TEXT_SCHAETZUNG:,} Token Text (~11.000 Woerter) "
          f"plus Thinking je Stufe.".replace(",", "."))
    print(f"Cache-Modus: {args.cache} (erster Aufruf zahlt Schreibpreis, "
          f"Folgeaufruf im TTL nur ${PREISE['cache_read']}/MTok)\n")

    kopf = f"{'effort':<8} {'Out-Tok':>9} {'Standard':>10} {'Batch −50 %':>13}"
    print(kopf)
    print("-" * len(kopf))
    ergebnisse = {}
    for stufe in stufen:
        out_tok = TEXT_SCHAETZUNG + THINKING_SCHAETZUNG[stufe]
        std = kosten(input_tok, out_tok, batch=False, cache_write=cache)
        bat = kosten(input_tok, out_tok, batch=True, cache_write=cache)
        ergebnisse[stufe] = bat if args.batch else std
        print(f"{stufe:<8} {out_tok:>9,} {'$'+format(std['summe'],'.2f'):>10} "
              f"{'$'+format(bat['summe'],'.2f'):>13}".replace(",", "."))

    print(f"\nDavon Input: ${kosten(input_tok, 0, batch=args.batch, cache_write=cache)['input']:.2f}"
          f"  (bei jedem Aufruf neu, solange der Cache kalt ist)")

    ausgegeben = bisher_ausgegeben()
    if ausgegeben:
        print(f"Laut spend.log bereits ausgegeben: ${ausgegeben:.2f}")

    if args.budget is not None:
        stufe = args.effort or "xhigh"
        projektion = ergebnisse.get(stufe) or ergebnisse[stufen[0]]
        rest = args.budget - ausgegeben
        print(f"\nBudget ${args.budget:.2f} − ausgegeben ${ausgegeben:.2f} "
              f"= ${rest:.2f} frei.")
        print(f"Projektion fuer effort={stufe}"
              f"{' per Batch' if args.batch else ''}: ${projektion['summe']:.2f}")
        if projektion["summe"] > rest:
            print("\n>> REISST DAS BUDGET. Wege: --batch (halbiert), effort senken, "
                  "oder build_bundle.py --slim (ohne dashboard.html).")
            return 2
        print(f">> Passt. Danach noch ${rest - projektion['summe']:.2f} frei.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
