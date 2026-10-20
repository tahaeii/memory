'use client';

import Link from 'next/link';
import type { MediaDto } from '@/entities/media';
import { isStaffRole, useSession } from '@/entities/session';
import { formatDay, formatShortDate, formatTime } from '@/shared/lib/format';

interface ViewerDetailsProps {
  item: MediaDto;
  open: boolean;
  onClose: () => void;
  /** Runs when a link inside the panel is followed, so the viewer closes behind it. */
  onNavigate: () => void;
}

/** Facts about the current item. Access and file details are for staff only. */
export function ViewerDetails({ item, open, onNavigate }: ViewerDetailsProps) {
  const { role } = useSession();
  if (!open) return null;
  const rows = [
    { label: 'Taken', value: formatDay(item.takenAt) + ', ' + formatTime(item.takenAt) },
    { label: item.kind === 'video' ? 'Video' : 'Photo', value: item.width + ' × ' + item.height },
    ...(isStaffRole(role)
      ? [
          { label: 'Access', value: item.visibility === 'private' ? 'Private' : 'Public' },
          { label: 'File', value: item.name },
        ]
      : []),
    ...(item.deletion
      ? [{ label: 'Deleted', value: 'by ' + item.deletion.by + ' on ' + formatShortDate(item.deletion.at) }]
      : []),
  ];
  return (
    <aside className='border-line bg-surface absolute inset-x-0 bottom-0 z-10 max-h-[55%] overflow-y-auto border-t px-5 py-4 md:static md:max-h-none md:w-80 md:shrink-0 md:border-t-0 md:border-l'>
      <h2 className='type-heading'>Details</h2>
      <dl className='mt-3'>
        {item.event && (
          <div className='border-line-soft flex justify-between gap-4 border-t py-3 text-sm'>
            <dt className='text-muted shrink-0'>Event</dt>
            <dd className='min-w-0 text-right font-medium'>
              <Link
                href={'/events/' + item.event.slug}
                onClick={onNavigate}
                className='text-link hover:underline'>
                {item.event.title}
              </Link>
            </dd>
          </div>
        )}
        {rows.map((row) => (
          <div key={row.label} className='border-line-soft flex justify-between gap-4 border-t py-3 text-sm'>
            <dt className='text-muted shrink-0'>{row.label}</dt>
            <dd className='min-w-0 text-right font-medium break-all'>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
