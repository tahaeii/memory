'use client';

import { useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { EventDto, EventInput } from '@/entities/event';
import { formatMediaCount, formatShortDate } from '@/shared/lib/format';
import { messageOf } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { DatePicker } from '@/shared/ui/date-picker';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { createEvent, deleteEvent, updateEvent } from '../api/event-api';

interface EventsManagerProps {
  events: EventDto[];
  onChanged: () => void;
}

const empty: EventInput = { title: '', date: '', description: '' };

/** Create, rename, re-date and delete events. */
export function EventsManager({ events, onChanged }: EventsManagerProps) {
  const [draft, setDraft] = useState<EventInput>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<EventDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(task: () => Promise<unknown>): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      await task();
      onChanged();
      return true;
    } catch (caught) {
      setError(messageOf(caught));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await run(() => (editingId ? updateEvent(editingId, draft) : createEvent(draft)));
    if (ok) {
      setDraft(empty);
      setEditingId(null);
    }
  }

  function startEdit(item: EventDto) {
    setEditingId(item.id);
    setDraft({ title: item.title, date: item.date, description: item.description });
  }

  return (
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]'>
      <form onSubmit={submit} className='border-line bg-surface h-fit space-y-4 rounded-3xl border p-5'>
        <h3 className='text-fg font-medium'>{editingId ? 'Edit event' : 'New event'}</h3>
        <Field label='Title'>
          <Input
            required
            minLength={2}
            maxLength={80}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </Field>
        <Field label='Date' as='group'>
          <DatePicker
            label='Event date'
            value={draft.date}
            onChange={(date) => setDraft({ ...draft, date })}
          />
        </Field>
        <label className='text-fg block text-sm font-medium'>
          Description <span className='text-muted font-normal'>(optional)</span>
          <textarea
            rows={3}
            maxLength={500}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className='focus:border-primary focus:ring-primary/15 border-line mt-1.5 w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-4'
          />
        </label>
        {error && (
          <p role='alert' className='text-danger text-sm'>
            {error}
          </p>
        )}
        <div className='flex gap-2'>
          <Button type='submit' loading={busy} disabled={!draft.date}>
            {editingId ? 'Save changes' : 'Create event'}
          </Button>
          {editingId && (
            <Button
              variant='ghost'
              onClick={() => {
                setEditingId(null);
                setDraft(empty);
              }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <ul className='divide-line-soft border-line bg-surface divide-y overflow-hidden rounded-3xl border'>
        {events.length === 0 && (
          <li className='text-muted px-5 py-10 text-center text-sm'>No events yet. Create the first one.</li>
        )}
        {events.map((item) => (
          <li key={item.id} className='flex items-center justify-between gap-4 px-5 py-4'>
            <div className='min-w-0'>
              <p className='text-fg truncate font-medium'>{item.title}</p>
              <p className='text-muted text-sm'>
                {formatShortDate(item.date)} · {formatMediaCount(item.photoCount, item.videoCount)}
              </p>
            </div>
            <div className='flex shrink-0 gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => startEdit(item)}
                aria-label={'Edit ' + item.title}>
                <Pencil className='size-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setDeleting(item)}
                aria-label={'Delete ' + item.title}>
                <Trash2 className='size-4' />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleting !== null}
        title={'Delete "' + (deleting?.title ?? '') + '"?'}
        loading={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting && (await run(() => deleteEvent(deleting.id)))) setDeleting(null);
        }}>
        Its photos and videos stay in the library; they just no longer belong to this event.
      </ConfirmDialog>
    </div>
  );
}
