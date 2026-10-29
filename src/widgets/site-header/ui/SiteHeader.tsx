'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Lock, LockOpen } from 'lucide-react';
import { isStaffRole, useSession } from '@/entities/session';
import { SignOutButton } from '@/features/sign-out';
import { ThemeToggle } from '@/features/theme-toggle';
import { useSite } from '@/shared/config/site-context';
import { cn } from '@/shared/lib/cn';
import { buttonStyles } from '@/shared/ui/Button';
import { Container } from '@/shared/ui/Container';
import { Logo } from '@/shared/ui/Logo';

/** On the narrowest phones the logo is the way home, which leaves room for the other two. */
const links = [
  { href: '/', label: 'Home', exact: true, wideOnly: true },
  { href: '/gallery', label: 'Gallery', exact: false },
  { href: '/events', label: 'Events', exact: false },
];

export function SiteHeader() {
  const { role } = useSession();
  const site = useSite();
  const pathname = usePathname() ?? '/';

  return (
    <header className='border-line-soft bg-glass sticky top-0 z-40 border-b backdrop-blur-xl'>
      <Container className='flex h-16 items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-5 sm:gap-9'>
          <Link href='/' aria-label={site.name + ' home'} className='shrink-0'>
            <Logo name={site.name} src={site.logoUrl} className='[&>span]:hidden sm:[&>span]:inline' />
          </Link>
          <nav aria-label='Main' className='flex items-center gap-4 sm:gap-6'>
            {links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative h-16 items-center text-sm transition-colors',
                    'wideOnly' in link ? 'hidden min-[26rem]:flex' : 'flex',
                    active ? 'text-fg font-semibold' : 'text-muted hover:text-fg font-medium',
                  )}>
                  {link.label}
                  {/* The marker under the current page; other links preview it under the pointer. */}
                  <span
                    aria-hidden
                    className={cn(
                      'bg-primary absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full transition-[scale,opacity] duration-300 ease-out',
                      active
                        ? 'scale-x-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40',
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className='flex items-center gap-1.5'>
          <ThemeToggle />
          {role === 'guest' && site.friendsEnabled && (
            <Link href='/unlock' className={buttonStyles('secondary', 'sm')}>
              <Lock className='size-4' />
              <span className='hidden sm:inline'>Private access</span>
            </Link>
          )}
          {role === 'friend' && (
            <>
              <span className='bg-secondary-soft text-secondary-strong inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold'>
                <LockOpen className='size-4' />
                <span className='hidden sm:inline'>Friends access</span>
              </span>
              <SignOutButton label='Lock' />
            </>
          )}
          {isStaffRole(role) && (
            <>
              <Link href='/admin' className={buttonStyles('primary', 'sm')}>
                <LayoutGrid className='size-4' />
                <span className='hidden sm:inline'>Dashboard</span>
              </Link>
              <SignOutButton />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
