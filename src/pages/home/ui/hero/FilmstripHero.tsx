import Link from 'next/link';
import { MediaImage, type MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { Container } from '@/shared/ui/Container';
import { Actions, Eyebrow, Glow, Headline, Lede, Stats, ratioOf, type HeroProps } from './parts';

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
            className='group bg-subtle ring-line-soft relative block h-44 shrink-0 overflow-hidden rounded-2xl bg-cover ring-1 sm:h-56'
            style={{ aspectRatio: String(ratioOf(photo, 0.75, 1.6)), backgroundImage: 'url(' + photo.placeholder + ')' }}>
            <MediaImage
              item={photo}
              sizes='(min-width: 640px) 360px, 280px'
              priority={index < 4}
              className='transition-transform duration-700 group-hover:scale-[1.04]'
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Centred text over two rows of photos that drift sideways in opposite directions. */
export function FilmstripHero({ site, stats, photos }: HeroProps) {
  const half = Math.ceil(photos.length / 2);
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b pb-16'>
      <Glow centered />
      <Container className='pt-16 pb-14 text-center sm:pt-24'>
        <Eyebrow site={site} />
        <Headline site={site} />
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
        <Stats stats={stats} align='center' />
      </Container>
    </section>
  );
}
