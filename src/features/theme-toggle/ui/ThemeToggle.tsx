'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { THEME_COLOR, THEME_COOKIE, type Theme } from '@/shared/lib/theme';

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Switches between the light and dark token sets and remembers the choice for a year. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => setTheme(currentTheme()), []);

  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
    document.cookie =
      THEME_COOKIE +
      '=' +
      next +
      '; path=/; max-age=31536000; samesite=lax' +
      (location.protocol === 'https:' ? '; secure' : '');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
    setTheme(next);
  }

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
