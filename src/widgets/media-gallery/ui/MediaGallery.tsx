'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  groupMediaByMonth,
  JustifiedGrid,
  useInfiniteMedia,
  type MediaFilters,
  type MediaPageDto,
} from '@/entities/media';
import { MediaViewer } from '@/features/media-viewer';
import { formatCount } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Spinner } from '@/shared/ui/Spinner';

interface MediaGalleryProps {
  initial: MediaPageDto;
  filters?: MediaFilters;
  /** "month" shows a timeline with one row per month; "none" one continuous grid. */
  grouping?: 'month' | 'none';
  /**
   * How further pages load: "scroll" (automatically near the end), "button" (a "Show more" button)
   * or "none" (only the first page).
   */
  pagination?: 'scroll' | 'button' | 'none';
  /** Items per "Show more" or scroll request. */
  pageSize?: number;
  emptyTitle?: string;
}

const NO_FILTERS: MediaFilters = {};

/** Photo and video grid with a day timeline, more pages on demand and a full-screen viewer. */
export function MediaGallery({
  initial,
  filters = NO_FILTERS,
  grouping = 'month',
  pagination = 'scroll',
  pageSize,
  emptyTitle = 'Nothing here yet',
}: MediaGalleryProps) {
  const { items, total, hasMore, loading, error, loadMore, sentinelRef } = useInfiniteMedia(
    initial,
    filters,
    0,
    pageSize,
  );
  const [active, setActive] = useState<number | null>(null);
  const canLoadMore = pagination !== 'none' && hasMore;

  const groups = useMemo(
    () => (grouping === 'month' ? groupMediaByMonth(items) : [{ key: 'all', label: '', items, start: 0 }]),
    [grouping, items],
  );

  if (items.length === 0) {
    return (
      <EmptyState title={emptyTitle}>Photos and videos show up here as soon as they are added.</EmptyState>
    );
  }

  return (
    <div>
      {grouping === 'month' ? (
        groups.map((group) => {
          const [month, year] = group.label.split(' ');
          return (
            <section
              key={group.key}
              aria-label={group.label}
              className='border-line-soft flex flex-col gap-4 border-t py-7 first:border-t-0 first:pt-0 md:flex-row md:gap-8'>
              <div className='md:sticky md:top-24 md:w-36 md:shrink-0 md:self-start'>
                <h2 className='flex items-baseline gap-2 md:block'>
                  <span className='font-display block text-2xl leading-tight font-semibold tracking-tight md:text-[28px]'>
                    {month}
                  </span>
                  <span className='text-muted block text-sm font-medium md:mt-1'>{year}</span>
                </h2>
              </div>
              <div className='min-w-0 flex-1'>
                <JustifiedGrid
                  items={group.items}
                  startIndex={group.start}
                  eager={group.start === 0 ? 6 : 0}
                  onOpen={setActive}
                />
              </div>
            </section>
          );
        })
      ) : (
        <JustifiedGrid items={items} eager={6} onOpen={setActive} />
      )}

      {canLoadMore && pagination === 'scroll' && <div ref={sentinelRef} className='h-px' />}
      {canLoadMore && pagination === 'button' && !error && (
        <div className='mt-10 flex flex-col items-center gap-2'>
          <Button variant='secondary' size='lg' loading={loading} onClick={() => void loadMore()}>
            {!loading && <ChevronDown className='size-4' />}
            Show more
          </Button>
          <p className='text-muted text-xs'>
            {formatCount(items.length)} of {formatCount(total)} shown
          </p>
        </div>
      )}
      {loading && pagination === 'scroll' && (
        <div className='text-primary flex justify-center py-6'>
          <Spinner className='size-6' />
        </div>
      )}
      {error && (
        <div className='text-danger flex flex-col items-center gap-3 py-6 text-sm'>
          {error}
          <Button variant='secondary' size='sm' onClick={() => void loadMore()}>
            Try again
          </Button>
        </div>
      )}

      {active !== null && (
        <MediaViewer
          items={items}
          index={active}
          hasMore={canLoadMore}
          total={total}
          onIndexChange={setActive}
          onNeedMore={() => void loadMore()}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
