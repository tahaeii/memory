import Link from 'next/link';
import { MediaImage, type MediaDto } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { Container } from '@/shared/ui/Container';
import { Backdrop } from '@/shared/ui/Backdrop';
import { HeroText, type HeroProps } from './parts';

/** Where each of the five photos sits in the 3 × 3 grid. */
const CELLS = [
  'col-span-2 row-span-2',
  'col-start-3 row-start-1',
  'col-start-3 row-start-2',
  'col-start-1 row-start-3',
  'col-span-2 col-start-2 row-start-3',
];

function Tile({ photo, index }: { photo: MediaDto; index: number }) {
  return (
    <Link
      href={photo.event ? '/events/' + photo.event.slug : '/gallery'}
      className={cn(
        'group animate-enter bg-subtle ring-line-soft relative block overflow-hidden rounded-xl bg-cover ring-1',
        CELLS[index],
      )}
      style={{ backgroundImage: 'url(' + photo.placeholder + ')', animationDelay: 150 + index * 90 + 'ms' }}>
      <MediaImage
        item={photo}
        sizes={index === 0 ? '(min-width: 1024px) 34vw, 66vw' : '(min-width: 1024px) 17vw, 33vw'}
        priority={index < 3}
        className='transition-transform duration-700 group-hover:scale-[1.04]'
      />
      {index === 0 && photo.event && (
        <span className='bg-glass text-fg absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 rounded-lg px-4 py-3 backdrop-blur-xl'>
          <span className='min-w-0'>
            <span className='text-muted block text-xs font-medium'>{formatShortDate(photo.takenAt)}</span>
            <span className='block truncate font-semibold'>{photo.event.title}</span>
          </span>
        </span>
      )}
    </Link>
  );
}

/** The text beside an editorial grid of five recent photos. */
export function MosaicHero({ site, summary, photos }: HeroProps) {
  return (
    <section className='border-line-soft relative isolate overflow-hidden border-b'>
      <Backdrop />
      <Container className='lg:min-h-hero grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'>
        <div className='max-w-2xl'>
          <HeroText site={site} summary={summary} />
        </div>
        <div className='grid h-[clamp(20rem,62svh,36rem)] grid-cols-3 grid-rows-3 gap-3 sm:gap-4'>
          {photos.slice(0, 5).map((photo, index) => (
            <Tile key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
