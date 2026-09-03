// ── Ein Fahrprofil fuer alle Rechner ────────────────────────────────────────
//
// Vorher lebte dieser Zustand als `useToolsProfile` privat in tools.tsx und war
// ausserhalb der Startseiten-Sektion nicht erreichbar. Mit eigenen
// Rechnerseiten muss er teilbar sein — hier liegt er, mit URL-Vorrang aus
// toolState.ts, damit ein Ergebnis-Link den Zustand exakt wiederherstellt.

import { useEffect, useState } from 'react';
import { saveRidingProfile, type Weather, type Terrain, type DriveSystem } from '@/lib/ridingProfile';
import { initialProfile, type ToolProfile } from '@/lib/toolState';
import { waxIntervals, type ChainSpeed } from '@/lib/waxMath';

/** Ueber ein halbes Jahr hinaus ist ein Rewax-Intervall keine Aussage mehr. */
export const MAX_REWAX_WEEKS = 26;

export function useToolProfile() {
  // Einmal beim Mount aufloesen: URL, sonst localStorage, sonst Vorgabe.
  const [seed] = useState<ToolProfile>(initialProfile);

  const [weather, setWeather] = useState<Weather>(seed.weather);
  const [terrain, setTerrain] = useState<Terrain>(seed.terrain);
  const [kmPerWeek, setKmPerWeek] = useState(seed.kmPerWeek);
  const [system, setSystem] = useState<DriveSystem | undefined>(seed.system);
  const [speed, setSpeed] = useState<ChainSpeed | undefined>(seed.speed);
  // Bewusst nicht persistiert: das Wachsdatum hat mit dem QR-Link (?w=) seine
  // eigene, einmalige Quelle. Gespeichert wuerde ein altes Datum Wochen spaeter
  // stillschweigend wieder auftauchen.
  const [lastWaxedDate, setLastWaxedDate] = useState<Date | null>(seed.lastWaxedDate);

  useEffect(() => {
    saveRidingProfile({ weather, terrain, kmPerWeek, system, speed });
  }, [weather, terrain, kmPerWeek, system, speed]);

  const interval = waxIntervals[weather][terrain];
  const rawWeeks = kmPerWeek > 0 ? Math.round(interval / kmPerWeek) : MAX_REWAX_WEEKS;
  // Nach unten auf eine Woche begrenzt. Wer 250 km die Woche im Nassen auf dem
  // MTB faehrt, kommt rechnerisch auf 120/250 = 0 Wochen — und „0 Wochen" ist
  // keine Antwort, sondern eine kaputte Anzeige. Die tatsaechliche Haerte des
  // Falls steht ohnehin in der km-je-Wachsung-Zeile daneben, und eine
  // Kalenderwiederholung mit Intervall 0 waere gar nicht darstellbar.
  const weeks = Math.min(Math.max(rawWeeks, 1), MAX_REWAX_WEEKS);

  return {
    weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek,
    system, setSystem, speed, setSpeed, lastWaxedDate, setLastWaxedDate,
    /** km je Wachsung aus Wetter × Gelaende. */
    interval,
    /** Intervall in Wochen, gedeckelt. */
    weeks,
    weeksCapped: rawWeeks > MAX_REWAX_WEEKS,
    /** Ungedeckelt — fuer Folgerechnungen, die den Deckel nicht wollen. */
    preciseWeeks: kmPerWeek > 0 ? interval / kmPerWeek : Infinity,
    snapshot: { weather, terrain, kmPerWeek, system, speed, lastWaxedDate } as ToolProfile,
  };
}

export type ToolProfileState = ReturnType<typeof useToolProfile>;
