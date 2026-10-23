import { contrastRatio, hexToOklch, oklchToHex, readableOn, type Oklch } from '../color';

export type Mode = 'light' | 'dark';
/** CSS custom properties, e.g. `{ '--primary': '#2f5bd0' }`. */
export type ThemeVars = Record<string, string>;

/** Smallest contrast for text, WCAG AA. */
const TEXT_CONTRAST = 4.5;
/** A brand colour darker than this is lifted in the dark theme, where it would sink into the page. */
const DARK_MODE_MIN_LIGHTNESS = 0.7;

const tone = (base: Oklch, l: number, maxChroma: number, chromaScale = 1): string =>
  oklchToHex({ l, c: Math.min(base.c * chromaScale, maxChroma), h: base.h });

/** Moves a colour darker (light theme) or lighter (dark theme) until text in it is readable on `background`. */
function readableTint(start: Oklch, background: string, mode: Mode): string {
  const step = mode === 'light' ? -0.01 : 0.01;
  let color = start;
  let hex = oklchToHex(color);
  for (let i = 0; i < 100 && contrastRatio(hex, background) < TEXT_CONTRAST; i += 1) {
    color = { ...color, l: color.l + step };
    hex = oklchToHex(color);
  }
  return hex;
}

/** The fill used for buttons: the brand colour itself, lifted in the dark theme when it is too dark. */
function fill(base: Oklch, hex: string, mode: Mode): Oklch & { hex: string } {
  if (mode === 'light' || base.l >= DARK_MODE_MIN_LIGHTNESS) return { ...base, hex };
  const lifted = { l: 0.74, c: Math.min(base.c, 0.16), h: base.h };
  return { ...lifted, hex: oklchToHex(lifted) };
}

/** Every primary token for one theme, derived from a single brand colour. */
export function primaryScale(hex: string, mode: Mode): ThemeVars {
  const base = hexToOklch(hex);
  const main = fill(base, hex.toLowerCase(), mode);
  const soft = mode === 'light' ? tone(base, 0.962, 0.035, 0.3) : tone(base, 0.245, 0.05, 0.4);
  // Hover moves towards the middle: dark fills get lighter, light fills darker.
  const hoverShift = main.l < 0.62 ? 0.045 : -0.045;
  const linkStart = mode === 'light' ? Math.min(base.l, 0.52) : Math.max(main.l, 0.76);
  return {
    '--primary': main.hex,
    '--primary-hover': oklchToHex({ ...main, l: main.l + hoverShift }),
    '--primary-pressed': oklchToHex({ ...main, l: Math.max(0.15, main.l - 0.07) }),
    '--primary-soft': soft,
    '--on-primary': readableOn(main.hex),
    '--link': readableTint({ ...base, l: linkStart }, soft, mode),
  };
}

/** The secondary tokens: a fill, a pale background and text that is readable on that background. */
export function secondaryScale(hex: string, mode: Mode): ThemeVars {
  const base = hexToOklch(hex);
  const main = fill(base, hex.toLowerCase(), mode);
  const soft = mode === 'light' ? tone(base, 0.955, 0.04, 0.35) : tone(base, 0.25, 0.05, 0.4);
  const strongStart = mode === 'light' ? Math.min(base.l, 0.45) : Math.max(main.l, 0.8);
  return {
    '--secondary': main.hex,
    '--secondary-soft': soft,
    '--secondary-strong': readableTint({ ...base, l: strongStart }, soft, mode),
  };
}
