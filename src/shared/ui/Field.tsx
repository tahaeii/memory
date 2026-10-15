import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface FieldProps {
  label: string;
  /** A short remark after the label, e.g. "optional". */
  hint?: string;
  children: ReactNode;
  className?: string;
  /**
   * `label` (default) wraps a native input, so a click on the text focuses it. Use `group` for
   * controls built from buttons (Select, DatePicker), which would otherwise open on every click.
   */
  as?: 'label' | 'group';
}

/** A caption above a form control. */
export function Field({ label, hint, children, className, as = 'label' }: FieldProps) {
  const caption = (
    <span className='mb-1.5 block text-sm font-semibold'>
      {label}
      {hint && <span className='text-muted font-normal'> ({hint})</span>}
    </span>
  );
  if (as === 'group') {
    return (
      <div role='group' aria-label={label} className={cn('block', className)}>
        {caption}
        {children}
      </div>
    );
  }
  return (
    <label className={cn('block', className)}>
      {caption}
      {children}
    </label>
  );
}
