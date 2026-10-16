import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addDays,
  addMonths,
  monthGrid,
  parseIsoDate,
  shiftMonth,
  toIsoDate,
  weekdayLabels,
} from './calendar';

test('parses real dates only', () => {
  assert.deepEqual(parseIsoDate('2026-03-21'), { year: 2026, month: 2, day: 21 });
  assert.equal(parseIsoDate('2026-02-31'), null);
  assert.equal(parseIsoDate('21/03/2026'), null);
  assert.equal(parseIsoDate(''), null);
});

test('formats with leading zeros', () => {
  assert.equal(toIsoDate(2026, 0, 5), '2026-01-05');
});

test('moves across month and year ends', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2024-03-01', -1), '2024-02-29');
  assert.deepEqual(shiftMonth({ year: 2026, month: 0 }, -1), { year: 2025, month: 11 });
  assert.deepEqual(shiftMonth({ year: 2026, month: 10 }, 14), { year: 2028, month: 0 });
});

test('keeps the day when stepping by months, unless the month is shorter', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2026-05-15', -12), '2025-05-15');
});

test('lays a month out in six full weeks', () => {
  const november = monthGrid({ year: 2026, month: 10 }, 1);
  assert.equal(november.length, 42);
  // 1 November 2026 is a Sunday, so a Monday-first grid starts on 26 October.
  assert.equal(november[0].iso, '2026-10-26');
  assert.equal(november[0].inMonth, false);
  assert.equal(november[6].iso, '2026-11-01');
  assert.equal(november.filter((day) => day.inMonth).length, 30);
});

test('starts the week where it is told to', () => {
  assert.equal(monthGrid({ year: 2026, month: 10 }, 0)[0].iso, '2026-11-01');
  assert.equal(monthGrid({ year: 2026, month: 10 }, 6)[0].iso, '2026-10-31');
  assert.deepEqual(
    weekdayLabels(6).map((day) => day.short),
    ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
  );
});
