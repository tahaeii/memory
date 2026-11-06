import Link from 'next/link';
import { MediaImage, type MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { Container } from '@/shared/ui/Container';
import { Backdrop } from '@/shared/ui/Backdrop';
import { Actions, Colophon, Headline, Lede, Organization, Tagline, ratioOf, type HeroProps } from './parts';

function Strip({ photos, direction }: { photos: MediaDto[]; direction: 'left' | 'right' }) {
  return (
    <div className='flex overflow-hidden'>
      <div
        className={cn(
          'flex shrink-0 gap-4 pr-4 will-change-transform hover:[animation-play-state:paused]',
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right',
        )}
        style={{ animationDuration: photos.length * 9 + 's' }}>
        {[...photos, ...photos].map((photo, index) => (
          <Link
            key={photo.id + '-' + index}
            href='/gallery'
            tabIndex={-1}
            className='group bg-subtle ring-line-soft relative block h-[clamp(8rem,19svh,14rem)] shrink-0 overflow-hidden rounded-lg bg-cover ring-1'
            style={{
              aspectRatio: String(ratioOf(photo, 0.75, 1.6)),
              backgroundImage: 'url(' + photo.placeholder + ')',
            }}>
            <MediaImage item={photo} sizes='(min-width: 640px) 360px, 280px' priority={index < 4} zoom />
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Centred text over two rows of photos that drift sideways in opposite directions. */
export function FilmstripHero({ site, summary, photos }: HeroProps) {
  const half = Math.ceil(photos.length / 2);
  return (
    <section className='border-line-soft min-h-hero relative isolate flex flex-col justify-center overflow-hidden border-b py-12'>
      <Backdrop />
      <Container className='pb-[clamp(2rem,6svh,3.5rem)] text-center'>
        <Organization site={site} />
        <Headline site={site} className='mx-auto max-w-4xl' />
        <Tagline site={site} />
        <Lede align='center'>{site.description}</Lede>
        <Actions align='center' />
      </Container>
      <div
        aria-hidden
        className='animate-enter space-y-4 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]'
        style={{ animationDelay: '300ms' }}>
        <Strip photos={photos.slice(0, half)} direction='left' />
        <Strip photos={photos.slice(half)} direction='right' />
      </div>
      <Container>
        <Colophon align='center'>{summary}</Colophon>
      </Container>
    </section>
  );
}
