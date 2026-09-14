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
  // In Tagen, nicht in ganzen Wochen: auf Wochen gerundet wurden 150 km bei
  // 200 km/Woche zu „alle 1 Woche" = 200 km, ein Drittel ueber dem Intervall.
  // Untergrenze 3 Tage — oefter wachst niemand im Topf (Hybrid-Hinweis).
  const rawDays = kmPerWeek > 0 ? Math.round((interval / kmPerWeek) * 7) : MAX_REWAX_WEEKS * 7;
  const days = Math.min(Math.max(rawDays, 3), MAX_REWAX_WEEKS * 7);
  const weeks = Math.max(1, Math.round(days / 7));

  return {
    weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek,
    system, setSystem, speed, setSpeed, lastWaxedDate, setLastWaxedDate,
    /** km je Wachsung aus Wetter × Gelaende. */
    interval,
    /** Intervall in Tagen, 3 bis 182. Grundlage fuer Termin und Kalender. */
    days,
    /** Dasselbe gerundet in Wochen, nur fuer die Anzeige. */
    weeks,
    weeksCapped: rawDays > MAX_REWAX_WEEKS * 7,
    /** Ungedeckelt — fuer Folgerechnungen, die den Deckel nicht wollen. */
    preciseWeeks: kmPerWeek > 0 ? interval / kmPerWeek : Infinity,
    snapshot: { weather, terrain, kmPerWeek, system, speed, lastWaxedDate } as ToolProfile,
  };
}

export type ToolProfileState = ReturnType<typeof useToolProfile>;
