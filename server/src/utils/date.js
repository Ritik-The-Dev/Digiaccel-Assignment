/**
 * Date helpers.
 *
 * A "date key" is a plain calendar string in `YYYY-MM-DD` form (e.g. "2026-11-03").
 * We store task dates like this on purpose: a to-do is tied to a *calendar day*,
 * not to an instant in time. Using strings avoids the classic bug where a task
 * created late at night jumps one day forward for users in another timezone.
 *
 * Weeks run Monday → Sunday.
 */

export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const pad = (n) => String(n).padStart(2, '0');

/** Local Date → "YYYY-MM-DD" */
export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" → local Date at 00:00 */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key, amount) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

/** Monday of the week that contains `key`. */
export function startOfWeek(key = toDateKey()) {
  const date = parseDateKey(key);
  const mondayOffset = (date.getDay() + 6) % 7; // Sunday(0) → 6, Monday(1) → 0
  date.setDate(date.getDate() - mondayOffset);
  return toDateKey(date);
}

/** Sunday of the week that contains `key`. */
export function endOfWeek(key = toDateKey()) {
  return addDays(startOfWeek(key), 6);
}

export function isRealDateKey(key) {
  if (!DATE_KEY_RE.test(key)) return false;
  const date = parseDateKey(key);
  return toDateKey(date) === key; // rejects 2026-02-31 etc.
}

export function isValidTime(value) {
  return TIME_RE.test(value);
}
