import { Backdrop } from '@/shared/ui/Backdrop';
import { Container } from '@/shared/ui/Container';
import { LogoMark } from '@/shared/ui/Logo';
import { HeroText, type HeroProps } from './parts';

/** Default: the logo and the words, centred in the first screen. */
export function MinimalHero({ site, summary }: HeroProps) {
  return (
    <section className='border-line-soft min-h-hero relative isolate grid items-center overflow-hidden border-b'>
      <Backdrop />
      <Container className='py-14 text-center'>
        <LogoMark src={site.logoUrl} className='animate-enter mx-auto mb-8 size-16' />
        <HeroText site={site} summary={summary} align='center' />
      </Container>
    </section>
  );
}
