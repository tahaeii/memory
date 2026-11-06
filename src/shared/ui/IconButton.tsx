import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'title'> {
  /** What the button does: read by screen readers and shown as the tooltip. */
  label: string;
  size?: 'sm' | 'md';
  /** Marks a toggle that is switched on. */
  pressed?: boolean;
}

export const iconButtonStyles =
  'grid shrink-0 place-items-center rounded-lg text-muted transition-[background-color,color,scale] duration-300 hover:bg-fg/[0.07] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary active:scale-90 active:duration-100 disabled:pointer-events-none disabled:opacity-35 aria-pressed:bg-fg/10 aria-pressed:text-fg';

/** A square button that holds only an icon. */
export function IconButton({
  label,
  size = 'md',
  pressed,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(iconButtonStyles, size === 'sm' ? 'size-8' : 'size-10', className)}
      {...rest}
    />
  );
}
