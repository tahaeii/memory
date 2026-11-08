import type { ReactNode } from 'react';
import Link from 'next/link';
import { Download, Info, X, ZoomIn, ZoomOut } from 'lucide-react';
import { t } from '@i18n';
import type { MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { formatDay } from '@/shared/lib/format';
import { IconButton, iconButtonStyles } from '@/shared/ui/IconButton';
import { downloadFor } from '../lib/download';

interface ViewerToolbarProps {
  item: MediaDto;
  /** "3 / 120" */
  position: string;
  /** Extra controls before the built-in ones (e.g. admin actions). */
  actions?: ReactNode;
  /** Zoom controls are shown for photos only; pass null for videos. */
  zoom: { scale: number; zoomIn: () => void; zoomOut: () => void } | null;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onClose: () => void;
}

/** The bar above the photo: where you are, then what you can do. */
export function ViewerToolbar({
  item,
  position,
  actions,
  zoom,
  detailsOpen,
  onToggleDetails,
  onClose,
}: ViewerToolbarProps) {
  const download = downloadFor(item);
  return (
    <header className='flex items-center justify-between gap-2 py-1.5 pr-1.5 pl-4 sm:gap-3 sm:py-2 sm:pr-3 sm:pl-5'>
      <div className='flex min-w-0 items-baseline gap-3'>
        <span className='shrink-0 text-sm font-semibold tabular-nums'>{position}</span>
        <span className='text-muted hidden truncate text-sm sm:inline'>{formatDay(item.takenAt)}</span>
        {item.event && (
          <Link
            href={'/events/' + item.event.slug}
            onClick={onClose}
            className='link-underline text-link hidden max-w-56 truncate text-sm font-medium lg:inline'>
            {item.event.title}
          </Link>
        )}
      </div>
      <div className='flex shrink-0 items-center'>
        {actions}
        {zoom && (
          <>
            <IconButton
              label={t('viewer.toolbar.zoomOut')}
              className='hidden sm:grid'
              onClick={zoom.zoomOut}
              disabled={zoom.scale === 1}>
              <ZoomOut className='size-5' />
            </IconButton>
            <IconButton label={t('viewer.toolbar.zoomIn')} className='hidden sm:grid' onClick={zoom.zoomIn}>
              <ZoomIn className='size-5' />
            </IconButton>
          </>
        )}
        <a
          className={cn(iconButtonStyles, 'size-10')}
          href={download.href}
          download={download.name}
          aria-label={t('viewer.toolbar.download')}
          title={t('viewer.toolbar.download')}>
          <Download className='size-5' />
        </a>
        <IconButton label={t('viewer.toolbar.details')} pressed={detailsOpen} onClick={onToggleDetails}>
          <Info className='size-5' />
        </IconButton>
        <IconButton label={t('viewer.toolbar.close')} onClick={onClose}>
          <X className='size-5' />
        </IconButton>
      </div>
    </header>
  );
}
