'use client';

import { t } from '@i18n';
import { EVENT_LIMITS, eventInputSchema } from '@contracts/schemas/event';
import type { EventDto } from '@/entities/event';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { DatePicker } from '@/shared/ui/date-picker';
import { Field } from '@/shared/ui/Field';
import { Input, Textarea } from '@/shared/ui/Input';
import { NoticeSlot } from '@/shared/ui/NoticeSlot';
import { createEvent, updateEvent } from '../api/event-api';

interface EventFormProps {
  /** The event being edited; null creates a new one. */
  event: EventDto | null;
  onSaved: () => void;
  onCancel: () => void;
}

/** Title, date and description of one event. Mount it with a `key` per event so it starts fresh. */
export function EventForm({ event, onSaved, onCancel }: EventFormProps) {
  const form = useForm({
    schema: eventInputSchema,
    initial: {
      title: event?.title ?? '',
      date: event?.date ?? '',
      description: event?.description ?? '',
    },
    onSubmit: async (input) => {
      await (event ? updateEvent(event.id, input) : createEvent(input));
      if (!event) form.reset();
      onSaved();
    },
  });
  const { values, errors } = form;

  return (
    <form
      onSubmit={form.submit}
      noValidate
      className='border-line bg-surface h-fit space-y-4 rounded-xl border p-4 sm:p-5'>
      <h3 className='type-heading'>{event ? t('events.manage.editTitle') : t('events.manage.newTitle')}</h3>
      <Field label={t('events.manage.title')} error={errors.title}>
        <Input maxLength={EVENT_LIMITS.titleMax} {...form.field('title')} />
      </Field>
      <Field label={t('events.manage.date')} error={errors.date} as='group'>
        <DatePicker
          label={t('events.manage.dateLabel')}
          value={values.date}
          onChange={(date) => form.set('date', date)}
        />
      </Field>
      <Field
        label={t('events.manage.description')}
        hint={t('events.manage.optional')}
        error={errors.description}>
        <Textarea rows={3} maxLength={EVENT_LIMITS.descriptionMax} {...form.field('description')} />
      </Field>
      <NoticeSlot tone='error' message={form.error} />
      <div className='flex gap-2'>
        <Button type='submit' loading={form.pending}>
          {event ? t('events.manage.save') : t('events.manage.create')}
        </Button>
        {event && (
          <Button variant='ghost' onClick={onCancel}>
            {t('common.actions.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
