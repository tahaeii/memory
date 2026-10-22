'use client';

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react';

const HIDE_CONTROLS_AFTER_MS = 2500;

/** iPhone Safari cannot put an element in fullscreen, only the video itself. */
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

type VideoEvent = SyntheticEvent<HTMLVideoElement>;

function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('input, textarea, select, button, a, [contenteditable]') !== null
  );
}

interface VideoPlayerOptions {
  /** Length in seconds known before the browser has read the file. */
  knownDuration: number;
  /** Space/K play-pause, M mute and F fullscreen while nothing else has focus. */
  hotkeys: boolean;
}

/**
 * Everything the player knows and can do, without any markup: playback state mirrored from the
 * <video> element, the commands, keyboard shortcuts, and hiding the controls while a video plays.
 */
export function useVideoPlayer({ knownDuration, hotkeys }: VideoPlayerOptions) {
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

  const seek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    video.currentTime = value;
    setTime(value);
  }, []);

  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
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

  /** Event handlers for the <video> element: they copy its state into React. */
  const videoEvents = {
    onClick: togglePlay,
    onDoubleClick: toggleFullscreen,
    onPlay: () => {
      setPlaying(true);
      wake();
    },
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
    onTimeUpdate: (event: VideoEvent) => setTime(event.currentTarget.currentTime),
    onDurationChange: (event: VideoEvent) => {
      const value = event.currentTarget.duration;
      if (Number.isFinite(value) && value > 0) setDuration(value);
    },
    onProgress: (event: VideoEvent) => {
      const video = event.currentTarget;
      const ranges = video.buffered;
      for (let i = 0; i < ranges.length; i += 1) {
        if (ranges.start(i) <= video.currentTime && video.currentTime <= ranges.end(i)) {
          setBuffered(ranges.end(i));
          return;
        }
      }
    },
    onVolumeChange: (event: VideoEvent) => {
      setVolume(event.currentTarget.volume);
      setMuted(event.currentTarget.muted);
    },
    onWaiting: () => setWaiting(true),
    onPlaying: () => setWaiting(false),
    onCanPlay: () => setWaiting(false),
    onError: () => setFailed(true),
  };

  return {
    rootRef,
    videoRef,
    videoEvents,
    state: {
      playing,
      time,
      duration,
      buffered,
      volume,
      silent: muted || volume === 0,
      waiting,
      failed,
      fullscreen,
      controlsVisible: !playing || !idle || failed,
    },
    commands: { togglePlay, toggleMute, toggleFullscreen, seek, changeVolume, wake },
  };
}

export type VideoPlayerState = ReturnType<typeof useVideoPlayer>['state'];
export type VideoPlayerCommands = ReturnType<typeof useVideoPlayer>['commands'];
