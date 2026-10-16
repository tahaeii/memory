import type { KeyboardEvent } from 'react';
import type { CalendarDay } from '@/shared/lib/calendar';
import { cn } from '@/shared/lib/cn';
import { formatDay } from '@/shared/lib/format';

interface CalendarGridProps {
  days: CalendarDay[];
  weekdays: Array<{ short: string; long: string }>;
  /** The chosen date. */
  selected: string;
  /** The day the keyboard is on; the only one in the tab order. */
  cursor: string;
  today: string;
  onSelect: (iso: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/** Six weeks of day buttons under a row of weekday names. */
export function CalendarGrid({
  days,
  weekdays,
  selected,
  cursor,
  today,
  onSelect,
  onKeyDown,
}: CalendarGridProps) {
  return (
    <div role='grid' aria-label='Calendar' onKeyDown={onKeyDown}>
      <div role='row' className='grid grid-cols-7'>
        {weekdays.map((weekday) => (
          <span
            key={weekday.long}
            role='columnheader'
            aria-label={weekday.long}
            className='text-muted grid h-8 place-items-center text-xs font-medium'>
            {weekday.short}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-7'>
        {days.map((day) => {
          const isSelected = day.iso === selected;
          return (
            <button
              key={day.iso}
              type='button'
              role='gridcell'
              data-day={day.iso}
              tabIndex={day.iso === cursor ? 0 : -1}
              aria-selected={isSelected}
              aria-current={day.iso === today ? 'date' : undefined}
              aria-label={formatDay(day.iso)}
              onClick={() => onSelect(day.iso)}
              className={cn(
                'focus-visible:outline-primary relative grid aspect-square place-items-center rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-2',
                isSelected
                  ? 'bg-primary text-on-primary font-semibold'
                  : day.inMonth
                    ? 'hover:bg-subtle'
                    : 'text-faint hover:bg-subtle',
              )}>
              {day.day}
              {day.iso === today && !isSelected && (
                <span aria-hidden className='bg-primary absolute bottom-1 size-1 rounded-full' />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
