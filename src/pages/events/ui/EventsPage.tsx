import { t } from '@i18n';
import { loadEvents } from '@/entities/event/server';
import { Container } from '@/shared/ui/Container';
import { EventGrid } from '@/widgets/event-grid';

export async function EventsPage() {
  const events = await loadEvents();
  return (
    <Container className='py-10 sm:py-12'>
      <h1 className='type-title'>{t('events.title')}</h1>
      <p className='text-muted mt-2 mb-10'>{t('events.subtitle')}</p>
      <EventGrid events={events} />
    </Container>
  );
}
