'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { formatDay } from '@/shared/lib/format';
import { VideoPlayer } from '@/shared/ui/VideoPlayer';
import { useSwipe } from '../model/use-swipe';
import type { useZoomPan } from '../model/use-zoom-pan';
import { VideoPending } from './VideoPending';

interface ViewerStageProps {
  item: MediaDto;
  zoom: ReturnType<typeof useZoomPan>;
  hasPrevious: boolean;
  hasNext: boolean;
  onGo: (delta: 1 | -1) => void;
}

const arrow =
  'absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white/85 backdrop-blur-md transition-[background-color,opacity,scale] hover:bg-black/65 hover:text-white active:scale-90 focus-visible:outline-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-0 sm:size-12';

/** The photo (with zoom and pan) or the video, and the arrows on either side of it. */
export function ViewerStage({ item, zoom, hasPrevious, hasNext, onGo }: ViewerStageProps) {
  const swipe = useSwipe(onGo);
  const { medium, large } = item.variants;

  return (
    <div className='relative min-h-0 min-w-0 flex-1'>
      {item.kind === 'photo' ? (
        <div
          className={cn(
            'absolute inset-0 touch-none select-none',
            zoom.scale > 1 ? (zoom.dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
          )}
          onDoubleClick={zoom.toggle}
          {...zoom.bind}>
          <img
            key={item.id}
            src={large.url}
            srcSet={medium.url + ' ' + medium.width + 'w, ' + large.url + ' ' + large.width + 'w'}
            sizes='100vw'
            alt={formatDay(item.takenAt)}
            draggable={false}
            className='animate-zoom-in h-full w-full bg-contain bg-center bg-no-repeat object-contain p-2 sm:p-5'
            style={{
              transform:
                'translate(' + zoom.offset.x + 'px, ' + zoom.offset.y + 'px) scale(' + zoom.scale + ')',
              transition: zoom.dragging ? 'none' : 'transform var(--duration-base) var(--ease-out)',
              backgroundImage: 'url(' + item.placeholder + ')',
              backgroundOrigin: 'content-box',
            }}
          />
        </div>
      ) : (
        <div className='absolute inset-0 touch-pan-y sm:p-5 sm:px-16' {...swipe}>
          {item.video?.url ? (
            <VideoPlayer
              key={item.id}
              src={item.video.url}
              poster={large.url}
              duration={item.video.duration}
              autoPlay
              hotkeys
              className='animate-zoom-in h-full w-full sm:rounded-lg'
            />
          ) : (
            <VideoPending item={item} />
          )}
        </div>
      )}
      <button
        type='button'
        className={cn(arrow, 'left-2 sm:left-3')}
        onClick={() => onGo(-1)}
        disabled={!hasPrevious}
        aria-label='Previous'>
        <ChevronLeft className='size-5 sm:size-6' />
      </button>
      <button
        type='button'
        className={cn(arrow, 'right-2 sm:right-3')}
        onClick={() => onGo(1)}
        disabled={!hasNext}
        aria-label='Next'>
        <ChevronRight className='size-5 sm:size-6' />
      </button>
    </div>
  );
}
