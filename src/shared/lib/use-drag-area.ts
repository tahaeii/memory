'use client';

import type { PointerEvent } from 'react';

const fraction = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Pointer handlers for a surface that is pressed or dragged across, such as a slider track.
 * `onMove` receives the position inside the element as fractions from 0 to 1. Give the element
 * `touch-none` so a finger drags the control instead of scrolling the page.
 */
export function useDragArea(onMove: (x: number, y: number) => void) {
  const report = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onMove(
      fraction((event.clientX - rect.left) / rect.width),
      fraction((event.clientY - rect.top) / rect.height),
    );
  };
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      report(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) report(event);
    },
  };
}
