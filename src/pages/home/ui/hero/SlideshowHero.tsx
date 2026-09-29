'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MediaImage } from '@/entities/media';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { Container } from '@/shared/ui/Container';
import { Actions, Eyebrow, Headline, Lede, Stats, type HeroProps } from './parts';

const SECONDS = 7;

/** Recent photos one after another across the whole width, each slowly settling into place. */
export function SlideshowHero({ site, stats, photos }: HeroProps) {
  const slides = photos.slice(0, 6);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % slides.length);
    }, SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [slides.length, active]);

  const current = slides[active];
  return (
    <section className='relative isolate -mt-16 overflow-hidden bg-[#0b1018] text-white'>
      <div aria-hidden className='absolute inset-0 -z-10'>
        {slides.map((photo, index) => (
          <div
            key={photo.id}
            className={cn(
              'absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-out',
              index === active ? 'opacity-100' : 'opacity-0',
            )}
            style={{ backgroundImage: 'url(' + photo.placeholder + ')' }}>
            <div className={cn('absolute inset-0', index === active && 'animate-ken-burns')}>
              <MediaImage item={photo} sizes='100vw' priority={index === 0} large />
            </div>
          </div>
        ))}
        <div className='absolute inset-0 bg-gradient-to-r from-[#0b1018]/90 via-[#0b1018]/55 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-t from-[#0b1018] via-transparent to-[#0b1018]/50' />
      </div>

      <Container className='flex min-h-[min(92vh,820px)] flex-col justify-end pt-32 pb-12'>
        <div className='max-w-2xl'>
          <Eyebrow site={site} tone='inverted' />
          <Headline site={site} tone='inverted' />
          <Lede tone='inverted'>{site.description}</Lede>
          <Actions tone='inverted' />
          <Stats stats={stats} tone='inverted' />
        </div>

        <div className='mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-white/15 pt-5'>
          {current?.event ? (
            <Link href={'/events/' + current.event.slug} className='group min-w-0 text-sm'>
              <span className='block text-white/60'>{formatShortDate(current.takenAt)}</span>
              <span className='block truncate font-semibold group-hover:underline'>{current.event.title}</span>
            </Link>
          ) : (
            <span className='text-sm text-white/60'>{current ? formatShortDate(current.takenAt) : ''}</span>
          )}
          {slides.length > 1 && (
            <div className='flex gap-2'>
              {slides.map((photo, index) => (
                <button
                  key={photo.id}
                  type='button'
                  onClick={() => setActive(index)}
                  aria-label={'Show photo ' + (index + 1)}
                  aria-current={index === active ? 'true' : undefined}
                  className='group py-3'>
                  <span className='block h-1 w-8 overflow-hidden rounded-full bg-white/25 sm:w-12'>
                    <span
                      key={index === active ? 'active-' + active : 'idle'}
                      className={cn(
                        'block h-full origin-left rounded-full bg-white',
                        index === active ? 'animate-grow w-full' : index < active ? 'w-full' : 'w-0',
                      )}
                      style={index === active ? { animationDuration: SECONDS + 's' } : undefined}
                    />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
