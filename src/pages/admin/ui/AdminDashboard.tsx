'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  ExternalLink,
  HardDrive,
  Image as ImageIcon,
  Images,
  Lock,
  Palette,
  Settings,
  Trash2,
  Upload,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { LibrarySummaryDto, MediaPageDto } from '@/entities/media';
import { roleLabel } from '@/entities/session';
import type { PasscodeStatusDto, UserDto } from '@/entities/user';
import { ChangePasswordForm } from '@/features/change-password';
import { FriendsPasscodeForm } from '@/features/friends-passcode';
import { BrandingForm } from '@/features/manage-branding';
import { EventsManager } from '@/features/manage-events';
import { UsersManager } from '@/features/manage-users';
import { UploadPanel } from '@/features/upload-media';
import { cn } from '@/shared/lib/cn';
import { formatBytes, formatCount, formatShortDate } from '@/shared/lib/format';
import { Button, buttonStyles } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { AdminLibrary } from '@/widgets/admin-library';
import { DeletedLibrary } from '@/widgets/deleted-library';

type Tab = 'library' | 'upload' | 'events' | 'deleted' | 'admins' | 'branding' | 'settings';
const TABS: readonly Tab[] = ['library', 'upload', 'events', 'deleted', 'admins', 'branding', 'settings'];

interface AdminDashboardProps {
  account: UserDto;
  summary: LibrarySummaryDto;
  firstPage: MediaPageDto;
  events: EventDto[];
  /** Every staff account; only loaded for the super admin. */
  users: UserDto[] | null;
  /** Only loaded when the friends area is on, for staff with access to private items. */
  passcode: PasscodeStatusDto | null;
  /** What admins deleted; only loaded for the super admin. */
  deletedPage: MediaPageDto | null;
}

