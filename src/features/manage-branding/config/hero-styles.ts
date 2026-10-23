import type { HeroStyle } from '@contracts/branding';

/** The ways the home page can open, in the order they are offered. */
export const HERO_STYLE_OPTIONS: ReadonlyArray<{ value: HeroStyle; title: string; hint: string }> = [
  { value: 'wall', title: 'Photo wall', hint: 'Text beside slowly moving columns of recent photos.' },
  {
    value: 'filmstrip',
    title: 'Filmstrip',
    hint: 'Centred text above two rows of photos drifting sideways.',
  },
  { value: 'mosaic', title: 'Mosaic', hint: 'Text beside an editorial grid of five recent photos.' },
  {
    value: 'slideshow',
    title: 'Slideshow',
    hint: 'Recent photos one after another, across the whole width.',
  },
  { value: 'cover', title: 'Cover photo', hint: "The latest event's cover across the whole width." },
  { value: 'editorial', title: 'Editorial', hint: 'A large headline with small photos set into the words.' },
  { value: 'minimal', title: 'Minimal', hint: 'Logo and words only, no photos.' },
];
