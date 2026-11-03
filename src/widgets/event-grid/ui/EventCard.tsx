import Link from 'next/link';
import { CalendarDays, Images } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import { MediaImage } from '@/entities/media';
import { formatMediaCount, formatShortDate } from '@/shared/lib/format';

/** Landscape card for the events page. */
export function EventCard({ event }: { event: EventDto }) {
  return (
    <Link
      href={'/events/' + event.slug}
      className='group border-line-soft bg-surface hover:border-line shadow-card hover:shadow-raised focus-visible:outline-primary block rounded-2xl border p-2.5 transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2'>
      <div
        className='bg-subtle relative aspect-4/3 overflow-hidden rounded-lg bg-cover'
        style={event.cover ? { backgroundImage: 'url(' + event.cover.placeholder + ')' } : undefined}>
        {event.cover ? (
          <MediaImage
            item={event.cover}
            sizes='(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw'
            className='transition-[transform,opacity] duration-700 group-hover:scale-105'
          />
        ) : (
          <div className='text-faint absolute inset-0 grid place-items-center'>
            <Images className='size-8' />
          </div>
        )}
        <span className='bg-glass text-fg absolute top-3 left-3 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold backdrop-blur-md'>
          <CalendarDays className='size-3.5' />
          {formatShortDate(event.date)}
        </span>
      </div>
      <div className='flex items-center justify-between gap-3 px-1.5 pt-3.5 pb-1.5'>
        <h3 className='group-hover:text-link truncate font-semibold transition-colors'>{event.title}</h3>
        <span className='bg-primary-soft text-link shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold'>
          {formatMediaCount(event.photoCount, event.videoCount)}
        </span>
      </div>
    </Link>
  );
}

/** Tall card with the title over the cover, for horizontal rows (home page). */
export function EventPoster({ event }: { event: EventDto }) {
  return (
    <Link
      href={'/events/' + event.slug}
      className='group bg-subtle focus-visible:outline-primary relative block aspect-3/4 w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-cover focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-72'
      style={event.cover ? { backgroundImage: 'url(' + event.cover.placeholder + ')' } : undefined}>
      {event.cover ? (
        <MediaImage
          item={event.cover}
          sizes='288px'
          className='transition-[transform,opacity] duration-700 group-hover:scale-105'
        />
      ) : (
        <div className='text-faint absolute inset-0 grid place-items-center'>
          <Images className='size-8' />
        </div>
      )}
      <span
        aria-hidden
        className='absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/10 to-transparent'
      />
      <span className='absolute inset-x-5 bottom-5 text-white transition-[translate] duration-300 ease-out group-hover:-translate-y-1'>
        <span className='block text-xs font-medium text-white/75'>{formatShortDate(event.date)}</span>
        <span className='mt-1 block text-lg leading-snug font-semibold tracking-tight'>{event.title}</span>
        <span className='mt-3 inline-flex h-6 items-center rounded-full bg-white/15 px-2.5 text-xs font-medium backdrop-blur-md'>
          {formatMediaCount(event.photoCount, event.videoCount)}
        </span>
      </span>
    </Link>
  );
}
