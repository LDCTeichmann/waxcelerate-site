# Strava & andere Apps anbinden — Konzept

**Stand 2026-09-14. Nur Konzept, nichts gebaut.** Ziel: echte Fahrdaten statt
geschätzter Wochenkilometer im Intervall-Rechner und auf der Rewax-Seite
(„deine Kette ist seit dem letzten Wachsen X km gefahren — fällig").

## Was Strava liefern kann
- **Fahrleistung:** `GET /athletes/{id}/stats` — Summen der letzten 4 Wochen,
  des Jahres und gesamt (Rad-Distanz, Zeit, Anzahl). Daraus Wochenkilometer.
- **Räder mit Kilometerstand:** `GET /athlete` (mit `profile:read_all`) liefert
  die Bikes samt Gesamtdistanz. Merkt man sich beim Wachsen den Stand, ergibt
  die Differenz „km seit dem letzten Wachsen" — das stärkste Feature.
- **Wetter der Fahrten:** nicht direkt; über Datum + Ort ließe sich mit den
  DWD-Daten (siehe `api/weather.ts`) nass/trocken schätzen (braucht
  `activity:read` und ist deutlich mehr Aufwand).
- Endpunkte und Scopes vor dem Bau gegen developers.strava.com prüfen.

## Regeln, die man kennen muss
- **Neue Apps:** zuerst nur 1 Athlet (du selbst), bis 10 Nutzer ohne Prüfung;
  für mehr (bis 9.999) prüft Strava die App, laut Community 7–10 Werktage.
- **Datennutzung:** Daten eines Nutzers nur diesem Nutzer zeigen, nicht
  weitergeben, nicht für KI-Tools. Strava-Branding („Connect with Strava",
  „Powered by Strava") nach deren Brand Guidelines.
- **Rate-Limit:** 200 Anfragen / 15 min, 2.000 / Tag — reicht locker.

## Umsetzung (wenn gewünscht), ca. 1–2 Tage
1. Luca legt unter strava.com/settings/api eine App an (Name, Website
   `waxcelerate.de`, Callback-Domain `waxcelerate.de`) → Client-ID + Secret als
   Vercel-Umgebungsvariablen.
2. Vercel-Funktionen `api/strava/connect` (Weiterleitung zu Strava) und
   `api/strava/callback` (Code gegen Token tauschen, Stats + Bikes lesen).
3. **Ohne Datenbank als Einmal-Import:** Callback liest die Werte, gibt sie an
   die Seite zurück (nur im Browser des Nutzers gespeichert), Token wird nicht
   aufbewahrt. Datenschutzarm, kein Konto nötig.
4. Im Intervall-Rechner und auf `/kette-wachsen-lassen`: Knopf „Mit Strava
   ausfüllen" → Wochenkilometer und Rad vorbelegt.
5. Datenschutzerklärung um Strava ergänzen.

## Andere Apps
| App | Möglich? | Einschätzung |
|---|---|---|
| Garmin Connect | nur über Garmin Connect Developer Program (Firmenantrag, Freigabe) | später, wenn Strava funktioniert |
| Komoot | keine offene API | nein |
| Apple Health / Google Fit | nur aus einer nativen App | nein |
| Wahoo / Zwift | eigene Partnerprogramme | nein |
| Kalender (.ics) | existiert schon im Intervall-Rechner | bereits da |

**Empfehlung:** Strava-Einmal-Import als erstes. Deckt den Großteil der
Radfahrer ab und braucht keine Datenbank.
