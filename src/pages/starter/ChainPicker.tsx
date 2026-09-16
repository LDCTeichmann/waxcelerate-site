// ─── Kettenwähler in der Set-Kaufbox ────────────────────────────────────────
// Zwei Filter (Antrieb, Gänge) und eine ruhige Liste. Die Filter kommen aus
// dem seitenweiten Fahrprofil (wx-riding-profile, gefüllt von Rechnern und
// Hero-Urteil) und schreiben Änderungen dorthin zurück. Ohne Profil ist
// nichts vorausgewählt. Direkt gelesen statt über useToolProfile, weil der
// Hook beim ersten Rendern ein Standardprofil speichert — dann wüssten wir
// nicht mehr, ob jemand wirklich schon etwas angegeben hat.
//
// Filterlogik wie auf /ketten (KettenPage.tsx): Gangzahl über chainSpeed,
// Antrieb über compatibilityMatrix.

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { loadRidingProfile, saveRidingProfile, type DriveSystem } from '@/lib/ridingProfile';
import { DEFAULT_PROFILE } from '@/lib/toolState';
import type { ChainSpeed } from '@/lib/waxMath';
import { eur, shortChainName } from '@/pages/starter/content';
import { chainsFor, asFilterSpeed, type FilterSpeed as Speed } from '@/pages/starter/chainFilter';

const SYSTEMS: { v: DriveSystem; label: string }[] = [
  { v: 'shimano', label: 'Shimano' },
  { v: 'sram', label: 'SRAM' },
  { v: 'campagnolo', label: 'Campagnolo' },
];
const SPEEDS: Speed[] = [9, 11, 12];
const VISIBLE = 4;

function persist(system: DriveSystem | undefined, speed: ChainSpeed | undefined) {
  const base = loadRidingProfile() ?? DEFAULT_PROFILE;
  saveRidingProfile({ ...base, system, speed });
}

export function ChainPicker({ de, chainId, onChange }: {
  de: boolean; chainId: string; onChange: (id: string) => void;
}) {
  const [initial] = useState(() => (typeof window !== 'undefined' ? loadRidingProfile() : null));
  const fromProfile = !!(initial?.system || initial?.speed);
  const [system, setSystem] = useState<DriveSystem | undefined>(initial?.system);
  const [speed, setSpeed] = useState<Speed | undefined>(asFilterSpeed(initial?.speed));
  const [all, setAll] = useState(false);
  const [edited, setEdited] = useState(false);

  const list = useMemo(() => chainsFor(system, speed), [system, speed]);

  const pickSystem = (v: DriveSystem) => {
    const next = system === v ? undefined : v;
    setSystem(next); setEdited(true); persist(next, speed);
    reselect(next, speed);
  };
  const pickSpeed = (v: Speed) => {
    const next = speed === v ? undefined : v;
    setSpeed(next); setEdited(true); persist(system, next);
    reselect(system, next);
  };
  // Passt die gewählte Kette nicht mehr zum Filter, die erste passende nehmen.
  const reselect = (sys: DriveSystem | undefined, sp: Speed | undefined) => {
    const fitting = chainsFor(sys, sp);
    if (!fitting.some((p) => p.id === chainId) && fitting[0]) onChange(fitting[0].id);
  };

  const shown = all ? list : list.slice(0, VISIBLE);
  const recommended = list[0]?.id;

  return (
    <div className="wxs-picker">
      <p className="wxs-hint">
        {fromProfile && !edited
          ? (de ? 'Aus deinem Profil vorausgewählt · antippen zum Ändern' : 'Preselected from your profile · tap to change')
          : (de ? 'Antrieb und Gänge wählen, dann bleiben passende Ketten' : 'Pick drivetrain and gears to see fitting chains')}
      </p>
      <div className="wxs-filters">
        <div role="group" aria-label={de ? 'Antrieb' : 'Drivetrain'} className="wxs-chips">
          {SYSTEMS.map((s) => (
            <button key={s.v} type="button" aria-pressed={system === s.v} onClick={() => pickSystem(s.v)}>{s.label}</button>
          ))}
        </div>
        <div role="group" aria-label={de ? 'Gänge' : 'Gears'} className="wxs-chips">
          {SPEEDS.map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => pickSpeed(s)}>{s}-{de ? 'fach' : 'sp.'}</button>
          ))}
        </div>
      </div>

      <div role="radiogroup" aria-label={de ? 'Kette wählen' : 'Choose a chain'} className="wxs-chainlist">
        {shown.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={p.id === chainId} onClick={() => onChange(p.id)}>
            <img src={p.image.replace('.webp', '-thumb.webp')} alt="" aria-hidden loading="lazy" />
            <span className="nm">
              <b>{shortChainName(p)}</b>
              <span>
                {de ? p.chainSpeed : p.chainSpeed?.replace('-fach', '-speed')}
                {p.id === recommended && <em>{de ? 'Empfehlung' : 'Top pick'}</em>}
              </span>
            </span>
            <span className="pr num">{eur(p.price, de)}</span>
            <span className="ck" aria-hidden><Check className="h-3 w-3" strokeWidth={3} /></span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="wxs-empty">{de ? 'Keine Kette für diese Kombination.' : 'No chain for this combination.'}</p>
        )}
      </div>
      <div className="wxs-listfoot">
        {list.length > VISIBLE && (
          <button type="button" onClick={() => setAll((v) => !v)}>
            {all ? (de ? 'Weniger zeigen' : 'Show fewer') : (de ? `Alle ${list.length} zeigen` : `Show all ${list.length}`)}
          </button>
        )}
        <span>{de ? '10-fach folgt bald' : '10-speed coming soon'}</span>
      </div>
    </div>
  );
}
