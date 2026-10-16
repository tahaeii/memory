/**
 * Calendar maths for the date picker. Dates are plain "YYYY-MM-DD" strings with no time zone,
 * the same form the API stores, so a day never shifts when the browser is in another zone.
 */
export interface CalendarDay {
  /** "YYYY-MM-DD" */
  iso: string;
  day: number;
  /** False for the leading and trailing days that belong to the neighbouring months. */
  inMonth: boolean;
}

export interface YearMonth {
  year: number;
  /** 0 (January) to 11 (December). */
  month: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (year: number, month: number, day: number): string =>
  year + '-' + pad(month + 1) + '-' + pad(day);

const fromUtc = (date: Date): string =>
  toIsoDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

/** The parts of a valid "YYYY-MM-DD" date, or null (also for dates like 2026-02-31). */
export function parseIsoDate(value: string): (YearMonth & { day: number }) | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(Date.UTC(year, month, day));
  const real = date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day;
  return real ? { year, month, day } : null;
}

/** Today in the visitor's own time zone. */
export function todayIso(now = new Date()): string {
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(iso: string, days: number): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  return fromUtc(new Date(Date.UTC(parts.year, parts.month, parts.day + days)));
}

/** Moves by whole months and keeps the day when the target month has it (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(iso: string, months: number): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const target = shiftMonth(parts, months);
  const lastDay = new Date(Date.UTC(target.year, target.month + 1, 0)).getUTCDate();
  return toIsoDate(target.year, target.month, Math.min(parts.day, lastDay));
}

export function shiftMonth({ year, month }: YearMonth, months: number): YearMonth {
  const index = year * 12 + month + months;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

/**
 * The six weeks shown for a month, always 42 days so the grid never changes height.
 * `weekStartsOn` is 0 for Sunday, 1 for Monday, 6 for Saturday.
 */
export function monthGrid({ year, month }: YearMonth, weekStartsOn = 1): CalendarDay[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() - weekStartsOn + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, month, 1 - lead + index));
    return { iso: fromUtc(date), day: date.getUTCDate(), inMonth: date.getUTCMonth() === month };
  });
}

/** Two-letter weekday names in display order, e.g. Mo Tu We Th Fr Sa Su. */
export function weekdayLabels(weekStartsOn = 1, locale = 'en-GB'): Array<{ short: string; long: string }> {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  // 4 January 1970 was a Sunday.
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(1970, 0, 4 + ((weekStartsOn + index) % 7)));
    return { short: short.format(date).slice(0, 2), long: long.format(date) };
  });
}
