'use client';

import { useCallback, useState } from 'react';
import type { BulkMediaPatch } from '@/entities/media';
import { deleteMedia, restoreMedia, updateMedia } from '../api/media-mutations';

/** Bulk update/delete/restore with a shared busy + error state. `onDone` runs after every success. */
export function useMediaMutations(onDone: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (task: () => Promise<unknown>): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await task();
        onDone();
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Something went wrong.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onDone],
  );

  return {
    busy,
    error,
    update: (ids: string[], patch: BulkMediaPatch) => run(() => updateMedia(ids, patch)),
    remove: (ids: string[]) => run(() => deleteMedia(ids)),
    restore: (ids: string[]) => run(() => restoreMedia(ids)),
  };
}
