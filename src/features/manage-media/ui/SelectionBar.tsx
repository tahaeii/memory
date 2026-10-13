'use client';

import { Trash2 } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { Visibility } from '@/entities/media';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';

interface SelectionBarProps {
  count: number;
  events: EventDto[];
  busy: boolean;
  /** Only staff with private access can change who sees an item. */
  canChangeVisibility: boolean;
  onVisibility: (visibility: Visibility) => void;
  onMove: (eventId: string | null) => void;
  onDelete: () => void;
  onClear: () => void;
}

/** Floating toolbar shown while items are selected in the admin library. */
export function SelectionBar({
  count,
  events,
  busy,
  canChangeVisibility,
  onVisibility,
  onMove,
  onDelete,
  onClear,
}: SelectionBarProps) {
  return (
    <div className='animate-rise-in border-line bg-glass fixed inset-x-3 bottom-4 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border p-2 pl-4 shadow-2xl shadow-black/20 backdrop-blur-xl'>
      <span className='text-fg text-sm font-medium'>{count} selected</span>
      {canChangeVisibility && (
        <>
          <Button size='sm' variant='secondary' disabled={busy} onClick={() => onVisibility('public')}>
            Make public
          </Button>
          <Button size='sm' variant='secondary' disabled={busy} onClick={() => onVisibility('private')}>
            Make private
          </Button>
        </>
      )}
      <Select
        aria-label='Move to event'
        containerClassName='w-44'
        className='h-9 text-sm'
        disabled={busy}
        value=''
        onChange={(event) => {
          if (event.target.value) onMove(event.target.value === 'none' ? null : event.target.value);
        }}>
        <option value=''>Move to event…</option>
        <option value='none'>No event</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </Select>
      <Button size='sm' variant='danger' disabled={busy} onClick={onDelete}>
        <Trash2 className='size-4' /> Delete
      </Button>
      <Button size='sm' variant='ghost' onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
