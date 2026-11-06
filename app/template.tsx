import type { ReactNode } from 'react';

/**
 * Wraps every page and is created anew on each navigation, so a page fades in instead of
 * replacing the last one in a single frame. Opacity only: a transform here would capture the
 * fixed bars (selection, preview) inside it.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className='animate-page'>{children}</div>;
}
