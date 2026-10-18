import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface NoticeProps {
  tone: 'warning' | 'success' | 'error' | 'info';
  children: ReactNode;
  className?: string;
  /** Adds a close button. The caller decides what closing means (hide for now, or remember it). */
  onDismiss?: () => void;
}

const tones = {
  warning: 'bg-warning-soft text-warning-fg',
  success: 'bg-success-soft text-success-fg',
  error: 'bg-danger-soft text-danger',
  info: 'bg-primary-soft text-link',
} as const;

/** A short status message inside a form or a panel. */
export function Notice({ tone, children, className, onDismiss }: NoticeProps) {
  const Icon = tone === 'success' ? CircleCheck : tone === 'info' ? Info : CircleAlert;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm', tones[tone], className)}>
      <Icon className='mt-0.5 size-4 shrink-0' />
      <div className='min-w-0 flex-1 text-pretty'>{children}</div>
      {onDismiss && (
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Dismiss'
          title='Dismiss'
          className='-my-1.5 -mr-2 grid size-8 shrink-0 place-items-center rounded-md opacity-70 transition hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current'>
          <X className='size-4' />
        </button>
      )}
    </div>
  );
}
