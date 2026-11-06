'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Lets one marker slide between the items of a list (the dashboard menu, the main navigation)
 * instead of every item switching its own marker on and off.
 *
 * Put `containerRef` on a positioned parent, `indicatorRef` on an absolutely positioned child at its
 * top left corner, and `data-current="true"` on the current item. The marker is moved by writing
 * its size and position straight to the element, so nothing re-renders. Until it is placed the
 * container has no `data-indicator` attribute; items can show their own marker while that is so,
 * which is what the server renders.
 */
export function useIndicator<C extends HTMLElement, I extends HTMLElement>(current: string | null) {
  const containerRef = useRef<C>(null);
  const indicatorRef = useRef<I>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const place = () => {
      const item = container.querySelector<HTMLElement>('[data-current="true"]');
      const visible = item !== null && item.offsetWidth > 0;
      indicator.style.opacity = visible ? '1' : '0';
      if (!visible) return;
      indicator.style.width = item.offsetWidth + 'px';
      indicator.style.height = item.offsetHeight + 'px';
      indicator.style.translate = item.offsetLeft + 'px ' + item.offsetTop + 'px';
    };

    place();
    container.dataset.indicator = 'placed';
    // Slide only from the second placement on, so the marker does not fly in from the corner.
    const frame = requestAnimationFrame(() => (indicator.dataset.slide = 'true'));
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [current]);

  return { containerRef, indicatorRef };
}
