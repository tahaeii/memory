import { plural, t } from '@i18n';
import type { LibrarySummaryDto } from '@/entities/media';

/**
 * One sentence about what the archive holds, e.g. "1,204 photos and 12 videos from 8 events,
 * since 2019". Empty while there is nothing to count.
 */
export function describeArchive(summary: LibrarySummaryDto, eventCount: number): string {
  if (summary.itemCount === 0) return '';
  const photos = plural('common.media.photos', summary.photoCount);
  const videos = plural('common.media.videos', summary.videoCount);
  let text =
    summary.photoCount > 0 && summary.videoCount > 0
      ? t('home.summary.both', { photos, videos })
      : summary.videoCount > 0
        ? videos
        : photos;
  if (eventCount > 0)
    text = t('home.summary.fromEvents', { media: text, events: plural('home.summary.events', eventCount) });
  if (summary.years.length > 0) text = t('home.summary.since', { text, year: Math.min(...summary.years) });
  return text;
}
