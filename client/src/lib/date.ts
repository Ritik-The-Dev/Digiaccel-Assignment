/**
 * Date helpers for the UI.
 *
 * Dates are plain calendar keys — "YYYY-MM-DD" — never `Date` timestamps held
 * in state, so week grouping can never shift because of the browser timezone.
 */

const pad = (value: number) => String(value).padStart(2, '0');

export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: string, amount: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

/** Monday of the week containing `key`. */
export function startOfWeek(key: string = dateKey()): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dateKey(date);
}

/** Sunday of the week containing `key`. */
export function endOfWeek(key: string = dateKey()): string {
  return addDays(startOfWeek(key), 6);
}

export function weekDays(weekStartKey: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStartKey, index));
}

export function diffInDays(from: string, to: string): number {
  const milliseconds = parseDateKey(to).getTime() - parseDateKey(from).getTime();
  return Math.round(milliseconds / 86_400_000);
}

export const isToday = (key: string) => key === dateKey();

export function formatDayAbbrev(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', { weekday: 'short' });
}

/** Two-digit day number, matching the design (09, 10, 11…). */
export function formatDayNumber(key: string): string {
  return pad(parseDateKey(key).getDate());
}

export function formatMonthYear(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** "Nov 3" */
export function formatShortDate(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "Monday, November 3" */
export function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** "Nov 3 – Nov 9" */
export function formatWeekRange(startKey: string, endKey: string): string {
  return `${formatShortDate(startKey)} – ${formatShortDate(endKey)}`;
}

/** ISO-8601 week number, used for the "Week 45" label. */
export function weekNumber(key: string): number {
  const date = parseDateKey(key);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  target.setDate(target.getDate() - ((target.getDay() + 6) % 7) + 3); // Thursday
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

/** "Today", "Tomorrow", "Yesterday" or "Wed, Nov 5". */
export function relativeDayLabel(key: string): string {
  const delta = diffInDays(dateKey(), key);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  return `${formatDayAbbrev(key)}, ${formatShortDate(key)}`;
}

/** "09:00" or "09:00–10:30" (compact, so it never wraps a task row) */
export function formatTimeRange(start: string, end?: string): string {
  return end ? `${start}–${end}` : start;
}

/** 0 → "24" for the native time input default. */
export const nowTime = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};
