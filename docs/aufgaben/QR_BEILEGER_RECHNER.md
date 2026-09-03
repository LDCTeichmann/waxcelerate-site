# QR-Beileger: Rewax-Termin im Paket

**Für Luca. Der Code ist fertig, es fehlt nur der gedruckte Beileger.**

## Was schon funktioniert

`/rechner/intervall?w=JJJJMMTT` öffnet den Intervall-Rechner mit dem Wachsdatum
vorbelegt. Der Rechner zeigt dann sofort:

- das Intervall in Wochen für das gespeicherte oder eingestellte Fahrprofil
- das konkrete Datum des nächsten Waxens (oder „überfällig", falls schon vorbei)
- drei Knöpfe: **In Google Kalender**, **Als .ics laden**, **Link kopieren**

Der Google-Kalender-Eintrag wird als Serie angelegt (alle n Wochen), das .ics
enthält eine Erinnerung einen Tag vorher. Beides ohne Anmeldung, ohne dass
irgendwelche Daten den Browser des Kunden verlassen.

## Was zu drucken ist

Ein QR-Code je Versandtag auf die URL:

```
https://waxcelerate.de/rechner/intervall?w=20260902
```

`20260902` = das Datum, an dem die Kette gewachst wurde, als JJJJMMTT.
`JJJJ-MM-TT` wird auch akzeptiert.

Vorschlag für den Text daneben:

> **Gewachst am 02.09.2026.**
> Code scannen — du siehst, wann die Kette wieder dran ist,
> und kannst dir den Termin direkt in den Kalender legen.

## Praktisch

- Ein Code je Wachscharge reicht, nicht je Paket. Wer an einem Tag zehn Ketten
  wachst, druckt einen Beileger zehnmal.
- Daten, die in der Zukunft oder vor 2020 liegen, werden vom Rechner still
  verworfen — ein Tippfehler im Datum führt also nie zu einer falschen Angabe,
  sondern zum normalen Rechner ohne Vorbelegung.
- Alte Beileger, die noch auf `waxcelerate.de/?w=...` zeigen, funktionieren
  weiter: die Startseite springt in dem Fall zur Rechner-Sektion.
