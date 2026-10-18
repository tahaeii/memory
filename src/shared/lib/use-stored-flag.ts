'use client';

import { useCallback, useSyncExternalStore } from 'react';

const CHANGE_EVENT = 'storedflagchange';

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage can be switched off (private windows, strict settings); behave as if nothing is stored.
    return null;
  }
}

/**
 * A small value remembered in this browser, such as "this reminder was closed". Returns the stored
 * value (null when nothing is stored, and always null on the server) and a setter.
 */
export function useStoredFlag(key: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const store = useCallback(
    (next: string | null) => {
      try {
        if (next === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, next);
      } catch {
        // Nothing to do: the flag simply will not survive a reload.
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key],
  );

  return [value, store] as const;
}
