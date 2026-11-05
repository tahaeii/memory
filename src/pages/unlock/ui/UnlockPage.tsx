import { notFound, redirect } from 'next/navigation';
import { t } from '@i18n';
import { UnlockForm } from '@/features/unlock-private';
import { getServerSession } from '@/shared/api/server-session';
import { getSiteConfig } from '@/shared/config/site.server';
import { safeInternalPath } from '@/shared/lib/safe-path';
import { firstParam, type SearchParams } from '@/shared/lib/search-params';
import { AuthShell } from '@/shared/ui/AuthShell';

export async function UnlockPage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await getSiteConfig()).friendsEnabled) notFound();
  const next = safeInternalPath(firstParam((await searchParams).next), '/gallery');
  if ((await getServerSession()).role !== 'guest') redirect(next);

  return (
    <AuthShell title={t('auth.unlock.title')} subtitle={t('auth.unlock.subtitle')}>
      <UnlockForm next={next} />
    </AuthShell>
  );
}
