import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MediaImage } from '@/entities/media';
import { formatShortDate } from '@/shared/lib/format';
import { Container } from '@/shared/ui/Container';
import { HeroText, type HeroProps } from './parts';

/** One large photo (the latest event's cover) behind the text, slowly settling into place. */
export function CoverHero({ site, summary, photos, featured }: HeroProps) {
  const cover = featured?.cover ?? photos[0];
  if (!cover) return null;
  return (
    <section className='relative isolate -mt-16 overflow-hidden bg-black text-white'>
      <div aria-hidden className='absolute inset-0 -z-10'>
        <div
          className='animate-ken-burns absolute inset-0 bg-cover bg-center'
          style={{ backgroundImage: 'url(' + cover.placeholder + ')' }}>
          <MediaImage item={cover} sizes='100vw' priority large />
        </div>
        <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/45' />
      </div>
      <Container className='flex min-h-[min(92vh,820px)] flex-col justify-end pt-32 pb-14 sm:pb-16'>
        <div className='max-w-2xl'>
          <HeroText site={site} summary={summary} tone='inverted' />
        </div>
        <div className='mt-8 flex flex-wrap items-end justify-end gap-8'>
          {featured && (
            <Link
              href={'/events/' + featured.slug}
              className='animate-enter group inline-flex max-w-sm items-center gap-4 rounded-xl border border-white/15 bg-white/10 p-3 pr-4 backdrop-blur-xl transition hover:bg-white/15'
              style={{ animationDelay: '420ms' }}>
              <span className='min-w-0'>
                <span className='block text-xs font-medium text-white/70'>
                  Latest event, {formatShortDate(featured.date)}
                </span>
                <span className='mt-0.5 block truncate font-semibold'>{featured.title}</span>
              </span>
              <span className='grid size-9 shrink-0 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:rotate-45'>
                <ArrowUpRight className='size-4' />
              </span>
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
