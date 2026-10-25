import type { BrandColors } from '@contracts/branding';
import { isHexColor } from '../color';
import { primaryScale, secondaryScale, type Mode, type ThemeVars } from './scales';

export type { Mode, ThemeVars } from './scales';

/** The built-in colours; tokens/colors.css holds the scales generated from them. */
export const DEFAULT_BRAND_COLORS = { primary: '#2f5bd0', secondary: '#0e8a83' } as const;

/** Token overrides for one theme. Empty when the organisation kept the built-in colours. */
export function brandThemeVars(colors: BrandColors, mode: Mode): ThemeVars {
  return {
    ...(isHexColor(colors.primary) ? primaryScale(colors.primary, mode) : {}),
    ...(isHexColor(colors.secondary) ? secondaryScale(colors.secondary, mode) : {}),
  };
}

const declarations = (vars: ThemeVars): string =>
  Object.entries(vars)
    .map(([name, value]) => name + ':' + value)
    .join(';');

/**
 * A stylesheet that overrides the brand tokens in both themes, or an empty string when there is
 * nothing to override. Values are generated hex colours only, so the result is safe to inline.
 * The selectors outweigh the ones in tokens/colors.css, so the order of the two does not matter.
 */
export function brandThemeCss(colors: BrandColors): string {
  const light = declarations(brandThemeVars(colors, 'light'));
  const dark = declarations(brandThemeVars(colors, 'dark'));
  return light ? 'html:root{' + light + '}html.dark{' + dark + '}' : '';
}

/** What the generator changes so a primary colour stays usable; the branding form explains it. */
export function describePrimary(hex: string): { darkLabels: boolean; lighterInDark: boolean } {
  return {
    darkLabels: primaryScale(hex, 'light')['--on-primary'] !== '#ffffff',
    lighterInDark: primaryScale(hex, 'dark')['--primary'] !== hex.toLowerCase(),
  };
}
