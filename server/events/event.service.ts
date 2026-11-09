import { t } from '@i18n';
import type { EventDto, EventInput } from '@contracts/event';
import { isStaff } from '@server/auth/access';
import type { Viewer } from '@server/auth/viewer';
import { HttpError } from '@server/lib/errors';
import { newId, uniqueSlug } from '@server/lib/ids';
import { isVisibleTo } from '@server/media/media.access';
import { toMediaDto } from '@server/media/media.mapper';
import { mediaRepository } from '@server/media/media.repository';
import type { MediaRecord } from '@server/media/media.types';
import { eventRepository } from './event.repository';
import type { EventRecord } from './event.types';

interface EventStats {
  photos: number;
  videos: number;
  cover: MediaRecord;
}

function toDto(event: EventRecord, stats: EventStats | undefined, viewer: Viewer): EventDto {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    date: event.date,
    photoCount: stats?.photos ?? 0,
    videoCount: stats?.videos ?? 0,
    cover: stats ? toMediaDto(stats.cover, event, viewer, null) : null,
  };
}

/**
 * Events sorted by date (newest first). Counts and covers only include items the viewer
 * may see; visitors never see events that have nothing visible to them.
 */
export async function listEvents(viewer: Viewer): Promise<EventDto[]> {
  const [events, items] = await Promise.all([eventRepository.all(), mediaRepository.all()]);
  const stats = new Map<string, EventStats>();
  for (const item of items) {
    if (!item.eventId || !isVisibleTo(item, viewer)) continue;
    const entry = stats.get(item.eventId) ?? { photos: 0, videos: 0, cover: item };
    if (item.kind === 'video') entry.videos += 1;
    else entry.photos += 1;
    stats.set(item.eventId, entry);
  }
  return events
    .filter((event) => isStaff(viewer) || stats.has(event.id))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .map((event) => toDto(event, stats.get(event.id), viewer));
}

export async function getEvent(slug: string, viewer: Viewer): Promise<EventDto | null> {
  return (await listEvents(viewer)).find((event) => event.slug === slug) ?? null;
}

export async function createEvent(input: EventInput, viewer: Viewer): Promise<EventDto> {
  const record = await eventRepository.mutate((events) => {
    const created: EventRecord = {
      id: newId(),
      slug: uniqueSlug(
        input.title,
        events.map((event) => event.slug),
      ),
      title: input.title,
      description: input.description,
      date: input.date,
      createdAt: new Date().toISOString(),
    };
    events.push(created);
    return created;
  });
  return toDto(record, undefined, viewer);
}

export async function updateEvent(id: string, patch: Partial<EventInput>): Promise<void> {
  await eventRepository.mutate((events) => {
    const event = events.find((item) => item.id === id);
    if (!event) throw new HttpError(404, t('errors.events.notFound'));
    if (patch.title !== undefined) event.title = patch.title;
    if (patch.date !== undefined) event.date = patch.date;
    if (patch.description !== undefined) event.description = patch.description;
  });
}

/** Deletes the event only; its photos and videos stay in the library without an event. */
export async function deleteEvent(id: string): Promise<void> {
  await eventRepository.mutate((events) => {
    const index = events.findIndex((event) => event.id === id);
    if (index === -1) throw new HttpError(404, t('errors.events.notFound'));
    events.splice(index, 1);
  });
  for (const item of await mediaRepository.all()) {
    if (item.eventId === id)
      await mediaRepository.update(item.id, (record) => ({ ...record, eventId: null }));
  }
}
