import type { MediaDto } from '@/entities/media';

/** Staff download the untouched original; everyone else the web version. */
export function downloadFor(item: MediaDto): { href: string; name: string } {
  if (item.originalUrl) return { href: item.originalUrl, name: item.name };
  const base = item.name.replace(/\.[^.]+$/, '');
  if (item.video?.url) return { href: item.video.url, name: base + '.mp4' };
  return { href: item.variants.large.url, name: base + '.webp' };
}
