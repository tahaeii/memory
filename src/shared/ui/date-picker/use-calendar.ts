'use client';

import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import {
  addDays,
  addMonths,
  monthGrid,
  parseIsoDate,
  todayIso,
  weekdayLabels,
  type YearMonth,
} from '@/shared/lib/calendar';

/** Monday first, as in the en-GB dates used across the app. */
const WEEK_STARTS_ON = 1;

const titleFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const monthOf = (iso: string): YearMonth => {
  const parts = parseIsoDate(iso) ?? parseIsoDate(todayIso())!;
  return { year: parts.year, month: parts.month };
};

/**
 * State of an open calendar: which month is shown and which day the keyboard is on.
 * The shown month always follows the keyboard day.
 */
export function useCalendar(value: string) {
  const [cursor, setCursor] = useState(() => (parseIsoDate(value) ? value : todayIso()));
  const view = monthOf(cursor);
  const { year, month } = view;

  const days = useMemo(() => monthGrid({ year, month }, WEEK_STARTS_ON), [year, month]);
  const weekdays = useMemo(() => weekdayLabels(WEEK_STARTS_ON), []);

  /** Called when the calendar opens: start from the chosen date, or from today. */
  const reset = useCallback((next: string) => setCursor(parseIsoDate(next) ? next : todayIso()), []);

  const moveMonths = useCallback((months: number) => setCursor((iso) => addMonths(iso, months)), []);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const moves: Record<string, (iso: string) => string> = {
      ArrowLeft: (iso) => addDays(iso, -1),
      ArrowRight: (iso) => addDays(iso, 1),
      ArrowUp: (iso) => addDays(iso, -7),
      ArrowDown: (iso) => addDays(iso, 7),
      PageUp: (iso) => addMonths(iso, event.shiftKey ? -12 : -1),
      PageDown: (iso) => addMonths(iso, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setCursor(move);
  }, []);

  return {
    cursor,
    setCursor,
    days,
    weekdays,
    title: titleFormat.format(new Date(Date.UTC(year, month, 1))),
    today: todayIso(),
    reset,
    moveMonths,
    onKeyDown,
  };
}
