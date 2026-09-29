import Link from 'next/link';
import { ArrowRight, CalendarDays, Images, Lock } from 'lucide-react';
import { loadEvents } from '@/entities/event/server';
import { MediaImage } from '@/entities/media';
import { loadMediaPage, loadSummary } from '@/entities/media/server';
import { isHeroStyle } from '@contracts/branding';
import { isStaffRole } from '@/entities/session';
import { UnlockForm } from '@/features/unlock-private';
import { getServerSession } from '@/shared/api/server-session';
import { getSiteConfig } from '@/shared/config/site.server';
import { formatCount, formatDay, formatMediaCount } from '@/shared/lib/format';
import { firstParam, type SearchParams } from '@/shared/lib/search-params';
import { Container } from '@/shared/ui/Container';
import { EventPoster } from '@/widgets/event-grid';
import { MediaGallery } from '@/widgets/media-gallery';
import { HomeHero, type HeroStat } from './HomeHero';

function SectionHead({ kicker, title, href, link }: { kicker: string; title: string; href: string; link: string }) {
  return (
    <div className='mb-7 flex items-end justify-between gap-4'>
      <div>
        <p className='text-link text-xs font-semibold tracking-[0.14em] uppercase'>{kicker}</p>
        <h2 className='font-display mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl'>{title}</h2>
      </div>
      <Link href={href} className='text-link inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:underline'>
        {link} <ArrowRight className='size-4' />
      </Link>
    </div>
  );
}

export async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const [site, session, summary, page, wall, events, query] = await Promise.all([
    getSiteConfig(),
    getServerSession(),
    loadSummary(),
    loadMediaPage({ limit: 12 }),
    loadMediaPage({ limit: 18, kind: 'photo' }),
    loadEvents(),
    searchParams,
  ]);
  const firstYear = summary.years.length > 0 ? summary.years[summary.years.length - 1] : null;
  const stats: HeroStat[] = [
    { label: 'Photos', value: formatCount(summary.photoCount) },
    ...(summary.videoCount > 0 ? [{ label: 'Videos', value: formatCount(summary.videoCount) }] : []),
    { label: 'Events', value: formatCount(events.length) },
    ...(firstYear ? [{ label: 'Since', value: String(firstYear) }] : []),
  ];
  const featured = events.find((event) => event.cover) ?? null;
  // Staff can try a style before saving it: /?hero=filmstrip (opened from Dashboard › Branding).
  const requested = firstParam(query.hero);
  const preview = isStaffRole(session.role) && isHeroStyle(requested) ? requested : null;
  const heroStyle = preview ?? site.heroStyle;
  // The cover style already shows the latest event.
  const showFeatured = heroStyle !== 'cover' && featured?.cover;

  return (
    <>
      {preview && (
        <div className='bg-primary text-on-primary fixed bottom-5 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl py-2 pr-2 pl-4 text-xs font-medium shadow-2xl sm:gap-4 sm:rounded-full sm:pl-5 sm:text-sm'>
          <span>
            Previewing the <strong>{preview}</strong> style. Visitors still see{' '}
            <strong>{site.heroStyle}</strong>.
          </span>
          <Link
            href='/admin#branding'
            className='shrink-0 rounded-full bg-black/15 px-3 py-1.5 font-semibold whitespace-nowrap hover:bg-black/25 sm:px-4'>
            Back to Branding
          </Link>
        </div>
      )}
      <HomeHero style={heroStyle} site={site} stats={stats} photos={wall.items} featured={featured} />

      {showFeatured && featured?.cover && (
        <Container className='pt-16'>
          <Link
            href={'/events/' + featured.slug}
            className='group border-line-soft bg-surface shadow-card flex flex-col overflow-hidden rounded-[28px] border md:flex-row'>
            <span
              className='bg-subtle relative block aspect-[16/10] overflow-hidden bg-cover md:aspect-auto md:min-h-[360px] md:flex-[1.5]'
              style={{ backgroundImage: 'url(' + featured.cover.placeholder + ')' }}>
              <MediaImage
                item={featured.cover}
                sizes='(min-width: 768px) 60vw, 100vw'
                className='transition-[transform,opacity] duration-700 group-hover:scale-[1.03]'
              />
            </span>
            <span className='flex flex-col justify-center p-7 sm:p-10 md:flex-1'>
              <span className='text-link text-xs font-semibold tracking-[0.14em] uppercase'>Latest event</span>
              <span className='font-display group-hover:text-link mt-3 text-3xl leading-tight font-semibold tracking-tight transition-colors'>
                {featured.title}
              </span>
              <span className='text-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm'>
                <span className='inline-flex items-center gap-1.5'>
                  <CalendarDays className='size-4' />
                  {formatDay(featured.date)}
                </span>
                <span className='inline-flex items-center gap-1.5'>
                  <Images className='size-4' />
                  {formatMediaCount(featured.photoCount, featured.videoCount)}
                </span>
              </span>
              {featured.description && (
                <span className='text-muted mt-4 line-clamp-3 leading-relaxed'>{featured.description}</span>
              )}
              <span className='text-link mt-7 inline-flex items-center gap-1.5 font-semibold'>
                Open event <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
              </span>
            </span>
          </Link>
        </Container>
      )}

      {page.items.length > 0 && (
        <Container className='pt-20'>
          <SectionHead
            kicker='Fresh from the team'
            title={summary.videoCount > 0 ? 'Latest photos and videos' : 'Latest photos'}
            href='/gallery'
            link='Full gallery'
          />
          <MediaGallery initial={page} grouping='none' pagination='button' pageSize={24} />
        </Container>
      )}

      {events.length > 0 && (
        <Container className='pt-20'>
          <SectionHead kicker='Gatherings and milestones' title='Events' href='/events' link='All events' />
          <div className='scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'>
            {events.slice(0, 10).map((event) => (
              <EventPoster key={event.id} event={event} />
            ))}
          </div>
        </Container>
      )}

      {session.role === 'guest' && site.friendsEnabled && (
        <Container className='pt-20'>
          <div className='border-line bg-primary-soft relative flex flex-col gap-8 overflow-hidden rounded-[28px] border p-7 sm:p-10 lg:flex-row lg:items-center'>
            <div aria-hidden className='pattern-grid absolute inset-0 opacity-60' />
            <div className='relative lg:flex-1'>
              <span className='bg-surface text-link shadow-card grid size-12 place-items-center rounded-2xl'>
                <Lock className='size-5' />
              </span>
              <h2 className='font-display mt-5 text-2xl font-semibold tracking-tight'>There is a private side, too</h2>
              <p className='text-muted mt-2 max-w-md'>
                Friends of the team can unlock the behind-the-scenes photos and videos with a passcode.
              </p>
            </div>
            <div className='relative lg:flex-1'>
              <UnlockForm next='/' layout='inline' />
            </div>
          </div>
        </Container>
      )}
    </>
  );
}
