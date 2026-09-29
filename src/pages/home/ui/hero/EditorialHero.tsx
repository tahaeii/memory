import { MediaImage, type MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { Container } from '@/shared/ui/Container';
import { Actions, Eyebrow, Glow, Lede, Stats, headlineStyles, type HeroProps } from './parts';

/** A small rounded photo set into the line of text (from tablet width; phones get the plain words). */
function Inline({ photo, delay }: { photo: MediaDto; delay: number }) {
  return (
    <span
      aria-hidden
      className='animate-pop bg-subtle ring-line relative mx-[0.12em] hidden h-[0.82em] w-[1.7em] -translate-y-[0.06em] overflow-hidden rounded-full bg-cover align-middle ring-1 sm:inline-block'
      style={{ backgroundImage: 'url(' + photo.placeholder + ')', animationDelay: delay + 'ms' }}>
      <MediaImage item={photo} sizes='160px' priority />
    </span>
  );
}

/** A large centred headline with recent photos set into the words. */
export function EditorialHero({ site, stats, photos }: HeroProps) {
  const [first, second] = photos;
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Glow centered />
      <div aria-hidden className='pattern-grid absolute inset-x-0 top-0 -z-10 h-[620px] opacity-60' />
      <Container className='py-20 text-center sm:py-28'>
        <Eyebrow site={site} />
        <h1
          className={cn(headlineStyles, 'mx-auto mt-9 max-w-6xl text-[2.7rem] sm:text-[4rem] xl:text-[5rem]')}
          style={{ animationDelay: '80ms' }}>
          Every {first && <Inline photo={first} delay={300} />} moment,
          <br />
          {second && <Inline photo={second} delay={420} />} in{' '}
          <span className='text-primary'>{site.name}.</span>
        </h1>
        <Lede align='center'>{site.description}</Lede>
        <Actions align='center' />
        <Stats stats={stats} align='center' />
      </Container>
    </section>
  );
}
