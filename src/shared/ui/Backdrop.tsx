import { cn } from '@/shared/lib/cn';

interface BackdropProps {
  /** `contour`: map lines across the area. `halftone`: print dots fading from the top edge. */
  pattern?: 'contour' | 'halftone';
  className?: string;
}

/**
 * A quiet pattern behind an area that has no photos of its own (sign-in pages, empty states, the
 * text-only home page). Place it inside a `relative isolate` parent; it fades out towards the bottom.
 */
export function Backdrop({ pattern = 'contour', className }: BackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        pattern === 'contour' && '[mask-image:linear-gradient(to_bottom,#000_30%,transparent)]',
        className,
      )}>
      <div
        className={cn(
          'absolute inset-0',
          pattern === 'contour'
            ? 'pattern-contour text-line-strong/70'
            : 'pattern-halftone-top text-line-strong',
        )}
      />
    </div>
  );
}
