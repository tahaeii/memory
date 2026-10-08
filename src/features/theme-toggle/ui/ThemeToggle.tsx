'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '../model/use-theme';

/** Switches between the light and dark token sets and remembers the choice for a year. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'text-muted hover:bg-subtle hover:text-fg grid size-10 shrink-0 place-items-center rounded-xl transition',
        className,
      )}>
      {theme === 'light' ? <Moon className='size-[18px]' /> : <Sun className='size-[18px]' />}
    </button>
  );
}
