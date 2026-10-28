'use client';

import { useEffect } from 'react';
import { fetchMediaStatus } from '../api/media-api';
import type { MediaDto } from './types';

const POLL_MS = 3000;

/**
 * Follows videos while the server converts them: asks for their status every few seconds and
 * hands the fresh items to `onUpdate`. Does nothing once every video in `items` is ready.
 */
export function useVideoStatus(items: MediaDto[], onUpdate: (fresh: MediaDto[]) => void) {
  const converting = items
    .filter((item) => item.video?.status === 'processing')
    .map((item) => item.id)
    .join(',');

  useEffect(() => {
    if (!converting) return;
    const ids = converting.split(',');
    let inFlight = false;
    const timer = setInterval(async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        onUpdate((await fetchMediaStatus(ids)).items);
      } catch {
        // Try again on the next tick.
      } finally {
        inFlight = false;
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [converting, onUpdate]);
}
