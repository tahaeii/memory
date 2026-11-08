'use client';

import Link from 'next/link';
import { Globe, Lock, X } from 'lucide-react';
import { t } from '@i18n';
import type { MediaDto } from '@/entities/media';
import { isStaffRole, useSession } from '@/entities/session';
import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import { describeMedia, type DetailRow } from '../lib/details';

interface ViewerDetailsProps {
  item: MediaDto;
  open: boolean;
  onClose: () => void;
  /** Runs when a link inside the panel is followed, so the viewer closes behind it. */
  onNavigate: () => void;
}

function Value({ row, onNavigate }: { row: DetailRow; onNavigate: () => void }) {
  if (row.href)
    return (
      <Link href={row.href} onClick={onNavigate} className='link-underline text-link'>
        {row.value}
      </Link>
    );
  if (row.tone) {
    const Icon = row.tone === 'private' ? Lock : Globe;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5',
          row.tone === 'private' ? 'text-warning-fg' : 'text-success-fg',
        )}>
        <Icon aria-hidden className='size-3.5' />
        {row.value}
      </span>
    );
  }
  return <>{row.value}</>;
}

/**
 * Facts about the current item. On a phone it is a sheet that slides up over the bottom of the
 * photo; from tablet width it is a column that opens beside the photo, which makes room for it.
 * It stays mounted while closed so both directions animate.
 */
export function ViewerDetails({ item, open, onClose, onNavigate }: ViewerDetailsProps) {
  const { role } = useSession();
  const rows = describeMedia(item, isStaffRole(role));
  return (
    <aside
      aria-label={t('viewer.details.title')}
      inert={!open}
      className={cn(
        'bg-surface z-20 shrink-0 transition-[translate,width,border-color] duration-300 ease-out',
        'max-md:shadow-overlay max-md:border-line max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[75%] max-md:overflow-y-auto max-md:overscroll-contain max-md:rounded-t-2xl max-md:border-t',
        'md:overflow-hidden md:border-l',
        open
          ? 'md:border-line max-md:translate-y-0 md:w-[21rem]'
          : 'max-md:translate-y-full md:w-0 md:border-transparent',
      )}>
      <div className='px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:h-full md:w-[21rem] md:overflow-y-auto md:pt-4'>
        <span aria-hidden className='bg-line-strong mx-auto mb-2 block h-1 w-9 rounded-full md:hidden' />
        <div className='flex items-center justify-between'>
          <h2 className='type-heading'>{t('viewer.details.title')}</h2>
          <IconButton label={t('viewer.details.close')} size='sm' onClick={onClose} className='-mr-1.5'>
            <X className='size-4' />
          </IconButton>
        </div>
        <dl className='mt-2'>
          {rows.map((row) => (
            <div
              key={row.label}
              className='border-line-soft grid grid-cols-[5.5rem_1fr] gap-3 border-t py-3 text-sm'>
              <dt className='text-muted'>{row.label}</dt>
              <dd className='min-w-0 font-medium [overflow-wrap:anywhere]'>
                <Value row={row} onNavigate={onNavigate} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
