'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  Globe,
  Info,
  Lock,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { MediaDto } from '@/entities/media';
import { isStaffRole, useSession } from '@/entities/session';
import { cn } from '@/shared/lib/cn';
import { formatDay, formatDuration, formatShortDate, formatTime } from '@/shared/lib/format';
import { Spinner } from '@/shared/ui/Spinner';
import { VideoPlayer } from '@/shared/ui/VideoPlayer';
import { useSwipe } from '../model/use-swipe';
import { useZoomPan } from '../model/use-zoom-pan';

interface MediaViewerProps {
  items: MediaDto[];
  index: number;
  hasMore?: boolean;
  onIndexChange: (index: number) => void;
  onNeedMore?: () => void;
  onClose: () => void;
  /** Extra toolbar controls (e.g. admin actions). */
  actions?: (item: MediaDto) => ReactNode;
  /** Size of the whole list, when more than `items` is available. */
  total?: number;
}

const iconButton =
  'grid size-10 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30';

/** Staff download the untouched original; everyone else the web version. */
function downloadFor(item: MediaDto): { href: string; name: string } {
  if (item.originalUrl) return { href: item.originalUrl, name: item.name };
  const base = item.name.replace(/\.[^.]+$/, '');
  if (item.video?.url) return { href: item.video.url, name: base + '.mp4' };
  return { href: item.variants.large.url, name: base + '.webp' };
}

/**
 * Full-screen viewer built on <dialog>: next/previous (keys, buttons, swipe), zoom and pan for
 * photos, the video player for videos, and download.
 */
