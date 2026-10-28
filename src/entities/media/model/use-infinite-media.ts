'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { messageOf } from '@/shared/lib/error-message';
import { fetchMediaPage } from '../api/media-api';
import type { MediaDto, MediaFilters, MediaPageDto } from './types';

/**
 * Keeps a growing list of items and loads the next page when the sentinel element scrolls near
 * the viewport. Pass `initial = null` to fetch on mount, and change `reloadToken` to start over.
 */
export function useInfiniteMedia(
  initial: MediaPageDto | null,
  filters: MediaFilters,
  reloadToken = 0,
  /** Items per request when loading more (the server default when omitted). */
  pageSize?: number,
) {
  const { event, year, visibility, kind, deleted, deletedBy } = filters;
  const [items, setItems] = useState<MediaDto[]>(initial?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(initial?.nextCursor ?? null);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [loading, setLoading] = useState(initial === null);
  const [error, setError] = useState<string | null>(null);
  // A callback ref, so the observer is attached whenever the sentinel element mounts.
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const busy = useRef(false);
  const generation = useRef(0);
  // The filters the current list was loaded for. The first page comes from the server, so nothing is
  // fetched until the filters or the reload token change (also safe when effects run twice in dev).
  const loadedKey = JSON.stringify([event, year, visibility, kind, deleted, deletedBy, reloadToken]);
  const lastKey = useRef(initial !== null ? loadedKey : null);

  const reload = useCallback(async () => {
    generation.current += 1;
    const current = generation.current;
    busy.current = false;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchMediaPage({
        event,
        year,
        visibility,
        kind,
        deleted,
        deletedBy,
        limit: pageSize,
      });
      if (current !== generation.current) return;
      setItems(page.items);
      setCursor(page.nextCursor);
      setTotal(page.total);
    } catch (caught) {
      if (current === generation.current) setError(messageOf(caught, 'Could not load the library.'));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [event, year, visibility, kind, deleted, deletedBy, pageSize]);

  const loadMore = useCallback(async () => {
    if (!cursor || busy.current) return;
    busy.current = true;
    const current = generation.current;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchMediaPage({
        event,
        year,
        visibility,
        kind,
        deleted,
        deletedBy,
        cursor,
        limit: pageSize,
      });
      if (current !== generation.current) return;
      setItems((previous) => [...previous, ...page.items]);
      setCursor(page.nextCursor);
    } catch (caught) {
      setError(messageOf(caught, 'Could not load more.'));
    } finally {
      busy.current = false;
      if (current === generation.current) setLoading(false);
    }
  }, [cursor, event, year, visibility, kind, deleted, deletedBy, pageSize]);

  /** Swaps in newer copies of items that are already in the list (matched by id). */
  const replace = useCallback((updated: MediaDto[]) => {
    if (updated.length === 0) return;
    const byId = new Map(updated.map((item) => [item.id, item]));
    setItems((previous) => previous.map((item) => byId.get(item.id) ?? item));
  }, []);

  useEffect(() => {
    if (lastKey.current === loadedKey) return;
    lastKey.current = loadedKey;
    void reload();
  }, [reload, loadedKey]);

  useEffect(() => {
    if (!sentinel || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '900px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, cursor, loadMore]);

  return {
    items,
    total,
    hasMore: cursor !== null,
    loading,
    error,
    loadMore,
    reload,
    replace,
    sentinelRef: setSentinel,
  };
}
