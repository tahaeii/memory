'use client';

import type { ReactNode } from 'react';
import { usePresence } from '@/shared/lib/use-presence';

/**
 * A toolbar that floats over the bottom of the page while there is something to act on (selected
 * items). It rises in and sinks out, so it never appears or vanishes in a single frame.
 */
export function FloatingBar({ open, children }: { open: boolean; children: ReactNode }) {
  const { mounted, state } = usePresence(open);
  if (!mounted) return null;
  return (
    <div
      role='toolbar'
      data-state={state}
      className='data-[state=closed]:animate-rise-out data-[state=open]:animate-rise-in border-line bg-glass shadow-overlay fixed inset-x-3 bottom-4 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border p-2 pl-4 backdrop-blur-xl'>
      {children}
    </div>
  );
}
