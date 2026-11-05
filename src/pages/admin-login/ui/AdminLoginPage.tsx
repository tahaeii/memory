import { redirect } from 'next/navigation';
import { t } from '@i18n';
import { AdminLoginForm } from '@/features/admin-login';
import { isStaffRole } from '@/entities/session';
import { loadSetupState } from '@/entities/user/server';
import { getServerSession } from '@/shared/api/server-session';
import { AuthShell } from '@/shared/ui/AuthShell';

export async function AdminLoginPage() {
  if ((await loadSetupState()) === 'pending') redirect('/setup');
  if (isStaffRole((await getServerSession()).role)) redirect('/admin');
  return (
    <AuthShell title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <AdminLoginForm />
    </AuthShell>
  );
}
