#!/usr/bin/env python3
"""Baut das kuratierte Kontext-Buendel fuer den Fable-5.1-Planungslauf.

Liest manifest.json, holt jede Datei aus einem Git-Ref (Standard:
feat/porto-labels) und schreibt out/bundle.txt. Erzeugt zusaetzlich Teil D
(Dateibaum, DB-Schema, Routentabelle, Test-Landkarte, Branch-Abstand) --
Material, das Fable sonst teuer selbst herleiten muesste.

Nur Standardbibliothek. Kein API-Key notwendig.

    python3 build_bundle.py --check          # nur pruefen, nichts schreiben
    python3 build_bundle.py                  # Buendel bauen
    python3 build_bundle.py --slim           # ohne dashboard.html
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
MANIFEST = HIER / "manifest.json"
AUSGABE = HIER / "out" / "bundle.txt"

# Repo-Ordnernamen, unter denen wir neben dem Hub suchen.
REPO_ORDNER = {
    "hub": "waxcelerate-sync",
    "masterplan": "waxcelerate-masterplan",
    "site": "waxcelerate-site",
}

# Zeichen pro Token, grob. Nur fuer die Offline-Schaetzung; die echte Zahl
# liefert price.py kostenlos ueber die count_tokens-Schnittstelle.
BYTES_PRO_TOKEN = {".py": 3.5, ".json": 3.2, ".sql": 3.4, ".js": 3.4,
                   ".html": 3.5, ".md": 3.2}
BYTES_PRO_TOKEN_STANDARD = 3.3

TRENNER = "=" * 78

# Muster, die niemals im Buendel landen duerfen. Der Hub behauptet, seit
# Juli 2026 lägen keine Secrets mehr in config.json -- das wird geprueft,
# nicht geglaubt.
GEHEIMNIS_MUSTER = [
    (re.compile(r"\bntn_[A-Za-z0-9]{8,}"), "Notion-Token"),
    (re.compile(r"\bsecret_[A-Za-z0-9]{16,}"), "Notion-Secret (alt)"),
    (re.compile(r"\bsk-(ant-)?[A-Za-z0-9_\-]{16,}"), "Anthropic/OpenAI-Key"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "privater Schluessel"),
    (re.compile(r"\bv\^1\.1#i\^1#[A-Za-z0-9]"), "eBay-Refresh-Token"),
    (re.compile(r"\bA21[A-Z0-9_\-]{40,}"), "PayPal-Secret"),
    (re.compile(r"\bEO[A-Za-z0-9_\-]{60,}"), "PayPal-Client-ID"),
    (re.compile(r"(?i)\b(app[_-]?password|imap[_-]?pass)\b\s*[:=]\s*['\"][^'\"]{8,}"),
     "App-Passwort"),
]


def git(repo: Path, *args: str) -> str:
    """git im Repo ausfuehren, stdout zurueck. Fehler werfen CalledProcessError."""
    return subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True, capture_output=True, text=True, errors="replace",
    ).stdout


def git_leise(repo: Path, *args: str) -> str | None:
    try:
        return git(repo, *args)
    except (subprocess.CalledProcessError, OSError):
        return None


def datei_lesen(repo: Path, ref: str, pfad: str) -> str | None:
    """Datei aus einem Ref lesen; bei ref == 'WORKTREE' aus dem Arbeitsbaum."""
    if ref == "WORKTREE":
        p = repo / pfad
        if not p.is_file():
            return None
        return p.read_text(encoding="utf-8", errors="replace")
    return git_leise(repo, "show", f"{ref}:{pfad}")


def repos_aufloesen(manifest: dict, hub_arg: str | None) -> dict[str, dict]:
    """Findet die drei Repos auf der Platte und prueft den Ref."""
    if hub_arg:
        hub = Path(hub_arg).expanduser().resolve()
    else:
        kandidat = (HIER / manifest["repos"]["hub"]["pfad_vorgabe"]).resolve()
        # Wenn der Werkzeugkasten in waxcelerate-site liegt, ist der Hub ein
        # Nachbarordner, nicht das Elternrepo.
        hub = kandidat if (kandidat / "server.py").is_file() else \
            (kandidat.parent / REPO_ORDNER["hub"])
    if not (hub / ".git").exists():
        sys.exit(f"FEHLER: Hub-Repo nicht gefunden unter {hub}\n"
                 f"        Mit --hub <pfad> den Ordner waxcelerate-sync angeben.")

    aufgeloest: dict[str, dict] = {}
    for name, cfg in manifest["repos"].items():
        if name == "hub":
            pfad = hub
        else:
            pfad = hub.parent / REPO_ORDNER[name]
        aufgeloest[name] = {"pfad": pfad, "ref": cfg["ref"],
                            "vorhanden": (pfad / ".git").exists()}
    return aufgeloest


def schaetzung(text: str, endung: str) -> int:
    return int(len(text.encode("utf-8")) / BYTES_PRO_TOKEN.get(endung, BYTES_PRO_TOKEN_STANDARD))


# ---------------------------------------------------------------- Teil D

def d_dateibaum(repo: Path, ref: str) -> str:
    """Vollstaendiger Dateibaum mit Bytegroessen, damit Fable weiss, was es NICHT sieht."""
    rohdaten = git_leise(repo, "ls-tree", "-r", "-l", ref)
    if not rohdaten:
        return "(Dateibaum nicht verfuegbar)"
    zeilen = []
    for z in rohdaten.splitlines():
        # <mode> <type> <sha> <size>\t<pfad>
        teile = z.split(None, 4)
        if len(teile) < 5:
            continue
        groesse, pfad = teile[3], teile[4]
        if pfad.startswith("belege/"):
            continue
        zeilen.append(f"{groesse:>9}  {pfad}")
    return "\n".join(zeilen)


def d_schema(repo: Path, ref: str) -> str:
    """Jedes CREATE TABLE/VIEW/INDEX aus Code und Migrationsskripten, ohne die Skripte selbst."""
    quellen = ["finance.py", "billing.py", "order_truth/schema.sql"]
    baum = git_leise(repo, "ls-tree", "-r", "--name-only", ref) or ""
    quellen += [p for p in baum.splitlines()
                if p.startswith(("scripts/migrationen/", "scripts/monatslauf/"))
                and p.endswith(".py")]

    muster = re.compile(
        r"CREATE\s+(?:UNIQUE\s+)?(?:TABLE|VIEW|INDEX|TRIGGER)\b.*?;",
        re.IGNORECASE | re.DOTALL,
    )
    abschnitte = []
    for quelle in quellen:
        text = datei_lesen(repo, ref, quelle)
        if not text:
            continue
        treffer = [t.strip() for t in muster.findall(text)]
        if not treffer:
            continue
        abschnitte.append(f"-- ### aus {quelle} ({len(treffer)} Anweisungen)\n"
                          + "\n\n".join(treffer))
    if not abschnitte:
        return "(kein Schema gefunden)"
    return "\n\n".join(abschnitte)


def d_routen(repo: Path, ref: str) -> str:
    """Routentabelle aus server.py, mit der HTTP-Methode aus dem umgebenden do_*-Handler."""
    text = datei_lesen(repo, ref, "server.py")
    if not text:
        return "(server.py nicht lesbar)"
    methode = "?"
    zeilen = []
    pfad_muster = re.compile(r'path\s*(==|\.startswith\()\s*[\'"]([^\'"]+)[\'"]')
    for nr, zeile in enumerate(text.splitlines(), 1):
        handler = re.match(r"\s*def\s+(do_[A-Z]+)\b", zeile)
        if handler:
            methode = handler.group(1).replace("do_", "")
            continue
        for op, route in pfad_muster.findall(zeile):
            art = "prefix" if op != "==" else "exakt "
            zeilen.append(f"{methode:<7} {art} {route:<42} server.py:{nr}")
    gesehen, eindeutig = set(), []
    for z in zeilen:
        if z not in gesehen:
            gesehen.add(z)
            eindeutig.append(z)
    return f"{len(eindeutig)} Route-Bedingungen in server.py:\n\n" + "\n".join(eindeutig)


def d_testlandkarte(repo: Path, ref: str) -> str:
    """Testdateien plus Testnamen -- Abdeckungskarte ohne die Rumpfe zu bezahlen."""
    baum = git_leise(repo, "ls-tree", "-r", "--name-only", ref) or ""
    testdateien = sorted(p for p in baum.splitlines()
                         if re.search(r"(^|/)tests?/.*test_.*\.py$", p))
    zeilen, gesamt = [], 0
    for datei in testdateien:
        text = datei_lesen(repo, ref, datei) or ""
        namen = re.findall(r"^\s*def\s+(test_\w+)", text, re.MULTILINE)
        gesamt += len(namen)
        zeilen.append(f"\n{datei}  ({len(namen)} Tests)")
        zeilen += [f"    {n}" for n in namen]
    kopf = (f"{len(testdateien)} Testdateien, {gesamt} Testfunktionen. "
            f"Die Rumpfe sind NICHT im Buendel.\n")
    return kopf + "\n".join(zeilen)


def d_branch_abstand(repo: Path, ref: str, basis: str) -> str:
    """Die Commits und der Diff-Umfang zwischen main und dem Arbeitsbranch."""
    if ref == "WORKTREE":
        return "(Arbeitsbaum-Modus: kein Branch-Vergleich)"
    log = git_leise(repo, "log", "--oneline", "--no-decorate", f"{basis}..{ref}")
    stat = git_leise(repo, "diff", "--stat", f"{basis}...{ref}")
    if log is None or stat is None:
        return (f"(Vergleich {basis}..{ref} nicht moeglich -- flacher Klon? "
                f"Dann: git fetch --depth=200 origin {basis} {ref})")
    anzahl = len([z for z in log.splitlines() if z.strip()])
    return (f"### {anzahl} Commits, die auf {ref} liegen und nicht auf {basis}\n\n"
            f"{log}\n### Diff-Umfang {basis}...{ref}\n\n{stat}")


RECHTSLAGE = """\
Rechtliches ist AUSDRUECKLICH NICHT Teil dieses Auftrags -- ein API-Aufruf hat
keinen Webzugriff, also kann Recht hier nicht recherchiert werden. Der Stand
wird separat mit Webzugriff gepflegt. Diese Stichpunkte stehen hier nur, damit
du bei Hub-Features die Randbedingungen kennst und keine erfindest:

