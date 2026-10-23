import { hexToRgb } from './oklch';

/** Hue 0 to 360, saturation and value 0 to 1: the model colour pickers are drawn in. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const channel = (offset: number): string => {
    const k = (offset + h / 60) % 6;
    const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return '#' + channel(5) + channel(3) + channel(1);
}

/**
 * Reads what someone typed into a hex field: with or without "#", three or six digits.
 * Returns `#rrggbb` in lower case, or null while the text is not a colour yet.
 */
export function parseHexInput(text: string): string | null {
  const digits = text.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{6}$/.test(digits)) return '#' + digits;
  if (/^[0-9a-f]{3}$/.test(digits)) return '#' + [...digits].map((digit) => digit + digit).join('');
  return null;
}
