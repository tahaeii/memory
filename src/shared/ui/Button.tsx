import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,translate,scale] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 active:translate-y-0 active:scale-[0.97] active:duration-100';

/* Filled buttons rise a hair under the pointer and settle when pressed; quiet ones only change tone. */
const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-card hover:-translate-y-px hover:bg-primary-hover hover:shadow-raised active:bg-primary-pressed active:shadow-card',
  secondary:
    'border border-line-strong bg-surface text-fg hover:-translate-y-px hover:border-muted/50 hover:shadow-card active:bg-subtle active:shadow-none',
  soft: 'bg-primary-soft text-link hover:bg-primary/15',
  ghost: 'text-muted hover:bg-fg/[0.06] hover:text-fg',
  danger:
    'bg-danger text-white shadow-card hover:-translate-y-px hover:shadow-raised hover:brightness-110 active:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

/** Class names for anything that should look like a button (e.g. a Next.js Link). */
export function buttonStyles(variant: Variant = 'primary', size: Size = 'md', extra?: string): string {
  return cn(base, variants[variant], sizes[size], extra);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles(variant, size, className)}
      {...rest}>
      {/* The label keeps its place while loading, so the button never changes width. */}
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-opacity duration-200',
          loading && 'opacity-0',
        )}>
        {children}
      </span>
      {loading && (
        <span className='animate-fade-in absolute inset-0 grid place-items-center'>
          <Spinner />
        </span>
      )}
    </button>
  );
}
