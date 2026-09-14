import { JsonFile } from '@server/lib/json-file';
import { singleton } from '@server/lib/singleton';
import { usersFile } from '@server/storage/paths';
import type { UserRecord } from './user.types';

const store = singleton(
  'users-store',
  () => new JsonFile<{ users: UserRecord[] }>(usersFile, () => ({ users: [] }), 0o600),
);

/** Staff accounts. The list is tiny, so it lives in one file that is cached in memory. */
export const userRepository = {
  /** Every user. Treat the array as read-only. */
  async all(): Promise<readonly UserRecord[]> {
    return (await store.read()).users;
  },

  async findById(id: string): Promise<UserRecord | null> {
    return (await this.all()).find((user) => user.id === id) ?? null;
  },

  async findByUsername(username: string): Promise<UserRecord | null> {
    return (await this.all()).find((user) => user.username === username) ?? null;
  },

  /** Runs a change on a copy of the list and saves it. `change` must validate before it mutates. */
  mutate<T>(change: (users: UserRecord[]) => T): Promise<T> {
    return store.update((draft) => change(draft.users));
  },
};
