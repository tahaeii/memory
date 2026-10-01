import { redirect } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { loadSetupState } from '@/entities/user/server';
import { SetupForm } from '@/features/initial-setup';
import { getSiteConfig } from '@/shared/config/site.server';
import { AuthShell } from '@/shared/ui/AuthShell';

/** Only reachable until the first super admin exists. */
export async function SetupPage() {
  if ((await loadSetupState()) === 'complete') redirect('/admin/login');
  const site = await getSiteConfig();
  return (
    <AuthShell
      icon={<KeyRound className='size-6' />}
      title='Set up your archive'
      subtitle='Name it and create the super admin account, which manages the other admins and everything else.'>
      <SetupForm
        friendsEnabled={site.friendsEnabled}
        defaultName={site.name}
        defaultOrganization={site.organization}
      />
    </AuthShell>
  );
}
