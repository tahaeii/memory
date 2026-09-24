import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface NoticeProps {
  tone: 'warning' | 'success' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

const tones = {
  warning: 'bg-warning-soft text-warning-fg',
  success: 'bg-success-soft text-success-fg',
  error: 'bg-danger-soft text-danger',
  info: 'bg-primary-soft text-link',
} as const;

/** A short status message inside a form or a panel. */
export function Notice({ tone, children, className }: NoticeProps) {
  const Icon = tone === 'success' ? CircleCheck : tone === 'info' ? Info : CircleAlert;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-2.5 rounded-xl px-3.5 py-3 text-sm', tones[tone], className)}>
      <Icon className='mt-px size-4 shrink-0' />
      <div className='min-w-0'>{children}</div>
    </div>
  );
}
