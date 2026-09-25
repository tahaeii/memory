import { apiFetch } from '@/shared/api/http';
import type { MediaDto, MediaFilters, MediaPageDto } from '../model/types';

interface PageRequest extends MediaFilters {
  cursor?: string | null;
  limit?: number;
}

/** Loads one page of photos and videos from the browser. */
export function fetchMediaPage(request: PageRequest): Promise<MediaPageDto> {
  const params = new URLSearchParams();
  if (request.event) params.set('event', request.event);
  if (request.year) params.set('year', String(request.year));
  if (request.visibility) params.set('visibility', request.visibility);
  if (request.kind) params.set('kind', request.kind);
  if (request.deleted) params.set('deleted', 'true');
  if (request.deletedBy) params.set('deletedBy', request.deletedBy);
  if (request.cursor) params.set('cursor', request.cursor);
  if (request.limit) params.set('limit', String(request.limit));
  return apiFetch<MediaPageDto>('/media?' + params.toString());
}

/** Fresh copies of a few items (staff only), used to follow videos while they convert. */
export function fetchMediaStatus(ids: string[]): Promise<{ items: MediaDto[] }> {
  return apiFetch('/media/status?ids=' + ids.join(','));
}
