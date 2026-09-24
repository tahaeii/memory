import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** A pill-shaped link used for filters. */
export function Chip({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex h-9 shrink-0 items-center rounded-xl border px-3.5 text-sm transition',
        active
          ? 'border-primary bg-primary-soft text-link font-semibold'
          : 'border-line bg-surface text-fg hover:border-line-strong hover:bg-subtle',
      )}>
      {children}
    </Link>
  );
}
