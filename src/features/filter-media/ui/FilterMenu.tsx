'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface FilterOption {
  key: string;
  href: string;
  text: string;
  active: boolean;
}

/** A toolbar button ("Year: 2026") that opens a list of filter links. */
export function FilterMenu({ label, options }: { label: string; options: FilterOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((option) => option.active);
  const filtered = current !== undefined && current !== options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className='relative shrink-0'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm transition',
          filtered ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-line-strong',
        )}>
        <span className='text-muted'>{label}</span>
        <span className='max-w-40 truncate font-semibold'>{current?.text ?? options[0]?.text}</span>
        <ChevronDown className={cn('text-muted size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul
          id={listId}
          className='animate-pop border-line bg-surface shadow-card absolute top-full left-0 z-30 mt-2 max-h-80 w-64 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl'>
          {options.map((option) => (
            <li key={option.key}>
              <Link
                href={option.href}
                scroll={false}
                aria-current={option.active ? 'true' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                  option.active ? 'bg-primary-soft text-link font-semibold' : 'hover:bg-subtle',
                )}>
                <span className='truncate'>{option.text}</span>
                {option.active && <Check className='size-4 shrink-0' />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
