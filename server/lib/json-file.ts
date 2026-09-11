import { readJson, writeJsonAtomic } from './fs';

/**
 * A small JSON document kept in memory and saved atomically on every change.
 * Changes run one at a time on a copy of the data, so a failed change or a failed write
 * never leaves the cache different from what is on disk. Run a single server process.
 */
export class JsonFile<T> {
  private cache: T | null = null;
  private loading: Promise<T> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly file: () => string,
    private readonly empty: () => T,
    private readonly mode = 0o644,
  ) {}

  /** Current data. Treat it as read-only; use `update` to change it. */
  read(): Promise<T> {
    if (this.cache) return Promise.resolve(this.cache);
    this.loading ??= readJson<T>(this.file())
      .then((data) => (this.cache = data ?? this.empty()))
      .finally(() => {
        this.loading = null;
      });
    return this.loading;
  }

  /** Applies `change` to a copy, saves it, then makes it current. `change` may throw to cancel. */
  update<R>(change: (draft: T) => R): Promise<R> {
    const run = this.queue.then(async () => {
      const draft = structuredClone(await this.read());
      const result = change(draft);
      await writeJsonAtomic(this.file(), draft, this.mode);
      this.cache = draft;
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
}
