import { apiFetch } from '@/shared/api/http';
import type { BulkMediaPatch } from '@/entities/media';

export function updateMedia(ids: string[], patch: BulkMediaPatch): Promise<{ updated: number }> {
  return apiFetch('/media', { method: 'PATCH', json: { ids, ...patch } });
}

/** For an admin this hides the items; for the super admin it removes them for good. */
export function deleteMedia(ids: string[]): Promise<{ deleted: number }> {
  return apiFetch('/media', { method: 'DELETE', json: { ids } });
}

export function restoreMedia(ids: string[]): Promise<{ restored: number }> {
  return apiFetch('/media/restore', { method: 'POST', json: { ids } });
}
