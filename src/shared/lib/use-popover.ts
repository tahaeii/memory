'use client';

import { useCallback, useRef, useState } from 'react';
import { useDismiss } from './use-dismiss';

export type PopoverSide = 'top' | 'bottom';

/**
 * Open state for a menu anchored to a button. `rootRef` goes on the element that wraps both the
 * button and the panel. The panel opens upwards when there is not enough room below the button
 * (for example in the toolbar at the bottom of the screen).
 */
export function usePopover(panelHeight = 320) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<PopoverSide>('bottom');

  const close = useCallback(() => setOpen(false), []);

  const show = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setSide(below < panelHeight && rect.top > below ? 'top' : 'bottom');
    }
    setOpen(true);
  }, [panelHeight]);

  const toggle = useCallback(() => (open ? close() : show()), [open, close, show]);

  useDismiss(rootRef, open, close);

  return { rootRef, open, side, show, close, toggle };
}
