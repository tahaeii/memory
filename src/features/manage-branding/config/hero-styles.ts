import type { HeroStyle } from '@contracts/branding';

/** The ways the home page can open, in the order they are offered. */
export const HERO_STYLE_OPTIONS: ReadonlyArray<{ value: HeroStyle; title: string; hint: string }> = [
  { value: 'minimal', title: 'Minimal', hint: 'Logo and words only, centred in the first screen.' },
  { value: 'wall', title: 'Photo wall', hint: 'Text beside slowly moving columns of recent photos.' },
  {
    value: 'filmstrip',
    title: 'Filmstrip',
    hint: 'Centred text above two rows of photos drifting sideways.',
  },
  { value: 'mosaic', title: 'Mosaic', hint: 'Text beside an editorial grid of five recent photos.' },
];
