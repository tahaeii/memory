'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_COLOR, THEME_COOKIE, type Theme } from '@/shared/lib/theme';

const CHANGE_EVENT = 'themechange';
const ONE_YEAR_SECONDS = 31_536_000;

function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Applies a theme to the document and remembers it in a cookie the server reads on the next request. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document.cookie =
    THEME_COOKIE +
    '=' +
    theme +
    '; path=/; max-age=' +
    ONE_YEAR_SECONDS +
    '; samesite=lax' +
    (location.protocol === 'https:' ? '; secure' : '');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** The current colour theme (null until hydrated) and a function that switches it. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const toggle = useCallback(() => applyTheme(readTheme() === 'dark' ? 'light' : 'dark'), []);
  return { theme, toggle };
}
