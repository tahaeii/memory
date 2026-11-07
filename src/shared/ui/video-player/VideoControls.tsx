import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { t } from '@i18n';
import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import type { VideoPlayerCommands, VideoPlayerState } from './use-video-player';

const percent = (value: number, total: number): string =>
  (total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0) + '%';

const controlButton =
  'grid size-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white';

/** The seek bar: buffered and played progress, with an invisible range input doing the work. */
function SeekBar({ state, onSeek }: { state: VideoPlayerState; onSeek: (value: number) => void }) {
  const { time, duration, buffered } = state;
  return (
    <div className='group/seek relative flex h-5 items-center rounded-full has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white'>
      <div className='absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5'>
        <div
          className='absolute inset-y-0 left-0 bg-white/35'
          style={{ width: percent(buffered, duration) }}
        />
        <div className='absolute inset-y-0 left-0 bg-white' style={{ width: percent(time, duration) }} />
      </div>
      <span
        aria-hidden
        className='ease-spring absolute size-3 -translate-x-1/2 scale-0 rounded-full bg-white shadow transition-transform group-focus-within/seek:scale-100 group-hover/seek:scale-100'
        style={{ left: percent(time, duration) }}
      />
      <input
        type='range'
        aria-label={t('ui.video.seek')}
        aria-valuetext={formatDuration(time) + ' of ' + formatDuration(duration)}
        min={0}
        max={duration || 0}
        step='any'
        value={Math.min(time, duration || 0)}
        disabled={!duration}
        onChange={(event) => onSeek(Number(event.target.value))}
        className='absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-default'
      />
    </div>
  );
}

interface VideoControlsProps {
  state: VideoPlayerState;
  commands: VideoPlayerCommands;
}

/** The bar at the bottom of the player. It fades out while the video plays and nothing moves. */
export function VideoControls({ state, commands }: VideoControlsProps) {
  const { playing, silent, volume, time, duration, fullscreen, controlsVisible } = state;
  return (
    <div
      data-no-swipe
      className={cn(
        'absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent px-3 pt-10 pb-2 transition-opacity duration-300 sm:px-4',
        controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}>
      <SeekBar state={state} onSeek={commands.seek} />
      <div className='mt-1 flex items-center gap-1 text-white'>
        <button
          type='button'
          className={controlButton}
          onClick={commands.togglePlay}
          aria-label={playing ? t('ui.video.pause') : t('ui.video.play')}>
          {playing ? (
            <Pause className='size-5' fill='currentColor' />
          ) : (
            <Play className='size-5' fill='currentColor' />
          )}
        </button>
        <button
          type='button'
          className={controlButton}
          onClick={commands.toggleMute}
          aria-label={silent ? t('ui.video.unmute') : t('ui.video.mute')}>
          {silent ? <VolumeX className='size-5' /> : <Volume2 className='size-5' />}
        </button>
        <input
          type='range'
          aria-label={t('ui.video.volume')}
          min={0}
          max={1}
          step={0.05}
          value={silent ? 0 : volume}
          onChange={(event) => commands.changeVolume(Number(event.target.value))}
          className='hidden h-1 w-20 cursor-pointer accent-white sm:block'
        />
        <span className='ml-2 text-xs text-white/85 tabular-nums'>
          {formatDuration(time)} / {formatDuration(duration)}
        </span>
        <button
          type='button'
          className={cn(controlButton, 'ml-auto')}
          onClick={commands.toggleFullscreen}
          aria-label={fullscreen ? t('ui.video.exitFullScreen') : t('ui.video.fullScreen')}>
          {fullscreen ? <Minimize className='size-5' /> : <Maximize className='size-5' />}
        </button>
      </div>
    </div>
  );
}
