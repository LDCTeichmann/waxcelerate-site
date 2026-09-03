// ── Das gemeinsame Fahrprofil, sichtbar ueber allen Rechnern ────────────────
//
// Vorher steckten Wetter, Gelaende und Wochenkilometer in Karte 1, und die
// Karten 2 und 3 zeigten nur eine kleine Pille „trocken · Strasse · 100 km" mit
// einem Link zurueck. Wer auf Karte 3 stand, sah eine Zahl, die sich aus
// Eingaben ergab, die er nicht sehen konnte — das war die groesste einzelne
// Verstaendnisluecke der ganzen Sektion.
//
// Jetzt steht das Profil einmal ueber dem Stapel. Jede Karte fragt darunter nur
// noch das, was wirklich nur sie braucht. ProfileReadout und der
// „zurueckspringen"-Link sind damit ersatzlos entfallen.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ToolProfileState } from '@/hooks/useToolProfile';
import type { Weather, Terrain } from '@/lib/ridingProfile';
import { FieldLabel, TogButton, DistanceSlider } from '@/components/tools/primitives';

export function ProfileBar({ profile }: { profile: ToolProfileState }) {
  const { t } = useLanguage();
  const { weather, setWeather, terrain, setTerrain, kmPerWeek, setKmPerWeek } = profile;
  // Auf dem Handy eingeklappt. Ausgeklappt sind es drei gestapelte
  // Bediengruppen und damit rund 300 px, die den eigentlichen Rechner unter den
  // Falz schieben — genau das Gegenteil dessen, wofuer die Leiste da ist. Ab sm
  // liegen die drei Gruppen nebeneinander und passen ohnehin, dort gibt es den
  // Schalter deshalb gar nicht.
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

  return (
    <div
      className="rounded-2xl px-4 py-3.5 sm:px-6 sm:py-4 mb-5"
      style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-bd)' }}
    >
      <p className="hidden sm:block text-meta uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--txm)' }}>
        {t.tools.profile.barTitle}
      </p>

      {/* Zusammenfassung statt Bedienelemente, solange eingeklappt: sie sagt,
          womit gerechnet wird, ohne dafuer eine halbe Bildschirmhoehe zu
          verbrauchen. */}
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
          <span className="block text-[13px] truncate mt-0.5" style={{ color: 'var(--tx2)' }}>
            {weatherOpts.find(o => o.value === weather)?.label} · {terrainOpts.find(o => o.value === terrain)?.label} · {kmPerWeek} km
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 transition-transform"
          style={{ color: 'var(--brand)', transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      <div className={`${open ? 'grid mt-3' : 'hidden'} sm:grid gap-3 sm:gap-4 sm:grid-cols-3`}>
        <div>
          <FieldLabel label={t.tools.rewax.weather} />
          <div className="flex flex-wrap gap-2">
            {weatherOpts.map(o => (
              <TogButton key={o.value} active={weather === o.value} onClick={() => setWeather(o.value)}>
                {o.label}
              </TogButton>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel label={t.tools.rewax.terrain} />
          <div className="flex flex-wrap gap-2">
            {terrainOpts.map(o => (
              <TogButton key={o.value} active={terrain === o.value} onClick={() => setTerrain(o.value)}>
                {o.label}
              </TogButton>
            ))}
          </div>
        </div>
        <div className="sm:self-end">
          <DistanceSlider
            label={t.tools.rewax.kmPerWeek}
            valueLabel={`${kmPerWeek} km`}
            value={kmPerWeek}
            onValueChange={setKmPerWeek}
            min={20} max={400} step={10}
            ariaLabel={t.tools.rewax.kmPerWeek}
          />
        </div>
      </div>
    </div>
  );
}
