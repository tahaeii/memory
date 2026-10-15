'use client';

import { useEffect, useState } from 'react';

/** How long the exit animations in animations.css take (the slowest one, plus a frame). */
export const EXIT_MS = 220;

/**
 * Keeps something mounted for a moment after it closes, so it can animate out.
 * Render while `mounted` is true and put `state` on the element as `data-state`; the
 * `data-[state=open]:animate-*-in` and `data-[state=closed]:animate-*-out` utilities do the rest.
 */
export function usePresence(open: boolean, exitMs = EXIT_MS) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  return { mounted, state: open ? ('open' as const) : ('closed' as const) };
}
