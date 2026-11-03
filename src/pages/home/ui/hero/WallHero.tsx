import Link from 'next/link';
import type { MediaDto } from '@/entities/media';
import { MediaImage } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { Container } from '@/shared/ui/Container';
import { Backdrop } from '@/shared/ui/Backdrop';
import { HeroText, ratioOf, type HeroProps } from './parts';

/** The text beside three columns of recent photos that drift slowly up and down. */
export function WallHero({ site, summary, photos }: HeroProps) {
  const columns: MediaDto[][] = [[], [], []];
  photos.forEach((photo, index) => columns[index % 3].push(photo));

  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Backdrop />

      <Container className='lg:min-h-hero grid items-center gap-12 pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pt-0'>
        <div className='max-w-2xl'>
          <HeroText site={site} summary={summary} />
        </div>

        <div
          aria-hidden
          className='lg:h-hero relative -mx-4 h-[clamp(18rem,48svh,28rem)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)] sm:-mx-6 lg:mx-0 lg:-mr-8'>
          <div className='grid h-full grid-cols-3 gap-3 sm:gap-4'>
            {columns.map((column, index) => (
              <div key={index} className={cn('min-w-0', index === 1 && '-mt-24')}>
                <div
                  className={cn(
                    'flex flex-col gap-3 will-change-transform hover:[animation-play-state:paused] sm:gap-4',
                    index === 1 ? 'animate-wall-down' : 'animate-wall-up',
                  )}
                  style={{ animationDuration: 70 + index * 18 + 's' }}>
                  {[...column, ...column].map((photo, position) => (
                    <Link
                      key={photo.id + '-' + position}
                      href='/gallery'
                      tabIndex={-1}
                      className='group bg-subtle ring-line-soft relative block overflow-hidden rounded-lg bg-cover ring-1'
                      style={{
                        aspectRatio: String(ratioOf(photo, 0.72, 1.35)),
                        backgroundImage: 'url(' + photo.placeholder + ')',
                      }}>
                      <MediaImage
                        item={photo}
                        sizes='(min-width: 1024px) 17vw, 32vw'
                        priority={position < 2}
                        className='transition-transform duration-700 group-hover:scale-[1.04]'
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
