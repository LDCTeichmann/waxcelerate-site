// ── Das gemeinsame Fahrprofil, sichtbar ueber allen Rechnern ────────────────
//
// Vorher steckten Wetter, Gelaende und Wochenkilometer in Karte 1, und die
// uebrigen Karten zeigten nur eine kleine Pille mit einem Link zurueck. Wer auf
// Karte 3 stand, sah eine Zahl, die sich aus Eingaben ergab, die er nicht sehen
// konnte — die groesste einzelne Verstaendnisluecke der Sektion.
//
// Auf dem Handy eingeklappt: ausgeklappt sind es drei Bediengruppen und damit
// rund 300 px, die den Rechner unter den Falz schieben. Ab sm liegen die drei
// nebeneinander und passen ohnehin.

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
   *  Die Leiste bleibt dann stehen — sie auszublenden wuerde bei jedem
   *  Kartenwechsel das halbe Layout springen lassen —, wird aber sichtbar
   *  zurueckgenommen und sagt, warum sich nichts tut. */
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

  return (
    <div
      className="rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-4 transition-opacity duration-300"
      style={{
        background: 'var(--inset-bg)',
        border: '1px solid var(--inset-bd)',
        opacity: inactiveNote ? 0.5 : 1,
      }}
    >
      {/* Handy: Zusammenfassung statt Bedienelemente, solange eingeklappt. */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="sm:hidden w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-meta uppercase tracking-[0.1em] font-medium" style={{ color: 'var(--txm)' }}>
            {t.tools.profile.barTitle}
          </span>
          <span className="block text-[13px] truncate mt-0.5" style={{ color: 'var(--tx2)' }}>{summary}</span>
        </span>
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 transition-transform"
          style={{ color: 'var(--brand)', transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      <div className="hidden sm:flex items-baseline gap-2 mb-3">
        <span className="text-meta uppercase tracking-[0.1em] font-medium" style={{ color: 'var(--txm)' }}>
          {t.tools.profile.barTitle}
        </span>
        <span className="text-meta" style={{ color: 'var(--txff)' }}>
          {inactiveNote ?? t.tools.profile.barHint}
        </span>
      </div>

      {/* Dieselben StepField-Bausteine wie in den Karten — die Profilleiste ist
          Schritt null, nicht ein Fremdkoerper mit eigenen Regeln. */}
      <div className={`${open ? 'grid mt-3' : 'hidden'} sm:grid gap-3 sm:gap-5 sm:grid-cols-3`}>
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
    </div>
  );
}
