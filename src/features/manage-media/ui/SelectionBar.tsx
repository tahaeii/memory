'use client';

import { Trash2 } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { Visibility } from '@/entities/media';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/select';

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

/** Option value that takes the selected items out of their event. */
const NO_EVENT = 'none';

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
        label='Move to event'
        size='sm'
        className='w-44'
        disabled={busy}
        value=''
        placeholder='Move to event…'
        options={[
          { value: NO_EVENT, label: 'No event' },
          ...events.map((event) => ({ value: event.id, label: event.title })),
        ]}
        onChange={(eventId) => onMove(eventId === NO_EVENT ? null : eventId)}
      />
      <Button size='sm' variant='danger' disabled={busy} onClick={onDelete}>
        <Trash2 className='size-4' /> Delete
      </Button>
      <Button size='sm' variant='ghost' onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
