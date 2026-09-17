import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ensureDir, readJson, writeJsonAtomic } from '@server/lib/fs';
import { ID_PATTERN } from '@server/lib/ids';
import { singleton } from '@server/lib/singleton';
import { mediaDir, mediaRoot, metaPath } from '@server/storage/paths';
import type { MediaRecord } from './media.types';

/** Newest first; ties are broken by id so the order is always stable. */
export function compareNewestFirst(a: MediaRecord, b: MediaRecord): number {
  if (a.takenAt !== b.takenAt) return a.takenAt < b.takenAt ? 1 : -1;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/** Records written before videos existed have no `kind`. */
function normalize(record: MediaRecord): MediaRecord {
  return record.kind === 'video' ? record : { ...record, kind: 'photo' };
}

/**
 * Photo and video metadata. Each item keeps its own meta.json next to its files, so the folder
 * describes itself even without the app. An in-memory index (built once) makes listing instant,
 * and every write goes through one queue so concurrent changes never overwrite each other.
 */
class MediaRepository {
  private index = new Map<string, MediaRecord>();
  private sorted: MediaRecord[] | null = null;
  private loading: Promise<void> | null = null;
  private writes: Promise<unknown> = Promise.resolve();

  private ensureLoaded(): Promise<void> {
    if (!this.loading) {
      this.loading = this.load().catch((error: unknown) => {
        this.loading = null;
        throw error;
      });
    }
    return this.loading;
  }

  private async load(): Promise<void> {
    await ensureDir(mediaRoot());
    const entries = await fs.readdir(mediaRoot(), { withFileTypes: true });
    const folders = entries.filter((entry) => entry.isDirectory() && ID_PATTERN.test(entry.name));
    for (let i = 0; i < folders.length; i += 64) {
      const batch = folders.slice(i, i + 64).map((entry) => entry.name);
      const records = await Promise.all(
        batch.map((id) => readJson<MediaRecord>(path.join(mediaRoot(), id, 'meta.json')).catch(() => null)),
      );
      records.forEach((record, n) => {
        if (record && record.id === batch[n]) this.index.set(record.id, normalize(record));
      });
    }
  }

  private changed(): void {
    this.sorted = null;
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.writes.then(async () => {
      await this.ensureLoaded();
      return task();
    });
    this.writes = run.catch(() => undefined);
    return run;
  }

  /** Every item, newest first. Treat the array as read-only. */
  async all(): Promise<readonly MediaRecord[]> {
    await this.ensureLoaded();
    this.sorted ??= [...this.index.values()].sort(compareNewestFirst);
    return this.sorted;
  }

  async get(id: string): Promise<MediaRecord | null> {
    await this.ensureLoaded();
    return this.index.get(id) ?? null;
  }

  insert(record: MediaRecord): Promise<void> {
    return this.enqueue(async () => {
      await writeJsonAtomic(metaPath(record.id), record);
      this.index.set(record.id, record);
      this.changed();
    });
  }

  /**
   * Replaces one record with what `change` returns, based on its latest saved state.
   * Returning null leaves it untouched. Resolves with the new record, or null when nothing changed.
   */
  update(id: string, change: (record: MediaRecord) => MediaRecord | null): Promise<MediaRecord | null> {
    return this.enqueue(async () => {
      const current = this.index.get(id);
      const next = current ? change(current) : null;
      if (!next) return null;
      await writeJsonAtomic(metaPath(id), next);
      this.index.set(id, next);
      this.changed();
      return next;
    });
  }

  /** Deletes an item and all of its files when `allow` (checked on its latest state) agrees. */
  remove(id: string, allow: (record: MediaRecord) => boolean = () => true): Promise<boolean> {
    return this.enqueue(async () => {
      const current = this.index.get(id);
      if (!current || !allow(current)) return false;
      await fs.rm(mediaDir(id), { recursive: true, force: true });
      this.index.delete(id);
      this.changed();
      return true;
    });
  }
}

export const mediaRepository = singleton('media-repository', () => new MediaRepository());
