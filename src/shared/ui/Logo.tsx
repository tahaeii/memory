import { cn } from '@/shared/lib/cn';

/** The organisation's logo (uploaded in Dashboard › Branding, else app/icon.svg) and the site name. */
export function Logo({ name, src, className }: { name: string; src: string; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt='' width={32} height={32} className='size-8 shrink-0 rounded-lg object-contain' />
      <span className='font-display text-fg truncate text-[17px] font-semibold tracking-tight'>{name}</span>
    </span>
  );
}
