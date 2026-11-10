'use client';

import { t } from '@i18n';
import type { EventDto } from '@/entities/event';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { NoticeSlot } from '@/shared/ui/NoticeSlot';
import { useEventChanges } from '../model/use-event-changes';
import { EventForm } from './EventForm';
import { EventRow } from './EventRow';

interface EventsManagerProps {
  events: EventDto[];
  onChanged: () => void;
}

/** Create, rename, re-date and delete events. */
export function EventsManager({ events, onChanged }: EventsManagerProps) {
  const changes = useEventChanges(onChanged);
  const { editing, deleting } = changes;

  return (
    <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
      <EventForm
        key={editing?.id ?? 'new'}
        event={editing}
        onCancel={changes.stopEdit}
        onSaved={() => {
          changes.stopEdit();
          onChanged();
        }}
      />

      <div className='space-y-3'>
        <NoticeSlot tone='error' message={changes.error} onDismiss={changes.dismissError} />
        <ul className='divide-line-soft border-line bg-surface divide-y overflow-hidden rounded-xl border'>
          {events.length === 0 && (
            <li className='text-muted px-5 py-10 text-center text-sm'>{t('events.manage.empty')}</li>
          )}
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              editing={editing?.id === event.id}
              onEdit={() => changes.startEdit(event)}
              onDelete={() => changes.askDelete(event)}
            />
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={t('events.manage.deleteTitle', { title: deleting?.title ?? '' })}
        loading={changes.busy}
        onCancel={changes.cancelDelete}
        onConfirm={() => void changes.confirmDelete()}>
        {t('events.manage.deleteBody')}
      </ConfirmDialog>
    </div>
  );
}
