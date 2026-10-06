'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { MediaDto } from '../model/types';
import { MediaBadges } from './MediaBadges';
import { MediaImage } from './MediaImage';

interface SelectableGridProps {
  items: MediaDto[];
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onOpen: (index: number) => void;
  /** Extra line at the bottom of each tile (e.g. who deleted it). */
  caption?: (item: MediaDto) => ReactNode;
}

/** Square tiles with a checkbox each, used by the dashboard lists. */
export function SelectableGrid({ items, selected, onToggle, onOpen, caption }: SelectableGridProps) {
  return (
    <ul className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
      {items.map((item, index) => {
        const isSelected = selected.has(item.id);
        return (
          <li
            key={item.id}
            className={cn(
              'group bg-subtle relative aspect-square overflow-hidden rounded-xl bg-cover',
              isSelected && 'ring-primary ring-4',
            )}
            style={{ backgroundImage: 'url(' + item.placeholder + ')' }}>
            <button
              type='button'
              className='absolute inset-0'
              onClick={() => onOpen(index)}
              aria-label={'Open ' + item.kind}>
              <MediaImage
                item={item}
                sizes='(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw'
                className='transition-transform duration-500 group-hover:scale-105'
              />
            </button>
            <button
              type='button'
              role='checkbox'
              aria-checked={isSelected}
              aria-label={'Select ' + item.kind}
              onClick={() => onToggle(item.id)}
              className={cn(
                'absolute top-2 left-2 grid size-6 place-items-center rounded-full border-2 transition',
                isSelected
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-white/90 bg-slate-950/20 text-transparent opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
              )}>
              <Check className='size-3.5' strokeWidth={3} />
            </button>
            {caption ? (
              <span className='pointer-events-none absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-slate-950/80 to-transparent px-2.5 pt-6 pb-2 text-xs text-white'>
                {caption(item)}
              </span>
            ) : (
              <MediaBadges item={item} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