- Kleinunternehmer nach § 19 UStG, KEINE Umsatzsteuer. Grenze 25.000 EUR;
  hoechster Wert 2026 rund 36 %. Ein spaeterer § 19-Austritt ist der Grund,
  warum USt-Umschaltbarkeit im Rechnungswesen ueberhaupt zu bewerten ist.
- Sicherheitsdatenblatt (REACH Art. 31) ist nur Pflicht, wenn das Gemisch nach
  CLP als gefaehrlich eingestuft ist, PBT/vPvB erfuellt oder auf der
  Kandidatenliste steht. Fuer die Classic-Formel deutet die Bewertung auf
  "nicht gefaehrlich"; fuer die Pro-Linie (MoS2) ist die Gemisch-Einstufung
  offen, der Rohstoff traegt H319/H332. Ein Datenblatt-Generator im Hub waere
  also ein freiwilliges Kundeninformationsblatt, KEIN Sicherheitsdatenblatt --
  und darf sich auch nicht so nennen.
- PPWR gilt seit 12.08.2026. Die bedruckte Wachsschachtel ist Verpackung unter
  eigener Marke und braucht Kennzeichnung (Typ-/Chargen-/Seriennummer, Name
  oder Marke, Postanschrift, auch per QR) plus Konformitaetserklaerung nach
  Anhang VIII, 5 Jahre Aufbewahrung. Kennzeichnungsstufe ab 2028,
  Leerraumgrenze 50 % ab 2030.
