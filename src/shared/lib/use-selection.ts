'use client';

import { useCallback, useMemo, useState } from 'react';

/** A set of selected ids. Ids that are no longer in `available` (e.g. after a reload) drop out. */
export function useSelection(available: readonly string[]) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const key = available.join(',');

  const selected = useMemo(() => {
    const ids = new Set(key ? key.split(',') : []);
    const kept = [...picked].filter((id) => ids.has(id));
    return kept.length === picked.size ? picked : new Set(kept);
  }, [key, picked]);

  const toggle = useCallback((id: string) => {
    setPicked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return {
    selected,
    ids: [...selected],
    toggle,
    selectAll: () => setPicked(new Set(available)),
    clear: () => setPicked(new Set()),
  };
}
