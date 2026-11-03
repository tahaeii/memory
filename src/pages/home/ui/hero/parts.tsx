import Link from 'next/link';
import type { ReactNode } from 'react';
import type { MediaDto } from '@/entities/media';
import type { SiteConfig } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import { buttonStyles } from '@/shared/ui/Button';

/** What every hero style receives. */
export interface HeroProps {
  site: SiteConfig;
  /** One sentence about what the archive holds; empty while it holds nothing. */
  summary: string;
  /** Recent photos, newest first. */
  photos: MediaDto[];
}

interface PartProps {
  align?: 'start' | 'center';
}

/** Delay of each line of the opening sequence, in the order the lines appear. */
const STAGGER_MS = 70;
const delay = (step: number) => ({ animationDelay: step * STAGGER_MS + 'ms' });

/** Who the archive belongs to, above its name. */
export function Organization({ site }: { site: SiteConfig }) {
  if (!site.organization) return null;
  return (
    <p className='animate-enter text-muted text-[15px] font-medium' style={delay(0)}>
      {site.organization}
    </p>
  );
}

/** The archive's name, set like the title of a photo book. */
export function Headline({ site, className }: { site: SiteConfig; className?: string }) {
  return (
    <h1 className={cn('animate-enter type-hero mt-4', className)} style={delay(1)}>
      {site.name}
    </h1>
  );
}

/** The tagline as a subtitle under the name. */
export function Tagline({ site }: { site: SiteConfig }) {
  if (!site.tagline) return null;
  return (
    <p
      className='animate-enter text-muted mt-4 text-xl leading-snug tracking-tight sm:text-2xl'
      style={delay(2)}>
      {site.tagline}
    </p>
  );
}

export function Lede({ children, align = 'start' }: { children: ReactNode } & PartProps) {
  return (
    <p
      className={cn(
        'animate-enter text-muted mt-6 max-w-xl text-[17px] leading-relaxed text-pretty',
        align === 'center' && 'mx-auto',
      )}
      style={delay(3)}>
      {children}
    </p>
  );
}

/** "Browse the gallery" and "View events". */
export function Actions({ align = 'start' }: PartProps) {
  return (
    <div
      className={cn('animate-enter mt-8 flex flex-wrap gap-3', align === 'center' && 'justify-center')}
      style={delay(4)}>
      <Link href='/gallery' className={buttonStyles('primary', 'lg')}>
        Browse the gallery
      </Link>
      <Link href='/events' className={buttonStyles('secondary', 'lg')}>
        View events
      </Link>
    </div>
  );
}

/** What the archive holds, as one quiet sentence. */
export function Colophon({ children, align = 'start' }: { children: string } & PartProps) {
  if (!children) return null;
  return (
    <p
      className={cn(
        'animate-enter text-muted mt-8 text-sm tabular-nums',
        align === 'center' && 'text-center',
      )}
      style={delay(5)}>
      {children}
    </p>
  );
}

/** Everything a hero says, in order. Styles that arrange the lines differently use the parts above. */
export function HeroText({ site, summary, align }: Pick<HeroProps, 'site' | 'summary'> & PartProps) {
  return (
    <>
      <Organization site={site} />
      <Headline site={site} className={align === 'center' ? 'mx-auto max-w-4xl' : undefined} />
      <Tagline site={site} />
      <Lede align={align}>{site.description}</Lede>
      <Actions align={align} />
      <Colophon align={align}>{summary}</Colophon>
    </>
  );
}

/** Width/height ratio kept within limits, so odd panoramas do not break a layout. */
export const ratioOf = (photo: MediaDto, min: number, max: number): number =>
  Math.min(max, Math.max(min, photo.width / photo.height));
