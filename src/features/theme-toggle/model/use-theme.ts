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

/** Where on the screen the switch was pressed, in viewport pixels. */
interface Point {
  x: number;
  y: number;
}

/**
 * Switches the theme with motion. Browsers with view transitions let the new theme spread in a
 * circle from `origin`; the others cross-fade the colours. The rules are in styles/animations.css.
 */
function switchTheme(theme: Theme, origin: Point): void {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return applyTheme(theme);

  if (typeof document.startViewTransition !== 'function') {
    root.dataset.themeSwitch = 'fade';
    applyTheme(theme);
    window.setTimeout(() => delete root.dataset.themeSwitch, 400);
    return;
  }

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  root.style.setProperty('--reveal-x', origin.x + 'px');
  root.style.setProperty('--reveal-y', origin.y + 'px');
  root.style.setProperty('--reveal-radius', radius + 'px');
  root.dataset.themeSwitch = 'reveal';
  const done = () => delete root.dataset.themeSwitch;
  document.startViewTransition(() => applyTheme(theme)).finished.then(done, done);
}

/** The current colour theme (null until hydrated) and a function that switches it from a point on screen. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const toggle = useCallback(
    (origin: Point) => switchTheme(readTheme() === 'dark' ? 'light' : 'dark', origin),
    [],
  );
  return { theme, toggle };
}
