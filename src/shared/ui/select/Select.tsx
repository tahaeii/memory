'use client';

import { useEffect, useId, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { usePopover } from '@/shared/lib/use-popover';
import { fieldStyles } from '../Input';
import { PopoverPanel } from '../Popover';
import { useListbox } from './use-listbox';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  /** A second, quieter line under the label. */
  hint?: string;
}

interface SelectProps<T extends string> {
  /** What is being chosen: read by screen readers. */
  label: string;
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
  /** Shown on the button when `value` matches no option. */
  placeholder?: string;
  /** A quiet caption before the value, e.g. "Year". */
  prefix?: string;
  size?: 'sm' | 'md';
  align?: 'start' | 'end';
  disabled?: boolean;
  className?: string;
}

/**
 * A select drawn by the app instead of the operating system, so it looks and moves the same
 * everywhere. Follows the ARIA "select-only combobox" pattern: focus stays on the button.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choose…',
  prefix,
  size = 'md',
  align = 'start',
  disabled,
  className,
}: SelectProps<T>) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const { rootRef, open, side, show, close: closePanel } = usePopover(Math.min(options.length, 7) * 40 + 24);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const choose = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    closePanel();
  };

  const listbox = useListbox({
    labels: options.map((option) => option.label),
    selectedIndex,
    open: open,
    onOpen: show,
    onClose: closePanel,
    onSelect: choose,
  });
  const { activeIndex } = listbox;

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        role='combobox'
        aria-label={label}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && activeIndex >= 0 ? listId + '-' + activeIndex : undefined}
        disabled={disabled}
        onClick={() => (open ? closePanel() : listbox.openList())}
        onKeyDown={listbox.onKeyDown}
        className={cn(
          fieldStyles,
          'flex items-center gap-2 text-left',
          size === 'sm' && 'h-9 px-3',
          open && 'border-primary ring-primary/15 ring-4',
        )}>
        {prefix && <span className='text-muted shrink-0'>{prefix}</span>}
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-muted', prefix && 'font-semibold')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className={cn('text-muted size-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <PopoverPanel
        open={open}
        side={side}
        align={align}
        className='max-w-[min(22rem,calc(100vw-2rem))] min-w-full p-1'>
        <ul ref={listRef} id={listId} role='listbox' aria-label={label} className='max-h-72 overflow-y-auto'>
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                id={listId + '-' + index}
                role='option'
                aria-selected={isSelected}
                onPointerMove={() => listbox.setActiveIndex(index)}
                onClick={() => choose(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm select-none',
                  index === activeIndex && 'bg-subtle',
                  isSelected && 'text-link font-semibold',
                )}>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate'>{option.label}</span>
                  {option.hint && (
                    <span className='text-muted block truncate text-xs font-normal'>{option.hint}</span>
                  )}
                </span>
                {isSelected && <Check aria-hidden className='animate-check size-4 shrink-0' />}
              </li>
            );
          })}
        </ul>
      </PopoverPanel>
    </div>
  );
}
