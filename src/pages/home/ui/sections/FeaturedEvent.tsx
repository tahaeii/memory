import Link from 'next/link';
import type { EventDto } from '@/entities/event';
import { MediaImage, type MediaDto } from '@/entities/media';
import { formatDay, formatMediaCount } from '@/shared/lib/format';

/** The newest event with a cover, as one wide card under the hero. */
export function FeaturedEvent({ event, cover }: { event: EventDto; cover: MediaDto }) {
  return (
    <Link
      href={'/events/' + event.slug}
      className='group border-line bg-surface shadow-card hover:shadow-raised flex flex-col overflow-hidden rounded-2xl border transition-shadow duration-300 md:flex-row'>
      <span
        className='bg-subtle relative block aspect-[16/10] overflow-hidden bg-cover md:aspect-auto md:min-h-[340px] md:flex-[1.5]'
        style={{ backgroundImage: 'url(' + cover.placeholder + ')' }}>
        <MediaImage
          item={cover}
          sizes='(min-width: 768px) 60vw, 100vw'
          className='transition-[transform,opacity] duration-700 group-hover:scale-[1.025]'
        />
      </span>
      <span className='flex flex-col justify-center p-6 sm:p-9 md:flex-1'>
        <span className='text-muted text-sm'>Latest event</span>
        <span className='type-section mt-2'>{event.title}</span>
        <span className='text-muted mt-3 text-sm'>
          {formatDay(event.date)}
          <br />
          {formatMediaCount(event.photoCount, event.videoCount)}
        </span>
        {event.description && (
          <span className='text-muted mt-4 line-clamp-3 leading-relaxed text-pretty'>
            {event.description}
          </span>
        )}
        <span className='text-link mt-6 font-semibold'>
          <span className='link-underline'>Open the event</span>
        </span>
      </span>
    </Link>
  );
}
