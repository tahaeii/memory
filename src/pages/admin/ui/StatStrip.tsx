import { t } from '@i18n';
import type { LibrarySummaryDto } from '@/entities/media';
import { formatBytes, formatCount } from '@/shared/lib/format';

interface StatStripProps {
  summary: LibrarySummaryDto;
  eventCount: number;
  /** Accounts without private access see the number of events instead of private items. */
  showPrivate: boolean;
}

/** Four numbers about the library in one quiet strip, so the work below it stays near the top. */
export function StatStrip({ summary, eventCount, showPrivate }: StatStripProps) {
  const stats = [
    { label: t('admin.stats.photos'), value: formatCount(summary.photoCount) },
    { label: t('admin.stats.videos'), value: formatCount(summary.videoCount) },
    showPrivate
      ? { label: t('admin.stats.private'), value: formatCount(summary.privateCount) }
      : { label: t('admin.stats.events'), value: formatCount(eventCount) },
    { label: t('admin.stats.disk'), value: formatBytes(summary.totalBytes) },
  ];
  return (
    <dl className='border-line bg-surface divide-line-soft mt-6 grid grid-cols-2 overflow-hidden rounded-xl border lg:grid-cols-4 lg:divide-x max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className='border-line-soft flex min-w-0 items-baseline justify-between gap-3 px-4 py-3 sm:px-5'>
          <dt className='text-muted truncate text-sm'>{stat.label}</dt>
          <dd className='shrink-0 text-lg font-semibold tracking-tight tabular-nums'>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
