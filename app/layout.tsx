import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import '@fontsource-variable/inter';
import '@fontsource-variable/sora';
import { AppProviders } from '@/app/providers';
import { getServerSession } from '@/shared/api/server-session';
import { getSiteConfig } from '@/shared/config/site.server';
import { parseTheme, THEME_COLOR, THEME_COOKIE } from '@/shared/lib/theme';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';
import '@/app/styles/globals.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: { default: site.name, template: '%s · ' + site.name },
    description: site.description,
    robots: { index: false, follow: false },
    icons: { icon: site.logoUrl, apple: site.logoUrl },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return { themeColor: THEME_COLOR[theme], colorScheme: theme };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [session, store] = await Promise.all([getServerSession(), cookies()]);
  const theme = parseTheme(store.get(THEME_COOKIE)?.value);
  const site = await getSiteConfig();
  return (
    <html lang='en' className={theme === 'dark' ? 'dark' : undefined} style={{ colorScheme: theme }}>
      <body className='bg-canvas text-fg flex min-h-dvh flex-col font-sans'>
        <AppProviders session={session} site={site}>
          <SiteHeader />
          <main className='flex-1'>{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
