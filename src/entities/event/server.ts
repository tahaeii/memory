import 'server-only';
import { getServerViewer } from '@/shared/api/server-session';
import { getEvent, listEvents } from '@server/events/event.service';
import type { EventDto } from './model/types';

export async function loadEvents(): Promise<EventDto[]> {
  return listEvents(await getServerViewer());
}

export async function loadEvent(slug: string): Promise<EventDto | null> {
  return getEvent(slug, await getServerViewer());
}
