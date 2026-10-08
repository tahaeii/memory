'use client';

import { useCallback, useRef, useState, type PointerEvent, type WheelEvent } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

/** Zoom (buttons, wheel, double click), drag-to-pan when zoomed, and swipe when not zoomed. */
export function useZoomPan(resetKey: string, onSwipe: (direction: 1 | -1) => void) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const origin = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Start every photo un-zoomed (state is adjusted while rendering, not in an effect).
  const [shownKey, setShownKey] = useState(resetKey);
  if (shownKey !== resetKey) {
    setShownKey(resetKey);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  const zoomTo = useCallback((next: number) => {
    const value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(value);
    if (value === MIN_SCALE) setOffset({ x: 0, y: 0 });
  }, []);

  const bind = {
    onWheel: (event: WheelEvent<HTMLElement>) => zoomTo(scale - event.deltaY * 0.002),
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      origin.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
      setDragging(true);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const start = origin.current;
      if (!start || scale === 1) return;
      setOffset({ x: start.ox + event.clientX - start.x, y: start.oy + event.clientY - start.y });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const start = origin.current;
      origin.current = null;
      setDragging(false);
      if (!start || scale > 1) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => {
      origin.current = null;
      setDragging(false);
    },
  };

  return {
    scale,
    offset,
    dragging,
    reset,
    zoomIn: () => zoomTo(scale + 0.75),
    zoomOut: () => zoomTo(scale - 0.75),
    toggle: () => (scale > 1 ? reset() : zoomTo(2.5)),
    bind,
  };
}
