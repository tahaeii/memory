import { redirect } from 'next/navigation';
import { loadEvents } from '@/entities/event/server';
import { loadMediaPage, loadSummary } from '@/entities/media/server';
import { loadAccount, loadPasscodeStatus, loadUsers } from '@/entities/user/server';
import { getServerViewer } from '@/shared/api/server-session';
import { getSiteConfig } from '@/shared/config/site.server';
import { Container } from '@/shared/ui/Container';
import { AdminDashboard } from './AdminDashboard';

export async function AdminPage() {
  const viewer = await getServerViewer();
  const account = await loadAccount();
  if (!account) redirect('/admin/login');

  const isSuperAdmin = viewer.role === 'superadmin';
  const { friendsEnabled } = await getSiteConfig();
  const [summary, firstPage, events, users, passcode, deletedPage] = await Promise.all([
    loadSummary(),
    loadMediaPage({ limit: 60 }),
    loadEvents(),
    isSuperAdmin ? loadUsers() : Promise.resolve(null),
    friendsEnabled && viewer.privateAccess ? loadPasscodeStatus() : Promise.resolve(null),
    isSuperAdmin ? loadMediaPage({ limit: 60, deleted: true }) : Promise.resolve(null),
  ]);
  return (
    <Container className='py-8 sm:py-10'>
      <AdminDashboard
        account={account}
        summary={summary}
        firstPage={firstPage}
        events={events}
        users={users}
        passcode={passcode}
        deletedPage={deletedPage}
      />
    </Container>
  );
}
