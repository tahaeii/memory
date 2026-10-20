'use client';

import { useCallback, useEffect } from 'react';
import type { MediaDto } from '@/entities/media';

interface ViewerItemsOptions {
  items: MediaDto[];
  index: number;
  hasMore: boolean;
  onIndexChange: (index: number) => void;
  onNeedMore?: () => void;
  onGone: () => void;
}

/** How close to the end of the loaded items the next page is requested. */
const LOAD_AHEAD = 4;

/** Moving through the list: next and previous, loading further pages and warming the browser cache. */
export function useViewerItems({
  items,
  index,
  hasMore,
  onIndexChange,
  onNeedMore,
  onGone,
}: ViewerItemsOptions) {
  const item = items[index];

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next >= 0 && next < items.length) onIndexChange(next);
    },
    [index, items.length, onIndexChange],
  );

  // Load the next page while the visitor is near the end of what is loaded.
  useEffect(() => {
    if (hasMore && index >= items.length - LOAD_AHEAD) onNeedMore?.();
  }, [hasMore, index, items.length, onNeedMore]);

  // The current item can disappear (e.g. deleted by an admin).
  useEffect(() => {
    if (!item) onGone();
  }, [item, onGone]);

  // Warm the cache for the neighbours so moving on feels instant.
  useEffect(() => {
    for (const neighbour of [items[index + 1], items[index - 1]]) {
      if (neighbour) new Image().src = neighbour.variants.large.url;
    }
  }, [index, items]);

  return { item, go, hasPrevious: index > 0, hasNext: index < items.length - 1 };
}
