'use client';

import { useEffect, useRef } from 'react';
import { t } from '@i18n';
import type { MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';

interface ViewerFilmstripProps {
  items: MediaDto[];
  index: number;
  onSelect: (index: number) => void;
}

/** How many neighbours are shown on each side of the current item. */
const REACH = 12;

/** A row of thumbnails around the current item. Hidden on screens too short to spare the room. */
export function ViewerFilmstrip({ items, index, onSelect }: ViewerFilmstripProps) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const from = Math.max(0, index - REACH);
  const strip = items.slice(from, index + REACH + 1);

  // Keep the current thumbnail in view.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  if (strip.length < 2) return null;
  return (
    <div className='flex scrollbar-none justify-center-safe gap-1.5 overflow-x-auto px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-2 [@media(max-height:480px)]:hidden'>
      {strip.map((neighbour, offset) => {
        const position = from + offset;
        const current = position === index;
        return (
          <button
            key={neighbour.id}
            ref={current ? currentRef : undefined}
            type='button'
            onClick={() => onSelect(position)}
            aria-label={t('viewer.showItem', { position: position + 1 })}
            aria-current={current ? 'true' : undefined}
            className={cn(
              'bg-subtle relative h-11 shrink-0 overflow-hidden rounded-md bg-cover outline-offset-2 transition-[opacity,scale] duration-300 focus-visible:outline-2 focus-visible:outline-white sm:h-14',
              current ? 'ring-fg ring-2' : 'scale-90 opacity-45 hover:scale-95 hover:opacity-90',
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
  );
}
