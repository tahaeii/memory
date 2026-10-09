/**
 * Colour conversion between sRGB hex and OKLCH (Björn Ottosson's OKLab in polar form).
 * OKLCH is perceptually even: changing `l` alone keeps the hue, which is what tints and shades need.
 */
export interface Oklch {
  /** Lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma, 0 (grey) to about 0.37 (the most vivid sRGB colours). */
  c: number;
  /** Hue angle in degrees. */
  h: number;
}

type Rgb = [number, number, number];

const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_PATTERN.test(value);
}

/** "#3a8dff" to gamma-encoded channels between 0 and 1. */
export function hexToRgb(hex: string): Rgb {
  const match = HEX_PATTERN.exec(hex);
  if (!match) throw new Error('Not a #rrggbb colour: ' + hex);
  const value = parseInt(match[1], 16);
  return [(value >> 16) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255];
}

function rgbToHex(rgb: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + rgb.map(channel).join('');
}

export const toLinear = (value: number): number =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const toGamma = (value: number): number =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bb);
  // Greys have no meaningful hue; keep it at 0 so later maths stays stable.
  const hue = chroma < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: lightness, c: chroma, h: hue };
}

function oklchToLinearRgb({ l, c, h }: Oklch): Rgb {
  const angle = (h * Math.PI) / 180;
  const a = c * Math.cos(angle);
  const b = c * Math.sin(angle);
  const lc = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mc = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sc = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ];
}

const inGamut = (rgb: Rgb): boolean => rgb.every((value) => value >= -1e-4 && value <= 1 + 1e-4);

/**
 * OKLCH to hex. Colours outside sRGB keep their lightness and hue and lose chroma until they fit,
 * so a tint never drifts to another hue.
 */
export function oklchToHex(color: Oklch): string {
  const target = { ...color, l: Math.min(1, Math.max(0, color.l)) };
  let rgb = oklchToLinearRgb(target);
  if (!inGamut(rgb)) {
    let low = 0;
    let high = target.c;
    for (let step = 0; step < 18; step += 1) {
      const middle = (low + high) / 2;
      if (inGamut(oklchToLinearRgb({ ...target, c: middle }))) low = middle;
      else high = middle;
    }
    rgb = oklchToLinearRgb({ ...target, c: low });
  }
  return rgbToHex(rgb.map(toGamma) as Rgb);
}
