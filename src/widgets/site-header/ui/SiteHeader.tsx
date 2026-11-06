'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Lock, LockOpen } from 'lucide-react';
import { t } from '@i18n';
import { isStaffRole, useSession } from '@/entities/session';
import { SignOutButton } from '@/features/sign-out';
import { ThemeToggle } from '@/features/theme-toggle';
import { useSite } from '@/shared/config/site-context';
import { cn } from '@/shared/lib/cn';
import { useIndicator } from '@/shared/lib/use-indicator';
import { buttonStyles } from '@/shared/ui/Button';
import { Container } from '@/shared/ui/Container';
import { Logo } from '@/shared/ui/Logo';

/** On the narrowest phones the logo is the way home, which leaves room for the other two. */
const links = [
  { href: '/', label: t('common.nav.home'), wideOnly: true },
  { href: '/gallery', label: t('common.nav.gallery'), wideOnly: false },
  { href: '/events', label: t('common.nav.events'), wideOnly: false },
];

export function SiteHeader() {
  const { role } = useSession();
  const site = useSite();
  const pathname = usePathname() ?? '/';
  // The home link matches only the home page; the others also match what is under them.
  const current =
    links.find((link) => (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)))?.href ??
    null;
  const { containerRef, indicatorRef } = useIndicator<HTMLElement, HTMLSpanElement>(current);

  return (
    <header className='border-line-soft bg-glass sticky top-0 z-40 border-b backdrop-blur-xl'>
      <Container className='h-header flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-5 sm:gap-9'>
          <Link href='/' aria-label={t('common.nav.homeLabel', { name: site.name })} className='shrink-0'>
            <Logo name={site.name} src={site.logoUrl} className='[&>span]:hidden sm:[&>span]:inline' />
          </Link>
          <nav
            ref={containerRef}
            aria-label={t('common.nav.label')}
            className='group/nav relative flex items-center gap-4 sm:gap-6'>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.href === current ? 'page' : undefined}
                data-current={link.href === current}
                className={cn(
                  'relative h-16 items-center text-sm font-medium transition-colors duration-300',
                  link.wideOnly ? 'hidden min-[26rem]:flex' : 'flex',
                  link.href === current
                    ? // Until the sliding marker is placed (before scripts run) the link carries its own.
                      'text-fg after:bg-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full group-data-[indicator=placed]/nav:after:hidden'
                    : 'text-muted hover:text-fg',
                )}>
                {link.label}
              </Link>
            ))}
            {/* The marker under the current page slides to the page that is opened. */}
            <span
              ref={indicatorRef}
              aria-hidden
              className='pointer-events-none absolute top-0 left-0 flex items-end opacity-0 ease-out data-[slide=true]:transition-[translate,width,opacity] data-[slide=true]:duration-500'>
              <span className='bg-primary h-0.5 w-full rounded-full' />
            </span>
          </nav>
        </div>

        <div className='flex items-center gap-1.5'>
          <ThemeToggle />
          {role === 'guest' && site.friendsEnabled && (
            <Link href='/unlock' className={buttonStyles('secondary', 'sm')}>
              <Lock className='size-4' />
              <span className='hidden sm:inline'>{t('common.nav.privateAccess')}</span>
            </Link>
          )}
          {role === 'friend' && (
            <>
              <span className='bg-secondary-soft text-secondary-strong inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold'>
                <LockOpen className='size-4' />
                <span className='hidden sm:inline'>{t('common.nav.friendsAccess')}</span>
              </span>
              <SignOutButton label={t('common.nav.lock')} />
            </>
          )}
          {isStaffRole(role) && (
            <>
              <Link href='/admin' className={buttonStyles('primary', 'sm')}>
                <LayoutGrid className='size-4' />
                <span className='hidden sm:inline'>{t('common.nav.dashboard')}</span>
              </Link>
              <SignOutButton />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
