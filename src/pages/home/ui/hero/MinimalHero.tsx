import { Backdrop } from '@/shared/ui/Backdrop';
import { Container } from '@/shared/ui/Container';
import { LogoMark } from '@/shared/ui/Logo';
import { HeroText, type HeroProps } from './parts';

/** Logo and words only: for organisations that prefer no photos on the first screen. */
export function MinimalHero({ site, summary }: HeroProps) {
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Backdrop />
      <Container className='py-16 text-center sm:py-24'>
        <LogoMark src={site.logoUrl} className='animate-enter mx-auto mb-8 size-16 rounded-2xl' />
        <HeroText site={site} summary={summary} align='center' />
      </Container>
    </section>
  );
}
