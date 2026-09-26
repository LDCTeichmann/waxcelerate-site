#!/usr/bin/env python3
"""Baut den Lesestoff fuer den Planungslauf ueber den Waxcelerate Hub.

Liest manifest.json, holt jede Datei aus einem Git-Ref (Standard:
feat/porto-labels) und schreibt nach kontext/ eine Handvoll vorkonkatenierter
Bausteine plus 00_LESEKARTE.md. Das lesende Modell oeffnet dann eine Handvoll
Dateien statt 82 -- der Kostenhebel, weil bei jedem Turn der gewachsene Kontext
erneut abgerechnet wird. Mit --nur-doku bleibt der Quelltext ganz draussen und
wird durch die Landkarten in Teil D ersetzt; das ist der Modus fuer einen
Agenten, der die Dateien selbst lesen kann (Codex, Claude Code).

Erzeugt ausserdem teil_d.md (Dateibaum, komplettes DB-Schema, Routentabelle,
Test-Landkarte, Branch-Abstand, Rechtslage, UI-Landkarte) -- Material, das
das lesende Modell sonst teuer selbst herleiten muesste.

Nur Standardbibliothek. Kein API-Key notwendig, kostet nichts.

    python3 build_kontext.py --check     # nur pruefen, nichts schreiben
    python3 build_kontext.py             # Bausteine nach kontext/ schreiben
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
KONTEXT = HIER / "kontext"
ZEILEN_JE_BAUSTEIN = 3000

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


def repos_aufloesen(manifest: dict, hub_arg: str | None,
                    zusatz: dict | None = None) -> dict[str, dict]:
    """Findet die drei Repos auf der Platte und prueft den Ref."""
    zusatz = zusatz or {}
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
        elif zusatz.get(name):
            pfad = Path(zusatz[name]).expanduser().resolve()
        else:
            pfad = hub.parent / REPO_ORDNER[name]
            if not (pfad / ".git").exists():
                # Die Repos liegen auf Lucas Mac unter verschiedenen Elternordnern.
                for kandidat in (hub.parent.parent, Path.home(),
                                 Path.home() / "Developer Luca",
                                 Path.home() / "Claude Playground"):
                    versuch = kandidat / REPO_ORDNER[name]
                    if (versuch / ".git").exists():
                        pfad = versuch
                        break
        aufgeloest[name] = {"pfad": pfad, "ref": cfg["ref"],
                            "vorhanden": (pfad / ".git").exists()}
    return aufgeloest


def schaetzung(text: str, endung: str) -> int:
    return int(len(text.encode("utf-8")) / BYTES_PRO_TOKEN.get(endung, BYTES_PRO_TOKEN_STANDARD))


# ---------------------------------------------------------------- Teil D

def d_dateibaum(repo: Path, ref: str) -> str:
    """Vollstaendiger Dateibaum mit Bytegroessen, damit das Modell weiss, was es NICHT sieht."""
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


def d_code_landkarte(repo, ref: str, manifest: dict) -> str:
    """Signaturen aller Python-Module aus Teil B, mit Zeilennummer.

    Gemessen: 323.143 -> 12.903 Token. Ein Agent, der die Dateien lokal hat,
    braucht den Volltext nicht vorab -- er liest gezielt die Stelle nach, die
    seine Frage beantwortet.
    """
    abschnitte = []
    gesamt = 0
    for teil in manifest["teile"]:
        if teil["id"] != "B":
            continue
        for e in teil["dateien"]:
            pfad = e["pfad"]
            if not pfad.endswith(".py"):
                continue
            text = datei_lesen(repo, ref, pfad)
            if not text:
                continue
            zeilen = [f"### {pfad}  ({text.count(chr(10))+1} Zeilen)"]
            for nr, z in enumerate(text.splitlines(), 1):
                m = re.match(r"^(\s*)(?:async\s+)?(def|class)\s+(\w+)\s*(\([^)]*\))?", z)
                if m:
                    gesamt += 1
                    einzug = "  " if m.group(1) else ""
                    zeilen.append(f"{nr:>5} {einzug}{m.group(2)} {m.group(3)}"
                                  f"{(m.group(4) or '')[:70]}")
            abschnitte.append("\n".join(zeilen))
    kopf = (f"{gesamt} Definitionen in {len(abschnitte)} Modulen, mit Zeilennummer.\n"
            f"Der Volltext liegt im Repo -- lies gezielt nach, was du brauchst, "
            f"statt Dateien am Stueck zu ueberfliegen.\n")
    return kopf + "\n\n".join(abschnitte)


def d_ui_landkarte(repo, ref: str) -> str:
    """dashboard.html ist 574 KB / ~164k Token. Diese Landkarte leistet fuer
    Architektur- und Feature-Urteile dasselbe mit ~5k Token."""
    text = datei_lesen(repo, ref, "dashboard.html")
    if not text:
        return "(dashboard.html nicht lesbar)"
    zeilen = [
        "dashboard.html ist das komplette Frontend in EINER Datei "
        f"({len(text.encode('utf-8'))} B, {text.count(chr(10))+1} Zeilen), Vanilla JS, "
        "kein Build-Schritt. Der Volltext ist NICHT im Kontext -- greif per grep "
        "gezielt hinein, wenn diese Landkarte fuer eine Aussage nicht reicht.",
        "",
        "## Sidebar-Abschnitte",
    ]
    zeilen += sorted({f"  {m.group(1)}" for m in re.finditer(r'id="(sec-[a-z0-9-]+)"', text)})
    zeilen += ["", "## JS-Funktionen (Zeile, Name, Parameter)"]
    anzahl = 0
    for nr, z in enumerate(text.splitlines(), 1):
        m = re.match(r"\s*(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)", z)
        if m:
            anzahl += 1
            zeilen.append(f"  {nr:>5}  {m.group(1)}({m.group(2)[:56]})")
    eps = sorted(set(re.findall(r"""(?:fetch|api)\(\s*[`'\"]([/][^`'\"?\s]+)""", text)))
    zeilen += ["", f"## Von der Oberflaeche gerufene Endpunkte ({len(eps)})"]
    zeilen += [f"  {e}" for e in eps]
    zeilen.insert(1, f"{anzahl} Funktionen, {len(eps)} Endpunkte erfasst.")
    return "\n".join(zeilen)


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
        ("D7 · Was bewusst NICHT im Kontext ist",
         "\n".join(f"- {z}" for z in manifest["nicht_im_buendel"])),
        ("D8 · UI-Landkarte dashboard.html", d_ui_landkarte(hub, ref)),
        ("D9 · Code-Landkarte: alle Python-Module", d_code_landkarte(hub, ref, manifest)),
    ]


# ---------------------------------------------------------------- Hauptlauf

def bausteine_schneiden(stuecke, zeilen_je):
    """Packt die gesammelten Textstuecke in Bausteine von ~zeilen_je Zeilen.

    Eine Datei wird nur geteilt, wenn sie allein schon groesser ist als ein
    Baustein (server.py, finance.py). Alles andere bleibt am Stueck, damit das Modell
    keine Funktion zerrissen sieht.
    """
    bausteine, aktuell, aktuell_zeilen, inhalt = [], [], 0, []

    def abschliessen():
        nonlocal aktuell, aktuell_zeilen, inhalt
        if aktuell:
            bausteine.append(("\n".join(aktuell), list(inhalt)))
            aktuell, aktuell_zeilen, inhalt = [], 0, []

    for name, text in stuecke:
        zeilen = text.splitlines()
        if len(zeilen) > zeilen_je:
            abschliessen()
            for start in range(0, len(zeilen), zeilen_je):
                teil = zeilen[start:start + zeilen_je]
                marke = (f"{name} (Zeilen {start+1}-{start+len(teil)}"
                         f" von {len(zeilen)})")
                kopf_ = f"[Fortsetzung] {marke}" if start else marke
                bausteine.append((f"### {kopf_}\n" + "\n".join(teil), [marke]))
            continue
        if aktuell_zeilen + len(zeilen) > zeilen_je:
            abschliessen()
        aktuell.append(text)
        aktuell_zeilen += len(zeilen)
        inhalt.append(name)
    abschliessen()
    return bausteine


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--hub", help="Pfad zum Repo waxcelerate-sync")
    ap.add_argument("--masterplan", help="Pfad zum Repo waxcelerate-masterplan")
    ap.add_argument("--site", help="Pfad zum Repo waxcelerate-site")
    ap.add_argument("--ohne-masterplan", action="store_true",
                    help="ohne den Masterplan bauen -- das Modell verliert dann die "
                         "Geschaeftsdiagnose, die sein Maszstab ist")
    ap.add_argument("--ref", help="Git-Ref (Standard aus manifest.json), "
                                  "oder WORKTREE fuer den Arbeitsbaum")
    ap.add_argument("--basis", default="main", help="Vergleichsbranch fuer D5 (Standard main)")
    ap.add_argument("--zeilen", type=int, default=ZEILEN_JE_BAUSTEIN,
                    help=f"Zeilen je Baustein (Standard {ZEILEN_JE_BAUSTEIN})")
    ap.add_argument("--nur-doku", action="store_true",
                    help="Quelltext (Teil B/C) NICHT in die Bausteine legen -- fuer einen "
                         "Agenten im Repo, der die Dateien selbst lesen kann. Die "
                         "Code-Landkarte in Teil D bleibt und nennt jede Definition "
                         "mit Zeilennummer.")
    ap.add_argument("--check", action="store_true", help="nur pruefen, nichts schreiben")
    ap.add_argument("--out", default=str(KONTEXT), help="Zielordner (Standard kontext/)")
    ap.add_argument("--pfad-basis",
                    help="Pfade in der Lesekarte relativ zu diesem Ordner angeben "
                         "(fuer ein Repo, das anderswo ausgecheckt wird -- etwa in "
                         "der Codex-Cloud). Ohne Angabe: absolute Pfade.")
    args = ap.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    repos = repos_aufloesen(manifest, args.hub,
                            {"masterplan": args.masterplan, "site": args.site})
    hub, hub_ref = repos["hub"]["pfad"], (args.ref or repos["hub"]["ref"])

    print(f"Hub:        {hub}  @ {hub_ref}")
    for name in ("masterplan", "site"):
        zustand = "ok" if repos[name]["vorhanden"] else "FEHLT (Dateien werden uebersprungen)"
        print(f"{name+':':<12}{repos[name]['pfad']}  -> {zustand}")

    if not repos["masterplan"]["vorhanden"] and not args.ohne_masterplan:
        sys.exit(
            f"\nABBRUCH: waxcelerate-masterplan nicht gefunden "
            f"(gesucht u.a. in {repos['masterplan']['pfad']}).\n"
            f"        Darin stecken MASTERPLAN.md und die P-Pfade -- die "
            f"Geschaeftsdiagnose\n"
            f"        (Wachs-Einbruch, DB1-Erosion), an der das Modell jedes Feature "
            f"messen soll.\n"
            f"        Ohne sie wird ohne Maszstab geplant.\n\n"
            f"        Pfad angeben:  --masterplan <pfad>\n"
            f"        Oder holen:    git clone https://github.com/LDCTeichmann/"
            f"waxcelerate-masterplan\n"
            f"        Bewusst ohne:  --ohne-masterplan")

    if hub_ref != "WORKTREE" and git_leise(hub, "rev-parse", "--verify", hub_ref) is None:
        sys.exit(f"\nFEHLER: Ref '{hub_ref}' existiert nicht in {hub}.\n"
                 f"        Holen mit: git -C '{hub}' fetch --depth=200 origin {hub_ref}")

    stuecke: list[tuple[str, str]] = []
    fehlend: list[str] = []
    geheimnisse: list[str] = []
    erwartet: list[str] = []
    erwartet_ausgelassen: list[str] = []
    tok_gesamt = 0

    for teil in manifest["teile"]:
        if args.nur_doku and teil["id"] in ("B", "C"):
            # Der Quelltext bleibt draussen; Teil D9/D8 nennen jede Definition
            # mit Zeilennummer, damit der Agent gezielt nachlesen kann.
            erwartet_ausgelassen.extend(e["pfad"] for e in teil["dateien"])
            print(f"\nTeil {teil['id']} uebersprungen (--nur-doku): {teil['titel']}")
            continue
        kopf = [TRENNER, f"TEIL {teil['id']} · {teil['titel']}", TRENNER]
        if teil.get("hinweis"):
            kopf.append(teil["hinweis"])
        stuecke.append((f"(Kopf Teil {teil['id']})", "\n".join(kopf) + "\n"))
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

            tok = schaetzung(text, Path(pfad).suffix)
            teil_tok += tok
            erwartet.append(pfad)
            stuecke.append((pfad,
                            f"\n{TRENNER}\nDATEI: {pfad}   "
                            f"[{repo_name} @ {ref}, {len(text.encode('utf-8'))} B, "
                            f"~{tok} Token]\n{TRENNER}\n{text.rstrip()}\n"))

        print(f"\nTeil {teil['id']}: {teil['titel']} -> ~{teil_tok} Token")
        tok_gesamt += teil_tok

    # Teil D als eigener, geschlossener Baustein -- er wird zuerst gelesen.
    d_stuecke = [TRENNER, "TEIL D · Vorbereitetes Material (generiert)", TRENNER,
                 "Diese Abschnitte hat build_kontext.py erzeugt, damit du sie nicht "
                 "aus dem Code herleiten musst.", ""]
    d_tok = 0
    for titel, inhalt in teil_d_bauen(hub, hub_ref, args.basis, manifest):
        tok = schaetzung(inhalt, ".md")
        d_tok += tok
        d_stuecke.append(f"\n{TRENNER}\n{titel}   [~{tok} Token]\n{TRENNER}\n{inhalt.rstrip()}\n")
    print(f"\nTeil D: generiertes Material -> ~{d_tok} Token")
    tok_gesamt += d_tok

    if fehlend:
        print("\n!! NICHT GEFUNDEN (Manifest gegen Ref pruefen):")
        for f in fehlend:
            print(f"   - {f}")
    if geheimnisse:
        print("\n!! GEHEIMNIS-VERDACHT -- nicht an ein Modell geben, bevor das geklaert ist:")
        for g in geheimnisse:
            print(f"   - {g}")

    bausteine = bausteine_schneiden(stuecke, args.zeilen)
    print(f"\nSumme Offline-Schaetzung: ~{tok_gesamt} Token "
          f"(~${tok_gesamt/1_000_000*10:.2f} Input bei 10 $/MTok)")
    print(f"Bausteine: {len(bausteine)} plus teil_d.md -> {len(bausteine)+1} Lesevorgaenge")

    if args.check:
        print("\n--check: nichts geschrieben.")
        return 1 if (fehlend or geheimnisse) else 0
    if geheimnisse:
        sys.exit("\nAbbruch: Geheimnis-Verdacht. Datei aus manifest.json entfernen "
                 "oder das Geheimnis aus dem Repo raeumen, dann erneut bauen.")

    ziel = Path(args.out)
    ziel.mkdir(parents=True, exist_ok=True)
    for alt in ziel.glob("*.txt"):
        alt.unlink()

    karte = ["# Lesekarte -- in dieser Reihenfolge lesen",
             "",
             f"Stand: {hub} @ {hub_ref}. Erzeugt von build_kontext.py.",
             "",
             "**Ein `Read` je Zeile, mit dem angegebenen `limit`.** Jeder zusaetzliche",
             "Turn kostet Geld, weil der gewachsene Kontext erneut abgerechnet wird.",
             "Kommt ein Read gekuerzt zurueck, mit `offset` weiterlesen, nicht neu schneiden.",
             "",
             "| # | Datei | Zeilen | Read-limit | Inhalt |",
             "|---|---|---:|---:|---|"]

    d_text = "\n".join(d_stuecke)
    (ziel / "teil_d.md").write_text(d_text, encoding="utf-8")
    d_zeilen = d_text.count("\n") + 1
    def anzeigen(pfad: Path) -> str:
        """Absolut, oder relativ zur Basis -- je nachdem, wo gelesen wird."""
        if args.pfad_basis:
            try:
                return str(pfad.resolve().relative_to(Path(args.pfad_basis).resolve()))
            except ValueError:
                pass
        return str(pfad.resolve())

    karte.append(f"| 1 | `{anzeigen(ziel / 'teil_d.md')}` | {d_zeilen} | {d_zeilen + 200} | "
                 f"Dateibaum, DB-Schema, Routen, Tests, die 69 ungemergten Commits, "
                 f"Rechtslage, UI-Landkarte |")

    geschrieben = []
    for nr, (text, inhalt) in enumerate(bausteine, start=1):
        name = f"{nr:02d}_baustein.txt"
        (ziel / name).write_text(text, encoding="utf-8")
        n = text.count("\n") + 1
        geschrieben.append((name, n, inhalt))
        kurz = ", ".join(i for i in inhalt if not i.startswith("(Kopf")) or "Abschnittskopf"
        if len(kurz) > 88:
            kurz = kurz[:85] + "..."
        karte.append(f"| {nr+1} | `{anzeigen(ziel / name)}` | {n} | {n + 200} | {kurz} |")

    karte += ["",
              f"Zusammen ~{tok_gesamt} Token in {len(bausteine)+1} Lesevorgaengen.",
              "",
              "Was NICHT im Kontext ist, steht in teil_d.md unter D7 (Zeile 1 oben). Der Dateibaum",
              "unter D1 zeigt das ganze Repo -- was dort steht und hier fehlt, hast du",
              "nicht gesehen. Rate darueber nicht, frag in T12."]
    (ziel / "00_LESEKARTE.md").write_text("\n".join(karte) + "\n", encoding="utf-8")

    # Vollstaendigkeitsprobe: jede Manifest-Datei muss in genau einem Baustein stecken.
    alle = "\n".join(text for text, _ in bausteine)
    verloren = [p_ for p_ in erwartet if f"DATEI: {p_}   [" not in alle]
    if verloren:
        print("\n!! BAUSTEINE UNVOLLSTAENDIG -- diese Dateien fehlen im Ergebnis:")
        for v in verloren:
            print(f"   - {v}")
        return 1

    print(f"\nGeschrieben nach {ziel}/")
    print(f"  00_LESEKARTE.md      die Leseanweisung")
    print(f"  teil_d.md            {d_zeilen} Zeilen")
    for name, n, _ in geschrieben:
        print(f"  {name}    {n} Zeilen")
    print(f"\nAlle {len(erwartet)} eingebetteten Manifest-Dateien sind in den Bausteinen.")
    if erwartet_ausgelassen:
        print(f"{len(erwartet_ausgelassen)} Quelltext-Dateien bewusst ausgelassen "
              f"(--nur-doku); sie stehen mit Zeilennummern in Teil D9/D8 und "
              f"liegen im Repo zum Nachlesen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
