// ── Was das für dich heißt: die Wissenschaftsseite rechnet mit ─────────────
//
// ACT III zeigte bisher nur Laborzahlen Dritter (FrictionBars, TransferFilm):
// so misst ein Labor den Unterschied, nie so wirkt er sich bei DIR aus. Genau
// dieses Muster, Fahrprofil rein und persönliche Zahl raus, existiert schon auf
// der Produktseite (SizingInstrument) und in den Rechnern. useToolProfile() ist
// bewusst geteilter State: wer auf einer Produktseite oder einem Rechner schon
// ein Profil eingestellt hat, sieht hier dieselben Werte.
//
// Ein Kostenmodell pro Seite (wie Produktseite, Etappe 5): die frühere
// statische €-Kachel im Reibungs-Panel darüber ist deshalb weg. drivetrainCosts()
// rechnet produktunabhängig (Referenzwachs wax-500, Median-Kettenpreis), also
// dieselbe Rechnung wie auf der Produktseite, kein zweiter Rechenweg.

import { useToolProfile } from '@/hooks/useToolProfile';
import { drivetrainCosts } from '@/lib/waxMath';
import { useLanguage } from '@/hooks/useLanguage';
import { InstrumentFrame } from '@/components/viz';
import { ProfileBar } from '@/components/tools/ProfileBar';
import { AssumptionsDisclosure } from '@/components/tools/AssumptionsDisclosure';

/** Eine Kennzahl unter einer Haarlinie. Kein Kasten, kein Icon (DESIGN.md §3),
 *  wie SizingInstrument.tsx: nur die Ersparnis trägt die Akzentfarbe. */
function Readout({ value, label, note, accent, className = '' }: {
  value: string; label: string; note?: string; accent?: boolean; className?: string;
}) {
  return (
    <div className={`py-4 pr-4 ${className}`} style={{ borderTop: '1px solid var(--bd)' }}>
      <p className="font-display font-bold leading-[1.05] tracking-[-0.02em]"
        style={{ fontSize: 'clamp(1.35rem, 2.6vw, 1.75rem)', color: accent ? 'var(--accent)' : 'var(--tx1)' }}>
        {value}
      </p>
      <p className="text-meta mt-1" style={{ color: 'var(--txff)' }}>{label}</p>
      {note && <p className="text-meta mt-0.5 leading-[1.4]" style={{ color: 'var(--txff)' }}>{note}</p>}
    </div>
  );
}

export function ProofInstrument({ de }: { de: boolean }) {
  const { t } = useLanguage();
  const profile = useToolProfile();

  const kmPerYear = profile.kmPerWeek * 52;
  const rewaxKm = profile.interval;
  const perYear = Math.max(1, Math.round(kmPerYear / rewaxKm));

  const costs = drivetrainCosts({ kmPerYear, rewaxKm, chains: 1 });
  const savings3y = costs.savingsPerYear * 3;
  const loc = de ? 'de-DE' : 'en-US';

  return (
    <InstrumentFrame eyebrow={de ? 'Für dein Fahren gerechnet' : 'Calculated for your riding'}>
      <h3 className="font-display text-[20px] sm:text-[24px] font-bold tracking-[-0.02em] mb-1"
        style={{ color: 'var(--tx1)' }}>
        {de ? 'Was das für dich heißt' : 'What this means for you'}
      </h3>
      <p className="text-small mb-5" style={{ color: 'var(--txm)' }}>
        {de
          ? 'Die Laborwerte oben gelten für jede Kette. Hier rechnet die Seite mit deinem Fahrprofil.'
          : 'The lab values above apply to every chain. Here the page calculates with your riding profile.'}
      </p>

      <ProfileBar profile={profile} />

      {/* Mobil 2 Spalten: die Ersparnis über die volle Breite, Intervall und
          Wachsgänge darunter nebeneinander, statt drei gestapelter Zeilen. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 mt-4">
        <Readout
          accent
          className="col-span-2 sm:col-span-1"
          value={`€${savings3y.toLocaleString(loc)}`}
          label={t.tools.shared.savedOver3y}
          note={t.tools.shared.savedPerYearNote
            .replace('{eur}', costs.savingsPerYear.toLocaleString(loc))
            .replace('{pct}', String(costs.savingsPct))} />
        <Readout
          value={`${rewaxKm} km`}
          label={de ? 'Dein Wachsintervall' : 'Your waxing interval'} />
        <Readout
          value={`${perYear}×`}
          label={de ? 'Wachsgänge pro Jahr' : 'Waxings per year'} />
      </div>

      <div className="mt-5">
        <AssumptionsDisclosure breakdown={costs.breakdown} oilPerYear={costs.oilPerYear} waxPerYear={costs.waxPerYear} />
      </div>
    </InstrumentFrame>
  );
}
