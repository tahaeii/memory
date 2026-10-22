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
  return width + ' × ' + height + (megapixels >= 1 ? ' (' + megapixels.toFixed(1) + ' MP)' : '');
}

/** The facts shown in the viewer's details panel. Access and file details are for staff only. */
export function describeMedia(item: MediaDto, staff: boolean): DetailRow[] {
  const rows: DetailRow[] = [
    { label: 'Date', value: formatDay(item.takenAt) },
    { label: 'Time', value: formatTime(item.takenAt) },
    item.event
      ? { label: 'Event', value: item.event.title, href: '/events/' + item.event.slug }
      : { label: 'Event', value: 'Not part of an event' },
    { label: 'Size', value: dimensions(item.width, item.height) },
  ];
  if (item.video && item.video.duration > 0)
    rows.push({ label: 'Length', value: formatDuration(item.video.duration) });
  if (staff) {
    rows.push(
      item.visibility === 'private'
        ? { label: 'Access', value: 'Private', tone: 'private' }
        : { label: 'Access', value: 'Public', tone: 'public' },
      { label: 'File', value: item.name },
    );
  }
  if (item.deletion)
    rows.push({
      label: 'Deleted',
      value: 'by ' + item.deletion.by + ' on ' + formatShortDate(item.deletion.at),
    });
  return rows;
}
