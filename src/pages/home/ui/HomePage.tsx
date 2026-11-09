import { t } from '@i18n';
import { isHeroStyle } from '@contracts/branding';
import { loadEvents } from '@/entities/event/server';
import { loadMediaPage, loadSummary } from '@/entities/media/server';
import { isStaffRole } from '@/entities/session';
import { getServerSession } from '@/shared/api/server-session';
import { getSiteConfig } from '@/shared/config/site.server';
import { firstParam, type SearchParams } from '@/shared/lib/search-params';
import { Container } from '@/shared/ui/Container';
import { EventPoster } from '@/widgets/event-grid';
import { MediaGallery } from '@/widgets/media-gallery';
import { describeArchive } from '../lib/describe-archive';
import { HomeHero } from './HomeHero';
import { PreviewBanner } from './sections/PreviewBanner';
import { PrivateInvite } from './sections/PrivateInvite';
import { SectionHead } from './sections/SectionHead';

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
  // Staff can try a style before saving it: /?hero=filmstrip (opened from Dashboard › Branding).
  const requested = firstParam(query.hero);
  const preview = isStaffRole(session.role) && isHeroStyle(requested) ? requested : null;
  const heroStyle = preview ?? site.heroStyle;

  return (
    <>
      {preview && <PreviewBanner preview={preview} current={site.heroStyle} />}
      <HomeHero
        style={heroStyle}
        site={site}
        summary={describeArchive(summary, events.length)}
        photos={wall.items}
      />

      {page.items.length > 0 && (
        <Container className='pt-section'>
          <SectionHead
            title={summary.videoCount > 0 ? t('home.latest.all') : t('home.latest.photos')}
            href='/gallery'
            link={t('home.latest.link')}
          />
          <MediaGallery initial={page} grouping='none' pagination='button' pageSize={24} />
        </Container>
      )}

      {events.length > 0 && (
        <Container className='pt-section'>
          <SectionHead title={t('home.events.title')} href='/events' link={t('home.events.link')} />
          <div className='-mx-4 flex snap-x scroll-px-4 scrollbar-none gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8'>
            {events.slice(0, 10).map((event) => (
              <EventPoster key={event.id} event={event} />
            ))}
          </div>
        </Container>
      )}

      {session.role === 'guest' && site.friendsEnabled && (
        <Container className='pt-section'>
          <PrivateInvite />
        </Container>
      )}
    </>
  );
}
