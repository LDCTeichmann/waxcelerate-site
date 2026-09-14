import { useEffect, useState } from 'react';
import { dispatchStatus } from '@/lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

// Live-Versandzeile ("Heute versandt, wenn du bis 15 Uhr bestellst."). Aus
// WaxHero herausgeloest, weil Kettenseite und Topbar denselben Satz zeigen.
// Aktualisiert sich minuetlich.
export function useDispatchLine(de: boolean) {
  const [st, setSt] = useState(() => dispatchStatus());
  useEffect(() => {
    const id = window.setInterval(() => setSt(dispatchStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const weekdays = de
    ? ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (st.shipsToday && st.minutesLeft > 4 * 60) {
    // Morgens ist ein Countdown ueber zehn Stunden eher Rauschen als Anreiz.
    return de
      ? <><b>Heute versandt,</b> wenn du bis 15 Uhr bestellst.</>
      : <><b>Ships today</b> if you order by 3 pm.</>;
  }
  if (st.shipsToday) {
    const h = Math.floor(st.minutesLeft / 60), m = st.minutesLeft % 60;
    const left = h > 0 ? `${h} Std ${pad(m)} Min` : `${m} Min`;
    return de
      ? <><b>Heute versandt,</b> wenn du in den nächsten {left} bestellst.</>
      : <><b>Ships today</b> if you order within {h > 0 ? `${h} h ${pad(m)} min` : `${m} min`}.</>;
  }
  const todayIdx = new Date().getDay();
  const tomorrow = (todayIdx + 1) % 7 === st.shipWeekday;
  return de
    ? <><b>{tomorrow ? 'Morgen' : `Am ${weekdays[st.shipWeekday]}`} versandt.</b> Versandschluss ist werktags 15 Uhr.</>
    : <><b>Ships {tomorrow ? 'tomorrow' : `on ${weekdays[st.shipWeekday]}`}.</b> Weekday cut-off is 3 pm.</>;
}