/** A titled card that holds one dashboard section. */
function Panel({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className='border-line-soft bg-surface shadow-card rounded-3xl border p-5 sm:p-6'>
      <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='font-display text-lg font-semibold'>{title}</h2>
          {description && <p className='text-muted mt-1 text-sm'>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Staff home: stats, a section menu and the sections. Every section stays mounted to keep its state. */
export function AdminDashboard({
  account,
  summary,
  firstPage,
  events,
  users,
  passcode,
  deletedPage,
}: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(summary.itemCount === 0 ? 'upload' : 'library');
  const [version, setVersion] = useState(0);

  const available = useCallback(
    (id: Tab) =>
      id === 'deleted' ? Boolean(deletedPage) : id === 'admins' || id === 'branding' ? Boolean(users) : true,
    [deletedPage, users],
  );

  // The open section lives in the address (#upload, #events…), so a reload or a shared link keeps it.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1) as Tab;
      if (TABS.includes(id) && available(id)) setTab(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [available]);

  const open = useCallback((next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', '#' + next);
  }, []);

  const changed = useCallback(() => {
    setVersion((value) => value + 1);
    router.refresh();
  }, [router]);

  const refresh = useCallback(() => router.refresh(), [router]);

  const menu: Array<{ id: Tab; label: string; icon: LucideIcon; count?: string; alert?: boolean }> = [
    { id: 'library', label: 'Library', icon: Images, count: formatCount(summary.itemCount) },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'events', label: 'Events', icon: CalendarDays, count: formatCount(events.length) },
    ...(deletedPage
      ? [
          {
            id: 'deleted' as const,
            label: 'Deleted',
            icon: Trash2,
            count: formatCount(summary.deletedCount),
            alert: summary.deletedCount > 0,
          },
        ]
      : []),
    ...(users
      ? [
          { id: 'admins' as const, label: 'Admins', icon: Users, count: formatCount(users.length) },
          { id: 'branding' as const, label: 'Branding', icon: Palette },
        ]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats: Array<{ label: string; value: string; icon: LucideIcon; tone: string; onClick?: () => void }> =
    [
      {
        label: 'Photos',
        value: formatCount(summary.photoCount),
        icon: ImageIcon,
        tone: 'bg-primary-soft text-link',
      },
      {
        label: 'Videos',
        value: formatCount(summary.videoCount),
        icon: Video,
        tone: 'bg-secondary-soft text-secondary-strong',
      },
      account.privateAccess
        ? {
            label: 'Private',
            value: formatCount(summary.privateCount),
            icon: Lock,
            tone: 'bg-warning-soft text-warning-fg',
          }
        : {
            label: 'Events',
            value: formatCount(events.length),
            icon: CalendarDays,
            tone: 'bg-warning-soft text-warning-fg',
          },
      {
        label: 'Storage (originals)',
        value: formatBytes(summary.totalBytes),
        icon: HardDrive,
        tone: 'bg-success-soft text-success-fg',
      },
    ];

  const reminders = [
    account.passwordChangedAt === null && 'You are still using the password you were given.',
    passcode?.updatedAt === null && 'The friends passcode is still the initial one.',
  ].filter((reminder): reminder is string => Boolean(reminder));

  const hiddenUnless = (id: Tab) => (tab === id ? undefined : true);

  return (
    <div>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-link text-xs font-semibold tracking-[0.14em] uppercase'>
            {roleLabel[account.role]}
          </p>
          <h1 className='font-display mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl'>
            Hello, {account.username}
          </h1>
          <p className='text-muted mt-1.5'>Upload, organise and look after the archive.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link href='/gallery' className={buttonStyles('secondary', 'md')}>
            <ExternalLink className='size-4' /> View the gallery
          </Link>
          <Button onClick={() => open('upload')}>
            <Upload className='size-4' /> Upload
          </Button>
        </div>
      </div>

      {reminders.length > 0 && (
        <Notice tone='warning' className='mt-6'>
          {reminders.join(' ')}{' '}
          <button
            type='button'
            onClick={() => open('settings')}
            className='font-semibold underline underline-offset-2'>
            Change {reminders.length > 1 ? 'them' : 'it'} in Settings
          </button>
        </Notice>
      )}

      <dl className='mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className='border-line-soft bg-surface shadow-card flex items-center gap-4 rounded-2xl border p-4'>
            <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', stat.tone)}>
              <stat.icon className='size-5' />
            </span>
            <div className='min-w-0'>
              <dt className='text-muted truncate text-xs font-medium sm:text-sm'>{stat.label}</dt>
              <dd className='font-display mt-0.5 text-xl font-semibold sm:text-2xl'>{stat.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className='mt-8 flex flex-col gap-6 lg:flex-row lg:items-start'>
        <nav
          aria-label='Dashboard sections'
          className='border-line-soft bg-surface flex scrollbar-none gap-1 overflow-x-auto rounded-2xl border p-1.5 lg:sticky lg:top-24 lg:w-60 lg:shrink-0 lg:flex-col'>
          {menu.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type='button'
                aria-current={active ? 'page' : undefined}
                onClick={() => open(item.id)}
                className={cn(
                  'flex h-11 shrink-0 items-center gap-3 rounded-xl px-3.5 text-sm transition',
                  active
                    ? 'bg-primary-soft text-link font-semibold'
                    : 'text-muted hover:bg-subtle hover:text-fg font-medium',
                )}>
                <item.icon className='size-[18px] shrink-0' />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold',
                      item.alert ? 'bg-warning-soft text-warning-fg' : active ? 'text-link' : 'text-muted',
                    )}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className='min-w-0 flex-1'>
          <div hidden={hiddenUnless('library')}>
            <Panel
              title='Library'
              description='Select items to change who can see them, move them to an event or delete them.'>
              <AdminLibrary initial={firstPage} events={events} version={version} onChanged={changed} />
            </Panel>
          </div>
          <div hidden={hiddenUnless('upload')}>
            <Panel
              title='Upload'
              description='Photos are ready at once. Videos are converted for the web on the server, one at a time.'>
              <UploadPanel events={events} privateAccess={account.privateAccess} onFinished={changed} />
            </Panel>
          </div>
          <div hidden={hiddenUnless('events')}>
            <Panel
              title='Events'
              description='Group photos and videos by occasion. Deleting an event keeps its photos.'>
              <EventsManager events={events} onChanged={changed} />
            </Panel>
          </div>
          {deletedPage && users && (
            <div hidden={hiddenUnless('deleted')}>
              <Panel
                title='Deleted by admins'
                description='Items admins deleted wait here. Restore them, or delete them for good.'>
                <DeletedLibrary initial={deletedPage} users={users} version={version} onChanged={changed} />
              </Panel>
            </div>
          )}
          {users && (
            <div hidden={hiddenUnless('admins')}>
              <Panel
                title='Admins'
                description='Accounts that can upload and organise. Only you can manage them.'>
                <UsersManager users={users} onChanged={refresh} />
              </Panel>
            </div>
          )}
          {users && (
            <div hidden={hiddenUnless('branding')}>
              <Panel
                title='Branding'
                description='The name, logo and texts every visitor sees, and how the home page opens.'>
                <BrandingForm />
              </Panel>
            </div>
          )}
          <div hidden={hiddenUnless('settings')} className='grid gap-6 xl:grid-cols-2'>
            <Panel
              title='Your password'
              description={
                <>
                  {account.passwordChangedAt
                    ? 'Last changed on ' + formatShortDate(account.passwordChangedAt) + '.'
                    : 'You have not chosen your own password yet.'}{' '}
                  Changing it signs you out on every other device.
                </>
              }>
              <ChangePasswordForm />
            </Panel>
            {passcode && (
              <Panel
                title='Friends passcode'
                description={
                  <>
                    Friends enter this to see private photos and videos.{' '}
                    {passcode.updatedAt
                      ? 'Last changed on ' + formatShortDate(passcode.updatedAt) + '.'
                      : 'It is still the initial passcode.'}{' '}
                    Changing it locks every friend out until they enter the new one.
                  </>
                }>
                <FriendsPasscodeForm />
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
