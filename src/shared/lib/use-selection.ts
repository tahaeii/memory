'use client';

import { useCallback, useEffect, useState } from 'react';

/** A set of selected ids that forgets ids no longer in `available` (e.g. after a reload). */
export function useSelection(available: readonly string[]) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const key = available.join(',');

  useEffect(() => {
    const ids = new Set(key ? key.split(',') : []);
    setSelected((previous) => {
      const kept = [...previous].filter((id) => ids.has(id));
      return kept.length === previous.size ? previous : new Set(kept);
    });
  }, [key]);

  const toggle = useCallback((id: string) => {
    setSelected((previous) => {
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
    selectAll: () => setSelected(new Set(available)),
    clear: () => setSelected(new Set()),
  };
}
