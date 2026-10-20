'use client';

import { useState, type KeyboardEvent, type ReactNode } from 'react';
import type { MediaDto } from '@/entities/media';
import { useViewerDialog } from '../model/use-viewer-dialog';
import { useViewerItems } from '../model/use-viewer-items';
import { useZoomPan } from '../model/use-zoom-pan';
import { ViewerDetails } from './ViewerDetails';
import { ViewerFilmstrip } from './ViewerFilmstrip';
import { ViewerStage } from './ViewerStage';
import { ViewerToolbar } from './ViewerToolbar';

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

/**
 * Full-screen viewer built on <dialog>: next/previous (keys, buttons, swipe), zoom and pan for
 * photos, the video player for videos, a details panel and download. It is always dark, whatever
 * the theme of the page behind it.
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { dialogRef, closing, close } = useViewerDialog(onClose);
  const { item, go, hasPrevious, hasNext } = useViewerItems({
    items,
    index,
    hasMore,
    onIndexChange,
    onNeedMore,
    onGone: onClose,
  });
  const zoom = useZoomPan(item?.id ?? '', go);

  if (!item) return null;
  const isPhoto = item.kind === 'photo';

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if ((event.target as Element).closest('input')) return;
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
    else if (event.key === 'i') setDetailsOpen((open) => !open);
    else if (!isPhoto) return;
    else if (event.key === '+' || event.key === '=') zoom.zoomIn();
    else if (event.key === '-') zoom.zoomOut();
    else if (event.key === '0') zoom.reset();
  }

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-label={isPhoto ? 'Photo viewer' : 'Video player'}
      data-state={closing ? 'closed' : 'open'}
      onCancel={(event) => {
        event.preventDefault();
        // Escape closes the details first, then the viewer.
        if (detailsOpen) setDetailsOpen(false);
        else close();
      }}
      onKeyDown={onKeyDown}
      className='dark bg-canvas text-fg data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in m-0 h-dvh max-h-none w-dvw max-w-none p-0 outline-none open:flex open:flex-col'>
      <ViewerToolbar
        item={item}
        position={index + 1 + ' / ' + (total ?? items.length)}
        actions={actions?.(item)}
        zoom={isPhoto ? zoom : null}
        detailsOpen={detailsOpen}
        onToggleDetails={() => setDetailsOpen((open) => !open)}
        onClose={close}
      />
      <div className='relative flex min-h-0 flex-1 overflow-hidden'>
        <ViewerStage item={item} zoom={zoom} hasPrevious={hasPrevious} hasNext={hasNext} onGo={go} />
        <ViewerDetails
          item={item}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onNavigate={onClose}
        />
      </div>
      <ViewerFilmstrip items={items} index={index} onSelect={onIndexChange} />
    </dialog>
  );
}
