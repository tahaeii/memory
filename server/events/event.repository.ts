import { JsonFile } from '@server/lib/json-file';
import { singleton } from '@server/lib/singleton';
import { eventsFile } from '@server/storage/paths';
import type { EventRecord } from './event.types';

const store = singleton(
  'events-store',
  () => new JsonFile<{ events: EventRecord[] }>(eventsFile, () => ({ events: [] })),
);

/** Events are few, so they live in one small events.json file, cached in memory. */
export const eventRepository = {
  /** Every event. Treat the array as read-only. */
  async all(): Promise<readonly EventRecord[]> {
    return (await store.read()).events;
  },

  async get(id: string): Promise<EventRecord | null> {
    return (await this.all()).find((event) => event.id === id) ?? null;
  },

  async getBySlug(slug: string): Promise<EventRecord | null> {
    return (await this.all()).find((event) => event.slug === slug) ?? null;
  },

  /** Runs a change on a copy of the list and saves it. `change` must validate before it mutates. */
  mutate<T>(change: (events: EventRecord[]) => T): Promise<T> {
    return store.update((draft) => change(draft.events));
  },
};
