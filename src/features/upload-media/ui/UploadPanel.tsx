'use client';

import { useState } from 'react';
import type { EventDto } from '@/entities/event';
import type { Visibility } from '@/entities/media';
import { useSite } from '@/shared/config/site-context';
import { Field } from '@/shared/ui/Field';
import { Select } from '@/shared/ui/select';
import { useUploadQueue } from '../model/use-upload-queue';
import { AudiencePicker } from './AudiencePicker';
import { DropZone } from './DropZone';
import { UploadList } from './UploadList';

interface UploadPanelProps {
  events: EventDto[];
  /** Staff without private access can only add public items. */
  privateAccess: boolean;
  onFinished: () => void;
}

/** The uploader: who may see the files, which event they join, where to drop them and how far they are. */
export function UploadPanel({ events, privateAccess, onFinished }: UploadPanelProps) {
  const site = useSite();
  const [chosen, setChosen] = useState<Visibility>('public');
  const [eventId, setEventId] = useState('');
  const visibility: Visibility = privateAccess ? chosen : 'public';
  const queue = useUploadQueue({ visibility, eventId: eventId || null }, onFinished);

  return (
    <div className='grid gap-5 xl:grid-cols-[300px_1fr]'>
      <div className='border-line-soft bg-canvas space-y-5 self-start rounded-xl border p-4 sm:p-5'>
        <Field label='Who can see these?' as='group'>
          {privateAccess ? (
            <AudiencePicker value={visibility} onChange={setChosen} friendsEnabled={site.friendsEnabled} />
          ) : (
            <p className='text-muted text-sm'>Everyone. Your account adds public items only.</p>
          )}
        </Field>
        <Field label='Add to event' as='group'>
          <Select
            label='Add to event'
            value={eventId}
            onChange={setEventId}
            options={[
              { value: '', label: 'No event' },
              ...events.map((event) => ({ value: event.id, label: event.title })),
            ]}
          />
        </Field>
        <p className='border-line text-muted border-t pt-4 text-xs leading-relaxed text-pretty'>
          Originals are kept untouched. Location data is removed from the web copies.
        </p>
      </div>

      <div className='min-w-0 space-y-5'>
        <DropZone onFiles={queue.addFiles} />
        {queue.items.length > 0 && <UploadList items={queue.items} onClearFinished={queue.clearFinished} />}
      </div>
    </div>
  );
}
