import { CircleAlert } from 'lucide-react';
import { t } from '@i18n';
import type { MediaDto } from '@/entities/media';
import { Spinner } from '@/shared/ui/Spinner';

/** What staff see for a video that is still converting, or failed to. */
export function VideoPending({ item }: { item: MediaDto }) {
  const video = item.video;
  const failed = video?.status === 'failed';
  return (
    <div className='relative grid h-full place-items-center overflow-hidden sm:rounded-lg'>
      <img
        src={item.variants.large.url}
        alt=''
        className='absolute inset-0 h-full w-full object-contain opacity-30 blur-sm'
      />
      <div className='relative max-w-sm px-6 text-center'>
        {failed ? (
          <CircleAlert className='text-danger mx-auto size-8' />
        ) : (
          <Spinner className='text-muted mx-auto size-8' />
        )}
        <p className='mt-4 font-medium'>
          {failed ? t('viewer.pending.failedTitle') : t('viewer.pending.convertingTitle')}
        </p>
        <p className='text-muted mt-1 text-sm'>
          {failed
            ? (video?.error ?? t('viewer.pending.failedHint'))
            : video?.progress == null
              ? t('viewer.pending.waiting')
              : t('viewer.pending.progress', { percent: Math.round(video.progress * 100) })}
        </p>
      </div>
    </div>
  );
}
