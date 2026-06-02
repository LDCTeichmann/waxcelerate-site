import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns estimated delivery date string.
 * Logic: orders before 14:00 CET ship same day, otherwise next business day.
 * Add 1 business day for DHL delivery within Germany.
 * Skips weekends only (not public holidays — acceptable simplification).
 */
export function getEstimatedDelivery(lang: 'de' | 'en'): string {
  const now = new Date();

  // Get current hour in CET/CEST (Europe/Berlin handles DST automatically)
  const berlinHour = parseInt(
    new Intl.DateTimeFormat('de-DE', { hour: 'numeric', hour12: false, timeZone: 'Europe/Berlin' }).format(now),
    10
  );

  // Get full date parts in Berlin time
  const berlinDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  // en-CA gives YYYY-MM-DD format
  const berlinDate = new Date(berlinDateStr + 'T12:00:00'); // noon to avoid DST edge cases
  const berlinDay = berlinDate.getDay(); // 0=Sun, 6=Sat

  // Determine ship date
  const shipDate = new Date(berlinDate);

  if (berlinDay === 0 || berlinDay === 6) {
    // Weekend → ships Monday
    const daysUntilMonday = berlinDay === 6 ? 2 : 1;
    shipDate.setDate(shipDate.getDate() + daysUntilMonday);
  } else if (berlinHour >= 14) {
    // After 14:00 CET → ships next business day
    shipDate.setDate(shipDate.getDate() + 1);
    if (shipDate.getDay() === 6) shipDate.setDate(shipDate.getDate() + 2); // skip to Monday if Saturday
    if (shipDate.getDay() === 0) shipDate.setDate(shipDate.getDate() + 1); // skip Sunday
  }
  // else: ships today (berlinHour < 14 on a weekday)

  // Delivery = ship date + 1 business day
  const deliveryDate = new Date(shipDate);
  deliveryDate.setDate(deliveryDate.getDate() + 1);
  if (deliveryDate.getDay() === 6) deliveryDate.setDate(deliveryDate.getDate() + 2);
  if (deliveryDate.getDay() === 0) deliveryDate.setDate(deliveryDate.getDate() + 1);

  // Format
  const locale = lang === 'de' ? 'de-DE' : 'en-GB';
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC', // deliveryDate is already in UTC-equivalent after our date math
  }).format(deliveryDate);

  return formatted; // e.g. "Mo., 2. Jun." or "Mon, 2 Jun"
}
