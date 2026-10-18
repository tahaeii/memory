'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { isSectionId, type SectionId } from '../config/sections';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const readHash = (): string => window.location.hash.slice(1);

/**
 * The open dashboard section. It lives in the address (#upload, #events…), so a reload or a shared
 * link keeps it, and the browser's back button works inside the dashboard.
 */
export function useSection(available: readonly SectionId[], fallback: SectionId) {
  const hash = useSyncExternalStore(subscribe, readHash, () => '');
  const section = isSectionId(hash) && available.includes(hash) ? hash : fallback;

  const open = useCallback((next: SectionId) => {
    window.history.replaceState(null, '', '#' + next);
    // replaceState does not announce itself; tell the subscribers.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  return [section, open] as const;
}
