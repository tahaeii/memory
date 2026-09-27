import { loadEvents } from '@/entities/event/server';
import { Container } from '@/shared/ui/Container';
import { EventGrid } from '@/widgets/event-grid';

export async function EventsPage() {
  const events = await loadEvents();
  return (
    <Container className='py-10 sm:py-12'>
      <h1 className='font-display text-4xl font-bold tracking-tight sm:text-5xl'>Events</h1>
      <p className='text-muted mt-2 mb-10'>Gatherings, celebrations and milestones.</p>
      <EventGrid events={events} />
    </Container>
  );
}
