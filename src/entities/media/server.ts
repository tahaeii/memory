import 'server-only';
import { getServerViewer } from '@/shared/api/server-session';
import { getSummary, listMedia } from '@server/media/media.service';
import type { LibrarySummaryDto, MediaFilters, MediaPageDto } from './model/types';

/** Server-component data loading. Kept out of index.ts so client bundles never import it. */
export async function loadMediaPage(filters: MediaFilters & { limit: number }): Promise<MediaPageDto> {
  return listMedia({
    viewer: await getServerViewer(),
    limit: filters.limit,
    eventSlug: filters.event,
    year: filters.year,
    visibility: filters.visibility,
    kind: filters.kind,
    deleted: filters.deleted,
    deletedBy: filters.deletedBy,
  });
}

export async function loadSummary(): Promise<LibrarySummaryDto> {
  return getSummary(await getServerViewer());
}
