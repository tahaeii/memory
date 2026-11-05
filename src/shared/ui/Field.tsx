import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { FieldError } from './FieldError';

interface FieldProps {
  label: string;
  /** A short remark after the label, e.g. "optional". */
  hint?: string;
  /** A line under the control that says what is expected. */
  help?: ReactNode;
  /** What is wrong with the value, from validation. */
  error?: string;
  children: ReactNode;
  className?: string;
  /**
   * `label` (default) wraps a native input, so a click on the text focuses it. Use `group` for
   * controls built from buttons (Select, DatePicker), which would otherwise open on every click.
   */
  as?: 'label' | 'group';
}

/** A caption above a form control, with optional help and a validation message below it. */
export function Field({ label, hint, help, error, children, className, as = 'label' }: FieldProps) {
  const content = (
    <>
      <span className='mb-1.5 block text-sm font-medium'>
        {label}
        {hint && <span className='text-muted font-normal'> ({hint})</span>}
      </span>
      {children}
      {help && <span className='text-muted mt-1.5 block text-[13px] leading-snug font-normal'>{help}</span>}
      <FieldError message={error} />
    </>
  );
  if (as === 'group') {
    return (
      <div role='group' aria-label={label} className={cn('block', className)}>
        {content}
      </div>
    );
  }
  return <label className={cn('block', className)}>{content}</label>;
}
