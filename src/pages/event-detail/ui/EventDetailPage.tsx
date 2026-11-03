import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Images } from 'lucide-react';
import { loadEvent } from '@/entities/event/server';
import { MediaImage } from '@/entities/media';
import { loadMediaPage } from '@/entities/media/server';
import { formatDay, formatMediaCount } from '@/shared/lib/format';
import { Container } from '@/shared/ui/Container';
import { MediaGallery } from '@/widgets/media-gallery';

export async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const page = await loadMediaPage({ event: slug, limit: 48 });

  return (
    <>
      <section className='relative isolate overflow-hidden'>
        {event.cover && (
          <div aria-hidden className='absolute inset-0 -z-10'>
            <MediaImage item={event.cover} sizes='100vw' priority className='scale-110 blur-2xl' />
            <div className='from-canvas via-canvas/85 to-canvas/60 absolute inset-0 bg-gradient-to-t' />
          </div>
        )}
        <Container className='pt-8 pb-12 sm:pb-16'>
          <Link
            href='/events'
            className='text-muted hover:text-fg inline-flex items-center gap-1.5 text-sm font-medium transition'>
            <ArrowLeft className='size-4' /> All events
          </Link>
          <h1 className='type-title mt-6 max-w-3xl'>{event.title}</h1>
          <p className='text-muted mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm'>
            <span className='inline-flex items-center gap-1.5'>
              <CalendarDays className='size-4' />
              {formatDay(event.date)}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <Images className='size-4' />
              {formatMediaCount(event.photoCount, event.videoCount)}
            </span>
          </p>
          {event.description && (
            <p className='text-muted mt-4 max-w-2xl text-lg leading-relaxed'>{event.description}</p>
          )}
        </Container>
      </section>
      <Container>
        <MediaGallery
          initial={page}
          filters={{ event: slug }}
          grouping='none'
          emptyTitle='Nothing in this event yet'
        />
      </Container>
    </>
  );
}
