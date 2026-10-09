import { hexToRgb, toLinear } from './oklch';

/** Relative luminance as defined by WCAG 2. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours, from 1 (same) to 21 (black on white). */
export function contrastRatio(first: string, second: string): number {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Whichever of `light` and `dark` is easier to read on `background`. White wins once it reaches AA. */
export function readableOn(background: string, light = '#ffffff', dark = '#14171c'): string {
  const onLight = contrastRatio(background, light);
  return onLight >= 4.5 || onLight >= contrastRatio(background, dark) ? light : dark;
}
