'use client';

import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PopoverSide } from '@/shared/lib/use-popover';
import { usePresence } from '@/shared/lib/use-presence';

interface PopoverPanelProps extends ComponentProps<'div'> {
  open: boolean;
  side?: PopoverSide;
  align?: 'start' | 'end';
}

/**
 * The floating panel of a menu, select or picker. Place it next to its button inside a `relative`
 * wrapper (see usePopover). It animates in and out and is removed from the page while closed.
 */
export function PopoverPanel({
  open,
  side = 'bottom',
  align = 'start',
  className,
  ...rest
}: PopoverPanelProps) {
  const { mounted, state } = usePresence(open);
  if (!mounted) return null;
  return (
    <div
      data-state={state}
      className={cn(
        'border-line bg-surface text-fg shadow-overlay absolute z-40 rounded-xl border',
        'data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in data-[state=closed]:pointer-events-none',
        side === 'top' ? 'bottom-full mb-2 origin-bottom [--pop-from:4px]' : 'top-full mt-2 origin-top',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
      {...rest}
    />
  );
}
