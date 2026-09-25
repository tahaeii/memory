import type { MediaDto } from '../model/types';
import { MediaTile } from './MediaTile';

interface JustifiedGridProps {
  items: MediaDto[];
  /** Index of the first item in the full list, so onOpen reports global indexes. */
  startIndex?: number;
  /** How many leading items should load eagerly. */
  eager?: number;
  onOpen: (index: number) => void;
}

const layoutRatio = (item: MediaDto): number => Math.min(2.4, Math.max(0.55, item.width / item.height));

/**
 * Justified rows (like Google Photos) in pure CSS: every tile has a flex-grow proportional to its
 * aspect ratio, so rows fill the width with no layout shift and no JavaScript.
 */
export function JustifiedGrid({ items, startIndex = 0, eager = 0, onOpen }: JustifiedGridProps) {
  return (
    <div className='flex flex-wrap gap-1.5 [--row:140px] sm:gap-2 sm:[--row:190px] lg:[--row:230px]'>
      {items.map((item, i) => {
        const ratio = layoutRatio(item);
        const sizes =
          '(min-width: 1024px) ' +
          Math.round(ratio * 240) +
          'px, (min-width: 640px) ' +
          Math.round(ratio * 200) +
          'px, ' +
          Math.round(ratio * 150) +
          'px';
        return (
          <MediaTile
            key={item.id}
            item={item}
            ratio={ratio}
            sizes={sizes}
            priority={i < eager}
            style={{
              width: 'calc(var(--row) * ' + ratio.toFixed(4) + ')',
              flexGrow: Math.round(ratio * 100),
            }}
            onOpen={() => onOpen(startIndex + i)}
          />
        );
      })}
      {/* Keeps the last (incomplete) row from stretching. */}
      <span aria-hidden style={{ flexGrow: 1000000 }} />
    </div>
  );
}
