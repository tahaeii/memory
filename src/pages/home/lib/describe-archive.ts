import type { LibrarySummaryDto } from '@/entities/media';
import { formatCount } from '@/shared/lib/format';

const counted = (count: number, word: string): string =>
  formatCount(count) + ' ' + word + (count === 1 ? '' : 's');

/**
 * One sentence about what the archive holds, e.g. "1,204 photos and 12 videos from 8 events,
 * since 2019". Empty while there is nothing to count.
 */
export function describeArchive(summary: LibrarySummaryDto, eventCount: number): string {
  if (summary.itemCount === 0) return '';
  const media = [
    summary.photoCount > 0 && counted(summary.photoCount, 'photo'),
    summary.videoCount > 0 && counted(summary.videoCount, 'video'),
  ]
    .filter(Boolean)
    .join(' and ');
  const firstYear = summary.years.length > 0 ? Math.min(...summary.years) : null;
  return (
    media +
    (eventCount > 0 ? ' from ' + counted(eventCount, 'event') : '') +
    (firstYear ? ', since ' + firstYear : '')
  );
}
