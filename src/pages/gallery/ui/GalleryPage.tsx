import Link from 'next/link';
import { plural, t } from '@i18n';
import { loadEvents } from '@/entities/event/server';
import type { MediaFilters } from '@/entities/media';
import { loadMediaPage, loadSummary } from '@/entities/media/server';
import { GalleryFilters, galleryHref } from '@/features/filter-media';
import { getServerSession } from '@/shared/api/server-session';
import { cn } from '@/shared/lib/cn';
import type { SearchParams } from '@/shared/lib/search-params';
import { Container } from '@/shared/ui/Container';
import { MediaGallery } from '@/widgets/media-gallery';
import { parseGalleryFilters } from '../lib/parse-filters';

/** "48 photos, newest first.", worded for what the filters and the library can show. */
function describe(total: number, filters: MediaFilters, hasVideos: boolean): string {
  if (filters.kind === 'video') return plural('gallery.summary.videos', total);
  if (filters.kind === 'photo' || !hasVideos) return plural('gallery.summary.photos', total);
  return plural('gallery.summary.all', total);
}

export async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseGalleryFilters(await searchParams);
  const [session, page, summary, events] = await Promise.all([
    getServerSession(),
    loadMediaPage({ ...filters, limit: 48 }),
    loadSummary(),
    loadEvents(),
  ]);

  return (
    <Container className='py-10 sm:py-12'>
      <h1 className='type-title'>{t('gallery.title')}</h1>
      <p className='text-muted mt-2'>{describe(page.total, filters, summary.videoCount > 0)}</p>
      <div className='mt-7'>
        <GalleryFilters
          years={summary.years}
          events={events}
          current={filters}
          total={page.total}
          showKind={summary.videoCount > 0 || filters.kind !== undefined}
          showVisibility={session.privateAccess}
        />
      </div>
      <div className='mt-8 flex gap-8'>
        <div className='min-w-0 flex-1'>
          <MediaGallery
            key={JSON.stringify(filters)}
            initial={page}
            filters={filters}
            grouping='month'
            emptyTitle={t('gallery.noMatches')}
          />
        </div>
        {summary.years.length > 1 && (
          <nav
            aria-label={t('gallery.years.label')}
            className='border-line-soft bg-surface sticky top-40 hidden w-24 shrink-0 self-start rounded-2xl border p-2 xl:block'>
            <p className='text-muted px-2.5 pt-1 pb-2 text-[11px] font-semibold tracking-[0.12em] uppercase'>
              {t('gallery.years.title')}
            </p>
            {summary.years.map((year) => (
              <Link
                key={year}
                href={galleryHref(filters, { year: filters.year === year ? undefined : year })}
                aria-current={filters.year === year ? 'true' : undefined}
                className={cn(
                  'block rounded-lg px-2.5 py-1.5 text-sm tabular-nums transition-colors duration-300',
                  filters.year === year
                    ? 'bg-primary text-on-primary font-medium'
                    : 'text-muted hover:bg-subtle hover:text-fg',
                )}>
                {year}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </Container>
  );
}
