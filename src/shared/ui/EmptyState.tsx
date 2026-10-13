import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  /** What to do about it, e.g. a button that opens the uploader. */
  action?: ReactNode;
}

/** Two prints, one on top of the other, with nothing on them yet. */
function BlankPrints() {
  return (
    <svg
      aria-hidden
      viewBox='0 0 88 64'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='text-faint mx-auto h-16 w-[5.5rem]'>
      <rect x='10' y='14' width='48' height='40' rx='3' transform='rotate(-7 34 34)' opacity='0.55' />
      <rect x='30' y='8' width='48' height='40' rx='3' className='fill-surface' />
      <path d='M36 40l10-11 7 7 5-5 14 9' opacity='0.8' />
      <circle cx='65' cy='19' r='3.5' />
    </svg>
  );
}

/** Shown where photos, events or results would be. The corner marks frame it like a viewfinder. */
export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className='frame-marks text-line-strong px-6 py-14 text-center sm:py-20'>
      <BlankPrints />
      <h3 className='type-heading text-fg mt-5'>{title}</h3>
      {children && <div className='text-muted mx-auto mt-1.5 max-w-sm text-sm text-pretty'>{children}</div>}
      {action && <div className='mt-6 flex justify-center'>{action}</div>}
    </div>
  );
}
