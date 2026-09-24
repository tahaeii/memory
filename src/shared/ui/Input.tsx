import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export const inputStyles =
  'h-11 w-full rounded-xl border border-line-strong bg-surface px-4 text-sm text-fg outline-none transition placeholder:text-faint focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-60';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputStyles, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputStyles, 'h-auto min-h-24 resize-y py-3', className)} {...props} />;
}

export function Select({
  className,
  containerClassName = 'w-full',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <div className={cn('relative', containerClassName)}>
      <select className={cn(inputStyles, 'appearance-none pr-9', className)} {...props} />
      <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        className='text-muted pointer-events-none absolute inset-y-0 right-3 my-auto size-4'>
        <path strokeLinecap='round' strokeLinejoin='round' d='m6 9 6 6 6-6' />
      </svg>
    </div>
  );
}
