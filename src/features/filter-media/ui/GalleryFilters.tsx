import Link from 'next/link';
import { X } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { MediaFilters } from '@/entities/media';
import { formatCount } from '@/shared/lib/format';
import { FilterMenu, type FilterOption } from './FilterMenu';

interface GalleryFiltersProps {
  years: number[];
  events: EventDto[];
  current: MediaFilters;
  /** Number of items that match the current filters. */
  total: number;
  /** Shown only when the library has videos. */
  showKind: boolean;
  /** Only visitors with private access can filter by visibility. */
  showVisibility: boolean;
}

export function galleryHref(current: MediaFilters, patch: Partial<MediaFilters>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.year) params.set('year', String(next.year));
  if (next.event) params.set('event', next.event);
  if (next.kind) params.set('kind', next.kind);
  if (next.visibility) params.set('visibility', next.visibility);
  const query = params.toString();
  return '/gallery' + (query ? '?' + query : '');
}

/** Year, event, type and access filters in one toolbar. Every option is a plain link. */
export function GalleryFilters({
  years,
  events,
  current,
  total,
  showKind,
  showVisibility,
}: GalleryFiltersProps) {
  const menus: Array<{ label: string; options: FilterOption[] }> = [];
  const option = (
    key: string,
    text: string,
    patch: Partial<MediaFilters>,
    active: boolean,
  ): FilterOption => ({
    key,
    text,
    active,
    href: galleryHref(current, patch),
  });

  if (years.length > 0)
    menus.push({
      label: 'Year',
      options: [
        option('all', 'All years', { year: undefined }, !current.year),
        ...years.map((year) => option(String(year), String(year), { year }, current.year === year)),
      ],
    });
  if (events.length > 0)
    menus.push({
      label: 'Event',
      options: [
        option('all', 'All events', { event: undefined }, !current.event),
        ...events.map((event) =>
          option(event.slug, event.title, { event: event.slug }, current.event === event.slug),
        ),
      ],
    });
  if (showKind)
    menus.push({
      label: 'Type',
      options: [
        option('all', 'Photos and videos', { kind: undefined }, !current.kind),
        option('photo', 'Photos', { kind: 'photo' }, current.kind === 'photo'),
        option('video', 'Videos', { kind: 'video' }, current.kind === 'video'),
      ],
    });
  if (showVisibility)
    menus.push({
      label: 'Access',
      options: [
        option('all', 'Everything', { visibility: undefined }, !current.visibility),
        option('public', 'Public', { visibility: 'public' }, current.visibility === 'public'),
        option('private', 'Private', { visibility: 'private' }, current.visibility === 'private'),
      ],
    });

  const filtered = Boolean(current.year || current.event || current.kind || current.visibility);

  return (
    <div className='border-line bg-glass sticky top-[4.5rem] z-20 flex flex-wrap items-center gap-2 rounded-2xl border p-2 backdrop-blur-xl'>
      {menus.map((menu) => (
        <FilterMenu key={menu.label} label={menu.label} options={menu.options} />
      ))}
      {filtered && (
        <Link
          href='/gallery'
          scroll={false}
          className='text-link inline-flex h-10 items-center gap-1.5 px-2.5 text-sm font-semibold hover:underline'>
          <X className='size-4' /> Clear filters
        </Link>
      )}
      <span className='text-muted ml-auto px-2 text-sm'>
        {formatCount(total)} {total === 1 ? 'result' : 'results'}
      </span>
    </div>
  );
}
