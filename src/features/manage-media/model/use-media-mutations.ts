'use client';

import type { BulkMediaPatch } from '@/entities/media';
import { useAsyncAction } from '@/shared/lib/use-async-action';
import { deleteMedia, restoreMedia, updateMedia } from '../api/media-mutations';

/** Bulk update, delete and restore with a shared busy and error state. `onDone` runs after every success. */
export function useMediaMutations(onDone: () => void) {
  const { busy, error, run } = useAsyncAction();

  const then = async (task: () => Promise<unknown>): Promise<boolean> => {
    const ok = await run(task);
    if (ok) onDone();
    return ok;
  };

  return {
    busy,
    error,
    update: (ids: string[], patch: BulkMediaPatch) => then(() => updateMedia(ids, patch)),
    remove: (ids: string[]) => then(() => deleteMedia(ids)),
    restore: (ids: string[]) => then(() => restoreMedia(ids)),
  };
}
