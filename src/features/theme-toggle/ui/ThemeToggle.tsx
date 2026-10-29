'use client';

import type { MouseEvent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '../model/use-theme';

const icon = 'ease-spring col-start-1 row-start-1 size-[18px] transition-[rotate,scale,opacity] duration-500';

/**
 * Switches between the light and dark token sets and remembers the choice for a year. The new
 * theme spreads across the page from this button; the sun and the moon trade places with a turn.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'text-muted hover:bg-fg/[0.07] hover:text-fg focus-visible:outline-primary grid size-10 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-1',
        className,
      )}>
      {/* Both icons are always there; the `dark` class on <html> decides which one shows. */}
      <Moon aria-hidden className={cn(icon, 'dark:scale-50 dark:-rotate-90 dark:opacity-0')} />
      <Sun
        aria-hidden
        className={cn(icon, 'scale-50 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100')}
      />
    </button>
  );
}
