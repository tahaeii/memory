import { MediaImage, type MediaDto } from '@/entities/media';
import { Backdrop } from '@/shared/ui/Backdrop';
import { Container } from '@/shared/ui/Container';
import { Actions, Colophon, Lede, Organization, Tagline, type HeroProps } from './parts';

/** A small rounded photo set into the line of text (from tablet width; phones get the plain words). */
function Inline({ photo, delay }: { photo: MediaDto; delay: number }) {
  return (
    <span
      aria-hidden
      className='animate-pop-in bg-subtle ring-line relative mx-[0.12em] hidden h-[0.78em] w-[1.6em] -translate-y-[0.04em] overflow-hidden rounded-full bg-cover align-middle ring-1 sm:inline-block'
      style={{ backgroundImage: 'url(' + photo.placeholder + ')', animationDelay: delay + 'ms' }}>
      <MediaImage item={photo} sizes='160px' priority />
    </span>
  );
}

/** The archive's name, very large and centred, with recent photos set between its words. */
export function EditorialHero({ site, summary, photos }: HeroProps) {
  const [first, second] = photos;
  const words = site.name.split(/\s+/).filter(Boolean);
  const lead = words.slice(0, Math.max(1, Math.ceil(words.length / 2))).join(' ');
  const rest = words.slice(Math.max(1, Math.ceil(words.length / 2))).join(' ');
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Backdrop />
      <Container className='py-16 text-center sm:py-24'>
        <Organization site={site} />
        <h1
          className='animate-enter type-hero mx-auto mt-5 max-w-6xl sm:text-[clamp(3.5rem,7.5vw,6rem)]'
          style={{ animationDelay: '70ms' }}>
          {lead} {first && <Inline photo={first} delay={320} />}
          {rest && (
            <>
              {' '}
              {rest} {second && <Inline photo={second} delay={440} />}
            </>
          )}
        </h1>
        <Tagline site={site} />
        <Lede align='center'>{site.description}</Lede>
        <Actions align='center' />
        <Colophon align='center'>{summary}</Colophon>
      </Container>
    </section>
  );
}
