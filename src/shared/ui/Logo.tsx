import { DEFAULT_LOGO_URL } from '@contracts/branding';
import { cn } from '@/shared/lib/cn';

interface LogoMarkProps {
  /** Logo address: an uploaded logo, or the bundled default. */
  src: string;
  /** Size and corner classes, e.g. `size-8 rounded-lg`. */
  className?: string;
  alt?: string;
}

/**
 * The logo on its own. An uploaded logo is shown as it is. The bundled mark (two stacked prints,
 * the same drawing as app/icon.svg) is drawn here instead, in the organisation's primary colour.
 */
export function LogoMark({ src, className, alt = '' }: LogoMarkProps) {
  if (src !== DEFAULT_LOGO_URL) {
    return <img src={src} alt={alt} className={cn('shrink-0 object-contain', className)} />;
  }
  return (
    <svg
      viewBox='0 0 32 32'
      fill='none'
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn('bg-primary text-on-primary shrink-0 transition-colors', className)}>
      <rect
        x='6.5'
        y='10.5'
        width='14'
        height='14'
        rx='2.5'
        transform='rotate(-9 13.5 17.5)'
        stroke='currentColor'
        strokeOpacity='0.5'
        strokeWidth='1.8'
      />
      <rect x='10.5' y='7.5' width='14' height='14' rx='2.5' fill='currentColor' />
      <path d='M13 18.5L16.2 14.8L18.6 17.4L20 16L22.5 18.5H13Z' className='fill-primary' />
      <circle cx='20.6' cy='11.6' r='1.4' className='fill-primary' />
    </svg>
  );
}

/** The organisation's logo (uploaded in Dashboard › Branding, else the bundled mark) and the site name. */
export function Logo({ name, src, className }: { name: string; src: string; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <LogoMark src={src} className='size-8 rounded-lg' />
      <span className='font-display text-fg truncate text-[17px] font-semibold tracking-tight'>{name}</span>
    </span>
  );
}
