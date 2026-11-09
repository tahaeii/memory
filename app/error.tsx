'use client';

import { t } from '@i18n';
import { Backdrop } from '@/shared/ui/Backdrop';
import { Button } from '@/shared/ui/Button';
import { Container } from '@/shared/ui/Container';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className='min-h-page relative isolate grid items-center'>
      <Backdrop />
      <Container className='py-16 text-center'>
        <h1 className='type-title'>{t('common.crash.title')}</h1>
        <p className='text-muted mt-3'>{t('common.crash.text')}</p>
        <Button className='mt-8' onClick={reset}>
          {t('common.crash.retry')}
        </Button>
      </Container>
    </section>
  );
}
