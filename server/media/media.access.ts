import { canSee, isStaff } from '@server/auth/access';
import type { Viewer } from '@server/auth/viewer';
import type { MediaRecord } from './media.types';

/** Photos are ready at once; videos only after their conversion has finished. */
export function isPublished(record: MediaRecord): boolean {
  return record.kind === 'photo' || record.video?.status === 'ready';
}

/**
 * Items in the library. Deleted items are hidden from everyone; staff also see videos that are
 * still converting (or failed), so they can follow up on them.
 */
export function isVisibleTo(record: MediaRecord, viewer: Viewer): boolean {
  if (record.deleted) return false;
  return canSee(viewer, record.visibility) && (isStaff(viewer) || isPublished(record));
}

/** Items admins deleted are only reachable by the super admin, who restores or removes them. */
export function canReviewDeleted(viewer: Viewer): boolean {
  return viewer.role === 'superadmin';
}
