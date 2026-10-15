import { Backdrop } from '@/shared/ui/Backdrop';
import { Container } from '@/shared/ui/Container';
import { HeroText, type HeroProps } from './parts';

/** Logo and words only: for organisations that prefer no photos on the first screen. */
export function MinimalHero({ site, summary }: HeroProps) {
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Backdrop />
      <Container className='py-16 text-center sm:py-24'>
        <img
          src={site.logoUrl}
          alt=''
          width={64}
          height={64}
          className='animate-enter mx-auto mb-8 size-16 rounded-2xl object-contain'
        />
        <HeroText site={site} summary={summary} align='center' />
      </Container>
    </section>
  );
}
