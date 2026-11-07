'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { plural, t } from '@i18n';
import type { EventDto } from '@/entities/event';
import type { Visibility } from '@/entities/media';
import { Button } from '@/shared/ui/Button';
import { FloatingBar } from '@/shared/ui/FloatingBar';
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
  // Keep the last number on screen while the bar sinks out.
  const [shown, setShown] = useState(count);
  if (count > 0 && count !== shown) setShown(count);
  return (
    <FloatingBar open={count > 0}>
      <span className='text-fg text-sm font-medium tabular-nums'>
        {plural('media.selection.count', shown)}
      </span>
      {canChangeVisibility && (
        <>
          <Button size='sm' variant='secondary' disabled={busy} onClick={() => onVisibility('public')}>
            {t('media.selection.makePublic')}
          </Button>
          <Button size='sm' variant='secondary' disabled={busy} onClick={() => onVisibility('private')}>
            {t('media.selection.makePrivate')}
          </Button>
        </>
      )}
      <Select
        label={t('media.selection.moveLabel')}
        size='sm'
        className='w-44'
        disabled={busy}
        value=''
        placeholder={t('media.selection.movePlaceholder')}
        options={[
          { value: NO_EVENT, label: t('media.selection.noEvent') },
          ...events.map((event) => ({ value: event.id, label: event.title })),
        ]}
        onChange={(eventId) => onMove(eventId === NO_EVENT ? null : eventId)}
      />
      <Button size='sm' variant='danger' disabled={busy} onClick={onDelete}>
        <Trash2 className='size-4' /> {t('media.delete.confirm')}
      </Button>
      <Button size='sm' variant='ghost' onClick={onClear}>
        {t('common.actions.clear')}
      </Button>
    </FloatingBar>
  );
}
