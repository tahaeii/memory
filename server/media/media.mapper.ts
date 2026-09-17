import type { MediaDto, MediaVariantDto, VariantName } from '@contracts/media';
import { isStaff } from '@server/auth/access';
import type { Viewer } from '@server/auth/viewer';
import { VARIANTS, VARIANT_NAMES } from './media.constants';
import type { MediaRecord } from './media.types';

const fileUrl = (id: string, variant: string): string => '/api/media/' + id + '/' + variant;

/** Converts a stored record into the JSON the browser receives. Staff get a few extra fields. */
export function toMediaDto(
  record: MediaRecord,
  event: { slug: string; title: string } | null,
  viewer: Viewer,
  progress: number | null,
): MediaDto {
  const staff = isStaff(viewer);
  const variants = {} as Record<VariantName, MediaVariantDto>;
  for (const name of VARIANT_NAMES) {
    variants[name] = { url: fileUrl(record.id, name), width: Math.min(VARIANTS[name].width, record.width) };
  }
  const video = record.kind === 'video' ? record.video : undefined;
  return {
    id: record.id,
    kind: record.kind,
    name: record.name,
    width: record.width,
    height: record.height,
    takenAt: record.takenAt,
    visibility: record.visibility,
    event: event ? { slug: event.slug, title: event.title } : null,
    placeholder: record.placeholder,
    variants,
    video: video
      ? {
          url: video.status === 'ready' ? fileUrl(record.id, 'video') : null,
          duration: video.duration,
          status: video.status,
          progress: staff && video.status === 'processing' ? progress : null,
          error: staff ? video.error : null,
        }
      : null,
    originalUrl: staff ? fileUrl(record.id, 'original') : null,
    deletion:
      record.deleted && viewer.role === 'superadmin'
        ? { at: record.deleted.at, by: record.deleted.username }
        : null,
  };
}
