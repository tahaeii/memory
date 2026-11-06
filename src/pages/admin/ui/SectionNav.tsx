'use client';

import type { LucideIcon } from 'lucide-react';
import { t } from '@i18n';
import { cn } from '@/shared/lib/cn';
import { useIndicator } from '@/shared/lib/use-indicator';
import type { SectionId } from '../config/sections';

export interface SectionNavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  /** A number after the label, e.g. how many events there are. */
  count?: string;
  /** Draws attention to the count (items waiting for the super admin). */
  alert?: boolean;
}

interface SectionNavProps {
  items: SectionNavItem[];
  current: SectionId;
  onOpen: (id: SectionId) => void;
}

/**
 * The dashboard menu: a column beside the content on wide screens, a scrolling row above it on
 * small ones. One highlight slides to the section that was opened.
 */
export function SectionNav({ items, current, onOpen }: SectionNavProps) {
  const { containerRef, indicatorRef } = useIndicator<HTMLElement, HTMLSpanElement>(current);
  return (
    <nav
      ref={containerRef}
      aria-label={t('admin.nav.label')}
      className='group/nav relative -mx-4 flex scrollbar-none gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:sticky lg:top-24 lg:w-56 lg:shrink-0 lg:flex-col'>
      <span
        ref={indicatorRef}
        aria-hidden
        className='bg-primary-soft pointer-events-none absolute top-0 left-0 rounded-lg opacity-0 ease-out data-[slide=true]:transition-[translate,width,height,opacity] data-[slide=true]:duration-300'
      />
      {items.map((item) => {
        const active = current === item.id;
        return (
          <button
            key={item.id}
            type='button'
            aria-current={active ? 'page' : undefined}
            data-current={active}
            onClick={() => onOpen(item.id)}
            className={cn(
              'group relative flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors duration-300',
              // Until the sliding highlight is placed (before scripts run) the item carries its own.
              active
                ? 'text-link bg-primary-soft group-data-[indicator=placed]/nav:bg-transparent'
                : 'text-muted hover:bg-fg/[0.05] hover:text-fg',
            )}>
            <item.icon
              aria-hidden
              className={cn(
                'size-[18px] shrink-0 transition-transform duration-300 ease-out',
                !active && 'group-hover:scale-110',
              )}
            />
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'ml-auto pl-2 text-xs tabular-nums',
                  item.alert &&
                    'bg-warning-soft text-warning-fg -mr-1 rounded-full px-2 py-0.5 font-semibold',
                )}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
