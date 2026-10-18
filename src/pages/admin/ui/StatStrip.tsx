import type { LibrarySummaryDto } from '@/entities/media';
import { formatBytes, formatCount } from '@/shared/lib/format';

interface StatStripProps {
  summary: LibrarySummaryDto;
  eventCount: number;
  /** Accounts without private access see the number of events instead of private items. */
  showPrivate: boolean;
}

/** Four numbers about the library in one ruled strip. */
export function StatStrip({ summary, eventCount, showPrivate }: StatStripProps) {
  const stats = [
    { label: 'Photos', value: formatCount(summary.photoCount) },
    { label: 'Videos', value: formatCount(summary.videoCount) },
    showPrivate
      ? { label: 'Private', value: formatCount(summary.privateCount) }
      : { label: 'Events', value: formatCount(eventCount) },
    { label: 'Originals on disk', value: formatBytes(summary.totalBytes) },
  ];
  return (
    <dl className='border-line bg-surface shadow-card divide-line-soft mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border lg:grid-cols-4 lg:divide-x max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r'>
      {stats.map((stat) => (
        <div key={stat.label} className='border-line-soft min-w-0 px-4 py-3.5 sm:px-6 sm:py-5'>
          <dt className='text-muted truncate text-sm'>{stat.label}</dt>
          <dd className='mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]'>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
