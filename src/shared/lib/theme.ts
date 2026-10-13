export type Theme = 'light' | 'dark';

/** Remembers the chosen colour theme. Not a secret: readable by scripts on purpose. */
export const THEME_COOKIE = 'gallery_theme';

/** The gallery is dark by default (photos look best on it); visitors can switch to light. */
export const DEFAULT_THEME: Theme = 'dark';

export function parseTheme(value: string | undefined): Theme {
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME;
}

/** Browser bar colour per theme: the canvas token of each. */
export const THEME_COLOR: Record<Theme, string> = { light: '#f5f6f8', dark: '#0d0f12' };
