import Link from 'next/link';
import type { ReactNode } from 'react';
import type { EventDto } from '@/entities/event';
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
  /** The newest event with a cover. */
  featured: EventDto | null;
}

/** `inverted` is for text that sits on a photo. */
type Tone = 'default' | 'inverted';
type Align = 'start' | 'center';

interface PartProps {
  tone?: Tone;
  align?: Align;
}

/** Delay of each line of the opening sequence, in the order the lines appear. */
const STAGGER_MS = 70;
const delay = (step: number) => ({ animationDelay: step * STAGGER_MS + 'ms' });

/** Who the archive belongs to, above its name. */
export function Organization({ site, tone = 'default' }: { site: SiteConfig } & PartProps) {
  if (!site.organization) return null;
  return (
    <p
      className={cn(
        'animate-enter text-[15px] font-medium',
        tone === 'inverted' ? 'text-white/75' : 'text-muted',
      )}
      style={delay(0)}>
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
export function Tagline({ site, tone = 'default' }: { site: SiteConfig } & PartProps) {
  if (!site.tagline) return null;
  return (
    <p
      className={cn(
        'animate-enter font-display mt-4 text-xl leading-snug sm:text-2xl',
        tone === 'inverted' ? 'text-white/85' : 'text-muted',
      )}
      style={delay(2)}>
      {site.tagline}
    </p>
  );
}

export function Lede({ children, tone = 'default', align = 'start' }: { children: ReactNode } & PartProps) {
  return (
    <p
      className={cn(
        'animate-enter mt-6 max-w-xl text-[17px] leading-relaxed text-pretty',
        tone === 'inverted' ? 'text-white/80' : 'text-muted',
        align === 'center' && 'mx-auto',
      )}
      style={delay(3)}>
      {children}
    </p>
  );
}

/** "Browse the gallery" and "View events". */
export function Actions({ tone = 'default', align = 'start' }: PartProps) {
  const inverted = tone === 'inverted';
  return (
    <div
      className={cn('animate-enter mt-8 flex flex-wrap gap-3', align === 'center' && 'justify-center')}
      style={delay(4)}>
      <Link
        href='/gallery'
        className={buttonStyles(
          'primary',
          'lg',
          inverted ? 'bg-white text-black shadow-none hover:bg-white/90 active:bg-white/80' : undefined,
        )}>
        Browse the gallery
      </Link>
      <Link
        href='/events'
        className={buttonStyles(
          inverted ? 'ghost' : 'secondary',
          'lg',
          inverted ? 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white' : undefined,
        )}>
        View events
      </Link>
    </div>
  );
}

/** What the archive holds, as one quiet sentence. */
export function Colophon({ children, tone = 'default', align = 'start' }: { children: string } & PartProps) {
  if (!children) return null;
  return (
    <p
      className={cn(
        'animate-enter mt-8 text-sm tabular-nums',
        tone === 'inverted' ? 'text-white/70' : 'text-muted',
        align === 'center' && 'text-center',
      )}
      style={delay(5)}>
      {children}
    </p>
  );
}

/** Everything a hero says, in order. Styles that arrange the lines differently use the parts above. */
export function HeroText({ site, summary, tone, align }: Pick<HeroProps, 'site' | 'summary'> & PartProps) {
  return (
    <>
      <Organization site={site} tone={tone} />
      <Headline site={site} className={align === 'center' ? 'mx-auto max-w-4xl' : undefined} />
      <Tagline site={site} tone={tone} />
      <Lede tone={tone} align={align}>
        {site.description}
      </Lede>
      <Actions tone={tone} align={align} />
      <Colophon tone={tone} align={align}>
        {summary}
      </Colophon>
    </>
  );
}

/** Width/height ratio kept within limits, so odd panoramas do not break a layout. */
export const ratioOf = (photo: MediaDto, min: number, max: number): number =>
  Math.min(max, Math.max(min, photo.width / photo.height));
