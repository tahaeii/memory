'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { Spinner } from './Spinner';

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

const HIDE_CONTROLS_AFTER_MS = 2500;

/** iPhone Safari cannot put an element in fullscreen, only the video itself. */
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('input, textarea, select, button, a, [contenteditable]') !== null
  );
}

const percent = (value: number, total: number): string =>
  (total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0) + '%';

const controlButton =
  'grid size-9 place-items-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white';

/**
 * A small video player on top of the native <video> element: play/pause, seeking (with buffered
 * progress), volume, fullscreen and keyboard shortcuts. Controls fade out while the video plays.
 */
export function VideoPlayer({
  src,
  poster,
  duration: knownDuration = 0,
  autoPlay = false,
  hotkeys = false,
  className,
}: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(knownDuration);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) video.play().catch(() => undefined);
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    const video = videoRef.current as IosVideo | null;
    if (!root || !video) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else if (root.requestFullscreen) root.requestFullscreen().catch(() => undefined);
    else video.webkitEnterFullscreen?.();
  }, []);

  /** Shows the controls and schedules hiding them again. */
  const wake = useCallback(() => {
    setIdle(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setIdle(true), HIDE_CONTROLS_AFTER_MS);
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  useEffect(() => {
    const sync = () =>
      setFullscreen(document.fullscreenElement !== null && document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (!hotkeys) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isInteractive(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === ' ' || key === 'k') togglePlay();
      else if (key === 'm') toggleMute();
      else if (key === 'f') toggleFullscreen();
      else return;
      event.preventDefault();
      wake();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkeys, togglePlay, toggleMute, toggleFullscreen, wake]);

  function seek(value: number) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    video.currentTime = value;
    setTime(value);
  }

  function changeVolume(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
  }

  function readBuffered(video: HTMLVideoElement) {
    const ranges = video.buffered;
    for (let i = 0; i < ranges.length; i += 1) {
      if (ranges.start(i) <= video.currentTime && video.currentTime <= ranges.end(i)) {
        setBuffered(ranges.end(i));
        return;
      }
    }
  }

  const showControls = !playing || !idle || failed;

  return (
    <div
      ref={rootRef}
      onPointerMove={wake}
      onPointerDown={wake}
      className={cn(
        'relative isolate flex items-center justify-center overflow-hidden bg-black',
        !showControls && 'cursor-none',
        className,
      )}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload='metadata'
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onProgress={(event) => readBuffered(event.currentTarget)}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onError={() => setFailed(true)}
        className='h-full w-full object-contain'
      />

      {failed ? (
        <p className='absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-white/80'>
          This video could not be played. Try downloading it instead.
        </p>
      ) : waiting ? (
        <Spinner className='pointer-events-none absolute size-9 text-white/80' />
      ) : (
        !playing && (
          <button
            type='button'
            onClick={togglePlay}
            aria-label='Play'
            className='bg-white/15 hover:bg-white/25 backdrop-blur-md absolute grid size-16 place-items-center rounded-full text-white shadow-xl transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'>
            <Play className='ml-1 size-7' fill='currentColor' />
          </button>
        )
      )}

      <div
        data-no-swipe
        className={cn(
          'absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent px-3 pt-10 pb-2 transition-opacity duration-300 sm:px-4',
          showControls ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}>
        <div className='group/seek relative flex h-5 items-center rounded-full has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white'>
          <div className='absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/25'>
            <div
              className='absolute inset-y-0 left-0 bg-white/35'
              style={{ width: percent(buffered, duration) }}
            />
            <div
              className='bg-white absolute inset-y-0 left-0'
              style={{ width: percent(time, duration) }}
            />
          </div>
          <span
            aria-hidden
            className='absolute size-3 -translate-x-1/2 scale-0 rounded-full bg-white shadow transition-transform group-focus-within/seek:scale-100 group-hover/seek:scale-100'
            style={{ left: percent(time, duration) }}
          />
          <input
            type='range'
            aria-label='Seek'
            aria-valuetext={formatDuration(time) + ' of ' + formatDuration(duration)}
            min={0}
            max={duration || 0}
            step='any'
            value={Math.min(time, duration || 0)}
            disabled={!duration}
            onChange={(event) => seek(Number(event.target.value))}
            className='absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-default'
          />
        </div>

        <div className='mt-1 flex items-center gap-1 text-white'>
          <button
            type='button'
            className={controlButton}
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <Pause className='size-5' fill='currentColor' />
            ) : (
              <Play className='size-5' fill='currentColor' />
            )}
          </button>
          <button
            type='button'
            className={controlButton}
            onClick={toggleMute}
            aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}>
            {muted || volume === 0 ? <VolumeX className='size-5' /> : <Volume2 className='size-5' />}
          </button>
          <input
            type='range'
            aria-label='Volume'
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => changeVolume(Number(event.target.value))}
            className='hidden h-1 w-20 cursor-pointer accent-white sm:block'
          />
          <span className='ml-2 text-xs text-white/85 tabular-nums'>
            {formatDuration(time)} / {formatDuration(duration)}
          </span>
          <button
            type='button'
            className={cn(controlButton, 'ml-auto')}
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
            {fullscreen ? <Minimize className='size-5' /> : <Maximize className='size-5' />}
          </button>
        </div>
      </div>
    </div>
  );
}
