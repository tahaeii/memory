import Link from 'next/link';
import { X } from 'lucide-react';
import { plural, t } from '@i18n';
import type { EventDto } from '@/entities/event';
import type { MediaFilters } from '@/entities/media';
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
      label: t('gallery.filters.year'),
      options: [
        option('all', t('gallery.filters.allYears'), { year: undefined }, !current.year),
        ...years.map((year) => option(String(year), String(year), { year }, current.year === year)),
      ],
    });
  if (events.length > 0)
    menus.push({
      label: t('gallery.filters.event'),
      options: [
        option('all', t('gallery.filters.allEvents'), { event: undefined }, !current.event),
        ...events.map((event) =>
          option(event.slug, event.title, { event: event.slug }, current.event === event.slug),
        ),
      ],
    });
  if (showKind)
    menus.push({
      label: t('gallery.filters.type'),
      options: [
        option('all', t('gallery.filters.allTypes'), { kind: undefined }, !current.kind),
        option('photo', t('gallery.filters.photos'), { kind: 'photo' }, current.kind === 'photo'),
        option('video', t('gallery.filters.videos'), { kind: 'video' }, current.kind === 'video'),
      ],
    });
  if (showVisibility)
    menus.push({
      label: t('gallery.filters.access'),
      options: [
        option('all', t('gallery.filters.allAccess'), { visibility: undefined }, !current.visibility),
        option(
          'public',
          t('gallery.filters.public'),
          { visibility: 'public' },
          current.visibility === 'public',
        ),
        option(
          'private',
          t('gallery.filters.private'),
          { visibility: 'private' },
          current.visibility === 'private',
        ),
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
          className='text-link hover:bg-primary-soft inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors'>
          <X className='size-4' /> {t('gallery.filters.clear')}
        </Link>
      )}
      <span className='text-muted ml-auto px-2 text-sm tabular-nums'>
        {plural('gallery.filters.results', total)}
      </span>
    </div>
  );
}
