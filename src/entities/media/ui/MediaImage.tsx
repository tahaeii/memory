'use client';

import { useEffect, useRef, useState } from 'react';
import { useSite } from '@/shared/config/site-context';
import { cn } from '@/shared/lib/cn';
import { formatDay } from '@/shared/lib/format';
import type { MediaDto } from '../model/types';

interface MediaImageProps {
  item: MediaDto;
  sizes: string;
  /** Load immediately with high priority (for images above the fold). */
  priority?: boolean;
  /** Also offer the large variant (for images that fill the screen). */
  large?: boolean;
  className?: string;
}

/**
 * Responsive <img> (a frame of the video for videos) that fills its relatively positioned parent and
 * fades in once loaded. Give the parent a background from `item.placeholder` for a blur-up effect.
 */
export function MediaImage({ item, sizes, priority = false, large = false, className }: MediaImageProps) {
  const site = useSite();
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Images served from cache can finish loading before hydration, so check once on mount.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const { thumb, medium } = item.variants;
  const srcSet =
    thumb.url +
    ' ' +
    thumb.width +
    'w, ' +
    medium.url +
    ' ' +
    medium.width +
    'w' +
    (large ? ', ' + item.variants.large.url + ' ' + item.variants.large.width + 'w' : '');
  const label = (item.kind === 'video' ? 'Video: ' : '') + (item.event?.title ?? site.name);
  return (
    <img
      ref={ref}
      src={thumb.url}
      srcSet={srcSet}
      sizes={sizes}
      alt={label + ' - ' + formatDay(item.takenAt)}
      width={item.width}
      height={item.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding='async'
      onLoad={() => setLoaded(true)}
      className={cn(
        'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
