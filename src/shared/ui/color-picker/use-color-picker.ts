'use client';

import { useState, type KeyboardEvent } from 'react';
import { hexToHsv, hsvToHex, parseHexInput, type Hsv } from '@/shared/lib/color';

const clamp = (value: number, max = 1): number => Math.min(max, Math.max(0, value));

/**
 * State of the colour picker. The colour is edited as hue, saturation and brightness, because a
 * hex value forgets the hue of greys: without this the hue slider would jump while dragging
 * through black or white.
 */
export function useColorPicker(color: string, onChange: (hex: string) => void) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [text, setText] = useState(color);
  const [shown, setShown] = useState(color);

  // The colour was changed from outside (a preset, a reset): follow it.
  if (color !== shown) {
    setShown(color);
    setText(color);
    if (hsvToHex(hsv) !== color) setHsv(hexToHsv(color));
  }

  const move = (patch: Partial<Hsv>) => {
    const next = { ...hsv, ...patch };
    setHsv(next);
    const hex = hsvToHex(next);
    if (hex !== color) onChange(hex);
  };

  /** Arrow keys on the saturation and brightness area; with Shift in larger steps. */
  const onAreaKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: clamp(hsv.s - step) },
      ArrowRight: { s: clamp(hsv.s + step) },
      ArrowUp: { v: clamp(hsv.v + step) },
      ArrowDown: { v: clamp(hsv.v - step) },
    };
    const patch = moves[event.key];
    if (!patch) return;
    event.preventDefault();
    move(patch);
  };

  const onHueKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 15 : 3;
    const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    move({ h: clamp(hsv.h + direction * step, 359) });
  };

  return {
    hsv,
    /** The area and the hue track report positions as fractions from 0 to 1. */
    moveArea: (x: number, y: number) => move({ s: x, v: 1 - y }),
    moveHue: (x: number) => move({ h: x * 359 }),
    onAreaKeyDown,
    onHueKeyDown,
    /** The hex field: accepts the colour as soon as what is typed is one. */
    text,
    type: (value: string) => {
      setText(value);
      const hex = parseHexInput(value);
      if (hex && hex !== color) onChange(hex);
    },
    /** Leaving the field tidies up whatever was typed. */
    settleText: () => setText(color),
  };
}
