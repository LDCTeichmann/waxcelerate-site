#!/usr/bin/env python3
"""Fuehrt den Fable-5.1-Planungslauf aus und protokolliert, was er wirklich kostet.

    python3 run_fable.py --dry-run                # nur zaehlen und rechnen
    python3 run_fable.py --rehearsal              # Generalprobe, Cent-Bereich
    python3 run_fable.py --batch                  # der echte Lauf, 50 % guenstiger
    python3 run_fable.py --effort max             # tiefer, teurer

Braucht ANTHROPIC_API_KEY (oder `ant auth login`) und: pip install anthropic
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import time
from pathlib import Path

import price  # Preise, Prompt-Zerlegung, Anfrage-Bau -- eine Quelle

HIER = Path(__file__).resolve().parent
AUS = HIER / "out"

# Generalprobe: kleines Modell, gekuerztes Buendel. Beweist Auth, Parameter,
# Antwort-Zerlegung und Schreibpfade fuer wenige Cent. Beweist NICHT, dass die
# volle Nutzlast durchgeht -- das beweist price.py kostenlos ueber count_tokens.
PROBE_MODELL = "claude-haiku-4-5"
PROBE_KUERZEN = 120_000  # Zeichen, passt in das 200k-Kontextfenster von Haiku


def jetzt() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def verbrauch_notieren(satz: dict) -> None:
    AUS.mkdir(parents=True, exist_ok=True)
    with (AUS / "spend.log").open("a", encoding="utf-8") as f:
        f.write(json.dumps(satz, ensure_ascii=False) + "\n")


def kosten_aus_verbrauch(u, *, batch: bool) -> float:
    """Echte Kosten aus dem usage-Objekt der Antwort, nicht aus der Schaetzung."""
    faktor = 0.5 if batch else 1.0
    g = lambda name: getattr(u, name, 0) or 0
    return faktor * (
        g("input_tokens") / 1e6 * price.PREISE["input"]
        + g("cache_creation_input_tokens") / 1e6 * price.PREISE["cache_write_5m"]
        + g("cache_read_input_tokens") / 1e6 * price.PREISE["cache_read"]
        + g("output_tokens") / 1e6 * price.PREISE["output"]
    )


def verbrauch_dict(u) -> dict:
    felder = ("input_tokens", "output_tokens", "cache_creation_input_tokens",
              "cache_read_input_tokens")
    return {f: getattr(u, f, None) for f in felder}


def text_aus(antwort) -> str:
    return "\n".join(b.text for b in antwort.content
                     if getattr(b, "type", None) == "text")


def stop_pruefen(antwort) -> None:
    """Abbruchgruende sichtbar machen statt die Antwort stumm zu beschneiden."""
    grund = getattr(antwort, "stop_reason", None)
    if grund == "refusal":
        det = getattr(antwort, "stop_details", None)
        print(f"\n!! Das Modell hat abgelehnt. Kategorie: "
              f"{getattr(det, 'category', '?')} -- {getattr(det, 'explanation', '')}",
              file=sys.stderr)
    elif grund == "max_tokens":
        print("\n!! max_tokens erreicht -- das Dokument ist ABGESCHNITTEN. "
              "Mit hoeherem --max-tokens erneut, oder den Ausgabevertrag "
              "in prompt.md kuerzen.", file=sys.stderr)
    elif grund not in (None, "end_turn"):
        print(f"\n!! Unerwarteter stop_reason: {grund}", file=sys.stderr)


def kuerzen(anfrage: dict, zeichen: int) -> dict:
    """Buendel-Block fuer die Generalprobe kappen."""
    block = anfrage["messages"][0]["content"][0]
    if len(block["text"]) > zeichen:
        block["text"] = (block["text"][:zeichen]
                         + "\n\n[... GENERALPROBE: Buendel hier gekappt ...]")
    block.pop("cache_control", None)
    return anfrage


def standard_lauf(client, modell, anfrage, effort, max_tokens, *, fallbacks: bool):
    """Streaming, weil max_tokens gross ist und sonst HTTP-Timeouts drohen."""
    kw = dict(model=modell, max_tokens=max_tokens,
              system=anfrage["system"], messages=anfrage["messages"])
    # Kein thinking-Parameter: bei Fable 5.1 ist Thinking immer an, jede
    # explizite Konfiguration gibt 400. Tiefe kommt aus output_config.effort.
    if effort:
        kw["output_config"] = {"effort": effort}

    if fallbacks:
        # Bei einer Sicherheitsablehnung laeuft dieselbe Anfrage serverseitig
        # auf einem Ausweichmodell weiter, statt einfach zu stoppen.
        kw["betas"] = ["server-side-fallback-2026-07-01"]
        kw["fallbacks"] = "default"
        strom = client.beta.messages.stream(**kw)
    else:
        strom = client.messages.stream(**kw)

    begonnen = time.time()
    with strom as s:
        for _ in s.text_stream:
            pass
        antwort = s.get_final_message()
    print(f"   fertig nach {time.time()-begonnen:.0f} s")
    return antwort


def batch_lauf(client, modell, anfrage, effort, max_tokens, warte: int):
    """Batch: 50 % Rabatt, dafuer asynchron. fallbacks sind hier nicht erlaubt."""
    params = dict(model=modell, max_tokens=max_tokens,
                  system=anfrage["system"], messages=anfrage["messages"])
    if effort:
        params["output_config"] = {"effort": effort}

    stapel = client.messages.batches.create(
        requests=[{"custom_id": "plan", "params": params}])
    print(f"   Batch angelegt: {stapel.id}")
    print(f"   Abbruch hier ist gefahrlos -- spaeter wieder aufnehmen mit:\n"
          f"     python3 run_fable.py --batch-id {stapel.id}")
    return batch_abholen(client, stapel.id, warte)


def batch_abholen(client, stapel_id: str, warte: int):
    print(f"   warte auf {stapel_id} (alle {warte} s) ...")
    while True:
        stapel = client.messages.batches.retrieve(stapel_id)
        if stapel.processing_status == "ended":
            break
        print(f"   Status: {stapel.processing_status}")
        time.sleep(warte)
    for eintrag in client.messages.batches.results(stapel_id):
        if eintrag.result.type == "succeeded":
            return eintrag.result.message
        sys.exit(f"Batch-Eintrag {eintrag.custom_id} endete als "
                 f"{eintrag.result.type}: {getattr(eintrag.result, 'error', '')}")
    sys.exit("Batch lieferte kein Ergebnis.")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default=price.MODELL)
    ap.add_argument("--effort", default="xhigh",
                    choices=["low", "medium", "high", "xhigh", "max"])
    ap.add_argument("--max-tokens", type=int, default=64_000)
    ap.add_argument("--cache", choices=["5m", "1h", "aus"], default="aus",
                    help="Cache-Schreibaufschlag lohnt nur, wenn ein zweiter "
                         "Aufruf im TTL folgt; fuer einen Einzellauf guenstiger aus")
    ap.add_argument("--batch", action="store_true", help="Batch-API, 50 %% guenstiger")
    ap.add_argument("--batch-id", help="einen laufenden Batch wieder aufnehmen")
    ap.add_argument("--batch-poll", type=int, default=60, help="Sekunden je Statusabfrage")
    ap.add_argument("--rehearsal", action="store_true",
                    help=f"Generalprobe mit {PROBE_MODELL} und gekuerztem Buendel")
    ap.add_argument("--dry-run", action="store_true", help="nur zaehlen und rechnen")
    ap.add_argument("--no-fallbacks", action="store_true",
                    help="serverseitiges Ausweichmodell abschalten")
    ap.add_argument("--out", help="Zieldatei (Standard out/plan_<zeit>.md)")
    ap.add_argument("--yes", action="store_true", help="ohne Rueckfrage senden")
    args = ap.parse_args()

    if args.dry_run:
        sys.argv = ["price.py", "--effort", args.effort, "--cache", args.cache]
        if args.batch:
            sys.argv.append("--batch")
        return price.main()

    try:
        import anthropic
    except ImportError:
        sys.exit("FEHLER: SDK fehlt. pip install anthropic")

    client = anthropic.Anthropic()
    AUS.mkdir(parents=True, exist_ok=True)

    if args.batch_id:
        antwort = batch_abholen(client, args.batch_id, args.batch_poll)
        modell, effort, ist_batch = args.model, args.effort, True
    else:
        cache = None if args.cache == "aus" else args.cache
        modell = PROBE_MODELL if args.rehearsal else args.model
        # effort gibt es auf Haiku 4.5 nicht -- dort weglassen, sonst Fehler.
        effort = None if args.rehearsal else args.effort
        max_tokens = 2_000 if args.rehearsal else args.max_tokens
        ist_batch = args.batch and not args.rehearsal

        anfrage = price.anfrage_bauen(None if args.rehearsal else cache)
        if args.rehearsal:
            anfrage = kuerzen(anfrage, PROBE_KUERZEN)

        # Kosten nennen, bevor etwas fliesst.
        gezaehlt = client.messages.count_tokens(
            model=modell, system=anfrage["system"], messages=anfrage["messages"])
        out_schaetzung = max_tokens if args.rehearsal else (
            price.TEXT_SCHAETZUNG + price.THINKING_SCHAETZUNG[args.effort])
        # Fuer die Generalprobe zaehlt Haiku-Preis, nicht Fable-Preis.
        if args.rehearsal:
            geschaetzt = (gezaehlt.input_tokens / 1e6 * 1.0
                          + out_schaetzung / 1e6 * 5.0)
        else:
            geschaetzt = price.kosten(gezaehlt.input_tokens, out_schaetzung,
                                      batch=ist_batch, cache_write=cache)["summe"]

        print(f"Modell:       {modell}")
        print(f"effort:       {effort or '(nicht gesetzt)'}")
        print(f"Modus:        {'BATCH (−50 %)' if ist_batch else 'Standard (Streaming)'}"
              f"{'  GENERALPROBE' if args.rehearsal else ''}")
        print(f"Input:        {gezaehlt.input_tokens:,} Token".replace(",", "."))
        print(f"max_tokens:   {max_tokens:,}".replace(",", "."))
        print(f"Schaetzung:   ~${geschaetzt:.2f}")
        bisher = price.bisher_ausgegeben()
        if bisher:
            print(f"Bisher laut spend.log: ${bisher:.2f}")

        if not args.yes:
            if input("\nSenden? [j/N] ").strip().lower() not in ("j", "ja", "y", "yes"):
                print("Abgebrochen. Nichts gesendet, nichts bezahlt.")
                return 1

        print("\nlaeuft ...")
        try:
            if ist_batch:
                antwort = batch_lauf(client, modell, anfrage, effort,
                                     max_tokens, args.batch_poll)
            else:
                antwort = standard_lauf(
                    client, modell, anfrage, effort, max_tokens,
                    fallbacks=(not args.no_fallbacks and not args.rehearsal
                               and modell.startswith("claude-fable")))
        except anthropic.BadRequestError as e:
            sys.exit(f"\n400 -- Parameter abgelehnt: {e.message}")
        except anthropic.RateLimitError as e:
            sys.exit(f"\n429 -- Ratenlimit: {e.message}\nSpaeter erneut, "
                     f"oder mit --batch (eigenes Limit).")
        except anthropic.APIStatusError as e:
            sys.exit(f"\nFEHLER {e.status_code}: {e.message}")

    stop_pruefen(antwort)
    text = text_aus(antwort)
    ziel = Path(args.out) if args.out else (
        AUS / f"plan_{dt.datetime.now().strftime('%Y%m%d_%H%M')}"
              f"{'_probe' if args.rehearsal else ''}.md")
    ziel.write_text(text, encoding="utf-8")

    echt = kosten_aus_verbrauch(antwort.usage, batch=ist_batch)
    satz = {"zeit": jetzt(), "modell": getattr(antwort, "model", modell),
            "effort": effort, "batch": ist_batch, "probe": args.rehearsal,
            "stop_reason": getattr(antwort, "stop_reason", None),
            "usage": verbrauch_dict(antwort.usage),
            "kosten_usd": round(echt, 4), "datei": str(ziel)}
    verbrauch_notieren(satz)

    print(f"\nGeschrieben:  {ziel}  ({len(text.split())} Woerter)")
    print(f"Verbrauch:    {json.dumps(verbrauch_dict(antwort.usage))}")
    print(f"Echte Kosten: ${echt:.2f}"
          + ("  (Probe zum Haiku-Preis)" if args.rehearsal else ""))
    gelesen = getattr(antwort.usage, "cache_read_input_tokens", 0) or 0
    if gelesen:
        print(f"Cache gelesen: {gelesen:,} Token -- der Cache hat gegriffen."
              .replace(",", "."))
    print(f"Gesamt laut spend.log: ${price.bisher_ausgegeben():.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
