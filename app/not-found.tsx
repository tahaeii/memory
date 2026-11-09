import Link from 'next/link';
import { t } from '@i18n';
import { Backdrop } from '@/shared/ui/Backdrop';
import { buttonStyles } from '@/shared/ui/Button';
import { Container } from '@/shared/ui/Container';

export default function NotFound() {
  return (
    <section className='min-h-page relative isolate grid items-center'>
      <Backdrop />
      <Container className='py-16 text-center'>
        <p className='text-link text-sm font-medium tabular-nums'>{t('common.notFound.code')}</p>
        <h1 className='type-title mt-3'>{t('common.notFound.title')}</h1>
        <p className='text-muted mt-3'>{t('common.notFound.text')}</p>
        <Link href='/' className={buttonStyles('primary', 'md', 'mt-8')}>
          {t('common.notFound.back')}
        </Link>
      </Container>
    </section>
  );
}
