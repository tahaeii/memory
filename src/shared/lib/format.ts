import { plural, t } from '@i18n';

// Dates of photos carry no time zone (EXIF), so everything is formatted in UTC to stay stable on server and client.
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const shortFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const partFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' });
const timeFormat = partFormat({ hour: '2-digit', minute: '2-digit' });

/** "18:42" */
export const formatTime = (iso: string): string => timeFormat.format(new Date(iso));

/** "Thursday 24 September 2026" */
export const formatDay = (iso: string): string => dayFormat.format(new Date(iso));

/** "24 Sep 2026" */
export const formatShortDate = (iso: string): string => shortFormat.format(new Date(iso));

export const formatCount = (value: number): string => value.toLocaleString('en-US');

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return value.toFixed(value >= 10 ? 0 : 1) + ' ' + units[unit];
}

/** "1:05", "12:40" or "1:02:03". */
export function formatDuration(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, '0');
  return hours > 0 ? hours + ':' + String(minutes).padStart(2, '0') + ':' + rest : minutes + ':' + rest;
}

/** "12 photos", "3 videos", "12 photos, 3 videos" or "No photos yet". */
export function formatMediaCount(photos: number, videos: number): string {
  const photoCount = plural('common.media.photos', photos);
  const videoCount = plural('common.media.videos', videos);
  if (photos > 0 && videos > 0)
    return t('common.media.photosAndVideos', { photos: photoCount, videos: videoCount });
  if (videos > 0) return videoCount;
  return photos > 0 ? photoCount : t('common.media.none');
}
