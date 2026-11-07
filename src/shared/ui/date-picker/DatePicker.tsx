'use client';

import { useEffect, useId, useRef } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { t } from '@i18n';
import { parseIsoDate } from '@/shared/lib/calendar';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { usePopover } from '@/shared/lib/use-popover';
import { IconButton } from '../IconButton';
import { fieldStyles } from '../Input';
import { PopoverPanel } from '../Popover';
import { CalendarGrid } from './CalendarGrid';
import { useCalendar } from './use-calendar';

interface DatePickerProps {
  /** What the date is for: read by screen readers. */
  label: string;
  /** "YYYY-MM-DD", or an empty string while nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Offer a "Clear" button (for dates that may stay empty). */
  clearable?: boolean;
  className?: string;
}

/**
 * A date field with its own calendar, the same in every browser. Arrow keys move by day and week,
 * Page Up and Page Down by month (with Shift: by year), Enter chooses.
 */
export function DatePicker({
  label,
  value,
  onChange,
  placeholder = t('ui.datePicker.placeholder'),
  clearable = false,
  className,
}: DatePickerProps) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { rootRef, open, side, show, close: closePanel } = usePopover(380);
  const calendar = useCalendar(value);
  const { cursor } = calendar;
  const chosen = parseIsoDate(value) ? value : '';

  // Move focus to the keyboard day when the calendar opens and whenever that day changes.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[data-day="' + cursor + '"]')?.focus();
  }, [open, cursor]);

  const close = () => {
    closePanel();
    buttonRef.current?.focus();
  };

  const pick = (iso: string) => {
    onChange(iso);
    close();
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type='button'
        aria-label={label + (chosen ? ': ' + formatShortDate(chosen) : '')}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open) return closePanel();
          calendar.reset(value);
          show();
        }}
        className={cn(
          fieldStyles,
          'flex items-center gap-2.5 text-left',
          open && 'border-primary ring-primary/15 ring-4',
        )}>
        <CalendarDays aria-hidden className='text-muted size-4 shrink-0' />
        <span className={cn('min-w-0 flex-1 truncate tabular-nums', !chosen && 'text-faint')}>
          {chosen ? formatShortDate(chosen) : placeholder}
        </span>
      </button>

      <PopoverPanel
        ref={panelRef}
        id={panelId}
        role='dialog'
        aria-label={label}
        open={open}
        side={side}
        className='w-[min(19rem,calc(100vw-2rem))] p-3'>
        <div className='mb-1 flex items-center'>
          <IconButton
            size='sm'
            label={t('ui.datePicker.previousYear')}
            onClick={() => calendar.moveMonths(-12)}>
            <ChevronsLeft className='size-4' />
          </IconButton>
          <IconButton
            size='sm'
            label={t('ui.datePicker.previousMonth')}
            onClick={() => calendar.moveMonths(-1)}>
            <ChevronLeft className='size-4' />
          </IconButton>
          <p aria-live='polite' className='flex-1 text-center text-sm font-semibold'>
            {calendar.title}
          </p>
          <IconButton size='sm' label={t('ui.datePicker.nextMonth')} onClick={() => calendar.moveMonths(1)}>
            <ChevronRight className='size-4' />
          </IconButton>
          <IconButton size='sm' label={t('ui.datePicker.nextYear')} onClick={() => calendar.moveMonths(12)}>
            <ChevronsRight className='size-4' />
          </IconButton>
        </div>

        <CalendarGrid
          days={calendar.days}
          weekdays={calendar.weekdays}
          selected={chosen}
          cursor={cursor}
          today={calendar.today}
          onSelect={pick}
          onKeyDown={calendar.onKeyDown}
        />

        <div className='border-line-soft mt-2 flex items-center justify-between border-t pt-2'>
          <button
            type='button'
            onClick={() => pick(calendar.today)}
            className='text-link hover:bg-primary-soft rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors'>
            {t('common.actions.today')}
          </button>
          {clearable && chosen && (
            <button
              type='button'
              onClick={() => pick('')}
              className='text-muted hover:bg-subtle hover:text-fg rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors'>
              {t('common.actions.clear')}
            </button>
          )}
        </div>
      </PopoverPanel>
    </div>
  );
}
