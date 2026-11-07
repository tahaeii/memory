'use client';

import { Play } from 'lucide-react';
import { t } from '@i18n';
import { cn } from '@/shared/lib/cn';
import { Spinner } from '../Spinner';
import { useVideoPlayer } from './use-video-player';
import { VideoControls } from './VideoControls';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  /** Known length in seconds, shown until the browser has read the file's own. */
  duration?: number;
  autoPlay?: boolean;
  /** Space/K play-pause, M mute and F fullscreen while nothing else has focus. */
  hotkeys?: boolean;
  className?: string;
}

/**
 * A small video player on top of the native <video> element: play/pause, seeking (with buffered
 * progress), volume, fullscreen and keyboard shortcuts. Controls fade out while the video plays.
 */
export function VideoPlayer({
  src,
  poster,
  duration = 0,
  autoPlay = false,
  hotkeys = false,
  className,
}: VideoPlayerProps) {
  const { rootRef, videoRef, videoEvents, state, commands } = useVideoPlayer({
    knownDuration: duration,
    hotkeys,
  });

  return (
    <div
      ref={rootRef}
      onPointerMove={commands.wake}
      onPointerDown={commands.wake}
      className={cn(
        'relative isolate flex items-center justify-center overflow-hidden bg-black',
        !state.controlsVisible && 'cursor-none',
        className,
      )}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload='metadata'
        className='h-full w-full object-contain'
        {...videoEvents}
      />

      {state.failed ? (
        <p className='absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-white/80'>
          {t('ui.video.failed')}
        </p>
      ) : state.waiting ? (
        <Spinner className='pointer-events-none absolute size-9 text-white/80' />
      ) : (
        !state.playing && (
          <button
            type='button'
            onClick={commands.togglePlay}
            aria-label={t('ui.video.play')}
            className='animate-pop-in absolute grid size-16 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-[background-color,scale] duration-300 hover:scale-105 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-95'>
            <Play className='ml-1 size-7' fill='currentColor' />
          </button>
        )
      )}

      <VideoControls state={state} commands={commands} />
    </div>
  );
}
