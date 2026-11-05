import { redirect } from 'next/navigation';
import { t } from '@i18n';
import { loadSetupState } from '@/entities/user/server';
import { SetupForm } from '@/features/initial-setup';
import { getSiteConfig } from '@/shared/config/site.server';
import { AuthShell } from '@/shared/ui/AuthShell';

/** Only reachable until the first super admin exists. */
export async function SetupPage() {
  if ((await loadSetupState()) === 'complete') redirect('/admin/login');
  const site = await getSiteConfig();
  return (
    <AuthShell title={t('setup.title')} subtitle={t('setup.subtitle')}>
      <SetupForm
        friendsEnabled={site.friendsEnabled}
        defaultName={site.name}
        defaultOrganization={site.organization}
      />
    </AuthShell>
  );
}
