import type { MediaFilters } from '@/entities/media';
import { firstParam } from '@/shared/lib/search-params';

type RawParams = Record<string, string | string[] | undefined>;

/** Turns the URL query into safe gallery filters. */
export function parseGalleryFilters(params: RawParams): MediaFilters {
  const year = Number(firstParam(params.year));
  const visibility = firstParam(params.visibility);
  const kind = firstParam(params.kind);
  return {
    year: Number.isInteger(year) && year >= 1990 && year <= 2100 ? year : undefined,
    event: firstParam(params.event) || undefined,
    visibility: visibility === 'public' || visibility === 'private' ? visibility : undefined,
    kind: kind === 'photo' || kind === 'video' ? kind : undefined,
  };
}
