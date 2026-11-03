import type { HeroStyle } from '@contracts/branding';
import { cn } from '@/shared/lib/cn';

const bar = 'block rounded-full';

/** A tiny drawing of each home page style. */
export function HeroStylePreview({ style }: { style: HeroStyle }) {
  const text = (
    <>
      <span className={cn(bar, 'bg-fg h-1.5 w-4/5')} />
      <span className={cn(bar, 'bg-primary h-1.5 w-3/5')} />
      <span className={cn(bar, 'bg-line-strong h-1 w-full')} />
    </>
  );
  const frame = 'relative block h-20 overflow-hidden rounded-lg';
  switch (style) {
    case 'filmstrip':
      return (
        <span aria-hidden className={cn(frame, 'bg-canvas flex flex-col items-center gap-1 pt-2.5')}>
          <span className={cn(bar, 'bg-fg h-1.5 w-1/2')} />
          <span className={cn(bar, 'bg-primary h-1.5 w-1/3')} />
          <span className='mt-1.5 flex gap-1'>
            {['bg-primary/50', 'bg-secondary/50', 'bg-primary/40', 'bg-secondary/40', 'bg-primary/50'].map(
              (tone, index) => (
                <span key={index} className={cn('block h-5 w-7 rounded', tone)} />
              ),
            )}
          </span>
          <span className='-ml-6 flex gap-1'>
            {['bg-secondary/50', 'bg-primary/40', 'bg-secondary/40', 'bg-primary/50', 'bg-secondary/50'].map(
              (tone, index) => (
                <span key={index} className={cn('block h-5 w-7 rounded', tone)} />
              ),
            )}
          </span>
        </span>
      );
    case 'mosaic':
      return (
        <span aria-hidden className={cn(frame, 'bg-canvas flex gap-3 p-3')}>
          <span className='flex flex-1 flex-col justify-center gap-1.5'>{text}</span>
          <span className='grid flex-1 grid-cols-3 grid-rows-3 gap-0.5'>
            <span className='bg-primary/50 col-span-2 row-span-2 rounded' />
            <span className='bg-secondary/50 rounded' />
            <span className='bg-primary/40 rounded' />
            <span className='bg-secondary/40 rounded' />
            <span className='bg-primary/30 col-span-2 rounded' />
          </span>
        </span>
      );
    case 'minimal':
      return (
        <span
          aria-hidden
          className={cn(frame, 'bg-canvas flex flex-col items-center justify-center gap-1.5')}>
          <span className='bg-primary block size-4 rounded' />
          <span className={cn(bar, 'bg-fg h-1.5 w-1/2')} />
          <span className={cn(bar, 'bg-primary h-1.5 w-1/3')} />
        </span>
      );
    default:
      return (
        <span aria-hidden className={cn(frame, 'bg-canvas flex gap-3 p-3')}>
          <span className='flex flex-1 flex-col justify-center gap-1.5'>{text}</span>
          <span className='grid flex-1 grid-cols-3 gap-1'>
            {[0, 1, 2].map((column) => (
              <span key={column} className={cn('flex flex-col gap-1', column === 1 && '-mt-3')}>
                <span className='bg-primary/50 block h-8 rounded' />
                <span className='bg-secondary/50 block h-10 rounded' />
              </span>
            ))}
          </span>
        </span>
      );
  }
}
