import type { Visibility } from '@contracts/media';
import type { Viewer } from './viewer';

/** Admins and the super admin. */
export function isStaff(viewer: Viewer): boolean {
  return viewer.role === 'admin' || viewer.role === 'superadmin';
}

/** Everyone sees public items; private items need friends access. */
export function canSee(viewer: Viewer, visibility: Visibility): boolean {
  return visibility === 'public' || viewer.privateAccess;
}

/** Staff may upload, edit and delete the items they can see. */
export function canManage(viewer: Viewer, visibility: Visibility): boolean {
  return isStaff(viewer) && canSee(viewer, visibility);
}
