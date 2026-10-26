import Link from 'next/link';
import { getSiteConfig } from '@/shared/config/site.server';
import { Container } from '@/shared/ui/Container';
import { Logo } from '@/shared/ui/Logo';

export async function SiteFooter() {
  const site = await getSiteConfig();
  return (
    <footer className='border-line-soft mt-24 border-t'>
      <Container className='text-muted flex flex-col items-start justify-between gap-4 py-8 text-sm sm:flex-row sm:items-center'>
        <Logo
          name={site.name}
          src={site.logoUrl}
          className='[&>:first-child]:size-6 [&>:first-child]:rounded-md [&>span]:text-sm'
        />
        <p>
          © {new Date().getFullYear()} {site.organization.replace(/\.$/, '')}. All photos belong to the
          company.
        </p>
        <Link href='/admin' className='hover:text-fg transition'>
          Admin
        </Link>
      </Container>
    </footer>
  );
}
