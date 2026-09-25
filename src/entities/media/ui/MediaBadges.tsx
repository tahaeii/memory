import { CircleAlert, Lock, Play } from 'lucide-react';
import { formatDuration } from '@/shared/lib/format';
import { Spinner } from '@/shared/ui/Spinner';
import type { MediaDto } from '../model/types';

const pill =
  'pointer-events-none absolute bottom-2 left-2 inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium text-white backdrop-blur';

/** Overlays for a tile: a lock on private items, and length or conversion state on videos. */
export function MediaBadges({ item }: { item: MediaDto }) {
  const video = item.video;
  return (
    <>
      {item.visibility === 'private' && (
        <span className='pointer-events-none absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-slate-950/55 text-white backdrop-blur'>
          <Lock className='size-3' />
        </span>
      )}
      {video?.status === 'ready' && (
        <span className={pill + ' bg-slate-950/55'}>
          <Play className='size-3' fill='currentColor' />
          {video.duration > 0 && formatDuration(video.duration)}
        </span>
      )}
      {video?.status === 'processing' && (
        <span className={pill + ' bg-slate-950/65'}>
          <Spinner className='size-3' />
          {video.progress === null ? 'Waiting' : 'Converting ' + Math.round(video.progress * 100) + '%'}
        </span>
      )}
      {video?.status === 'failed' && (
        <span className={pill + ' bg-red-600/90'}>
          <CircleAlert className='size-3' />
          Failed
        </span>
      )}
    </>
  );
}
