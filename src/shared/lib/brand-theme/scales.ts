import { contrastRatio, hexToOklch, oklchToHex, readableOn, type Oklch } from '../color';

export type Mode = 'light' | 'dark';
/** CSS custom properties, e.g. `{ '--primary': '#2f5bd0' }`. */
export type ThemeVars = Record<string, string>;

/** Smallest contrast for text, WCAG AA. */
const TEXT_CONTRAST = 4.5;
/** Smallest contrast between a control and the page behind it, WCAG 1.4.11. */
const CONTROL_CONTRAST = 3;
/** The page colour of each theme that a brand colour has the hardest time standing out from. */
const PAGE: Record<Mode, string> = { light: '#f5f6f8', dark: '#1d2126' };
/** A brand colour darker than this is lifted in the dark theme, where it would sink into the page. */
const DARK_MODE_MIN_LIGHTNESS = 0.7;
/** Below this chroma a colour is a grey: black, white and everything between. */
const GREY_CHROMA = 0.025;
/** Greys have no hue to keep, so they go all the way: near-black in the light theme, near-white in the dark. */
const INK: Record<Mode, number> = { light: 0.22, dark: 0.94 };

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

/**
 * The fill used for buttons, switches and selection: the brand colour itself wherever it stands out
 * from the page. A colour that would vanish (white or yellow on the light page, black or navy on
 * the dark one) is moved just far enough to be seen; greys switch to ink.
 */
function fill(base: Oklch, hex: string, mode: Mode): Oklch & { hex: string } {
  const grey = base.c < GREY_CHROMA;
  const ink = { l: INK[mode], c: 0, h: base.h };
  if (mode === 'dark') {
    if (base.l >= DARK_MODE_MIN_LIGHTNESS) return { ...base, hex };
    const lifted = grey ? ink : { l: 0.74, c: Math.min(base.c, 0.16), h: base.h };
    return { ...lifted, hex: oklchToHex(lifted) };
  }
  if (contrastRatio(hex, PAGE.light) >= CONTROL_CONTRAST) return { ...base, hex };
  if (grey) return { ...ink, hex: oklchToHex(ink) };
  let color = base;
  let darker = hex;
  for (let i = 0; i < 100 && contrastRatio(darker, PAGE.light) < CONTROL_CONTRAST; i += 1) {
    color = { ...color, l: color.l - 0.01 };
    darker = oklchToHex(color);
  }
  return { ...color, hex: darker };
}

/** Every primary token for one theme, derived from a single brand colour. */
export function primaryScale(hex: string, mode: Mode): ThemeVars {
  const base = hexToOklch(hex);
  const main = fill(base, hex.toLowerCase(), mode);
  const soft = mode === 'light' ? tone(base, 0.962, 0.035, 0.3) : tone(base, 0.245, 0.05, 0.4);
  // Hover moves towards the middle: dark fills get lighter, light fills darker.
  const hoverShift = main.l < 0.62 ? 0.045 : -0.045;
  const linkStart = mode === 'light' ? Math.min(main.l, 0.52) : Math.max(main.l, 0.76);
  return {
    '--primary': main.hex,
    '--primary-hover': oklchToHex({ ...main, l: main.l + hoverShift }),
    '--primary-pressed': oklchToHex({ ...main, l: Math.max(0.15, main.l - 0.07) }),
    '--primary-soft': soft,
    '--on-primary': readableOn(main.hex),
    '--link': readableTint({ ...main, l: linkStart }, soft, mode),
  };
}

/** The secondary tokens: a fill, a pale background and text that is readable on that background. */
export function secondaryScale(hex: string, mode: Mode): ThemeVars {
  const base = hexToOklch(hex);
  const main = fill(base, hex.toLowerCase(), mode);
  const soft = mode === 'light' ? tone(base, 0.955, 0.04, 0.35) : tone(base, 0.25, 0.05, 0.4);
  const strongStart = mode === 'light' ? Math.min(main.l, 0.45) : Math.max(main.l, 0.8);
  return {
    '--secondary': main.hex,
    '--secondary-soft': soft,
    '--secondary-strong': readableTint({ ...main, l: strongStart }, soft, mode),
  };
}
