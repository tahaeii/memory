'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { usePresence } from '@/shared/lib/use-presence';

/** Removes its content by folding it away, so what is below slides up instead of jumping. */
export function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { mounted, state } = usePresence(open, 340);
  if (!mounted) return null;
  return (
    <div
      data-state={state}
      className={cn(
        'grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-300 data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0',
        className,
      )}>
      <div className='min-h-0 overflow-hidden'>{children}</div>
    </div>
  );
}
