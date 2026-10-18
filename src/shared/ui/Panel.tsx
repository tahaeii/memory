import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PanelProps {
  title: string;
  description?: ReactNode;
  /** Controls on the right of the title. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled card that holds one block of a page, such as a dashboard section. */
export function Panel({ title, description, actions, children, className }: PanelProps) {
  return (
    <section className={cn('border-line bg-surface shadow-card rounded-2xl border p-4 sm:p-6', className)}>
      <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h2 className='type-heading text-lg'>{title}</h2>
          {description && <p className='text-muted mt-1 max-w-2xl text-sm text-pretty'>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
