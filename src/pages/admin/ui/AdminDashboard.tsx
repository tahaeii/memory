'use client';

import { useCallback, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { LibrarySummaryDto, MediaPageDto } from '@/entities/media';
import { roleLabel } from '@/entities/session';
import type { PasscodeStatusDto, UserDto } from '@/entities/user';
import { BrandingForm } from '@/features/manage-branding';
import { EventsManager } from '@/features/manage-events';
import { UsersManager } from '@/features/manage-users';
import { UploadPanel } from '@/features/upload-media';
import { formatCount } from '@/shared/lib/format';
import { Button, buttonStyles } from '@/shared/ui/Button';
import { Panel } from '@/shared/ui/Panel';
import { AdminLibrary } from '@/widgets/admin-library';
import { DeletedLibrary } from '@/widgets/deleted-library';
import { sectionsFor, type SectionId } from '../config/sections';
import { useSection } from '../model/use-section';
import { Reminders } from './Reminders';
import { SectionNav } from './SectionNav';
import { SettingsSection } from './SettingsSection';
import { StatStrip } from './StatStrip';

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

/** One dashboard section. Every section stays mounted, so a half-filled form survives a look elsewhere. */
function Section({ id, current, children }: { id: SectionId; current: SectionId; children: ReactNode }) {
  return (
    <div hidden={id !== current} className='animate-fade-in'>
      {children}
    </div>
  );
}

/** Staff home: the numbers, a section menu and the sections. */
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
  const isSuperAdmin = account.role === 'superadmin';
  const sections = sectionsFor(isSuperAdmin);
  const [current, open] = useSection(
    sections.map((section) => section.id),
    summary.itemCount === 0 ? 'upload' : 'library',
  );
  // Bumped after uploads and edits so the lists reload.
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => router.refresh(), [router]);
  const changed = useCallback(() => {
    setVersion((value) => value + 1);
    router.refresh();
  }, [router]);

  const counts: Partial<Record<SectionId, string>> = {
    library: formatCount(summary.itemCount),
    events: formatCount(events.length),
    deleted: formatCount(summary.deletedCount),
    admins: users ? formatCount(users.length) : undefined,
  };

  return (
    <div>
      <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-4'>
        <div>
          <h1 className='type-title'>Dashboard</h1>
          <p className='text-muted mt-2'>
            Signed in as <span className='text-fg font-medium'>{account.username}</span>,{' '}
            {roleLabel[account.role].toLowerCase()}.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link href='/gallery' className={buttonStyles('secondary', 'md')}>
            View the gallery
          </Link>
          <Button onClick={() => open('upload')}>
            <Upload className='size-4' /> Upload
          </Button>
        </div>
      </div>

      <Reminders account={account} passcode={passcode} onOpenSettings={() => open('settings')} />

      <StatStrip summary={summary} eventCount={events.length} showPrivate={account.privateAccess} />

      <div className='mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-6 lg:flex-row lg:items-start'>
        <SectionNav
          current={current}
          onOpen={open}
          items={sections.map((section) => ({
            ...section,
            count: counts[section.id],
            alert: section.id === 'deleted' && summary.deletedCount > 0,
          }))}
        />

        <div className='min-w-0 flex-1'>
          <Section id='library' current={current}>
            <Panel
              title='Library'
              description='Select items to change who can see them, move them to an event or delete them.'>
              <AdminLibrary initial={firstPage} events={events} version={version} onChanged={changed} />
            </Panel>
          </Section>
          <Section id='upload' current={current}>
            <Panel
              title='Upload'
              description='Photos are ready at once. Videos are converted for the web on the server, one at a time.'>
              <UploadPanel events={events} privateAccess={account.privateAccess} onFinished={changed} />
            </Panel>
          </Section>
          <Section id='events' current={current}>
            <Panel
              title='Events'
              description='Group photos and videos by occasion. Deleting an event keeps its photos.'>
              <EventsManager events={events} onChanged={changed} />
            </Panel>
          </Section>
          {deletedPage && users && (
            <Section id='deleted' current={current}>
              <Panel
                title='Deleted by admins'
                description='Hidden from everyone, including the admin who deleted them, until you restore them. Deleting them here removes them from the server for good.'>
                <DeletedLibrary initial={deletedPage} users={users} version={version} onChanged={changed} />
              </Panel>
            </Section>
          )}
          {users && (
            <Section id='admins' current={current}>
              <Panel
                title='Admins'
                description='Accounts that can upload and organise. Only you can manage them.'>
                <UsersManager users={users} onChanged={refresh} />
              </Panel>
            </Section>
          )}
          {users && (
            <Section id='branding' current={current}>
              <Panel
                title='Branding'
                description='The name, logo, colours and texts every visitor sees, and how the home page opens.'>
                <BrandingForm />
              </Panel>
            </Section>
          )}
          <Section id='settings' current={current}>
            <SettingsSection account={account} passcode={passcode} />
          </Section>
        </div>
      </div>
    </div>
  );
}
