// ── Das gemeinsame Fahrprofil, sichtbar ueber allen Rechnern ────────────────
//
// Wetter, Gelaende und Wochenkilometer gelten fuer drei der sechs Rechner
// (Intervall, Umstieg, Ersparnis). Frueher standen die drei Bediengruppen am
// Desktop dauerhaft offen — rund 130 px Chrom ueber jeder Karte, bei der Haelfte
// der Rechner ungenutzt. Jetzt ist die Leiste ueberall eine schlanke
// Zusammenfassungszeile, die auf Klick die Regler ausklappt (wie vorher schon
// am Handy). Standard: eingeklappt. Das haelt die Einheit Profilleiste + Karte
// + Reiter auf einem Screen.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { Weather, Terrain } from '@/lib/ridingProfile';
import { TogButton, ChipRow, ToolSlider } from '@/components/tools/primitives';
import { StepField } from '@/components/tools/StepField';

export function ProfileBar({ profile, inactiveNote }: {
  profile: ToolProfileState;
  /** Gesetzt, wenn der gerade sichtbare Rechner das Profil nicht auswertet.
   *  Die Leiste bleibt dann als eine Zeile stehen und sagt, warum sich nichts
   *  tut — sie auszublenden wuerde bei jedem Kartenwechsel das Layout springen
   *  lassen. */
  inactiveNote?: string;
}) {
  const { t } = useLanguage();
  const { weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek } = profile;
  const [open, setOpen] = useState(false);

  const weatherOpts: { value: Weather; label: string }[] = [
    { value: 'trocken', label: t.tools.rewax.dry },
    { value: 'gemischt', label: t.tools.rewax.mixed },
    { value: 'nass', label: t.tools.rewax.wet },
  ];
  const terrainOpts: { value: Terrain; label: string }[] = [
    { value: 'strasse', label: t.tools.rewax.road },
    { value: 'gravel', label: t.tools.rewax.gravel },
    { value: 'mtb', label: t.tools.rewax.mtb },
  ];
  const summary = `${weatherOpts.find(o => o.value === weather)?.label} · ${terrainOpts.find(o => o.value === terrain)?.label} · ${kmPerWeek} km`;
  const collapsible = !inactiveNote;

  return (
    <div
      className="rounded-2xl px-4 py-2.5 sm:px-5 mb-4 transition-opacity duration-300"
      style={{
        background: 'var(--inset-bg)',
        // Kraeftigere Kante (--bd statt --bd2) + leiser Tiefen-Hint: die Leiste
        // liegt nur 8 Einheiten unter der Sektion, die Trennung muss von der
        // Linie kommen (DESIGN.md §1).
        border: '1px solid var(--bd)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <button
        type="button"
        onClick={collapsible ? () => setOpen(v => !v) : undefined}
        aria-expanded={collapsible ? open : undefined}
        disabled={!collapsible}
        className="w-full flex items-center gap-2.5 text-left disabled:cursor-default"
      >
        <span className="text-meta uppercase tracking-[0.1em] font-semibold flex-shrink-0" style={{ color: 'var(--tx2)' }}>
          {t.tools.profile.barTitle}
        </span>
        <span className="text-[13px] truncate min-w-0 flex-1" style={{ color: inactiveNote ? 'var(--txff)' : 'var(--tx2)' }}>
          {inactiveNote ?? summary}
        </span>
        {collapsible && (
          <ChevronDown
            className="h-4 w-4 flex-shrink-0 transition-transform"
            style={{ color: 'var(--brand)', transform: open ? 'rotate(180deg)' : undefined }}
          />
        )}
      </button>

      {/* Dieselben StepField-Bausteine wie in den Karten — die Profilleiste ist
          Schritt null, nicht ein Fremdkoerper mit eigenen Regeln. */}
      {collapsible && open && (
        <div className="grid gap-4 mt-4 sm:grid-cols-3 sm:gap-5">
          <StepField step={0} label={t.tools.rewax.weather} help={t.tools.profile.helpWeather}>
            <ChipRow>
              {weatherOpts.map(o => (
                <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </ChipRow>
          </StepField>

          <StepField step={0} label={t.tools.rewax.terrain} help={t.tools.profile.helpTerrain}>
            <ChipRow>
              {terrainOpts.map(o => (
                <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                  {o.label}
                </TogButton>
              ))}
            </ChipRow>
          </StepField>

          <StepField step={0} label={t.tools.rewax.kmPerWeek} value={`${kmPerWeek} km`} help={t.tools.profile.helpKm}>
            <ToolSlider
              value={kmPerWeek} onValueChange={setKmPerWeek}
              min={20} max={400} step={10}
              ariaLabel={t.tools.rewax.kmPerWeek}
            />
          </StepField>
        </div>
      )}
    </div>
  );
}
