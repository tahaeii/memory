import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import type { EventDto } from '@/entities/event';
import type { MediaDto } from '@/entities/media';
import type { SiteConfig } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import { buttonStyles } from '@/shared/ui/Button';

export interface HeroStat {
  label: string;
  value: string;
}

/** What every hero style receives. */
export interface HeroProps {
  site: SiteConfig;
  stats: HeroStat[];
  /** Recent photos, newest first. */
  photos: MediaDto[];
  /** The newest event with a cover. */
  featured: EventDto | null;
}

type Tone = 'default' | 'inverted';
type Align = 'start' | 'center';

/** Logo, organisation and tagline in one pill. */
export function Eyebrow({ site, tone = 'default' }: { site: SiteConfig; tone?: Tone }) {
  const inverted = tone === 'inverted';
  return (
    <p
      className={cn(
        'animate-enter inline-flex max-w-full items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1 text-[13px] font-medium backdrop-blur-md',
        inverted ? 'border-white/20 bg-white/10 text-white/90' : 'border-line bg-surface/70 text-muted',
      )}>
      <img src={site.logoUrl} alt='' width={24} height={24} className='size-6 shrink-0 rounded-full object-contain' />
      <span className={cn('truncate font-semibold', inverted ? 'text-white' : 'text-fg')}>{site.organization}</span>
      <span aria-hidden className={cn('h-3.5 w-px', inverted ? 'bg-white/30' : 'bg-line-strong')} />
      <span className='truncate'>{site.tagline}</span>
    </p>
  );
}

export const headlineStyles =
  'animate-enter font-display mt-7 text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.035em] text-balance sm:text-[3.4rem] xl:text-[4rem]';

/** "Every moment, in {name}." */
export function Headline({ site, tone = 'default', className }: { site: SiteConfig; tone?: Tone; className?: string }) {
  return (
    <h1 className={cn(headlineStyles, className)} style={{ animationDelay: '80ms' }}>
      Every moment,
      <br />
      <span className={tone === 'inverted' ? 'text-white/70' : 'text-primary'}>in {site.name}.</span>
    </h1>
  );
}

export function Lede({ children, tone = 'default', align = 'start' }: { children: ReactNode; tone?: Tone; align?: Align }) {
  return (
    <p
      className={cn(
        'animate-enter mt-6 max-w-xl text-lg leading-relaxed text-pretty',
        tone === 'inverted' ? 'text-white/80' : 'text-muted',
        align === 'center' && 'mx-auto',
      )}
      style={{ animationDelay: '160ms' }}>
      {children}
    </p>
  );
}

/** "Browse the gallery" and "View events". */
export function Actions({ tone = 'default', align = 'start' }: { tone?: Tone; align?: Align }) {
  const inverted = tone === 'inverted';
  return (
    <div
      className={cn('animate-enter mt-9 flex flex-wrap gap-3', align === 'center' && 'justify-center')}
      style={{ animationDelay: '240ms' }}>
      <Link
        href='/gallery'
        className={buttonStyles(
          'primary',
          'lg',
          inverted ? 'bg-white text-[#0f1520] shadow-none hover:bg-white/90 active:bg-white/80' : undefined,
        )}>
        Browse the gallery <ArrowRight className='size-4' />
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

/** Library numbers with thin dividers. */
export function Stats({ stats, tone = 'default', align = 'start' }: { stats: HeroStat[]; tone?: Tone; align?: Align }) {
  const inverted = tone === 'inverted';
  return (
    <dl
      className={cn('animate-enter mt-12 flex flex-wrap gap-y-6', align === 'center' && 'justify-center')}
      style={{ animationDelay: '320ms' }}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            'flex flex-col-reverse gap-2 px-7 sm:px-9',
            align === 'start' && index === 0 && 'pl-0 sm:pl-0',
            index > 0 && 'border-l',
            inverted ? 'border-white/20' : 'border-line',
          )}>
          <dt className={cn('text-xs font-medium tracking-[0.08em] uppercase', inverted ? 'text-white/70' : 'text-muted')}>
            {stat.label}
          </dt>
          <dd className='font-display text-[28px] leading-none font-semibold tracking-tight tabular-nums'>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The quiet backdrop of the light styles: a soft brand glow from the top. */
export function Glow({ centered = false }: { centered?: boolean }) {
  return (
    <div aria-hidden className='absolute inset-0 -z-10'>
      <div className='from-primary/[0.09] absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b to-transparent' />
      <div
        className={cn(
          'bg-primary/10 absolute -top-48 size-[560px] rounded-full blur-[160px]',
          centered ? 'left-1/2 -translate-x-1/2' : 'left-[12%]',
        )}
      />
      <div className='via-primary/30 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent' />
    </div>
  );
}

/** Width/height ratio kept within limits, so odd panoramas do not break a layout. */
export const ratioOf = (photo: MediaDto, min: number, max: number): number =>
  Math.min(max, Math.max(min, photo.width / photo.height));
