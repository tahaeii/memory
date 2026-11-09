import Link from 'next/link';
import { t } from '@i18n';
import { getSiteConfig } from '@/shared/config/site.server';
import { Container } from '@/shared/ui/Container';
import { Logo } from '@/shared/ui/Logo';

export async function SiteFooter() {
  const site = await getSiteConfig();
  return (
    <footer className='border-line-soft mt-section border-t'>
      <Container className='text-muted flex flex-col items-start justify-between gap-4 py-8 text-sm sm:flex-row sm:items-center'>
        <Logo
          name={site.name}
          src={site.logoUrl}
          className='[&>:first-child]:size-6 [&>:first-child]:rounded-md [&>span]:text-sm'
        />
        <p>
          {t('common.footer.rights', {
            year: new Date().getFullYear(),
            organization: site.organization.replace(/\.$/, ''),
          })}
        </p>
        <Link href='/admin' className='link-underline hover:text-fg transition-colors'>
          {t('common.footer.admin')}
        </Link>
      </Container>
    </footer>
  );
}