- Chargennummern sind damit doppelt begruendet (PPWR-Kennzeichnung und
  GPSR-Rueckverfolgbarkeit). Ob der Hub sie fuehren soll, ist eine Frage an
  dich (T4/T6), die Rechtslage dazu ist geklaert.
- Impressum: § 5 DDG, nicht § 5 TMG (TMG seit 14.05.2024 aufgehoben).
- Kein Preisvergleich mit Mitbewerbern (§ 6 UWG, Leistungen nicht deckungsgleich).
"""


def teil_d_bauen(hub: Path, ref: str, basis: str, manifest: dict) -> list[tuple[str, str]]:
    return [
        ("D1 · Vollstaendiger Dateibaum des Hubs (Bytegroessen)",
         "Alles, was der Branch enthaelt. Was hier steht, aber nicht oben im Buendel "
         "auftaucht, hast du NICHT gesehen -- rate nicht darueber, frag in T12.\n\n"
         + d_dateibaum(hub, ref)),
        ("D2 · Komplettes Datenbankschema",
         "Extrahiert aus finance.py, billing.py, order_truth/schema.sql und allen "
         "Migrationsskripten. Damit hast du das Schema, ohne dass die Skripte im "
         "Buendel liegen.\n\n" + d_schema(hub, ref)),
        ("D3 · Routentabelle server.py", d_routen(hub, ref)),
        ("D4 · Test-Landkarte", d_testlandkarte(hub, ref)),
        ("D5 · Branch-Abstand: der ungemergte Stand", d_branch_abstand(hub, ref, basis)),
        ("D6 · Rechtslage in Stichpunkten (nur als Randbedingung)", RECHTSLAGE),
        ("D7 · Was bewusst NICHT im Buendel ist",
         "\n".join(f"- {z}" for z in manifest["nicht_im_buendel"])),
    ]


# ---------------------------------------------------------------- Hauptlauf

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--hub", help="Pfad zum Repo waxcelerate-sync")
    ap.add_argument("--ref", help="Git-Ref (Standard aus manifest.json), "
                                  "oder WORKTREE fuer den Arbeitsbaum")
    ap.add_argument("--basis", default="main", help="Vergleichsbranch fuer D5 (Standard main)")
    ap.add_argument("--slim", action="store_true",
                    help="Teile mit slim_auslassen weglassen (spart ~165k Token)")
    ap.add_argument("--check", action="store_true", help="nur pruefen, nichts schreiben")
    ap.add_argument("--out", default=str(AUSGABE))
    args = ap.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    repos = repos_aufloesen(manifest, args.hub)
    hub, hub_ref = repos["hub"]["pfad"], (args.ref or repos["hub"]["ref"])

    print(f"Hub:        {hub}  @ {hub_ref}")
    for name in ("masterplan", "site"):
        zustand = "ok" if repos[name]["vorhanden"] else "FEHLT (Dateien werden uebersprungen)"
        print(f"{name+':':<12}{repos[name]['pfad']}  -> {zustand}")

    if hub_ref != "WORKTREE" and git_leise(hub, "rev-parse", "--verify", hub_ref) is None:
        sys.exit(f"\nFEHLER: Ref '{hub_ref}' existiert nicht in {hub}.\n"
                 f"        Holen mit: git -C {hub} fetch --depth=200 origin {hub_ref}")

    stuecke: list[str] = []
    fehlend: list[str] = []
    geheimnisse: list[str] = []
    tok_gesamt = 0
    zeilen_bericht: list[str] = []

    for teil in manifest["teile"]:
        if args.slim and teil.get("slim_auslassen"):
            print(f"\nTeil {teil['id']} uebersprungen (--slim): {teil['titel']}")
            continue
        kopf = [TRENNER, f"TEIL {teil['id']} · {teil['titel']}", TRENNER]
        if teil.get("hinweis"):
            kopf.append(teil["hinweis"])
        stuecke.append("\n".join(kopf) + "\n")
        teil_tok = 0

        for eintrag in teil["dateien"]:
            repo_name, pfad = eintrag["repo"], eintrag["pfad"]
            repo = repos[repo_name]
            if not repo["vorhanden"]:
                fehlend.append(f"{repo_name}:{pfad} (Repo fehlt)")
                continue
            ref = hub_ref if repo_name == "hub" else repo["ref"]
            text = datei_lesen(repo["pfad"], ref, pfad)
            if text is None:
                fehlend.append(f"{repo_name}:{pfad} @ {ref}")
                continue

            for muster, art in GEHEIMNIS_MUSTER:
                if muster.search(text):
                    geheimnisse.append(f"{repo_name}:{pfad} -> {art}")

            endung = Path(pfad).suffix
            tok = schaetzung(text, endung)
            teil_tok += tok
            bytes_n = len(text.encode("utf-8"))
            stuecke.append(
                f"\n{TRENNER}\n"
                f"DATEI: {pfad}   [{repo_name} @ {ref}, {bytes_n} B, ~{tok} Token]\n"
                f"{TRENNER}\n{text.rstrip()}\n"
            )
            zeilen_bericht.append(f"  {tok:>7} Tok  {bytes_n:>8} B  {repo_name}:{pfad}")

        print(f"\nTeil {teil['id']}: {teil['titel']} -> ~{teil_tok} Token")
        tok_gesamt += teil_tok

    # Teil D
    stuecke.append("\n".join([TRENNER, "TEIL D · Vorbereitetes Material (generiert)", TRENNER,
                              "Diese Abschnitte hat der Buendel-Builder erzeugt, damit du sie "
                              "nicht aus dem Code herleiten musst.", ""]))
    d_tok = 0
    for titel, inhalt in teil_d_bauen(hub, hub_ref, args.basis, manifest):
        tok = schaetzung(inhalt, ".md")
        d_tok += tok
        stuecke.append(f"\n{TRENNER}\n{titel}   [~{tok} Token]\n{TRENNER}\n{inhalt.rstrip()}\n")
    print(f"\nTeil D: generiertes Material -> ~{d_tok} Token")
    tok_gesamt += d_tok

    if fehlend:
        print("\n!! NICHT GEFUNDEN (Manifest gegen Ref pruefen):")
        for f in fehlend:
            print(f"   - {f}")
    if geheimnisse:
        print("\n!! GEHEIMNIS-VERDACHT -- Buendel NICHT senden, bevor das geklaert ist:")
        for g in geheimnisse:
            print(f"   - {g}")

    print(f"\nSumme Offline-Schaetzung: ~{tok_gesamt} Token "
          f"(~${tok_gesamt/1_000_000*10:.2f} Input bei Fable 5.1, "
          f"~${tok_gesamt/1_000_000*5:.2f} per Batch)")
    print("Die exakte Zahl liefert price.py kostenlos ueber count_tokens.")

    if args.check:
        print("\n--check: nichts geschrieben.")
        return 1 if (fehlend or geheimnisse) else 0

    if geheimnisse:
        sys.exit("\nAbbruch: Geheimnis-Verdacht. Datei aus manifest.json entfernen "
                 "oder das Geheimnis aus dem Repo raeumen, dann erneut bauen.")

    ziel = Path(args.out)
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text("\n".join(stuecke), encoding="utf-8")
    (ziel.parent / "bundle_bericht.txt").write_text(
        f"Buendel: {ziel}\nHub: {hub} @ {hub_ref}\nslim: {args.slim}\n"
        f"Offline-Schaetzung: ~{tok_gesamt} Token\n\nDateien:\n"
        + "\n".join(zeilen_bericht) + "\n", encoding="utf-8")
    print(f"\nGeschrieben: {ziel} ({ziel.stat().st_size} B)")
    print(f"Aufschluesselung: {ziel.parent / 'bundle_bericht.txt'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
