import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
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

/** The dashboard menu: a column beside the content on wide screens, a scrolling row above it on small ones. */
export function SectionNav({ items, current, onOpen }: SectionNavProps) {
  return (
    <nav
      aria-label='Dashboard sections'
      className='-mx-4 flex scrollbar-none gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:sticky lg:top-24 lg:w-56 lg:shrink-0 lg:flex-col'>
      {items.map((item) => {
        const active = current === item.id;
        return (
          <button
            key={item.id}
            type='button'
            aria-current={active ? 'page' : undefined}
            onClick={() => onOpen(item.id)}
            className={cn(
              'group flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors',
              active
                ? 'bg-primary-soft text-link font-semibold'
                : 'text-muted hover:bg-fg/[0.06] hover:text-fg font-medium',
            )}>
            <item.icon
              aria-hidden
              className={cn(
                'size-[18px] shrink-0 transition-transform duration-300',
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
