'use client';

import { useRef, type MouseEvent, type PointerEvent } from 'react';

/**
 * Horizontal swipe to move between items. Pointer-downs inside `[data-no-swipe]` (player controls)
 * are ignored, and the click that ends a swipe is swallowed so it does not also pause the video.
 */
export function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const target = event.target as Element;
      start.current = target.closest('[data-no-swipe]') ? null : { x: event.clientX, y: event.clientY };
      swiped.current = false;
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const from = start.current;
      start.current = null;
      if (!from) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swiped.current = true;
        onSwipe(dx < 0 ? 1 : -1);
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (!swiped.current) return;
      swiped.current = false;
      event.stopPropagation();
      event.preventDefault();
    },
  };
}
