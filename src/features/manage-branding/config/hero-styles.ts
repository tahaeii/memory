import { t } from '@i18n';
import type { HeroStyle } from '@contracts/branding';

/** The ways the home page can open, in the order they are offered. */
export const HERO_STYLE_OPTIONS: ReadonlyArray<{ value: HeroStyle; title: string; hint: string }> = (
  ['minimal', 'wall', 'filmstrip', 'mosaic'] as const
).map((value) => ({
  value,
  title: t(`branding.styles.${value}.title`),
  hint: t(`branding.styles.${value}.hint`),
}));
