import { isStaff } from '@server/auth/access';
import type { Viewer } from '@server/auth/viewer';
import { ID_PATTERN } from '@server/lib/ids';
import { originalPath, variantPath, videoPath } from '@server/storage/paths';
import { canReviewDeleted, isVisibleTo } from './media.access';
import { isVariantName } from './media.constants';
import { mediaRepository } from './media.repository';

export interface MediaFile {
  path: string;
  mime: string;
  /** Public items may be kept by the browser for a while; private ones are re-checked on every view. */
  isPublic: boolean;
  /** Sent as an attachment with this name. */
  downloadName?: string;
}

/**
 * Resolves a media URL (/api/media/<id>/<variant>) to a file on disk. Returns null (→ 404) when the
 * id is invalid, the item does not exist, or the viewer is not allowed to see it. Files of deleted
 * items are only served to the super admin.
 */
export async function locateMediaFile(
  id: string,
  variant: string,
  viewer: Viewer,
): Promise<MediaFile | null> {
  if (!ID_PATTERN.test(id)) return null;
  const record = await mediaRepository.get(id);
  if (!record) return null;
  if (record.deleted ? !canReviewDeleted(viewer) : !isVisibleTo(record, viewer)) return null;
  const isPublic = record.visibility === 'public';

  if (variant === 'original') {
    if (!isStaff(viewer)) return null;
    return {
      path: originalPath(id, record.ext),
      mime: record.mime,
      isPublic: false,
      downloadName: record.name,
    };
  }
  if (variant === 'video') {
    if (record.kind !== 'video' || record.video?.status !== 'ready') return null;
    return { path: videoPath(id), mime: 'video/mp4', isPublic };
  }
  if (!isVariantName(variant)) return null;
  return { path: variantPath(id, variant), mime: 'image/webp', isPublic };
}
