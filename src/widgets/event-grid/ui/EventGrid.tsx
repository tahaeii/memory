import { t } from '@i18n';
import type { EventDto } from '@/entities/event';
import { EmptyState } from '@/shared/ui/EmptyState';
import { EventCard } from './EventCard';

export function EventGrid({ events }: { events: EventDto[] }) {
  if (events.length === 0)
    return <EmptyState title={t('events.emptyTitle')}>{t('events.emptyText')}</EmptyState>;
  return (
    <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
