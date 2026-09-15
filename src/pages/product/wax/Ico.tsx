// Linien-Icons der Wachsseite. Eigene Pfade statt lucide, wo die Form etwas
// Fachliches zeigt (Kettenwetter, Gelaende, Topf); sonst lucide im Aufrufer.
const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.1a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM17 19.1a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z',
  calendar: 'M5.5 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3.5 10h17M8 3v4M16 3v4',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 11.9a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
  shield: 'M12 3l7 3v5c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6zM8.5 12l2.3 2.3L15.5 9.6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5V4a1.5 1.5 0 0 1 3 0v7.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.6 0-4.2-1.3-5.6-3.4L3.6 14.8a1.5 1.5 0 0 1 2.5-1.6L8 15',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1',
  shieldPlain: 'M12 3l7 3v5c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  cloud: 'M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z',
  rain: 'M7 15h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7zM8 18l-1 3M12 18l-1 3M16 18l-1 3',
  road: 'M9 3L5 21M15 3l4 18M12 5v2M12 11v2M12 17v2',
  gravel: 'M3 18c3-1 5-6 9-6s6 5 9 6M8 19h.01M15 19.5h.01',
  mtb: 'M2 19l6-10 4 6 3-4 7 8z',
} as const;

export type IcoName = keyof typeof PATHS;

// "Was sich fuer dich aendert" (Wachsseite + Startseite), Reihenfolge wie
// i18n whyWax.points: sauber, Gelenk, Antrieb, Pflege.
export const CHANGE_ICONS: IcoName[] = ['hand', 'gear', 'shieldPlain', 'calendar'];

export function Ico({ name, className = 'wxp-ico', style }: { name: IcoName; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
