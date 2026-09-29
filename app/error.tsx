'use client';

import { Button } from '@/shared/ui/Button';
import { Container } from '@/shared/ui/Container';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className='py-32 text-center'>
      <h1 className='text-fg text-3xl font-semibold tracking-tight'>Something went wrong</h1>
      <p className='text-muted mt-2'>Please try again. If it keeps happening, check the server logs.</p>
      <Button className='mt-8' onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
