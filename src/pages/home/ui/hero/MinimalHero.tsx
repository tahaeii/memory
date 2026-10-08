import { Container } from '@/shared/ui/Container';
import { Actions, Glow, Headline, Lede, Stats, type HeroProps } from './parts';

/** Logo and words only: for organisations that prefer no photos on the first screen. */
export function MinimalHero({ site, stats }: HeroProps) {
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Glow centered />
      <div aria-hidden className='pattern-grid absolute inset-x-0 top-0 -z-10 h-[640px]' />
      <Container className='py-20 text-center sm:py-28'>
        <img
          src={site.logoUrl}
          alt=''
          width={72}
          height={72}
          className='animate-fade-up border-line bg-surface shadow-card mx-auto size-[72px] rounded-[22px] border object-contain p-2'
        />
        <p className='animate-fade-up text-muted mt-6 text-sm font-medium tracking-[0.14em] uppercase'>
          {site.organization} · {site.tagline}
        </p>
        <Headline site={site} className='mx-auto mt-5 max-w-4xl' />
        <Lede align='center'>{site.description}</Lede>
        <Actions align='center' />
        <Stats stats={stats} align='center' />
      </Container>
    </section>
  );
}
