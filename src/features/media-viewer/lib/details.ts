import { t } from '@i18n';
import type { MediaDto } from '@/entities/media';
import { formatDay, formatDuration, formatShortDate, formatTime } from '@/shared/lib/format';

export interface DetailRow {
  label: string;
  value: string;
  /** Makes the value a link. */
  href?: string;
  tone?: 'private' | 'public';
}

/** "4032 × 3024 (12.2 MP)"; megapixels only once they say something. */
function dimensions(width: number, height: number): string {
  const megapixels = (width * height) / 1_000_000;
  return megapixels >= 1
    ? t('viewer.details.megapixels', { width, height, megapixels: megapixels.toFixed(1) })
    : t('viewer.details.pixels', { width, height });
}

/** The facts shown in the viewer's details panel. Access and file details are for staff only. */
export function describeMedia(item: MediaDto, staff: boolean): DetailRow[] {
  const rows: DetailRow[] = [
    { label: t('viewer.details.date'), value: formatDay(item.takenAt) },
    { label: t('viewer.details.time'), value: formatTime(item.takenAt) },
    item.event
      ? { label: t('viewer.details.event'), value: item.event.title, href: '/events/' + item.event.slug }
      : { label: t('viewer.details.event'), value: t('viewer.details.noEvent') },
    { label: t('viewer.details.size'), value: dimensions(item.width, item.height) },
  ];
  if (item.video && item.video.duration > 0)
    rows.push({ label: t('viewer.details.length'), value: formatDuration(item.video.duration) });
  if (staff) {
    rows.push(
      item.visibility === 'private'
        ? { label: t('viewer.details.access'), value: t('viewer.details.private'), tone: 'private' }
        : { label: t('viewer.details.access'), value: t('viewer.details.public'), tone: 'public' },
      { label: t('viewer.details.file'), value: item.name },
    );
  }
  if (item.deletion)
    rows.push({
      label: t('viewer.details.deleted'),
      value: t('viewer.details.deletedBy', {
        name: item.deletion.by,
        date: formatShortDate(item.deletion.at),
      }),
    });
  return rows;
}
