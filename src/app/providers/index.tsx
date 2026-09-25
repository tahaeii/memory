import type { ReactNode } from 'react';
import { SessionProvider, type SessionDto } from '@/entities/session';
import type { SiteConfig } from '@/shared/config/site';
import { SiteProvider } from '@/shared/config/site-context';

/** Global client providers. Add new ones here. */
export function AppProviders({
  session,
  site,
  children,
}: {
  session: SessionDto;
  site: SiteConfig;
  children: ReactNode;
}) {
  return (
    <SiteProvider site={site}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </SiteProvider>
  );
}
