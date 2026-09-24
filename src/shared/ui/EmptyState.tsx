import type { ReactNode } from 'react';
import { Images } from 'lucide-react';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className='border-line relative grid place-items-center overflow-hidden rounded-3xl border border-dashed px-6 py-20 text-center'>
      <div aria-hidden className='pattern-grid absolute inset-0' />
      <div className='relative'>
        <span className='bg-primary-soft text-link mx-auto grid size-12 place-items-center rounded-2xl'>
          <Images className='size-6' />
        </span>
        <h3 className='font-display mt-4 font-semibold'>{title}</h3>
        {children && <div className='text-muted mx-auto mt-1.5 max-w-sm text-sm'>{children}</div>}
      </div>
    </div>
  );
}
