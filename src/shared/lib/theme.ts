export type Theme = 'light' | 'dark';

/** Remembers the chosen colour theme. Not a secret: readable by scripts on purpose. */
export const THEME_COOKIE = 'gallery_theme';

/** The gallery is dark by default (photos look best on it); visitors can switch to light. */
export const DEFAULT_THEME: Theme = 'dark';

export function parseTheme(value: string | undefined): Theme {
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME;
}

/** Browser bar colour per theme (BackGround Color 1 g). */
export const THEME_COLOR: Record<Theme, string> = { light: '#f4f6fb', dark: '#0f1520' };
