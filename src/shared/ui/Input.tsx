import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/** The look shared by every field: text inputs, the select button and the date button. */
export const fieldStyles =
  'h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-fg outline-none transition-[border-color,box-shadow] placeholder:text-faint hover:border-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-60 sm:text-sm';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldStyles, 'h-auto min-h-24 resize-y py-2.5', className)} {...props} />;
}
