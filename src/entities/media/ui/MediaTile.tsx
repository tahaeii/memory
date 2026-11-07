import type { CSSProperties } from 'react';
import { t } from '@i18n';
import { formatDay } from '@/shared/lib/format';
import type { MediaDto } from '../model/types';
import { MediaBadges } from './MediaBadges';
import { MediaImage } from './MediaImage';

interface MediaTileProps {
  item: MediaDto;
  /** Aspect ratio used for layout (already clamped). */
  ratio: number;
  sizes: string;
  priority?: boolean;
  style?: CSSProperties;
  onOpen: () => void;
}

/** A clickable photo or video with blur-up placeholder, hover effect and badges. */
export function MediaTile({ item, ratio, sizes, priority, style, onOpen }: MediaTileProps) {
  return (
    <button
      type='button'
      onClick={onOpen}
      aria-label={t(`media.open.${item.kind}`, { date: formatDay(item.takenAt) })}
      className='group focus-visible:outline-primary bg-subtle relative block cursor-zoom-in overflow-hidden rounded-xl bg-cover outline-offset-2 focus-visible:outline-2'
      style={{ ...style, backgroundImage: 'url(' + item.placeholder + ')' }}>
      <span aria-hidden className='block' style={{ paddingBottom: (100 / ratio).toFixed(3) + '%' }} />
      <MediaImage item={item} sizes={sizes} priority={priority} zoom />
      <span
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100'
      />
      <MediaBadges item={item} />
    </button>
  );
}