export function MediaViewer({
  items,
  index,
  hasMore = false,
  onIndexChange,
  onNeedMore,
  onClose,
  actions,
  total,
}: MediaViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentThumbRef = useRef<HTMLButtonElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const item = items[index];

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next >= 0 && next < items.length) onIndexChange(next);
    },
    [index, items.length, onIndexChange],
  );

  const zoom = useZoomPan(item?.id ?? '', go);
  const swipe = useSwipe(go);

  // The dialog itself takes focus, so Space reaches the video player instead of a toolbar button.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      dialog.focus();
    }
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      if (dialog?.open) dialog.close();
    };
  }, []);

  // Load the next page while the visitor is near the end of what is loaded.
  useEffect(() => {
    if (hasMore && index >= items.length - 4) onNeedMore?.();
  }, [hasMore, index, items.length, onNeedMore]);

  // The current item can disappear (e.g. deleted by an admin).
  useEffect(() => {
    if (!item) onClose();
  }, [item, onClose]);

  // Warm the cache for the neighbours so navigation feels instant.
  useEffect(() => {
    for (const neighbour of [items[index + 1], items[index - 1]]) {
      if (neighbour) new Image().src = neighbour.variants.large.url;
    }
  }, [index, items]);

  // Keep the current thumbnail of the filmstrip in view.
  useEffect(() => {
    currentThumbRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index]);

  if (!item) return null;

  const { medium, large } = item.variants;
  const isPhoto = item.kind === 'photo';
  const download = downloadFor(item);
  const stripFrom = Math.max(0, index - 12);
  const strip = items.slice(stripFrom, index + 13);

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-label={isPhoto ? 'Photo viewer' : 'Video player'}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if ((event.target as Element).closest('input')) return;
        if (event.key === 'ArrowRight') go(1);
        else if (event.key === 'ArrowLeft') go(-1);
        else if (event.key === 'i') setInfoOpen((open) => !open);
        else if (!isPhoto) return;
        else if (event.key === '+' || event.key === '=') zoom.zoomIn();
        else if (event.key === '-') zoom.zoomOut();
        else if (event.key === '0') zoom.reset();
      }}
      className='animate-fade-in m-0 h-dvh max-h-none w-dvw max-w-none bg-[#070a10] p-0 text-[#e8edf5] outline-none open:flex open:flex-col'>
      <header className='flex items-center justify-between gap-3 px-3 py-2 sm:px-5'>
        <div className='flex min-w-0 items-center gap-3'>
          <span className='shrink-0 text-sm font-semibold tabular-nums'>
            {index + 1} / {total ?? items.length}
          </span>
          <span className='hidden truncate text-sm text-[#a4b5d2] sm:inline'>{formatDay(item.takenAt)}</span>
          {item.event && (
            <Link
              href={'/events/' + item.event.slug}
              onClick={onClose}
              className='hidden h-7 max-w-56 shrink items-center truncate rounded-full bg-[#1a2233] px-3 text-xs font-medium text-[#a8ccff] transition hover:bg-[#2a3550] md:inline-flex'>
              {item.event.title}
            </Link>
          )}
        </div>
        <div className='flex shrink-0 items-center gap-0.5'>
          {actions?.(item)}
          {isPhoto && (
            <>
              <button
                type='button'
                className={cn(iconButton, 'hidden sm:grid')}
                onClick={zoom.zoomOut}
                disabled={zoom.scale === 1}
                aria-label='Zoom out'>
                <ZoomOut className='size-5' />
              </button>
              <button
                type='button'
                className={cn(iconButton, 'hidden sm:grid')}
                onClick={zoom.zoomIn}
                aria-label='Zoom in'>
                <ZoomIn className='size-5' />
              </button>
            </>
          )}
          <a className={iconButton} href={download.href} download={download.name} aria-label='Download'>
            <Download className='size-5' />
          </a>
          <button
            type='button'
            className={cn(iconButton, infoOpen && 'bg-white/10 text-white')}
            onClick={() => setInfoOpen((open) => !open)}
            aria-pressed={infoOpen}
            aria-label='Details'>
            <Info className='size-5' />
          </button>
          <button type='button' className={iconButton} onClick={onClose} aria-label='Close'>
            <X className='size-5' />
          </button>
        </div>
      </header>

      <div className='relative flex min-h-0 flex-1'>
        <div className='relative min-h-0 min-w-0 flex-1'>
          {isPhoto ? (
            <div
              className='absolute inset-0 touch-none select-none'
              style={{ cursor: zoom.scale > 1 ? (zoom.dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              onDoubleClick={zoom.toggle}
              {...zoom.bind}>
              <img
                key={item.id}
                src={large.url}
                srcSet={medium.url + ' ' + medium.width + 'w, ' + large.url + ' ' + large.width + 'w'}
                sizes='100vw'
                alt={formatDay(item.takenAt)}
                draggable={false}
                className='animate-fade-in h-full w-full object-contain p-2 sm:p-6'
                style={{
                  transform:
                    'translate(' + zoom.offset.x + 'px, ' + zoom.offset.y + 'px) scale(' + zoom.scale + ')',
                  transition: zoom.dragging ? 'none' : 'transform 0.2s ease-out',
                  backgroundImage: 'url(' + item.placeholder + ')',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
            </div>
          ) : (
            <div className='absolute inset-0 touch-pan-y p-0 sm:p-6 sm:px-16' {...swipe}>
              {item.video?.url ? (
                <VideoPlayer
                  key={item.id}
                  src={item.video.url}
                  poster={large.url}
                  duration={item.video.duration}
                  autoPlay
                  hotkeys
                  className='h-full w-full sm:rounded-xl'
                />
              ) : (
                <VideoPending item={item} />
              )}
            </div>
          )}
          <button
            type='button'
            className={cn(
              iconButton,
              'absolute top-1/2 left-2 size-12 -translate-y-1/2 bg-black/40 backdrop-blur',
            )}
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label='Previous'>
            <ChevronLeft className='size-6' />
          </button>
          <button
            type='button'
            className={cn(
              iconButton,
              'absolute top-1/2 right-2 size-12 -translate-y-1/2 bg-black/40 backdrop-blur',
            )}
            onClick={() => go(1)}
            disabled={index >= items.length - 1}
            aria-label='Next'>
            <ChevronRight className='size-6' />
          </button>
        </div>
        {infoOpen && <Details item={item} onClose={onClose} />}
      </div>

      {strip.length > 1 && (
        <div className='flex scrollbar-none justify-center-safe gap-2 overflow-x-auto px-4 pt-2 pb-4'>
          {strip.map((neighbour, offset) => {
            const position = stripFrom + offset;
            const current = position === index;
            return (
              <button
                key={neighbour.id}
                ref={current ? currentThumbRef : undefined}
                type='button'
                onClick={() => onIndexChange(position)}
                aria-label={'Show item ' + (position + 1)}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'relative h-14 shrink-0 overflow-hidden rounded-lg bg-[#1a2233] bg-cover transition sm:h-16',
                  current ? 'opacity-100 ring-2 ring-white' : 'opacity-50 hover:opacity-90',
                )}
                style={{
                  aspectRatio: String(Math.min(1.6, Math.max(0.7, neighbour.width / neighbour.height))),
                  backgroundImage: 'url(' + neighbour.placeholder + ')',
                }}>
                <img
                  src={neighbour.variants.thumb.url}
                  alt=''
                  loading='lazy'
                  className='h-full w-full object-cover'
                />
              </button>
            );
          })}
        </div>
      )}
    </dialog>
  );
}

/** Facts about the current item. Access and file details are for staff only. */
function Details({ item, onClose }: { item: MediaDto; onClose: () => void }) {
  const { role } = useSession();
  const staff = isStaffRole(role);
  const rows: Array<{ label: string; value: ReactNode }> = [
    { label: 'Taken', value: formatDay(item.takenAt) + ', ' + formatTime(item.takenAt) },
    {
      label: 'Event',
      value: item.event ? (
        <Link
          href={'/events/' + item.event.slug}
          onClick={onClose}
          className='text-[#5aabff] hover:underline'>
          {item.event.title}
        </Link>
      ) : (
        'No event'
      ),
    },
    {
      label: item.kind === 'video' ? 'Video' : 'Photo',
      value:
        item.width +
        ' × ' +
        item.height +
        (item.video && item.video.duration > 0 ? ' · ' + formatDuration(item.video.duration) : ''),
    },
  ];
  if (staff) {
    rows.push({
      label: 'Access',
      value:
        item.visibility === 'private' ? (
          <span className='inline-flex items-center gap-1.5 text-[#ff8c2a]'>
            <Lock className='size-3.5' /> Private
          </span>
        ) : (
          <span className='inline-flex items-center gap-1.5 text-[#3de082]'>
            <Globe className='size-3.5' /> Public
          </span>
        ),
    });
    rows.push({ label: 'File', value: <span className='break-all'>{item.name}</span> });
  }
  if (item.deletion)
    rows.push({
      label: 'Deleted',
      value: 'by ' + item.deletion.by + ' on ' + formatShortDate(item.deletion.at),
    });

  return (
    <aside className='absolute inset-x-0 bottom-0 z-10 max-h-[55%] overflow-y-auto border-t border-[#1e2738] bg-[#0f1520]/95 px-5 py-4 backdrop-blur md:static md:max-h-none md:w-80 md:shrink-0 md:border-t-0 md:border-l md:bg-[#0f1520]'>
      <h2 className='font-display text-base font-semibold'>Details</h2>
      <dl className='mt-3'>
        {rows.map((row) => (
          <div key={row.label} className='flex justify-between gap-4 border-t border-[#1e2738] py-3 text-sm'>
            <dt className='shrink-0 text-[#a4b5d2]'>{row.label}</dt>
            <dd className='min-w-0 text-right font-medium'>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

/** What staff see for a video that is still converting, or failed to. */
function VideoPending({ item }: { item: MediaDto }) {
  const video = item.video;
  const failed = video?.status === 'failed';
  return (
    <div className='relative grid h-full place-items-center overflow-hidden sm:rounded-xl'>
      <img
        src={item.variants.large.url}
        alt=''
        className='absolute inset-0 h-full w-full object-contain opacity-30 blur-sm'
      />
      <div className='relative max-w-sm px-6 text-center'>
        {failed ? (
          <CircleAlert className='mx-auto size-8 text-red-400' />
        ) : (
          <Spinner className='mx-auto size-8 text-white/80' />
        )}
        <p className='mt-4 font-medium'>
          {failed ? 'This video could not be converted' : 'Converting the video'}
        </p>
        <p className='mt-1 text-sm text-white/70'>
          {failed
            ? (video?.error ?? 'Try uploading it again.')
            : video?.progress == null
              ? 'Waiting for its turn. It appears in the gallery once it is ready.'
              : Math.round(video.progress * 100) + '% done. It appears in the gallery once it is ready.'}
        </p>
      </div>
    </div>
  );
}
