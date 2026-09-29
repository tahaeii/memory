import Link from 'next/link';
import { buttonStyles } from '@/shared/ui/Button';
import { Container } from '@/shared/ui/Container';

export default function NotFound() {
  return (
    <Container className='py-32 text-center'>
      <p className='text-link text-sm font-medium'>404</p>
      <h1 className='text-fg mt-2 text-3xl font-semibold tracking-tight'>This page could not be found</h1>
      <p className='text-muted mt-2'>It may have moved, or it might be private.</p>
      <Link href='/' className={buttonStyles('primary', 'md', 'mt-8')}>
        Back to home
      </Link>
    </Container>
  );
}
